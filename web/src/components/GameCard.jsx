export function GameCard({ game, isPlayed, onTogglePlayed }) {
  const getPlaytimeBadge = (hours) => {
    if (hours < 5) return { text: '< 5 hrs', color: 'bg-green-100 text-green-800' }
    if (hours < 10) return { text: '5-10 hrs', color: 'bg-blue-100 text-blue-800' }
    if (hours < 20) return { text: '10-20 hrs', color: 'bg-yellow-100 text-yellow-800' }
    return { text: '20+ hrs', color: 'bg-red-100 text-red-800' }
  }

  const badge = getPlaytimeBadge(game.playtime_hours)
  const imageUrl = game.image_url || `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.app_id}/header.jpg`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:shadow-gray-950 transition-shadow overflow-hidden flex flex-col h-full">
      {/* Image Container - Header image horizontal aspect ratio */}
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img 
          src={imageUrl}
          alt={game.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='460' height='215'%3E%3Crect fill='%23333' width='460' height='215'/%3E%3Ctext x='50%' y='50%' fill='%23999' text-anchor='middle' dominant-baseline='middle' font-size='18' font-family='sans-serif'%3EImage not available%3C/text%3E%3C/svg%3E`
          }}
        />
      </div>

      {/* Header */}
      <div className="px-4 pt-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
          {game.name}
        </h3>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-2">
        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
            ⏱️ {badge.text}
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
            ⭐ {game.score}%
          </span>
        </div>

        {/* Review Info */}
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <p className="font-medium text-gray-900 dark:text-white">{game.review_desc}</p>
          <p className="text-gray-500 dark:text-gray-400">{game.total_reviews?.toLocaleString() || 0} reviews</p>
        </div>

        {/* Additional Info */}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Playtime: <span className="font-medium text-gray-900 dark:text-white">{game.playtime_hours.toFixed(1)} hrs</span>
          </p>
        </div>
      </div>

      {/* Footer - Links and Played Button */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
        <a
          href={game.steam_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors text-center"
        >
          Steam
        </a>
        <a
          href={game.hltb_url || `https://howlongtobeat.com/search?q=${encodeURIComponent(game.hltb_name || game.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors text-center"
        >
          HLTB
        </a>
        <button
          onClick={onTogglePlayed}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            isPlayed
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-400 text-white hover:bg-gray-500'
          }`}
          title={isPlayed ? 'Mark as unplayed' : 'Mark as played'}
        >
          {isPlayed ? '✓ Played' : '○ Play'}
        </button>
      </div>
    </div>
  )
}

export default GameCard
