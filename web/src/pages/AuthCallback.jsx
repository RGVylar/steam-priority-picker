import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just wait a moment then redirect to home
    // The token is handled by App.jsx from the URL
    setTimeout(() => navigate('/'), 500);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-white/30 via-transparent to-gray-200/30 dark:from-slate-800/20 dark:via-transparent dark:to-slate-950/40" />
      
      <div className="relative z-10 text-center">
        <div className="glass bg-white/20 dark:bg-gray-800/20 p-12 rounded-2xl border border-white/20 dark:border-gray-700/30 max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 mx-auto mb-6"></div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Authenticating...</h1>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we verify your Steam account</p>
        </div>
      </div>
    </div>
  );
}
