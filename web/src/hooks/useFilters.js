import { useState } from 'react'

export function useFilters() {
  const [playtimeMin, setPlaytimeMin] = useState(0)
  const [playtimeMax, setPlaytimeMax] = useState(Infinity)
  const [scoreMin, setScoreMin] = useState(0)
  const [scoreMax, setScoreMax] = useState(100)
  const [sortBy, setSortBy] = useState('playtime_asc')
  const [searchQuery, setSearchQuery] = useState('')

  return {
    playtimeMin,
    setPlaytimeMin,
    playtimeMax,
    setPlaytimeMax,
    scoreMin,
    setScoreMin,
    scoreMax,
    setScoreMax,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
  }
}
