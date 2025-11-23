import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const HEALTH_URL = API_URL.replace('/api', '/health');

export function useBackendHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(HEALTH_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setHealth(data);
          setError(null);
        } else {
          setError(`Health check returned ${response.status}`);
          setHealth(null);
        }
      } catch (err) {
        setError(err.message);
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();

    // Check every 10 minutes (600 seconds) to keep Render.com from sleeping (15 min timeout)
    // and reduce clutter in logs
    const interval = setInterval(checkHealth, 600000);
    return () => clearInterval(interval);
  }, []);

  return { health, loading, error, isAlive: health?.status === 'ok' };
}
