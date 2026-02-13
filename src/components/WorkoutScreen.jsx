import { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { CATEGORIES, EXERCISE_TYPES, BAND_COLORS, EXERCISE_PHASES, SUPERSET_COLORS } from '../data/constants';
import { formatDuration, getDefaultSetForCategory } from '../utils/helpers';
import { NumberPad, DurationPad, SetInputRow, ExerciseSearchModal, ExerciseDetailModal, RestTimerBanner } from './SharedComponents';
import { workoutDb } from '../db/workoutDb';

const WorkoutScreen = ({ activeWorkout, setActiveWorkout, onFinish, onCancel, exercises, getPreviousData, onNumpadStateChange, onScroll }) => {
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [restTimer, setRestTimer] = useState({ active: false, time: 0, totalTime: 0, exerciseName: '' });
  const [editingRestTime, setEditingRestTime] = useState(null); // exercise index
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [numpadState, setNumpadState] = useState(null); // { exIndex, setIndex, field, fieldIndex }
  const [exerciseDetail, setExerciseDetail] = useState(null); // exercise to show detail modal for
  const [showExerciseDetailModal, setShowExerciseDetailModal] = useState(null); // { exercise, history }
  const [exerciseDetailHistory, setExerciseDetailHistory] = useState([]);
  const [bandPickerState, setBandPickerState] = useState(null); // { exIndex, setIndex, currentColor }
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null); // exercise index pending deletion
  const [collapsedPhases, setCollapsedPhases] = useState({}); // which phases are collapsed
  const [addToPhase, setAddToPhase] = useState(null); // Bug #12: target phase for adding exercises
  // Bug #11: Drag to reorder state
  const [dragState, setDragState] = useState(null); // { exIndex, phase, touchY }
  // Timer system state (#2, #3, #7, #8, #10, #15)
  const [expectedNext, setExpectedNext] = useState(null); // { exIndex, setIndex } - the next set the timer is anchored to
  const [lastCompletionTimestamp, setLastCompletionTimestamp] = useState(null); // single source of truth for timing
  const [frozenElapsed, setFrozenElapsed] = useState({}); // { 'exIndex-setIndex': seconds } - frozen timers for skipped sets
  const [restTimerMinimized, setRestTimerMinimized] = useState(false); // Bug #6: minimize rest timer banner
  // Bug #9: Touch drag-to-reorder state
  const [dragTouch, setDragTouch] = useState(null); // { exIndex, startY, currentY, insertBefore }
  const [completionFlash, setCompletionFlash] = useState(false); // Green bar expand animation
  const [notesExpanded, setNotesExpanded] = useState(false); // Collapsible workout notes
  const [editingExNotes, setEditingExNotes] = useState(null); // { exIndex, text } - inline exercise notes editing
  const undoStackRef = useRef([]); // Stack of previous workout states for undo
  const [undoAvailable, setUndoAvailable] = useState(0); // Number of undo steps available
  const longPressTimerRef = useRef(null);
  const dragRefs = useRef({}); // refs for each exercise row
  const intervalRef = useRef(null);
  const restTimeRef = useRef(null);
  const wakeLockRef = useRef(null);
  const supersetColorMap = useRef({}); // Bug #13: Track superset color assignments
  const scrollContainerRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioInitialized = useRef(false);
  const scrollToNextRef = useRef(false); // Flag: scroll to next set after green bar tap
  const greenBarSwipeRef = useRef(null); // Track green bar swipe start position

  // Undo system: push current state before modifications
  const MAX_UNDO = 30;
  const pushUndo = () => {
    // Deep clone the current workout state
    const snapshot = JSON.parse(JSON.stringify(activeWorkout));
    undoStackRef.current.push({
      workout: snapshot,
      expectedNext: expectedNext ? { ...expectedNext } : null,
      lastCompletionTimestamp,
    });
    if (undoStackRef.current.length > MAX_UNDO) {
      undoStackRef.current.shift(); // Remove oldest
    }
    setUndoAvailable(undoStackRef.current.length);
  };

  const handleUndo = () => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop();
    setActiveWorkout(prev.workout);
    setExpectedNext(prev.expectedNext);
    setLastCompletionTimestamp(prev.lastCompletionTimestamp);
    setUndoAvailable(undoStackRef.current.length);
    // Clear transient UI state
    setEditingRestTime(null);
    setDragState(null);
    setDragTouch(null);
    setEditingExNotes(null);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  // Initialize audio context on first user interaction
  const initAudio = () => {
    if (audioInitialized.current) return;
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      audioInitialized.current = true;
    } catch (e) {
      console.log('Audio init failed:', e);
    }
  };

  const playBeep = async (frequency = 880, duration = 0.15, volume = 0.3) => {
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = 'sine';
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Beep failed:', e);
    }
  };

  const playRestTimerAlarm = async () => {
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      // Three ascending tones
      [0, 0.2, 0.4].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660 + (i * 220);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      });
    } catch (e) {
      console.log('Alarm failed:', e);
    }
  };

  // Bug #1: Seed timer state when workout starts so the first set shows elapsed time
  useEffect(() => {
    if (activeWorkout?.exercises?.length > 0 && !lastCompletionTimestamp && !expectedNext) {
      setLastCompletionTimestamp(activeWorkout.startTime);
      let firstIncomplete = null;
      for (let i = 0; i < activeWorkout.exercises.length; i++) {
        const setIdx = activeWorkout.exercises[i].sets.findIndex(s => !s.completed);
        if (setIdx >= 0) {
          firstIncomplete = { exIndex: i, setIndex: setIdx };
          break;
        }
      }
      setExpectedNext(firstIncomplete); // null if all sets done or no exercises
    }
  }, [activeWorkout?.exercises?.length]);

  const togglePhase = (phase) => {
    setCollapsedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  // Auto-scroll to next set when green bar triggers a completion
  useEffect(() => {
    if (scrollToNextRef.current && expectedNext) {
      scrollToNextRef.current = false;
      setTimeout(() => {
        const el = dragRefs.current[expectedNext.exIndex];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [expectedNext]);

  // Notify parent when numpad state changes
  useEffect(() => {
    onNumpadStateChange?.(numpadState !== null);
  }, [numpadState, onNumpadStateChange]);

  // Auto-scroll input into view when numpad opens so input isn't hidden behind it
  useEffect(() => {
    if (numpadState) {
      setTimeout(() => {
        const el = dragRefs.current[numpadState.exIndex];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, [numpadState?.exIndex, numpadState?.setIndex, numpadState?.field]);

  // Auto-scroll to rest time options when editing
  useEffect(() => {
    if (editingRestTime !== null && restTimeRef.current) {
      restTimeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editingRestTime]);

  // Bug #6: Keep screen awake during active workout using Wake Lock API
  useEffect(() => {
    const requestWakeLock = async () => {
      if (activeWorkout && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock activated');

          // Re-acquire wake lock if released (e.g., when tab becomes visible again)
          wakeLockRef.current.addEventListener('release', () => {
            console.log('Wake Lock released');
          });
        } catch (err) {
          console.log('Wake Lock error:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock manually released');
      }
    };

    if (activeWorkout) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Re-acquire wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeWorkout) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeWorkout]);

  // Scroll to next incomplete exercise on mount (tab switch) and when returning to app
  useEffect(() => {
    const scrollToNextIncomplete = () => {
      if (!activeWorkout?.exercises?.length || !scrollContainerRef.current) return;
      for (let i = 0; i < activeWorkout.exercises.length; i++) {
        const hasIncomplete = activeWorkout.exercises[i].sets.some(s => !s.completed);
        if (hasIncomplete) {
          setTimeout(() => {
            const el = dragRefs.current[i];
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 200);
          break;
        }
      }
    };

    // Scroll on mount (covers switching back from Templates/History tabs)
    scrollToNextIncomplete();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scrollToNextIncomplete();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeWorkout?.exercises]);

  // getPreviousData is passed as async prop from App (uses IndexedDB via usePreviousExerciseData hook)

  // Bug #7: Timestamp-based rest timer - derive remaining time from startedAt + totalTime
  useEffect(() => {
    if (!restTimer.active || !restTimer.startedAt) return;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - restTimer.startedAt) / 1000);
      const remaining = Math.max(0, restTimer.totalTime - elapsed);
      if (remaining === 0) {
        // Play alarm sound and vibrate
        playRestTimerAlarm();
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 300]);
        }
        setRestTimer(prev => ({ ...prev, active: false, time: 0 }));
        return;
      }
      setRestTimer(prev => ({ ...prev, time: remaining }));
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [restTimer.active, restTimer.startedAt, restTimer.totalTime]);

  const startRestTimer = (exerciseName, restTime, timestamp) => {
    const time = restTime ?? 60; // Bug #16: Use ?? so restTime=0 is preserved (|| treats 0 as falsy)
    if (time <= 0) return; // Don't start timer for 0-rest exercises (supersets)
    // Use provided timestamp to stay in sync with lastCompletionTimestamp
    setRestTimer({ active: true, time, totalTime: time, startedAt: timestamp || Date.now(), exerciseName });
    setRestTimerMinimized(false); // Bug #6: auto-show when new timer starts
  };

  // Calculate the next expected set (superset-aware)
  // For supersets: pick the incomplete set with the lowest set number,
  // breaking ties by earliest exercise position in the superset.
  const calculateNextExpected = (justCompletedExIndex, justCompletedSetIndex) => {
    const exercises = activeWorkout.exercises;
    const justCompleted = exercises[justCompletedExIndex];

    if (justCompleted.supersetId) {
      const supersetExercises = exercises
        .map((ex, idx) => ({ ex, idx }))
        .filter(({ ex }) => ex.supersetId === justCompleted.supersetId);

      let bestCandidate = null;
      let bestSetIndex = Infinity;
      let bestExPos = Infinity;

      supersetExercises.forEach(({ ex, idx }, posInSuperset) => {
        ex.sets.forEach((s, sIdx) => {
          if (!s.completed) {
            if (sIdx < bestSetIndex || (sIdx === bestSetIndex && posInSuperset < bestExPos)) {
              bestCandidate = { exIndex: idx, setIndex: sIdx };
              bestSetIndex = sIdx;
              bestExPos = posInSuperset;
            }
          }
        });
      });

      if (bestCandidate) return bestCandidate;
    }

    // Not in superset, or superset fully complete: next incomplete set of same exercise
    const nextSetInSameEx = justCompleted.sets.findIndex((s, idx) => idx > justCompletedSetIndex && !s.completed);
    if (nextSetInSameEx >= 0) {
      return { exIndex: justCompletedExIndex, setIndex: nextSetInSameEx };
    }

    // All sets done for this exercise - find next exercise with incomplete sets
    for (let i = justCompletedExIndex + 1; i < exercises.length; i++) {
      const nextSetIdx = exercises[i].sets.findIndex(s => !s.completed);
      if (nextSetIdx >= 0) {
        return { exIndex: i, setIndex: nextSetIdx };
      }
    }

    return null; // All done
  };

  // Determine if rest timer should fire
  // Default: no timer between superset exercises within the same round (rest=0)
  // But if user has manually set a rest time > 0 on a non-last superset exercise, respect it
  const shouldStartRestTimer = (justCompletedExIndex, justCompletedSetIndex, nextExp) => {
    if (!nextExp) return false;
    const exercises = activeWorkout.exercises;
    const justCompleted = exercises[justCompletedExIndex];
    const nextExercise = exercises[nextExp.exIndex];

    // If both in same superset, check context
    if (justCompleted.supersetId && nextExercise.supersetId &&
        justCompleted.supersetId === nextExercise.supersetId) {
      // Round transition (next set index is higher) → always fire rest timer
      if (nextExp.setIndex > justCompletedSetIndex) return true;
      // Same round: only fire if the just-completed exercise has a manually-set rest time > 0
      return (justCompleted.restTime ?? 0) > 0;
    }

    return true; // Different exercises / not in superset = rest timer
  };

  // Get the rest time to use for a superset round transition (last exercise's rest time)
  const getSupersetRestTime = (supersetId) => {
    const supersetExercises = activeWorkout.exercises
      .filter(ex => ex.supersetId === supersetId);
    if (supersetExercises.length === 0) return 90;
    const lastEx = supersetExercises[supersetExercises.length - 1];
    return lastEx.restTime ?? 60;
  };

  // Bug #18: Check if an exercise is a non-last member of a superset (should not show rest timer row)
  const isNonLastInSuperset = (exIndex) => {
    const exercise = activeWorkout.exercises[exIndex];
    if (!exercise.supersetId) return false;
    const supersetExercises = activeWorkout.exercises
      .map((ex, idx) => ({ ex, idx }))
      .filter(({ ex }) => ex.supersetId === exercise.supersetId);
    const posInSuperset = supersetExercises.findIndex(({ idx }) => idx === exIndex);
    return posInSuperset < supersetExercises.length - 1;
  };

  // Bug #2/#16/#18: Get the rest time that should display above a given exercise/set
  // This represents the TARGET rest time for the rest period BEFORE this set.
  // Once a set is completed, its rest time is locked in via restTimeAtCompletion
  // so changing the exercise's rest time mid-rest won't retroactively update the target.
  const getDisplayRestTime = (exIndex, setIndex) => {
    const exercise = activeWorkout.exercises[exIndex];

    // Helper: get the locked-in rest time for a completed set, or the live value
    const getLockedOrLive = (ex, sIdx) => {
      const set = ex.sets?.[sIdx];
      if (set?.completed && set.restTimeAtCompletion !== undefined) {
        return set.restTimeAtCompletion;
      }
      return ex.restTime ?? 60;
    };

    // Non-last superset exercises
    if (isNonLastInSuperset(exIndex)) {
      // Set 0: if the previous exercise is NOT in this superset,
      // the rest period came from that previous exercise (outside the superset)
      if (setIndex === 0 && exIndex > 0) {
        const prevExercise = activeWorkout.exercises[exIndex - 1];
        if (!prevExercise.supersetId || prevExercise.supersetId !== exercise.supersetId) {
          const lastSetIdx = (prevExercise.sets?.length || 1) - 1;
          return getLockedOrLive(prevExercise, lastSetIdx);
        }
      }
      // Sets > 0: rest came from the round transition (last superset exercise completed previous round)
      // e.g. superset [A, B]: flow is A1→B1→(rest)→A2→B2→(rest)→A3
      // Above A2, the rest target should be B's rest time from round 1
      if (setIndex > 0) {
        const supersetExercises = activeWorkout.exercises.filter(
          ex => ex.supersetId === exercise.supersetId
        );
        const lastEx = supersetExercises[supersetExercises.length - 1];
        const prevRoundSetIdx = setIndex - 1;
        return getLockedOrLive(lastEx, prevRoundSetIdx);
      }
      return 0;
    }

    // Last exercise in superset, set > 0: rest came from this exercise completing the previous round
    // e.g. superset [A, B]: above B2, the rest target is B's rest time from round 1
    if (exercise.supersetId && setIndex > 0) {
      const prevRoundSetIdx = setIndex - 1;
      return getLockedOrLive(exercise, prevRoundSetIdx);
    }

    // For set 1+ of any non-superset exercise: use the previous set's locked-in value if completed
    if (setIndex > 0) {
      const prevSet = exercise.sets?.[setIndex - 1];
      if (prevSet?.completed && prevSet.restTimeAtCompletion !== undefined) {
        return prevSet.restTimeAtCompletion;
      }
      return exercise.restTime ?? 60;
    }

    // For set 0: the target rest is whatever rest period happened BEFORE this exercise
    // That means the previous exercise's last set's rest time
    if (exIndex > 0) {
      const prevExercise = activeWorkout.exercises[exIndex - 1];
      const lastSetIdx = (prevExercise.sets?.length || 1) - 1;
      return getLockedOrLive(prevExercise, lastSetIdx);
    }

    return exercise.restTime ?? 60;
  };

  // Add exercises (individually or as superset) - pre-fill with previous workout data
  // Bug #12: Now supports adding to specific phases via addToPhase state
  const addExercises = async (selectedExercises, asSuperset) => {
    pushUndo();
    const updated = { ...activeWorkout };
    const targetPhase = addToPhase || 'workout'; // Default to 'workout' phase

    // Fetch previous data for all exercises in parallel
    const prevDataMap = new Map();
    await Promise.all(selectedExercises.map(async (ex) => {
      const prevData = getPreviousData ? await getPreviousData(ex.name) : null;
      prevDataMap.set(ex.name, prevData);
    }));

    if (asSuperset && selectedExercises.length >= 2) {
      const supersetId = `superset-${Date.now()}`;
      selectedExercises.forEach((ex, i) => {
        const prevData = prevDataMap.get(ex.name);
        const sets = prevData?.sets?.length > 0
          ? prevData.sets.map(s => ({ ...s, completed: false, completedAt: undefined }))
          : [getDefaultSetForCategory(ex.category)];
        const isLast = i === selectedExercises.length - 1;
        updated.exercises.push({
          ...ex,
          supersetId,
          phase: targetPhase,
          // Non-last superset exercises: zero rest time (user can manually add back)
          restTime: isLast ? (prevData?.restTime || 60) : 0,
          notes: prevData?.notes || '',
          sets,
          previousSets: prevData?.sets
        });
      });
    } else {
      selectedExercises.forEach(ex => {
        const prevData = prevDataMap.get(ex.name);
        const sets = prevData?.sets?.length > 0
          ? prevData.sets.map(s => ({ ...s, completed: false, completedAt: undefined }))
          : [getDefaultSetForCategory(ex.category)];
        updated.exercises.push({
          ...ex,
          phase: targetPhase,
          restTime: prevData?.restTime || 60,
          notes: prevData?.notes || '',
          sets,
          previousSets: prevData?.sets
        });
      });
    }
    setActiveWorkout(updated);
    setShowExerciseModal(false);
    setAddToPhase(null); // Reset target phase
  };

  const addSingleExercise = (exercise) => {
    addExercises([exercise], false);
  };

  const updateSet = (exIndex, setIndex, field, value, propagate = true) => {
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    const currentValue = exercise.sets[setIndex][field];

    // Update the current set
    exercise.sets[setIndex][field] = value;
    exercise.sets[setIndex].manuallyEdited = true;

    // Propagate to subsequent sets if enabled
    if (propagate && value && (field === 'weight' || field === 'reps' || field === 'duration' || field === 'distance' || field === 'assistedWeight' || field === 'bandColor')) {
      for (let i = setIndex + 1; i < exercise.sets.length; i++) {
        const set = exercise.sets[i];
        // Only propagate if: not completed, not manually edited, and value is empty or same as previous
        if (!set.completed && !set.manuallyEdited) {
          const setCurrentValue = set[field];
          // Propagate if empty or matches what we just changed from
          if (!setCurrentValue || setCurrentValue === '' || setCurrentValue === currentValue) {
            set[field] = value;
            set.proposed = true; // Mark as proposed/auto-filled
          }
        }
      }
    }

    setActiveWorkout(updated);
  };

  // Numpad handlers
  const openNumpad = (exIndex, setIndex, field, fieldIndex) => {
    const exercise = activeWorkout.exercises[exIndex];
    setNumpadState({ exIndex, setIndex, field, fieldIndex, category: exercise.category });
  };

  const closeNumpad = () => setNumpadState(null);

  const handleNumpadChange = (value) => {
    if (!numpadState) return;
    updateSet(numpadState.exIndex, numpadState.setIndex, numpadState.field, value);
  };

  const handleNumpadNext = () => {
    if (!numpadState) return;
    const exercise = activeWorkout.exercises[numpadState.exIndex];
    const fields = CATEGORIES[exercise.category]?.fields || ['weight', 'reps'];
    const nextFieldIndex = numpadState.fieldIndex + 1;

    if (nextFieldIndex < fields.length) {
      // Move to next field in same set
      setNumpadState({ ...numpadState, field: fields[nextFieldIndex], fieldIndex: nextFieldIndex });
    } else if (numpadState.setIndex + 1 < exercise.sets.length) {
      // Move to first field of next set
      setNumpadState({ ...numpadState, setIndex: numpadState.setIndex + 1, field: fields[0], fieldIndex: 0 });
    } else {
      // Done with all sets
      closeNumpad();
    }
  };

  const handleRPEChange = (rpe) => {
    if (!numpadState) return;
    const updated = { ...activeWorkout };
    updated.exercises[numpadState.exIndex].sets[numpadState.setIndex].rpe = rpe;
    setActiveWorkout(updated);
  };

  const updateExerciseRestTime = (exIndex, restTime) => {
    const updated = { ...activeWorkout };
    updated.exercises[exIndex].restTime = restTime;
    setActiveWorkout(updated);
    setEditingRestTime(null);
  };

  const setExercisePhase = (exIndex, newPhase) => {
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    exercise.phase = newPhase;
    // If exercise is in a superset, update all exercises in the same superset
    if (exercise.supersetId) {
      updated.exercises.forEach(ex => {
        if (ex.supersetId === exercise.supersetId) {
          ex.phase = newPhase;
        }
      });
    }
    setActiveWorkout(updated);
  };

  // Bug #10: Smart multi-set completion - detects rapid completions and distributes time evenly
  const RAPID_COMPLETION_THRESHOLD = 4000; // 4 seconds

  const toggleSetComplete = (exIndex, setIndex) => {
    pushUndo();
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    const set = exercise.sets[setIndex];
    set.completed = !set.completed;

    if (set.completed) {
      playBeep();
      const now = Date.now();
      set.completedAt = now;
      // Lock in the rest time that was active when this set was completed
      // so changing rest time mid-rest doesn't retroactively update the target
      set.restTimeAtCompletion = exercise.restTime ?? 60;

      // Bug #10: Check for rapid completions and redistribute time
      const recentCompletions = [];
      let anchorTime = null;

      updated.exercises.forEach((ex, eIdx) => {
        ex.sets?.forEach((s, sIdx) => {
          if (s.completed && s.completedAt) {
            const timeDiff = now - s.completedAt;
            if (timeDiff <= RAPID_COMPLETION_THRESHOLD && timeDiff > 0) {
              recentCompletions.push({ exIndex: eIdx, setIndex: sIdx, completedAt: s.completedAt });
            } else if (timeDiff > RAPID_COMPLETION_THRESHOLD) {
              if (!anchorTime || s.completedAt > anchorTime) {
                anchorTime = s.completedAt;
              }
            }
          }
        });
      });

      // Fallback anchor: if no set outside the rapid window, use lastCompletionTimestamp
      // This handles the case where 3+ sets are all completed within the rapid threshold
      if (!anchorTime && recentCompletions.length >= 1 && lastCompletionTimestamp) {
        anchorTime = lastCompletionTimestamp;
      }

      if (recentCompletions.length >= 1 && anchorTime) {
        const totalTime = now - anchorTime;
        const numSets = recentCompletions.length + 1;
        const timePerSet = Math.round(totalTime / numSets);
        recentCompletions.sort((a, b) => a.completedAt - b.completedAt);
        recentCompletions.forEach((comp, idx) => {
          const newTime = anchorTime + (timePerSet * (idx + 1));
          updated.exercises[comp.exIndex].sets[comp.setIndex].completedAt = newTime;
        });
        set.completedAt = anchorTime + (timePerSet * numSets);

        // Bug #16: After redistribution, recalculate frozenElapsed for all affected sets
        // so display times reflect the redistributed timestamps, not stale values
        const redistributedFrozen = {};
        let prevTime = anchorTime;
        recentCompletions.forEach((comp) => {
          const newTime = updated.exercises[comp.exIndex].sets[comp.setIndex].completedAt;
          redistributedFrozen[`${comp.exIndex}-${comp.setIndex}`] = Math.round((newTime - prevTime) / 1000);
          prevTime = newTime;
        });
        redistributedFrozen[`${exIndex}-${setIndex}`] = Math.round((set.completedAt - prevTime) / 1000);
        setFrozenElapsed(prev => ({ ...prev, ...redistributedFrozen }));
      } else {
        // Freeze the elapsed time for the set being completed (non-rapid path)
        // Use actual completedAt timestamps for reliability instead of potentially stale state
        const existingFrozen = frozenElapsed[`${exIndex}-${setIndex}`];
        let baseTimestamp;
        if (existingFrozen !== undefined && existingFrozen < 0) {
          baseTimestamp = Math.abs(existingFrozen);
        } else {
          // Find the most recent completedAt among all other completed sets
          let mostRecentCompletion = activeWorkout.startTime;
          updated.exercises.forEach((ex, eIdx) => {
            ex.sets?.forEach((s, sIdx) => {
              if (s.completed && s.completedAt && !(eIdx === exIndex && sIdx === setIndex)) {
                if (s.completedAt > mostRecentCompletion) {
                  mostRecentCompletion = s.completedAt;
                }
              }
            });
          });
          baseTimestamp = mostRecentCompletion;
        }
        if (baseTimestamp) {
          const elapsed = Math.round((now - baseTimestamp) / 1000);
          setFrozenElapsed(prev => ({
            ...prev,
            [`${exIndex}-${setIndex}`]: elapsed
          }));
        }
      }

      // Bug #3/#10: If user completed a set that wasn't the expected next, handle the skipped set's timer
      if (expectedNext &&
          (expectedNext.exIndex !== exIndex || expectedNext.setIndex !== setIndex) &&
          lastCompletionTimestamp) {
        const key = `${expectedNext.exIndex}-${expectedNext.setIndex}`;
        if (expectedNext.exIndex !== exIndex) {
          // Different exercise: keep a live timer anchor (negative timestamp)
          // Timer restarts from now (when the other exercise's set was completed)
          setFrozenElapsed(prev => ({
            ...prev,
            [key]: -now
          }));
        } else {
          // Same exercise, different set: freeze at the current elapsed (truly skipped)
          const elapsedSinceLastCompletion = Math.round((now - lastCompletionTimestamp) / 1000);
          setFrozenElapsed(prev => ({
            ...prev,
            [key]: elapsedSinceLastCompletion
          }));
        }
      }

      // Calculate the next expected set from what was just completed
      const newExpected = calculateNextExpected(exIndex, setIndex);
      setExpectedNext(newExpected);
      setLastCompletionTimestamp(now);

      // Bug #17: If the new expected set was previously frozen (e.g. skipped then looped back via superset),
      // clear its frozen value so the live timer takes over instead of showing a stale frozen time
      if (newExpected) {
        setFrozenElapsed(prev => {
          const key = `${newExpected.exIndex}-${newExpected.setIndex}`;
          if (prev[key] !== undefined) {
            const copy = { ...prev };
            delete copy[key];
            return copy;
          }
          return prev;
        });
      }

      // Start rest timer if appropriate
      if (newExpected && shouldStartRestTimer(exIndex, setIndex, newExpected)) {
        const nextExName = updated.exercises[newExpected.exIndex]?.name || exercise.name;
        const nextExercise = updated.exercises[newExpected.exIndex];
        // Determine rest time based on context:
        // - Round transition in superset → use last exercise's rest time
        // - Same round with manual rest time → use the just-completed exercise's rest time
        // - Non-superset → use the just-completed exercise's rest time
        let restTime;
        if (exercise.supersetId && nextExercise?.supersetId === exercise.supersetId) {
          if (newExpected.setIndex > setIndex) {
            // Round transition → use last exercise's rest time
            restTime = getSupersetRestTime(exercise.supersetId);
          } else {
            // Same round, manual rest time on this exercise
            restTime = exercise.restTime ?? 0;
          }
        } else {
          restTime = exercise.restTime ?? 60;
        }
        startRestTimer(nextExName, restTime, now);
      } else if (restTimer.active) {
        // No rest timer needed - cancel any active one
        setRestTimer({ active: false, time: 0, totalTime: 0, startedAt: null, exerciseName: '' });
      }
    } else {
      // Bug #7: Uncompleting a set - restore timer state properly
      set.completedAt = undefined;

      // Clear frozen elapsed for this set
      setFrozenElapsed(prev => {
        const copy = { ...prev };
        delete copy[`${exIndex}-${setIndex}`];
        return copy;
      });

      // Find the most recent completedAt among all remaining completed sets
      let latestCompletedAt = null;
      updated.exercises.forEach((ex) => {
        ex.sets?.forEach((s) => {
          if (s.completed && s.completedAt) {
            if (!latestCompletedAt || s.completedAt > latestCompletedAt) {
              latestCompletedAt = s.completedAt;
            }
          }
        });
      });

      // Restore lastCompletionTimestamp to the previous completion
      // If no previous completions, fall back to workout start time
      setLastCompletionTimestamp(latestCompletedAt || activeWorkout.startTime);

      // Recalculate expectedNext — find the first incomplete set
      let newExpected = null;
      for (let i = 0; i < updated.exercises.length; i++) {
        const nextSetIdx = updated.exercises[i].sets.findIndex(s => !s.completed);
        if (nextSetIdx >= 0) {
          newExpected = { exIndex: i, setIndex: nextSetIdx };
          break;
        }
      }
      setExpectedNext(newExpected);

      // Cancel any active rest timer
      if (restTimer.active) {
        setRestTimer({ active: false, time: 0, totalTime: 0, startedAt: null, exerciseName: '' });
      }
    }
    setActiveWorkout(updated);
  };

  const addSet = (exIndex) => {
    pushUndo();
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    const lastSet = exercise.sets.slice(-1)[0];
    const newSet = getDefaultSetForCategory(exercise.category);
    Object.keys(newSet).forEach(key => {
      if (lastSet[key] !== undefined && key !== 'completed' && key !== 'completedAt') newSet[key] = lastSet[key];
    });
    exercise.sets.push(newSet);
    setActiveWorkout(updated);
  };

  const removeSet = (exIndex, setIndex) => {
    pushUndo();
    const updated = { ...activeWorkout };
    const exercise = updated.exercises[exIndex];
    if (exercise.sets.length > 1) {
      exercise.sets.splice(setIndex, 1);
      setActiveWorkout(updated);
    }
  };

  // Bug #11: Drag to reorder exercises
  // Bug #9: Long-press + touch drag-to-reorder system
  const handleExerciseTouchStart = (exIndex, e) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    longPressTimerRef.current = setTimeout(() => {
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
      closeNumpad(); // Dismiss number pad when starting drag
      setDragTouch({ exIndex, startY, currentY: startY, insertBefore: null });
      // Prevent scrolling while dragging
      e.target.closest('.workout-scroll-container')?.style.setProperty('overflow', 'hidden');
    }, 500);
    // Store initial position to detect movement that should cancel long-press
    longPressTimerRef.current._startX = touch.clientX;
    longPressTimerRef.current._startY = touch.clientY;
  };

  const handleExerciseTouchMove = (e) => {
    if (!dragTouch) {
      // Cancel long-press if finger moves before timer fires
      if (longPressTimerRef.current) {
        const touch = e.touches[0];
        const dx = touch.clientX - (longPressTimerRef.current._startX || 0);
        const dy = touch.clientY - (longPressTimerRef.current._startY || 0);
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          clearTimeout(longPressTimerRef.current);
        }
      }
      return;
    }
    e.preventDefault();
    const touch = e.touches[0];
    // Determine which exercise slot the finger is over
    let insertBefore = null;
    const entries = Object.entries(dragRefs.current)
      .filter(([, el]) => el)
      .sort(([a], [b]) => parseInt(a) - parseInt(b));

    for (const [idx, el] of entries) {
      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (touch.clientY < midY && parseInt(idx) !== dragTouch.exIndex) {
        insertBefore = parseInt(idx);
        break;
      }
    }
    // If past all items, insert at end
    if (insertBefore === null) {
      const lastIdx = entries.length > 0 ? parseInt(entries[entries.length - 1][0]) : 0;
      if (lastIdx !== dragTouch.exIndex) {
        insertBefore = lastIdx + 1;
      }
    }
    setDragTouch(prev => ({ ...prev, currentY: touch.clientY, insertBefore }));
  };

  const handleExerciseTouchEnd = () => {
    clearTimeout(longPressTimerRef.current);
    if (dragTouch && dragTouch.insertBefore !== null && dragTouch.insertBefore !== dragTouch.exIndex) {
      pushUndo();
      const fromIndex = dragTouch.exIndex;
      let toIndex = dragTouch.insertBefore;
      // Adjust for the removal
      if (fromIndex < toIndex) toIndex--;

      const updated = { ...activeWorkout };
      const [movedExercise] = updated.exercises.splice(fromIndex, 1);
      updated.exercises.splice(toIndex, 0, movedExercise);
      setActiveWorkout(updated);
      remapExpectedNext(fromIndex, toIndex);

      // Auto-scroll to moved exercise after render
      setTimeout(() => {
        const el = dragRefs.current[toIndex];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
    setDragTouch(null);
    // Re-enable scrolling
    document.querySelector('.workout-scroll-container')?.style.removeProperty('overflow');
  };

  // Legacy drag functions (kept for backward compatibility with grip handle)
  const startDrag = (exIndex) => {
    const exercise = activeWorkout.exercises[exIndex];
    closeNumpad(); // Dismiss number pad
    setDragState({
      exIndex,
      phase: exercise.phase || 'workout',
      originalIndex: exIndex
    });
    // Auto-scroll to the exercise being moved
    setTimeout(() => {
      const el = dragRefs.current[exIndex];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const cancelDrag = () => {
    setDragState(null);
  };

  // Helper: remap expectedNext index after a splice-move operation
  const remapExpectedNext = (fromIndex, adjustedTarget) => {
    if (!expectedNext) return;
    let newIdx = expectedNext.exIndex;
    if (newIdx === fromIndex) {
      newIdx = adjustedTarget;
    } else {
      if (newIdx > fromIndex) newIdx--;
      if (newIdx >= adjustedTarget) newIdx++;
    }
    setExpectedNext({ ...expectedNext, exIndex: newIdx });
  };

  const dropExercise = (targetIndex, targetPhase) => {
    if (!dragState) return;
    pushUndo();
    const updated = { ...activeWorkout };
    const fromIndex = dragState.exIndex;
    const [movedExercise] = updated.exercises.splice(fromIndex, 1);
    movedExercise.phase = targetPhase;
    const adjustedTarget = fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
    updated.exercises.splice(adjustedTarget, 0, movedExercise);
    setActiveWorkout(updated);
    setDragState(null);
    remapExpectedNext(fromIndex, adjustedTarget);

    // Auto-scroll to the moved exercise's new position
    setTimeout(() => {
      const el = dragRefs.current[adjustedTarget];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const moveExercise = (fromIndex, toIndex, newPhase) => {
    if (fromIndex === toIndex) return;
    const updated = { ...activeWorkout };
    const [movedExercise] = updated.exercises.splice(fromIndex, 1);
    movedExercise.phase = newPhase || movedExercise.phase;
    const adjustedTarget = fromIndex < toIndex ? toIndex - 1 : toIndex;
    updated.exercises.splice(adjustedTarget, 0, movedExercise);
    setActiveWorkout(updated);
    remapExpectedNext(fromIndex, adjustedTarget);
  };

  const openBandPicker = (exIndex, setIndex, currentColor) => {
    setBandPickerState({ exIndex, setIndex, currentColor });
  };

  const selectBandColor = (color) => {
    if (bandPickerState) {
      updateSet(bandPickerState.exIndex, bandPickerState.setIndex, 'bandColor', color);
      setBandPickerState(null);
    }
  };

  const removeExercise = (index) => {
    pushUndo();
    const updated = { ...activeWorkout };
    updated.exercises.splice(index, 1);
    setActiveWorkout(updated);
    setDeleteConfirmIndex(null);
  };

  // Bug #5: Unlink restores original rest time
  const unlinkSuperset = (exIndex) => {
    pushUndo();
    // Deep clone to prevent stale state and position revert issues
    const updated = {
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s })) }))
    };
    const exercise = updated.exercises[exIndex];
    const oldSupersetId = exercise.supersetId;

    // Restore original rest time if it was saved before superset linking
    if (exercise._preSupersetRestTime) {
      exercise.restTime = exercise._preSupersetRestTime;
      delete exercise._preSupersetRestTime;
    }

    delete exercise.supersetId;

    // Auto-disconnect if only one exercise remains in the superset
    // Also restore rest time for the new last exercise in the group
    if (oldSupersetId) {
      const remainingByIndex = updated.exercises
        .map((ex, idx) => ({ ex, idx }))
        .filter(({ ex }) => ex.supersetId === oldSupersetId);

      if (remainingByIndex.length === 1) {
        // Only one left — remove superset entirely
        const last = remainingByIndex[0].ex;
        if (last._preSupersetRestTime) {
          last.restTime = last._preSupersetRestTime;
          delete last._preSupersetRestTime;
        }
        delete last.supersetId;
      } else if (remainingByIndex.length > 1) {
        // Restore rest time for the new last exercise (was zeroed as non-last)
        const newLast = remainingByIndex[remainingByIndex.length - 1].ex;
        if (newLast._preSupersetRestTime && (newLast.restTime === 0 || newLast.restTime === undefined)) {
          newLast.restTime = newLast._preSupersetRestTime;
          delete newLast._preSupersetRestTime;
        }
      }
    }

    setActiveWorkout(updated);
  };

  // Bug #5: Link exercise with the next one as a superset — zero non-last rest timers
  const linkWithNext = (exIndex) => {
    if (exIndex >= activeWorkout.exercises.length - 1) return;
    const updated = { ...activeWorkout };
    const currentEx = updated.exercises[exIndex];
    const nextEx = updated.exercises[exIndex + 1];

    const supersetId = currentEx.supersetId || nextEx.supersetId || `superset-${Date.now()}`;
    currentEx.supersetId = supersetId;
    nextEx.supersetId = supersetId;

    // Zero out rest timers for all non-last exercises in the superset
    const supersetExercises = updated.exercises
      .map((ex, idx) => ({ ex, idx }))
      .filter(({ ex }) => ex.supersetId === supersetId);

    supersetExercises.forEach(({ ex }, i) => {
      if (i < supersetExercises.length - 1) {
        // Save original rest time before zeroing (for restore on unlink)
        if (!ex._preSupersetRestTime) {
          ex._preSupersetRestTime = ex.restTime || 60;
        }
        ex.restTime = 0;
      }
      // Last exercise keeps its rest time
    });

    setActiveWorkout(updated);
  };

  // Group exercises by phase, then by superset within each phase
  const getGroupedExercisesByPhase = () => {
    const phases = { warmup: [], workout: [], cooldown: [] };
    const used = new Set();

    // First pass: assign exercises to phases
    activeWorkout.exercises.forEach((ex, idx) => {
      const phase = ex.phase || 'workout';
      phases[phase].push({ exercise: ex, index: idx });
    });

    // Second pass: group by superset within each phase
    const result = {};
    Object.entries(phases).forEach(([phase, exerciseList]) => {
      const groups = [];
      const phaseUsed = new Set();

      exerciseList.forEach(({ exercise, index }) => {
        if (phaseUsed.has(index)) return;

        if (exercise.supersetId) {
          const supersetExercises = [];
          exerciseList.forEach(({ exercise: e, index: i }) => {
            if (e.supersetId === exercise.supersetId) {
              supersetExercises.push({ exercise: e, index: i });
              phaseUsed.add(i);
            }
          });
          groups.push({ type: 'superset', exercises: supersetExercises, supersetId: exercise.supersetId });
        } else {
          groups.push({ type: 'single', exercise, index });
          phaseUsed.add(index);
        }
      });

      result[phase] = groups;
    });

    return result;
  };

  // Check if any exercises have phases assigned
  const hasPhases = () => {
    return activeWorkout?.exercises?.some(ex => ex.phase && ex.phase !== 'workout');
  };

  // Bug #3: Check if a given set position is the next expected set
  const isNextExpectedSet = (exIndex, setIndex) => {
    return expectedNext && expectedNext.exIndex === exIndex && expectedNext.setIndex === setIndex;
  };

  // Get frozen elapsed time for a skipped set (if any)
  const getFrozenElapsed = (exIndex, setIndex) => {
    return frozenElapsed[`${exIndex}-${setIndex}`] || null;
  };

  // Bug #15: Calculate pace tracking
  const getPaceInfo = () => {
    if (!activeWorkout?.exercises?.length) return null;
    // Calculate estimated time if not explicitly set
    if (!activeWorkout.estimatedTime) {
      activeWorkout.estimatedTime = Math.round(activeWorkout.exercises.reduce((total, ex) => {
        const setTime = (ex.sets?.length || 3) * 45;
        const restTime = (ex.sets?.length || 3) * (ex.restTime || 60);
        return total + setTime + restTime;
      }, 0) / 60);
    }

    const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
    const completedSets = activeWorkout.exercises.reduce((sum, ex) =>
      sum + (ex.sets?.filter(s => s.completed)?.length || 0), 0);

    if (totalSets === 0) return null;

    const elapsedMinutes = (Date.now() - activeWorkout.startTime) / 60000;
    const estimatedMinutes = activeWorkout.estimatedTime;

    // Calculate expected progress (what percentage should be done by now)
    const expectedProgress = Math.min(1, elapsedMinutes / estimatedMinutes);
    // Calculate actual progress
    const actualProgress = completedSets / totalSets;

    // Calculate pace difference in minutes
    // Negative = ahead of schedule, Positive = behind schedule
    const expectedSetsCompleted = expectedProgress * totalSets;
    const setsAheadBehind = completedSets - expectedSetsCompleted;
    const minutesPerSet = estimatedMinutes / totalSets;
    const paceDiffMinutes = -setsAheadBehind * minutesPerSet;

    // Color coding: green (within 3 min), yellow (3-10 min behind), red (>10 min behind)
    let color = 'text-green-400';
    let emoji = '🟢';
    if (paceDiffMinutes > 10) {
      color = 'text-red-400';
      emoji = '🔴';
    } else if (paceDiffMinutes > 3) {
      color = 'text-yellow-400';
      emoji = '🟡';
    } else if (paceDiffMinutes < -3) {
      color = 'text-green-300';
      emoji = '🟢';
    }

    return {
      completedSets,
      totalSets,
      elapsedMinutes: Math.round(elapsedMinutes),
      estimatedMinutes,
      paceDiffMinutes: Math.round(paceDiffMinutes),
      color,
      emoji,
      isAhead: paceDiffMinutes < 0
    };
  };

  if (!activeWorkout) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black" style={{ touchAction: 'none' }}>
        {/* Background Image - fixed position */}
        <div className="fixed inset-0 z-0 bg-black">
          <img src="/backgrounds/bg-5.jpg" alt="" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>
        </div>
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center p-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-6xl mb-4 text-center">🏋️</div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Ready to Train?</h2>
            <p className="text-white/70 text-center mb-6 text-sm">Start a new workout or select a template</p>
            <button onClick={() => setActiveWorkout({ name: 'New Workout', exercises: [], startTime: Date.now() })}
              className="w-full bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 flex items-center justify-center gap-2 border border-white/30 transition-all">
              <Icons.Plus /> Start Empty Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const restTimePresets = [30, 45, 60, 90, 120, 180, 300];

  const renderExerciseCard = (exercise, exIndex, isSuperset = false, isFirst = true, isLast = true, supersetColorDot = null) => {
    const exerciseRestTime = exercise.restTime ?? 60;
    const typeInfo = exercise.exerciseType ? EXERCISE_TYPES[exercise.exerciseType] : null;
    const phaseInfo = exercise.phase && exercise.phase !== 'workout' ? EXERCISE_PHASES[exercise.phase] : null;

    // Determine active field for highlighting
    const activeField = numpadState && numpadState.exIndex === exIndex
      ? { setIndex: numpadState.setIndex, field: numpadState.field }
      : null;

    // Bug #11: If in drag mode, show compact view
    if (dragState && dragState.exIndex !== exIndex) {
      const completedSets = exercise.sets?.filter(s => s.completed).length || 0;
      const totalSets = exercise.sets?.length || 0;
      return (
        <div
          key={exIndex}
          className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 mb-1 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => dropExercise(exIndex, exercise.phase || 'workout')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-cyan-500 text-xs">↓</span>
              <span className="text-white text-sm">{exercise.name}</span>
            </div>
            <span className="text-gray-500 text-xs">{completedSets}/{totalSets}</span>
          </div>
        </div>
      );
    }

    return (
      <div key={exIndex}>
        {/* Bug #9: Drag insertion indicator - show above this card */}
        {dragTouch && dragTouch.insertBefore === exIndex && dragTouch.exIndex !== exIndex && (
          <div className="h-1 bg-cyan-400 rounded-full mx-2 mb-1 shadow-lg shadow-cyan-400/50 animate-pulse" />
        )}
      <div
        ref={el => dragRefs.current[exIndex] = el}
        onTouchStart={(e) => handleExerciseTouchStart(exIndex, e)}
        onTouchMove={handleExerciseTouchMove}
        onTouchEnd={handleExerciseTouchEnd}
        className={`${exercise.highlight ? 'ring-2 ring-rose-500' : ''} ${dragState?.exIndex === exIndex ? 'ring-2 ring-cyan-400 opacity-75' : ''} ${dragTouch?.exIndex === exIndex ? 'opacity-50 ring-2 ring-cyan-400 scale-[1.02]' : ''} bg-white/10 backdrop-blur-md border border-white/20 ${isSuperset ? `p-3 ${isFirst ? 'rounded-t-2xl' : isLast ? 'rounded-b-2xl' : ''}` : `p-4 rounded-2xl mb-4`} transition-transform`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Bug #9/#11: Drag handle — visible for all exercises including supersets */}
            <button
              onClick={() => dragState ? cancelDrag() : startDrag(exIndex)}
              className={`p-1 rounded touch-none ${dragState?.exIndex === exIndex ? 'text-cyan-400 bg-cyan-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/10'}`}
              title="Hold to reorder"
            >
              <Icons.GripVertical />
            </button>
            {isSuperset && (
              <div className={`w-1 h-8 rounded-full ${supersetColorDot || 'bg-teal-500'}`} />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={async () => {
                  setShowExerciseDetailModal(exercise);
                  try {
                    const workouts = await workoutDb.getAll();
                    workouts.sort((a, b) => (b.date || b.startTime) - (a.date || a.startTime));
                    setExerciseDetailHistory(workouts);
                  } catch (err) {
                    console.error('Error loading history:', err);
                    setExerciseDetailHistory([]);
                  }
                }} className="font-semibold text-white hover:text-cyan-400 transition-colors text-left">{exercise.name}</button>
                {typeInfo && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>{typeInfo.label}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">{exercise.bodyPart}</span>
                {(!isSuperset || isFirst) && (
                  <select
                    value={exercise.phase || 'workout'}
                    onChange={(e) => setExercisePhase(exIndex, e.target.value)}
                    className={`text-[10px] pl-1 pr-0 py-0.5 rounded bg-white/5 border-none outline-none appearance-none cursor-pointer ${EXERCISE_PHASES[exercise.phase || 'workout'].textColor}`}
                    style={{ WebkitAppearance: 'none', backgroundImage: 'none' }}
                  >
                    {Object.entries(EXERCISE_PHASES).map(([key, phase]) => (
                      <option key={key} value={key}>{phase.icon} {phase.label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditingRestTime(editingRestTime === exIndex ? null : exIndex)} className="text-xs text-gray-400 px-2 py-1 rounded hover:bg-white/10">
              ⏱️ {formatDuration(exerciseRestTime)}
            </button>
            {/* Link button - show if there's a next exercise in the same phase and this is the last in its group */}
            {(() => {
              const currentPhase = exercise.phase || 'workout';
              const hasNextInPhase = activeWorkout.exercises.some((ex, idx) => idx > exIndex && (ex.phase || 'workout') === currentPhase);
              return hasNextInPhase && (!isSuperset || isLast);
            })() && (
              <button
                onClick={() => linkWithNext(exIndex)}
                className="text-teal-400 hover:text-teal-300 p-1 hover:bg-white/10 rounded"
                title="Link with next exercise"
              >
                <Icons.Link />
              </button>
            )}
            {/* Unlink button - show if in a superset */}
            {isSuperset && (
              <button
                onClick={() => unlinkSuperset(exIndex)}
                className="text-orange-400 hover:text-orange-300 p-1 hover:bg-white/10 rounded"
                title="Unlink from superset"
              >
                <Icons.Unlink />
              </button>
            )}
            {/* Delete button with confirmation */}
            {deleteConfirmIndex === exIndex ? (
              <div className="flex items-center gap-1">
                <button onClick={() => removeExercise(exIndex)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                <button onClick={() => setDeleteConfirmIndex(null)} className="text-xs text-gray-400 px-1">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setDeleteConfirmIndex(exIndex)} className="text-red-400 hover:text-red-300 p-1"><Icons.X /></button>
            )}
          </div>
        </div>

        {/* Rest time presets - Bug #8: Added custom input */}
        {editingRestTime === exIndex && (
          <div ref={restTimeRef} className="mb-3 p-2 bg-gray-800/50 rounded-lg">
            <div className="flex flex-wrap gap-1 items-center">
              {restTimePresets.map(t => (
                <button key={t} onClick={() => updateExerciseRestTime(exIndex, t)}
                  className={`px-3 py-1 text-xs rounded-full ${exerciseRestTime === t ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  {formatDuration(t)}
                </button>
              ))}
              <button
                onClick={() => updateExerciseRestTime(exIndex, 0)}
                className={`px-3 py-1 text-xs rounded-full ${exerciseRestTime === 0 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                Off
              </button>
              <div className="flex items-center gap-1 ml-2">
                <input
                  type="number"
                  placeholder="sec"
                  min="0"
                  max="600"
                  className="w-16 px-2 py-1 text-xs bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt(e.target.value);
                      if (val >= 0 && val <= 600) {
                        updateExerciseRestTime(exIndex, val);
                        e.target.value = '';
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 0 && val <= 600) {
                      updateExerciseRestTime(exIndex, val);
                      e.target.value = '';
                    }
                  }}
                />
                <span className="text-xs text-gray-500">custom</span>
              </div>
            </div>
          </div>
        )}

        {/* Exercise notes — tappable to edit */}
        {editingExNotes?.exIndex === exIndex ? (
          <div className="mb-2 px-1">
            <textarea
              value={editingExNotes.text}
              onChange={(e) => setEditingExNotes({ ...editingExNotes, text: e.target.value })}
              placeholder="Exercise notes..."
              className="w-full bg-amber-900/20 text-amber-300 text-xs rounded-lg p-2 min-h-[60px] focus:outline-none focus:ring-1 focus:ring-amber-500 border border-amber-700/30 resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-1">
              <button onClick={() => {
                const updated = { ...activeWorkout };
                updated.exercises = [...updated.exercises];
                updated.exercises[exIndex] = { ...updated.exercises[exIndex], notes: editingExNotes.text };
                setActiveWorkout(updated);
                setEditingExNotes(null);
              }} className="px-3 py-1 bg-amber-700/50 text-amber-300 rounded text-xs font-medium">Save</button>
              <button onClick={() => setEditingExNotes(null)} className="px-3 py-1 text-gray-400 text-xs">Cancel</button>
            </div>
          </div>
        ) : exercise.notes ? (
          <button onClick={() => setEditingExNotes({ exIndex, text: exercise.notes })}
            className="mb-2 px-1 py-1.5 bg-amber-900/15 border border-amber-700/20 rounded-lg w-full text-left hover:bg-amber-900/25">
            <p className="text-xs text-amber-400/80 leading-relaxed">{exercise.notes}</p>
          </button>
        ) : (
          <button onClick={() => setEditingExNotes({ exIndex, text: '' })}
            className="mb-1 px-1 py-1 text-xs text-gray-600 hover:text-amber-400/60 w-full text-left">
            + Add notes
          </button>
        )}

        {/* Set headers */}
        <div className="grid grid-cols-[40px_50px_1fr_1fr_40px] gap-1 mb-1 text-xs text-gray-500 uppercase px-1">
          <span>Set</span>
          <span className="text-center">Prev</span>
          {CATEGORIES[exercise.category]?.fields.length < 2 && <span></span>}
          {CATEGORIES[exercise.category]?.fields.slice(0, 2).map(f => (
            <span key={f} className="text-center">{f === 'bandColor' ? 'Band' : f}</span>
          ))}
          <span></span>
        </div>

        {/* Sets */}
        {exercise.sets.map((set, setIndex) => (
          <SetInputRow key={setIndex} set={set} setIndex={setIndex} category={exercise.category}
            previousSet={setIndex > 0 ? exercise.sets[setIndex - 1] : null}
            previousWorkoutSet={exercise.previousSets?.[setIndex] || null}
            restTime={getDisplayRestTime(exIndex, setIndex)}
            onUpdate={(field, value) => updateSet(exIndex, setIndex, field, value)}
            onComplete={() => toggleSetComplete(exIndex, setIndex)}
            onRemove={exercise.sets.length > 1 ? () => removeSet(exIndex, setIndex) : null}
            onOpenNumpad={(sIdx, field, fIdx) => openNumpad(exIndex, sIdx, field, fIdx)}
            onOpenBandPicker={(color) => openBandPicker(exIndex, setIndex, color)}
            activeField={activeField && activeField.setIndex === setIndex ? activeField.field : null}
            isNextExpected={isNextExpectedSet(exIndex, setIndex)}
            lastCompletionTimestamp={lastCompletionTimestamp}
            frozenElapsed={getFrozenElapsed(exIndex, setIndex)} />
        ))}
        <button onClick={() => addSet(exIndex)}
          className="w-full mt-1 py-1 bg-transparent hover:bg-white/5 rounded-lg text-teal-400/70 flex items-center justify-center gap-1 text-xs">
          <Icons.Plus /> Add Set
        </button>
      </div>
      {/* Bug #9: Drag insertion indicator - show after last card */}
      {dragTouch && dragTouch.insertBefore === exIndex + 1 && dragTouch.exIndex !== exIndex && (
        <div className="h-1 bg-cyan-400 rounded-full mx-2 mt-1 shadow-lg shadow-cyan-400/50 animate-pulse" />
      )}
      </div>
    );
  };

  const groupedByPhase = getGroupedExercisesByPhase();
  const showPhases = hasPhases();

  // Helper to get a consistent color index for a superset group
  const getSupersetColor = (supersetId) => {
    if (!supersetColorMap.current[supersetId]) {
      const usedCount = Object.keys(supersetColorMap.current).length;
      supersetColorMap.current[supersetId] = SUPERSET_COLORS[usedCount % SUPERSET_COLORS.length];
    }
    return supersetColorMap.current[supersetId];
  };

  // Helper to render a group (superset or single)
  const renderGroup = (group, groupIdx) => {
    if (group.type === 'superset') {
      const color = getSupersetColor(group.supersetId);
      return (
        <div key={group.supersetId} className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Icons.Link />
            <span className={`text-xs font-medium ${color.text} uppercase tracking-wide`}>Superset</span>
          </div>
          <div className={`border-l-4 ${color.border} rounded-2xl overflow-hidden`}>
            {group.exercises.map(({ exercise, index }, i) =>
              renderExerciseCard(exercise, index, true, i === 0, i === group.exercises.length - 1, color.dot)
            )}
          </div>
        </div>
      );
    } else {
      return renderExerciseCard(group.exercise, group.index, false);
    }
  };

  // Calculate phase progress
  const getPhaseProgress = (groups) => {
    let completed = 0;
    let total = 0;
    groups.forEach(group => {
      if (group.type === 'superset') {
        group.exercises.forEach(({ exercise }) => {
          exercise.sets?.forEach(set => {
            total++;
            if (set.completed) completed++;
          });
        });
      } else {
        group.exercise?.sets?.forEach(set => {
          total++;
          if (set.completed) completed++;
        });
      }
    });
    return { completed, total };
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Background Image - fixed position */}
      <div className="fixed inset-0 z-0 bg-black">
        <img src="/backgrounds/bg-1.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
      </div>
      <div className="relative z-10 flex flex-col h-full overflow-hidden">
      <RestTimerBanner
        isActive={restTimer.active}
        isMinimized={restTimerMinimized}
        timeRemaining={restTimer.time}
        totalTime={restTimer.totalTime}
        exerciseName={restTimer.exerciseName}
        onSkip={() => setRestTimer({ active: false, time: 0, totalTime: 0, startedAt: null, exerciseName: '' })}
        onMinimize={() => setRestTimerMinimized(true)}
        onExpand={() => setRestTimerMinimized(false)}
        onAddTime={(delta) => setRestTimer(prev => ({ ...prev, totalTime: Math.max(0, prev.totalTime + delta) }))}
      />

      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm flex-shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <input type="text" value={activeWorkout.name} onChange={e => setActiveWorkout({ ...activeWorkout, name: e.target.value })}
              className="text-xl font-bold text-white bg-transparent border-none focus:outline-none w-full" />
            {/* Bug #15: Pace tracking display */}
            {(() => {
              const pace = getPaceInfo();
              if (pace) {
                return (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">{pace.elapsedMinutes}/{pace.estimatedMinutes} min</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{pace.completedSets}/{pace.totalSets} sets</span>
                    <span className="text-gray-600">•</span>
                    <span className={pace.color}>
                      {pace.emoji} {pace.isAhead ? `${Math.abs(pace.paceDiffMinutes)}m ahead` : pace.paceDiffMinutes === 0 ? 'on pace' : `${pace.paceDiffMinutes}m behind`}
                    </span>
                  </div>
                );
              }
              return <div className="text-sm text-gray-400">{Math.floor((Date.now() - activeWorkout.startTime) / 60000)} min elapsed</div>;
            })()}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowCancelConfirm(true)} className="text-red-400 hover:text-red-300 px-3 py-2 text-sm whitespace-nowrap">Cancel</button>
            <button onClick={() => {
              const hasIncomplete = activeWorkout.exercises.some(ex => ex.sets.some(s => !s.completed));
              if (hasIncomplete) {
                setShowFinishConfirm(true);
              } else {
                onFinish(activeWorkout);
              }
            }} className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 whitespace-nowrap">Finish</button>
          </div>
        </div>
        {activeWorkout.notes && (
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="mt-3 w-full bg-amber-900/20 border border-amber-700/30 rounded-lg p-2 text-left"
          >
            <div className="text-sm text-amber-400 flex items-start gap-2">
              <span className="flex-shrink-0">📋</span>
              <span className={notesExpanded ? '' : 'line-clamp-1'}>{activeWorkout.notes}</span>
              <span className="flex-shrink-0 text-amber-600 text-xs mt-0.5">{notesExpanded ? '▲' : '▼'}</span>
            </div>
          </button>
        )}
      </div>

      {/* Bug #11: Drag mode banner */}
      {dragState && (
        <div className="mx-4 mb-2 p-3 bg-cyan-900/50 border border-cyan-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300">
            <Icons.GripVertical />
            <span className="text-sm font-medium">Reordering: {activeWorkout.exercises[dragState.exIndex]?.name}</span>
          </div>
          <button onClick={cancelDrag} className="text-cyan-400 hover:text-cyan-300 text-sm px-3 py-1 bg-cyan-900/50 rounded-lg">
            Cancel
          </button>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className={`workout-scroll-container flex-1 overflow-y-auto px-4 pb-4 pt-2 ${restTimer.active ? 'pt-24' : ''} ${dragState ? 'pt-1' : ''}`}
        style={{
          paddingBottom: numpadState ? '18rem' : 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
          overscrollBehavior: 'contain'
        }}
        onScroll={(e) => onScroll?.(e.target.scrollTop)}
      >
        {showPhases ? (
          // Render with phase sections - Bug #12: Show all phases for adding exercises
          Object.entries(EXERCISE_PHASES).map(([phaseKey, phaseInfo]) => {
            const groups = groupedByPhase[phaseKey] || [];
            const isEmpty = groups.length === 0;

            const isCollapsed = collapsedPhases[phaseKey];
            const { completed, total } = getPhaseProgress(groups);
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={phaseKey} className="mb-4">
                <button
                  onClick={() => togglePhase(phaseKey)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl ${phaseInfo.color} mb-2`}
                >
                  <div className="flex items-center gap-2">
                    <span>{phaseInfo.icon}</span>
                    <span className="font-semibold text-white">{phaseInfo.label}</span>
                    <span className="text-white/70 text-sm">({groups.reduce((t, g) => t + (g.type === 'superset' ? g.exercises.length : 1), 0)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/90 text-sm font-medium">{completed}/{total} sets</span>
                    <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className={`border-l-4 ${phaseInfo.borderColor} pl-3`}>
                    {groups.map((group, idx) => renderGroup(group, idx))}
                    {/* Bug #11: Drop zone at end of phase when dragging */}
                    {dragState && (
                      <button
                        onClick={() => {
                          // Find the last exercise index in this phase
                          const lastInPhase = activeWorkout.exercises.reduce((last, ex, idx) =>
                            (ex.phase || 'workout') === phaseKey ? idx : last, -1);
                          dropExercise(lastInPhase + 1, phaseKey);
                        }}
                        className="w-full mt-2 bg-cyan-900/20 border-2 border-dashed border-cyan-500/50 rounded-xl py-4 text-cyan-400 hover:bg-cyan-900/30 flex items-center justify-center gap-2 text-sm"
                      >
                        ↓ Drop at end of {phaseInfo.label}
                      </button>
                    )}
                    {/* Bug #12: Add exercise button per phase */}
                    {!dragState && (
                      <button
                        onClick={() => { setAddToPhase(phaseKey); setShowExerciseModal(true); }}
                        className="w-full mt-2 bg-gray-900/50 border border-dashed border-gray-700 rounded-xl py-3 text-gray-500 hover:border-gray-600 hover:text-gray-400 flex items-center justify-center gap-2 text-sm"
                      >
                        <Icons.Plus /> Add to {phaseInfo.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Render without phases (flat list with superset grouping)
          Object.values(groupedByPhase).flat().map((group, idx) => renderGroup(group, idx))
        )}
        {/* Bottom add exercise - only show when no phases (flat list) */}
        {!showPhases && (
          <button onClick={() => { setAddToPhase('workout'); setShowExerciseModal(true); }}
            className="w-full bg-gray-900 border-2 border-dashed border-gray-700 rounded-2xl p-6 text-gray-400 hover:border-teal-600 hover:text-teal-400 flex items-center justify-center gap-2">
            <Icons.Plus /> Add Exercise
          </button>
        )}
      </div>

      {/* Complete Next Set — green bar on right side */}
      {expectedNext && !numpadState && !dragState && !dragTouch && (
        <button
          onClick={() => {
            setCompletionFlash(true);
            scrollToNextRef.current = true;
            toggleSetComplete(expectedNext.exIndex, expectedNext.setIndex);
            if (navigator.vibrate) navigator.vibrate(30);
            setTimeout(() => setCompletionFlash(false), 400);
          }}
          onTouchStart={(e) => { greenBarSwipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={(e) => {
            if (!greenBarSwipeRef.current) return;
            const endX = e.changedTouches[0].clientX;
            const dx = greenBarSwipeRef.current.x - endX; // positive = swipe left
            greenBarSwipeRef.current = null;
            if (dx > 30) { // Swiped left at least 30px
              setCompletionFlash(true);
              scrollToNextRef.current = true;
              toggleSetComplete(expectedNext.exIndex, expectedNext.setIndex);
              if (navigator.vibrate) navigator.vibrate(30);
              setTimeout(() => setCompletionFlash(false), 400);
            }
          }}
          className={`fixed right-0 z-30 flex items-center justify-center transition-all duration-300 ease-out ${completionFlash ? 'w-12 bg-green-400 shadow-lg shadow-green-400/50' : 'w-2.5 bg-green-500/70 hover:w-4 hover:bg-green-500'}`}
          style={{
            top: '33%',
            height: '34%',
            borderRadius: '8px 0 0 8px',
          }}
        >
          {completionFlash && (
            <svg className="w-6 h-6 text-white animate-ping" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          )}
        </button>
      )}

      {/* Floating Undo Button */}
      {undoAvailable > 0 && !numpadState && !dragState && !dragTouch && (
        <button
          onClick={handleUndo}
          className="fixed left-3 bottom-24 z-30 bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 text-white rounded-full px-3 py-2 flex items-center gap-1.5 shadow-lg hover:bg-gray-700/90 active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" /></svg>
          <span className="text-xs font-medium">Undo</span>
          {undoAvailable > 1 && <span className="text-xs text-gray-400">({undoAvailable})</span>}
        </button>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Cancel Workout?</h3>
            <p className="text-gray-400 text-sm mb-6">Your workout progress will be lost. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700">
                Keep Going
              </button>
              <button onClick={() => { setShowCancelConfirm(false); onCancel(); }} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600">
                Cancel Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Confirmation Modal (incomplete sets) */}
      {showFinishConfirm && (() => {
        const incompleteSets = activeWorkout.exercises.reduce((sum, ex) =>
          sum + ex.sets.filter(s => !s.completed).length, 0);
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-white mb-2">Incomplete Sets</h3>
              <p className="text-gray-400 text-sm mb-6">
                You have {incompleteSets} incomplete {incompleteSets === 1 ? 'set' : 'sets'}. How would you like to proceed?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    // Remove incomplete sets and finish
                    const cleaned = {
                      ...activeWorkout,
                      exercises: activeWorkout.exercises.map(ex => ({
                        ...ex,
                        sets: ex.sets.filter(s => s.completed)
                      })).filter(ex => ex.sets.length > 0)
                    };
                    setShowFinishConfirm(false);
                    onFinish(cleaned);
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700"
                >
                  Finish &amp; Remove Incomplete
                </button>
                <button
                  onClick={() => {
                    // Auto-complete all incomplete sets and finish
                    const autoCompleted = {
                      ...activeWorkout,
                      exercises: activeWorkout.exercises.map(ex => ({
                        ...ex,
                        sets: ex.sets.map(s => s.completed ? s : { ...s, completed: true, completedAt: Date.now() })
                      }))
                    };
                    setShowFinishConfirm(false);
                    onFinish(autoCompleted);
                  }}
                  className="w-full bg-cyan-600 text-white py-3 rounded-xl font-medium hover:bg-cyan-700"
                >
                  Auto-Complete All &amp; Finish
                </button>
                <button
                  onClick={() => setShowFinishConfirm(false)}
                  className="w-full bg-gray-800 text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-700"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showExerciseModal && (
        <ExerciseSearchModal
          exercises={exercises}
          onSelect={addSingleExercise}
          onSelectMultiple={addExercises}
          onClose={() => setShowExerciseModal(false)}
        />
      )}

      {/* Exercise Detail Modal */}
      {showExerciseDetailModal && (
        <ExerciseDetailModal
          exercise={showExerciseDetailModal}
          history={exerciseDetailHistory}
          onEdit={() => {
            setExerciseDetail(showExerciseDetailModal);
            setShowExerciseDetailModal(null);
          }}
          onUpdateNotes={(newNotes) => {
            // Update exercise notes in the active workout
            const exIdx = activeWorkout.exercises.findIndex(e => e.name === showExerciseDetailModal.name);
            if (exIdx >= 0) {
              const updated = { ...activeWorkout };
              updated.exercises = [...updated.exercises];
              updated.exercises[exIdx] = { ...updated.exercises[exIdx], notes: newNotes };
              setActiveWorkout(updated);
              setShowExerciseDetailModal(updated.exercises[exIdx]);
            }
          }}
          onClose={() => setShowExerciseDetailModal(null)}
        />
      )}

      {/* Band Color Picker Modal */}
      {bandPickerState && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setBandPickerState(null)} />
          <div className="fixed left-1/2 -translate-x-1/2 w-64 bg-gray-800 rounded-xl shadow-2xl z-[101] p-3 border border-gray-700" style={{ top: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="text-center text-white font-medium mb-3 pb-2 border-b border-gray-700">Select Band Color</div>
            <div className="flex flex-col gap-1.5">
              {Object.entries(BAND_COLORS).map(([color, info]) => (
                <button
                  key={color}
                  onClick={() => selectBandColor(color)}
                  className={`${info.bg} ${info.text} px-3 py-2 rounded-lg text-sm font-medium ${bandPickerState.currentColor === color ? 'ring-2 ring-white' : ''}`}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Number Pad / Duration Pad */}
      {/* Bug #11: key forces re-mount when switching sets, resetting hasEdited state */}
      {numpadState && activeWorkout && (
        numpadState.field === 'duration' ? (
          <DurationPad
            key={`${numpadState.exIndex}-${numpadState.setIndex}-${numpadState.field}`}
            value={String(activeWorkout.exercises[numpadState.exIndex]?.sets[numpadState.setIndex]?.[numpadState.field] || '')}
            onChange={handleNumpadChange}
            onClose={closeNumpad}
            onNext={handleNumpadNext}
            fieldLabel="Duration"
          />
        ) : (
          <NumberPad
            key={`${numpadState.exIndex}-${numpadState.setIndex}-${numpadState.field}`}
            value={String(activeWorkout.exercises[numpadState.exIndex]?.sets[numpadState.setIndex]?.[numpadState.field] || '')}
            onChange={handleNumpadChange}
            onClose={closeNumpad}
            onNext={handleNumpadNext}
            showRPE={numpadState.field === 'reps'}
            rpeValue={activeWorkout.exercises[numpadState.exIndex]?.sets[numpadState.setIndex]?.rpe}
            onRPEChange={handleRPEChange}
            fieldLabel={numpadState.field === 'weight' ? 'Weight (lbs)' : numpadState.field === 'reps' ? 'Reps' : numpadState.field === 'distance' ? 'Distance (mi)' : numpadState.field}
          />
        )
      )}

      {/* Timer uses vibration instead of audio to avoid pausing music (Bug #3 fix) */}
      </div>
    </div>
  );
};


export { WorkoutScreen };
