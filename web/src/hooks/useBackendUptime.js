import { useState, useEffect } from 'react'
import { useAuthContext } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export function useBackendUptime() {
  const [uptime, setUptime] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [webStartTime] = useState(new Date())
  const { token } = useAuthContext()

  // Check if user is admin
  useEffect(() => {
    if (!token) {
      setIsAdmin(false)
      setUptime(null)
      return
    }

    const checkAdmin = async () => {
      try {
        const response = await fetch(`${API_URL.replace('/api', '')}/auth/is-admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.is_admin)
        }
      } catch (err) {
        console.debug('Could not check admin status')
        setIsAdmin(false)
      }
    }

    checkAdmin()
  }, [token])

  // Fetch backend uptime (only if admin)
  useEffect(() => {
    if (!token || !isAdmin) {
      setUptime(null)
      return
    }

    const fetchUptime = async () => {
      try {
        const response = await fetch(`${API_URL.replace('/api', '')}/health`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setUptime({
            backend: data.uptime_formatted || 'Unknown',
            backendSeconds: data.uptime_seconds || 0
          })
        }
      } catch (err) {
        console.debug('Could not fetch backend uptime')
      }
    }

    // Fetch immediately
    fetchUptime()

    // Update every 30 seconds
    const interval = setInterval(fetchUptime, 30000)
    return () => clearInterval(interval)
  }, [token, isAdmin])

  // Calculate web uptime
  const getWebUptime = () => {
    const now = new Date()
    const diffMs = now - webStartTime
    const seconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  return {
    backendUptime: uptime?.backend || null,
    webUptime: getWebUptime(),
    uptime
  }
}
