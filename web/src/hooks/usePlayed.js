import { useState, useEffect, useCallback } from 'react'

export function usePlayed() {
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

  // Guardar cuando cambian
  useEffect(() => {
    localStorage.setItem('playedGames', JSON.stringify(Array.from(played)))
  }, [played])

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

  return { played, togglePlayed, isPlayed, getPlayedCount }
}
