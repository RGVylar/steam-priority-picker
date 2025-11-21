import { useAuth } from '../hooks/useAuth';

export function LoginButton() {
  const { user, isAuthenticated, loading, error, loginWithSteam, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <img 
          src={user.avatar_url} 
          alt={user.username}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{user.username}</span>
          <button
            onClick={logout}
            disabled={loading}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={loginWithSteam}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.5 0C5.1 0 0 5.1 0 11.5s5.1 11.5 11.5 11.5 11.5-5.1 11.5-11.5S17.9 0 11.5 0zm6.8 12.6l-4.1 5.9-3.1-2.3 4.3-6.2h2.9zm-6.8-4.6l3.1 2.3-4.3 6.2h-2.9l4.1-5.9 0-2.6z"/>
      </svg>
      {loading ? 'Logging in...' : 'Login with Steam'}
    </button>
  );
}
