import { useState, useEffect, useCallback } from 'react'

export function usePlayed() {
  const [played, setPlayed] = useState(() => {
    // Inicializar desde localStorage
    try {
      const saved = localStorage.getItem('playedGames')
      return new Set(saved ? JSON.parse(saved) : [])
    } catch (e) {
      console.error('Error loading played games:', e)
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

  return { played, togglePlayed, isPlayed }
}
