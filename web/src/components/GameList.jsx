import GameCard from './GameCard'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { useLanguage } from '../context/LanguageContext'
import { useState, useEffect, useMemo } from 'react'

// Crear un sonido de spin usando Web Audio API
const playSpinSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const now = audioContext.currentTime
    
    // Crear un sonido de "slot machine" - nota que baja de tono
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Frecuencia inicial (alta) que baja a frecuencia final (baja)
    oscillator.frequency.setValueAtTime(800, now)
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.5)
    
    // Volumen
    gainNode.gain.setValueAtTime(0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
    
    oscillator.type = 'sine'
    oscillator.start(now)
    oscillator.stop(now + 0.5)
  } catch (e) {
    console.log('Audio context not available')
  }
}

const playWinSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const now = audioContext.currentTime
    
    // Crear un sonido de "victoria" - 3 notas ascendentes
    const frequencies = [523, 659, 784] // Do, Mi, Sol
    
    frequencies.forEach((freq, index) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()
      
      osc.connect(gain)
      gain.connect(audioContext.destination)
      
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.2, now + index * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.2)
      
      osc.type = 'sine'
      osc.start(now + index * 0.15)
      osc.stop(now + index * 0.15 + 0.2)
    })
  } catch (e) {
    console.log('Audio context not available')
  }
}

export function GameList({ games, total, loading, filters, togglePlayed, isPlayed, onGameHover, getRandomGame, onRandomGameSelect }) {
  const { t } = useLanguage()
  const { displayedItems, hasMore, observerTarget } = useInfiniteScroll(games, 24)
  const [selectedRandomGame, setSelectedRandomGame] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [previousItems, setPreviousItems] = useState([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinningGames, setSpinningGames] = useState([])
  const [slotOffset, setSlotOffset] = useState(0)
  const [slotTransitionDuration, setSlotTransitionDuration] = useState(0)

  const handleRandomGame = () => {
    const randomGame = getRandomGame()
    if (randomGame) {
      playSpinSound() // Reproducir sonido de spin
      
      // Inicia la animación "slot machine"
      setIsSpinning(true)
      
      // Crea un carrusel de juegos para el efecto visual
      const carouselGames = []
      for (let i = 0; i < 20; i++) {
        carouselGames.push(games[Math.floor(Math.random() * games.length)])
      }
      carouselGames.push(randomGame) // Añade el juego final al final (índice 20)
      
      setSpinningGames(carouselGames)
      setSlotOffset(0)
      setSlotTransitionDuration(0)
      
      // Duración total de la animación en ms
      const SPIN_DURATION = 2500
      const INITIAL_FRAME_DURATION = 25
      const FINAL_FRAME_DURATION = 300
      const TOTAL_ITEMS = 21 // 20 random + 1 final
      
      let elapsedTime = 0
      let currentIndex = 0
      let frameCount = 0
      
      const spinAnimation = () => {
        frameCount++
        
        // Función de easing "easeOutQuad"
        const progress = Math.min(elapsedTime / SPIN_DURATION, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 2)
        
        // Interpolar la duración del frame
        const currentFrameDuration = INITIAL_FRAME_DURATION + 
          (FINAL_FRAME_DURATION - INITIAL_FRAME_DURATION) * easeProgress
        
        // El índice debe alcanzar TOTAL_ITEMS - 1 (20) exactamente cuando progress = 1
        const targetIndex = Math.round(easeProgress * (TOTAL_ITEMS - 1))
        currentIndex = targetIndex
        
        setSlotTransitionDuration(currentFrameDuration)
        setSlotOffset(currentIndex * 256)
        elapsedTime += currentFrameDuration
        
        if (progress < 1) {
          // Continuar animación
          setTimeout(spinAnimation, currentFrameDuration)
        } else {
          // Animación completada
          playWinSound() // Reproducir sonido de victoria
          setSlotOffset((TOTAL_ITEMS - 1) * 256) // Asegurar que estamos exactamente en el último
          setSlotTransitionDuration(0)
          setSelectedRandomGame(randomGame)
          setIsSpinning(false)
          setIsOpening(true)
          setTimeout(() => {
            setIsOpening(false)
          }, 50)
          if (onRandomGameSelect) {
            onRandomGameSelect(randomGame)
          }
        }
      }
      
      spinAnimation()
    }
  }

  const launchGame = (appId) => {
    // Lanzar el juego mediante Steam protocol
    window.location.href = `steam://run/${appId}`
  }

  const closeModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setSelectedRandomGame(null)
      if (onRandomGameSelect) {
        onRandomGameSelect(null) // Limpiar el randomGame en App
      }
      setIsClosing(false)
    }, 300)
  }

  // Track which games are disappearing
  const disappearingIds = useMemo(() => {
    const currentIds = new Set(displayedItems.map(g => g.app_id))
    return previousItems
      .filter(g => !currentIds.has(g.app_id))
      .map(g => g.app_id)
  }, [displayedItems, previousItems])

  // Update previous items after a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousItems(displayedItems)
    }, 300)
    return () => clearTimeout(timer)
  }, [displayedItems])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('games.loading')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('games.loadingHint')}
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse aspect-[2/3]" />
          ))}
        </div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('games.noGames')}</p>
        <button
          onClick={() => {
            filters.setPlaytimeMin(0)
            filters.setPlaytimeMax(Infinity)
            filters.setScoreMin(0)
            filters.setScoreMax(100)
            filters.setSearchQuery('')
            filters.setShowPlayed('all')
            filters.setShowUnknown(true)
            filters.setSortBy('playtime_asc')
          }}
          className="mt-4 px-4 py-2 glass hover-glow bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/90 transition-colors"
        >
          {t('filter.reset')}
        </button>
      </div>
    )
  }

  return (
    <>
      {(selectedRandomGame || isSpinning) && (
        <>
          {/* Overlay con animación */}
          <div className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
            onClick={!isSpinning ? closeModal : undefined}
          />
          
          {/* Modal con liquid glass */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className={`glass rounded-2xl shadow-2xl max-w-md w-full overflow-hidden pointer-events-auto transition-all duration-300 ${
              isClosing 
                ? 'opacity-0 scale-95' 
                : isOpening
                ? 'opacity-0 scale-95'
                : 'opacity-100 scale-100'
            }`}>
              {/* Header con X */}
              <div className="relative group">
                {/* Mostrar carrusel de imágenes durante el spinning */}
                {isSpinning ? (
                  <div className="w-full h-64 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center relative overflow-hidden">
                    {/* Contenedor del carrusel */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div 
                        className="flex flex-col"
                        style={{
                          transform: `translateY(-${slotOffset}px)`,
                          transitionDuration: `${slotTransitionDuration}ms`,
                          transitionProperty: 'transform',
                          transitionTimingFunction: 'linear',
                          height: `${spinningGames.length * 256}px`,
                          filter: `blur(${Math.min(slotOffset / 100, 2)}px)` // Desenfoque progresivo
                        }}
                      >
                        {spinningGames.map((game, idx) => (
                          <div key={idx} className="w-full h-64 flex-shrink-0 overflow-hidden">
                            {game && game.header_image && (
                              <img 
                                src={game.header_image}
                                alt={game.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Overlay oscuro superior con degradado fuerte */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
                    
                    {/* Overlay oscuro inferior con degradado fuerte */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                    
                    {/* Viñeta oscura en los bordes laterales */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
                    
                    {/* Efecto de brillo central */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none" />
                    
                    {/* Líneas de enfoque central (opcional) */}
                    <div className="absolute top-1/2 left-0 right-0 h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent transform -translate-y-1/2 pointer-events-none" />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      title="Close"
                    >
                      ✕
                    </button>
                    <img 
                      src={selectedRandomGame.header_image} 
                      alt={selectedRandomGame.name}
                      className="w-full h-64 object-cover cursor-pointer transition-all duration-300"
                      onClick={() => launchGame(selectedRandomGame.app_id)}
                    />
                    
                    {/* Overlay con botón play */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                      <button
                        onClick={() => launchGame(selectedRandomGame.app_id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white text-gray-900 rounded-full p-4 shadow-lg transform group-hover:scale-110 transition-transform"
                        title="Play on Steam"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Contenido */}
              <div className="p-6">
                {isSpinning ? (
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-pulse">
                      {t('games.randomPick')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">{t('games.pickingGame')}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-center text-purple-600 dark:text-purple-400 text-sm font-semibold mb-3">{t('games.randomPick')}</p>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">
                      {selectedRandomGame.name}
                    </h2>

                    {/* Información del juego */}
                    <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
                      {selectedRandomGame.hltb_hours > 0 && (
                        <div className="flex items-center justify-between p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg backdrop-blur-sm border border-blue-200/20 dark:border-blue-400/20">
                          <span>{t('games.timeToBeatLabel')}:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedRandomGame.hltb_hours.toFixed(1)}h</span>
                        </div>
                      )}
                      
                      {selectedRandomGame.score > 0 && (
                        <div className="flex items-center justify-between p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg backdrop-blur-sm border border-yellow-200/20 dark:border-yellow-400/20">
                          <span>{t('games.scoreLabel')}:</span>
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">{selectedRandomGame.score}/100</span>
                        </div>
                      )}
                      
                      {selectedRandomGame.total_reviews > 0 && (
                        <div className="flex items-center justify-between p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg backdrop-blur-sm border border-green-200/20 dark:border-green-400/20">
                          <span>{t('games.reviewsLabel')}:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">{selectedRandomGame.total_reviews.toLocaleString()}</span>
                        </div>
                      )}

                      {selectedRandomGame.playtime_hours !== undefined && selectedRandomGame.playtime_hours > 0 && (
                        <div className="flex items-center justify-between p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-200/20 dark:border-purple-400/20">
                          <span>{t('games.yourPlaytimeLabel')}:</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">{selectedRandomGame.playtime_hours.toFixed(1)}h</span>
                        </div>
                      )}
                    </div>

                    {/* Botones */}
                    <div className="space-y-2">
                      <button
                        onClick={() => launchGame(selectedRandomGame.app_id)}
                        className="w-full px-4 py-3 glass hover-glow bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-700/90 hover:to-emerald-700/90 text-white rounded-lg transition-all font-semibold"
                      >
                        {t('games.playOnSteam')}
                      </button>
                      
                      <button
                        onClick={handleRandomGame}
                        className="w-full px-4 py-2 glass hover-glow bg-gradient-to-r from-blue-600/80 to-cyan-600/80 hover:from-blue-700/90 hover:to-cyan-700/90 text-white rounded-lg transition-all font-semibold"
                      >
                        {t('games.reroll')}
                      </button>
                      
                      <button
                        onClick={closeModal}
                        className="w-full px-4 py-2 glass text-gray-700 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors"
                      >
                        {t('games.close')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('games.showing')} <span className="font-medium text-gray-900 dark:text-white">{displayedItems.length}</span> {t('games.of')} <span className="font-medium text-gray-900 dark:text-white">{games.length}</span> {t('header.games')}
          {games.length < total && (
            <span className="text-gray-400 dark:text-gray-500 ml-2">({total} {t('games.beforeFilters')})</span>
          )}
        </div>
        {games.length > 0 && (
          <button
            onClick={handleRandomGame}
            className="px-4 py-2 glass hover-glow bg-purple-600/80 text-white rounded-lg hover:bg-purple-700/90 transition-colors text-sm font-medium"
            title="Pick a random game from filtered list"
          >
            {t('games.random')}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {previousItems.map((game) => (
          <div 
            key={game.app_id} 
            className={disappearingIds.includes(game.app_id) ? 'animate-fade-out' : ''}
          >
            <GameCard 
              game={game} 
              isPlayed={isPlayed(game.app_id)}
              onTogglePlayed={() => togglePlayed(game.app_id)}
              onMouseEnter={() => onGameHover && onGameHover(game)}
              onMouseLeave={() => onGameHover && onGameHover(null)}
            />
          </div>
        ))}
        {displayedItems.map((game) => (
          !previousItems.find(p => p.app_id === game.app_id) && (
            <div key={game.app_id} className="animate-fade-in">
              <GameCard 
                game={game} 
                isPlayed={isPlayed(game.app_id)}
                onTogglePlayed={() => togglePlayed(game.app_id)}
                onMouseEnter={() => onGameHover && onGameHover(game)}
                onMouseLeave={() => onGameHover && onGameHover(null)}
              />
            </div>
          )
        ))}
      </div>

      {/* Elemento para detectar cuando llegar al final */}
      {hasMore && (
        <div 
          ref={observerTarget} 
          className="mt-12 py-8 text-center text-gray-500 dark:text-gray-400"
        >
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4">Loading more games...</p>
        </div>
      )}
    </>
  )
}

export default GameList
