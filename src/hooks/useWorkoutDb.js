import { useState, useEffect, useCallback, useRef } from 'react';
import { db, workoutDb, isHistoryImported, markHistoryImported } from '../db/workoutDb';
import { useLiveQuery } from 'dexie-react-hooks';

/**
 * Hook for paginated workout history
 */
export function useWorkoutHistory(pageSize = 20) {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Load initial page and count
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const [data, count] = await Promise.all([
          workoutDb.getPage(0, pageSize),
          workoutDb.count()
        ]);
        if (mounted) {
          setWorkouts(data);
          setTotalCount(count);
          setHasMore(data.length === pageSize);
          setPage(0);
        }
      } catch (err) {
        console.error('Error loading workouts:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [pageSize]);

  // Load more workouts
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await workoutDb.getPage(nextPage, pageSize);
      setWorkouts(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === pageSize);
    } catch (err) {
      console.error('Error loading more workouts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, hasMore, loading]);

  // Refresh the list (e.g., after adding a workout)
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [data, count] = await Promise.all([
        workoutDb.getPage(0, pageSize),
        workoutDb.count()
      ]);
      setWorkouts(data);
      setTotalCount(count);
      setHasMore(data.length === pageSize);
      setPage(0);
    } catch (err) {
      console.error('Error refreshing workouts:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  return {
    workouts,
    loading,
    hasMore,
    loadMore,
    refresh,
    totalCount,
    page
  };
}

/**
 * Hook for adding workouts to the database
 */
export function useAddWorkout() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const addWorkout = useCallback(async (workout) => {
    setSaving(true);
    setError(null);
    try {
      const id = await workoutDb.add(workout);
      return id;
    } catch (err) {
      console.error('Error saving workout:', err);
      setError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { addWorkout, saving, error };
}

/**
 * Hook to get previous exercise data for a specific exercise
 * Returns full exercise data: sets, restTime, notes, phase
 */
export function usePreviousExerciseData() {
  const cache = useRef(new Map());

  const getPreviousData = useCallback(async (exerciseName) => {
    // Check cache first
    if (cache.current.has(exerciseName)) {
      return cache.current.get(exerciseName);
    }

    const result = await workoutDb.getLastWorkoutWithExercise(exerciseName);
    const exercise = result?.exercise;

    // Return full exercise data including settings
    const data = exercise ? {
      sets: exercise.sets?.filter(s => s.completed) || [],
      restTime: exercise.restTime,
      notes: exercise.notes,
      phase: exercise.phase
    } : null;

    // Cache the result
    cache.current.set(exerciseName, data);
    return data;
  }, []);

  // Clear cache (call after finishing a workout)
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { getPreviousData, clearCache };
}

/**
 * Hook to handle Strong history import
 */
export function useHistoryImport() {
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Check if already imported on mount
  useEffect(() => {
    isHistoryImported().then(setImported);
  }, []);

  const importHistory = useCallback(async (workouts) => {
    if (imported || importing) return;

    setImporting(true);
    setProgress({ current: 0, total: workouts.length });

    try {
      // Import in batches to avoid blocking UI
      const batchSize = 100;
      for (let i = 0; i < workouts.length; i += batchSize) {
        const batch = workouts.slice(i, i + batchSize);
        await workoutDb.bulkAdd(batch);
        setProgress({ current: Math.min(i + batchSize, workouts.length), total: workouts.length });
        // Small delay to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      await markHistoryImported();
      setImported(true);
    } catch (err) {
      console.error('Error importing history:', err);
      throw err;
    } finally {
      setImporting(false);
    }
  }, [imported, importing]);

  return { importHistory, importing, imported, progress };
}

/**
 * Hook to get workout count (reactive)
 */
export function useWorkoutCount() {
  return useLiveQuery(() => db.workouts.count(), [], 0);
}
