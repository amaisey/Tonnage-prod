import { useState, useEffect, useRef, Fragment } from 'react';
import { Icons } from './Icons';
import { BODY_PARTS, CATEGORIES, BAND_COLORS, EXERCISE_TYPES, EXERCISE_PHASES } from '../data/constants';
import { formatDuration, getDefaultSetForCategory, generateTemplateAIExport, generateTemplateAIBoilerplate, generateTemplateSummary } from '../utils/helpers';
import { ExerciseSearchModal, CreateFolderModal } from './SharedComponents';
import { CreateTemplateModal, ImportModal } from './ExercisesScreen';

// Template Detail Modal - shows full template when clicking on summary
const TemplateDetailModal = ({ template, onClose, onStart, onEdit, hasActiveWorkout }) => {
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [copySuccess, setCopySuccess] = useState(''); // '' | 'ai' | 'text'

  const copyToClipboard = async (type) => {
    try {
      const text = type === 'ai' ? generateTemplateAIExport(template) : generateTemplateSummary(template);
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const togglePhase = (phase) => {
    setCollapsedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  // Group exercises by phase
  const getExercisesByPhase = () => {
    const phases = { warmup: [], workout: [], cooldown: [] };
    template.exercises.forEach((ex, idx) => {
      const phase = ex.phase || 'workout';
      phases[phase].push({ exercise: ex, index: idx });
    });
    return phases;
  };

  const exercisesByPhase = getExercisesByPhase();

  const getPhaseTime = (exercises) => {
    return exercises.reduce((total, { exercise }) => {
      const setTime = (exercise.sets?.length || 3) * 45;
      const restTime = (exercise.sets?.length || 3) * (exercise.restTime || 90);
      return total + setTime + restTime;
    }, 0);
  };

  const totalEstimatedTime = template.estimatedTime ||
    Math.round((getPhaseTime(exercisesByPhase.warmup) + getPhaseTime(exercisesByPhase.workout) + getPhaseTime(exercisesByPhase.cooldown)) / 60);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img src="/backgrounds/bg-3.jpg" alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="shrink-0 p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
          <h3 className="text-lg font-semibold text-white">{template.name}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => copyToClipboard('text')} className="text-gray-400 hover:text-white p-2" title="Copy summary">
              {copySuccess === 'text' ? <span className="text-green-400 text-xs font-medium">Copied!</span> : <Icons.Copy />}
            </button>
            <button onClick={() => copyToClipboard('ai')} className="text-gray-400 hover:text-white p-2" title="Copy JSON for AI">
              {copySuccess === 'ai' ? <span className="text-green-400 text-xs font-medium">Copied!</span> : <Icons.Code />}
            </button>
            <button onClick={() => { onEdit(template); onClose(); }} className="text-cyan-400 hover:text-cyan-300 p-2">
              <Icons.Edit />
            </button>
            <button
              onClick={() => { if (!hasActiveWorkout) { onStart(template); onClose(); } }}
              disabled={hasActiveWorkout}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${hasActiveWorkout ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
            >
              {hasActiveWorkout ? 'In Progress' : 'Start'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4" style={{ overscrollBehavior: 'contain', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/60 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">{template.exercises.length}</div>
            <div className="text-xs text-gray-400">Exercises</div>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-teal-400">~{totalEstimatedTime}</div>
            <div className="text-xs text-gray-400">Minutes</div>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-rose-400">{template.exercises.reduce((t, e) => t + (e.sets?.length || 3), 0)}</div>
            <div className="text-xs text-gray-400">Total Sets</div>
          </div>
        </div>

        {template.notes && (
          <div className="bg-teal-900/20 border border-teal-700/30 rounded-xl p-3 mb-4">
            <div className="text-sm text-teal-300 flex items-center gap-2">
              <span>📋</span> {template.notes}
            </div>
          </div>
        )}

        {Object.entries(EXERCISE_PHASES).map(([phaseKey, phaseInfo]) => {
          const phaseExercises = exercisesByPhase[phaseKey];
          if (phaseExercises.length === 0) return null;

          const isCollapsed = collapsedPhases[phaseKey];
          const phaseTime = Math.round(getPhaseTime(phaseExercises) / 60);

          return (
            <div key={phaseKey} className="mb-4">
              <button onClick={() => togglePhase(phaseKey)} className={`w-full flex items-center justify-between p-3 rounded-xl ${phaseInfo.color} mb-2`}>
                <div className="flex items-center gap-2">
                  <span>{phaseInfo.icon}</span>
                  <span className="font-semibold text-white">{phaseInfo.label}</span>
                  <span className="text-white/70 text-sm">({phaseExercises.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">~{phaseTime} min</span>
                  {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
                </div>
              </button>

              {!isCollapsed && (
                <div className={`border-l-4 ${phaseInfo.borderColor} pl-3 space-y-2`}>
                  {(() => {
                    // Group exercises by superset
                    const groups = [];
                    const usedIndices = new Set();

                    phaseExercises.forEach(({ exercise, index }) => {
                      if (usedIndices.has(index)) return;

                      if (exercise.supersetId) {
                        const supersetExercises = phaseExercises.filter(
                          pe => pe.exercise.supersetId === exercise.supersetId
                        );
                        supersetExercises.forEach(se => usedIndices.add(se.index));
                        groups.push({ type: 'superset', supersetId: exercise.supersetId, exercises: supersetExercises });
                      } else {
                        groups.push({ type: 'single', exercise, index });
                        usedIndices.add(index);
                      }
                    });

                    return groups.map((group, gIdx) => {
                      if (group.type === 'superset') {
                        return (
                          <div key={group.supersetId} className="relative">
                            {/* Superset header */}
                            <div className="flex items-center gap-2 mb-2 px-2">
                              <div className="flex items-center gap-1.5 bg-teal-500/20 border border-teal-500/40 rounded-full px-3 py-1">
                                <span className="text-teal-400 text-sm">⚡</span>
                                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wide">Superset</span>
                                <span className="text-xs text-teal-400/70">({group.exercises.length} exercises)</span>
                              </div>
                            </div>
                            {/* Superset container with visual grouping */}
                            <div className="bg-teal-500/5 border-2 border-teal-500/30 rounded-xl overflow-hidden">
                              {group.exercises.map(({ exercise, index }, exIdx) => (
                                <div key={index} className={`p-3 ${exIdx !== group.exercises.length - 1 ? 'border-b border-teal-500/20' : ''}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-400 text-xs font-bold">{exIdx + 1}</div>
                                      <span className="font-medium text-white">{exercise.name}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1 ml-8">
                                    {exercise.bodyPart} • {exercise.sets?.length || 3} sets • Rest {formatDuration(exercise.restTime || 90)}
                                  </div>
                                  {exercise.notes && <div className="text-xs text-amber-400 mt-1 ml-8">📝 {exercise.notes}</div>}
                                  <div className="flex flex-wrap gap-2 mt-2 ml-8">
                                    {exercise.sets?.map((set, sIdx) => (
                                      <div key={sIdx} className="bg-gray-800/80 rounded-lg px-2 py-1 text-xs text-gray-300">
                                        {set.weight && `${set.weight}lb `}
                                        {set.reps && `×${set.reps}`}
                                        {set.duration && formatDuration(set.duration)}
                                        {set.distance && `${set.distance}mi`}
                                        {set.bandColor && <span className={`ml-1 ${BAND_COLORS[set.bandColor]?.bg} px-1 rounded`}>{set.bandColor}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // Single exercise
                      return (
                        <div key={group.index} className="bg-gray-800/60 backdrop-blur-sm border border-white/20 rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">{group.exercise.name}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {group.exercise.bodyPart} • {group.exercise.sets?.length || 3} sets • Rest {formatDuration(group.exercise.restTime || 90)}
                          </div>
                          {group.exercise.notes && <div className="text-xs text-amber-400 mt-1">📝 {group.exercise.notes}</div>}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {group.exercise.sets?.map((set, sIdx) => (
                              <div key={sIdx} className="bg-gray-700/80 rounded-lg px-2 py-1 text-xs text-gray-300">
                                {set.weight && `${set.weight}lb `}
                                {set.reps && `×${set.reps}`}
                                {set.duration && formatDuration(set.duration)}
                                {set.distance && `${set.distance}mi`}
                                {set.bandColor && <span className={`ml-1 ${BAND_COLORS[set.bandColor]?.bg} px-1 rounded`}>{set.bandColor}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

// Edit Template Modal - FULL EDITING CAPABILITIES
const EditTemplateModal = ({ template, onSave, onDelete, onClose, allExercises }) => {
  const [name, setName] = useState(template.name);
  const [notes, setNotes] = useState(template.notes || '');
  const [estimatedTime, setEstimatedTime] = useState(template.estimatedTime || '');
  const [exercises, setExercises] = useState(JSON.parse(JSON.stringify(template.exercises)));
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedForSuperset, setSelectedForSuperset] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState(null); // index of expanded exercise
  // Bug #9: Drag-to-reorder for template exercises
  const [dragTouch, setDragTouch] = useState(null);
  const longPressTimerRef = useRef(null);
  const dragRefsTemplate = useRef({});

  const handleTemplateTouchStart = (exIndex, e) => {
    const touch = e.touches[0];
    const timer = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      setDragTouch({ exIndex, startY: touch.clientY, currentY: touch.clientY, insertBefore: null });
    }, 500);
    timer._startX = touch.clientX;
    timer._startY = touch.clientY;
    longPressTimerRef.current = timer;
  };

  const handleTemplateTouchMove = (e) => {
    if (!dragTouch) {
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
    let insertBefore = null;
    const entries = Object.entries(dragRefsTemplate.current)
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
    if (insertBefore === null && entries.length > 0) {
      const lastIdx = parseInt(entries[entries.length - 1][0]);
      if (lastIdx !== dragTouch.exIndex) insertBefore = lastIdx + 1;
    }
    setDragTouch(prev => ({ ...prev, currentY: touch.clientY, insertBefore }));
  };

  const handleTemplateTouchEnd = () => {
    clearTimeout(longPressTimerRef.current);
    if (dragTouch && dragTouch.insertBefore !== null && dragTouch.insertBefore !== dragTouch.exIndex) {
      const fromIndex = dragTouch.exIndex;
      let toIndex = dragTouch.insertBefore;
      if (fromIndex < toIndex) toIndex--;
      const updated = [...exercises];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      setExercises(updated);
    }
    setDragTouch(null);
  };

  const restTimePresets = [30, 45, 60, 90, 120, 180, 300];

  const getGroupedExercises = () => {
    const groups = [];
    const used = new Set();
    exercises.forEach((ex, idx) => {
      if (used.has(idx)) return;
      if (ex.supersetId) {
        const supersetExercises = exercises.map((e, i) => ({ exercise: e, index: i })).filter(({ exercise }) => exercise.supersetId === ex.supersetId);
        supersetExercises.forEach(({ index }) => used.add(index));
        groups.push({ type: 'superset', supersetId: ex.supersetId, exercises: supersetExercises });
      } else {
        groups.push({ type: 'single', exercise: ex, index: idx });
        used.add(idx);
      }
    });
    return groups;
  };

  const addExercises = (newExercises, asSuperset) => {
    if (asSuperset && newExercises.length >= 2) {
      const supersetId = `superset-${Date.now()}`;
      const toAdd = newExercises.map(ex => ({
        ...ex, supersetId, restTime: ex.restTime || 90,
        sets: ex.sets || [getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category)]
      }));
      setExercises([...exercises, ...toAdd]);
    } else {
      const toAdd = newExercises.map(ex => ({
        ...ex, restTime: ex.restTime || 90,
        sets: ex.sets || [getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category), getDefaultSetForCategory(ex.category)]
      }));
      setExercises([...exercises, ...toAdd]);
    }
    setShowExercisePicker(false);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
    setSelectedForSuperset(selectedForSuperset.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    if (expandedExercise === index) setExpandedExercise(null);
  };

  const unlinkSuperset = (index) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], supersetId: undefined };
    setExercises(updated);
  };

  const toggleSelectForSuperset = (index) => {
    setSelectedForSuperset(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const createSuperset = () => {
    if (selectedForSuperset.length >= 2) {
      const supersetId = `superset-${Date.now()}`;
      setExercises(exercises.map((ex, i) => selectedForSuperset.includes(i) ? { ...ex, supersetId } : ex));
      setSelectedForSuperset([]);
      setSelectMode(false);
    }
  };

  const updateExercisePhase = (index, phase) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], phase };
    setExercises(updated);
  };

  const updateExerciseRestTime = (index, restTime) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], restTime };
    setExercises(updated);
  };

  const updateExerciseNotes = (index, notes) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], notes };
    setExercises(updated);
  };

  const addSet = (exIndex) => {
    const updated = [...exercises];
    const exercise = updated[exIndex];
    const lastSet = exercise.sets.slice(-1)[0] || getDefaultSetForCategory(exercise.category);
    const newSet = { ...getDefaultSetForCategory(exercise.category) };
    // Copy values from last set
    Object.keys(lastSet).forEach(key => {
      if (key !== 'completed' && key !== 'completedAt' && lastSet[key] !== undefined) {
        newSet[key] = lastSet[key];
      }
    });
    exercise.sets.push(newSet);
    setExercises(updated);
  };

  const removeSet = (exIndex, setIndex) => {
    const updated = [...exercises];
    if (updated[exIndex].sets.length > 1) {
      updated[exIndex].sets.splice(setIndex, 1);
      setExercises(updated);
    }
  };

  const updateSetValue = (exIndex, setIndex, field, value) => {
    const updated = [...exercises];
    updated[exIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const groups = getGroupedExercises();

  const renderExerciseCard = (exercise, index, isSuperset = false, isFirst = true, isLast = true) => {
    const isExpanded = expandedExercise === index;
    const isSelected = selectedForSuperset.includes(index);
    const fields = CATEGORIES[exercise.category]?.fields || ['weight', 'reps'];

    return (
      <div key={index}>
        {/* Bug #9: Drag insertion indicator */}
        {dragTouch && dragTouch.insertBefore === index && dragTouch.exIndex !== index && (
          <div className="h-1 bg-cyan-400 rounded-full mx-2 mb-1 shadow-lg shadow-cyan-400/50 animate-pulse" />
        )}
      <div
        ref={el => dragRefsTemplate.current[index] = el}
        onTouchStart={(e) => !selectMode && handleTemplateTouchStart(index, e)}
        onTouchMove={handleTemplateTouchMove}
        onTouchEnd={handleTemplateTouchEnd}
        onClick={() => selectMode && toggleSelectForSuperset(index)}
        className={`${isSelected ? 'ring-2 ring-teal-500' : ''} ${dragTouch?.exIndex === index ? 'opacity-50 ring-2 ring-cyan-400 scale-[1.02]' : ''} bg-gray-900 p-4 ${isSuperset ? (isFirst ? 'rounded-t-2xl' : isLast ? 'rounded-b-2xl' : '') : 'rounded-2xl mb-3'} ${selectMode ? 'cursor-pointer' : ''} transition-transform`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Bug #9: Grip handle for drag hint */}
            {!selectMode && (
              <span className="text-gray-500 touch-none"><Icons.GripVertical /></span>
            )}
            {isSuperset && <div className="w-1 h-8 bg-teal-500 rounded-full" />}
            {selectMode && (
              <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-600'} flex items-center justify-center`}>
                {isSelected && <Icons.Check />}
              </div>
            )}
            <div className="flex-1">
              <span className="font-semibold text-white">{exercise.name}</span>
              <div className="text-xs text-gray-400">
                {exercise.bodyPart} • {exercise.sets?.length || 3} sets • Rest {formatDuration(exercise.restTime || 90)}
              </div>
            </div>
          </div>
          {!selectMode && (
            <div className="flex items-center gap-1">
              <button onClick={() => setExpandedExercise(isExpanded ? null : index)} className="text-cyan-400 hover:text-cyan-300 p-2">
                {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
              </button>
              {isSuperset && (
                <button onClick={() => unlinkSuperset(index)} className="text-teal-400 hover:text-teal-300 p-2"><Icons.Link /></button>
              )}
              <button onClick={() => removeExercise(index)} className="text-red-400 hover:text-red-300 p-2"><Icons.Trash /></button>
            </div>
          )}
        </div>

        {/* Phase selector */}
        {!selectMode && (
          <div className="flex gap-1 mb-2">
            {Object.entries(EXERCISE_PHASES).map(([key, info]) => (
              <button key={key} onClick={() => updateExercisePhase(index, key)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${exercise.phase === key ? `${info.color} text-white` : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {info.icon} {info.label}
              </button>
            ))}
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && !selectMode && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            {/* Rest Time */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-2">Rest Time</div>
              <div className="flex flex-wrap gap-1">
                {restTimePresets.map(t => (
                  <button key={t} onClick={() => updateExerciseRestTime(index, t)}
                    className={`px-3 py-1 text-xs rounded-full ${exercise.restTime === t ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    {formatDuration(t)}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Notes */}
            <div className="mb-3">
              <input type="text" value={exercise.notes || ''} onChange={e => updateExerciseNotes(index, e.target.value)}
                placeholder="Exercise notes (optional)" className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-600" />
            </div>

            {/* Sets */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-2">Sets ({exercise.sets?.length || 0})</div>
              <div className="space-y-2">
                {exercise.sets?.map((set, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
                    <span className="text-xs text-gray-500 w-6">#{sIdx + 1}</span>
                    {fields.map(field => (
                      <div key={field} className="flex-1">
                        <label className="text-xs text-gray-500 block">{field === 'bandColor' ? 'Band' : field}</label>
                        {field === 'bandColor' ? (
                          <select value={set.bandColor || ''} onChange={e => updateSetValue(index, sIdx, 'bandColor', e.target.value)}
                            className="w-full bg-gray-700 text-white text-sm px-2 py-1 rounded focus:outline-none">
                            <option value="">Select</option>
                            {Object.entries(BAND_COLORS).map(([color, info]) => (
                              <option key={color} value={color}>{info.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input type="number" value={set[field] || ''} onChange={e => updateSetValue(index, sIdx, field, e.target.value ? Number(e.target.value) : '')}
                            placeholder={field} className="w-full bg-gray-700 text-white text-sm px-2 py-1 rounded focus:outline-none" />
                        )}
                      </div>
                    ))}
                    <button onClick={() => removeSet(index, sIdx)} disabled={exercise.sets.length <= 1}
                      className="text-red-400 hover:text-red-300 p-1 disabled:opacity-30"><Icons.X /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => addSet(index)} className="w-full mt-2 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-teal-400 text-sm flex items-center justify-center gap-1">
                <Icons.Plus /> Add Set
              </button>
            </div>
          </div>
        )}

        {/* Collapsed set preview */}
        {!isExpanded && exercise.sets?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {exercise.sets.slice(0, 5).map((set, sIdx) => (
              <span key={sIdx} className="bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-400">
                {set.weight && `${set.weight}lb`}{set.reps && ` ×${set.reps}`}
                {set.duration && formatDuration(set.duration)}
                {set.bandColor && set.bandColor}
              </span>
            ))}
            {exercise.sets.length > 5 && <span className="text-xs text-gray-500">+{exercise.sets.length - 5} more</span>}
          </div>
        )}
      </div>
      {/* Bug #9: Drag insertion indicator after last card */}
      {dragTouch && dragTouch.insertBefore === index + 1 && dragTouch.exIndex !== index && (
        <div className="h-1 bg-cyan-400 rounded-full mx-2 mt-1 shadow-lg shadow-cyan-400/50 animate-pulse" />
      )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img src="/backgrounds/bg-6.jpg" alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="shrink-0 p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
          <h3 className="text-lg font-semibold text-white">Edit Template</h3>
          <button onClick={() => { onSave({ ...template, name, notes, estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined, exercises }); onClose(); }} className="text-rose-400 hover:text-rose-300 font-medium">
            Save
          </button>
        </div>

        {selectMode && (
          <div className="shrink-0 p-3 bg-teal-900/50 border-b border-teal-700 flex items-center justify-between">
            <span className="text-teal-300 text-sm">{selectedForSuperset.length} selected</span>
          <div className="flex gap-2">
            <button onClick={() => { setSelectMode(false); setSelectedForSuperset([]); }} className="text-gray-400 text-sm">Cancel</button>
            <button onClick={createSuperset} disabled={selectedForSuperset.length < 2} className="bg-teal-600 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50">
              Link as Superset
            </button>
          </div>
        </div>
      )}

        <div className="flex-1 overflow-y-auto p-4" style={{ overscrollBehavior: 'contain' }}>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Template name"
            className="w-full bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 mb-3 border border-white/20" />

        <div className="flex gap-2 mb-3">
          <input type="number" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} placeholder="Est. minutes"
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm" />
          <button onClick={() => setSelectMode(!selectMode)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${selectMode ? 'bg-teal-600 text-white' : 'bg-gray-800 text-teal-400'}`}>
            <Icons.Link /> Superset
          </button>
        </div>

        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Workout notes (optional)"
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 mb-4 text-sm resize-none h-20" />

        <div className="text-sm text-gray-400 mb-3">{exercises.length} exercises • Tap exercise to edit details</div>

        {groups.map((group) => {
          if (group.type === 'superset') {
            return (
              <div key={group.supersetId} className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Link />
                  <span className="text-xs font-medium text-teal-400 uppercase tracking-wide">Superset</span>
                </div>
                <div className="border-l-4 border-teal-500 rounded-2xl overflow-hidden">
                  {group.exercises.map(({ exercise, index }, i) => renderExerciseCard(exercise, index, true, i === 0, i === group.exercises.length - 1))}
                </div>
              </div>
            );
          }
          return renderExerciseCard(group.exercise, group.index, false);
        })}

        <button onClick={() => setShowExercisePicker(true)}
          className="w-full bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/20 rounded-2xl p-6 text-gray-400 hover:border-rose-500/50 hover:text-rose-400 flex items-center justify-center gap-2 mt-2">
          <Icons.Plus /> Add Exercise
        </button>
        </div>

        <div className="shrink-0 p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
          <button onClick={() => { onDelete(template.id); onClose(); }} className="w-full bg-red-500/20 text-red-400 py-3 rounded-xl font-medium hover:bg-red-500/30 border border-red-500/30">
            Delete Template
          </button>
        </div>
      </div>

      {showExercisePicker && (
        <ExerciseSearchModal exercises={allExercises} onSelect={(ex) => addExercises([ex], false)} onSelectMultiple={addExercises} onClose={() => setShowExercisePicker(false)} />
      )}
    </div>
  );
};

const TemplatesScreen = ({ templates, folders, onStartTemplate, hasActiveWorkout, onImport, onBulkImport, onUpdateTemplate, onDeleteTemplate, onAddFolder, onBulkAddFolders, onUpdateFolder, onDeleteFolder, onAddExercises, exercises, onScroll, navVisible, onModalStateChange }) => {
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [showImport, setShowImport] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState(null);
  const [renamingFolder, setRenamingFolder] = useState(null); // { id, name }
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [aiBoilerplateCopied, setAiBoilerplateCopied] = useState(false);
  // Bug #10: Swipe-to-delete state for folders
  const [swipedFolder, setSwipedFolder] = useState(null);
  const folderTouchRef = useRef({ x: 0, y: 0, swiping: false });
  const folderLongPressRef = useRef(null);
  const DELETE_THRESHOLD = 80;

  const copyAIBoilerplate = async () => {
    try {
      await navigator.clipboard.writeText(generateTemplateAIBoilerplate());
      setAiBoilerplateCopied(true);
      setTimeout(() => setAiBoilerplateCopied(false), 2000);
    } catch (err) {
      console.error('Copy AI boilerplate failed:', err);
    }
  };

  // Notify parent when any modal is open to hide navbar
  useEffect(() => {
    const anyModalOpen = showCreateTemplate || !!editingTemplate || !!viewingTemplate || showImport;
    onModalStateChange?.(anyModalOpen);
  }, [showCreateTemplate, editingTemplate, viewingTemplate, showImport, onModalStateChange]);

  const calculateEstimatedTime = (template) => {
    if (template.estimatedTime) return template.estimatedTime;
    return Math.round(template.exercises.reduce((total, ex) => {
      const setTime = (ex.sets?.length || 3) * 45;
      const restTime = (ex.sets?.length || 3) * (ex.restTime || 90);
      return total + setTime + restTime;
    }, 0) / 60);
  };

  const getAllSubfolderIds = (parentId) => {
    const ids = [];
    const recurse = (pid) => {
      folders.filter(f => f.parentId === pid).forEach(f => { ids.push(f.id); recurse(f.id); });
    };
    recurse(parentId);
    return ids;
  };

  const exportFolderJSON = (folder) => {
    const allSubfolderIds = getAllSubfolderIds(folder.id);
    const folderIds = [folder.id, ...allSubfolderIds];
    const folderTemplates = templates.filter(t => folderIds.includes(t.folderId));
    const subfolders = folders.filter(f => allSubfolderIds.includes(f.id));

    const exportData = {
      version: 1,
      exportDate: new Date().toISOString(),
      folder: { name: folder.name, id: folder.id },
      subfolders: subfolders.map(f => ({ name: f.name, id: f.id, parentId: f.parentId })),
      templates: folderTemplates.map(t => ({
        name: t.name,
        folderId: t.folderId,
        estimatedTime: t.estimatedTime || null,
        notes: t.notes || '',
        exercises: t.exercises,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folder.name.replace(/\s+/g, '-')}-templates.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const executeDeleteFolder = (folder, subfolderIds) => {
    [...subfolderIds, folder.id].forEach(fid => {
      templates.filter(t => t.folderId === fid).forEach(t => onDeleteTemplate(t.id));
    });
    subfolderIds.forEach(fid => onDeleteFolder(fid));
    onDeleteFolder(folder.id);
    setDeleteFolderConfirm(null);
  };

  const currentFolder = folders.find(f => f.id === currentFolderId);
  // Filter out unwanted folders - artifacts from import or unused defaults
  const hiddenFolders = ['root', 'cardio', 'strength'];
  // Handle both null and 'root' as root-level parentId for backwards compatibility
  const isRootLevel = (parentId) => parentId === 'root' || parentId === null || parentId === undefined;
  const childFolders = folders.filter(f => {
    const matchesParent = currentFolderId === 'root'
      ? isRootLevel(f.parentId)
      : f.parentId === currentFolderId;
    return matchesParent && f.name && !hiddenFolders.includes(f.name.toLowerCase());
  }).sort((a, b) => a.name.localeCompare(b.name));
  const folderTemplates = templates.filter(t => (t.folderId || 'root') === currentFolderId).sort((a, b) => a.name.localeCompare(b.name));

  const getBreadcrumbs = () => {
    const crumbs = [];
    let folder = currentFolder;
    while (folder) { crumbs.unshift(folder); folder = folders.find(f => f.id === folder.parentId); }
    return crumbs;
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <div className="fixed inset-0 z-0 bg-black">
        <img src="/backgrounds/bg-4.jpg" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-shrink-0 p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">Templates</h2>
            <div className="flex gap-2">
              <button onClick={copyAIBoilerplate} className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10" title="Copy AI template format">
                {aiBoilerplateCopied ? <span className="text-green-400 text-xs font-medium">Copied!</span> : <Icons.Code />}
              </button>
              <button onClick={() => setShowCreateFolder(true)} className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10"><Icons.Folder /></button>
              <button onClick={() => setShowImport(true)} className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10"><Icons.Import /></button>
              <button onClick={() => setShowCreateTemplate(true)} className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 flex items-center gap-1 border border-white/30">
                <Icons.Plus /> New
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <button onClick={() => setCurrentFolderId('root')} className={`px-2 py-1 rounded ${currentFolderId === 'root' ? 'text-teal-400' : 'text-gray-400 hover:text-white'}`}>All Templates</button>
            {getBreadcrumbs().map((crumb) => (
              <Fragment key={crumb.id}>
                <Icons.ChevronRight />
                <button onClick={() => setCurrentFolderId(crumb.id)} className={`px-2 py-1 rounded ${currentFolderId === crumb.id ? 'text-teal-400' : 'text-gray-400 hover:text-white'}`}>{crumb.name}</button>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)', overscrollBehavior: 'contain' }} onScroll={(e) => onScroll?.(e.target.scrollTop)}>
          {childFolders.map(folder => {
            const allSubfolderIds = getAllSubfolderIds(folder.id);
            const totalTemplateCount = templates.filter(t => t.folderId === folder.id || allSubfolderIds.includes(t.folderId)).length;
            const isEmpty = totalTemplateCount === 0 && allSubfolderIds.length === 0;

            return (
              <div key={folder.id} className="relative overflow-hidden rounded-xl mb-2">
                {/* Bug #10: Delete zone revealed on swipe */}
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center rounded-r-xl"
                  style={{ opacity: swipedFolder === folder.id ? 1 : 0, transition: 'opacity 0.2s' }}>
                  <button onClick={() => {
                    if (isEmpty) {
                      onDeleteFolder(folder.id);
                    } else {
                      setDeleteFolderConfirm({ folder, subfolderIds: allSubfolderIds, templateCount: totalTemplateCount, folderCount: allSubfolderIds.length });
                    }
                    setSwipedFolder(null);
                  }} className="p-3 text-white">
                    <Icons.Trash />
                  </button>
                </div>

                {/* Folder button — slides left on swipe, long-press to rename */}
                <button
                  onClick={() => {
                    if (folderLongPressRef.current?.fired) return; // Ignore tap after long-press
                    swipedFolder === folder.id ? setSwipedFolder(null) : setCurrentFolderId(folder.id);
                  }}
                  onTouchStart={(e) => {
                    folderTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, swiping: false };
                    folderLongPressRef.current = { fired: false };
                    folderLongPressRef.current.timer = setTimeout(() => {
                      folderLongPressRef.current.fired = true;
                      if (navigator.vibrate) navigator.vibrate(50);
                      setRenamingFolder({ id: folder.id, name: folder.name });
                    }, 500);
                  }}
                  onTouchMove={(e) => {
                    const deltaX = e.touches[0].clientX - folderTouchRef.current.x;
                    const deltaY = Math.abs(e.touches[0].clientY - folderTouchRef.current.y);
                    // Cancel long-press on any movement
                    if (Math.abs(deltaX) > 10 || deltaY > 10) {
                      clearTimeout(folderLongPressRef.current?.timer);
                    }
                    // Only swipe horizontally, not if scrolling vertically
                    if (deltaY > 20 && !folderTouchRef.current.swiping) return;
                    if (deltaX < -(DELETE_THRESHOLD / 2)) {
                      folderTouchRef.current.swiping = true;
                      setSwipedFolder(folder.id);
                    } else if (deltaX > 20 && swipedFolder === folder.id) {
                      setSwipedFolder(null);
                    }
                  }}
                  onTouchEnd={() => { clearTimeout(folderLongPressRef.current?.timer); }}
                  style={{
                    transform: swipedFolder === folder.id ? `translateX(-${DELETE_THRESHOLD}px)` : 'translateX(0)',
                    transition: 'transform 0.2s ease-out'
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl active:bg-white/20 border border-white/20 cursor-pointer text-left relative z-10">
                  <span className="text-teal-400"><Icons.Folder /></span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-white block">{folder.name}</span>
                    <div className="text-xs text-gray-500">
                      {allSubfolderIds.length > 0 ? `${allSubfolderIds.length} folder${allSubfolderIds.length !== 1 ? 's' : ''}, ` : ''}{totalTemplateCount} template{totalTemplateCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); exportFolderJSON(folder); }}
                    className="p-1.5 text-gray-400 hover:text-teal-400 hover:bg-white/10 rounded-lg"
                    title="Export folder"
                  >
                    <Icons.Export />
                  </button>
                  <span className="text-teal-500/70"><Icons.ChevronRight /></span>
                </button>
              </div>
            );
          })}

          {folderTemplates.map(template => {
            const estTime = calculateEstimatedTime(template);
            const phaseCounts = { warmup: 0, workout: 0, cooldown: 0 };
            template.exercises.forEach(ex => { phaseCounts[ex.phase || 'workout']++; });

            return (
              <div key={template.id} className="bg-gray-900/80 rounded-2xl p-4 mb-3 border border-gray-800/50 hover:border-cyan-800/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="text-cyan-400/70">{template.exercises.length} exercises</span>
                      <span className="flex items-center gap-1 text-teal-400"><Icons.TimerSmall /> ~{estTime} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingTemplate(template)} className="p-2 text-cyan-400/70 hover:text-cyan-300 rounded-lg hover:bg-gray-800"><Icons.Edit /></button>
                    <button
                      onClick={() => !hasActiveWorkout && onStartTemplate(template)}
                      disabled={hasActiveWorkout}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${hasActiveWorkout ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-rose-700 text-white hover:bg-rose-800'}`}
                      title={hasActiveWorkout ? 'Finish or cancel your current workout first' : ''}
                    >{hasActiveWorkout ? 'In Progress' : 'Start'}</button>
                  </div>
                </div>

                <button onClick={() => setViewingTemplate(template)} className="w-full text-left">
                  {template.notes && (
                    <div className="bg-teal-900/20 border border-teal-700/30 rounded-lg p-2 mb-3">
                      <div className="text-xs text-teal-300 flex items-center gap-1"><span>📋</span> {template.notes}</div>
                    </div>
                  )}
                  <div className="flex gap-2 mb-2">
                    {phaseCounts.warmup > 0 && <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">🔥 {phaseCounts.warmup}</span>}
                    {phaseCounts.workout > 0 && <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full">💪 {phaseCounts.workout}</span>}
                    {phaseCounts.cooldown > 0 && <span className="bg-teal-500/20 text-teal-400 text-xs px-2 py-0.5 rounded-full">🧊 {phaseCounts.cooldown}</span>}
                  </div>
                  <div className="space-y-1">
                    {template.exercises.slice(0, 4).map((ex, i) => (
                      <div key={i} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${ex.phase === 'warmup' ? 'bg-amber-500' : ex.phase === 'cooldown' ? 'bg-teal-500' : ex.supersetId ? 'bg-teal-500' : 'bg-rose-500/70'}`}></span>
                        {ex.name} - {ex.sets?.length || 3} sets
                      </div>
                    ))}
                    {template.exercises.length > 4 && <div className="text-xs text-cyan-400 mt-2 hover:text-cyan-300">Tap to view all {template.exercises.length} exercises →</div>}
                  </div>
                </button>
              </div>
            );
          })}

          {childFolders.length === 0 && folderTemplates.length === 0 && <div className="text-center text-gray-400 py-8">No templates in this folder</div>}
        </div>
      </div>

      {showImport && <ImportModal folders={folders} currentFolderId={currentFolderId} onAddFolder={onAddFolder} onBulkAddFolders={onBulkAddFolders} onImport={onImport} onBulkImport={onBulkImport} onUpdateTemplate={onUpdateTemplate} onAddExercises={onAddExercises} existingExercises={exercises} existingTemplates={templates} onClose={() => setShowImport(false)} />}
      {showCreateFolder && <CreateFolderModal parentId={currentFolderId} onSave={onAddFolder} onClose={() => setShowCreateFolder(false)} />}
      {showCreateTemplate && <CreateTemplateModal folderId={currentFolderId} allExercises={exercises} onSave={t => { onImport(t); setShowCreateTemplate(false); }} onClose={() => setShowCreateTemplate(false)} />}
      {editingTemplate && <EditTemplateModal template={editingTemplate} onSave={onUpdateTemplate} onDelete={onDeleteTemplate} onClose={() => setEditingTemplate(null)} allExercises={exercises} />}
      {viewingTemplate && <TemplateDetailModal template={viewingTemplate} onClose={() => setViewingTemplate(null)} onStart={onStartTemplate} onEdit={setEditingTemplate} hasActiveWorkout={hasActiveWorkout} />}

      {/* Rename Folder Modal */}
      {renamingFolder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Rename Folder</h3>
            <input
              type="text"
              value={renamingFolder.name}
              onChange={(e) => setRenamingFolder({ ...renamingFolder, name: e.target.value })}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500 border border-gray-700"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && renamingFolder.name.trim()) {
                  const folder = folders.find(f => f.id === renamingFolder.id);
                  if (folder) onUpdateFolder?.({ ...folder, name: renamingFolder.name.trim() });
                  setRenamingFolder(null);
                }
              }}
            />
            <div className="flex gap-3">
              <button onClick={() => setRenamingFolder(null)} className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600">Cancel</button>
              <button onClick={() => {
                if (renamingFolder.name.trim()) {
                  const folder = folders.find(f => f.id === renamingFolder.id);
                  if (folder) onUpdateFolder?.({ ...folder, name: renamingFolder.name.trim() });
                  setRenamingFolder(null);
                }
              }} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteFolderConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Folder?</h3>
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">This will permanently delete "{deleteFolderConfirm.folder.name}" and all its contents:</p>
              <ul className="mt-2 text-sm text-red-300 space-y-1">
                {deleteFolderConfirm.folderCount > 0 && <li>• {deleteFolderConfirm.folderCount} subfolder{deleteFolderConfirm.folderCount !== 1 ? 's' : ''}</li>}
                {deleteFolderConfirm.templateCount > 0 && <li>• {deleteFolderConfirm.templateCount} template{deleteFolderConfirm.templateCount !== 1 ? 's' : ''}</li>}
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteFolderConfirm(null)} className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600">Cancel</button>
              <button onClick={() => executeDeleteFolder(deleteFolderConfirm.folder, deleteFolderConfirm.subfolderIds)} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700">Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { TemplatesScreen };
