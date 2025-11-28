import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import FilterPanel from './components/FilterPanel'
import GameList from './components/GameList'
import SearchBar from './components/SearchBar'
import { BackendStatus } from './components/BackendStatus'
import { KofiButton } from './components/KofiButton'
import { useGames } from './hooks/useGames'
import { useFilters } from './hooks/useFilters'
import { useDarkMode } from './hooks/useDarkMode'
import { useGlassMode } from './hooks/useGlassMode'
import { usePlayed } from './hooks/usePlayed'
import { useAuthContext } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import { useSearchParams } from 'react-router-dom'
import appIcon from './image/icon.svg'
import backgroundIcon from './image/background.svg'
import MascotTamagotchi from './components/MascotTamagotchi'

function App() {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showMascot, setShowMascot] = useState(false)
  const [hoveredGame, setHoveredGame] = useState(null)
  const [prevHoveredGame, setPrevHoveredGame] = useState(null)
  const [randomGame, setRandomGame] = useState(null)
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  const { isGlass, toggle: toggleGlassMode } = useGlassMode()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, token } = useAuthContext()
  const { t } = useLanguage()
  const filters = useFilters()
  const { played, togglePlayed, isPlayed, getPlayedCount } = usePlayed()
  const { games, total, loading, error, dbTotal, forceRefresh, getRandomGame } = useGames(filters, played, isAuthenticated, token)
  const audioCtxRef = useRef(null)

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext
      try {
        audioCtxRef.current = new AC()
      } catch (e) {
        console.warn('AudioContext not available', e)
        audioCtxRef.current = null
      }
    }
    return audioCtxRef.current
  }

  const playTone = (freq = 440, duration = 0.2, type = 'sine', gain = 0.06) => {
    const ctx = ensureAudio()
    if (!ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.value = 0.0001
    o.connect(g)
    g.connect(ctx.destination)
    const now = ctx.currentTime
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(gain, now + 0.01)
    o.start(now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    o.stop(now + duration + 0.02)
  }

  const playKonamiSound = () => {
    const ctx = ensureAudio()
    if (!ctx) return
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') ctx.resume()
    // Play a short ascending arpeggio + sparkle to convey "you found something" surprise
    // Use small delays between tones
    const seq = [440, 660, 880]
    seq.forEach((f, i) => setTimeout(() => playTone(f, 0.12, i === seq.length - 1 ? 'triangle' : 'sine', 0.08), i * 120))
    // sparkle
    setTimeout(() => playTone(1320, 0.18, 'sine', 0.05), seq.length * 120 + 40)
  }

  // Handle smooth transition between background images
  useEffect(() => {
    // Si hay un hover, siempre actualizar prevHoveredGame
    if (hoveredGame) {
      setPrevHoveredGame(hoveredGame)
      return
    }
    
    // Si se abrió un random game, limpiar hover pero mantener prevHoveredGame
    if (randomGame) {
      setHoveredGame(null)
      return
    }
    
    // Si se cerró todo (no hay hover ni random game), limpiar prevHoveredGame
    setPrevHoveredGame(null)
  }, [hoveredGame, randomGame])

  // Handle auth token from URL
  useEffect(() => {
    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')
    
    if (token) {
      console.log('Token found in URL, saving:', token.substring(0, 20) + '...')
      localStorage.setItem('auth_token', token)
      // Trigger a refresh so AuthContext picks up the new token
      window.location.href = '/'
    }
    
    if (errorParam) {
      console.error('Auth error:', errorParam)
      // Clean URL
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  // Konami code detection (only when authenticated). Toggle mascot visibility.
  useEffect(() => {
    if (!isAuthenticated) {
      setShowMascot(false)
      return
    }

    const konamiCode = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a']
    let keyIndex = 0

    const handleKeyDown = (e) => {
      // Normalize key: prefer e.key, fallback to keyCode mapping
      let key = (e.key || '').toLowerCase()
      if (!key && e.keyCode) {
        const map = {37: 'arrowleft', 38: 'arrowup', 39: 'arrowright', 40: 'arrowdown', 65: 'a', 66: 'b'}
        key = map[e.keyCode] || ''
      }

      // Debugging: show progressed key
      // eslint-disable-next-line no-console
      console.debug('Konami key:', key, 'expected:', konamiCode[keyIndex])

      if (key === konamiCode[keyIndex]) {
        keyIndex++
        if (keyIndex === konamiCode.length) {
          // eslint-disable-next-line no-console
          console.info('Konami code entered — toggling mascot')
          // play a short konami surprise sound
          try { playKonamiSound() } catch(e) {}
          setShowMascot(s => !s)
          keyIndex = 0
        }
      } else {
        keyIndex = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthenticated])

  return (
    <>
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 relative overflow-hidden">
      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-white/30 via-transparent to-gray-200/30 dark:from-slate-800/20 dark:via-transparent dark:to-slate-950/40" />
      {/* Dynamic Background Image - Only show when glass mode is enabled */}
      {isGlass && (
        <>
          {/* Default background with app icon */}
          <div
            className="fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center"
            style={{
              backgroundImage: `url(${backgroundIcon})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: hoveredGame || randomGame ? 0 : 0.15,
              filter: 'blur(10px)',
            }}
          />
          {/* Game image on hover */}
          <div
            className="fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: randomGame
                ? `url(${randomGame.header_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${randomGame.app_id}/header.jpg`})`
                : prevHoveredGame
                ? `url(${prevHoveredGame.image_url || `https://cdn.cloudflare.steamstatic.com/steam/apps/${prevHoveredGame.app_id}/header.jpg`})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: randomGame ? 0.5 : (hoveredGame ? 0.5 : 0),
              filter: 'blur(30px)',
            }}
          />
        </>
      )}
      <Header 
        onMenuClick={() => setShowMobileFilters(!showMobileFilters)}
        onDarkModeToggle={toggleDarkMode}
        isDarkMode={isDark}
        onGlassModeToggle={toggleGlassMode}
        isGlassMode={isGlass}
        dbTotal={dbTotal}
        userTotal={total}
        onRefresh={forceRefresh}
        isRefreshing={loading}
        className="relative z-10"
      />
      
        <div className="flex">
            {/* Filter Panel - Only show when authenticated */}
            {isAuthenticated && (
              <div className={`
                fixed lg:relative lg:block
                ${showMobileFilters ? 'block' : 'hidden'}
                inset-0 z-40 lg:z-0
                bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent
                w-full lg:w-64 lg:min-h-[calc(100vh-64px)]
                overflow-y-auto lg:overflow-y-visible
                border-r border-gray-200 dark:border-gray-700
              `}>
                <FilterPanel 
                  filters={filters}
                  onClose={() => setShowMobileFilters(false)}
                  played={played}
                  showMascot={showMascot}
                  setShowMascot={setShowMascot}
                />
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 w-full">
              <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Show message if not authenticated */}
                {!isAuthenticated ? (
                  <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
                    <div className="max-w-2xl">
                      {/* Hero Section */}
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <img src={appIcon} alt="Steam Priority Picker" className="w-12 h-12" />
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                          Steam Priority Picker
                        </h1>
                      </div>
                      <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-8">
                        {t('landing.subtitle')}
                      </p>
                      
                      {/* Features */}
                      <div className="grid md:grid-cols-3 gap-6 mb-10 text-left">
                        <div className="glass bg-white/10 dark:bg-gray-800/30 p-6 rounded-lg border border-white/20 dark:border-gray-700/30">
                          <div className="text-3xl mb-3">📊</div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {t('landing.feature1Title')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('landing.feature1Desc')}
                          </p>
                        </div>
                        
                        <div className="glass bg-white/10 dark:bg-gray-800/30 p-6 rounded-lg border border-white/20 dark:border-gray-700/30">
                          <div className="text-3xl mb-3">🔍</div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {t('landing.feature2Title')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('landing.feature2Desc')}
                          </p>
                        </div>
                        
                        <div className="glass bg-white/10 dark:bg-gray-800/30 p-6 rounded-lg border border-white/20 dark:border-gray-700/30">
                          <div className="text-3xl mb-3">⏱️</div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {t('landing.feature3Title')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('landing.feature3Desc')}
                          </p>
                        </div>
                      </div>
                      
                      {/* CTA */}
                      <div className="glass bg-blue-500/10 dark:bg-blue-900/20 border border-blue-400/30 dark:border-blue-800/40 rounded-lg p-6 mb-4">
                        <p className="text-lg text-gray-800 dark:text-gray-200 mb-3">
                          {t('landing.cta')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('landing.ctaHint')}
                        </p>
                      </div>
                      
                      {/* Privacy note */}
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {t('landing.privacy')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Search Bar */}
                    <SearchBar 
                      value={filters.searchQuery}
                      onChange={filters.setSearchQuery}
                    />

                    {/* Games List */}
                    {error && (
                      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
                        {error}
                      </div>
                    )}

                    <GameList 
                      games={games}
                      total={total}
                      loading={loading}
                      filters={filters}
                      togglePlayed={togglePlayed}
                      isPlayed={isPlayed}
                      onGameHover={setHoveredGame}
                      getRandomGame={getRandomGame}
                      onRandomGameSelect={(game) => {
                        setRandomGame(game)
                        setHoveredGame(null) // Limpiar hover cuando se abre random
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile overlay */}
          {showMobileFilters && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-30 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
          )}

          {/* Backend Status Indicator */}
          <BackendStatus />
          
          {/* Ko-fi Support Button */}
          <KofiButton />

          {/* Mascot is rendered inline inside FilterPanel when `showMascot` is true */}
      </div>
    </>
  )
}

export default App
