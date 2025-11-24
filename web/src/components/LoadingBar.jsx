import { useLanguage } from '../context/LanguageContext'
import { useState, useEffect } from 'react'

export function LoadingBar({ isLoading, gameCount, totalGames }) {
  const { t } = useLanguage()
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // Calculate real progress percentage
  const realProgress = totalGames > 0 ? (gameCount / totalGames) * 100 : 0

  // Smooth animation to real progress
  useEffect(() => {
    if (!isLoading) {
      setAnimatedProgress(0)
      return
    }

    const targetProgress = realProgress
    const startProgress = animatedProgress
    const duration = 300 // ms
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      
      // Smooth easing
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startProgress + (targetProgress - startProgress) * eased
      
      setAnimatedProgress(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isLoading, realProgress, animatedProgress])

  // When done loading, animate to 100%
  useEffect(() => {
    if (!isLoading && animatedProgress > 0) {
      setAnimatedProgress(100)
      const timeout = setTimeout(() => {
        setAnimatedProgress(0)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, animatedProgress])

  if (!isLoading) return null

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
              width: `${animatedProgress}%`,
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
            {gameCount.toLocaleString()} / {totalGames.toLocaleString()} {t('header.games')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {Math.round(realProgress)}%
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
