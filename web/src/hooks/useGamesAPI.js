import { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export function useGamesAPI() {
  const [games, setGames] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchGames = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.offset !== undefined) queryParams.append('offset', params.offset)
      
      const response = await fetch(`${API_URL}/games?${queryParams}`)
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      
      const data = await response.json()
      setGames(data.games)
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching games:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const searchGames = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      
      if (params.q) queryParams.append('q', params.q)
      if (params.playtime_min !== undefined) queryParams.append('playtime_min', params.playtime_min)
      if (params.playtime_max !== undefined) queryParams.append('playtime_max', params.playtime_max)
      if (params.score_min !== undefined) queryParams.append('score_min', params.score_min)
      if (params.score_max !== undefined) queryParams.append('score_max', params.score_max)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.offset !== undefined) queryParams.append('offset', params.offset)
      
      const response = await fetch(`${API_URL}/search?${queryParams}`)
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      
      const data = await response.json()
      setGames(data.games)
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
      console.error('Error searching games:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getFilters = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/filters`)
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      return await response.json()
    } catch (err) {
      console.error('Error fetching filters:', err)
      return null
    }
  }, [])

  const getGameById = useCallback(async (appId) => {
    try {
      const response = await fetch(`${API_URL}/games/${appId}`)
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      return await response.json()
    } catch (err) {
      console.error(`Error fetching game ${appId}:`, err)
      return null
    }
  }, [])

  // Load initial games on mount
  useEffect(() => {
    fetchGames({ limit: 24, offset: 0 })
  }, [fetchGames])

  return {
    games,
    total,
    loading,
    error,
    fetchGames,
    searchGames,
    getFilters,
    getGameById
  }
}
