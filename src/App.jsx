import { useState, useCallback, useRef, useEffect } from 'react';
import { Icons } from './components/Icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { defaultExercises } from './data/defaultExercises';
import { defaultFolders, sampleTemplates } from './data/defaultTemplates';
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
import { queueSyncEntry } from './lib/syncService';

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
  const [compactMode, setCompactMode] = useLocalStorage('compactMode', false);
  const lastScrollY = useRef(0);

  // Auth & Sync
  const { user, isFirstLogin, clearFirstLogin } = useAuth();
  const { syncStatus, lastSynced, pendingCount, syncNow } = useSyncManager(user, isFirstLogin, clearFirstLogin);

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

  // Start a workout from a template
  const startTemplate = useCallback(async (template) => {
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
        // Mark all pre-filled values as proposed (50% opacity) until user edits them
        const sets = prevData?.sets?.length > 0
          ? prevData.sets.map(s => ({ ...s, completed: false, completedAt: undefined, proposed: true, manuallyEdited: false }))
          : ex.sets.map(s => ({ ...s, completed: false, proposed: true, manuallyEdited: false }));
        return {
          ...ex,
          // Use previous rest time if available, otherwise template's, otherwise default
          restTime: prevData?.restTime || ex.restTime || 90,
          // Preserve previous notes if they exist
          notes: prevData?.notes || ex.notes || '',
          sets,
          previousSets: prevData?.sets
        };
      })
    );

    setActiveWorkout({
      name: template.name,
      notes: template.notes || '', // Bug #5: Pass template notes to workout
      estimatedTime: template.estimatedTime, // For pace tracking (Bug #15)
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

      // Queue for cloud sync if logged in
      if (user) {
        await queueSyncEntry('workout', localId, 'create', completedWorkoutData);
        syncNow();
      }
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

  // Hide navbar when numpad is open, scrolling down, or history modal is open
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
              compactMode={compactMode}
            />
          )}
          {activeTab === 'exercises' && (
            <ExercisesScreen
              exercises={exercises}
              onAddExercise={ex => setExercises([...exercises, ex])}
              onUpdateExercise={ex => setExercises(exercises.map(e => e.id === ex.id ? ex : e))}
              onDeleteExercise={id => setExercises(exercises.filter(e => e.id !== id))}
              onScroll={handleScroll}
              navVisible={!shouldHideNavbar}
            />
          )}
          {activeTab === 'templates' && (
            <TemplatesScreen
              templates={templates}
              folders={folders}
              onStartTemplate={startTemplate}
              onImport={t => setTemplates(prev => [...prev, t])}
              onBulkImport={arr => setTemplates(prev => [...prev, ...arr])}
              onUpdateTemplate={t => setTemplates(prev => prev.map(x => x.id === t.id ? t : x))}
              onDeleteTemplate={id => setTemplates(prev => prev.filter(t => t.id !== id))}
              onAddFolder={f => setFolders(prev => [...prev, f])}
              onBulkAddFolders={arr => setFolders(prev => [...prev, ...arr])}
              onDeleteFolder={id => setFolders(prev => prev.filter(f => f.id !== id))}
              onAddExercises={arr => setExercises(prev => [...prev, ...arr])}
              exercises={exercises}
              onScroll={handleScroll}
              navVisible={!shouldHideNavbar}
              onModalStateChange={setIsTemplatesModalOpen}
            />
          )}
          {activeTab === 'history' && (
            <HistoryScreen
              onRefreshNeeded={historyRefreshKey}
              onScroll={handleScroll}
              navVisible={!shouldHideNavbar}
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
            compactMode={compactMode}
            setCompactMode={setCompactMode}
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
