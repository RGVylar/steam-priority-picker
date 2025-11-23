import { useState, useEffect, useMemo } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export function useGames(filters, played, isAuthenticated = false, token = null) {
  const [allGames, setAllGames] = useState(() => {
    // Load from cache on initial render
    if (isAuthenticated && token) {
      const cached = localStorage.getItem('steam_games_cache')
      if (cached) {
        try {
          const { games, timestamp, token: cachedToken } = JSON.parse(cached)
          // Cache valid for 1 hour AND token must match
          if (Date.now() - timestamp < 60 * 60 * 1000 && cachedToken === token) {
            return games
          } else if (cachedToken !== token) {
            // Different user, clear cache
            localStorage.removeItem('steam_games_cache')
            console.log('🧹 Cache cleared - different user')
          }
        } catch (e) {
          console.error('Error parsing cache:', e)
        }
      }
    }
    return []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(() => {
    // Load total from cache
    if (isAuthenticated && token) {
      const cached = localStorage.getItem('steam_games_cache')
      if (cached) {
        try {
          const { total, timestamp, token: cachedToken } = JSON.parse(cached)
          if (Date.now() - timestamp < 60 * 60 * 1000 && cachedToken === token) {
            return total
          }
        } catch (e) {}
      }
    }
    return 0
  })
  const [dbTotal, setDbTotal] = useState(() => {
    // Load dbTotal from cache
    if (isAuthenticated && token) {
      const cached = localStorage.getItem('steam_games_cache')
      if (cached) {
        try {
          const { db_total, timestamp, token: cachedToken } = JSON.parse(cached)
          if (Date.now() - timestamp < 60 * 60 * 1000 && cachedToken === token) {
            return db_total || 0
          }
        } catch (e) {}
      }
    }
    return 0
  })

  // Force refresh function to clear cache and refetch
  const forceRefresh = async () => {
    localStorage.removeItem('steam_games_cache')
    console.log('🔄 Forcing refresh - cache cleared')
    
    if (!isAuthenticated || !token) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/my-games`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API error: ${response.status} - ${errorData.detail || 'Unknown error'}`)
      }
      
      const data = await response.json()
      setAllGames(data.games)
      setTotal(data.total)
      setDbTotal(data.db_total || 0)
      
      localStorage.setItem('steam_games_cache', JSON.stringify({
        games: data.games,
        total: data.total,
        db_total: data.db_total || 0,
        timestamp: Date.now(),
        token: token
      }))
      console.log('✅ Library refreshed and cached')
    } catch (err) {
      setError(err.message)
      console.error('Error refreshing games:', err)
    } finally {
      setLoading(false)
    }
  }

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

      // Check if we have valid cache
      const cached = localStorage.getItem('steam_games_cache')
      if (cached) {
        try {
          const { games, total, db_total, timestamp, token: cachedToken } = JSON.parse(cached)
          // If cache is less than 1 hour old AND token matches, don't fetch
          if (Date.now() - timestamp < 60 * 60 * 1000 && cachedToken === token) {
            console.log('✅ Using cached games data')
            return
          } else if (cachedToken !== token) {
            console.log('🧹 Cache cleared - different user/token')
            localStorage.removeItem('steam_games_cache')
          }
        } catch (e) {
          console.error('Error parsing cache:', e)
        }
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
        
        // Save to cache
        localStorage.setItem('steam_games_cache', JSON.stringify({
          games: data.games,
          total: data.total,
          db_total: data.db_total || 0,
          timestamp: Date.now(),
          token: token
        }))
        console.log('💾 Games data cached')
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
    forceRefresh,
  }
}
