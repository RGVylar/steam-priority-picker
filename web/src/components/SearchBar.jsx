export function SearchBar({ value, onChange }) {
  return (
    <div className="mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search games... (Cmd/Ctrl + K)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search games"
        />
        <svg 
          className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBar
