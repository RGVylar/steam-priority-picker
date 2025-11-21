import { useState } from 'react'

export function FilterPanel({ filters, onClose }) {
  const [expandedSections, setExpandedSections] = useState({
    playtime: true,
    score: true,
    reviews: false,
    sort: false,
    played: false,
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const playtimeRanges = [
    { label: '0-5 hours', min: 0, max: 5 },
    { label: '5-10 hours', min: 5, max: 10 },
    { label: '10-20 hours', min: 10, max: 20 },
    { label: '20+ hours', min: 20, max: Infinity },
  ]

  const scoreRanges = [
    { label: '75-100%', min: 75, max: 100 },
    { label: '50-75%', min: 50, max: 75 },
    { label: 'Below 50%', min: 0, max: 50 },
  ]

  const sortOptions = [
    { label: 'Playtime (Low to High)', value: 'playtime_asc' },
    { label: 'Playtime (High to Low)', value: 'playtime_desc' },
    { label: 'Score (High to Low)', value: 'score_desc' },
    { label: 'Score (Low to High)', value: 'score_asc' },
  ]

  const activeFilterCount = [
    filters.playtimeMin !== 0 || filters.playtimeMax !== Infinity,
    filters.scoreMin !== 0 || filters.scoreMax !== 100,
    filters.reviewsMin !== 0 || filters.reviewsMax !== Infinity,
    filters.showPlayed !== 'all',
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
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 space-y-3">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className="dark:bg-gray-800">

      {/* Playtime Filter */}
      <CollapsibleSection 
        title="Playtime" 
        section="playtime"
        activeCount={filters.playtimeMin !== 0 || filters.playtimeMax !== Infinity ? 1 : 0}
      >
        <div className="space-y-2">
          {playtimeRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={filters.playtimeMin === range.min && filters.playtimeMax === range.max}
                onChange={() => handlePlaytimeToggle(range)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{range.label}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Score Filter */}
      <CollapsibleSection 
        title="Steam Score" 
        section="score"
        activeCount={filters.scoreMin !== 0 || filters.scoreMax !== 100 ? 1 : 0}
      >
        <div className="space-y-2">
          {scoreRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors">
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
        title="Reviews" 
        section="reviews"
        activeCount={filters.reviewsMin !== 0 || filters.reviewsMax !== Infinity ? 1 : 0}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Minimum: {filters.reviewsMin.toLocaleString()}</label>
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
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Maximum: {filters.reviewsMax === Infinity ? '∞' : filters.reviewsMax.toLocaleString()}</label>
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
      <CollapsibleSection title="Sort By" section="sort">
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
        title="Played Status" 
        section="played"
        activeCount={filters.showPlayed !== 'all' ? 1 : 0}
      >
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors">
            <input
              type="radio"
              name="playedStatus"
              value="all"
              checked={filters.showPlayed === 'all'}
              onChange={() => filters.setShowPlayed('all')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">All Games</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors">
            <input
              type="radio"
              name="playedStatus"
              value="played"
              checked={filters.showPlayed === 'played'}
              onChange={() => filters.setShowPlayed('played')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Played</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors">
            <input
              type="radio"
              name="playedStatus"
              value="unplayed"
              checked={filters.showPlayed === 'unplayed'}
              onChange={() => filters.setShowPlayed('unplayed')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Unplayed</span>
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
          }}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}

export default FilterPanel