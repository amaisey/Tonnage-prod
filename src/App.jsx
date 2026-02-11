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
  // Bug #3: Compact mode
  const [compactMode, setCompactMode] = useLocalStorage('compactMode', false);
  const lastScrollY = useRef(0);

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
    }

    // Fetch previous data for all exercises in parallel
    const exercisesWithPrevData = await Promise.all(
      template.exercises.map(async (ex) => {
        const prevData = await getPreviousData(ex.name);
        // Template is the source of truth for set count, values, and rest times.
        // Previous data is only used for the PREV column display.
        const sets = ex.sets.map(s => ({ ...s, completed: false, proposed: true, manuallyEdited: false }));
        return {
          ...ex,
          restTime: ex.restTime ?? 60,
          notes: ex.notes || '',
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
      await workoutDb.add(completedWorkoutData);
      // Clear the previous data cache so next workout gets fresh data
      clearCache();
      // Trigger history refresh
      setHistoryRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Error saving workout:', err);
    }

    setCompletedWorkout(completedWorkoutData);
    setActiveWorkout(null);
  }, [clearCache]);

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
  };

  // Merge duplicate exercise into primary: rename in templates + history, delete duplicate
  const handleMergeExercise = useCallback(async (primaryExercise, duplicateExercise) => {
    const oldName = duplicateExercise.name;
    const newName = primaryExercise.name;

    // 1. Update templates: rename exercise references
    setTemplates(prev => prev.map(template => ({
      ...template,
      exercises: template.exercises.map(ex =>
        ex.name === oldName ? { ...ex, name: newName, bodyPart: primaryExercise.bodyPart, category: primaryExercise.category } : ex
      )
    })));

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

    // 3. Remove the duplicate from exercises list
    setExercises(prev => prev.filter(e => e.id !== duplicateExercise.id));

    // 4. Refresh history view
    setHistoryRefreshKey(k => k + 1);
  }, [setTemplates, setExercises]);

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

  // Hide navbar only during active workout interactions (numpad, scroll) or when modals are fullscreen
  const shouldHideNavbar = isNumpadOpen || (navbarHiddenByScroll && activeTab === 'workout') || isHistoryModalOpen || isTemplatesModalOpen;

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
              compactMode={compactMode}
            />
          )}
          {activeTab === 'exercises' && (
            <ExercisesScreen
              exercises={exercises}
              onAddExercise={ex => setExercises([...exercises, ex])}
              onUpdateExercise={ex => setExercises(exercises.map(e => e.id === ex.id ? ex : e))}
              onDeleteExercise={id => setExercises(exercises.filter(e => e.id !== id))}
              onMergeExercise={handleMergeExercise}
            />
          )}
          {activeTab === 'templates' && (
            <TemplatesScreen
              templates={templates}
              folders={folders}
              onStartTemplate={startTemplate}
              hasActiveWorkout={!!activeWorkout}
              onImport={t => setTemplates(prev => [...prev, t])}
              onBulkImport={arr => setTemplates(prev => [...prev, ...arr])}
              onUpdateTemplate={t => setTemplates(prev => prev.map(x => x.id === t.id ? t : x))}
              onDeleteTemplate={id => setTemplates(prev => prev.filter(t => t.id !== id))}
              onAddFolder={f => setFolders(prev => [...prev, f])}
              onBulkAddFolders={arr => setFolders(prev => [...prev, ...arr])}
              onDeleteFolder={id => setFolders(prev => prev.filter(f => f.id !== id))}
              onAddExercises={arr => setExercises(prev => [...prev, ...arr])}
              exercises={exercises}
              onModalStateChange={setIsTemplatesModalOpen}
            />
          )}
          {activeTab === 'history' && (
            <HistoryScreen
              onRefreshNeeded={historyRefreshKey}
              onModalStateChange={setIsHistoryModalOpen}
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

        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            exercises={exercises}
            templates={templates}
            folders={folders}
            onRestoreData={handleRestoreData}
            onRefreshDefaults={handleRefreshDefaults}
          />
        )}
      </div>
    </HistoryMigration>
  );
}

export default App;
