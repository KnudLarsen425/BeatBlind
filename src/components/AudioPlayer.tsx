import { useEffect, useRef, useState, useCallback } from 'react'
import { REVEAL_STEPS, STEP_POINTS } from '../types'
import type { RevealStep } from '../types'

interface Props {
  previewUrl: string
  currentStep: RevealStep
  currentStepIndex: number
  onRevealMore: () => void
  canRevealMore: boolean
  roundDone: boolean
}

export function AudioPlayer({ previewUrl, currentStep, currentStepIndex, onRevealMore, canRevealMore, roundDone }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animFrameRef = useRef<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [bars, setBars] = useState<number[]>(Array.from({ length: 28 }, (_, i) => 20 + Math.sin(i * 0.8) * 12))

  function resetBars() {
    setBars(Array.from({ length: 28 }, (_, i) => 20 + Math.sin(i * 0.8) * 12))
  }

  const stop = useCallback(() => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    cancelAnimationFrame(animFrameRef.current)
    setIsPlaying(false)
    resetBars()
  }, [])

  useEffect(() => {
    stop()
    return stop
  }, [previewUrl, stop])
  useEffect(() => {
    if (roundDone) {
      stop()
      const audio = new Audio(previewUrl)
      audioRef.current = audio
      audio.addEventListener('canplay', () => {
        audio.play().then(() => {
          if (audioRef.current !== audio) return
          setIsPlaying(true)
        }).catch(() => {})
      }, { once: true })
      audio.addEventListener('ended', () => { setIsPlaying(false); cancelAnimationFrame(animFrameRef.current); resetBars() }, { once: true })
      audio.load()
    }
  }, [roundDone]) // eslint-disable-line react-hooks/exhaustive-deps

  function handlePlay() {
    stop()
    const audio = new Audio(previewUrl)
    audioRef.current = audio
    const duration = currentStep === 0.1 ? 0.2 : currentStep
    audio.addEventListener('canplay', () => {
      audio.play().then(() => {
        if (audioRef.current !== audio) return
        setIsPlaying(true)
      }).catch(() => setIsPlaying(false))
      stopTimerRef.current = setTimeout(() => {
        audio.pause()
        setIsPlaying(false)
        cancelAnimationFrame(animFrameRef.current)
        resetBars()
      }, duration * 1000)
    }, { once: true })
    audio.addEventListener('error', () => setIsPlaying(false), { once: true })
    audio.load()
  }

  function handleReveal() { stop(); onRevealMore() }

  return (
    <div className="space-y-3">
      {/* Animated waveform */}
      <div className="flex items-center justify-center gap-0.5 h-10 px-4">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${isPlaying ? 'bg-spotify-green animate-wave-live' : 'bg-white/15 animate-wave-idle'}`}
            style={{
              width: '3px',
              height: `${h}px`,
              animationDelay: `${i * 35}ms`,
              transitionDuration: isPlaying ? '35ms' : '400ms',
              opacity: isPlaying ? 0.7 + (i % 3) * 0.1 : 0.4,
            }}
          />
        ))}
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1.5">
        {REVEAL_STEPS.map((step, i) => (
          <div key={step} className="flex flex-col items-center gap-1">
            <div className={`rounded-full transition-all duration-500 ${
              i < currentStepIndex ? 'bg-spotify-green h-1 w-8' :
              i === currentStepIndex ? 'bg-spotify-green h-1.5 w-10 shadow-lg shadow-spotify-green/60' :
              'bg-white/10 h-1 w-6'
            }`} />
            <span className={`text-xs font-medium transition-colors ${i <= currentStepIndex ? 'text-spotify-green' : 'text-white/20'}`}>
              {step}s
            </span>
          </div>
        ))}
      </div>

      {/* Points */}
      <div className="text-center">
        <span className="text-xs text-white/40 uppercase tracking-widest">Correct now earns</span>
        <div className="text-3xl font-black text-spotify-green mt-0.5">{STEP_POINTS[currentStep]} <span className="text-lg text-white/40">pts</span></div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePlay}
          disabled={roundDone}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
            isPlaying
              ? 'bg-spotify-green text-black scale-95 shadow-xl shadow-spotify-green/40'
              : 'bg-spotify-green text-black hover:scale-110 active:scale-95 shadow-lg shadow-spotify-green/30'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {isPlaying
            ? <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            : <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current"><path d="M8 5v14l11-7z"/></svg>
          }
        </button>

        {canRevealMore && !roundDone && (
          <button onClick={handleReveal} className="btn-secondary text-sm py-2.5 px-5 flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current opacity-60">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            Reveal {REVEAL_STEPS[currentStepIndex + 1]}s
          </button>
        )}
      </div>
    </div>
  )
}
