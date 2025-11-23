import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../context/AuthContext'

export function usePlayed() {
  const { token, isAuthenticated } = useAuthContext()
  const [played, setPlayed] = useState(() => {
    // Inicializar desde localStorage
    try {
      const saved = localStorage.getItem('playedGames')
      if (!saved) return new Set()
      const parsed = JSON.parse(saved)
      // Ensure it's an array of valid app_ids (numbers)
      const validIds = Array.isArray(parsed) 
        ? parsed.filter(id => typeof id === 'number' || !isNaN(parseInt(id)))
        : []
      return new Set(validIds.map(id => parseInt(id)))
    } catch (e) {
      console.error('Error loading played games:', e)
      localStorage.removeItem('playedGames') // Clean up corrupted data
      return new Set()
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  // Cargar juegos jugados desde el backend cuando se autentica
  useEffect(() => {
    if (isAuthenticated && token) {
      loadPlayedGamesFromServer()
    }
  }, [isAuthenticated, token])

  // Guardar en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('playedGames', JSON.stringify(Array.from(played)))
  }, [played])

  // Sincronizar con el servidor cada 5 segundos (debounce)
  useEffect(() => {
    if (!isAuthenticated || !token) return

    const timer = setTimeout(() => {
      syncPlayedGamesToServer()
    }, 5000)

    return () => clearTimeout(timer)
  }, [played, isAuthenticated, token])

  const loadPlayedGamesFromServer = async () => {
    try {
      setIsLoading(true)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      
      const response = await fetch(`${API_URL}/api/played-games/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const serverPlayed = new Set(data.played_games.map(id => parseInt(id)))
        setPlayed(serverPlayed)
        console.log('📥 Loaded played games from server:', serverPlayed.size)
      }
    } catch (error) {
      console.error('Error loading played games from server:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncPlayedGamesToServer = async () => {
    if (!isAuthenticated || !token) return

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      
      const response = await fetch(`${API_URL}/api/played-games/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_ids: Array.from(played)
        })
      })

      if (response.ok) {
        console.log('📤 Synced played games to server')
      }
    } catch (error) {
      console.error('Error syncing played games to server:', error)
    }
  }

  const togglePlayed = useCallback((appid) => {
    setPlayed((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(appid)) {
        newSet.delete(appid)
      } else {
        newSet.add(appid)
      }
      return newSet
    })
  }, [])

  const isPlayed = useCallback((appid) => played.has(appid), [played])

  const getPlayedCount = useCallback(() => played.size, [played])

  return { played, togglePlayed, isPlayed, getPlayedCount, isLoading }
}
