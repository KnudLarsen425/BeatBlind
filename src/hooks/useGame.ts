import { useState, useCallback } from 'react'
import type { SpotifyTrack, GameStats, RoundResult, RevealStep, GameMode, ConfidenceLevel } from '../types'
import { REVEAL_STEPS, STEP_POINTS, CONFIDENCE_MULTIPLIERS } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const INITIAL_STATS: GameStats = {
  score: 0,
  correct: 0,
  wrong: 0,
  streak: 0,
  bestStreak: 0,
  songsPlayed: 0,
}

const INITIAL_TEAM_SCORES = { A: 0, B: 0 } as const

type TeamKey = keyof typeof INITIAL_TEAM_SCORES

export function useGame(tracks: SpotifyTrack[], mode: GameMode = 'singleplayer') {
  const [queue, setQueue] = useState<SpotifyTrack[]>([])
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS)
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null)
  const [history, setHistory] = useState<RoundResult[]>([])
  const [isStarted, setIsStarted] = useState(false)
  const [lastGuessWrong, setLastGuessWrong] = useState(false)
  const [teamScores, setTeamScores] = useState<Record<TeamKey, number>>(INITIAL_TEAM_SCORES)
  const [activeTeam, setActiveTeam] = useState<TeamKey>('A')

  const currentStep: RevealStep = REVEAL_STEPS[currentStepIndex]
  const activeTeamLabel = activeTeam === 'A' ? 'Team A' : 'Team B'

  const startGame = useCallback(() => {
    const shuffled = shuffle(tracks)
    setQueue(shuffled.slice(1))
    setCurrentTrack(shuffled[0])
    setCurrentStepIndex(0)
    setStats(INITIAL_STATS)
    setRoundResult(null)
    setHistory([])
    setTeamScores(INITIAL_TEAM_SCORES)
    setActiveTeam('A')
    setIsStarted(true)
  }, [tracks])

  const revealMore = useCallback(() => {
    setCurrentStepIndex((i) => Math.min(i + 1, REVEAL_STEPS.length - 1))
  }, [])

  const switchTeam = useCallback(() => {
    if (mode !== 'teams') return
    setActiveTeam((current) => (current === 'A' ? 'B' : 'A'))
  }, [mode])

  const submitGuess = useCallback(
    (guessedTrackId: string, confidence: ConfidenceLevel = 'medium') => {
      if (!currentTrack || roundResult) return

      const correct = guessedTrackId === currentTrack.id
      const step = REVEAL_STEPS[currentStepIndex]

      if (!correct && currentStepIndex < REVEAL_STEPS.length - 1) {
        // Wrong guess — just reveal more, don't end the round
        setCurrentStepIndex((i) => i + 1)
        setLastGuessWrong(true)
        return
      }

      const confidenceMultiplier = CONFIDENCE_MULTIPLIERS[confidence]
      const points = correct ? Math.round(STEP_POINTS[step] * confidenceMultiplier) : 0
      const result: RoundResult = {
        track: currentTrack,
        guessedCorrectly: correct,
        pointsEarned: points,
        revealStep: step,
      }

      if (mode === 'teams' && correct) {
        setTeamScores((scores) => ({
          ...scores,
          [activeTeam]: scores[activeTeam] + points,
        }))
      }

      setRoundResult(result)
      setHistory((h) => [...h, result])
      setStats((s) => {
        const newStreak = correct ? s.streak + 1 : 0
        return {
          score: s.score + points,
          correct: s.correct + (correct ? 1 : 0),
          wrong: s.wrong + (correct ? 0 : 1),
          streak: newStreak,
          bestStreak: Math.max(s.bestStreak, newStreak),
          songsPlayed: s.songsPlayed + 1,
        }
      })

      if (mode === 'teams') switchTeam()
    },
    [currentTrack, currentStepIndex, roundResult, mode, activeTeam, switchTeam]
  )

  const skipRound = useCallback(() => {
    if (!currentTrack) return

    const result: RoundResult = {
      track: currentTrack,
      guessedCorrectly: false,
      pointsEarned: 0,
      revealStep: REVEAL_STEPS[currentStepIndex],
    }

    setRoundResult(result)
    setHistory((h) => [...h, result])
    setStats((s) => ({
      ...s,
      wrong: s.wrong + 1,
      streak: 0,
      songsPlayed: s.songsPlayed + 1,
    }))

    if (mode === 'teams') switchTeam()
  }, [currentTrack, currentStepIndex, mode, switchTeam])

  const nextSong = useCallback(() => {
    if (queue.length === 0) {
      setCurrentTrack(null)
      setRoundResult(null)
      return
    }
    const [next, ...rest] = queue
    setCurrentTrack(next)
    setQueue(rest)
    setCurrentStepIndex(0)
    setRoundResult(null)
  }, [queue])

  const isGameOver = isStarted && currentTrack === null

  return {
    currentTrack,
    currentStep,
    currentStepIndex,
    stats,
    roundResult,
    history,
    isStarted,
    isGameOver,
    remainingSongs: queue.length,
    startGame,
    revealMore,
    submitGuess,
    skipRound,
    nextSong,
    canRevealMore: currentStepIndex < REVEAL_STEPS.length - 1,
    lastGuessWrong,
    clearWrongFlag: () => setLastGuessWrong(false),
    mode,
    teamScores,
    activeTeam,
    activeTeamLabel,
  }
}
