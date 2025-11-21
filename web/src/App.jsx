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
import { usePlayed } from './hooks/usePlayed'
import { useAuthContext } from './context/AuthContext'
import { useSearchParams } from 'react-router-dom'

function App() {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, token } = useAuthContext()
  
  const filters = useFilters()
  const { played, togglePlayed, isPlayed, getPlayedCount } = usePlayed()
  const { games, total, loading, error, dbTotal } = useGames(filters, played, isAuthenticated, token)

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onMenuClick={() => setShowMobileFilters(!showMobileFilters)}
        onDarkModeToggle={toggleDarkMode}
        isDarkMode={isDark}
        dbTotal={dbTotal}
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
              <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🔐 Log in para ver tu librería Steam
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Inicia sesión con tu cuenta de Steam para ver tus juegos y priorizarlos.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Haz clic en el botón de login en la esquina superior derecha →
                </p>
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
  )
}

export default App
