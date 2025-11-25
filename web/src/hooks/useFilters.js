import { useState, useEffect, useCallback } from 'react'

export function useFilters() {
  const [playtimeMin, setPlaytimeMin] = useState(0)
  const [playtimeMax, setPlaytimeMax] = useState(10000)
  const [scoreMin, setScoreMin] = useState(0)
  const [scoreMax, setScoreMax] = useState(100)
  const [reviewsMin, setReviewsMin] = useState(0)
  const [reviewsMax, setReviewsMax] = useState(Infinity)
  const [sortBy, setSortBy] = useState('playtime_asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPlayed, setShowPlayed] = useState('all') // 'all', 'played', 'unplayed' - default to all games
  const [showUnknown, setShowUnknown] = useState(true) // Show games with unknown HLTB time (true by default)
  const [isLoading, setIsLoading] = useState(true)

  // Load preferences from API on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setIsLoading(false)
          return
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
        const response = await fetch(`${API_URL}/preferences`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const prefs = await response.json()
          // Map API fields to local state
          setPlaytimeMin(prefs.playtime_min || 0)
          setPlaytimeMax(prefs.playtime_max || 10000)
          setScoreMin(prefs.score_min || 0)
          setScoreMax(prefs.score_max || 100)
          setReviewsMin(prefs.reviews_min || 0)
          setReviewsMax(prefs.reviews_max || Infinity)
          setSortBy(mapSortByToFrontend(prefs.sort_by, prefs.sort_order) || 'playtime_asc')
          setShowPlayed(mapShowPlayedToFrontend(prefs.show_played_games, prefs.show_unplayed_games) || 'all')
          setShowUnknown(prefs.show_unknown !== false) // Defaults to true if not set
        }
      } catch (error) {
        console.warn('Could not load preferences:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // Helper functions to map between API and frontend formats
  const mapSortByToFrontend = (sortBy, sortOrder) => {
    if (!sortBy) return 'playtime_asc'
    return `${sortBy}_${sortOrder || 'asc'}`
  }

  const mapShowPlayedToFrontend = (showPlayed, showUnplayed) => {
    if (showPlayed && showUnplayed) return 'all'
    if (showPlayed && !showUnplayed) return 'played'
    if (!showPlayed && showUnplayed) return 'unplayed'
    return 'all'
  }

  const mapSortByToApi = (frontendSortBy) => {
    const [field, order] = frontendSortBy.split('_')
    return { sort_by: field, sort_order: order }
  }

  const mapShowPlayedToApi = (frontendShowPlayed) => {
    switch (frontendShowPlayed) {
      case 'played':
        return { show_played_games: true, show_unplayed_games: false }
      case 'unplayed':
        return { show_played_games: false, show_unplayed_games: true }
      case 'all':
      default:
        return { show_played_games: true, show_unplayed_games: true }
    }
  }

  // Auto-save preferences when filters change
  const savePreferences = useCallback(async () => {
    if (isLoading) return // Don't save while loading

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
      const preferences = {
        playtime_min: playtimeMin,
        playtime_max: playtimeMax === 10000 ? 10000 : playtimeMax,
        score_min: scoreMin,
        score_max: scoreMax,
        reviews_min: reviewsMin,
        reviews_max: reviewsMax === Infinity ? 999999 : reviewsMax,
        show_unknown: showUnknown,
        ...mapSortByToApi(sortBy),
        ...mapShowPlayedToApi(showPlayed),
      }

      const response = await fetch(`${API_URL}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        console.log('Preferences saved successfully')
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }, [playtimeMin, playtimeMax, scoreMin, scoreMax, reviewsMin, reviewsMax, sortBy, showPlayed, showUnknown, isLoading])

  // Save preferences with debounce when any filter changes
  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(savePreferences, 1000) // Save after 1 second of no changes
      return () => clearTimeout(timeoutId)
    }
  }, [savePreferences, isLoading])

  return {
    playtimeMin,
    setPlaytimeMin,
    playtimeMax,
    setPlaytimeMax,
    scoreMin,
    setScoreMin,
    scoreMax,
    setScoreMax,
    reviewsMin,
    setReviewsMin,
    reviewsMax,
    setReviewsMax,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    showPlayed,
    setShowPlayed,
    showUnknown,
    setShowUnknown,
    isLoading,
  }
}
