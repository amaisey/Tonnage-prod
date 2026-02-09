import { useState, useEffect } from 'react';
import { isHistoryImported, markHistoryImported } from '../db/workoutDb';

/**
 * Component that ensures the history-imported flag is set.
 * No longer auto-loads from /strong-history.json.
 * Users import their own data via Settings.
 */
export function HistoryMigration({ children }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;

    async function checkAndMark() {
      try {
        const imported = await isHistoryImported();
        if (!imported) {
          // Mark as imported immediately — no auto-fetch
          await markHistoryImported();
        }
        if (mounted) setStatus('complete');
      } catch (err) {
        console.error('Migration check error:', err);
        // Still render app even on error
        if (mounted) setStatus('complete');
      }
    }

    checkAndMark();
    return () => { mounted = false; };
  }, []);

  if (status === 'checking') {
    return (
      <div className="w-full h-[100dvh] bg-black flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    );
  }

  return children;
}
