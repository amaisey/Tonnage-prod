import { supabase } from './supabase'
import { db } from '../db/workoutDb'

// Timeout for each fetchAll operation (covers all pages for one table)
const FETCH_TIMEOUT_MS = 30000

// ============================================================
// Push local changes to Supabase
// ============================================================
export async function pushToCloud(userId) {
  if (!supabase || !userId) return { pushed: 0, errors: [] }

  const queue = await db.syncQueue.toArray()
  if (queue.length === 0) return { pushed: 0, errors: [] }

  let pushed = 0
  const errors = []

  for (const item of queue) {
    try {
      const table = item.entityType + 's' // 'workout' → 'workouts'

      if (item.action === 'create') {
        const { data, error } = await supabase
          .from(table)
          .upsert({
            ...item.payload,
            user_id: userId,
            local_id: String(item.entityId),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,local_id',
            ignoreDuplicates: false
          })
          .select('id')
          .single()

        if (error) throw error

        // Store cloud ID back on local record
        if (item.entityType === 'workout' && data?.id) {
          await db.workouts.update(item.entityId, { cloudId: data.id })
        }
      }

      if (item.action === 'update') {
        const { error } = await supabase
          .from(table)
          .update({ ...item.payload, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('local_id', String(item.entityId))

        if (error) throw error
      }

      if (item.action === 'delete') {
        const { error } = await supabase
          .from(table)
          .update({ deleted_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('local_id', String(item.entityId))

        if (error) throw error
      }

      // Remove from queue on success
      await db.syncQueue.delete(item.id)
      pushed++
    } catch (err) {
      console.error('Sync push error for item:', item, err)
      errors.push({ item, error: err })
    }
  }

  return { pushed, errors }
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

  // Merge exercises into localStorage
  pulled += mergeIntoLocalStorage('workout-exercises', exercisesData || [], 'name')

  // Merge templates
  pulled += mergeIntoLocalStorage('workout-templates', templatesData || [], 'name')

  // Merge folders
  pulled += mergeIntoLocalStorage('workout-folders', foldersData || [], 'name')

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
      .upsert(rows, { ignoreDuplicates: true })

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
      .upsert(rows, { ignoreDuplicates: true })

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

  localStorage.setItem(key, JSON.stringify(existing))
  // Dispatch storage event so useLocalStorage hooks pick up changes
  window.dispatchEvent(new Event('storage'))

  return added
}

// ============================================================
// Convert cloud record shape to local shape
// ============================================================
function cloudToLocalShape(key, record) {
  if (key === 'workout-exercises') {
    return {
      name: record.name,
      bodyPart: record.body_part,
      category: record.category,
    }
  }
  if (key === 'workout-templates') {
    return {
      id: record.local_id || Date.now(),
      name: record.name,
      folderId: record.folder_id,
      estimatedTime: record.estimated_time,
      notes: record.notes,
      exercises: record.exercises || [],
    }
  }
  if (key === 'workout-folders') {
    return {
      id: record.local_id || String(Date.now()),
      name: record.name,
      parentId: record.parent_id,
    }
  }
  return record
}
