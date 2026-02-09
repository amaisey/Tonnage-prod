// Body Parts
export const BODY_PARTS = ['Arms', 'Back', 'Cardio', 'Chest', 'Core', 'Full Body', 'Legs', 'Olympic', 'Shoulders', 'Other'];

// Exercise Categories with their input fields
export const CATEGORIES = {
  barbell: { label: 'Barbell', fields: ['weight', 'reps'] },
  dumbbell: { label: 'Dumbbell', fields: ['weight', 'reps'] },
  machine: { label: 'Machine / Other', fields: ['weight', 'reps'] },
  weighted_bodyweight: { label: 'Weighted Bodyweight', fields: ['weight', 'reps'] },
  assisted_bodyweight: { label: 'Assisted Bodyweight', fields: ['assistedWeight', 'reps'] },
  reps_only: { label: 'Reps Only', fields: ['reps'] },
  cardio: { label: 'Cardio', fields: ['distance', 'duration'] },
  duration: { label: 'Duration', fields: ['duration'] },
  band: { label: 'Resistance Band', fields: ['bandColor', 'reps'] },
};

// Band color options with display colors - ordered by resistance level
export const BAND_COLORS = {
  yellow: { label: 'Yellow (X-Light)', bg: 'bg-yellow-400', text: 'text-black' },
  orange: { label: 'Orange (Light-Med)', bg: 'bg-orange-500', text: 'text-white' },
  red: { label: 'Red (Light)', bg: 'bg-red-500', text: 'text-white' },
  green: { label: 'Green (Medium)', bg: 'bg-green-500', text: 'text-white' },
  blue: { label: 'Blue (Heavy)', bg: 'bg-blue-500', text: 'text-white' },
  black: { label: 'Black (X-Heavy)', bg: 'bg-gray-900', text: 'text-white' },
  purple: { label: 'Purple (XX-Heavy)', bg: 'bg-purple-600', text: 'text-white' },
};

// Exercise types for workout organization
export const EXERCISE_TYPES = {
  warmup: { label: 'Warm-up', color: 'bg-amber-500', icon: '🔥' },
  main: { label: 'Main', color: 'bg-rose-600', icon: '💪' },
  accessory: { label: 'Accessory', color: 'bg-blue-500', icon: '🎯' },
  corrective: { label: 'Corrective', color: 'bg-green-500', icon: '⚖️' },
  mobility: { label: 'Mobility', color: 'bg-purple-500', icon: '🧘' },
};

// Exercise phases for workout structure (collapsible sections)
export const EXERCISE_PHASES = {
  warmup: { label: 'Warm-up', color: 'bg-amber-500', textColor: 'text-amber-400', borderColor: 'border-amber-500/50', icon: '🔥', order: 1 },
  workout: { label: 'Workout', color: 'bg-rose-600', textColor: 'text-rose-400', borderColor: 'border-rose-500/50', icon: '💪', order: 2 },
  cooldown: { label: 'Cool Down', color: 'bg-teal-500', textColor: 'text-teal-400', borderColor: 'border-teal-500/50', icon: '🧊', order: 3 },
};

// Superset group colors - used to visually distinguish separate superset groups
export const SUPERSET_COLORS = [
  { border: 'border-teal-500', bg: 'bg-teal-500', text: 'text-teal-400', dot: 'bg-teal-500' },
  { border: 'border-violet-500', bg: 'bg-violet-500', text: 'text-violet-400', dot: 'bg-violet-500' },
  { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-400', dot: 'bg-amber-500' },
  { border: 'border-sky-500', bg: 'bg-sky-500', text: 'text-sky-400', dot: 'bg-sky-500' },
  { border: 'border-rose-400', bg: 'bg-rose-400', text: 'text-rose-400', dot: 'bg-rose-400' },
  { border: 'border-lime-500', bg: 'bg-lime-500', text: 'text-lime-400', dot: 'bg-lime-500' },
];

// RPE descriptions
export const RPE_DESCRIPTIONS = {
  6: 'Could do 4+ more reps',
  6.5: 'Could do 3-4 more reps',
  7: 'Could do 3 more reps',
  7.5: 'Could do 2-3 more reps',
  8: 'Could do 2 more reps',
  8.5: 'Could do 1-2 more reps',
  9: 'Could do 1 more rep',
  9.5: 'Maybe 1 more rep',
  10: 'Maximum effort'
};
