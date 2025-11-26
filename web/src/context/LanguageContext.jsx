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
    'filter.playtime': 'Tiempo para completar',
    'filter.playtime0to5': '0-5 horas',
    'filter.playtime5to10': '5-10 horas',
    'filter.playtime10to20': '10-20 horas',
    'filter.playtime20to50': '20-50 horas',
    'filter.playtime50to100': '50-100 horas',
    'filter.playtime100plus': '100+ horas',
    
    'filter.score': 'Puntuación Steam',
    'filter.score75to100': '75-100%',
    'filter.score50to75': '50-75%',
    'filter.scoreBelow50': 'Menor a 50%',
    
    'filter.reviews': 'Reseñas',
    'filter.reviewsMinimum': 'Mínimo:',
    'filter.reviewsMaximum': 'Máximo:',
    
    'filter.sort': 'Ordenar por',
    'filter.sortPlaytimeAsc': 'Tiempo para completar (menor a mayor)',
    'filter.sortPlaytimeDesc': 'Tiempo para completar (mayor a menor)',
    'filter.sortScoreDesc': 'Puntuación (mayor a menor)',
    'filter.sortScoreAsc': 'Puntuación (menor a mayor)',
    
    'filter.played': 'Estado de juego',
    'filter.playedAll': 'Todos',
    'filter.playedPlayed': 'Jugados',
    'filter.playedUnplayed': 'No jugados',

    'filter.unknown': 'Mostrar desconocidos',
    
    'filter.search': 'Buscar juegos...(Ctrl + F)',
    'filter.reset': 'Resetear filtros',
    'filter.activeFilters': 'Filtros activos',
    
    // Games
    'games.noGames': 'No se encontraron juegos que coincidan con tus filtros.',
    'games.loading': '⏳ Cargando tu librería Steam...',
    'games.loadingHint': 'Esto puede tomar minutos en la primera carga',
    'games.showing': 'Mostrando',
    'games.playtime': 'Tiempo jugado',
    'games.timeToBeat': 'Tiempo estimado',
    'games.unknown': 'Desconocido',
    'games.of': 'de',
    'games.beforeFilters': 'antes de los filtros',
    'games.played': '✓ Jugado',
    'games.unplayed': '○ Jugado',
    'games.markAsPlayed': 'Marcar como jugado',
    'games.markAsUnplayed': 'Marcar como no jugado',
    'games.random': '🎲 Aleatorio con estos filtros',
    'games.randomPick': '✨ Selección Aleatoria ✨',
    'games.pickingGame': 'Seleccionando un juego...',
    'games.reroll': '🔄 Otra tirada',
    'games.playOnSteam': '🎮 Jugar en Steam',
    'games.close': 'Cerrar',
    'games.timeToBeatLabel': '⏱️ Tiempo para completar',
    'games.scoreLabel': '⭐ Puntuación',
    'games.reviewsLabel': '💬 Reseñas',
    'games.yourPlaytimeLabel': '🎮 Tu tiempo de juego',
    
    // Links
    'links.hltb': 'HLTB',
    'links.steam': 'Steam',
    'links.playstats': 'PlayStats',
    'links.hltbNotFound': 'Página HLTB no encontrada para este juego',
    
    // Landing page
    'landing.subtitle': 'Descubre qué jugar a continuación en tu biblioteca de Steam',
    'landing.feature1Title': 'Filtra tu biblioteca',
    'landing.feature1Desc': 'Filtra por tiempo de juego, puntuación, reseñas y más para encontrar el juego perfecto.',
    'landing.feature2Title': 'Información detallada',
    'landing.feature2Desc': 'Ve puntuaciones de Steam, reseñas y tiempo estimado de HowLongToBeat.',
    'landing.feature3Title': 'Organiza tu backlog',
    'landing.feature3Desc': 'Marca juegos como jugados y prioriza tu backlog infinito de Steam.',
    'landing.cta': '🔒 Inicia sesión con Steam para empezar',
    'landing.ctaHint': 'Haz clic en el botón de login en la esquina superior derecha →',
    'landing.privacy': '🔒 Solo leemos tu biblioteca pública de Steam. No guardamos contraseñas ni datos sensibles.',
    
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
    'filter.playtime': 'Time to Beat',
    'filter.playtime0to5': '0-5 hours',
    'filter.playtime5to10': '5-10 hours',
    'filter.playtime10to20': '10-20 hours',
    'filter.playtime20to50': '20-50 hours',
    'filter.playtime50to100': '50-100 hours',
    'filter.playtime100plus': '100+ hours',
    
    'filter.score': 'Steam Score',
    'filter.score75to100': '75-100%',
    'filter.score50to75': '50-75%',
    'filter.scoreBelow50': 'Below 50%',
    
    'filter.reviews': 'Reviews',
    'filter.reviewsMinimum': 'Minimum:',
    'filter.reviewsMaximum': 'Maximum:',
    
    'filter.sort': 'Sort by',
    'filter.sortPlaytimeAsc': 'Time to Beat (Low to High)',
    'filter.sortPlaytimeDesc': 'Time to Beat (High to Low)',
    'filter.sortScoreDesc': 'Score (High to Low)',
    'filter.sortScoreAsc': 'Score (Low to High)',
    
    'filter.played': 'Play Status',
    'filter.playedAll': 'All',
    'filter.playedPlayed': 'Played',
    'filter.playedUnplayed': 'Unplayed',

    'filter.unknown': 'Show unknown',
    
    'filter.search': 'Search games... (Ctrl + F)',
    'filter.reset': 'Reset filters',
    'filter.activeFilters': 'Active filters',
    
    // Games
    'games.noGames': 'No games found matching your filters.',
    'games.loading': '⏳ Fetching your Steam library...',
    'games.loadingHint': 'This may take some minutes on first load',
    'games.showing': 'Showing',
    'games.playtime': 'Playtime',
    'games.timeToBeat': 'Time to Beat',
    'games.unknown': 'Unknown',
    'games.of': 'of',
    'games.beforeFilters': 'before filters',
    'games.played': '✓ Played',
    'games.unplayed': '○ Played',
    'games.markAsPlayed': 'Mark as played',
    'games.markAsUnplayed': 'Mark as unplayed',
    'games.random': '🎲 Random using these filters',
    'games.randomPick': '✨ Random Pick ✨',
    'games.pickingGame': 'Picking a game...',
    'games.reroll': '🔄 Roll again',
    'games.playOnSteam': '🎮 Play on Steam',
    'games.close': 'Close',
    'games.timeToBeatLabel': '⏱️ Time to Beat',
    'games.scoreLabel': '⭐ Score',
    'games.reviewsLabel': '💬 Reviews',
    'games.yourPlaytimeLabel': '🎮 Your playtime',
    
    // Links
    'links.hltb': 'HLTB',
    'links.steam': 'Steam',
    'links.playstats': 'PlayStats',
    'links.hltbNotFound': 'HLTB page not found for this game',
    
    // Landing page
    'landing.subtitle': 'Discover what to play next in your Steam library',
    'landing.feature1Title': 'Filter your library',
    'landing.feature1Desc': 'Filter by playtime, score, reviews and more to find the perfect game.',
    'landing.feature2Title': 'Detailed information',
    'landing.feature2Desc': 'See Steam scores, reviews and estimated time from HowLongToBeat.',
    'landing.feature3Title': 'Organize your backlog',
    'landing.feature3Desc': 'Mark games as played and prioritize your endless Steam backlog.',
    'landing.cta': '🔒 Log in with Steam to get started',
    'landing.ctaHint': 'Click the login button in the top right corner →',
    'landing.privacy': '🔒 We only read your public Steam library. No passwords or sensitive data stored.',
    
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
