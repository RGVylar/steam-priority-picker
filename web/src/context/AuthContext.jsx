import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const verifyingRef = useRef(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Listen to localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('auth_token');
      console.log('Storage changed, new token:', newToken ? newToken.substring(0, 20) + '...' : 'null');
      setToken(newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Verify token whenever it changes
  useEffect(() => {
    if (token && !verifyingRef.current) {
      verifyingRef.current = true;
      verifyToken(token).finally(() => {
        verifyingRef.current = false;
      });
    } else if (!token) {
      setUser(null);
    }
  }, [token]);

  const verifyToken = async (authToken) => {
    try {
      console.log('Verifying token:', authToken.substring(0, 20) + '...');
      const response = await fetch(`${API_URL.replace('/api', '')}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setError(null);
        console.log('✅ Token verified, user:', userData.username);
      } else {
        console.log('❌ Token invalid, status:', response.status);
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

      const response = await fetch(`${API_URL.replace('/api', '')}/auth/login`);
      const data = await response.json();

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

  const value = {
    user,
    token,
    setToken,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    loginWithSteam,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
