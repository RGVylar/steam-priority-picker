import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

// Translations
const translations = {
  es: {
    // Header
    'header.title': 'Steam Priority Picker',
    'header.library': '📚 Tu librería',
    'header.catalog': '🎮 Catálogo',
    'header.games': 'juegos',
    'header.refresh': 'Actualizar librería',
    'header.toggleLanguage': 'Cambiar idioma',
    'header.toggleDarkMode': 'Cambiar modo oscuro',
    'header.toggleFilters': 'Cambiar filtros',
    
    // Authentication
    'auth.login': 'Iniciar sesión',
    'auth.logout': 'Cerrar sesión',
    'auth.loginButton': 'Conectar con Steam',
    
    // Filters
    'filter.title': 'Filtros',
    'filter.playtime': 'Tiempo de juego',
    'filter.playtime0to5': '0-5 horas',
    'filter.playtime5to10': '5-10 horas',
    'filter.playtime10to20': '10-20 horas',
    'filter.playtime20plus': '20+ horas',
    
    'filter.score': 'Puntuación Steam',
    'filter.score75to100': '75-100%',
    'filter.score50to75': '50-75%',
    'filter.scoreBelow50': 'Menor a 50%',
    
    'filter.reviews': 'Reseñas',
    'filter.reviewsMinimum': 'Mínimo:',
    'filter.reviewsMaximum': 'Máximo:',
    
    'filter.sort': 'Ordenar por',
    'filter.sortPlaytimeAsc': 'Tiempo de juego (menor a mayor)',
    'filter.sortPlaytimeDesc': 'Tiempo de juego (mayor a menor)',
    'filter.sortScoreDesc': 'Puntuación (mayor a menor)',
    'filter.sortScoreAsc': 'Puntuación (menor a mayor)',
    
    'filter.played': 'Estado de juego',
    'filter.playedAll': 'Todos',
    'filter.playedPlayed': 'Jugados',
    'filter.playedUnplayed': 'No jugados',
    
    'filter.search': 'Buscar juegos...',
    'filter.reset': 'Resetear filtros',
    'filter.activeFilters': 'Filtros activos',
    
    // Games
    'games.noGames': 'No se encontraron juegos que coincidan con tus filtros.',
    'games.loading': '⏳ Cargando tu librería Steam...',
    'games.loadingHint': 'Esto puede tomar minutos en la primera carga',
    'games.showing': 'Mostrando',
    'games.of': 'de',
    'games.beforeFilters': 'antes de los filtros',
    'games.played': '✓ Jugado',
    'games.unplayed': '○ Jugado',
    'games.markAsPlayed': 'Marcar como jugado',
    'games.markAsUnplayed': 'Marcar como no jugado',
    
    // Links
    'links.hltb': 'HLTB',
    'links.steam': 'Steam',
    'links.playstats': 'PlayStats',
    'links.hltbNotFound': 'Página HLTB no encontrada para este juego',
    
    // Ko-fi
    'kofi.supportUs': 'Invítame una',
  },
  en: {
    // Header
    'header.title': 'Steam Priority Picker',
    'header.library': '📚 Your library',
    'header.catalog': '🎮 Catalog',
    'header.games': 'games',
    'header.refresh': 'Refresh library',
    'header.toggleLanguage': 'Toggle language',
    'header.toggleDarkMode': 'Toggle dark mode',
    'header.toggleFilters': 'Toggle filters',
    
    // Authentication
    'auth.login': 'Log in',
    'auth.logout': 'Log out',
    'auth.loginButton': 'Sign in with Steam',
    
    // Filters
    'filter.title': 'Filters',
    'filter.playtime': 'Playtime',
    'filter.playtime0to5': '0-5 hours',
    'filter.playtime5to10': '5-10 hours',
    'filter.playtime10to20': '10-20 hours',
    'filter.playtime20plus': '20+ hours',
    
    'filter.score': 'Steam Score',
    'filter.score75to100': '75-100%',
    'filter.score50to75': '50-75%',
    'filter.scoreBelow50': 'Below 50%',
    
    'filter.reviews': 'Reviews',
    'filter.reviewsMinimum': 'Minimum:',
    'filter.reviewsMaximum': 'Maximum:',
    
    'filter.sort': 'Sort by',
    'filter.sortPlaytimeAsc': 'Playtime (Low to High)',
    'filter.sortPlaytimeDesc': 'Playtime (High to Low)',
    'filter.sortScoreDesc': 'Score (High to Low)',
    'filter.sortScoreAsc': 'Score (Low to High)',
    
    'filter.played': 'Play Status',
    'filter.playedAll': 'All',
    'filter.playedPlayed': 'Played',
    'filter.playedUnplayed': 'Unplayed',
    
    'filter.search': 'Search games... (Cmd/Ctrl + K)',
    'filter.reset': 'Reset filters',
    'filter.activeFilters': 'Active filters',
    
    // Games
    'games.noGames': 'No games found matching your filters.',
    'games.loading': '⏳ Fetching your Steam library...',
    'games.loadingHint': 'This may take some minutes on first load',
    'games.showing': 'Showing',
    'games.of': 'of',
    'games.beforeFilters': 'before filters',
    'games.played': '✓ Played',
    'games.unplayed': '○ Played',
    'games.markAsPlayed': 'Mark as played',
    'games.markAsUnplayed': 'Mark as unplayed',
    
    // Links
    'links.hltb': 'HLTB',
    'links.steam': 'Steam',
    'links.playstats': 'PlayStats',
    'links.hltbNotFound': 'HLTB page not found for this game',
    
    // Ko-fi
    'kofi.supportUs': 'Buy me beer',
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or browser language or default to 'es'
    const saved = localStorage.getItem('language')
    if (saved) return saved
    
    const browserLang = navigator.language.startsWith('es') ? 'es' : 'en'
    return browserLang
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = (key) => translations[language]?.[key] || translations.es[key] || key

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es')
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
