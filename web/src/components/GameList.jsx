import GameCard from './GameCard'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { useLanguage } from '../context/LanguageContext'

export function GameList({ games, total, loading, filters, togglePlayed, isPlayed, onGameHover }) {
  const { t } = useLanguage()
  const { displayedItems, hasMore, observerTarget } = useInfiniteScroll(games, 24)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('games.loading')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('games.loadingHint')}
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse aspect-[2/3]" />
          ))}
        </div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('games.noGames')}</p>
        <button
          onClick={() => {
            filters.setPlaytimeMin(0)
            filters.setPlaytimeMax(Infinity)
            filters.setScoreMin(0)
            filters.setScoreMax(100)
            filters.setSearchQuery('')
            filters.setShowPlayed('all')
            filters.setShowUnknown(true)
          }}
          className="mt-4 px-4 py-2 glass hover-glow bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/90 transition-colors"
        >
          {t('filter.reset')}
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {t('games.showing')} <span className="font-medium text-gray-900 dark:text-white">{displayedItems.length}</span> {t('games.of')} <span className="font-medium text-gray-900 dark:text-white">{games.length}</span> {t('header.games')}
        {games.length < total && (
          <span className="text-gray-400 dark:text-gray-500 ml-2">({total} {t('games.beforeFilters')})</span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedItems.map((game) => (
          <GameCard 
            key={game.app_id} 
            game={game} 
            isPlayed={isPlayed(game.app_id)}
            onTogglePlayed={() => togglePlayed(game.app_id)}
            onMouseEnter={() => onGameHover && onGameHover(game)}
            onMouseLeave={() => onGameHover && onGameHover(null)}
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
