import { useState, useEffect, useMemo } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export function useGames(filters, played, isAuthenticated = false, token = null) {
  const [allGames, setAllGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [dbTotal, setDbTotal] = useState(0)

  // Fetch games from API based on filters
  useEffect(() => {
    const fetchGames = async () => {
      // If not authenticated, don't fetch any games
      if (!isAuthenticated || !token) {
        setAllGames([])
        setTotal(0)
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        let url
        let options = {}
        
        // Use /my-games endpoint (user is authenticated)
        url = `${API_URL}/my-games`
        options = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
        
        const response = await fetch(url, options)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`API error: ${response.status} - ${errorData.detail || 'Unknown error'}`)
        }
        
        const data = await response.json()
        setAllGames(data.games)
        setTotal(data.total)
        setDbTotal(data.db_total || 0)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching games:', err)
        setAllGames([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [isAuthenticated, token])

  const games = useMemo(() => {
    let filtered = [...allGames]

    // Filter by search query
    if (filters.searchQuery) {
      filtered = filtered.filter((game) =>
        game.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    }

    // Filter by playtime
    if (filters.playtimeMin !== undefined && filters.playtimeMax !== undefined) {
      filtered = filtered.filter(
        (game) => game.playtime_hours >= filters.playtimeMin && 
                  game.playtime_hours <= filters.playtimeMax
      )
    }

    // Filter by score
    if (filters.scoreMin !== undefined && filters.scoreMax !== undefined) {
      filtered = filtered.filter(
        (game) => game.score >= filters.scoreMin && 
                  game.score <= filters.scoreMax
      )
    }

    // Filter by reviews
    if (filters.reviewsMin !== undefined && filters.reviewsMax !== undefined) {
      filtered = filtered.filter(
        (game) => game.total_reviews >= filters.reviewsMin && 
                  game.total_reviews <= filters.reviewsMax
      )
    }

    // Filter by played status
    if (filters.showPlayed === 'played') {
      filtered = filtered.filter((game) => played.has(game.app_id))
    } else if (filters.showPlayed === 'unplayed') {
      filtered = filtered.filter((game) => !played.has(game.app_id))
    }

    // Sort
    if (filters.sortBy === 'playtime_asc') {
      filtered.sort((a, b) => a.playtime_hours - b.playtime_hours)
    } else if (filters.sortBy === 'playtime_desc') {
      filtered.sort((a, b) => b.playtime_hours - a.playtime_hours)
    } else if (filters.sortBy === 'score_asc') {
      filtered.sort((a, b) => a.score - b.score)
    } else if (filters.sortBy === 'score_desc') {
      filtered.sort((a, b) => b.score - a.score)
    }

    return filtered
  }, [
    allGames,
    filters.searchQuery,
    filters.playtimeMin,
    filters.playtimeMax,
    filters.scoreMin,
    filters.scoreMax,
    filters.reviewsMin,
    filters.reviewsMax,
    filters.sortBy,
    filters.showPlayed,
    played,
  ])

  return {
    games,
    total: total,
    loading,
    error,
    dbTotal,
  }
}
