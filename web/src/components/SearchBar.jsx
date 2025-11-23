import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useDebounce } from '../hooks/useDebounce'

export function SearchBar({ value, onChange }) {
  const { t } = useLanguage()
  const [localValue, setLocalValue] = useState(value)
  // const debouncedValue = useDebounce(localValue, 500) // Disabled for instant search
  const inputRef = React.useRef(null)

  // Handle Ctrl+F keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Update parent immediately as user types (no debounce for instant search)
  const handleChange = (newValue) => {
    setLocalValue(newValue)
    onChange(newValue) // Call immediately instead of waiting for debounce
  }

  // Alternative: Call parent's onChange when debounced value changes (commented out for instant search)
  // useEffect(() => {
  //   onChange(debouncedValue)
  // }, [debouncedValue, onChange])

  return (
    <div className="mb-8">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={t('filter.search')}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-4 py-3 pl-10 rounded-lg glass border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          aria-label="Search games"
        />
        <svg 
          className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {localValue && (
          <button
            onClick={() => handleChange('')}
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
