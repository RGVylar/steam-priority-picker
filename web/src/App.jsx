import { useState } from 'react'
import Header from './components/Header'
import FilterPanel from './components/FilterPanel'
import GameList from './components/GameList'
import SearchBar from './components/SearchBar'
import { BackendStatus } from './components/BackendStatus'
import { useGames } from './hooks/useGames'
import { useFilters } from './hooks/useFilters'
import { useDarkMode } from './hooks/useDarkMode'
import { usePlayed } from './hooks/usePlayed'

function App() {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  
  const filters = useFilters()
  const { played, togglePlayed, isPlayed, getPlayedCount } = usePlayed()
  const { games, total, loading, error } = useGames(filters, played)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onMenuClick={() => setShowMobileFilters(!showMobileFilters)}
        onDarkModeToggle={toggleDarkMode}
        isDarkMode={isDark}
      />
      
      <div className="flex">
        {/* Filter Panel */}
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

        {/* Main Content */}
        <div className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 py-8">
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
    </div>
  )
}

export default App
