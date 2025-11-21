import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (authToken) => {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setError(null);
      } else {
        setToken(null);
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Token verification error:', err);
      setToken(null);
      setUser(null);
    }
  };

  const loginWithSteam = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get login URL from backend
      const response = await fetch(`${API_URL.replace('/api', '')}/auth/login`);
      const data = await response.json();

      // Redirect to Steam login
      if (data.login_url) {
        window.location.href = data.login_url;
      }
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthCallback = async (queryParams) => {
    try {
      setLoading(true);
      
      // Send callback params to backend
      const params = new URLSearchParams(queryParams);
      const response = await fetch(`${API_URL.replace('/api', '')}/auth/callback?${params}`);
      const data = await response.json();

      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        setError(null);
        return true;
      }
    } catch (err) {
      setError(err.message);
      console.error('Callback error:', err);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const logout = async () => {
    try {
      setLoading(true);

      if (token) {
        await fetch(`${API_URL.replace('/api', '')}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    loginWithSteam,
    handleAuthCallback,
    logout
  };
}
