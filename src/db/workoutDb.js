import Dexie from 'dexie';

// Create the database
export const db = new Dexie('WorkoutTrackerDB');

// Define schema
// Version 1: Initial schema
db.version(1).stores({
  // Workouts table - indexed by date for fast sorting/filtering
  // Also index by name for searching
  workouts: '++id, date, name, duration',

  // Metadata table for app settings and migration status
  metadata: 'key'
});

// Helper to check if Strong history has been imported
export async function isHistoryImported() {
  const record = await db.metadata.get('strongHistoryImported');
  return record?.value === true;
}

// Mark Strong history as imported
export async function markHistoryImported() {
  await db.metadata.put({ key: 'strongHistoryImported', value: true });
}

// Workout CRUD operations
export const workoutDb = {
  // Add a single workout
  async add(workout) {
    // Ensure workout has required fields
    const record = {
      ...workout,
      date: workout.date || Date.now(),
    };
    return await db.workouts.add(record);
  },

  // Add multiple workouts (bulk insert)
  async bulkAdd(workouts) {
    return await db.workouts.bulkAdd(workouts);
  },

  // Get workout by ID
  async get(id) {
    return await db.workouts.get(id);
  },

  // Get workouts with pagination (most recent first)
  async getPage(page = 0, pageSize = 20) {
    const offset = page * pageSize;
    const workouts = await db.workouts
      .orderBy('date')
      .reverse()
      .offset(offset)
      .limit(pageSize)
      .toArray();
    return workouts;
  },

  // Get all workouts (use sparingly - for export/backup)
  async getAll() {
    return await db.workouts.orderBy('date').reverse().toArray();
  },

  // Get total count
  async count() {
    return await db.workouts.count();
  },

  // Search workouts by exercise name
  async searchByExercise(exerciseName, limit = 50) {
    const allWorkouts = await db.workouts.orderBy('date').reverse().toArray();
    const matches = [];

    for (const workout of allWorkouts) {
      if (matches.length >= limit) break;
      const hasExercise = workout.exercises?.some(
        ex => ex.name.toLowerCase().includes(exerciseName.toLowerCase())
      );
      if (hasExercise) {
        matches.push(workout);
      }
    }
    return matches;
  },

  // Get workouts in date range
  async getByDateRange(startDate, endDate) {
    return await db.workouts
      .where('date')
      .between(startDate, endDate)
      .reverse()
      .toArray();
  },

  // Get the most recent workout containing a specific exercise
  async getLastWorkoutWithExercise(exerciseName) {
    const workouts = await db.workouts.orderBy('date').reverse().toArray();
    for (const workout of workouts) {
      const exercise = workout.exercises?.find(
        ex => ex.name === exerciseName && ex.sets?.some(s => s.completed)
      );
      if (exercise) {
        return { workout, exercise };
      }
    }
    return null;
  },

  // Update a workout
  async update(id, changes) {
    return await db.workouts.update(id, changes);
  },

  // Delete a workout
  async delete(id) {
    return await db.workouts.delete(id);
  },

  // Clear all workouts (use with caution!)
  async clear() {
    return await db.workouts.clear();
  }
};
