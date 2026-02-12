import { useState, useEffect, useCallback, useRef } from 'react'
import { useOnlineStatus } from './useOnlineStatus'
import { pushToCloud, pullFromCloud, mergeOnFirstLogin, getPendingSyncCount } from '../lib/syncService'
import { supabase } from '../lib/supabase'

const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const LOCAL_SYNC_KEY = 'tonnage-local-last-synced'

export function useSyncManager(user, isFirstLogin, clearFirstLogin, onDataChanged) {
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'syncing' | 'error' | 'offline'
  const [lastSynced, setLastSynced] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const isOnline = useOnlineStatus()
  const intervalRef = useRef(null)
  const isSyncingRef = useRef(false)
  const onDataChangedRef = useRef(onDataChanged)

  // Keep callback ref current without causing re-renders
  useEffect(() => {
    onDataChangedRef.current = onDataChanged
  }, [onDataChanged])

  // Update pending count periodically
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount()
      setPendingCount(count)
    } catch (err) {
      // ignore
    }
  }, [])

  // Core sync function — uses LOCAL timestamp so each device pulls everything it hasn't seen
  const doSync = useCallback(async () => {
    console.log('[SYNC] doSync called', {
      supabase: !!supabase,
      user: !!user,
      userId: user?.id?.substring(0, 8),
      isOnline,
      isSyncing: isSyncingRef.current
    })

    if (!supabase || !user || !isOnline || isSyncingRef.current) {
      console.log('[SYNC] doSync bailing:', {
        noSupabase: !supabase,
        noUser: !user,
        offline: !isOnline,
        alreadySyncing: isSyncingRef.current
      })
      return
    }

    isSyncingRef.current = true
    setSyncStatus('syncing')

    try {
      // Push local changes
      console.log('[SYNC] Starting pushToCloud...')
      const pushResult = await pushToCloud(user.id)
      console.log('[SYNC] pushToCloud done:', pushResult)

      if (pushResult.errors.length > 0) {
        console.warn('Some sync pushes failed:', pushResult.errors)
      }

      // Pull remote changes using LOCAL device timestamp (not server-side last_synced_at)
      // This ensures a new device pulls ALL cloud data on its first sync
      const localLastSynced = localStorage.getItem(LOCAL_SYNC_KEY)
      console.log('[SYNC] Starting pullFromCloud...', { localLastSynced })
      const pullResult = await pullFromCloud(user.id, localLastSynced)
      console.log('[SYNC] pullFromCloud done:', pullResult)

      // Save local sync timestamp
      const now = new Date().toISOString()
      localStorage.setItem(LOCAL_SYNC_KEY, now)
      setLastSynced(now)
      setSyncStatus('idle')
      console.log('[SYNC] Sync complete! Status set to idle.')

      // Notify UI if new data was pulled
      if (pullResult.pulled > 0) {
        onDataChangedRef.current?.()
      }
    } catch (err) {
      console.error('[SYNC] Sync error:', err)
      setSyncStatus('error')
    } finally {
      isSyncingRef.current = false
      refreshPendingCount()
    }
  }, [user, isOnline, refreshPendingCount])

  // Handle first login merge
  useEffect(() => {
    if (!isFirstLogin || !user || !isOnline) return

    const doMerge = async () => {
      console.log('[SYNC] First login merge starting...')
      setSyncStatus('syncing')
      try {
        await mergeOnFirstLogin(user.id)
        clearFirstLogin?.()
        const now = new Date().toISOString()
        localStorage.setItem(LOCAL_SYNC_KEY, now)
        setLastSynced(now)
        setSyncStatus('idle')
        console.log('[SYNC] First login merge complete!')
        // Notify UI after merge (local data may have been enriched)
        onDataChangedRef.current?.()
      } catch (err) {
        console.error('[SYNC] First login merge error:', err)
        setSyncStatus('error')
      }
      refreshPendingCount()
    }

    doMerge()
  }, [isFirstLogin, user, isOnline, clearFirstLogin, refreshPendingCount])

  // Sync when coming back online
  useEffect(() => {
    console.log('[SYNC] Online/user effect:', { isOnline, user: !!user, isFirstLogin })
    if (isOnline && user && !isFirstLogin) {
      doSync()
    }
    if (!isOnline) {
      setSyncStatus('offline')
    }
  }, [isOnline, user, isFirstLogin])

  // Periodic sync
  useEffect(() => {
    if (!user || !isOnline) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      doSync()
    }, SYNC_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, isOnline, doSync])

  // Refresh pending count on mount and after syncs
  useEffect(() => {
    refreshPendingCount()
    const interval = setInterval(refreshPendingCount, 30000) // every 30s
    return () => clearInterval(interval)
  }, [refreshPendingCount])

  // Clear local sync timestamp on sign out
  useEffect(() => {
    if (!user) {
      localStorage.removeItem(LOCAL_SYNC_KEY)
    }
  }, [user])

  // Manual sync trigger
  const syncNow = useCallback(() => {
    if (!isOnline) {
      setSyncStatus('offline')
      return
    }
    doSync()
  }, [doSync, isOnline])

  return {
    syncStatus,
    lastSynced,
    pendingCount,
    syncNow
  }
}
