import { useState, useEffect, useCallback } from 'react';
import { Icons } from './Icons';
import { CATEGORIES, BAND_COLORS, EXERCISE_PHASES } from '../data/constants';
import { formatDuration, exportWorkoutJSON, generateStravaDescription } from '../utils/helpers';
import { workoutDb, db } from '../db/workoutDb';
import { useAuth } from '../hooks/useAuth';
import { replaceCloudWorkouts } from '../lib/syncService';

// Workout Detail Modal - shows full workout when clicking on history item
const WorkoutDetailModal = ({ workout, onClose, onDelete }) => {
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stravaCopied, setStravaCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false); // Bug #16: React state for copy button

  const togglePhase = (phase) => {
    setCollapsedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  // Group exercises by phase
  const getExercisesByPhase = () => {
    const phases = { warmup: [], workout: [], cooldown: [] };
    workout.exercises.forEach((ex, idx) => {
      const phase = ex.phase || 'workout';
      phases[phase].push({ exercise: ex, index: idx });
    });
    return phases;
  };

  const exercisesByPhase = getExercisesByPhase();

  // Calculate stats
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const totalVolume = workout.exercises.reduce((acc, ex) =>
    acc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.reps || 0), 0), 0);
  const duration = workout.duration ? Math.round(workout.duration / 60000) : 0;
  const workoutDate = new Date(workout.date || workout.startTime);

  // Get phase stats
  const getPhaseStats = (exercises) => {
    let sets = 0, volume = 0;
    exercises.forEach(({ exercise }) => {
      exercise.sets.filter(s => s.completed).forEach(s => {
        sets++;
        volume += (s.weight || 0) * (s.reps || 0);
      });
    });
    return { sets, volume };
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="shrink-0 p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
        <button onClick={() => setShowDeleteConfirm(true)} className="text-red-400 hover:text-red-300">
          <Icons.Trash />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-black" style={{ overscrollBehavior: 'contain' }}>
        {/* Date & Time */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-white">{workoutDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div className="text-gray-400">{workoutDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-cyan-400">{workout.exercises.length}</div>
            <div className="text-xs text-gray-400">Exercises</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-teal-400">{totalSets}</div>
            <div className="text-xs text-gray-400">Sets</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-rose-400">{totalVolume.toLocaleString()}</div>
            <div className="text-xs text-gray-400">lbs</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-amber-400">{duration}</div>
            <div className="text-xs text-gray-400">min</div>
          </div>
        </div>

        {workout.notes && (
          <div className="bg-teal-900/20 border border-teal-700/30 rounded-xl p-3 mb-4">
            <div className="text-sm text-teal-300 flex items-center gap-2">
              <span>📋</span> {workout.notes}
            </div>
          </div>
        )}

        {/* Exercises by Phase */}
        {Object.entries(EXERCISE_PHASES).map(([phaseKey, phaseInfo]) => {
          const phaseExercises = exercisesByPhase[phaseKey];
          if (phaseExercises.length === 0) return null;

          const isCollapsed = collapsedPhases[phaseKey];
          const { sets, volume } = getPhaseStats(phaseExercises);

          return (
            <div key={phaseKey} className="mb-4">
              <button onClick={() => togglePhase(phaseKey)} className={`w-full flex items-center justify-between p-3 rounded-xl ${phaseInfo.color} mb-2`}>
                <div className="flex items-center gap-2">
                  <span>{phaseInfo.icon}</span>
                  <span className="font-semibold text-white">{phaseInfo.label}</span>
                  <span className="text-white/70 text-sm">({phaseExercises.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">{sets} sets</span>
                  {volume > 0 && <span className="text-white/70 text-sm">• {volume.toLocaleString()} lbs</span>}
                  {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
                </div>
              </button>

              {!isCollapsed && (
                <div className={`border-l-4 ${phaseInfo.borderColor} pl-3 space-y-3`}>
                  {phaseExercises.map(({ exercise, index }) => {
                    // Filter out rest-period sets (duration-only with no reps/weight)
                    const isRestPeriod = (set) => {
                      const hasReps = set.reps && set.reps > 0;
                      const hasWeight = set.weight && set.weight > 0;
                      const hasDistance = set.distance && set.distance > 0;
                      const isDurationExercise = exercise.category === 'duration' || exercise.category === 'cardio';
                      if (isDurationExercise && set.duration) return false;
                      return !hasReps && !hasWeight && !hasDistance;
                    };
                    const realSets = exercise.sets.filter(s => !isRestPeriod(s));
                    const completedSets = realSets.filter(s => s.completed);
                    const exVolume = completedSets.reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0);

                    return (
                      <div key={index} className="bg-gray-900 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-white">{exercise.name}</span>
                            {exercise.supersetId && <span className="ml-2 text-teal-400 text-xs">⚡ Superset</span>}
                          </div>
                          {exVolume > 0 && (
                            <span className="text-sm text-gray-400">{exVolume.toLocaleString()} lbs</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mb-3">
                          {exercise.bodyPart} • {completedSets.length}/{realSets.length} sets completed
                        </div>

                        {/* Set details - filter out rest periods (sets with only duration, no reps/weight) */}
                        <div className="space-y-1">
                          {exercise.sets
                            .filter(set => {
                              // Keep sets that have actual workout data (reps, weight, distance)
                              // Filter out rest-period sets (duration-only with no reps/weight)
                              const hasReps = set.reps && set.reps > 0;
                              const hasWeight = set.weight && set.weight > 0;
                              const hasDistance = set.distance && set.distance > 0;
                              const isDurationExercise = exercise.category === 'duration' || exercise.category === 'cardio';

                              // If it's a duration/cardio exercise, keep sets with duration
                              if (isDurationExercise && set.duration) return true;

                              // For other exercises, keep sets that have reps, weight, or distance
                              return hasReps || hasWeight || hasDistance;
                            })
                            .map((set, sIdx) => {
                            const fields = CATEGORIES[exercise.category]?.fields || ['weight', 'reps'];
                            return (
                              <div key={sIdx} className={`flex items-center gap-3 p-2 rounded-lg ${set.completed ? 'bg-gray-800' : 'bg-gray-800/30'}`}>
                                <span className={`w-6 text-center text-xs ${set.completed ? 'text-green-400' : 'text-gray-500'}`}>
                                  {set.completed ? '✓' : sIdx + 1}
                                </span>
                                <div className="flex-1 flex items-center gap-2 text-sm">
                                  {fields.includes('weight') && set.weight !== undefined && set.weight !== null && (
                                    <span className={set.completed ? 'text-white' : 'text-gray-500'}>{set.weight} lbs</span>
                                  )}
                                  {fields.includes('reps') && set.reps > 0 && (
                                    <span className={set.completed ? 'text-white' : 'text-gray-500'}>× {set.reps}</span>
                                  )}
                                  {fields.includes('duration') && set.duration && (
                                    <span className={set.completed ? 'text-white' : 'text-gray-500'}>{formatDuration(set.duration)}</span>
                                  )}
                                  {fields.includes('duration') && set.duration && fields.includes('distance') && set.distance && (
                                    <span className={set.completed ? 'text-white/60' : 'text-gray-600'}> × </span>
                                  )}
                                  {fields.includes('distance') && set.distance && (
                                    <span className={set.completed ? 'text-white' : 'text-gray-500'}>{set.distance} mi</span>
                                  )}
                                  {fields.includes('bandColor') && set.bandColor && (
                                    <span className={`${BAND_COLORS[set.bandColor]?.bg} ${BAND_COLORS[set.bandColor]?.text} px-2 py-0.5 rounded text-xs`}>
                                      {set.bandColor}
                                    </span>
                                  )}
                                  {fields.includes('assistedWeight') && set.assistedWeight && (
                                    <span className={set.completed ? 'text-white' : 'text-gray-500'}>-{set.assistedWeight} lbs</span>
                                  )}
                                </div>
                                {set.rpe && (
                                  <span className="text-xs text-amber-400">RPE {set.rpe}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {exercise.notes && (
                          <div className="mt-2 text-xs text-amber-400">📝 {exercise.notes}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="shrink-0 p-4 border-t border-gray-800 bg-gray-900 space-y-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}>
        {/* Bug #8: Strava Description Export */}
        <button onClick={async () => {
          const stravaText = generateStravaDescription(workout);
          await navigator.clipboard.writeText(stravaText);
          setStravaCopied(true);
          setTimeout(() => setStravaCopied(false), 2000);
        }} className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
          stravaCopied
            ? 'bg-green-600 text-white'
            : 'bg-orange-600 text-white hover:bg-orange-700'
        }`}>
          {stravaCopied ? '✓ Copied!' : '🏃 Copy Strava Description'}
        </button>

        <div className="flex gap-2">
          <button onClick={async () => {
            try {
              await navigator.clipboard.writeText(exportWorkoutJSON(workout));
              setJsonCopied(true);
              setTimeout(() => setJsonCopied(false), 2000);
            } catch (err) {
              console.error('Clipboard write failed:', err);
            }
          }} className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
            jsonCopied
              ? 'bg-green-600 text-white'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}>
            {jsonCopied ? '✓ Copied!' : <><Icons.Export /> Copy JSON</>}
          </button>
          <button onClick={() => {
            const json = exportWorkoutJSON(workout);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${workout.name.replace(/\s+/g, '-')}-${new Date(workout.date || workout.startTime).toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }} className="py-3 px-4 rounded-xl font-medium bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center">
            ⬇️
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Workout?</h3>
            <p className="text-gray-400 text-sm mb-6">This will permanently delete "{workout.name}" from your history. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600">Cancel</button>
              <button onClick={() => { onDelete(workout.id); onClose(); }} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryScreen = ({ onRefreshNeeded, onScroll, navVisible, onModalStateChange }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [importFormat, setImportFormat] = useState('json'); // 'json' or 'csv'
  const [importFile, setImportFile] = useState(null);

  // Notify parent when modal opens/closes to hide navbar
  useEffect(() => {
    onModalStateChange?.(!!selectedWorkout);
  }, [selectedWorkout, onModalStateChange]);

  // Load history from IndexedDB, auto-import if empty
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const workouts = await workoutDb.getAll();

        // Sort and set history (no auto-import — users import via Settings)
        workouts.sort((a, b) => (b.date || b.startTime) - (a.date || a.startTime));
        setHistory(workouts);
      } catch (err) {
        console.error('Error loading history:', err);
      }
      setLoading(false);
    };
    loadHistory();
  }, [onRefreshNeeded]);

  // Legacy importStrongHistory removed — history import is now in Settings

  // Parse CSV from Strong app format
  const parseStrongCSV = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));
    const workouts = {};

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(';').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx]; });

      // Group by date + workout name
      const dateStr = row['Date'];
      const workoutName = row['Workout Name'];
      const key = `${dateStr}-${workoutName}`;

      if (!workouts[key]) {
        workouts[key] = {
          id: `imported-${Date.now()}-${i}`,
          name: workoutName,
          date: new Date(dateStr).getTime(),
          duration: parseFloat(row['Workout Duration'] || row['Duration (sec)'] || 0) * 1000,
          exercises: []
        };
      }

      // Find or create exercise
      const exName = row['Exercise Name'];
      let exercise = workouts[key].exercises.find(e => e.name === exName);
      if (!exercise) {
        exercise = {
          name: exName,
          bodyPart: row['Body Part'] || 'Other',
          category: row['Weight'] ? 'weighted' : (row['Duration (sec)'] ? 'duration' : 'reps_only'),
          phase: 'workout',
          sets: []
        };
        workouts[key].exercises.push(exercise);
      }

      // Add set
      const set = { completed: true };
      if (row['Weight']) set.weight = parseFloat(row['Weight']);
      if (row['Reps']) set.reps = parseInt(row['Reps']);
      if (row['Duration (sec)']) set.duration = parseInt(row['Duration (sec)']);
      if (row['Distance']) set.distance = parseFloat(row['Distance']);
      exercise.sets.push(set);
    }

    return Object.values(workouts);
  };

  // Import from file (JSON or CSV)
  const importFromFile = async (replace = false) => {
    if (!importFile) return;

    setImporting(true);
    setImportStatus({ message: 'Reading file...', progress: 0 });

    try {
      const text = await importFile.text();
      let workoutsToImport = [];

      if (importFormat === 'json') {
        const data = JSON.parse(text);
        workoutsToImport = Array.isArray(data) ? data : (data.workouts || []);
        // Ensure each workout has an id and proper date
        workoutsToImport = workoutsToImport.map((w, i) => ({
          ...w,
          id: w.id || `imported-${Date.now()}-${i}`,
          date: w.date ? (typeof w.date === 'string' ? new Date(w.date).getTime() : w.date) : Date.now()
        }));
      } else {
        workoutsToImport = parseStrongCSV(text);
      }

      if (replace) {
        setImportStatus({ message: 'Clearing existing history...', progress: 10 });
        const existing = await workoutDb.getAll();
        for (const w of existing) {
          await workoutDb.delete(w.id);
        }
      }

      setImportStatus({ message: 'Importing workouts...', progress: 30 });

      let imported = 0;
      const total = workoutsToImport.length;

      for (let i = 0; i < total; i++) {
        try {
          await workoutDb.add(workoutsToImport[i]);
          imported++;
        } catch (err) {
          console.warn(`Skipped workout ${i}:`, err.message);
        }

        if (i % 50 === 0 || i === total - 1) {
          setImportStatus({ message: `Importing... ${imported}/${total}`, progress: 30 + (i / total) * 65 });
        }
      }

      // Sync to cloud if logged in
      if (user) {
        setImportStatus({ message: `Syncing ${imported} workouts to cloud...`, progress: 95 });
        try {
          await db.syncQueue.clear();
          await replaceCloudWorkouts(user.id);
          localStorage.setItem('tonnage-local-last-synced', new Date().toISOString());
          setImportStatus({ message: `Imported & synced ${imported} workouts!`, progress: 100, done: true });
        } catch (syncErr) {
          console.error('Cloud sync after import failed:', syncErr);
          setImportStatus({ message: `Imported ${imported} workouts locally, but cloud sync failed: ${syncErr.message}`, progress: 100, done: true });
        }
      } else {
        setImportStatus({ message: `Successfully imported ${imported} workouts!`, progress: 100, done: true });
      }

      // Reload history
      const workouts = await workoutDb.getAll();
      workouts.sort((a, b) => (b.date || b.startTime) - (a.date || a.startTime));
      setHistory(workouts);
      setImportFile(null);

    } catch (err) {
      console.error('Import error:', err);
      setImportStatus({ message: `Error: ${err.message}`, error: true });
    }

    setImporting(false);
  };

  const deleteWorkout = async (id) => {
    try {
      await workoutDb.delete(id);
      setHistory(history.filter(w => w.id !== id));
    } catch (err) {
      console.error('Error deleting workout:', err);
    }
  };

  // Calculate stats
  const stats = {
    totalWorkouts: history.length,
    totalTime: history.reduce((acc, w) => acc + (w.duration || 0), 0),
    totalVolume: history.reduce((acc, w) =>
      acc + w.exercises.reduce((eAcc, ex) =>
        eAcc + ex.sets.filter(s => s.completed).reduce((sAcc, s) =>
          sAcc + (s.weight || 0) * (s.reps || 0), 0), 0), 0)
  };

  const formatTotalTime = (ms) => {
    const hours = Math.floor(ms / 3600000);
    return `${hours}h`;
  };

  const formatVolume = (lbs) => {
    if (lbs >= 1000000) return `${(lbs / 1000000).toFixed(1)}M`;
    if (lbs >= 1000) return `${(lbs / 1000).toFixed(0)}K`;
    return lbs.toLocaleString();
  };

  // Group workouts by month
  const groupByMonth = () => {
    const groups = {};
    history.forEach(workout => {
      const date = new Date(workout.date || workout.startTime);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = { label, workouts: [] };
      groups[key].workouts.push(workout);
    });
    return Object.values(groups);
  };

  const monthGroups = groupByMonth();

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <div className="fixed inset-0 z-0 bg-black">
        <img src="/backgrounds/bg-10.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-shrink-0 p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">History</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowImport(true)} className="bg-teal-500/20 backdrop-blur-sm text-teal-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-500/30 flex items-center gap-2 border border-teal-500/30">
                <Icons.Import /> Import
              </button>
              {history.length > 0 && (
                <button onClick={() => setShowExport(true)} className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 flex items-center gap-2 border border-white/20">
                  <Icons.Export /> Export
                </button>
              )}
            </div>
          </div>

          {history.length > 0 && (
            <div className="flex gap-2">
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-rose-400">{stats.totalWorkouts.toLocaleString()}</div>
                <div className="text-xs text-white/60">Workouts</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-teal-400">{formatTotalTime(stats.totalTime)}</div>
                <div className="text-xs text-white/60">Total Time</div>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-cyan-400">{formatVolume(stats.totalVolume)}</div>
                <div className="text-xs text-white/60">Volume (lbs)</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)', overscrollBehavior: 'contain' }} onScroll={(e) => onScroll?.(e.target.scrollTop)}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-white/50">Loading...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center">
                <span className="text-white/30 text-4xl"><Icons.History /></span>
                <p className="mt-4 text-white/60">No workouts yet</p>
                <p className="text-sm text-white/40">Complete a workout to see it here</p>
              </div>
            </div>
          ) : (
            monthGroups.map(({ label, workouts }) => (
              <div key={label} className="mb-6">
                <h3 className="text-sm font-semibold text-teal-400/80 mb-3 sticky top-0 bg-black/80 backdrop-blur-sm py-2 -mx-4 px-4">{label}</h3>
                {workouts.map((workout) => {
                  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
                  const totalVolume = workout.exercises.reduce((acc, ex) =>
                    acc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.reps || 0), 0), 0);
                  const workoutDate = new Date(workout.date || workout.startTime);
                  const duration = workout.duration ? Math.round(workout.duration / 60000) : 0;

                  // Count phases
                  const phaseCounts = { warmup: 0, workout: 0, cooldown: 0 };
                  workout.exercises.forEach(ex => { phaseCounts[ex.phase || 'workout']++; });

                  return (
                    <button key={workout.id} onClick={() => setSelectedWorkout(workout)}
                      className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3 border border-white/20 hover:bg-white/15 transition-colors text-left">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{workout.name}</h4>
                          <div className="text-sm text-white/60">
                            {workoutDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {duration > 0 && ` • ${duration} min`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-cyan-400 font-medium">{totalSets} sets</div>
                          {totalVolume > 0 && <div className="text-sm text-white/60">{totalVolume.toLocaleString()} lbs</div>}
                        </div>
                      </div>

                      {/* Phase indicators */}
                      <div className="flex gap-2 mb-2">
                        {phaseCounts.warmup > 0 && <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">🔥 {phaseCounts.warmup}</span>}
                        {phaseCounts.workout > 0 && <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full">💪 {phaseCounts.workout}</span>}
                        {phaseCounts.cooldown > 0 && <span className="bg-teal-500/20 text-teal-400 text-xs px-2 py-0.5 rounded-full">🧊 {phaseCounts.cooldown}</span>}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.slice(0, 5).map((ex, j) => (
                          <span key={j} className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs border border-white/20">
                            {ex.name}
                          </span>
                        ))}
                        {workout.exercises.length > 5 && (
                          <span className="text-white/50 text-xs py-1">+{workout.exercises.length - 5} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {showExport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Export History</h3>
              <button onClick={() => setShowExport(false)} className="text-white/60 hover:text-white"><Icons.X /></button>
            </div>
            <div className="text-sm text-teal-400 mb-3">{history.length} workouts will be exported</div>
            <pre className="bg-black/50 rounded-lg p-3 text-xs text-white/70 overflow-auto max-h-64 mb-4 border border-white/10">
              {(() => {
                try {
                  const preview = history.slice(0, 3).map(w => {
                    try { return JSON.parse(exportWorkoutJSON(w)); }
                    catch (e) { return { name: w.name, error: e.message }; }
                  });
                  return JSON.stringify({ workouts: preview, total: history.length }, null, 2).slice(0, 1000) + '...';
                } catch (e) { return `Preview error: ${e.message}`; }
              })()}
            </pre>
            <button
              id="export-btn"
              onClick={async (e) => {
                const btn = e.currentTarget;
                try {
                  const exportData = history.map(w => {
                    try { return JSON.parse(exportWorkoutJSON(w)); }
                    catch (err) { return { name: w.name || 'Unknown', error: err.message }; }
                  });
                  await navigator.clipboard.writeText(JSON.stringify({ workouts: exportData }, null, 2));
                  btn.textContent = `✓ Copied ${exportData.length} workouts!`;
                  btn.classList.add('bg-teal-600');
                  setTimeout(() => {
                    btn.textContent = 'Copy to Clipboard';
                    btn.classList.remove('bg-teal-600');
                  }, 2000);
                } catch (err) {
                  btn.textContent = `Error: ${err.message}`;
                  setTimeout(() => { btn.textContent = 'Copy to Clipboard'; }, 2000);
                }
              }}
              className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-medium hover:bg-white/30 border border-white/30">
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}

      {selectedWorkout && (
        <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} onDelete={deleteWorkout} />
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Import Workout History</h3>
              {!importing && <button onClick={() => { setShowImport(false); setImportStatus(null); setImportFile(null); }} className="text-white/60 hover:text-white"><Icons.X /></button>}
            </div>

            {!importStatus ? (
              <>
                {/* Format Picker */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">Format</label>
                  <div className="flex rounded-xl overflow-hidden border border-white/20">
                    <button
                      onClick={() => setImportFormat('json')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${importFormat === 'json' ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setImportFormat('csv')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${importFormat === 'csv' ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      CSV (Strong)
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">Select File</label>
                  <label className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${importFile ? 'border-teal-500 bg-teal-500/10' : 'border-white/20 hover:border-white/40 bg-gray-800/50'}`}>
                    <input
                      type="file"
                      accept={importFormat === 'json' ? '.json' : '.csv'}
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="hidden"
                    />
                    {importFile ? (
                      <span className="text-teal-400 font-medium">{importFile.name}</span>
                    ) : (
                      <>
                        <Icons.Import />
                        <span className="text-gray-400">Choose {importFormat.toUpperCase()} file</span>
                      </>
                    )}
                  </label>
                </div>

                <p className="text-white/50 text-xs mb-4">
                  {importFormat === 'json'
                    ? 'Import JSON exported from this app or compatible format.'
                    : 'Import CSV exported from Strong app (semicolon-separated).'}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => importFromFile(false)}
                    disabled={importing || !importFile}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50"
                  >
                    Add to Existing History
                  </button>
                  <button
                    onClick={() => importFromFile(true)}
                    disabled={importing || !importFile}
                    className="w-full bg-rose-600 text-white py-3 rounded-xl font-medium hover:bg-rose-700 disabled:opacity-50"
                  >
                    Replace All History
                  </button>
                  <button
                    onClick={() => { setShowImport(false); setImportFile(null); }}
                    disabled={importing}
                    className="w-full bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div>
                {!importStatus.done && !importStatus.error && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${importStatus.progress}%` }}></div>
                    </div>
                    <p className="text-white/60 text-sm text-center">{importStatus.message}</p>
                  </div>
                )}

                {importStatus.done && (
                  <div className="text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-teal-400 font-medium mb-4">{importStatus.message}</p>
                    <button
                      onClick={() => { setShowImport(false); setImportStatus(null); }}
                      className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700"
                    >
                      Done
                    </button>
                  </div>
                )}

                {importStatus.error && (
                  <div className="text-center">
                    <div className="text-4xl mb-2">❌</div>
                    <p className="text-rose-400 font-medium mb-4">{importStatus.message}</p>
                    <button
                      onClick={() => setImportStatus(null)}
                      className="w-full bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { HistoryScreen };
