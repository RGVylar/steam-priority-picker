import { useState, useEffect, useMemo } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export function useGames(filters, played, isAuthenticated = false, token = null) {
  const [allGames, setAllGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [dbTotal, setDbTotal] = useState(0)

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
        setDbTotal(0)
        setError(null)
        setLoading(false)
        return
      }

      // Check if we have valid cache
      const cached = localStorage.getItem('steam_games_cache')
      if (cached) {
        try {
          const { games, total, db_total, timestamp, token: cachedToken } = JSON.parse(cached)
          // If cache is less than 1 hour old AND token matches, use cache
          if (Date.now() - timestamp < 60 * 60 * 1000 && cachedToken === token) {
            console.log('✅ Using cached games data')
            setAllGames(games)
            setTotal(total)
            setDbTotal(db_total || 0)
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

    // Identify games with unknown HLTB time (hltb_hours = 0)
    const isUnknown = (game) => game.hltb_hours === 0 || game.hltb_hours === undefined

    // Filter by playtime (use HLTB time, fallback to personal time)
    if (filters.playtimeMin !== undefined && filters.playtimeMax !== undefined) {
      filtered = filtered.filter((game) => {
        const unknown = isUnknown(game)
        
        // If showUnknown is true, include them. Otherwise exclude them from range filters
        if (unknown) {
          return filters.showUnknown
        }
        
        const timeToUse = game.hltb_hours > 0 ? game.hltb_hours : game.playtime_hours
        return timeToUse >= filters.playtimeMin && timeToUse <= filters.playtimeMax
      })
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

    // Sort (use HLTB time for playtime sorting)
    if (filters.sortBy === 'playtime_asc') {
      filtered.sort((a, b) => {
        // Exclude unknown games from playtime sorting
        const aUnknown = isUnknown(a)
        const bUnknown = isUnknown(b)
        
        // Put unknown games at the end
        if (aUnknown && !bUnknown) return 1
        if (!aUnknown && bUnknown) return -1
        if (aUnknown && bUnknown) return 0
        
        const timeA = a.hltb_hours > 0 ? a.hltb_hours : a.playtime_hours
        const timeB = b.hltb_hours > 0 ? b.hltb_hours : b.playtime_hours
        return timeA - timeB
      })
    } else if (filters.sortBy === 'playtime_desc') {
      filtered.sort((a, b) => {
        // Exclude unknown games from playtime sorting
        const aUnknown = isUnknown(a)
        const bUnknown = isUnknown(b)
        
        // Put unknown games at the end
        if (aUnknown && !bUnknown) return 1
        if (!aUnknown && bUnknown) return -1
        if (aUnknown && bUnknown) return 0
        
        const timeA = a.hltb_hours > 0 ? a.hltb_hours : a.playtime_hours
        const timeB = b.hltb_hours > 0 ? b.hltb_hours : b.playtime_hours
        return timeB - timeA
      })
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
    filters.showUnknown,
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
