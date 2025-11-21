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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Authenticating...</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Please wait while we verify your Steam account</p>
      </div>
    </div>
  );
}
