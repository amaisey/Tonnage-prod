// Script to load processed history into IndexedDB
// Usage: Import this in your app and call loadHistoryIntoDb()

import { importedHistoryWithPhases } from './importedHistoryWithPhases';
import { workoutDb } from '../db/workoutDb';

export async function loadHistoryIntoDb() {
  const existing = await workoutDb.getAll();

  if (existing.length > 0) {
    console.log(`Database already has ${existing.length} workouts. Skipping import.`);
    return { imported: 0, existing: existing.length };
  }

  console.log(`Importing ${importedHistoryWithPhases.length} workouts...`);

  let imported = 0;
  for (const workout of importedHistoryWithPhases) {
    try {
      await workoutDb.add(workout);
      imported++;
    } catch (err) {
      console.warn(`Failed to import workout: ${workout.name}`, err);
    }
  }

  console.log(`Successfully imported ${imported} workouts`);
  return { imported, existing: 0 };
}

export async function clearAndReloadHistory() {
  console.log('Clearing existing history...');
  const existing = await workoutDb.getAll();
  for (const workout of existing) {
    await workoutDb.delete(workout.id);
  }

  console.log(`Importing ${importedHistoryWithPhases.length} workouts...`);
  let imported = 0;
  for (const workout of importedHistoryWithPhases) {
    try {
      await workoutDb.add(workout);
      imported++;
    } catch (err) {
      console.warn(`Failed to import workout: ${workout.name}`, err);
    }
  }

  console.log(`Successfully imported ${imported} workouts`);
  return { imported };
}
