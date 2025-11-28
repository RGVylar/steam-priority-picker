import React, { useState, useEffect, useRef } from 'react'

// Simple SVG mascot (can be replaced with a more elaborate one)
const MascotSVG = ({ mood, isBlinking, isWaving, isDancing, isDead, level, isEating, isPlaying, isCleaning, cleanliness, age }) => {
  // Mood: 'happy', 'neutral', 'sad', 'very-sad', 'sleepy', 'excited'
  let faceColor = isDead ? '#f3f4f6' : 'url(#liquidGlassTint)';
  let dirtiness = (100 - cleanliness) / 100;
  let scale = 1 + age / 200; // Bigger as it ages
  let eyeY = mood === 'happy' ? 18 : mood === 'sad' ? 22 : mood === 'very-sad' ? 24 : 20;
  let mouth;
  if (mood === 'happy') {
    mouth = <path d="M18 28 Q24 34 30 28" stroke="#333" strokeWidth="2" fill="none" className={isEating ? 'tmg-mouth-closed-eating' : 'tmg-mouth-closed-normal'} />
  } else if (mood === 'sad') {
    mouth = <path d="M18 32 Q24 26 30 32" stroke="#333" strokeWidth="2" fill="none" className={isEating ? 'tmg-mouth-closed-eating' : 'tmg-mouth-closed-normal'} />
  } else if (mood === 'very-sad') {
    mouth = <path d="M18 35 Q24 24 30 35" stroke="#333" strokeWidth="2" fill="none" className={isEating ? 'tmg-mouth-closed-eating' : 'tmg-mouth-closed-normal'} />
  } else if (mood === 'excited') {
    mouth = <ellipse cx="24" cy="30" rx="8" ry="4" fill="#333" className={isEating ? 'tmg-mouth-closed-eating' : 'tmg-mouth-closed-normal'} />
  } else if (mood === 'sleepy') {
    mouth = <path d="M18 30 Q24 28 30 30" stroke="#333" strokeWidth="2" fill="none" className={isEating ? 'tmg-mouth-closed-eating' : 'tmg-mouth-closed-normal'} />
  } else {
    mouth = null
  }
  
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

  // Lines under eyes for old age
  const eyeLines = age > 50 ? (
    <>
      {/* Left eye */}
      <line x1="12" y1="22" x2="20" y2="22" stroke="#8B4513" strokeWidth="1" opacity={age / 100} />
      {age >= 75 && <line x1="20" y1="22" x2="12" y2="24" stroke="#8B4513" strokeWidth="1" opacity={age / 100} />}
      {/* Right eye */}
      <line x1="28" y1="22" x2="36" y2="22" stroke="#8B4513" strokeWidth="1" opacity={age / 100} />
      {age >= 75 && <line x1="28" y1="22" x2="36" y2="24" stroke="#8B4513" strokeWidth="1" opacity={age / 100} />}
    </>
  ) : null;

  return (
    <svg width="64" height="64" viewBox="0 0 48 48" style={{filter: 'drop-shadow(0 0 16px #a78bfa) blur(0.5px)', transform: `scale(${scale})`}}>
      <defs>
        <radialGradient id="liquidGlassTint" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#a78bfa" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.12" />
        </radialGradient>
        <style>{`.tmg-cleaning-line { animation: tmg-water-fall 1s infinite; } @keyframes tmg-water-fall { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } } .tmg-eat-ball { animation: tmg-eat-ball 0.5s forwards; } @keyframes tmg-eat-ball { 0% { transform: translate(0,0); opacity: 1; } 50% { transform: translate(-11px,5px); opacity: 1; } 100% { transform: translate(-11px,5px); opacity: 0; } } .tmg-playing { animation: tmg-play 0.5s 2; } @keyframes tmg-play { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } } .tmg-mouth-closed-normal { opacity: 1; } .tmg-mouth-open-normal { opacity: 0; } .tmg-mouth-closed-eating { animation: tmg-mouth-closed 1s; } @keyframes tmg-mouth-closed { 0% { opacity: 1; } 25% { opacity: 0; } 50% { opacity: 1; } 75% { opacity: 0; } 100% { opacity: 1; } } .tmg-mouth-open-eating { animation: tmg-mouth-open 1s; } @keyframes tmg-mouth-open { 0% { opacity: 0; } 25% { opacity: 1; } 50% { opacity: 0; } 75% { opacity: 1; } 100% { opacity: 0; } }`}</style>
      </defs>
      <circle cx="24" cy="24" r="20" fill={faceColor} stroke={isDead ? '#999' : '#6366f1'} strokeWidth="2" style={{backdropFilter: 'blur(8px)'}} className={isPlaying ? "tmg-playing" : ""}>
        {isCleaning && <animate attributeName="fill" values="url(#liquidGlassTint);#a78bfa;url(#liquidGlassTint)" dur="1s" />}
      </circle>
      <circle cx="24" cy="24" r="20" fill="#8B4513" opacity={dirtiness} />
      {level >= 1 && <text x="24" y="6" fontSize="10" textAnchor="middle">👑</text>}
      {eyeLines}
      {eyes}
      {mouth}
      <path d="M18 26 Q24 38 30 26" stroke="#333" strokeWidth="2" fill="none" className={isEating ? 'tmg-mouth-open-eating' : 'tmg-mouth-open-normal'} />
      {isEating && <circle cx="35" cy="25" r="2" fill="red" className="tmg-eat-ball" />}
      {isCleaning && <>
        <polygon points="24,-5 12,5 36,5" fill="gray" />
        <line x1="16" y1="5" x2="16" y2="22" stroke="cyan" strokeWidth="4" className="tmg-cleaning-line" />
        <line x1="20" y1="5" x2="20" y2="22" stroke="cyan" strokeWidth="4" className="tmg-cleaning-line" />
        <line x1="24" y1="5" x2="24" y2="22" stroke="cyan" strokeWidth="4" className="tmg-cleaning-line" />
        <line x1="28" y1="5" x2="28" y2="22" stroke="cyan" strokeWidth="4" className="tmg-cleaning-line" />
        <line x1="32" y1="5" x2="32" y2="22" stroke="cyan" strokeWidth="4" className="tmg-cleaning-line" />
      </>}
      {isWaving && <animateTransform attributeName="transform" type="rotate" values="0 24 24;-10 24 24;0 24 24" dur="1s" repeatCount="1" />}
      {isDancing && <>
        <animateTransform attributeName="transform" type="scale" values="1 1;1.05 1.05;1.1 1.1;1.05 1.05;1 1" dur="1s" repeatCount="1" additive="sum" />
        <animateTransform attributeName="transform" type="rotate" values="0 24 24;2 24 24;5 24 24;2 24 24;0 24 24" dur="1s" repeatCount="1" additive="sum" />
      </>}
    </svg>
  )
}

export default function MascotTamagotchi({ inline = false, startVisible = false, soundEnabled = true }) {
  const [mood, setMood] = useState('happy')
  const [clicks, setClicks] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const [isWaving, setIsWaving] = useState(false)
  const [isDancing, setIsDancing] = useState(false)
  const [isEating, setIsEating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [hunger, setHunger] = useState(100)
  const [cleanliness, setCleanliness] = useState(100)
  const [boredom, setBoredom] = useState(100)
  const [visible, setVisible] = useState(startVisible)
  const [isDead, setIsDead] = useState(false)
  const [evolutionLevel, setEvolutionLevel] = useState(0)
  const [totalAliveTime, setTotalAliveTime] = useState(0)
  const [age, setAge] = useState(0)
  const blinkIntervalRef = useRef(null)
  const waveTimeoutRef = useRef(null)
  const danceTimeoutRef = useRef(null)
  const clickCountRef = useRef(0)
  const clickTimeoutRef = useRef(null)
  const audioCtxRef = useRef(null)

  useEffect(() => {
    window.logMascotStats = () => {
      console.log(`Hunger: ${(100 - hunger)}%\nCleanliness: ${(100 - cleanliness)}%\nBoredom: ${(100 - boredom)}%\nAge: ${age}%\nMood: ${mood}\nLevel: ${evolutionLevel}\nAlive Time: ${totalAliveTime}s\nDead: ${isDead}`);
    };
    return () => {
      delete window.logMascotStats;
    };
  }, [hunger, cleanliness, boredom, age, mood, evolutionLevel, totalAliveTime, isDead]);

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
    } else if (age >= 100) {
      setIsDead(true)
    }
  }, [hunger, cleanliness, boredom, age])

  // Play death sound when isDead becomes true; play revive sound when revived
  useEffect(() => {
    if (isDead) {
      // low sad tone
      playTone(180, 0.8, 'sine', 0.08)
    }
  }, [isDead])

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

  // Age calculation
  useEffect(() => {
    setAge(Math.min(100, totalAliveTime / 18))
  }, [totalAliveTime])

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

  // Note: Konami detection is handled by App.jsx (global). This component
  // accepts `startVisible` and `inline` to control initial visibility and placement.

  // --- Audio helpers (WebAudio synth) ---
  const ensureAudio = () => {
    if (!soundEnabled) return null
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
    setIsEating(true)
    // sound: gentle chime
    playTone(880, 0.18, 'sine', 0.06)
    setTimeout(() => setIsEating(false), 1000)
  }

  const clean = () => {
    setCleanliness(100)
    setIsCleaning(true)
    // sound: short triangle sparkle
    playTone(740, 0.12, 'triangle', 0.05)
    setTimeout(() => setIsCleaning(false), 1000)
  }

  const play = () => {
    setBoredom(Math.min(100, boredom + 20))
    setIsPlaying(true)
    // sound: playful short tone
    playTone(660, 0.15, 'square', 0.08)
    setTimeout(() => setIsPlaying(false), 1000)
  }

  if (!visible) return null

  const containerClass = inline
    ? 'mt-4 flex flex-col items-center w-full'
    : 'fixed bottom-4 left-4 z-50 flex flex-col items-center w-40'

  return (
    <div
      className={containerClass}
      style={{ userSelect: 'none' }}
      title="¡Soy tu mascota!"
    >
      <div className="mb-1 flex flex-col gap-1 text-xs" style={{display: 'none'}}>
        <div>Hambre: {(100 - hunger)}% <div className="bg-gray-300 h-2 rounded"><div className="bg-red-500 h-2 rounded" style={{width: (100 - hunger) + '%'}}></div></div></div>
        <div>Suciedad: {(100 - cleanliness)}% <div className="bg-gray-300 h-2 rounded"><div className="bg-blue-500 h-2 rounded" style={{width: (100 - cleanliness) + '%'}}></div></div></div>
        <div>Aburrimiento: {(100 - boredom)}% <div className="bg-gray-300 h-2 rounded"><div className="bg-yellow-500 h-2 rounded" style={{width: (100 - boredom) + '%'}}></div></div></div>
        <div>Edad: {age}% <div className="bg-gray-300 h-2 rounded"><div className="bg-purple-500 h-2 rounded" style={{width: age + '%'}}></div></div></div>
      </div>
      <div className="flex justify-center items-center gap-1 mb-1 h-6" style={{minHeight: '1.5rem'}}>
        {(100 - cleanliness) >= 25 && <span className="text-lg">💩</span>}
        {(100 - hunger) >= 25 && <span className="text-lg">🦴</span>}
        {(100 - boredom) >= 25 && <span className="text-lg">🎮</span>}
      </div>
      <MascotSVG mood={mood} isBlinking={isBlinking} isWaving={isWaving} isDancing={isDancing} isDead={isDead} level={evolutionLevel} isEating={isEating} isPlaying={isPlaying} isCleaning={isCleaning} cleanliness={cleanliness} age={age} />
      <div className="flex gap-1 mt-1">
        {isDead ? (
          <button onClick={() => { setIsDead(false); setHunger(100); setCleanliness(100); setBoredom(100); setTotalAliveTime(0); setEvolutionLevel(0); setAge(0); playTone(880,0.25,'sine',0.08); }} className="text-lg hover:scale-110 transition">🔄</button>
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
