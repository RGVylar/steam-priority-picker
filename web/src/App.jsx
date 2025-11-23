import { useState, useEffect } from 'react'
import Header from './components/Header'
import FilterPanel from './components/FilterPanel'
import GameList from './components/GameList'
import SearchBar from './components/SearchBar'
import { BackendStatus } from './components/BackendStatus'
import { KofiButton } from './components/KofiButton'
import { useGames } from './hooks/useGames'
import { useFilters } from './hooks/useFilters'
import { useDarkMode } from './hooks/useDarkMode'
import { useGlassMode } from './hooks/useGlassMode'
import { usePlayed } from './hooks/usePlayed'
import { useAuthContext } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import { useSearchParams } from 'react-router-dom'

function App() {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [hoveredGame, setHoveredGame] = useState(null)
  const [prevHoveredGame, setPrevHoveredGame] = useState(null)
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  const { isGlass, toggle: toggleGlassMode } = useGlassMode()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, token } = useAuthContext()
  const { t } = useLanguage()
  const filters = useFilters()
  const { played, togglePlayed, isPlayed, getPlayedCount } = usePlayed()
  const { games, total, loading, error, dbTotal, forceRefresh } = useGames(filters, played, isAuthenticated, token)

  // Handle smooth transition between background images
  useEffect(() => {
    if (hoveredGame) {
      setPrevHoveredGame(hoveredGame)
    }
  }, [hoveredGame])

  // Handle auth token from URL
  useEffect(() => {
    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')
    
    if (token) {
      console.log('Token found in URL, saving:', token.substring(0, 20) + '...')
      localStorage.setItem('auth_token', token)
      // Trigger a refresh so AuthContext picks up the new token
      window.location.href = '/'
    }
    
    if (errorParam) {
      console.error('Auth error:', errorParam)
      // Clean URL
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 relative overflow-hidden">
      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-white/30 via-transparent to-gray-200/30 dark:from-slate-800/20 dark:via-transparent dark:to-slate-950/40" />
      
      {/* Dynamic Background Image - Only show when glass mode is enabled */}
      {isGlass && (
        <div 
          className="fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: prevHoveredGame 
              ? `url(${prevHoveredGame.image_url || `https://cdn.cloudflare.steamstatic.com/steam/apps/${prevHoveredGame.app_id}/header.jpg`})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: hoveredGame ? 0.5 : 0,
            filter: 'blur(30px)',
          }}
        />
      )}
      
      <div className="relative z-10">
      <Header 
        onMenuClick={() => setShowMobileFilters(!showMobileFilters)}
        onDarkModeToggle={toggleDarkMode}
        isDarkMode={isDark}
        onGlassModeToggle={toggleGlassMode}
        isGlassMode={isGlass}
        dbTotal={dbTotal}
        userTotal={total}
        onRefresh={forceRefresh}
        isRefreshing={loading}
      />
      
      <div className="flex">
        {/* Filter Panel - Only show when authenticated */}
        {isAuthenticated && (
          <div className={`
            fixed lg:relative lg:block
            ${showMobileFilters ? 'block' : 'hidden'}
            inset-0 z-40 lg:z-0
            bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent
            w-full lg:w-64 lg:min-h-[calc(100vh-64px)]
            overflow-y-auto lg:overflow-y-visible
            border-r border-gray-200 dark:border-gray-700
          `}>
            <FilterPanel 
              filters={filters}
              onClose={() => setShowMobileFilters(false)}
              played={played}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Show message if not authenticated */}
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
                <div className="max-w-2xl">
                  {/* Hero Section */}
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    🎮 Steam Priority Picker
                  </h1>
                  <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-8">
                    {t('landing.subtitle')}
                  </p>
                  
                  {/* Features */}
                  <div className="grid md:grid-cols-3 gap-6 mb-10 text-left">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl mb-3">📊</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('landing.feature1Title')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('landing.feature1Desc')}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl mb-3">🔍</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('landing.feature2Title')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('landing.feature2Desc')}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl mb-3">⏱️</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('landing.feature3Title')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('landing.feature3Desc')}
                      </p>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4">
                    <p className="text-lg text-gray-800 dark:text-gray-200 mb-3">
                      {t('landing.cta')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('landing.ctaHint')}
                    </p>
                  </div>
                  
                  {/* Privacy note */}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {t('landing.privacy')}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <SearchBar 
                  value={filters.searchQuery}
                  onChange={filters.setSearchQuery}
                />

                {/* Games List */}
                {error && (
                  <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <GameList 
                  games={games}
                  total={total}
                  loading={loading}
                  filters={filters}
                  togglePlayed={togglePlayed}
                  isPlayed={isPlayed}
                  onGameHover={setHoveredGame}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {showMobileFilters && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-30 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      {/* Backend Status Indicator */}
      <BackendStatus />
      
      {/* Ko-fi Support Button */}
      <KofiButton />
      </div>
    </div>
  )
}

export default App
