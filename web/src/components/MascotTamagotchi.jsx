import React, { useState, useEffect, useRef } from 'react'

// Simple SVG mascot (can be replaced with a more elaborate one)
const MascotSVG = ({ mood, isBlinking, isWaving, isDancing, isDead, level }) => {
  // Mood: 'happy', 'neutral', 'sad', 'very-sad', 'sleepy', 'excited'
  let faceColor = isDead ? '#ccc' : 'url(#liquidGlassTint)';
  let eyeY = mood === 'happy' ? 18 : mood === 'sad' ? 22 : mood === 'very-sad' ? 24 : 20;
  let mouth = mood === 'happy'
    ? <path d="M18 28 Q24 34 30 28" stroke="#333" strokeWidth="2" fill="none" />
    : mood === 'sad'
    ? <path d="M18 32 Q24 26 30 32" stroke="#333" strokeWidth="2" fill="none" />
    : mood === 'very-sad'
    ? <path d="M18 35 Q24 24 30 35" stroke="#333" strokeWidth="2" fill="none" />
    : mood === 'excited'
    ? <ellipse cx="24" cy="30" rx="8" ry="4" fill="#333" />
    : mood === 'sleepy'
    ? <path d="M18 30 Q24 28 30 30" stroke="#333" strokeWidth="2" fill="none" />
    : <ellipse cx="24" cy="30" rx="6" ry="2" fill="#333" />;
  
  // Eyes: blink or normal, or dead
  const eyes = isDead ? (
    <>
      <line x1="14" y1="16" x2="18" y2="20" stroke="#333" strokeWidth="2" />
      <line x1="18" y1="16" x2="14" y2="20" stroke="#333" strokeWidth="2" />
      <line x1="30" y1="16" x2="34" y2="20" stroke="#333" strokeWidth="2" />
      <line x1="34" y1="16" x2="30" y2="20" stroke="#333" strokeWidth="2" />
    </>
  ) : isBlinking ? (
    <>
      <ellipse cx="16" cy={eyeY + 2} rx="2" ry="0.5" fill="#333" />
      <ellipse cx="32" cy={eyeY + 2} rx="2" ry="0.5" fill="#333" />
    </>
  ) : (
    <>
      <ellipse cx="16" cy={eyeY} rx="2" ry="3" fill="#333" />
      <ellipse cx="32" cy={eyeY} rx="2" ry="3" fill="#333" />
    </>
  );

  return (
    <svg width="64" height="64" viewBox="0 0 48 48" style={{filter: 'drop-shadow(0 0 16px #a78bfa) blur(0.5px)', transform: isWaving ? 'rotate(-10deg)' : isDancing ? 'scale(1.1) rotate(5deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease'}}>
      <defs>
        <radialGradient id="liquidGlassTint" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#a78bfa" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.12" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={faceColor} stroke="#6366f1" strokeWidth="2" style={{backdropFilter: 'blur(8px)'}} />
      {level >= 1 && <text x="24" y="6" fontSize="10" textAnchor="middle">👑</text>}
      {eyes}
      {mouth}
    </svg>
  )
}

export default function MascotTamagotchi() {
  const [mood, setMood] = useState('happy')
  const [clicks, setClicks] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const [isWaving, setIsWaving] = useState(false)
  const [isDancing, setIsDancing] = useState(false)
  const [hunger, setHunger] = useState(100)
  const [cleanliness, setCleanliness] = useState(100)
  const [boredom, setBoredom] = useState(100)
  const [visible, setVisible] = useState(false)
  const [isDead, setIsDead] = useState(false)
  const [evolutionLevel, setEvolutionLevel] = useState(0)
  const [totalAliveTime, setTotalAliveTime] = useState(0)
  const blinkIntervalRef = useRef(null)
  const waveTimeoutRef = useRef(null)
  const danceTimeoutRef = useRef(null)
  const clickCountRef = useRef(0)
  const clickTimeoutRef = useRef(null)

  useEffect(() => {
    if (clicks > 20) setMood('sleepy')
    else if (clicks > 15) setMood('excited')
    else if (clicks > 10) setMood('sad')
    else if (clicks > 5) setMood('neutral')
    else setMood('happy')
  }, [clicks])

  // Tamagotchi stats
  useEffect(() => {
    const interval = setInterval(() => {
      setHunger(h => Math.max(0, h - 5))
      setCleanliness(c => Math.max(0, c - 3))
      setBoredom(b => Math.max(0, b - 3))
    }, 15000) // Every 15 seconds
    return () => clearInterval(interval)
  }, [])

  // Check for death
  useEffect(() => {
    if (hunger <= 0 && cleanliness <= 0 && boredom <= 0) {
      setIsDead(true)
    }
  }, [hunger, cleanliness, boredom])

  // Update mood based on stats
  useEffect(() => {
    if (isDead) return
    const lowStats = [hunger <= 20, cleanliness <= 20, boredom <= 20].filter(Boolean).length
    const mediumStats = [hunger <= 50, cleanliness <= 50, boredom <= 50].filter(Boolean).length
    if (lowStats >= 2) setMood('very-sad')
    else if (lowStats >= 1) setMood('sad')
    else if (mediumStats >= 2) setMood('sad')
    else if (mediumStats >= 1) setMood('neutral')
    else setMood('happy')
  }, [hunger, cleanliness, boredom, isDead])

  // Alive time counter
  useEffect(() => {
    if (isDead) return
    const interval = setInterval(() => {
      setTotalAliveTime(t => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isDead])

  // Evolution check
  useEffect(() => {
    if (totalAliveTime > 300) setEvolutionLevel(1)
    else if (totalAliveTime > 600) setEvolutionLevel(2)
  }, [totalAliveTime])

  // Random blinking
  useEffect(() => {
    blinkIntervalRef.current = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, Math.random() * 3000 + 2000) // Blink every 2-5 seconds

    return () => {
      clearInterval(blinkIntervalRef.current)
      clearTimeout(waveTimeoutRef.current)
      clearTimeout(danceTimeoutRef.current)
      clearTimeout(clickTimeoutRef.current)
    }
  }, [])

  // Konami code detection
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    let keyIndex = 0
    let lastKeys = []

    const handleKeyDown = (e) => {
      lastKeys.push(e.key)
      lastKeys = lastKeys.slice(-10)

      if (e.key === konamiCode[keyIndex]) {
        keyIndex++
        if (keyIndex === konamiCode.length) {
          setVisible(true)
          keyIndex = 0
        }
      } else {
        keyIndex = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClick = () => {
    setClicks(c => c + 1)
    setIsWaving(true)
    waveTimeoutRef.current = setTimeout(() => setIsWaving(false), 500)
    
    // Triple click for dancing
    clickCountRef.current += 1
    if (clickCountRef.current === 3) {
      setIsDancing(true)
      danceTimeoutRef.current = setTimeout(() => setIsDancing(false), 3000) // Dance for 3 seconds
      clickCountRef.current = 0
      clearTimeout(clickTimeoutRef.current)
      return
    }
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0
    }, 1000) // Reset after 1 second
  }

  const handleDoubleClick = () => {
    setMood('excited')
    setTimeout(() => setClicks(c => c), 2000) // Reset mood after 2s
  }

  const feed = () => {
    setHunger(Math.min(100, hunger + 20))
    setBoredom(Math.min(100, boredom + 10))
  }

  const clean = () => {
    setCleanliness(100)
  }

  const play = () => {
    setBoredom(Math.min(100, boredom + 20))
  }

  return visible && (
    <div
      className="fixed bottom-4 left-4 z-50 flex flex-col items-center w-40"
      style={{ userSelect: 'none' }}
      title="¡Soy tu mascota!"
    >
      <div className="mb-1 flex flex-col gap-1 text-xs" style={{display: 'none'}}>
        <div>Hambre: {hunger}% <div className="bg-gray-300 h-2 rounded"><div className="bg-red-500 h-2 rounded" style={{width: (100 - hunger) + '%'}}></div></div></div>
        <div>Suciedad: {cleanliness}% <div className="bg-gray-300 h-2 rounded"><div className="bg-blue-500 h-2 rounded" style={{width: (100 - cleanliness) + '%'}}></div></div></div>
        <div>Aburrimiento: {boredom}% <div className="bg-gray-300 h-2 rounded"><div className="bg-yellow-500 h-2 rounded" style={{width: (100 - boredom) + '%'}}></div></div></div>
      </div>
      <div className="flex justify-center gap-1 mb-1">
        {cleanliness <= 0 && <span className="text-lg">💩</span>}
        {hunger <= 0 && <span className="text-lg">🦴</span>}
        {boredom <= 0 && <span className="text-lg">🎮</span>}
      </div>
      <MascotSVG mood={mood} isBlinking={isBlinking} isWaving={isWaving} isDancing={isDancing} isDead={isDead} level={evolutionLevel} />
      <div className="flex gap-1 mt-1">
        {isDead ? (
          <button onClick={() => { setIsDead(false); setHunger(100); setCleanliness(100); setBoredom(100); setTotalAliveTime(0); setEvolutionLevel(0); }} className="text-lg hover:scale-110 transition">🔄</button>
        ) : (
          <>
            <button onClick={feed} className="text-lg hover:scale-110 transition">🍎</button>
            <button onClick={clean} className="text-lg hover:scale-110 transition">🧽</button>
            <button onClick={play} className="text-lg hover:scale-110 transition">🎾</button>
          </>
        )}
      </div>
    </div>
  )
}
