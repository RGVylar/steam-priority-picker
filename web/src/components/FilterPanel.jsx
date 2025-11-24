import { useState, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'

export function FilterPanel({ filters, onClose, played }) {
  const { t } = useLanguage()
  const [expandedSections, setExpandedSections] = useState({
    playtime: true,
    score: true,
    reviews: false,
    sort: false,
    played: false,
  })

  // Calculate played count dynamically from the played Set
  const playedCount = useMemo(() => played ? played.size : 0, [played])

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const playtimeRanges = [
    { label: t('filter.playtime0to5'), min: 0, max: 5 },
    { label: t('filter.playtime5to10'), min: 5, max: 10 },
    { label: t('filter.playtime10to20'), min: 10, max: 20 },
    { label: t('filter.playtime20plus'), min: 20, max: 10000 },
    { label: t('filter.unknown'), value: 'Unknown' }, // Unknown HLTB games
  ]

  const scoreRanges = [
    { label: t('filter.score75to100'), min: 75, max: 100 },
    { label: t('filter.score50to75'), min: 50, max: 75 },
    { label: t('filter.scoreBelow50'), min: 0, max: 50 },
  ]

  const sortOptions = [
    { label: t('filter.sortPlaytimeAsc'), value: 'playtime_asc' },
    { label: t('filter.sortPlaytimeDesc'), value: 'playtime_desc' },
    { label: t('filter.sortScoreDesc'), value: 'score_desc' },
    { label: t('filter.sortScoreAsc'), value: 'score_asc' },
  ]

  const activeFilterCount = [
    filters.playtimeMin !== 0 || filters.playtimeMax !== Infinity,
    filters.scoreMin !== 0 || filters.scoreMax !== 100,
    filters.reviewsMin !== 0 || filters.reviewsMax !== Infinity,
    filters.showPlayed !== 'all',
    !filters.showUnknown, // Only count as active if DISABLED
  ].filter(Boolean).length

  const handlePlaytimeToggle = (range) => {
    if (filters.playtimeMin === range.min && filters.playtimeMax === range.max) {
      filters.setPlaytimeMin(0)
      filters.setPlaytimeMax(Infinity)
    } else {
      filters.setPlaytimeMin(range.min)
      filters.setPlaytimeMax(range.max)
    }
  }

  const handleScoreToggle = (range) => {
    if (filters.scoreMin === range.min && filters.scoreMax === range.max) {
      filters.setScoreMin(0)
      filters.setScoreMax(100)
    } else {
      filters.setScoreMin(range.min)
      filters.setScoreMax(range.max)
    }
  }

  const CollapsibleSection = ({ title, section, children, activeCount = 0 }) => (
    <div className="border-b border-white/10">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
          {activeCount > 0 && (
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <span className={`text-gray-500 dark:text-gray-400 transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {expandedSections[section] && (
        <div className="px-4 py-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className="frosted-glass h-full overflow-y-auto border-r border-white/10">
      {/* Mobile close button */}
      <div className="lg:hidden sticky top-0 glass-dark border-b border-white/10 px-4 py-3 flex items-center justify-between z-10 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('filter.title')}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Close filters"
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Playtime Filter */}
      <CollapsibleSection 
        title={t('filter.playtime')} 
        section="playtime"
        activeCount={filters.playtimeMin !== 0 || filters.playtimeMax !== Infinity || !filters.showUnknown ? 1 : 0}
      >
        <div className="space-y-2">
          {playtimeRanges.slice(0, 4).map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={filters.playtimeMin === range.min && filters.playtimeMax === range.max}
                onChange={() => handlePlaytimeToggle(range)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{range.label}</span>
            </label>
          ))}
          {/* Unknown HLTB separator */}
          <div className="border-t border-white/10 my-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={filters.showUnknown}
                onChange={() => filters.setShowUnknown(!filters.showUnknown)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{playtimeRanges[4].label}</span>
            </label>
          </div>
        </div>
      </CollapsibleSection>

      {/* Score Filter */}
      <CollapsibleSection 
        title={t('filter.score')} 
        section="score"
        activeCount={filters.scoreMin !== 0 || filters.scoreMax !== 100 ? 1 : 0}
      >
        <div className="space-y-2">
          {scoreRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={filters.scoreMin === range.min && filters.scoreMax === range.max}
                onChange={() => handleScoreToggle(range)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{range.label}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Reviews Filter */}
      <CollapsibleSection 
        title={t('filter.reviews')} 
        section="reviews"
        activeCount={filters.reviewsMin !== 0 || filters.reviewsMax !== Infinity ? 1 : 0}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('filter.reviewsMinimum')} {filters.reviewsMin.toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={filters.reviewsMin}
              onChange={(e) => filters.setReviewsMin(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('filter.reviewsMaximum')} {filters.reviewsMax === Infinity ? '∞' : filters.reviewsMax.toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max="500000"
              step="10000"
              value={filters.reviewsMax === Infinity ? 500000 : filters.reviewsMax}
              onChange={(e) => filters.setReviewsMax(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Sort */}
      <CollapsibleSection title={t('filter.sort')} section="sort">
        <select
          value={filters.sortBy}
          onChange={(e) => filters.setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </CollapsibleSection>

      {/* Played Games Filter */}
      <CollapsibleSection 
        title={t('filter.played')} 
        section="played"
        activeCount={filters.showPlayed !== 'all' ? 1 : 0}
      >
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
            <input
              type="radio"
              name="playedStatus"
              value="all"
              checked={filters.showPlayed === 'all'}
              onChange={() => filters.setShowPlayed('all')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('filter.playedAll')}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
            <input
              type="radio"
              name="playedStatus"
              value="played"
              checked={filters.showPlayed === 'played'}
              onChange={() => filters.setShowPlayed('played')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('filter.playedPlayed')}</span>
            <span className="ml-auto text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
              {playedCount}
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
            <input
              type="radio"
              name="playedStatus"
              value="unplayed"
              checked={filters.showPlayed === 'unplayed'}
              onChange={() => filters.setShowPlayed('unplayed')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('filter.playedUnplayed')}</span>
          </label>
        </div>
      </CollapsibleSection>

      {/* Reset Button */}
      <div className="p-4">
        <button
          onClick={() => {
            filters.setPlaytimeMin(0)
            filters.setPlaytimeMax(Infinity)
            filters.setScoreMin(0)
            filters.setScoreMax(100)
            filters.setReviewsMin(0)
            filters.setReviewsMax(Infinity)
            filters.setSortBy('score_desc')
            filters.setSearchQuery('')
            filters.setShowPlayed('all')
            filters.setShowUnknown(true)
          }}
          className="w-full px-4 py-2 glass hover:bg-white/5 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
        >
          {t('filter.reset')}
        </button>
      </div>
    </div>
  )
}

export default FilterPanel
