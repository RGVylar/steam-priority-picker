import GameCard from './GameCard'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'

export function GameList({ games, total, loading, filters, togglePlayed, isPlayed }) {
  const { displayedItems, hasMore, observerTarget } = useInfiniteScroll(games, 24)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg animate-pulse aspect-[2/3]" />
        ))}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No games found matching your filters.</p>
        <button
          onClick={() => {
            filters.setPlaytimeMin(0)
            filters.setPlaytimeMax(Infinity)
            filters.setScoreMin(0)
            filters.setScoreMax(100)
            filters.setSearchQuery('')
          }}
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-medium text-gray-900 dark:text-white">{displayedItems.length}</span> of <span className="font-medium text-gray-900 dark:text-white">{games.length}</span> games
        {games.length < total && (
          <span className="text-gray-400 dark:text-gray-500 ml-2">({games.length} after filters)</span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedItems.map((game) => (
          <GameCard 
            key={game.appid || game.app_id} 
            game={game} 
            isPlayed={isPlayed(game.appid)}
            onTogglePlayed={() => togglePlayed(game.appid)}
          />
        ))}
      </div>

      {/* Elemento para detectar cuando llegar al final */}
      {hasMore && (
        <div 
          ref={observerTarget} 
          className="mt-12 py-8 text-center text-gray-500 dark:text-gray-400"
        >
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4">Loading more games...</p>
        </div>
      )}
    </>
  )
}

export default GameList
