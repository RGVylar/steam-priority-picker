import { useLanguage } from '../context/LanguageContext'
import { useState, useEffect } from 'react'

export function LoadingBar({ isLoading, gameCount, totalGames }) {
  const { t } = useLanguage()
  const [simulatedProgress, setSimulatedProgress] = useState(0)

  // Simulate progress while loading
  useEffect(() => {
    if (!isLoading) {
      setSimulatedProgress(0)
      return
    }

    // Start at 10% immediately
    setSimulatedProgress(10)

    // Gradually increase to 90% over time
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 90) return 90
        // Random increment between 5-15%
        return prev + Math.random() * 10 + 5
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  // When done loading, jump to 100%
  useEffect(() => {
    if (!isLoading && simulatedProgress > 0) {
      setSimulatedProgress(100)
      // Reset after animation completes
      const timeout = setTimeout(() => {
        setSimulatedProgress(0)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, simulatedProgress])

  if (!isLoading) return null

  // Use actual count if available, otherwise use simulated progress
  const percentage = totalGames > 0 && gameCount > 0 ? (gameCount / totalGames) * 100 : simulatedProgress
  const displayCount = gameCount > 0 ? gameCount : Math.floor((simulatedProgress / 100) * (totalGames || 100))

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
        {/* Title */}
        <h2 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t('games.loading')}
        </h2>

        {/* Progress Bar Container */}
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/20">
          {/* Animated gradient bar */}
          <div
            className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-300 ease-out shadow-lg"
            style={{
              width: `${percentage}%`,
              boxShadow: '0 0 20px rgba(96, 165, 250, 0.6), 0 0 40px rgba(168, 85, 247, 0.3)',
            }}
          />
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"
            style={{
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>

        {/* Counter Text */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {displayCount.toLocaleString()} / {(totalGames || '...').toLocaleString && (totalGames || '...').toLocaleString() || totalGames || '...'} {t('header.games')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {Math.round(percentage)}%
          </p>
        </div>

        {/* Hint text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          {t('games.loadingHint')}
        </p>

        <style>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
