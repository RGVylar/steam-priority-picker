import { useState, useEffect } from 'react'

export function useGlassMode() {
  const [isGlass, setIsGlass] = useState(() => {
    const saved = localStorage.getItem('glassMode')
    return saved !== null ? JSON.parse(saved) : true // Default: enabled
  })

  useEffect(() => {
    const html = document.documentElement
    if (isGlass) {
      html.classList.remove('no-glass-mode')
    } else {
      html.classList.add('no-glass-mode')
    }
    localStorage.setItem('glassMode', JSON.stringify(isGlass))
  }, [isGlass])

  const toggle = () => setIsGlass(!isGlass)

  return { isGlass, toggle }
}
