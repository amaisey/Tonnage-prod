import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { BODY_PARTS, CATEGORIES, BAND_COLORS, RPE_DESCRIPTIONS, EXERCISE_TYPES } from '../data/constants';
import { formatDuration, generateStravaDescription, getDefaultSetForCategory } from '../utils/helpers';

const NumberPad = ({ value, onChange, onClose, onNext, showRPE, rpeValue, onRPEChange, fieldLabel }) => {
  const [showRPEPicker, setShowRPEPicker] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const hasEditedRef = useRef(false); // Ref mirrors state for rapid-tap accuracy
  const [localValue, setLocalValue] = useState(value);
  const valueRef = useRef(value);
  const dragStartY = useRef(null);
  const [dragOffset, setDragOffset] = useState(0);

  // Sync local value with prop when FIELD changes (not value - that causes overwrite bug)
  useEffect(() => {
    setLocalValue(value);
    valueRef.current = value;
    setHasEdited(false);
    hasEditedRef.current = false;
  }, [fieldLabel]); // Only reset when switching fields, not on every value change

  // Update parent and local state together
  const updateValue = (newValue) => {
    valueRef.current = newValue;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleDigit = (digit) => {
    if (!hasEditedRef.current) {
      // First keystroke - overwrite the existing value
      hasEditedRef.current = true;
      setHasEdited(true);
      updateValue(digit);
    } else {
      // Subsequent keystrokes - append using ref for latest value
      updateValue(valueRef.current + digit);
    }
  };

  const handleBackspace = () => {
    updateValue(valueRef.current.slice(0, -1));
  };

  const handleDecimal = () => {
    if (!valueRef.current.includes('.')) updateValue(valueRef.current + '.');
  };

  const handlePlusMinus = (delta) => {
    const num = parseFloat(valueRef.current) || 0;
    const newVal = Math.max(0, num + delta);
    updateValue(String(newVal));
  };

  // Drag-down to dismiss
  const handleDragStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
    setDragOffset(0);
  };
  const handleDragMove = (e) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) {
      setDragOffset(dy);
      e.preventDefault();
    }
  };
  const handleDragEnd = () => {
    if (dragOffset > 80) {
      onClose();
    }
    setDragOffset(0);
    dragStartY.current = null;
  };

  const rpeOptions = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

  return (
    <div
      className="fixed inset-x-0 bottom-0 bg-gray-900 border-t border-gray-800 z-50 rounded-t-2xl transition-transform"
      style={{ transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined }}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Drag handle indicator */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 bg-gray-600 rounded-full" />
      </div>
      {showRPEPicker ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setShowRPEPicker(false)} className="text-gray-400 p-2">
              <Icons.Back />
            </button>
            <span className="text-white font-medium">Rate of Perceived Exertion</span>
            <div className="w-10"></div>
          </div>
          <div className="text-center text-gray-400 text-sm mb-4">
            {rpeValue ? RPE_DESCRIPTIONS[rpeValue] : 'How hard was this set?'}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {rpeOptions.map(rpe => (
              <button key={rpe} onClick={() => { onRPEChange(rpe); setShowRPEPicker(false); }}
                className={`w-12 h-12 rounded-lg font-bold text-lg ${rpeValue === rpe ? 'bg-rose-700 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                {rpe}
              </button>
            ))}
          </div>
          {rpeValue && (
            <button onClick={() => { onRPEChange(null); setShowRPEPicker(false); }}
              className="w-full py-2 text-red-400 text-sm">Clear RPE</button>
          )}
        </div>
      ) : (
        <div className="p-3">
          {/* Header with field label */}
          <div className="text-center text-gray-400 text-xs uppercase mb-2">{fieldLabel}</div>
          {/* Orange dismiss button - full width */}
          <button onClick={onClose} className="w-full h-10 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div className="grid grid-cols-4 gap-2">
            {['1', '2', '3'].map(d => (
              <button key={d} onClick={() => handleDigit(d)} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">{d}</button>
            ))}
            {showRPE ? (
              <button onClick={() => setShowRPEPicker(true)} className="bg-gray-700 text-white text-sm font-medium py-4 rounded-lg hover:bg-gray-600 flex flex-col items-center justify-center">
                <span>RPE</span>
                {rpeValue && <span className="text-rose-400 text-xs">{rpeValue}</span>}
              </button>
            ) : (
              <div></div>
            )}

            {['4', '5', '6'].map(d => (
              <button key={d} onClick={() => handleDigit(d)} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">{d}</button>
            ))}
            <div className="flex gap-1">
              <button onClick={() => handlePlusMinus(-1)} className="flex-1 bg-gray-700 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-600">−</button>
              <button onClick={() => handlePlusMinus(1)} className="flex-1 bg-gray-700 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-600">+</button>
            </div>

            {['7', '8', '9'].map(d => (
              <button key={d} onClick={() => handleDigit(d)} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">{d}</button>
            ))}
            <button onClick={handleBackspace} className="bg-red-500/20 text-red-400 text-xl font-medium py-4 rounded-lg hover:bg-red-500/30">⌫</button>

            {/* Bottom row: 0 (double wide), ., Next */}
            <button onClick={() => handleDigit('0')} className="col-span-2 bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">0</button>
            <button onClick={handleDecimal} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">.</button>
            <button onClick={onNext} className="bg-cyan-600 text-white text-base font-bold py-4 rounded-lg hover:bg-cyan-700">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Duration Pad - specialized input for time (minutes:seconds)
const DurationPad = ({ value, onChange, onClose, onNext, fieldLabel }) => {
  // Value is stored in seconds, convert to minutes and seconds for display
  const totalSeconds = parseInt(value) || 0;
  const [minutes, setMinutes] = useState(Math.floor(totalSeconds / 60));
  const [seconds, setSeconds] = useState(totalSeconds % 60);
  const [editingField, setEditingField] = useState('minutes'); // 'minutes' or 'seconds'
  const [hasEdited, setHasEdited] = useState(false);

  // Sync when value prop changes
  useEffect(() => {
    const total = parseInt(value) || 0;
    setMinutes(Math.floor(total / 60));
    setSeconds(total % 60);
    setHasEdited(false);
  }, [fieldLabel]);

  const updateParent = (mins, secs) => {
    const totalSecs = (mins * 60) + secs;
    onChange(String(totalSecs));
  };

  const handleDigit = (digit) => {
    if (editingField === 'minutes') {
      const newMins = hasEdited ? Math.min(999, parseInt(String(minutes) + digit) || 0) : parseInt(digit);
      setMinutes(newMins);
      updateParent(newMins, seconds);
    } else {
      const newSecs = hasEdited ? Math.min(59, parseInt(String(seconds).slice(-1) + digit) || 0) : parseInt(digit);
      setSeconds(newSecs);
      updateParent(minutes, newSecs);
    }
    setHasEdited(true);
  };

  const handleBackspace = () => {
    if (editingField === 'minutes') {
      const newMins = Math.floor(minutes / 10);
      setMinutes(newMins);
      updateParent(newMins, seconds);
    } else {
      const newSecs = Math.floor(seconds / 10);
      setSeconds(newSecs);
      updateParent(minutes, newSecs);
    }
  };

  const handlePreset = (mins) => {
    setMinutes(mins);
    setSeconds(0);
    updateParent(mins, 0);
    setHasEdited(true);
  };

  const handlePlusMinus = (delta) => {
    if (editingField === 'minutes') {
      const newMins = Math.max(0, minutes + delta);
      setMinutes(newMins);
      updateParent(newMins, seconds);
    } else {
      let newSecs = seconds + delta;
      let newMins = minutes;
      if (newSecs < 0) { newSecs = 59; newMins = Math.max(0, newMins - 1); }
      if (newSecs > 59) { newSecs = 0; newMins = newMins + 1; }
      setMinutes(newMins);
      setSeconds(newSecs);
      updateParent(newMins, newSecs);
    }
    setHasEdited(true);
  };

  const presets = [5, 10, 15, 20, 30, 45, 60, 90];

  return (
    <div className="fixed inset-x-0 bottom-0 bg-gray-900 border-t border-gray-800 z-50 rounded-t-2xl">
      <div className="p-3">
        {/* Header */}
        <div className="text-center text-gray-400 text-xs uppercase mb-2">{fieldLabel}</div>

        {/* Time Display */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={() => { setEditingField('minutes'); setHasEdited(false); }}
            className={`px-4 py-3 rounded-lg text-3xl font-mono ${editingField === 'minutes' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            {String(minutes).padStart(2, '0')}
          </button>
          <span className="text-3xl font-mono text-gray-500">:</span>
          <button
            onClick={() => { setEditingField('seconds'); setHasEdited(false); }}
            className={`px-4 py-3 rounded-lg text-3xl font-mono ${editingField === 'seconds' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            {String(seconds).padStart(2, '0')}
          </button>
          <span className="text-gray-500 text-sm ml-2">{editingField === 'minutes' ? 'min' : 'sec'}</span>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-1 mb-3 justify-center">
          {presets.map(mins => (
            <button
              key={mins}
              onClick={() => handlePreset(mins)}
              className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700"
            >
              {mins >= 60 ? `${mins/60}h` : `${mins}m`}
            </button>
          ))}
        </div>

        {/* Dismiss button */}
        <button onClick={onClose} className="w-full h-10 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {/* Number Pad */}
        <div className="grid grid-cols-4 gap-2">
          {['1', '2', '3'].map(d => (
            <button key={d} onClick={() => handleDigit(d)} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">{d}</button>
          ))}
          <button onClick={() => setEditingField(editingField === 'minutes' ? 'seconds' : 'minutes')}
            className="bg-teal-700 text-white text-sm font-medium py-4 rounded-lg hover:bg-teal-600">
            {editingField === 'minutes' ? '→ SEC' : '→ MIN'}
          </button>

          {['4', '5', '6'].map(d => (
            <button key={d} onClick={() => handleDigit(d)} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">{d}</button>
          ))}
          <div className="flex gap-1">
            <button onClick={() => handlePlusMinus(-1)} className="flex-1 bg-gray-700 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-600">−</button>
            <button onClick={() => handlePlusMinus(1)} className="flex-1 bg-gray-700 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-600">+</button>
          </div>

          {['7', '8', '9'].map(d => (
            <button key={d} onClick={() => handleDigit(d)} className="bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">{d}</button>
          ))}
          <button onClick={handleBackspace} className="bg-red-500/20 text-red-400 text-xl font-medium py-4 rounded-lg hover:bg-red-500/30">⌫</button>

          <button onClick={() => handleDigit('0')} className="col-span-2 bg-gray-800 text-white text-xl font-medium py-4 rounded-lg hover:bg-gray-700">0</button>
          <button onClick={() => handlePreset(0)} className="bg-gray-700 text-gray-400 text-sm font-medium py-4 rounded-lg hover:bg-gray-600">Clear</button>
          <button onClick={onNext} className="bg-cyan-600 text-white text-base font-bold py-4 rounded-lg hover:bg-cyan-700">Next</button>
        </div>
      </div>
    </div>
  );
};

// Set Input Row Component with dual rest time display (elapsed + target)
// Bug #13: Added swipe-to-delete functionality
// Bug #3: Only shows timer if isNextExpected or has frozenElapsed
const SetInputRow = ({ set, setIndex, category, onUpdate, onComplete, onRemove, restTime, previousSet, previousWorkoutSet, onOpenNumpad, onOpenBandPicker, activeField, isNextExpected, lastCompletionTimestamp, frozenElapsed, allSets, exerciseStartTime }) => {
  const fields = CATEGORIES[category]?.fields || ['weight', 'reps'];
  const rowRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Bug #13: Swipe to delete state
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const DELETE_THRESHOLD = 80; // pixels to swipe to reveal delete

  // Scroll into view when this row becomes active - position well above numpad
  useEffect(() => {
    if (activeField && rowRef.current) {
      setTimeout(() => {
        const element = rowRef.current;
        if (!element) return;
        const container = element.closest('[style*="overflow"]') || element.parentElement?.parentElement?.parentElement;
        if (container) {
          const elementRect = element.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const scrollTop = container.scrollTop;
          // Dynamically measure numpad height instead of hardcoded 120px
          const numpad = document.querySelector('.fixed.inset-x-0.bottom-0.bg-gray-900.border-t');
          const numpadHeight = numpad ? numpad.getBoundingClientRect().height : 280;
          // Position the row in the visible area above the numpad with 20px breathing room
          const visibleHeight = containerRect.height - numpadHeight;
          const targetPosition = scrollTop + (elementRect.top - containerRect.top) - Math.min(visibleHeight * 0.4, 160);
          container.scrollTo({ top: Math.max(0, targetPosition), behavior: 'smooth' });
        }
      }, 50);
    }
  }, [activeField]);

  // Bug #3/#7: Timer only runs on the next expected set, derived from single timestamp
  // Convention: negative frozenElapsed = live timer anchor (absolute value is the timestamp to count from)
  //             positive frozenElapsed = truly frozen (static seconds display)
  useEffect(() => {
    if (frozenElapsed !== null && frozenElapsed !== undefined) {
      if (frozenElapsed < 0) {
        // Negative = live timer anchor: count up from the stored timestamp
        const anchorTimestamp = Math.abs(frozenElapsed);
        const updateElapsed = () => {
          setElapsedTime(Math.round((Date.now() - anchorTimestamp) / 1000));
        };
        updateElapsed();
        const interval = setInterval(updateElapsed, 1000);
        return () => clearInterval(interval);
      }
      // Positive = truly frozen, show static value
      setElapsedTime(frozenElapsed);
      return;
    }

    // For completed sets without frozen elapsed, compute from completedAt timestamps
    if (set.completed && set.completedAt && setIndex > 0) {
      // Find previous set's completedAt
      const prevSet = allSets?.[setIndex - 1];
      if (prevSet?.completedAt) {
        setElapsedTime(Math.round((set.completedAt - prevSet.completedAt) / 1000));
      } else if (exerciseStartTime) {
        setElapsedTime(Math.round((set.completedAt - exerciseStartTime) / 1000));
      }
      return;
    }

    // Only the next expected set gets a live timer
    if (!isNextExpected || !lastCompletionTimestamp) {
      setElapsedTime(0);
      return;
    }

    const updateElapsed = () => {
      const elapsed = Math.floor((Date.now() - lastCompletionTimestamp) / 1000);
      setElapsedTime(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isNextExpected, lastCompletionTimestamp, frozenElapsed, set.completed, set.completedAt]);

  const renderInput = (field, fieldIndex) => {
    const isActive = activeField === field;

    // Special handling for band color field
    if (field === 'bandColor') {
      const currentColor = set.bandColor || 'red';
      const colorInfo = BAND_COLORS[currentColor] || BAND_COLORS.red;
      return (
        <div key={field} className="flex-1">
          <button
            onClick={() => onOpenBandPicker ? onOpenBandPicker(currentColor) : onUpdate('bandColor', currentColor === 'red' ? 'green' : 'red')}
            className={`w-full ${colorInfo.bg} ${colorInfo.text} px-2 py-1.5 rounded-lg text-center text-xs font-medium focus:outline-none ${isActive ? 'ring-2 ring-cyan-400' : ''}`}
          >
            {currentColor.charAt(0).toUpperCase() + currentColor.slice(1)}
          </button>
        </div>
      );
    }

    const placeholders = { weight: '0', reps: '0', duration: '0:00', distance: '0', assistedWeight: '0' };
    const labels = { weight: 'lbs', reps: 'reps', duration: 'sec', distance: 'mi', assistedWeight: '-lbs' };
    const isProposed = set.proposed && !set.manuallyEdited && set[field];

    // Format the display value - use MM:SS for duration
    const displayValue = field === 'duration' && set[field]
      ? formatDuration(set[field])
      : (set[field] || placeholders[field]);

    return (
      <button
        key={field}
        onClick={() => onOpenNumpad(setIndex, field, fieldIndex)}
        className={`flex-1 px-2 py-1.5 rounded-lg text-center text-sm focus:outline-none min-w-0 ${isActive ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-gray-700 text-white'} ${isProposed ? 'opacity-50' : ''}`}
      >
        {displayValue}
      </button>
    );
  };

  // Format previous workout data for display
  const formatPrevious = () => {
    if (!previousWorkoutSet) return '-';
    if (category === 'cardio') {
      return `${previousWorkoutSet.distance || 0} mi`;
    } else if (category === 'duration') {
      return formatDuration(previousWorkoutSet.duration);
    } else if (category === 'reps_only') {
      return `${previousWorkoutSet.reps || 0} reps`;
    } else if (category === 'assisted_bodyweight') {
      return `-${previousWorkoutSet.assistedWeight || 0} × ${previousWorkoutSet.reps || 0}`;
    } else if (category === 'band') {
      const color = previousWorkoutSet.bandColor || 'red';
      return `${color.charAt(0).toUpperCase()} × ${previousWorkoutSet.reps || 0}`;
    } else {
      return `${previousWorkoutSet.weight || 0} × ${previousWorkoutSet.reps || 0}`;
    }
  };

  // Show rest timer row if: next expected set (live counting), has frozen timer, or completed set (stamped time)
  const showRestRow = isNextExpected || (frozenElapsed !== null && frozenElapsed !== undefined) || (set.completed && setIndex > 0);

  // Bug #13: Touch handlers for swipe-to-delete
  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setIsSwiping(false);
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsSwiping(true);
      // Only allow left swipe (negative deltaX), cap at DELETE_THRESHOLD
      const newSwipeX = Math.max(-DELETE_THRESHOLD, Math.min(0, deltaX));
      setSwipeX(newSwipeX);
    }
  };

  const handleTouchEnd = () => {
    // Snap to delete position or back to normal
    if (swipeX < -DELETE_THRESHOLD / 2) {
      setSwipeX(-DELETE_THRESHOLD);
    } else {
      setSwipeX(0);
    }
    setIsSwiping(false);
  };

  const handleDelete = () => {
    setSwipeX(0);
    onRemove?.();
  };

  const resetSwipe = () => {
    setSwipeX(0);
  };

  return (
    <>
      {/* Dual rest time indicator - Elapsed (left) | Target (right) */}
      {showRestRow && (
        <div className="flex items-center justify-center py-0.5 gap-1.5">
          <div className="flex-1 h-px bg-rose-700/30"></div>
          <span className={`text-[10px] font-mono px-1 min-w-[40px] text-center ${set.completed ? 'text-white' : 'text-cyan-400'}`}>
            {formatDuration(elapsedTime)}
          </span>
          <span className="text-gray-600 text-[10px]">|</span>
          <span className={`text-[10px] font-mono px-1 min-w-[40px] text-center ${restTime > 0 ? 'text-rose-400' : 'text-gray-600'}`}>
            {restTime > 0 ? formatDuration(restTime) : '-'}
          </span>
          <div className="flex-1 h-px bg-rose-700/30"></div>
        </div>
      )}
      {/* Bug #13: Swipeable container with delete button */}
      <div className="relative overflow-hidden rounded-lg">
        {/* Delete button (revealed on swipe) - only visible when swiping */}
        {swipeX < 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
            <button onClick={handleDelete} className="w-full h-full flex items-center justify-center text-white font-medium">
              <Icons.Trash />
            </button>
          </div>
        )}
        {/* Main row content */}
        <div
          ref={rowRef}
          className={`grid grid-cols-[40px_50px_1fr_1fr_40px] gap-1 items-center px-2 py-1 ${set.completed ? 'bg-green-500/20' : 'bg-gray-800/50'} relative z-10`}
          style={{
            transform: `translateX(${swipeX}px)`,
            transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
            backgroundColor: set.completed ? 'rgb(34 197 94 / 0.2)' : 'rgb(31 41 55 / 0.5)'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={swipeX < 0 ? resetSwipe : undefined}
        >
          <div className="text-gray-300 font-medium text-sm text-center">{setIndex + 1}</div>
          <div className="text-gray-400 text-xs text-center truncate">{formatPrevious()}</div>
          {fields.length < 2 && <div></div>}
          {fields.slice(0, 2).map((field, idx) => renderInput(field, idx))}
          {fields.length > 2 && fields.slice(2).map((field, idx) => renderInput(field, idx + 2))}
          <div className="flex items-center gap-0.5 justify-self-center">
            {set.rpe && <span className="text-[9px] text-amber-400 font-mono">{set.rpe}</span>}
            <button onClick={onComplete} className={`p-1.5 rounded-lg ${set.completed ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
              <Icons.Check />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Exercise Search Modal with Multi-Select and Superset Support
const ExerciseSearchModal = ({ exercises, onSelect, onSelectMultiple, onClose, allowMultiSelect = true, title }) => {
  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExercises, setSelectedExercises] = useState([]);

  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesBodyPart = selectedBodyPart === 'All' || ex.bodyPart === selectedBodyPart;
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesBodyPart && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const toggleExercise = (ex) => {
    if (selectedExercises.find(e => e.id === ex.id)) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== ex.id));
    } else {
      setSelectedExercises([...selectedExercises, ex]);
    }
  };

  const handleAddIndividually = () => {
    if (onSelectMultiple) {
      onSelectMultiple(selectedExercises, false);
    } else {
      selectedExercises.forEach(ex => onSelect(ex));
    }
    onClose();
  };

  const handleAddAsSuperset = () => {
    if (onSelectMultiple) {
      onSelectMultiple(selectedExercises, true);
    }
    onClose();
  };

  const isSelected = (ex) => selectedExercises.some(e => e.id === ex.id);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-hidden">
      {/* Full screen modal with safe-area at top */}
      <div className="absolute inset-x-0 bottom-0 bg-gray-900 rounded-t-3xl flex flex-col" style={{ top: 'env(safe-area-inset-top)' }}>
        {/* Top Header Bar - Fixed */}
        <div className="p-3 border-b border-gray-800 bg-black rounded-t-3xl">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-rose-400 font-medium">
              Cancel
            </button>
            <span className="font-bold text-white">{title || 'Add Exercises'}</span>
            <div className="w-14"></div>
          </div>
        </div>

        {/* Action Buttons - Fixed at top */}
        {allowMultiSelect && (
          <div className="p-3 bg-gray-800 border-b-2 border-rose-700 flex items-center justify-center gap-2 flex-wrap">
            {selectedExercises.length === 0 ? (
              <span className="text-white text-sm">👆 Tap to select, then use buttons above</span>
            ) : (
              <>
                {selectedExercises.length >= 2 && (
                  <button onClick={handleAddAsSuperset} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 flex items-center gap-1">
                    <Icons.Link /> Superset ({selectedExercises.length})
                  </button>
                )}
                <button onClick={handleAddIndividually} className="bg-rose-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">
                  Add ({selectedExercises.length})
                </button>
              </>
            )}
          </div>
        )}

        {/* Search & Filters - Fixed */}
        <div className="p-3 border-b border-gray-800 bg-gray-900">
          <div className="relative mb-2">
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-800 text-white pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-600" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icons.Search /></span>
          </div>
          <div className="flex gap-2">
            <select value={selectedBodyPart} onChange={e => setSelectedBodyPart(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-2 py-1.5 rounded-lg text-xs focus:outline-none">
              <option value="All">All Body Parts</option>
              {BODY_PARTS.map(bp => <option key={bp} value={bp}>{bp}</option>)}
            </select>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-2 py-1.5 rounded-lg text-xs focus:outline-none">
              <option value="All">All Categories</option>
              {Object.entries(CATEGORIES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </div>
        </div>

        {/* Exercise List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(ex => {
            const selected = isSelected(ex);
            return (
              <button key={ex.id} onClick={() => allowMultiSelect ? toggleExercise(ex) : onSelect(ex)}
                className={`w-full text-left p-4 flex items-center gap-3 border-b border-gray-800/50 ${selected ? 'bg-rose-700/10' : 'hover:bg-gray-800/50'}`}>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                  {ex.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{ex.name}</div>
                  <div className="text-sm text-gray-400">{ex.bodyPart}</div>
                </div>
                {allowMultiSelect && (
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'border-rose-700 bg-rose-700' : 'border-gray-600'}`}>
                    {selected && <Icons.Check />}
                  </div>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && <div className="text-center text-gray-400 py-8">No exercises found</div>}
        </div>
      </div>
    </div>
  );
};

// Workout Complete Modal
const WorkoutCompleteModal = ({ workout, onClose, onSaveAsTemplate }) => {
  const [copied, setCopied] = useState(false);
  const stravaText = generateStravaDescription(workout);
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(stravaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-white">Workout Complete!</h3>
          <p className="text-gray-400 text-sm mt-1">{workout.name} • {Math.round(workout.duration / 60000)} min</p>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white flex items-center gap-2"><Icons.Strava /> Strava Description</span>
              <button onClick={copyToClipboard} className={`text-xs px-3 py-1 rounded-lg flex items-center gap-1 ${copied ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                <Icons.Copy /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-black rounded-lg p-3 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-40">{stravaText}</pre>
          </div>
          <button onClick={() => onSaveAsTemplate(workout)} className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700">Save as Template</button>
          <button onClick={onClose} className="w-full bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800">Done</button>
        </div>
      </div>
    </div>
  );
};

// Create/Edit Exercise Modal
const EditExerciseModal = ({ exercise, onSave, onClose }) => {
  const [name, setName] = useState(exercise?.name || '');
  const [bodyPart, setBodyPart] = useState(exercise?.bodyPart || 'Other');
  const [category, setCategory] = useState(exercise?.category || 'barbell');
  const [instructions, setInstructions] = useState(exercise?.instructions || '');

  const handleSave = () => {
    if (!name.trim()) return;
    // Preserve all existing fields from the exercise, then overlay edits
    onSave({
      ...(exercise || {}),
      id: exercise?.id || Date.now(),
      name: name.trim(),
      bodyPart,
      category,
      instructions: instructions.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">{exercise ? 'Edit' : 'New'} Exercise</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Exercise name"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Body Part</label>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map(bp => (
                <button key={bp} onClick={() => setBodyPart(bp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${bodyPart === bp ? 'bg-rose-700 text-white' : 'bg-gray-800 text-gray-300'}`}>
                  {bp}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES).map(([key, val]) => (
                <button key={key} onClick={() => setCategory(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${category === key ? 'bg-rose-700 text-white' : 'bg-gray-800 text-gray-300'}`}>
                  {val.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Instructions</label>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Cues, form notes, setup details..."
              rows={3}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 resize-none"
            />
          </div>
        </div>
        <button onClick={handleSave} disabled={!name.trim()} className="w-full mt-6 bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800 disabled:opacity-50">
          {exercise ? 'Save Changes' : 'Create Exercise'}
        </button>
      </div>
    </div>
  );
};

// Merge Exercise Modal - merge a duplicate into a primary exercise
const MergeExerciseModal = ({ exercise, allExercises, onMerge, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'confirm'

  // Filter out the current exercise and match search
  // Use index-based identity to handle exercises with missing/undefined IDs (e.g. after cloud sync)
  const exerciseIndex = allExercises.indexOf(exercise);
  const candidates = allExercises
    .filter((ex, idx) => idx !== exerciseIndex && ex.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleMerge = () => {
    if (!selectedTarget) return;
    // Keep the target (primary), delete the current exercise (duplicate)
    // All history/templates referencing `exercise.name` → renamed to `selectedTarget.name`
    onMerge(selectedTarget, exercise);
    onClose();
  };

  const categoryMismatch = selectedTarget && selectedTarget.category !== exercise.category;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            {step === 'select' ? 'Merge Exercise' : 'Confirm Merge'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        </div>

        {step === 'select' && (
          <div className="flex flex-col flex-1 overflow-hidden p-4">
            <div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/10">
              <div className="text-xs text-gray-500 mb-1">Merging away (will be deleted)</div>
              <div className="text-white font-medium">{exercise.name}</div>
              <div className="text-xs text-gray-400">{exercise.bodyPart} · {CATEGORIES[exercise.category]?.label}</div>
            </div>

            <label className="text-sm text-gray-400 mb-2 block">Select the exercise to keep:</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 mb-3"
            />

            <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
              {candidates.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedTarget(ex)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    selectedTarget?.id === ex.id
                      ? 'bg-cyan-900/50 border border-cyan-500/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-white font-medium text-sm">{ex.name}</div>
                  <div className="text-xs text-gray-400">{ex.bodyPart} · {CATEGORIES[ex.category]?.label}</div>
                </button>
              ))}
              {candidates.length === 0 && (
                <div className="text-center text-gray-500 py-4 text-sm">No matching exercises</div>
              )}
            </div>

            <button
              onClick={() => setStep('confirm')}
              disabled={!selectedTarget}
              className="w-full mt-3 bg-cyan-700 text-white py-3 rounded-xl font-medium hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {step === 'confirm' && selectedTarget && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="bg-red-900/20 rounded-xl p-3 border border-red-500/20">
                <div className="text-xs text-red-400 mb-1">Will be deleted</div>
                <div className="text-white font-medium">{exercise.name}</div>
                <div className="text-xs text-gray-400">{exercise.bodyPart} · {CATEGORIES[exercise.category]?.label}</div>
              </div>
              <div className="text-center text-gray-500 text-sm">↓ merges into ↓</div>
              <div className="bg-green-900/20 rounded-xl p-3 border border-green-500/20">
                <div className="text-xs text-green-400 mb-1">Will be kept</div>
                <div className="text-white font-medium">{selectedTarget.name}</div>
                <div className="text-xs text-gray-400">{selectedTarget.bodyPart} · {CATEGORIES[selectedTarget.category]?.label}</div>
              </div>
            </div>

            {categoryMismatch && (
              <div className="bg-amber-900/20 rounded-xl p-3 border border-amber-500/20">
                <div className="text-xs text-amber-400 font-medium mb-1">Category mismatch</div>
                <div className="text-xs text-gray-300">
                  "{exercise.name}" is <span className="text-white">{CATEGORIES[exercise.category]?.label}</span> but
                  "{selectedTarget.name}" is <span className="text-white">{CATEGORIES[selectedTarget.category]?.label}</span>.
                  History will be kept but set fields may differ.
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">
              All workout history and template references for "{exercise.name}" will be updated to "{selectedTarget.name}".
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('select')}
                className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleMerge}
                className="flex-1 bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800"
              >
                Merge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Create Folder Modal
const CreateFolderModal = ({ parentId, onSave, onClose }) => {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">New Folder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.X /></button>
        </div>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Folder name"
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 mb-4" />
        <button onClick={() => { if (name.trim()) { onSave({ id: `folder-${Date.now()}`, name: name.trim(), parentId }); onClose(); } }}
          disabled={!name.trim()} className="w-full bg-rose-700 text-white py-3 rounded-xl font-medium hover:bg-rose-800 disabled:opacity-50">
          Create Folder
        </button>
      </div>
    </div>
  );
};

// Timer Screen
const TimerScreen = () => {
  const [time, setTime] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [presetTime, setPresetTime] = useState(90);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0) setIsRunning(false);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, time]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-black to-gray-900 p-6">
      <h2 className="text-xl font-semibold text-white mb-8">Rest Timer</h2>
      <div className="relative w-64 h-64 mb-8">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="128" cy="128" r="120" fill="none" stroke="#1e293b" strokeWidth="12" />
          <circle cx="128" cy="128" r="120" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 120} strokeDashoffset={2 * Math.PI * 120 * (1 - time / presetTime)} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-white font-mono">{formatDuration(time)}</span>
        </div>
      </div>
      <div className="flex gap-4 mb-8">
        <button onClick={() => setIsRunning(!isRunning)} className="w-16 h-16 rounded-full bg-rose-700 flex items-center justify-center text-white hover:bg-rose-800">
          {isRunning ? <Icons.Pause /> : <Icons.Play />}
        </button>
        <button onClick={() => { setIsRunning(false); setTime(presetTime); }} className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700">
          <Icons.Reset />
        </button>
      </div>
      <div className="flex gap-2">
        {[30, 45, 60, 90, 120, 180].map(p => (
          <button key={p} onClick={() => { setPresetTime(p); setTime(p); setIsRunning(false); }}
            className={`px-4 py-2 rounded-full text-sm font-medium ${presetTime === p ? 'bg-rose-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            {p}s
          </button>
        ))}
      </div>
    </div>
  );
};

// Rest Timer Banner - shows during rest periods
// Bug #6: Added minimize option
const RestTimerBanner = ({ isActive, isMinimized, timeRemaining, totalTime, onSkip, onAddTime, onMinimize, onExpand, exerciseName }) => {
  const bannerRef = useRef(null);
  const touchStartY = useRef(null);
  const touchDeltaY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Reset drag state when timer state changes
  useEffect(() => {
    setDragOffset(0);
    setIsDragging(false);
  }, [isActive, isMinimized]);

  // Use non-passive touch listeners so we can preventDefault to stop page scroll
  useEffect(() => {
    const el = bannerRef.current;
    if (!el || isMinimized) return;

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
      touchDeltaY.current = 0;
      setIsDragging(true);
    };

    const onTouchMove = (e) => {
      if (touchStartY.current === null) return;
      e.preventDefault(); // Prevent page scroll while dragging the banner
      const delta = e.touches[0].clientY - touchStartY.current;
      const clampedDelta = Math.min(0, delta);
      touchDeltaY.current = clampedDelta;
      setDragOffset(clampedDelta);
    };

    const onTouchEnd = () => {
      setIsDragging(false);
      if (touchDeltaY.current < -40) {
        onMinimize?.();
      }
      setDragOffset(0);
      touchStartY.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [isMinimized, onMinimize]);

  if (!isActive) return null;

  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;
  const isUrgent = timeRemaining <= 10;

  // Minimized: Dynamic Island pill
  if (isMinimized) {
    return (
      <div
        className="fixed left-1/2 -translate-x-1/2 z-40"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 4px)' }}
      >
        <button
          onClick={onExpand}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg border transition-all ${
            isUrgent
              ? 'bg-orange-500/95 border-orange-400 animate-pulse'
              : 'bg-rose-700/95 border-rose-500/50'
          }`}
        >
          <Icons.TimerSmall />
          <span className="text-white font-bold font-mono text-sm">{formatDuration(timeRemaining)}</span>
          <div className="w-8 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress * 100}%` }} />
          </div>
        </button>
      </div>
    );
  }

  // Expanded: full banner with swipe-up to minimize
  const opacity = isDragging ? Math.max(0.3, 1 + dragOffset / 120) : 1;

  return (
    <div
      ref={bannerRef}
      className="fixed left-0 right-0 mx-auto max-w-md z-40 px-4"
      style={{
        top: 'calc(env(safe-area-inset-top) + 3rem)',
        transform: `translateY(${dragOffset}px)`,
        opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        touchAction: 'none'
      }}
    >
      <div className={`rounded-2xl px-3 py-2 shadow-lg border ${isUrgent ? 'bg-orange-500/95 border-orange-400 animate-pulse' : 'bg-rose-700/95 border-rose-400'}`}>
        {/* Swipe handle */}
        <div className="flex justify-center mb-1">
          <div className="w-10 h-1 bg-white/40 rounded-full" />
        </div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-white">
            <Icons.TimerSmall />
            <span className="text-xs font-medium">Rest Timer</span>
          </div>
          <span className="text-white/80 text-xs truncate max-w-[140px]">{exerciseName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-2xl font-bold text-white font-mono">{formatDuration(timeRemaining)}</div>
            <div className="h-1 bg-white/30 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress * 100}%` }}></div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => onAddTime(-10)} className="px-2 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-medium">-10s</button>
            <button onClick={() => onAddTime(10)} className="px-2 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-medium">+10s</button>
            <button onClick={onSkip} className="px-2 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-medium">Skip</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Background images mapped to exercise categories
const CATEGORY_BACKGROUNDS = {
  barbell: '/backgrounds/bg-1.jpg',
  dumbbell: '/backgrounds/bg-3.jpg',
  machine: '/backgrounds/bg-8.jpg',
  weighted_bodyweight: '/backgrounds/bg-6.jpg',
  assisted_bodyweight: '/backgrounds/bg-7.jpg',
  reps_only: '/backgrounds/bg-4.jpg',
  cardio: '/backgrounds/bg-5.jpg',
  duration: '/backgrounds/bg-4.jpg',
  band: '/backgrounds/bg-9.jpg',
};

// Exercise Detail Modal with About, History, Charts, Records tabs
const ExerciseDetailModal = ({ exercise, history, onEdit, onMerge, onDelete, onClose, onUpdateNotes, templates }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(exercise.notes || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const backgroundImage = CATEGORY_BACKGROUNDS[exercise.category] || '/backgrounds/bg-1.jpg';

  // Get all instances of this exercise from history (guard against undefined/null)
  const exerciseHistory = (history || []).flatMap(workout =>
    (workout.exercises || [])
      .filter(ex => ex.name === exercise.name)
      .map(ex => ({
        ...ex,
        workoutDate: workout.startTime,
        workoutName: workout.name
      }))
  ).sort((a, b) => b.workoutDate - a.workoutDate);

  // Calculate records
  const records = {
    maxWeight: 0,
    maxReps: 0,
    maxVolume: 0,
    maxDuration: 0,
    maxDistance: 0,
    totalSets: 0,
    totalVolume: 0,
  };

  exerciseHistory.forEach(ex => {
    ex.sets.filter(s => s.completed).forEach(set => {
      records.totalSets++;
      if (set.weight) {
        records.maxWeight = Math.max(records.maxWeight, set.weight);
        const volume = (set.weight || 0) * (set.reps || 0);
        records.maxVolume = Math.max(records.maxVolume, volume);
        records.totalVolume += volume;
      }
      if (set.reps) records.maxReps = Math.max(records.maxReps, set.reps);
      if (set.duration) records.maxDuration = Math.max(records.maxDuration, set.duration);
      if (set.distance) records.maxDistance = Math.max(records.maxDistance, set.distance);
    });
  });

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'history', label: 'History' },
    { id: 'charts', label: 'Charts' },
    { id: 'records', label: 'Records' },
  ];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Hero Header with Background Image */}
      <div className="relative h-48 flex-shrink-0">
        <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black"></div>
        <div className="relative z-10 h-full flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="px-4 py-3 flex items-center justify-between">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 border border-white/20"><Icons.X /></button>
            <div className="flex items-center gap-2">
              {onDelete && <button onClick={() => setShowDeleteConfirm(true)} className="w-10 h-10 rounded-full bg-red-900/40 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-red-900/60 border border-red-800/40"><Icons.Trash /></button>}
              {onMerge && <button onClick={onMerge} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-cyan-300 font-medium hover:bg-white/20 border border-white/20 text-sm">Merge</button>}
              {onEdit && !onUpdateNotes && <button onClick={onEdit} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 border border-white/20">Edit</button>}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end p-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{exercise.name}</h2>
            <p className="text-white/80 text-sm">{exercise.bodyPart} • {CATEGORIES[exercise.category]?.label}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 backdrop-blur-sm border-b border-white/10">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-white border-b-2 border-white' : 'text-white/50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-black" style={{ overscrollBehavior: 'contain' }}>
        {activeTab === 'about' && (
          <div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
              <h3 className="text-sm font-semibold text-white/60 mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{exerciseHistory.length}</div>
                  <div className="text-xs text-white/60">Times Performed</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{records.totalSets}</div>
                  <div className="text-xs text-white/60">Total Sets</div>
                </div>
                {records.maxWeight > 0 && (
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{records.maxWeight}</div>
                    <div className="text-xs text-white/60">Max Weight (lbs)</div>
                  </div>
                )}
                {records.maxReps > 0 && (
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{records.maxReps}</div>
                    <div className="text-xs text-white/60">Max Reps</div>
                  </div>
                )}
              </div>
            </div>
            {/* Read-only instructions from the exercise library */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4">
              <h3 className="text-sm font-semibold text-white/60 mb-2">Instructions</h3>
              <p className="text-white/80 text-sm" style={{ whiteSpace: 'pre-line' }}>
                {exercise.instructions || "No instructions added yet. Go to Exercises to add instructions."}
              </p>
            </div>
            {/* Editable per-workout notes — only shown when opened from an active workout */}
            {onUpdateNotes && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="text-sm font-semibold text-white/60 mb-2">Workout Notes</h3>
                {editingNotes ? (
                  <div>
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="Add notes for this exercise in today's workout..."
                      className="w-full bg-white/10 text-white text-sm rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-cyan-500 border border-white/20 resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { onUpdateNotes?.(notesText); setEditingNotes(false); }}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium">Save</button>
                      <button onClick={() => { setNotesText(exercise.notes || ''); setEditingNotes(false); }}
                        className="px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="text-left w-full cursor-pointer hover:bg-white/5 rounded-lg -m-1 p-1"
                  >
                    <p className="text-white/80 text-sm" style={{ whiteSpace: 'pre-line' }}>
                      {exercise.notes || "Tap to add notes for this exercise."}
                    </p>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {exerciseHistory.length === 0 ? (
              <div className="text-center text-white/50 py-8">No history for this exercise yet</div>
            ) : (
              exerciseHistory.map((ex, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3 border border-white/20">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-white">{ex.workoutName}</div>
                    <div className="text-xs text-white/50">{new Date(ex.workoutDate).toLocaleDateString()}</div>
                  </div>
                  <div className="space-y-1">
                    {ex.sets.filter(s => s.completed).map((set, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <span className="text-white/40 w-6">{j + 1}</span>
                        {set.weight !== undefined && <span className="text-white">{set.weight} lbs</span>}
                        {set.reps !== undefined && <span className="text-white/60">× {set.reps}</span>}
                        {set.duration !== undefined && <span className="text-white">{formatDuration(set.duration)}</span>}
                        {set.distance !== undefined && <span className="text-white">{set.distance} km</span>}
                        {set.bandColor && <span className={`${BAND_COLORS[set.bandColor]?.bg} ${BAND_COLORS[set.bandColor]?.text} px-2 py-0.5 rounded text-xs`}>{set.bandColor}</span>}
                        {set.rpe && <span className="text-white/70 text-xs bg-white/10 px-2 py-0.5 rounded">RPE {set.rpe}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div>
            {exerciseHistory.length === 0 ? (
              <div className="text-center text-white/50 py-8">Complete this exercise to see charts</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="text-sm font-semibold text-white/60 mb-4">Max Weight Over Time</h3>
                  <div className="flex items-end gap-1 h-32">
                    {exerciseHistory.slice(0, 10).reverse().map((ex, i) => {
                      const maxW = Math.max(...ex.sets.filter(s => s.completed && s.weight).map(s => s.weight), 0);
                      const heightPct = records.maxWeight > 0 ? (maxW / records.maxWeight) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-rose-600 rounded-t" style={{ height: `${heightPct}%`, minHeight: maxW > 0 ? '4px' : '0' }}></div>
                          <span className="text-xs text-white/40">{new Date(ex.workoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="text-sm font-semibold text-white/60 mb-4">Volume Over Time</h3>
                  <div className="flex items-end gap-1 h-32">
                    {exerciseHistory.slice(0, 10).reverse().map((ex, i) => {
                      const vol = ex.sets.filter(s => s.completed).reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0);
                      const maxVol = Math.max(...exerciseHistory.map(e => e.sets.filter(s => s.completed).reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0)));
                      const heightPct = maxVol > 0 ? (vol / maxVol) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-teal-500 rounded-t" style={{ height: `${heightPct}%`, minHeight: vol > 0 ? '4px' : '0' }}></div>
                          <span className="text-xs text-white/40">{new Date(ex.workoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <div>
            {exerciseHistory.length === 0 ? (
              <div className="text-center text-white/50 py-8">Complete this exercise to see records</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {records.maxWeight > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{records.maxWeight}</div>
                    <div className="text-xs text-white/50 mt-1">Max Weight (lbs)</div>
                  </div>
                )}
                {records.maxReps > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{records.maxReps}</div>
                    <div className="text-xs text-white/50 mt-1">Max Reps</div>
                  </div>
                )}
                {records.maxVolume > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{records.maxVolume.toLocaleString()}</div>
                    <div className="text-xs text-white/50 mt-1">Max Volume (lbs)</div>
                  </div>
                )}
                {records.totalVolume > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{records.totalVolume.toLocaleString()}</div>
                    <div className="text-xs text-white/50 mt-1">Total Volume (lbs)</div>
                  </div>
                )}
                {records.maxDuration > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{formatDuration(records.maxDuration)}</div>
                    <div className="text-xs text-white/50 mt-1">Max Duration</div>
                  </div>
                )}
                {records.maxDistance > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{records.maxDistance}</div>
                    <div className="text-xs text-white/50 mt-1">Max Distance (km)</div>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-3xl font-bold text-white">{records.totalSets}</div>
                  <div className="text-xs text-white/50 mt-1">Total Sets</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-3xl font-bold text-white">{exerciseHistory.length}</div>
                  <div className="text-xs text-white/50 mt-1">Times Performed</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (() => {
        const templateCount = (templates || []).filter(t =>
          t.exercises?.some(ex => ex.name === exercise.name)
        ).length;
        const historyCount = exerciseHistory.length;

        return (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-2">Delete "{exercise.name}"?</h3>
              <p className="text-sm text-gray-400 mb-4">This removes the exercise from your library. Your workout history is not affected.</p>

              {(templateCount > 0 || historyCount > 0) && (
                <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3 mb-4 space-y-1">
                  {templateCount > 0 && (
                    <p className="text-sm text-amber-400">
                      Used in {templateCount} template{templateCount !== 1 ? 's' : ''}
                    </p>
                  )}
                  {historyCount > 0 && (
                    <p className="text-sm text-amber-400">
                      Appears in {historyCount} workout{historyCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-medium hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onDelete(exercise.id); onClose(); }}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export { NumberPad, DurationPad, SetInputRow, ExerciseSearchModal, ExerciseDetailModal, WorkoutCompleteModal, RestTimerBanner, CreateFolderModal, EditExerciseModal, MergeExerciseModal };
