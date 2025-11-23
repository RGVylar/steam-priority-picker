import { useState } from 'react'

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
  }
}
