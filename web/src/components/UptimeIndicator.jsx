import { useBackendUptime } from '../hooks/useBackendUptime'
import { useAuthContext } from '../context/AuthContext'

export function UptimeIndicator() {
  const { backendUptime, webUptime } = useBackendUptime()
  const { isAuthenticated } = useAuthContext()

  // Only show if authenticated and uptime is available
  if (!isAuthenticated || !backendUptime) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
        <span>Backend: {backendUptime}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
        <span>Web: {webUptime}</span>
      </div>
    </div>
  )
}
