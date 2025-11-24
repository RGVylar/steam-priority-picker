import { useState, useEffect, useCallback } from 'react'
import { preferencesApi } from '../utils/api'

export function useFilters() {
  const [playtimeMin, setPlaytimeMin] = useState(0)
  const [playtimeMax, setPlaytimeMax] = useState(Infinity)
  const [scoreMin, setScoreMin] = useState(0)
  const [scoreMax, setScoreMax] = useState(100)
  const [reviewsMin, setReviewsMin] = useState(0)
  const [reviewsMax, setReviewsMax] = useState(Infinity)
  const [sortBy, setSortBy] = useState('score_desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPlayed, setShowPlayed] = useState('all') // 'all', 'played', 'unplayed' - default to all games
  const [showUnknown, setShowUnknown] = useState(true) // Show games with unknown HLTB time (true by default)
  const [isLoading, setIsLoading] = useState(true)

  // Load preferences from API on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await preferencesApi.get()
        if (prefs) {
          // Map API fields to local state
          setPlaytimeMin(prefs.playtime_min || 0)
          setPlaytimeMax(prefs.playtime_max || Infinity)
          setScoreMin(prefs.score_min || 0)
          setScoreMax(prefs.score_max || 100)
          setSortBy(mapSortByToFrontend(prefs.sort_by, prefs.sort_order) || 'score_desc')
          setShowPlayed(mapShowPlayedToFrontend(prefs.show_played_games, prefs.show_unplayed_games) || 'all')
          // Note: showUnknown and reviews filters are not persisted yet
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
    if (!sortBy) return 'score_desc'
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
      const preferences = {
        playtime_min: playtimeMin,
        playtime_max: playtimeMax === Infinity ? 1000 : playtimeMax, // API expects number, not Infinity
        score_min: scoreMin,
        score_max: scoreMax,
        ...mapSortByToApi(sortBy),
        ...mapShowPlayedToApi(showPlayed),
        // Note: reviews and showUnknown not implemented in API yet
      }

      await preferencesApi.update(preferences)
      console.log('Preferences saved successfully')
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }, [playtimeMin, playtimeMax, scoreMin, scoreMax, sortBy, showPlayed, isLoading])

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
