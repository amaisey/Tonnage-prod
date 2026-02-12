import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { workoutDb, db } from '../db/workoutDb';
import { defaultExercises } from '../data/defaultExercises';
import AuthModal from './AuthModal';
import SyncStatus from './SyncStatus';
import { useAuth } from '../hooks/useAuth';
import { queueSyncEntry } from '../lib/syncService';

export function SettingsModal({ onClose, exercises, templates, folders, onRestoreData, user, syncStatus, lastSynced, pendingCount, onSyncNow, onHistoryRefresh }) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState(null);
  const [workoutCount, setWorkoutCount] = useState(0);
  const fileInputRef = useRef(null);
  const [showAuth, setShowAuth] = useState(false);
  const [importingHistory, setImportingHistory] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { signOut } = useAuth();

  // Get workout count on mount and when sync status changes (e.g. after pull adds data)
  useEffect(() => {
    workoutDb.count().then(setWorkoutCount);
  }, [syncStatus]);

  // Export all data to JSON file
  const handleExport = async () => {
    setExporting(true);
    setMessage(null);

    try {
      // Get all workouts from IndexedDB
      const workouts = await workoutDb.getAll();

      const backup = {
        version: 1,
        exportDate: new Date().toISOString(),
        data: {
          workouts,
          exercises,
          templates,
          folders
        },
        stats: {
          workoutCount: workouts.length,
          exerciseCount: exercises.length,
          templateCount: templates.length
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: `Exported ${workouts.length} workouts, ${templates.length} templates` });
    } catch (err) {
      console.error('Export error:', err);
      setMessage({ type: 'error', text: 'Export failed: ' + err.message });
    } finally {
      setExporting(false);
    }
  };

  // Import data from JSON file
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      // Validate backup structure
      if (!backup.data || !backup.version) {
        throw new Error('Invalid backup file format');
      }

      const { workouts = [], exercises: importedExercises = [], templates: importedTemplates = [], folders: importedFolders = [] } = backup.data;

      // Import workouts to IndexedDB
      if (workouts.length > 0) {
        // Clear existing and import new
        await workoutDb.clear();
        await workoutDb.bulkAdd(workouts);
      }

      // Restore other data via callback
      if (onRestoreData) {
        onRestoreData({
          exercises: importedExercises,
          templates: importedTemplates,
          folders: importedFolders
        });
      }

      setMessage({
        type: 'success',
        text: `Restored ${workouts.length} workouts, ${importedTemplates.length} templates, ${importedExercises.length} exercises`
      });

    } catch (err) {
      console.error('Import error:', err);
      setMessage({ type: 'error', text: 'Import failed: ' + err.message });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Import handler function
  const handleHistoryImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingHistory(true);
    setImportResult(null);

    try {
      const text = await file.text();
      let workouts = [];

      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        workouts = data.workouts || (Array.isArray(data) ? data : []);
      } else if (file.name.endsWith('.csv')) {
        // Parse Strong CSV
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const workoutMap = new Map();

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV parse (handles quoted fields)
          const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];

          const dateStr = values[0];
          const workoutName = values[1] || 'Workout';
          const duration = values[2];
          const exerciseName = values[3];
          const setOrder = parseInt(values[4]) || 1;
          const weight = parseFloat(values[5]) || 0;
          const reps = parseInt(values[6]) || 0;

          const key = `${dateStr}|${workoutName}`;

          if (!workoutMap.has(key)) {
            const dateMs = new Date(dateStr).getTime();
            // Parse duration like "12m" or "1h 30m"
            let durationMs = 0;
            if (duration) {
              const hours = duration.match(/(\d+)h/);
              const mins = duration.match(/(\d+)m/);
              durationMs = ((hours ? parseInt(hours[1]) * 60 : 0) + (mins ? parseInt(mins[1]) : 0)) * 60000;
            }

            workoutMap.set(key, {
              name: workoutName,
              date: dateMs,
              startTime: dateMs,
              duration: durationMs,
              exercises: []
            });
          }

          const workout = workoutMap.get(key);
          let exercise = workout.exercises.find(ex => ex.name === exerciseName);
          if (!exercise) {
            exercise = {
              name: exerciseName,
              bodyPart: 'Other',
              category: 'barbell',
              sets: []
            };
            workout.exercises.push(exercise);
          }

          exercise.sets.push({
            completed: true,
            weight,
            reps,
            ...(parseFloat(values[7]) ? { distance: parseFloat(values[7]) } : {}),
            ...(parseInt(values[8]) ? { duration: parseInt(values[8]) } : {})
          });
        }

        workouts = Array.from(workoutMap.values());
      }

      if (workouts.length === 0) {
        setImportResult({ success: false, message: 'No workouts found in file' });
        setImportingHistory(false);
        return;
      }

      setImportProgress({ current: 0, total: workouts.length });

      // Batch import
      const BATCH = 100;
      for (let i = 0; i < workouts.length; i += BATCH) {
        const batch = workouts.slice(i, i + BATCH);
        await workoutDb.bulkAdd(batch);
        setImportProgress({ current: Math.min(i + BATCH, workouts.length), total: workouts.length });
        await new Promise(r => setTimeout(r, 10));
      }

      // Queue for cloud sync if logged in
      if (user) {
        const allWorkouts = await workoutDb.getAll();
        for (const w of allWorkouts) {
          if (!w.cloudId) {
            await db.syncQueue.add({
              entityType: 'workout',
              entityId: w.id,
              action: 'create',
              payload: w,
              createdAt: Date.now()
            });
          }
        }
        onSyncNow?.();
      }

      onHistoryRefresh?.();
      setImportResult({ success: true, message: `Imported ${workouts.length.toLocaleString()} workouts` });
    } catch (err) {
      console.error('Import error:', err);
      setImportResult({ success: false, message: err.message });
    } finally {
      setImportingHistory(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 bg-black">
        <img src="/backgrounds/bg-7.jpg" alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 z-10 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative z-20 bg-gray-900/90 backdrop-blur-xl rounded-2xl w-full max-w-md border border-white/20 overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <Icons.X />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Account & Sync */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-3">Account & Sync</h3>
            {user ? (
              <>
                <div className="text-sm text-gray-300 mb-2">{user.email}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <SyncStatus status={syncStatus} />
                  <span>Last synced: {lastSynced ? new Date(lastSynced).toLocaleString() : 'Never'}</span>
                  {pendingCount > 0 && <span className="text-amber-400">{pendingCount} pending</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={onSyncNow} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors">
                    Sync Now
                  </button>
                  <button onClick={signOut} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors">
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded-xl font-medium transition-colors">
                Sign In to Sync
              </button>
            )}
          </div>

          {/* Data Stats */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-3">Current Data</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-cyan-400 font-bold">{workoutCount.toLocaleString()}</div>
                <div className="text-gray-500 text-xs">Workouts</div>
              </div>
              <div>
                <div className="text-cyan-400 font-bold">{exercises.length}</div>
                <div className="text-gray-500 text-xs">Exercises</div>
              </div>
              <div>
                <div className="text-cyan-400 font-bold">{templates.length}</div>
                <div className="text-gray-500 text-xs">Templates</div>
              </div>
              <div>
                <div className="text-cyan-400 font-bold">{folders.length}</div>
                <div className="text-gray-500 text-xs">Folders</div>
              </div>
            </div>
          </div>

          {/* Advanced Section - Expandable */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
              <h3 className="text-white font-medium">Advanced</h3>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdvanced && (
              <div className="px-4 pb-4 space-y-4">
                {/* Backup & Restore */}
                <div>
                  <h4 className="text-gray-400 text-sm font-medium mb-2">Backup & Restore</h4>
                  <p className="text-gray-500 text-xs mb-3">
                    Export a local backup of all data, or restore from a previous backup file.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleExport}
                      disabled={exporting}
                      className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:opacity-50 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Icons.Export />
                      {exporting ? 'Exporting...' : 'Export Backup'}
                    </button>

                    <label className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors cursor-pointer border border-white/20">
                      <Icons.Import />
                      {importing ? 'Importing...' : 'Import Backup'}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        disabled={importing}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {message && (
                    <div className={`mt-2 p-3 rounded-lg text-sm ${
                      message.type === 'success'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {message.text}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10"></div>

                {/* Import History */}
                <div>
                  <h4 className="text-gray-400 text-sm font-medium mb-2">Import Workout History</h4>
                  <p className="text-gray-500 text-xs mb-3">
                    One-time import from a Tonnage JSON export or Strong CSV export.
                  </p>
                  {importResult && (
                    <div className={`text-sm rounded-xl p-3 mb-3 ${importResult.success ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                      {importResult.message}
                    </div>
                  )}
                  <label className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors cursor-pointer border border-white/20">
                    {importingHistory ? `Importing... (${importProgress.current}/${importProgress.total})` : 'Import History File'}
                    <input type="file" accept=".json,.csv" onChange={handleHistoryImport} className="hidden" disabled={importingHistory} />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}
