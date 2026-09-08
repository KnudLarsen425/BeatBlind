import { useRef, useCallback, useState } from 'react'

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const stop = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }, [])

  const play = useCallback(
    (url: string, durationSeconds: number, startAt = 0): Promise<void> => {
      return new Promise((resolve) => {
        stop()

        const audio = new Audio(url)
        audio.crossOrigin = 'anonymous'
        audioRef.current = audio

        audio.addEventListener('canplay', () => {
          audio.currentTime = startAt
          audio.play().catch(() => {
            setIsPlaying(false)
            resolve()
          })
          setIsPlaying(true)

          stopTimerRef.current = setTimeout(() => {
            audio.pause()
            setIsPlaying(false)
            resolve()
          }, durationSeconds * 1000)
        }, { once: true })

        audio.addEventListener('error', () => {
          setIsPlaying(false)
          resolve()
        }, { once: true })

        audio.load()
      })
    },
    [stop]
  )

  const cleanup = useCallback(() => {
    stop()
    audioRef.current = null
  }, [stop])

  return { play, stop, cleanup, isPlaying }
}
