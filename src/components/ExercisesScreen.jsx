import { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { BODY_PARTS, CATEGORIES, BAND_COLORS, EXERCISE_TYPES } from '../data/constants';
import { formatDuration, getDefaultSetForCategory } from '../utils/helpers';
import { EditExerciseModal, ExerciseSearchModal, ExerciseDetailModal, MergeExerciseModal } from './SharedComponents';
import { workoutDb } from '../db/workoutDb';

const ExercisesScreen = ({ exercises, onAddExercise, onUpdateExercise, onDeleteExercise, onMergeExercise, onScroll, navVisible, templates }) => {
  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('All');
  const [editingExercise, setEditingExercise] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [mergingExercise, setMergingExercise] = useState(null);
  const [history, setHistory] = useState([]);

  // Load history from IndexedDB when component mounts
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const workouts = await workoutDb.getAll();
        workouts.sort((a, b) => (b.date || b.startTime) - (a.date || a.startTime));
        setHistory(workouts);
      } catch (err) {
        console.error('Error loading history:', err);
      }
    };
    loadHistory();
  }, []);

  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesBodyPart = selectedBodyPart === 'All' || ex.bodyPart === selectedBodyPart;
    return matchesSearch && matchesBodyPart;
  });

  const grouped = filtered.reduce((acc, ex) => {
    if (!acc[ex.bodyPart]) acc[ex.bodyPart] = [];
    acc[ex.bodyPart].push(ex);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Background Image - fixed position */}
      <div className="fixed inset-0 z-0 bg-black">
        <img src="/backgrounds/bg-2.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Exercises</h2>
            <button onClick={() => setShowCreate(true)} className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 flex items-center gap-2 border border-white/30">
              <Icons.Plus /> New
            </button>
          </div>
          <div className="relative mb-3">
            <input type="text" placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 placeholder-white/50" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"><Icons.Search /></span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            {['All', ...BODY_PARTS].map(bp => (
              <button key={bp} onClick={() => setSelectedBodyPart(bp)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${selectedBodyPart === bp ? 'bg-white/30 text-white border border-white/40' : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'}`}>
                {bp}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
            overscrollBehavior: 'contain'
          }}
          onScroll={(e) => onScroll?.(e.target.scrollTop)}
        >
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([bodyPart, exs]) => (
            <div key={bodyPart} className="mb-6">
              <h3 className="text-sm font-semibold text-teal-400/80 mb-2">{bodyPart}</h3>
              {exs.map(ex => (
                <button key={ex.id} onClick={() => setSelectedExercise(ex)}
                  className="w-full flex items-center justify-between p-3 bg-gray-900/80 rounded-xl mb-2 hover:bg-gray-800 text-left border border-gray-800/50 hover:border-cyan-800/30">
                  <div>
                    <div className="font-medium text-white">{ex.name}</div>
                    <div className="text-xs text-gray-400">{CATEGORIES[ex.category]?.label}</div>
                  </div>
                  <span className="text-cyan-500/50"><Icons.ChevronRight /></span>
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center text-gray-400 py-8">No exercises found</div>}
        </div>
      </div>

      {showCreate && <EditExerciseModal onSave={onAddExercise} onClose={() => setShowCreate(false)} />}
      {editingExercise && <EditExerciseModal exercise={editingExercise} onSave={onUpdateExercise} onClose={() => setEditingExercise(null)} />}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          history={history}
          templates={templates}
          onEdit={() => { setEditingExercise(selectedExercise); setSelectedExercise(null); }}
          onMerge={() => { setMergingExercise(selectedExercise); setSelectedExercise(null); }}
          onDelete={(id) => { onDeleteExercise(id); setSelectedExercise(null); }}
          onClose={() => setSelectedExercise(null)}
        />
      )}
      {mergingExercise && (
        <MergeExerciseModal
          exercise={mergingExercise}
          allExercises={exercises}
          onMerge={(primary, duplicate) => {
            onMergeExercise(primary, duplicate);
            setMergingExercise(null);
          }}
          onClose={() => setMergingExercise(null)}
        />
      )}
    </div>
  );
};

// Import Modal with error handling
const ImportModal = ({ folders, currentFolderId, onAddFolder, onBulkAddFolders, onImport, onBulkImport, onUpdateTemplate, onAddExercises, existingExercises, existingTemplates, onClose }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addNewExercises, setAddNewExercises] = useState(true);
  const [pendingImport, setPendingImport] = useState(null);

  const getOrCreateFolderByPath = (folderPath, allFolders, newFoldersToAdd) => {
    if (!folderPath) return currentFolderId;
    const parts = folderPath.split('/').filter(p => p.trim());
    let parentId = 'root';
    for (const part of parts) {
      const existing = allFolders.find(f => f.name === part.trim() && f.parentId === parentId);
      if (existing) {
        parentId = existing.id;
      } else {
        const newFolder = { id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: part.trim(), parentId };
        newFoldersToAdd.push(newFolder);
        allFolders.push(newFolder);
        parentId = newFolder.id;
      }
    }
    return parentId;
  };

  const collectNewExercises = (templates) => {
    const newExercises = [];
    const existingNames = new Set(existingExercises.map(e => e.name.toLowerCase()));
    const addedNames = new Set();
    templates.forEach(t => {
      t.exercises?.forEach(ex => {
        const nameLower = ex.name.toLowerCase();
        if (!existingNames.has(nameLower) && !addedNames.has(nameLower)) {
          newExercises.push({ id: Date.now() + Math.random(), name: ex.name, bodyPart: ex.bodyPart || 'Other', category: ex.category || 'machine' });
          addedNames.add(nameLower);
        }
      });
    });
    return newExercises;
  };

  const getFolderPath = (folderId, allFolders) => {
    if (!folderId || folderId === 'root') return '';
    const parts = [];
    let current = allFolders.find(f => f.id === folderId);
    while (current) {
      parts.unshift(current.name);
      current = allFolders.find(f => f.id === current.parentId);
    }
    return parts.join('/');
  };

  // Bug #16: Handle file picker for template import
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      setText(content);
      setError('');
    } catch (err) {
      setError('Failed to read file: ' + err.message);
    }
  };

  // Bug #16: Sanitize smart quotes and other iOS text substitutions before JSON parse
  const sanitizeJSON = (input) => {
    return input
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')  // Smart double quotes → straight
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")  // Smart single quotes → straight
      .replace(/\u2014/g, '-')  // Em dash → hyphen
      .replace(/\u2013/g, '-')  // En dash → hyphen
      .replace(/\u2026/g, '...'); // Ellipsis → three dots
  };

  const handleImport = () => {
    setError(''); setSuccess(''); setPendingImport(null);
    if (!text.trim()) { setError('Please paste JSON data'); return; }
    try {
      const sanitized = sanitizeJSON(text);
      const data = JSON.parse(sanitized);
      let allFolders = [...folders];
      let newFoldersToAdd = [];
      const processTemplates = (templatesData) => {
        const duplicates = [];
        const newTemplates = [];
        templatesData.forEach(t => {
          if (t.name && t.exercises) {
            const folderId = getOrCreateFolderByPath(t.folder, allFolders, newFoldersToAdd);
            const templateData = { ...t, folderId, folder: undefined };
            const existing = existingTemplates.find(et => et.name.toLowerCase() === t.name.toLowerCase() && et.folderId === folderId);
            if (existing) {
              duplicates.push({ existing, incoming: templateData, folder: t.folder || getFolderPath(folderId, allFolders) });
            } else {
              newTemplates.push({ ...templateData, id: Date.now() + Math.random() });
            }
          }
        });
        return { duplicates, newTemplates };
      };
      let templatesData = [];
      if (data.templates && Array.isArray(data.templates)) { templatesData = data.templates; }
      else if (data.name && data.exercises) {
        if (!Array.isArray(data.exercises)) { setError('"exercises" must be an array'); return; }
        templatesData = [data];
      } else { setError('JSON must have "name" and "exercises" fields, or be a bulk import with "templates" array'); return; }
      const { duplicates, newTemplates } = processTemplates(templatesData);
      const exercisesToAdd = addNewExercises ? collectNewExercises(templatesData) : [];
      if (duplicates.length > 0) { setPendingImport({ duplicates, newTemplates, foldersToAdd: newFoldersToAdd, exercisesToAdd }); }
      else { executeImport(newTemplates, [], newFoldersToAdd, exercisesToAdd); }
    } catch (err) { setError(`Invalid JSON: ${err.message}. If you copied from a phone, try using the "Choose File" option instead.`); }
  };

  const executeImport = (newTemplates, templatesToUpdate, foldersToAdd, exercisesToAdd) => {
    const actualNewFolders = foldersToAdd.filter(newFolder => !folders.some(existingFolder => existingFolder.name === newFolder.name && existingFolder.parentId === newFolder.parentId));
    if (actualNewFolders.length > 0) onBulkAddFolders(actualNewFolders);
    const actualNewExercises = exercisesToAdd.filter(newEx => !existingExercises.some(ex => ex.name.toLowerCase() === newEx.name.toLowerCase()));
    if (actualNewExercises.length > 0) onAddExercises(actualNewExercises);
    templatesToUpdate.forEach(t => onUpdateTemplate(t));
    if (newTemplates.length > 0) onBulkImport(newTemplates);
    const total = newTemplates.length + templatesToUpdate.length;
    const updateInfo = templatesToUpdate.length > 0 ? ` (${templatesToUpdate.length} updated)` : '';
    setSuccess(`Imported ${total} template(s)${updateInfo}!`);
    setPendingImport(null);
    setTimeout(onClose, 1500);
  };

  const handleConfirmOverride = () => {
    if (!pendingImport) return;
    const templatesToUpdate = pendingImport.duplicates.map(d => ({ ...d.incoming, id: d.existing.id }));
    executeImport(pendingImport.newTemplates, templatesToUpdate, pendingImport.foldersToAdd, pendingImport.exercisesToAdd);
  };

  const handleSkipDuplicates = () => {
    if (!pendingImport) return;
    executeImport(pendingImport.newTemplates, [], pendingImport.foldersToAdd, pendingImport.exercisesToAdd);
  };

  if (pendingImport) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Duplicates Found</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
          </div>
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 mb-4">
            <div className="text-sm text-amber-400">⚠️ {pendingImport.duplicates.length} template(s) already exist with the same name and folder:</div>
          </div>
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {pendingImport.duplicates.map((d, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3">
                <div className="font-medium text-white">{d.incoming.name}</div>
                <div className="text-xs text-gray-400">{d.folder || 'Root'}</div>
              </div>
            ))}
          </div>
          {pendingImport.newTemplates.length > 0 && (
            <div className="text-sm text-gray-400 mb-4">+ {pendingImport.newTemplates.length} new template(s) will be added regardless.</div>
          )}
          <div className="space-y-2">
            <button onClick={handleConfirmOverride} className="w-full bg-amber-600 text-white py-3 rounded-xl font-medium hover:bg-amber-700">Override Existing ({pendingImport.duplicates.length})</button>
            <button onClick={handleSkipDuplicates} className="w-full bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600">Skip Duplicates{pendingImport.newTemplates.length > 0 ? ` (Import ${pendingImport.newTemplates.length} New Only)` : ''}</button>
            <button onClick={() => setPendingImport(null)} className="w-full text-gray-400 py-2 text-sm hover:text-white">← Back to Edit</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Import Workouts</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Paste a single workout or bulk import with folders.</p>
        {error && <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-3"><div className="text-sm text-red-400">❌ {error}</div></div>}
        {success && <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 mb-3"><div className="text-sm text-green-400">✅ {success}</div></div>}
        {/* Bug #16: File picker for template import (avoids mobile paste issues) */}
        <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-600 hover:border-teal-500 cursor-pointer bg-gray-800/50 mb-3 transition-colors">
          <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
          <Icons.Import />
          <span className="text-sm text-gray-400">Choose JSON File</span>
        </label>
        <textarea value={text} onChange={e => { setText(e.target.value); setError(''); }} placeholder='{"name": "Push Day", "exercises": [...]}'
          className="flex-1 min-h-[200px] bg-gray-800 text-white p-3 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-600 resize-none mb-3" />
        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input type="checkbox" checked={addNewExercises} onChange={e => setAddNewExercises(e.target.checked)} className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-rose-600 focus:ring-rose-600" />
          <span className="text-sm text-gray-300">Add new exercises to database</span>
        </label>
        <button onClick={handleImport} className="w-full bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800">Import</button>
      </div>
    </div>
  );
};

// Create Template Modal
const CreateTemplateModal = ({ folderId, allExercises, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [templateExercises, setTemplateExercises] = useState([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const addExercises = (exercises, asSuperset) => {
    if (asSuperset && exercises.length >= 2) {
      const supersetId = `superset-${Date.now()}`;
      const newExercises = exercises.map(ex => ({ ...ex, supersetId, restTime: 60, sets: [getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category)] }));
      setTemplateExercises([...templateExercises, ...newExercises]);
    } else {
      const newExercises = exercises.map(ex => ({ ...ex, restTime: 60, sets: [getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category)] }));
      setTemplateExercises([...templateExercises, ...newExercises]);
    }
    setShowExercisePicker(false);
  };

  const addSingleExercise = (exercise) => addExercises([exercise], false);
  const updateSetCount = (exIndex, count) => {
    const updated = [...templateExercises];
    const exercise = updated[exIndex];
    const currentCount = exercise.sets.length;
    if (count > currentCount) { for (let i = 0; i < count - currentCount; i++) { exercise.sets.push(getDefaultSetForCategory(exercise.category)); } }
    else { exercise.sets = exercise.sets.slice(0, count); }
    setTemplateExercises(updated);
  };
  const removeExercise = (index) => { setTemplateExercises(templateExercises.filter((_, i) => i !== index)); };
  const unlinkSuperset = (index) => { const updated = [...templateExercises]; delete updated[index].supersetId; setTemplateExercises(updated); };
  const updateRestTime = (exIndex, restTime) => { const updated = [...templateExercises]; updated[exIndex].restTime = restTime; setTemplateExercises(updated); };

  const handleSave = () => {
    if (!name.trim() || templateExercises.length === 0) return;
    onSave({
      id: Date.now(), name: name.trim(), folderId,
      exercises: templateExercises.map(ex => ({
        name: ex.name, bodyPart: ex.bodyPart, category: ex.category, supersetId: ex.supersetId, restTime: ex.restTime || 60,
        sets: ex.sets.map(s => { const newSet = {}; Object.keys(s).forEach(k => { if (k !== 'completed') newSet[k] = s[k] || 0; }); return newSet; })
      }))
    });
    onClose();
  };

  const getGroupedExercises = () => {
    const groups = []; const used = new Set();
    templateExercises.forEach((ex, idx) => {
      if (used.has(idx)) return;
      if (ex.supersetId) {
        const supersetExercises = [];
        templateExercises.forEach((e, i) => { if (e.supersetId === ex.supersetId) { supersetExercises.push({ exercise: e, index: i }); used.add(i); } });
        groups.push({ type: 'superset', exercises: supersetExercises, supersetId: ex.supersetId });
      } else { groups.push({ type: 'single', exercise: ex, index: idx }); used.add(idx); }
    });
    return groups;
  };

  const restTimePresets = [30, 60, 90, 120, 180];
  const renderExerciseItem = (ex, i, isSuperset = false) => (
    <div key={i} className={`bg-gray-800/50 p-3 ${isSuperset ? 'border-l-4 border-teal-500' : 'rounded-xl'} mb-2`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isSuperset && <div className="w-1 h-6 bg-teal-500 rounded-full" />}
          <div>
            <div className="font-medium text-white text-sm">{ex.name}</div>
            <div className="text-xs text-gray-400">{ex.bodyPart} • {CATEGORIES[ex.category]?.label}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isSuperset && <button onClick={() => unlinkSuperset(i)} className="text-teal-400 hover:text-teal-300 p-1" title="Unlink"><Icons.Link /></button>}
          <button onClick={() => removeExercise(i)} className="text-red-400 hover:text-red-300 p-1"><Icons.Trash /></button>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-400">Sets:</span>
        <div className="flex gap-1">{[1, 2, 3, 4, 5].map(n => (<button key={n} onClick={() => updateSetCount(i, n)} className={`w-8 h-8 rounded-lg text-sm font-medium ${ex.sets.length === n ? 'bg-rose-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{n}</button>))}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Rest:</span>
        <div className="flex gap-1">{restTimePresets.map(t => (<button key={t} onClick={() => updateRestTime(i, t)} className={`px-2 py-1 rounded text-xs font-medium ${(ex.restTime || 60) === t ? 'bg-rose-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{formatDuration(t)}</button>))}</div>
      </div>
    </div>
  );

  const groups = getGroupedExercises();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">New Template</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Template name" className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 mb-4" />
          <div className="text-sm text-gray-400 mb-2">Exercises ({templateExercises.length})</div>
          {groups.map((group, gIdx) => {
            if (group.type === 'superset') {
              return (<div key={group.supersetId} className="mb-3"><div className="flex items-center gap-2 mb-1"><Icons.Link /><span className="text-xs font-medium text-teal-400 uppercase">Superset</span></div><div className="rounded-xl overflow-hidden">{group.exercises.map(({ exercise, index }) => renderExerciseItem(exercise, index, true))}</div></div>);
            }
            return renderExerciseItem(group.exercise, group.index, false);
          })}
          <button onClick={() => setShowExercisePicker(true)} className="w-full bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl p-4 text-gray-400 hover:border-rose-700 hover:text-rose-400 flex items-center justify-center gap-2 text-sm"><Icons.Plus /> Add Exercise</button>
        </div>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleSave} disabled={!name.trim() || templateExercises.length === 0} className="w-full bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed">Create Template</button>
        </div>
      </div>
      {showExercisePicker && (<ExerciseSearchModal exercises={allExercises} onSelect={addSingleExercise} onSelectMultiple={addExercises} onClose={() => setShowExercisePicker(false)} />)}
    </div>
  );
};

export { ExercisesScreen, CreateTemplateModal, ImportModal };
