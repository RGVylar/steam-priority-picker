import { useState, useMemo } from 'react'
import gamesData from '../data/games.json'

export function useGames(filters) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const games = useMemo(() => {
    try {
      setLoading(true)
      
      let filtered = gamesData.games || []

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

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (game) => game.name.toLowerCase().includes(query)
        )
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

      setLoading(false)
      return filtered
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return []
    }
  }, [filters])

  return {
    games,
    total: gamesData.games?.length || 0,
    loading,
    error,
  }
}
