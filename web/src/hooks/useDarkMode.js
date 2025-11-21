import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Leer el estado inicial del HTML (ya puesto por index.html)
    return document.documentElement.classList.contains('dark')
  })

  // Sincronizar cuando cambia isDark
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
