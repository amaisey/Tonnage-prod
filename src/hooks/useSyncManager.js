import { useState, useEffect, useCallback, useRef } from 'react'
import { useOnlineStatus } from './useOnlineStatus'
import { pushToCloud, pullFromCloud, mergeOnFirstLogin, getPendingSyncCount } from '../lib/syncService'
import { supabase } from '../lib/supabase'

const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export function useSyncManager(user, isFirstLogin, clearFirstLogin) {
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'syncing' | 'error' | 'offline'
  const [lastSynced, setLastSynced] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const isOnline = useOnlineStatus()
  const intervalRef = useRef(null)
  const isSyncingRef = useRef(false)

  // Update pending count periodically
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount()
      setPendingCount(count)
    } catch (err) {
      // ignore
    }
  }, [])

  // Core sync function
  const doSync = useCallback(async () => {
    if (!supabase || !user || !isOnline || isSyncingRef.current) return
    isSyncingRef.current = true
    setSyncStatus('syncing')

    try {
      // Push local changes
      const pushResult = await pushToCloud(user.id)
      if (pushResult.errors.length > 0) {
        console.warn('Some sync pushes failed:', pushResult.errors)
      }

      // Pull remote changes
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('last_synced_at')
        .eq('id', user.id)
        .single()

      await pullFromCloud(user.id, profile?.last_synced_at)

      setLastSynced(new Date().toISOString())
      setSyncStatus('idle')
    } catch (err) {
      console.error('Sync error:', err)
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
      setSyncStatus('syncing')
      try {
        await mergeOnFirstLogin(user.id)
        clearFirstLogin?.()
        setLastSynced(new Date().toISOString())
        setSyncStatus('idle')
      } catch (err) {
        console.error('First login merge error:', err)
        setSyncStatus('error')
      }
      refreshPendingCount()
    }

    doMerge()
  }, [isFirstLogin, user, isOnline, clearFirstLogin, refreshPendingCount])

  // Sync when coming back online
  useEffect(() => {
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
