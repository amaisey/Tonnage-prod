import { useState, useCallback, useRef, useEffect } from 'react';
import { Icons } from './components/Icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { defaultExercises } from './data/defaultExercises';
import { defaultFolders, sampleTemplates, TEMPLATE_VERSION } from './data/defaultTemplates';
import { WorkoutScreen } from './components/WorkoutScreen';
import { ExercisesScreen } from './components/ExercisesScreen';
import { TemplatesScreen } from './components/TemplatesScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { HistoryMigration } from './components/HistoryMigration';
import { SettingsModal } from './components/SettingsModal';
import { WorkoutCompleteModal } from './components/SharedComponents';
import { workoutDb } from './db/workoutDb';
import { usePreviousExerciseData } from './hooks/useWorkoutDb';
import { useAuth } from './hooks/useAuth';
import { useSyncManager } from './hooks/useSyncManager';
import { queueSyncEntry, directPushWorkout } from './lib/syncService';

// Update Toast Component
function UpdateToast({ onUpdate, onDismiss }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] animate-slide-down" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
      <div className="flex items-center gap-3 bg-cyan-600 text-white px-4 py-3 rounded-2xl shadow-lg shadow-black/30 border border-cyan-400/30">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="text-sm font-medium">Update available</span>
        <button onClick={onUpdate} className="bg-white text-cyan-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-cyan-50">
          Refresh
        </button>
        <button onClick={onDismiss} className="text-white/70 hover:text-white">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [exercises, setExercises] = useLocalStorage('workout-exercises', defaultExercises);
  const [templates, setTemplates] = useLocalStorage('workout-templates', sampleTemplates);
  const [folders, setFolders] = useLocalStorage('workout-folders', defaultFolders);
  const [completedWorkout, setCompletedWorkout] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isNumpadOpen, setIsNumpadOpen] = useState(false);
  const [navbarHiddenByScroll, setNavbarHiddenByScroll] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const lastScrollY = useRef(0);

  // Listen for service worker updates
  useEffect(() => {
    const handleUpdate = () => setShowUpdateToast(true);
    window.addEventListener('swUpdated', handleUpdate);
    return () => window.removeEventListener('swUpdated', handleUpdate);
  }, []);

  // Auth & Sync
  const { user, isFirstLogin, clearFirstLogin } = useAuth();
  const handleSyncDataChanged = useCallback(() => {
    // Refresh history and any other data-dependent UI after sync pulls new data
    setHistoryRefreshKey(k => k + 1);
  }, []);
  const { syncStatus, lastSynced, pendingCount, syncNow } = useSyncManager(user, isFirstLogin, clearFirstLogin, handleSyncDataChanged);

  // Bug #8: Check if default templates need updating when app loads
  useEffect(() => {
    const storedVersion = parseInt(localStorage.getItem('template-version') || '0', 10);
    if (storedVersion < TEMPLATE_VERSION) {
      // Remove old default templates (those with IDs starting with 'sbcp-', 'cc-', or 'ex-')
      setTemplates(prev => prev.filter(t => {
        const id = String(t.id);
        return !id.startsWith('sbcp-') && !id.startsWith('cc-') && !id.startsWith('ex-');
      }));
      // Remove old default folders
      setFolders(prev => prev.filter(f => {
        const id = String(f.id);
        return !id.startsWith('sbcp') && !id.startsWith('cc-') && !id.startsWith('examples');
      }));
      // Add fresh defaults
      setTemplates(prev => [...prev, ...sampleTemplates]);
      setFolders(prev => [...prev, ...defaultFolders]);
      localStorage.setItem('template-version', String(TEMPLATE_VERSION));
    }
  }, []);

  // Reset navbar and numpad state when there's no active workout (empty state shouldn't hide navbar)
  useEffect(() => {
    if (!activeWorkout) {
      setNavbarHiddenByScroll(false);
      setIsNumpadOpen(false); // Reset numpad state when workout ends
      lastScrollY.current = 0;
    }
  }, [activeWorkout]);

  // Reset navbar scroll state when switching tabs (so navbar shows at top of new tab)
  useEffect(() => {
    setNavbarHiddenByScroll(false);
    lastScrollY.current = 0;
  }, [activeTab]);

  // Scroll handler for hiding/showing navbar (only applies when there's scrollable content)
  const handleScroll = useCallback((scrollY) => {
    // Don't hide navbar if we're near the top
    if (scrollY < 50) {
      setNavbarHiddenByScroll(false);
      lastScrollY.current = scrollY;
      return;
    }

    const scrollingDown = scrollY > lastScrollY.current;
    const scrollingUp = scrollY < lastScrollY.current;

    if (scrollingDown) {
      setNavbarHiddenByScroll(true);
    } else if (scrollingUp) {
      setNavbarHiddenByScroll(false);
    }

    lastScrollY.current = scrollY;
  }, []);

  // Hook for getting previous exercise data from IndexedDB
  const { getPreviousData, clearCache } = usePreviousExerciseData();

  // Start a workout from a template (blocked if one is already active)
  const startTemplate = useCallback(async (template) => {
    if (activeWorkout) return; // Guard: don't overwrite an active workout
    // Bug #4: Auto-add template exercises not in library
    const exerciseNames = new Set(exercises.map(e => e.name));
    const newExercises = template.exercises
      .filter(ex => !exerciseNames.has(ex.name))
      .map((ex, i) => ({
        id: Date.now() + i,
        name: ex.name,
        bodyPart: ex.bodyPart,
        category: ex.category
      }));
    if (newExercises.length > 0) {
      setExercises(prev => [...prev, ...newExercises]);
      if (user) newExercises.forEach(ex => queueSyncEntry('exercise', ex.id, 'create', ex));
    }

    // Fetch previous data for all exercises in parallel
    const exercisesWithPrevData = await Promise.all(
      template.exercises.map(async (ex) => {
        const prevData = await getPreviousData(ex.name);
        // Template is the source of truth for set count, values, and rest times.
        // Previous data is only used for the PREV column display.
        const sets = ex.sets.map(s => ({ ...s, completed: false, proposed: true, manuallyEdited: false }));
        // Look up exercise library entry for its instructions (read-only how-to)
        const libraryEx = exercises.find(e => e.name === ex.name);
        return {
          ...ex,
          restTime: ex.restTime ?? 60,
          instructions: libraryEx?.instructions || '', // Exercise how-to from library (read-only)
          notes: ex.notes || '', // Template notes copied into workout as editable notes
          sets,
          previousSets: prevData?.sets
        };
      })
    );

    // Calculate estimated time if not explicitly set on template
    const estimatedTime = template.estimatedTime || Math.round(template.exercises.reduce((total, ex) => {
      const setTime = (ex.sets?.length || 3) * 45;
      const restTime = (ex.sets?.length || 3) * (ex.restTime || 60);
      return total + setTime + restTime;
    }, 0) / 60);

    setActiveWorkout({
      name: template.name,
      notes: template.notes || '',
      estimatedTime,
      exercises: exercisesWithPrevData,
      startTime: Date.now()
    });
    setActiveTab('workout');
  }, [getPreviousData, exercises, setExercises]);

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  // Finish workout and save to IndexedDB
  const finishWorkout = useCallback(async (workout) => {
    const completedWorkoutData = {
      ...workout,
      date: Date.now(),
      duration: Date.now() - workout.startTime,
    };

    try {
      // Save to IndexedDB
      const localId = await workoutDb.add(completedWorkoutData);
      // Clear the previous data cache so next workout gets fresh data
      clearCache();
      // Trigger history refresh
      setHistoryRefreshKey(k => k + 1);

      // Auto-upload to cloud immediately (bypasses queue for reliability)
      if (user) {
        directPushWorkout(user.id, completedWorkoutData, localId)
          .then(result => {
            if (result.success) {
              console.log('Workout auto-uploaded to cloud:', result.cloudId);
            } else {
              console.warn('Direct push failed, queued for retry:', result.reason);
            }
          })
          .catch(err => console.error('Auto-upload error:', err));
      }
    } catch (err) {
      console.error('Error saving workout:', err);
    }

    setCompletedWorkout(completedWorkoutData);
    setActiveWorkout(null);
  }, [clearCache, user]);

  const saveAsTemplate = (workout, name, folderId) => {
    const newTemplate = {
      id: Date.now(),
      name: name || workout.name,
      folderId: folderId || 'root',
      exercises: workout.exercises.map(ex => ({
        name: ex.name,
        bodyPart: ex.bodyPart,
        category: ex.category,
        restTime: ex.restTime,
        exerciseType: ex.exerciseType,
        supersetId: ex.supersetId,
        sets: ex.sets.filter(s => s.completed).map(s => {
          const set = { ...s };
          delete set.completed;
          delete set.completedAt;
          return set;
        })
      }))
    };
    setTemplates(prev => [...prev, newTemplate]);
    if (user) queueSyncEntry('template', newTemplate.id, 'create', newTemplate);
  };

  // Merge duplicate exercise into primary: rename in templates + history, delete duplicate
  const handleMergeExercise = useCallback(async (primaryExercise, duplicateExercise) => {
    const oldName = duplicateExercise.name;
    const newName = primaryExercise.name;

    // 1. Update templates: rename exercise references
    setTemplates(prev => {
      const updated = prev.map(template => ({
        ...template,
        exercises: template.exercises.map(ex =>
          ex.name === oldName ? { ...ex, name: newName, bodyPart: primaryExercise.bodyPart, category: primaryExercise.category } : ex
        )
      }));
      if (user) updated.forEach(t => queueSyncEntry('template', t.id, 'update', t));
      return updated;
    });

    // 2. Update workout history in IndexedDB
    try {
      const allWorkouts = await workoutDb.getAll();
      for (const workout of allWorkouts) {
        const hasMatch = workout.exercises?.some(ex => ex.name === oldName);
        if (hasMatch) {
          const updated = {
            ...workout,
            exercises: workout.exercises.map(ex =>
              ex.name === oldName ? { ...ex, name: newName } : ex
            )
          };
          await workoutDb.put(updated);
        }
      }
    } catch (err) {
      console.error('Error updating history during merge:', err);
    }

    // 3. Remove the duplicate from exercises list (use name, not id — cloud-synced exercises may have undefined ids)
    setExercises(prev => prev.filter(e => e.name !== oldName));

    // 4. Queue sync deletion so cloud copy gets soft-deleted
    if (user) queueSyncEntry('exercise', duplicateExercise.id || oldName, 'delete', duplicateExercise);

    // 5. Refresh history view
    setHistoryRefreshKey(k => k + 1);
  }, [setTemplates, setExercises, user]);

  // Refresh defaults: merge in new/updated default exercises and templates without touching user data
  const handleRefreshDefaults = useCallback(() => {
    // 1. Exercises: add any new defaults not already in the list (match by name, case-insensitive)
    const existingNames = new Set(exercises.map(e => e.name.toLowerCase()));
    const newExercises = defaultExercises.filter(de => !existingNames.has(de.name.toLowerCase()));
    if (newExercises.length > 0) {
      setExercises(prev => [...prev, ...newExercises]);
    }

    // 2. Templates & folders: remove old defaults and add fresh ones (same logic as version check)
    setTemplates(prev => {
      const userTemplates = prev.filter(t => {
        const id = String(t.id);
        return !id.startsWith('sbcp-') && !id.startsWith('cc-') && !id.startsWith('ex-');
      });
      return [...userTemplates, ...sampleTemplates];
    });
    setFolders(prev => {
      const userFolders = prev.filter(f => {
        const id = String(f.id);
        return !id.startsWith('sbcp') && !id.startsWith('cc-') && !id.startsWith('examples');
      });
      return [...userFolders, ...defaultFolders];
    });
    localStorage.setItem('template-version', String(TEMPLATE_VERSION));

    return { newExercises: newExercises.length };
  }, [exercises, setExercises, setTemplates, setFolders]);

  // Handle restoring data from backup
  const handleRestoreData = useCallback((data) => {
    if (data.exercises?.length > 0) setExercises(data.exercises);
    if (data.templates?.length > 0) setTemplates(data.templates);
    if (data.folders?.length > 0) setFolders(data.folders);
    // Refresh history view
    setHistoryRefreshKey(k => k + 1);
  }, [setExercises, setTemplates, setFolders]);

  const tabs = [
    { id: 'workout', icon: Icons.Dumbbell, label: 'Workout' },
    { id: 'exercises', icon: Icons.List, label: 'Exercises' },
    { id: 'templates', icon: Icons.Template, label: 'Templates' },
    { id: 'history', icon: Icons.History, label: 'History' },
    { id: 'settings', icon: Icons.Settings, label: 'Settings' },
  ];

  // Hide navbar on scroll (any tab), numpad, or fullscreen modals
  const shouldHideNavbar = isNumpadOpen || navbarHiddenByScroll || isHistoryModalOpen || isTemplatesModalOpen;

  return (
    <HistoryMigration>
      <div className="w-full h-[100dvh] bg-black flex flex-col overflow-hidden" style={{ overscrollBehavior: 'none' }}>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeTab === 'workout' && (
            <WorkoutScreen
              activeWorkout={activeWorkout}
              setActiveWorkout={setActiveWorkout}
              onFinish={finishWorkout}
              onCancel={cancelWorkout}
              exercises={exercises}
              getPreviousData={getPreviousData}
              onNumpadStateChange={setIsNumpadOpen}
              onScroll={handleScroll}
            />
          )}
          {activeTab === 'exercises' && (
            <ExercisesScreen
              exercises={exercises}
              templates={templates}
              onAddExercise={ex => {
                setExercises([...exercises, ex]);
                if (user) queueSyncEntry('exercise', ex.id, 'create', ex);
              }}
              onUpdateExercise={ex => {
                setExercises(exercises.map(e => e.id === ex.id ? ex : e));
                if (user) queueSyncEntry('exercise', ex.id, 'update', ex);
              }}
              onDeleteExercise={id => {
                const exerciseToDelete = exercises.find(e => e.id === id);
                setExercises(exercises.filter(e => e.id !== id));
                if (user) queueSyncEntry('exercise', id, 'delete', exerciseToDelete || {});
              }}
              onMergeExercise={handleMergeExercise}
              onScroll={handleScroll}
            />
          )}
          {activeTab === 'templates' && (
            <TemplatesScreen
              templates={templates}
              folders={folders}
              onStartTemplate={startTemplate}
              hasActiveWorkout={!!activeWorkout}
              onImport={t => {
                setTemplates(prev => [...prev, t]);
                if (user) queueSyncEntry('template', t.id, 'create', t);
              }}
              onBulkImport={arr => {
                setTemplates(prev => [...prev, ...arr]);
                if (user) arr.forEach(t => queueSyncEntry('template', t.id, 'create', t));
              }}
              onUpdateTemplate={t => {
                setTemplates(prev => prev.map(x => x.id === t.id ? t : x));
                if (user) queueSyncEntry('template', t.id, 'update', t);
              }}
              onDeleteTemplate={id => {
                setTemplates(prev => prev.filter(t => t.id !== id));
                if (user) queueSyncEntry('template', id, 'delete', {});
              }}
              onAddFolder={f => {
                setFolders(prev => [...prev, f]);
                if (user) queueSyncEntry('folder', f.id, 'create', f);
              }}
              onBulkAddFolders={arr => {
                setFolders(prev => [...prev, ...arr]);
                if (user) arr.forEach(f => queueSyncEntry('folder', f.id, 'create', f));
              }}
              onUpdateFolder={f => {
                setFolders(prev => prev.map(x => x.id === f.id ? f : x));
                if (user) queueSyncEntry('folder', f.id, 'update', f);
              }}
              onDeleteFolder={id => {
                setFolders(prev => prev.filter(f => f.id !== id));
                if (user) queueSyncEntry('folder', id, 'delete', {});
              }}
              onAddExercises={arr => {
                setExercises(prev => [...prev, ...arr]);
                if (user) arr.forEach(ex => queueSyncEntry('exercise', ex.id, 'create', ex));
              }}
              exercises={exercises}
              onModalStateChange={setIsTemplatesModalOpen}
              onScroll={handleScroll}
            />
          )}
          {activeTab === 'history' && (
            <HistoryScreen
              onRefreshNeeded={historyRefreshKey}
              onModalStateChange={setIsHistoryModalOpen}
              onScroll={handleScroll}
            />
          )}
        </div>

        {!shouldHideNavbar && (
          <div className="fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
            <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-lg shadow-black/20">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = tab.id === 'settings' ? showSettings : activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'settings') {
                        setShowSettings(true);
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`flex flex-col items-center px-3 py-1.5 rounded-full transition-all ${isActive ? 'text-cyan-400 bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Icon />
                    <span className={`text-[9px] mt-0.5 ${isActive ? 'text-cyan-400' : ''}`}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {completedWorkout && (
          <WorkoutCompleteModal
            workout={completedWorkout}
            onClose={() => setCompletedWorkout(null)}
            onSaveAsTemplate={saveAsTemplate}
          />
        )}

        {showUpdateToast && (
          <UpdateToast
            onUpdate={() => window.location.reload()}
            onDismiss={() => setShowUpdateToast(false)}
          />
        )}

        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            exercises={exercises}
            templates={templates}
            folders={folders}
            onRestoreData={handleRestoreData}
            onRefreshDefaults={handleRefreshDefaults}
            user={user}
            syncStatus={syncStatus}
            lastSynced={lastSynced}
            pendingCount={pendingCount}
            onSyncNow={syncNow}
            onHistoryRefresh={() => setHistoryRefreshKey(k => k + 1)}
          />
        )}
      </div>
    </HistoryMigration>
  );
}

export default App;
