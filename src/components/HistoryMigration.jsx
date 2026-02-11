/**
 * HistoryMigration wrapper - previously handled one-time import of Strong history.
 * Now a passthrough since default workout history has been removed.
 * Kept as a component wrapper for potential future migration needs.
 */
export function HistoryMigration({ children }) {
  return children;
}
