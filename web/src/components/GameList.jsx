import GameCard from './GameCard'

export function GameList({ games, total, loading, filters }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg animate-pulse h-64" />
        ))}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No games found matching your filters.</p>
        <button
          onClick={() => {
            filters.setPlaytimeMin(0)
            filters.setPlaytimeMax(Infinity)
            filters.setScoreMin(0)
            filters.setScoreMax(100)
            filters.setSearchQuery('')
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reset Filters
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 text-sm text-gray-600">
        Showing <span className="font-medium">{games.length}</span> of <span className="font-medium">{total}</span> games
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard key={game.appid || game.app_id} game={game} />
        ))}
      </div>
    </>
  )
}

export default GameList
