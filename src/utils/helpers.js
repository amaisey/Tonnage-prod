export const formatDuration = (seconds) => {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}:${secs.toString().padStart(2, '0')}`;
  return `${secs}s`;
};

export const formatDistance = (km) => km ? `${km} km` : '-';

export const getDefaultSetForCategory = (category) => {
  switch (category) {
    case 'cardio': return { distance: '', duration: '', completed: false };
    case 'duration': return { duration: '', completed: false };
    case 'reps_only': return { reps: '', completed: false };
    case 'assisted_bodyweight': return { assistedWeight: '', reps: '', completed: false };
    case 'band': return { bandColor: 'green', reps: '', completed: false };
    default: return { weight: '', reps: '', completed: false };
  }
};

export const generateStravaDescription = (workout) => {
  const duration = Math.round(workout.duration / 60000);
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  let description = `💪 ${workout.name}\n⏱️ ${duration} min | ${totalSets} sets\n\n`;

  const formatSets = (completedSets) => {
    return completedSets.map(s => {
      let str = '';
      if (s.weight !== undefined) str = `${s.weight}lb×${s.reps}`;
      else if (s.reps !== undefined) str = `${s.reps} reps`;
      else if (s.duration !== undefined) str = formatDuration(s.duration);
      if (s.rpe) str += ` @${s.rpe}`;
      return str;
    }).join(', ');
  };

  // Group by superset for display
  const used = new Set();
  workout.exercises.forEach((ex, i) => {
    if (used.has(i)) return;
    const completedSets = ex.sets.filter(s => s.completed);
    if (completedSets.length === 0) { used.add(i); return; }

    if (ex.supersetId) {
      // Gather all superset exercises
      const ssExercises = [];
      workout.exercises.forEach((e, j) => {
        if (e.supersetId === ex.supersetId) {
          ssExercises.push(e);
          used.add(j);
        }
      });
      if (ssExercises.length > 1) {
        description += `⚡ Superset:\n`;
        ssExercises.forEach(ssEx => {
          const sets = ssEx.sets.filter(s => s.completed);
          if (sets.length > 0) {
            description += `  ${ssEx.name}: ${formatSets(sets)}\n`;
          }
        });
      } else {
        description += `${ex.name}: ${formatSets(completedSets)}\n`;
      }
    } else {
      used.add(i);
      description += `${ex.name}: ${formatSets(completedSets)}\n`;
    }
  });
  return description;
};

// Generate a blank AI boilerplate that teaches an AI how to create Tonnage templates
export const generateTemplateAIBoilerplate = () => {
  return `# Tonnage Workout Template Format

You are helping create a workout template for the Tonnage app. Return ONLY a valid JSON object (no markdown, no code fences).

## JSON Structure

{
  "name": "Template Name",
  "estimatedTime": 60,         // estimated minutes (optional)
  "notes": "",                  // template-level notes (optional)
  "exercises": [
    {
      "name": "Exercise Name",
      "bodyPart": "Chest",       // Chest, Back, Shoulders, Legs, Arms, Core, Cardio, Other
      "category": "barbell",     // barbell, dumbbell, machine, reps_only, duration, band, assisted_bodyweight, cardio
      "phase": "workout",        // warmup, workout, cooldown
      "restTime": 90,            // rest time in seconds between sets (0 = no rest)
      "notes": "",               // exercise-specific notes (optional)
      "sets": [
        { "weight": 135, "reps": 10 }   // repeat for each set
      ]
    }
  ]
}

## Set Formats by Category
- barbell/dumbbell/machine: { "weight": NUMBER, "reps": NUMBER }
- reps_only: { "reps": NUMBER }
- duration: { "duration": NUMBER }  (seconds)
- cardio: { "distance": NUMBER, "duration": NUMBER }
- band: { "bandColor": "COLOR", "reps": NUMBER }  (red/black/purple/green/blue/yellow)
- assisted_bodyweight: { "assistedWeight": NUMBER, "reps": NUMBER }

## Optional Set Fields
- "rpe": NUMBER (1-10, rate of perceived exertion)

## Supersets
Give exercises the same "supersetId" string to group them. Non-last exercises in a superset should have restTime: 0.
Example:
  { "name": "Bench Press", "supersetId": "ss1", "restTime": 0, ... },
  { "name": "Bent Over Row", "supersetId": "ss1", "restTime": 90, ... }

## Phases
- "warmup": lighter prep exercises
- "workout": main working sets
- "cooldown": stretching/mobility

## Import
To import into Tonnage: Templates tab → Import button (top-right) → paste JSON → Import.
`;
};

// Generate AI-friendly JSON export of a template (for pasting into an AI chat to modify)
export const generateTemplateAIExport = (template) => {
  return JSON.stringify({
    _instructions: "This is a workout template from the Tonnage app. Modify anything below and return the result as JSON. You can change exercises, sets, reps, weights, rest times (in seconds), phases (warmup/workout/cooldown), and superset groupings (exercises sharing the same supersetId are performed back-to-back). Valid categories: barbell, dumbbell, machine, reps_only, duration, band, assisted_bodyweight, cardio. Return ONLY the JSON object with name, exercises, and optionally estimatedTime/notes — remove the _instructions and _importInstructions fields.",
    name: template.name,
    estimatedTime: template.estimatedTime || null,
    notes: template.notes || '',
    exercises: template.exercises.map(ex => {
      const exercise = {
        name: ex.name,
        bodyPart: ex.bodyPart || 'Other',
        category: ex.category || 'machine',
        phase: ex.phase || 'workout',
        restTime: ex.restTime ?? 90,
        sets: (ex.sets || []).map(s => {
          const set = {};
          if (s.weight !== undefined) set.weight = s.weight;
          if (s.reps !== undefined) set.reps = s.reps;
          if (s.duration !== undefined) set.duration = s.duration;
          if (s.distance !== undefined) set.distance = s.distance;
          if (s.bandColor !== undefined) set.bandColor = s.bandColor;
          if (s.rpe !== undefined) set.rpe = s.rpe;
          return set;
        })
      };
      if (ex.supersetId) exercise.supersetId = ex.supersetId;
      if (ex.notes) exercise.notes = ex.notes;
      if (ex.highlight) exercise.highlight = true;
      if (ex.exerciseType) exercise.exerciseType = ex.exerciseType;
      return exercise;
    }),
    _importInstructions: "To import back into Tonnage: go to Templates tab > tap the Import button (top-right) > paste the modified JSON > tap Import."
  }, null, 2);
};

// Generate a simple text summary of a template (for sharing with workout buddies)
export const generateTemplateSummary = (template) => {
  const totalSets = template.exercises.reduce((t, ex) => t + (ex.sets?.length || 3), 0);
  const estTime = template.estimatedTime || '';

  let text = `💪 ${template.name}\n`;
  if (estTime) text += `⏱️ ~${estTime} min | `;
  text += `${totalSets} sets\n`;
  if (template.notes) text += `📋 ${template.notes}\n`;

  const phaseConfig = {
    warmup: { emoji: '🔥', label: 'Warmup' },
    workout: { emoji: '🏋️', label: 'Workout' },
    cooldown: { emoji: '🧘', label: 'Cooldown' }
  };

  // Group exercises by phase
  const phases = { warmup: [], workout: [], cooldown: [] };
  template.exercises.forEach((ex) => {
    phases[ex.phase || 'workout'].push(ex);
  });

  // Helper: format a single set for display
  const formatSet = (s) => {
    if (s.weight !== undefined && s.reps !== undefined) return `${s.weight}lb×${s.reps}`;
    if (s.reps !== undefined) return `${s.reps} reps`;
    if (s.duration !== undefined) return formatDuration(s.duration);
    if (s.distance !== undefined) return `${s.distance}mi`;
    if (s.bandColor !== undefined) return `${s.reps || '?'}× ${s.bandColor} band`;
    return '?';
  };

  // Helper: collapse identical sets into compact form
  const collapseSets = (sets) => {
    if (!sets || sets.length === 0) return '0 sets';
    const key = (s) => formatSet(s);
    const first = key(sets[0]);
    const allSame = sets.every(s => key(s) === first);
    if (allSame) {
      const s = sets[0];
      if (s.weight !== undefined && s.reps !== undefined) return `${sets.length}×${s.reps} @ ${s.weight}lb`;
      if (s.reps !== undefined) return `${sets.length}×${s.reps} reps`;
      if (s.duration !== undefined) return `${sets.length}×${formatDuration(s.duration)}`;
      if (s.distance !== undefined) return `${sets.length}×${s.distance}mi`;
      if (s.bandColor !== undefined) return `${sets.length}×${s.reps} (${s.bandColor} band)`;
      return `${sets.length} sets`;
    }
    return sets.map(s => formatSet(s)).join(', ');
  };

  // Helper: format rest time inline
  const restStr = (restTime) => {
    if (!restTime || restTime <= 0) return '';
    return ` (rest ${formatDuration(restTime)})`;
  };

  Object.entries(phaseConfig).forEach(([phaseKey, { emoji, label }]) => {
    const exerciseList = phases[phaseKey];
    if (exerciseList.length === 0) return;

    text += `\n${emoji} ${label}\n`;

    // Group by superset
    const used = new Set();
    exerciseList.forEach((ex, i) => {
      if (used.has(i)) return;

      if (ex.supersetId) {
        // Find all exercises in this superset
        const ssExercises = [];
        exerciseList.forEach((e, j) => {
          if (e.supersetId === ex.supersetId) {
            ssExercises.push(e);
            used.add(j);
          }
        });
        text += `  ⚡ Superset:\n`;
        const lastEx = ssExercises[ssExercises.length - 1];
        ssExercises.forEach(ssEx => {
          text += `    ${ssEx.name}: ${collapseSets(ssEx.sets)}\n`;
        });
        const ssRest = lastEx.restTime;
        if (ssRest && ssRest > 0) text += `  ${restStr(ssRest).trim()}\n`;
      } else {
        used.add(i);
        text += `  ${ex.name}: ${collapseSets(ex.sets)}${restStr(ex.restTime)}\n`;
      }
    });
  });

  return text.trimEnd();
};

export const exportWorkoutJSON = (workout) => {
  return JSON.stringify({
    name: workout.name,
    date: new Date(workout.date || workout.startTime).toISOString(),
    duration: workout.duration,
    exercises: workout.exercises.map(ex => ({
      name: ex.name,
      bodyPart: ex.bodyPart,
      category: ex.category,
      sets: ex.sets.filter(s => s.completed).map(s => {
        const set = {};
        if (s.weight !== undefined) set.weight = s.weight;
        if (s.reps !== undefined) set.reps = s.reps;
        if (s.duration !== undefined) set.duration = s.duration;
        if (s.distance !== undefined) set.distance = s.distance;
        if (s.rpe !== undefined) set.rpe = s.rpe;
        return set;
      })
    }))
  }, null, 2);
};
