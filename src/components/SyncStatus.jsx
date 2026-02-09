export default function SyncStatus({ status }) {
  const config = {
    idle: { color: 'bg-green-500', label: 'Synced' },
    syncing: { color: 'bg-cyan-500 animate-pulse', label: 'Syncing...' },
    error: { color: 'bg-red-500', label: 'Sync Error' },
    offline: { color: 'bg-yellow-500', label: 'Offline' },
  }

  const { color, label } = config[status] || config.idle

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}
