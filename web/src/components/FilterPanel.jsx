export function FilterPanel({ filters, onClose }) {
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
      // Desselect
      filters.setPlaytimeMin(0)
      filters.setPlaytimeMax(Infinity)
    } else {
      // Select
      filters.setPlaytimeMin(range.min)
      filters.setPlaytimeMax(range.max)
    }
  }

  const handleScoreToggle = (range) => {
    if (filters.scoreMin === range.min && filters.scoreMax === range.max) {
      // Desselect
      filters.setScoreMin(0)
      filters.setScoreMax(100)
    } else {
      // Select
      filters.setScoreMin(range.min)
      filters.setScoreMax(range.max)
    }
  }

  return (
    <div className="p-4 lg:p-6 dark:bg-gray-800">
      <div className="flex justify-between items-center mb-6 lg:mb-0 pb-4 lg:pb-0 border-b lg:border-0 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters {activeFilterCount > 0 && <span className="text-blue-600 dark:text-blue-400">({activeFilterCount})</span>}
        </h2>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          ✕
        </button>
      </div>

      {/* Playtime Filter */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Playtime</h3>
        <div className="space-y-2">
          {playtimeRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
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
      </div>

      {/* Score Filter */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Steam Score</h3>
        <div className="space-y-2">
          {scoreRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
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
      </div>

      {/* Reviews Filter */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Reviews</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Minimum: {filters.reviewsMin.toLocaleString()}</label>
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
            <label className="text-xs text-gray-600 dark:text-gray-400">Maximum: {filters.reviewsMax === Infinity ? '∞' : filters.reviewsMax.toLocaleString()}</label>
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
      </div>

      {/* Sort */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Sort By</h3>
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
      </div>

      {/* Played Games Filter */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Played Status</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
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
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
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
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
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
      </div>

      {/* Reset Button */}
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
        className="w-full mt-8 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
      >
        Reset Filters
      </button>
    </div>
  )
}

export default FilterPanel
