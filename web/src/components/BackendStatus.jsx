import { useBackendHealth } from '../hooks/useBackendHealth';

export function BackendStatus() {
  const { health, loading, error, isAlive } = useBackendHealth();

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 glass text-white px-4 py-2 rounded-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span className="text-sm">Checking backend...</span>
      </div>
    );
  }

  if (isAlive) {
    return (
      <div className="fixed bottom-4 right-4 glass-tinted bg-green-500/20 backdrop-blur-xl text-green-100 px-4 py-2 rounded-lg flex items-center gap-2 border border-green-400/20 hover:bg-green-500/30">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-sm">Backend online</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 glass-tinted bg-red-500/20 backdrop-blur-xl text-red-100 px-4 py-2 rounded-lg flex items-center gap-2 border border-red-400/20 hover:bg-red-500/30">
      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
      <span className="text-sm">Backend offline</span>
      {error && <span className="text-xs opacity-75">({error})</span>}
    </div>
  );
}
