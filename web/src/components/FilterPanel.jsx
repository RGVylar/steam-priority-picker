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
  ].filter(Boolean).length

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6 lg:mb-0 pb-4 lg:pb-0 border-b lg:border-0">
        <h2 className="text-lg font-semibold text-gray-900">
          Filters {activeFilterCount > 0 && <span className="text-blue-600">({activeFilterCount})</span>}
        </h2>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          ✕
        </button>
      </div>

      {/* Playtime Filter */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-3">Playtime</h3>
        <div className="space-y-2">
          {playtimeRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.playtimeMin === range.min && filters.playtimeMax === range.max}
                onChange={() => {
                  filters.setPlaytimeMin(range.min)
                  filters.setPlaytimeMax(range.max)
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Score Filter */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-3">Steam Score</h3>
        <div className="space-y-2">
          {scoreRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.scoreMin === range.min && filters.scoreMax === range.max}
                onChange={() => {
                  filters.setScoreMin(range.min)
                  filters.setScoreMax(range.max)
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => filters.setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          filters.setPlaytimeMin(0)
          filters.setPlaytimeMax(Infinity)
          filters.setScoreMin(0)
          filters.setScoreMax(100)
          filters.setSortBy('playtime_asc')
          filters.setSearchQuery('')
        }}
        className="w-full mt-8 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium transition-colors"
      >
        Reset Filters
      </button>
    </div>
  )
}

export default FilterPanel
