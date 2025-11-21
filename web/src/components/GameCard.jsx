export function GameCard({ game }) {
  const getPlaytimeBadge = (hours) => {
    if (hours < 5) return { text: '< 5 hrs', color: 'bg-green-100 text-green-800' }
    if (hours < 10) return { text: '5-10 hrs', color: 'bg-blue-100 text-blue-800' }
    if (hours < 20) return { text: '10-20 hrs', color: 'bg-yellow-100 text-yellow-800' }
    return { text: '20+ hrs', color: 'bg-red-100 text-red-800' }
  }

  const badge = getPlaytimeBadge(game.playtime_hours)

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {game.name}
        </h3>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
            ⏱️ {badge.text}
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
            ⭐ {game.score}%
          </span>
        </div>

        {/* Review Info */}
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-900">{game.review_desc}</p>
          <p className="text-xs text-gray-500">{game.total_reviews?.toLocaleString() || 0} reviews</p>
        </div>

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600">
            Playtime: <span className="font-medium">{game.playtime_hours.toFixed(1)} hrs</span>
          </p>
          {game.hltb_name && (
            <p className="text-xs text-gray-600 mt-1">
              HLTB: <span className="font-medium">{game.hltb_name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Footer - Links */}
      <div className="border-t border-gray-200 p-4 flex gap-2">
        <a
          href={game.steam_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors text-center"
        >
          Steam
        </a>
        {game.hltb_url && (
          <a
            href={game.hltb_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors text-center"
          >
            HLTB
          </a>
        )}
      </div>
    </div>
  )
}

export default GameCard
