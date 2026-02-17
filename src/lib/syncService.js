import { supabase } from './supabase'
import { db } from '../db/workoutDb'

// Timeout for each fetchAll operation (covers all pages for one table)
const FETCH_TIMEOUT_MS = 30000

// ============================================================
// Map local camelCase shapes → cloud snake_case columns
// Prevents PostgREST 400 errors from unknown column names
// ============================================================
function mapToCloud(entityType, payload, userId, localId) {
  const base = { user_id: userId, updated_at: new Date().toISOString() }

  switch (entityType) {
    case 'workout':
      return {
        ...base,
        local_id: String(localId),
        name: payload.name,
        notes: payload.notes || null,
        start_time: payload.startTime || payload.start_time || payload.date,
        date: payload.date,
        duration_ms: payload.duration || payload.duration_ms || 0,
        exercises: payload.exercises || [],
      }
    case 'exercise':
      return {
        ...base,
        local_id: String(localId),
        name: payload.name,
        body_part: payload.bodyPart || payload.body_part || 'Other',
        category: payload.category || 'other',
      }
    case 'template':
      return {
        ...base,
        local_id: String(localId),
        name: payload.name,
        folder_id: payload.folderId || payload.folder_id || null,
        estimated_time: payload.estimatedTime || payload.estimated_time || null,
        notes: payload.notes || null,
        exercises: payload.exercises || [],
      }
    case 'folder':
      return {
        ...base,
        local_id: String(localId),
        name: payload.name,
        parent_id: payload.parentId || payload.parent_id || 'root',
      }
    default: {
      // Fallback: strip local-only fields, add base
      const { id, cloudId, ...rest } = payload
      return { ...rest, ...base, local_id: String(localId) }
    }
  }
}

// ============================================================
// Push local changes to Supabase
// ============================================================
export async function pushToCloud(userId) {
  if (!supabase || !userId) return { pushed: 0, errors: [], log: [] }

  const queue = await db.syncQueue.toArray()
  if (queue.length === 0) return { pushed: 0, errors: [], log: ['queue empty'] }

  let pushed = 0
  const errors = []
  const log = [`queue: ${queue.length} items`]

  for (const item of queue) {
    try {
      const table = item.entityType + 's' // 'workout' → 'workouts'
      log.push(`processing: ${item.entityType}/${item.action} entityId=${item.entityId}`)

      if (item.action === 'create') {
        const cloudRow = mapToCloud(item.entityType, item.payload, userId, item.entityId)
        log.push(`cloudRow: local_id=${cloudRow.local_id}, date=${cloudRow.date}, name=${cloudRow.name?.substring(0, 20)}`)

        // Exercises use (user_id, name) as unique key; everything else uses (user_id, local_id)
        const conflictKey = item.entityType === 'exercise' ? 'user_id,name' : 'user_id,local_id'

        const { data, error } = await supabase
          .from(table)
          .upsert(cloudRow, {
            onConflict: conflictKey,
            ignoreDuplicates: false
          })
          .select('id')
          .single()

        if (error) {
          log.push(`UPSERT ERROR: ${error.code} ${error.message}`)
          throw error
        }

        log.push(`UPSERT OK: cloudId=${data?.id}`)

        // Store cloud ID back on local record
        if (item.entityType === 'workout' && data?.id) {
          await db.workouts.update(item.entityId, { cloudId: data.id })
          log.push(`stored cloudId on local record ${item.entityId}`)
        }
      }

      if (item.action === 'update') {
        const cloudRow = mapToCloud(item.entityType, item.payload, userId, item.entityId)

        // Exercises match on name; everything else on local_id
        let query = supabase.from(table).update(cloudRow).eq('user_id', userId)
        if (item.entityType === 'exercise') {
          query = query.eq('name', item.payload.name)
        } else {
          query = query.eq('local_id', String(item.entityId))
        }

        const { error } = await query

        if (error) {
          log.push(`UPDATE ERROR: ${error.code} ${error.message}`)
          throw error
        }
        log.push(`UPDATE OK`)
      }

      if (item.action === 'delete') {
        // Exercises match on name; everything else on local_id
        let query = supabase.from(table)
          .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('user_id', userId)
        if (item.entityType === 'exercise') {
          query = query.eq('name', item.payload?.name || '')
        } else {
          query = query.eq('local_id', String(item.entityId))
        }

        const { error } = await query

        if (error) {
          log.push(`DELETE ERROR: ${error.code} ${error.message}`)
          throw error
        }
        log.push(`DELETE OK`)
      }

      // Remove from queue on success
      await db.syncQueue.delete(item.id)
      pushed++
    } catch (err) {
      console.error('Sync push error for item:', item, err)
      errors.push({ item, error: err })
      log.push(`CAUGHT: ${err.message}`)

      // Increment retry count — remove items that have failed too many times
      // to prevent infinite queue growth
      const retries = (item.retries || 0) + 1
      const MAX_RETRIES = 5
      if (retries >= MAX_RETRIES) {
        log.push(`DROPPING item after ${MAX_RETRIES} retries: ${item.entityType}/${item.action} entityId=${item.entityId}`)
        await db.syncQueue.delete(item.id)
      } else {
        await db.syncQueue.update(item.id, { retries })
        log.push(`retry ${retries}/${MAX_RETRIES}`)
      }
    }
  }

  // Store last push log for diagnostics
  try {
    localStorage.setItem('tonnage-last-push-log', JSON.stringify(log))
  } catch (_) {}

  return { pushed, errors, log }
}

// ============================================================
// Pull remote changes to local
// ============================================================
export async function pullFromCloud(userId, lastSyncedAt) {
  if (!supabase || !userId) return { pulled: 0 }

  const since = lastSyncedAt || '1970-01-01T00:00:00Z'

  // Paginated fetch helper — Supabase caps at 1000 rows per query.
  // Uses AbortController to timeout after FETCH_TIMEOUT_MS so requests
  // don't hang forever (observed in Brave with SW registered).
  async function fetchAll(table, filters = {}) {
    const PAGE_SIZE = 1000
    let allData = []
    let from = 0
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      while (true) {
        let query = supabase.from(table).select('*')
          .eq('user_id', userId)
          .gt('updated_at', since)
          .is('deleted_at', null)
          .range(from, from + PAGE_SIZE - 1)
          .abortSignal(controller.signal)

        if (filters.order) {
          query = query.order(filters.order.column, { ascending: filters.order.ascending })
        }

        const { data, error } = await query
        if (error) throw error
        if (!data || data.length === 0) break

        allData = allData.concat(data)
        if (data.length < PAGE_SIZE) break // last page
        from += PAGE_SIZE
      }

      return allData
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // Fetch all updated records in parallel (paginated)
  const [workoutsData, exercisesData, templatesData, foldersData] = await Promise.all([
    fetchAll('workouts', { order: { column: 'date', ascending: false } }),
    fetchAll('exercises'),
    fetchAll('templates'),
    fetchAll('folders'),
  ])

  let pulled = 0

  // Merge workouts into Dexie
  for (const w of workoutsData || []) {
    const existing = await db.workouts
      .where('cloudId').equals(w.id)
      .first()

    if (!existing) {
      // Check if we have it by local_id — coerce to number since Dexie uses ++id (integer)
      const localIdNum = w.local_id ? Number(w.local_id) : null
      const byLocalId = (localIdNum && !isNaN(localIdNum))
        ? await db.workouts.get(localIdNum)
        : null

      if (byLocalId && !byLocalId.cloudId) {
        // Update existing local record with cloud ID
        await db.workouts.update(byLocalId.id, { cloudId: w.id })
      } else if (!byLocalId) {
        // New from cloud — insert locally
        await db.workouts.add({
          cloudId: w.id,
          name: w.name,
          notes: w.notes,
          startTime: w.start_time,
          date: w.date,
          duration: w.duration_ms,
          exercises: w.exercises
        })
        pulled++
      }
    }
  }

  // Merge exercises into localStorage (dedupe by name — exercises ARE unique by name)
  pulled += mergeIntoLocalStorage('workout-exercises', exercisesData || [], 'name')

  // Merge templates (dedupe by id — template names are NOT unique)
  pulled += mergeIntoLocalStorage('workout-templates', templatesData || [], 'id')

  // Merge folders (dedupe by id — folder names are NOT unique)
  pulled += mergeIntoLocalStorage('workout-folders', foldersData || [], 'id')

  // Update last synced timestamp on server (best-effort, don't block on failure)
  try {
    await supabase.from('user_profiles')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', userId)
  } catch (profileErr) {
    console.warn('user_profiles update failed (non-fatal):', profileErr)
  }

  return { pulled }
}

// ============================================================
// Merge-on-first-login: upload all local data to cloud
// ============================================================
export async function mergeOnFirstLogin(userId) {
  if (!supabase || !userId) return

  // Upload all workouts
  const allWorkouts = await db.workouts.toArray()
  if (allWorkouts.length > 0) {
    const BATCH_SIZE = 100
    const mergeTimestamp = new Date().toISOString()
    for (let i = 0; i < allWorkouts.length; i += BATCH_SIZE) {
      const batch = allWorkouts.slice(i, i + BATCH_SIZE).map(w => ({
        user_id: userId,
        local_id: String(w.id),
        name: w.name,
        notes: w.notes || null,
        start_time: w.startTime || w.date,
        date: w.date,
        duration_ms: w.duration || 0,
        exercises: w.exercises || [],
        updated_at: mergeTimestamp,
      }))

      const { data, error } = await supabase
        .from('workouts')
        .upsert(batch, { onConflict: 'user_id,local_id', ignoreDuplicates: true })
        .select('id, local_id')

      if (error) {
        console.error('Batch upload error:', error)
      } else if (data) {
        // Store cloud IDs back on local records — coerce local_id back to number
        for (const row of data) {
          if (row.local_id) {
            const localIdNum = Number(row.local_id)
            if (!isNaN(localIdNum)) {
              await db.workouts.update(localIdNum, { cloudId: row.id })
            }
          }
        }
      }
    }
  }

  // Upload exercises
  const exercises = JSON.parse(localStorage.getItem('workout-exercises') || '[]')
  if (exercises.length > 0) {
    const rows = exercises.map((e, idx) => ({
      user_id: userId,
      local_id: idx,
      name: e.name,
      body_part: e.bodyPart || 'Other',
      category: e.category || 'other',
    }))

    const { error } = await supabase
      .from('exercises')
      .upsert(rows, { onConflict: 'user_id,name', ignoreDuplicates: true })

    if (error) console.error('Exercise upload error:', error)
  }

  // Upload templates
  const templates = JSON.parse(localStorage.getItem('workout-templates') || '[]')
  if (templates.length > 0) {
    const rows = templates.map(t => ({
      user_id: userId,
      local_id: t.id || null,
      name: t.name,
      folder_id: t.folderId || null,
      estimated_time: t.estimatedTime || null,
      notes: t.notes || null,
      exercises: t.exercises || [],
    }))

    const { error } = await supabase
      .from('templates')
      .upsert(rows, { onConflict: 'user_id,local_id', ignoreDuplicates: true })

    if (error) console.error('Template upload error:', error)
  }

  // Upload folders
  const folders = JSON.parse(localStorage.getItem('workout-folders') || '[]')
  if (folders.length > 0) {
    const rows = folders.map(f => ({
      user_id: userId,
      local_id: f.id,
      name: f.name,
      parent_id: f.parentId || 'root',
    }))

    const { error } = await supabase
      .from('folders')
      .upsert(rows, { onConflict: 'user_id,local_id', ignoreDuplicates: true })

    if (error) console.error('Folder upload error:', error)
  }

  // Update sync timestamp
  try {
    await supabase.from('user_profiles')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', userId)
  } catch (err) {
    console.warn('user_profiles update failed (non-fatal):', err)
  }
}

// ============================================================
// Replace ALL cloud workouts for a user (used by Import Backup)
// 1. Hard-delete ALL existing cloud workouts
// 2. Fresh-insert all local workouts (no conflict resolution needed)
// Previous soft-delete + upsert approach failed because RLS
// policies filter deleted_at != null rows, making upsert unable
// to "see" and un-delete them.
// ============================================================
export async function replaceCloudWorkouts(userId) {
  if (!supabase || !userId) return

  // Step 1: Hard-delete ALL cloud workouts for this user
  const { error: deleteError } = await supabase
    .from('workouts')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Cloud workout delete error:', deleteError)
    throw deleteError
  }

  // Step 2: Fresh-insert all local workouts
  const allWorkouts = await db.workouts.toArray()
  if (allWorkouts.length === 0) return

  const BATCH_SIZE = 100
  const replaceTimestamp = new Date().toISOString()

  for (let i = 0; i < allWorkouts.length; i += BATCH_SIZE) {
    const batch = allWorkouts.slice(i, i + BATCH_SIZE).map(w =>
      mapToCloud('workout', w, userId, w.id)
    )
    // Override updated_at to use consistent timestamp across batches
    batch.forEach(row => { row.updated_at = replaceTimestamp })

    const { data, error } = await supabase
      .from('workouts')
      .insert(batch)
      .select('id, local_id')

    if (error) {
      console.error('Batch insert error:', error)
      throw error  // Surface failure to caller
    }

    // Store cloud IDs back on local records
    if (data) {
      for (const row of data) {
        if (row.local_id) {
          const localIdNum = Number(row.local_id)
          if (!isNaN(localIdNum)) {
            await db.workouts.update(localIdNum, { cloudId: row.id })
          }
        }
      }
    }
  }

  // Update sync timestamp
  try {
    await supabase.from('user_profiles')
      .update({ last_synced_at: replaceTimestamp })
      .eq('id', userId)
  } catch (err) {
    console.warn('user_profiles update failed (non-fatal):', err)
  }
}

// ============================================================
// Diagnostic: test each Supabase operation on workouts table
// Returns an object with pass/fail for INSERT, SELECT, DELETE
// ============================================================
export async function testCloudAccess(userId) {
  if (!supabase || !userId) return { error: 'No supabase client or userId' }

  const results = { insert: null, upsert: null, select: null, delete: null, pendingQueue: null, details: {} }
  const testLocalId = `__diag_test_${Date.now()}`

  // 0. Check pending sync queue
  try {
    const queue = await db.syncQueue.toArray()
    results.pendingQueue = queue.length
    if (queue.length > 0) {
      results.details.pendingQueue = queue.slice(0, 3).map(q => ({
        entity: q.entityType,
        action: q.action,
        id: q.entityId,
        payloadKeys: Object.keys(q.payload || {}).join(',')
      }))
    }
  } catch (_) {}

  // 1. Test INSERT
  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        local_id: testLocalId,
        name: '__DIAGNOSTIC_TEST__',
        date: Date.now(),
        start_time: Date.now(),
        duration_ms: 0,
        exercises: [],
        updated_at: new Date().toISOString(),
      })
      .select('id, local_id')
      .single()

    if (error) {
      results.insert = 'FAIL'
      results.details.insert = { code: error.code, message: error.message, hint: error.hint }
    } else {
      results.insert = 'PASS'
      results.details.insert = { cloudId: data.id }
    }
  } catch (err) {
    results.insert = 'FAIL'
    results.details.insert = { message: err.message }
  }

  // 2. Test UPSERT (this is what pushToCloud uses)
  try {
    const { data, error } = await supabase
      .from('workouts')
      .upsert({
        user_id: userId,
        local_id: testLocalId,
        name: '__DIAGNOSTIC_UPSERT__',
        date: Date.now(),
        start_time: Date.now(),
        duration_ms: 999,
        exercises: [],
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,local_id',
        ignoreDuplicates: false
      })
      .select('id')
      .single()

    if (error) {
      results.upsert = 'FAIL'
      results.details.upsert = { code: error.code, message: error.message, hint: error.hint }
    } else {
      results.upsert = 'PASS'
      results.details.upsert = { cloudId: data.id }
    }
  } catch (err) {
    results.upsert = 'FAIL'
    results.details.upsert = { message: err.message }
  }

  // 3. Test SELECT
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('id, local_id, name, duration_ms')
      .eq('user_id', userId)
      .eq('local_id', testLocalId)
      .single()

    if (error) {
      results.select = 'FAIL'
      results.details.select = { code: error.code, message: error.message }
    } else if (data) {
      results.select = 'PASS'
      results.details.select = { name: data.name, duration_ms: data.duration_ms }
    } else {
      results.select = 'FAIL'
      results.details.select = { message: 'Row not returned' }
    }
  } catch (err) {
    results.select = 'FAIL'
    results.details.select = { message: err.message }
  }

  // 4. Test DELETE
  try {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('user_id', userId)
      .eq('local_id', testLocalId)

    if (error) {
      results.delete = 'FAIL'
      results.details.delete = { code: error.code, message: error.message }
    } else {
      results.delete = 'PASS'
    }
  } catch (err) {
    results.delete = 'FAIL'
    results.details.delete = { message: err.message }
  }

  // 5. Cloud inventory — what's actually in the cloud?
  try {
    // Total cloud workouts (including soft-deleted)
    const { count: totalCloud } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Active cloud workouts (deleted_at IS NULL)
    const { count: activeCloud } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null)

    // What pull would fetch (updated_at > '1970...' AND deleted_at IS NULL)
    const { count: pullableCount } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gt('updated_at', '1970-01-01T00:00:00Z')
      .is('deleted_at', null)

    // Most recent 3 cloud workouts by date
    const { data: recentCloud } = await supabase
      .from('workouts')
      .select('local_id, name, date, updated_at, deleted_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(3)

    // Local workout count
    const localCount = await db.workouts.count()
    const localSyncTimestamp = localStorage.getItem('tonnage-local-last-synced')

    results.cloud = {
      total: totalCloud,
      active: activeCloud,
      pullable: pullableCount,
      localCount,
      localSyncTimestamp,
      recentCloud: recentCloud?.map(w => ({
        local_id: w.local_id,
        name: w.name?.substring(0, 30),
        date: w.date,
        updated_at: w.updated_at,
        deleted_at: w.deleted_at
      }))
    }
  } catch (err) {
    results.cloud = { error: err.message }
  }

  return results
}

// ============================================================
// Direct push a single workout to cloud (bypasses queue)
// Used by finishWorkout for immediate, reliable cloud upload.
// Falls back to queueing if the direct push fails (e.g. offline).
// ============================================================
export async function directPushWorkout(userId, workoutData, localId) {
  if (!supabase || !userId) {
    // No Supabase or not logged in — queue for later
    await queueSyncEntry('workout', localId, 'create', workoutData)
    return { success: false, reason: 'no-supabase' }
  }

  try {
    const cloudRow = mapToCloud('workout', workoutData, userId, localId)
    const { data, error } = await supabase
      .from('workouts')
      .upsert(cloudRow, {
        onConflict: 'user_id,local_id',
        ignoreDuplicates: false
      })
      .select('id')
      .single()

    if (error) {
      console.error('Direct push error:', error)
      // Queue for retry
      await queueSyncEntry('workout', localId, 'create', workoutData)
      return { success: false, reason: error.message }
    }

    // Store cloud ID on local record
    if (data?.id) {
      await db.workouts.update(localId, { cloudId: data.id })
    }

    console.log('Direct push OK: cloudId=', data?.id, 'localId=', localId)
    return { success: true, cloudId: data?.id }
  } catch (err) {
    console.error('Direct push exception:', err)
    // Queue for retry on next sync
    await queueSyncEntry('workout', localId, 'create', workoutData)
    return { success: false, reason: err.message }
  }
}

// ============================================================
// Direct delete a workout from cloud (bypasses queue)
// Used by HistoryScreen for immediate cloud deletion.
// Falls back to queueing if the direct delete fails (e.g. offline).
// ============================================================
export async function directDeleteWorkout(userId, localId) {
  if (!supabase || !userId) {
    await queueSyncEntry('workout', localId, 'delete', {})
    return { success: false, reason: 'no-supabase' }
  }

  try {
    const { error } = await supabase
      .from('workouts')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('local_id', String(localId))

    if (error) {
      console.error('Direct delete error:', error)
      await queueSyncEntry('workout', localId, 'delete', {})
      return { success: false, reason: error.message }
    }

    console.log('Direct delete OK: localId=', localId)
    return { success: true }
  } catch (err) {
    console.error('Direct delete exception:', err)
    await queueSyncEntry('workout', localId, 'delete', {})
    return { success: false, reason: err.message }
  }
}

// ============================================================
// Queue a sync entry for later push
// ============================================================
export async function queueSyncEntry(entityType, entityId, action, payload) {
  await db.syncQueue.add({
    entityType,
    entityId,
    action,
    payload,
    createdAt: Date.now()
  })
}

// ============================================================
// Get pending sync count
// ============================================================
export async function getPendingSyncCount() {
  return await db.syncQueue.count()
}

// ============================================================
// Helper: merge cloud records into a localStorage array
// ============================================================
function mergeIntoLocalStorage(key, cloudRecords, dedupeField) {
  if (!cloudRecords || cloudRecords.length === 0) return 0

  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  const existingMap = new Map(existing.map(item => [item[dedupeField], item]))
  let added = 0

  for (const record of cloudRecords) {
    const localShape = cloudToLocalShape(key, record)
    const dedupeValue = localShape[dedupeField]

    if (!existingMap.has(dedupeValue)) {
      existing.push(localShape)
      existingMap.set(dedupeValue, localShape)
      added++
    } else {
      // Cloud wins on conflict — update local
      const idx = existing.findIndex(e => e[dedupeField] === dedupeValue)
      if (idx !== -1) {
        existing[idx] = { ...existing[idx], ...localShape }
      }
    }
  }

  // Only write + dispatch if something actually changed
  const newJson = JSON.stringify(existing)
  const oldJson = localStorage.getItem(key)
  if (newJson !== oldJson) {
    localStorage.setItem(key, newJson)
    // Dispatch storage event so useLocalStorage hooks pick up changes
    window.dispatchEvent(new Event('storage'))
  }

  return added
}

// ============================================================
// Convert cloud record shape to local shape
// ============================================================
function cloudToLocalShape(key, record) {
  if (key === 'workout-exercises') {
    const rawId = record.local_id
    const numId = Number(rawId)
    const id = (rawId && !isNaN(numId)) ? numId : (rawId || Date.now())
    return {
      id,
      name: record.name,
      bodyPart: record.body_part,
      category: record.category,
    }
  }
  if (key === 'workout-templates') {
    // Coerce local_id back to number if it was originally numeric (Date.now() IDs)
    // This preserves === equality with local template IDs
    const rawId = record.local_id
    const numId = Number(rawId)
    const id = (rawId && !isNaN(numId)) ? numId : (rawId || Date.now())
    return {
      id,
      name: record.name,
      folderId: record.folder_id,
      estimatedTime: record.estimated_time,
      notes: record.notes,
      exercises: record.exercises || [],
    }
  }
  if (key === 'workout-folders') {
    // Keep folder IDs as strings (they use string prefixes like 'sbcp-folder-1')
    return {
      id: record.local_id || String(Date.now()),
      name: record.name,
      parentId: record.parent_id,
    }
  }
  return record
}
