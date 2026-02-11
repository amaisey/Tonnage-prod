import { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { workoutDb } from '../db/workoutDb';
import { defaultExercises } from '../data/defaultExercises';

export function SettingsModal({ onClose, exercises, templates, folders, onRestoreData, onRefreshDefaults }) {
  const [message, setMessage] = useState(null);
  const [workoutCount, setWorkoutCount] = useState(0);

  // Get workout count on mount
  useEffect(() => {
    workoutDb.count().then(setWorkoutCount);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <Icons.X />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Status message */}
          {message && (
            <div className={`rounded-xl p-3 text-sm ${message.type === 'error' ? 'bg-red-900/50 text-red-300 border border-red-500/30' : 'bg-green-900/50 text-green-300 border border-green-500/30'}`}>
              {message.text}
            </div>
          )}

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

          {/* Refresh Defaults */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-2">Refresh Defaults</h3>
            <p className="text-gray-500 text-xs mb-3">
              Adds any new built-in exercises to your library and resets default templates/folders to the latest versions. Your custom exercises, custom templates, and workout history stay untouched. This does not update app code — redeploy the app for code changes.
            </p>
            <button
              onClick={() => {
                try {
                  const result = onRefreshDefaults();
                  const parts = [];
                  if (result.newExercises > 0) parts.push(`${result.newExercises} new exercises added`);
                  parts.push('default templates & folders refreshed');
                  setMessage({ type: 'success', text: parts.join(', ') });
                } catch (err) {
                  setMessage({ type: 'error', text: 'Refresh failed: ' + err.message });
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-cyan-700 hover:bg-cyan-800 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Refresh Defaults
            </button>
          </div>

          {/* Reset App Data */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-2">Reset App</h3>
            <p className="text-gray-500 text-xs mb-3">
              Clears all local data (exercises, templates, folders, history) and reloads with defaults. This cannot be undone.
            </p>
            <button
              onClick={async () => {
                if (!confirm('This will permanently delete ALL your data — exercises, templates, folders, and workout history. Continue?')) return;
                try {
                  // Clear IndexedDB (workout history)
                  await workoutDb.clear();
                  // Clear all localStorage keys used by the app
                  localStorage.removeItem('workout-exercises');
                  localStorage.removeItem('workout-templates');
                  localStorage.removeItem('workout-folders');
                  localStorage.removeItem('compactMode');
                  localStorage.removeItem('template-version');
                  setMessage({ type: 'success', text: 'Data cleared. Reloading...' });
                  setTimeout(() => window.location.reload(), 1000);
                } catch (err) {
                  setMessage({ type: 'error', text: 'Reset failed: ' + err.message });
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Reset All Data
            </button>
          </div>

          {/* Export Custom Exercises */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-2">Custom Exercises</h3>
            <p className="text-gray-500 text-xs mb-3">
              Export exercises you've added or modified (excludes built-in defaults). Use this to feed back into the app's exercise database.
            </p>
            <button
              onClick={() => {
                const defaultNames = new Set(defaultExercises.map(e => e.name));
                const customExercises = exercises.filter(e => !defaultNames.has(e.name));
                if (customExercises.length === 0) {
                  setMessage({ type: 'error', text: 'No custom exercises found. All exercises are defaults.' });
                  return;
                }
                try {
                  const blob = new Blob([JSON.stringify(customExercises, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  // Use window.open as primary (works in iOS PWA), fall back to anchor click
                  const opened = window.open(url, '_blank');
                  if (!opened) {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `custom-exercises-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }
                  setTimeout(() => URL.revokeObjectURL(url), 5000);
                  setMessage({ type: 'success', text: `Exported ${customExercises.length} custom exercises` });
                } catch (err) {
                  setMessage({ type: 'error', text: 'Export failed: ' + err.message });
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              <Icons.Export />
              Export Custom Exercises
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
