import { useLanguage } from '../context/LanguageContext'

export function GameCard({ game, isPlayed, onTogglePlayed, onMouseEnter, onMouseLeave }) {
  const { t } = useLanguage()
  const getPlaytimeBadge = (hours) => {
    if (!hours || hours === null) return { text: t('games.unknown'), color: 'bg-gray-100 text-gray-800' }
    if (hours < 5) return { text: '< 5 hrs', color: 'bg-green-100 text-green-800' }
    if (hours < 10) return { text: '5-10 hrs', color: 'bg-blue-100 text-blue-800' }
    if (hours < 20) return { text: '10-20 hrs', color: 'bg-yellow-100 text-yellow-800' }
    return { text: '20+ hrs', color: 'bg-red-100 text-red-800' }
  }

  // Use HLTB time for badge, fallback to personal playtime if HLTB not available
  const timeForBadge = game.hltb_hours > 0 ? game.hltb_hours : (game.playtime_hours || 0)
  const badge = getPlaytimeBadge(timeForBadge)
  const imageUrl = game.image_url || `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.app_id}/header.jpg`

  return (
    <div 
      className="glass hover-glow rounded-2xl overflow-hidden flex flex-col h-full border border-white/20 transition-all duration-300"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image Container - Header image horizontal aspect ratio */}
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden relative group">
        <img 
          src={imageUrl}
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='460' height='215'%3E%3Crect fill='%23333' width='460' height='215'/%3E%3Ctext x='50%' y='50%' fill='%23999' text-anchor='middle' dominant-baseline='middle' font-size='18' font-family='sans-serif'%3EImage not available%3C/text%3E%3C/svg%3E`
          }}
        />
        {/* Play Button Overlay */}
        <a
          href={`steam://launch/${game.app_id}/Dialog`}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300"
          title="Click to play or install on Steam"
          onClick={(e) => {
            // Fallback to Steam store if steam:// protocol doesn't work
            if (!navigator.userAgent.includes('Windows') && !navigator.userAgent.includes('Mac') && !navigator.userAgent.includes('Linux')) {
              e.preventDefault()
              window.open(game.steam_url, '_blank')
            }
          }}
        >
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-blue-700">
            <svg className="w-8 h-8 text-white fill-current ml-1" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21"/>
            </svg>
          </div>
        </a>
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
            ⭐ {game.score.toFixed(1)}%
          </span>
        </div>

        {/* Review Info */}
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <p className="font-medium text-gray-900 dark:text-white">{game.review_desc}</p>
          <p className="text-gray-500 dark:text-gray-400">{game.total_reviews?.toLocaleString() || 0} reviews</p>
        </div>

        {/* Additional Info */}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('games.playtime')}: <span className="font-medium text-gray-900 dark:text-white">{game.playtime_hours !== null && game.playtime_hours !== undefined ? `${game.playtime_hours.toFixed(1)} hrs` : '0 hrs'}</span>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('games.timeToBeat')}: <span className="font-medium text-gray-900 dark:text-white">{game.hltb_hours > 0 ? `${game.hltb_hours.toFixed(1)} hrs` : t('games.unknown')}</span>
          </p>
        </div>
      </div>

      {/* Footer - Links and Played Button */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
        <a
          href={game.steam_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 glass-tinted bg-blue-600/30 text-white text-sm font-medium rounded hover:bg-blue-700/40 transition-colors text-center"
        >
          Steam
        </a>
        {game.hltb_url ? (
          <a
            href={game.hltb_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 glass-tinted bg-gray-600/30 text-white text-sm font-medium rounded hover:bg-gray-700/40 transition-colors text-center"
          >
            HLTB
          </a>
        ) : (
          <a
            href="https://howlongtobeat.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 glass-tinted bg-gray-500/30 text-white text-sm font-medium rounded hover:bg-gray-600/40 transition-colors text-center"
            title={t('links.hltbNotFound')}
          >
            {t('links.hltb')}
          </a>
        )}
        <button
          onClick={onTogglePlayed}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors glass-tinted ${
            isPlayed
              ? 'bg-green-600/30 text-white hover:bg-green-700/40'
              : 'bg-gray-400/30 text-white hover:bg-gray-500/40'
          }`}
          title={isPlayed ? t('games.markAsUnplayed') : t('games.markAsPlayed')}
        >
          {isPlayed ? t('games.played') : t('games.unplayed')}
        </button>
      </div>
    </div>
  )
}

export default GameCard
