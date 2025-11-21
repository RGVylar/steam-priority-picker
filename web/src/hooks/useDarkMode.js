import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)

  // Sincronizar con el estado actual del HTML
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  // Actualizar clase en HTML cuando cambia isDark
  useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(isDark))
  }, [isDark])

  const toggle = () => setIsDark(!isDark)

  return { isDark, toggle }
}
