import { useState, useEffect, useCallback, useRef } from 'react'
import { useOnlineStatus } from './useOnlineStatus'
import { pushToCloud, pullFromCloud, mergeOnFirstLogin, getPendingSyncCount, pushExerciseInstructionsToCloud } from '../lib/syncService'
import { supabase } from '../lib/supabase'

const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const LOCAL_SYNC_KEY = 'tonnage-local-last-synced'
const INSTRUCTIONS_PUSHED_KEY = 'tonnage-instructions-pushed-v1'

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

  // Hydrate lastSynced from localStorage on mount (fixes "last synced: never" after refresh)
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_SYNC_KEY)
    if (stored) setLastSynced(stored)
  }, [])

  // Update pending count periodically
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount()
      setPendingCount(count)
    } catch (err) {
      // ignore
    }
  }, [])

  // Safety: if syncStatus is 'syncing' for more than 30s, reset to idle
  // This catches edge cases where doSync errors silently or isSyncingRef gets stuck
  useEffect(() => {
    if (syncStatus !== 'syncing') return
    const timeout = setTimeout(() => {
      if (syncStatus === 'syncing' && !isSyncingRef.current) {
        console.warn('Sync status stuck at syncing — resetting to idle')
        setSyncStatus('idle')
      }
    }, 30000)
    return () => clearTimeout(timeout)
  }, [syncStatus])

  // One-time: push exercise instructions to cloud after login
  // Runs once per device (tracked via localStorage flag) to backfill
  // instructions that were missing when exercises were first uploaded.
  useEffect(() => {
    if (!user || !isOnline || !supabase) return
    if (localStorage.getItem(INSTRUCTIONS_PUSHED_KEY)) return // already done

    const pushInstructions = async () => {
      try {
        const result = await pushExerciseInstructionsToCloud(user.id)
        if (!result.error) {
          localStorage.setItem(INSTRUCTIONS_PUSHED_KEY, new Date().toISOString())
          console.log(`One-time instructions push complete: ${result.updated} exercises updated`)
        }
      } catch (err) {
        console.warn('Instructions push failed (will retry next session):', err)
      }
    }

    // Delay slightly so it doesn't compete with initial sync
    const timer = setTimeout(pushInstructions, 5000)
    return () => clearTimeout(timer)
  }, [user, isOnline])

  // Core sync function — uses LOCAL timestamp so each device pulls everything it hasn't seen
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

      // Pull remote changes using LOCAL device timestamp (not server-side last_synced_at)
      // This ensures a new device pulls ALL cloud data on its first sync
      const localLastSynced = localStorage.getItem(LOCAL_SYNC_KEY)
      const pullResult = await pullFromCloud(user.id, localLastSynced)

      // Save local sync timestamp
      const now = new Date().toISOString()
      localStorage.setItem(LOCAL_SYNC_KEY, now)
      setLastSynced(now)
      setSyncStatus('idle')

      // Notify UI if new data was pulled
      if (pullResult.pulled > 0) {
        onDataChangedRef.current?.()
      }
    } catch (err) {
      console.error('Sync error:', err)
      // Show timeout-specific feedback
      if (err.name === 'AbortError') {
        console.warn('Sync timed out — will retry on next interval')
      }
      setSyncStatus('error')
      // Auto-recover from error state after 5 seconds
      setTimeout(() => setSyncStatus('idle'), 5000)
    } finally {
      isSyncingRef.current = false
      refreshPendingCount()
    }
  }, [user, isOnline, refreshPendingCount])

  // Handle first login merge (with timeout to prevent infinite freeze)
  useEffect(() => {
    if (!isFirstLogin || !user || !isOnline) return

    const doMerge = async () => {
      setSyncStatus('syncing')
      try {
        // Timeout the entire merge to prevent infinite freeze
        await Promise.race([
          mergeOnFirstLogin(user.id),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Merge timeout')), 45000))
        ])
        clearFirstLogin?.()
        const now = new Date().toISOString()
        localStorage.setItem(LOCAL_SYNC_KEY, now)
        setLastSynced(now)
        setSyncStatus('idle')
        // Notify UI after merge (local data may have been enriched)
        onDataChangedRef.current?.()
      } catch (err) {
        console.error('First login merge error:', err)
        setSyncStatus('error')
        // Still clear first login flag to prevent retry loops
        clearFirstLogin?.()
        setTimeout(() => setSyncStatus('idle'), 5000)
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
    syncNow,
    refreshPendingCount
  }
}
