import { useState, useEffect, useRef } from 'react'
import { useGame } from '../hooks/useGame'
import { AudioPlayer } from './AudioPlayer'
import { GuessInput } from './GuessInput'
import { ScoreDisplay } from './ScoreDisplay'
import type { SpotifyTrack, SpotifyPlaylist, GameStats, RoundResult, GameMode, ConfidenceLevel } from '../types'

interface Props {
  tracks: SpotifyTrack[]
  playlist: SpotifyPlaylist
  mode: GameMode
  onFinish: (stats: GameStats, history: RoundResult[], teamScores?: Record<'A' | 'B', number>) => void
  onChangePlaylist: () => void
}

const CONFIDENCE_OPTIONS: { label: string; value: ConfidenceLevel }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

export function GameScreen({ tracks, playlist, mode, onFinish, onChangePlaylist }: Props) {
  const game = useGame(tracks, mode)
  const [feedbackClass, setFeedbackClass] = useState('')
  const [wrongFlash, setWrongFlash] = useState(false)
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium')
  const startedRef = useRef(false)

  useEffect(() => {
    if (!startedRef.current) { startedRef.current = true; game.startGame() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (game.isGameOver) onFinish(game.stats, game.history, game.teamScores)
  }, [game.isGameOver]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!game.lastGuessWrong) return
    setWrongFlash(true)
    const t = setTimeout(() => { setWrongFlash(false); game.clearWrongFlag() }, 800)
    return () => clearTimeout(t)
  }, [game.lastGuessWrong])

  useEffect(() => {
    if (!game.roundResult) return
    setFeedbackClass(game.roundResult.guessedCorrectly ? 'animate-bounce-in' : 'animate-shake')
    const t = setTimeout(() => setFeedbackClass(''), 600)
    return () => clearTimeout(t)
  }, [game.roundResult])

  if (!game.isStarted || !game.currentTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const track = game.currentTrack
  const result = game.roundResult

  return (
    <div className="h-screen flex flex-col relative overflow-hidden animate-fade-in">
      {/* Ambient glow from album art color */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-spotify-green/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative flex-shrink-0 flex items-center justify-between px-6 md:px-12 py-3 border-b border-white/10 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-spotify-green text-black flex items-center justify-center font-black">B</div><span className="font-bold">Beat<span className="text-spotify-green">Blind</span></span></div>
        <div className="flex items-center gap-2">
          <span className="mono text-[10px] text-white/40 glass px-3 py-1.5 rounded-lg border border-white/5 truncate max-w-32">{mode === 'singleplayer' ? 'Singleplayer' : `${game.activeTeamLabel} turn`}</span>
          <span className="mono text-[10px] text-white/40 glass px-3 py-1.5 rounded-lg border border-white/5 truncate max-w-32">{playlist.name}</span>
          <button onClick={onChangePlaylist} className="text-xs text-white/40 hover:text-white transition-colors glass px-3 py-1.5 rounded-lg border border-white/5">
            Change
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 max-w-2xl mx-auto w-full px-6 md:px-12 py-3 lg:py-4 flex flex-col gap-3 overflow-hidden">
        <ScoreDisplay stats={game.stats} remainingSongs={game.remainingSongs} />

        {mode === 'teams' && (
          <div className="grid grid-cols-2 gap-3">
            {(['A', 'B'] as const).map((teamKey) => (
              <div key={teamKey} className={`rounded-xl p-3 border ${teamKey === game.activeTeam ? 'border-spotify-green/40 bg-spotify-green/10' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{teamKey === 'A' ? 'Team A' : 'Team B'}</div>
                <div className="mt-1 text-2xl font-black text-white">{game.teamScores[teamKey]}</div>
              </div>
            ))}
          </div>
        )}

        <div className={`relative rounded-xl ${feedbackClass}`}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>

          {result && (
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              result.guessedCorrectly ? 'bg-green-500/5' : 'bg-red-500/5'
            }`} />
          )}

          <div className="p-4 space-y-3">
            <div className="flex justify-center">
              {result ? (
                <div className="relative animate-bounce-in">
                  {track.album.images?.[0]?.url ? (
                    <img
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      className="w-28 h-28 rounded-xl object-cover shadow-2xl"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-white/5 flex items-center justify-center text-5xl">🎵</div>
                  )}
                  <div className={`absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center text-lg font-black shadow-lg ${
                    result.guessedCorrectly ? 'bg-green-500 shadow-green-500/40' : 'bg-red-500 shadow-red-500/40'
                  }`}>
                    {result.guessedCorrectly ? '✓' : '✗'}
                  </div>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="absolute inset-3 rounded-lg border border-spotify-green/20 animate-pulse-ring" />
                  <div className="absolute left-0 right-0 h-px bg-spotify-green/80 shadow-[0_0_14px_3px_rgba(29,185,84,0.5)] animate-scan-line" />
                  <div className="text-center">
                    <div className="text-4xl mb-3 opacity-40">?</div>
                    <p className="eyebrow text-white/35">Unknown track</p>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="text-center animate-slide-up">
                <p className="font-bold text-xl">{track.name}</p>
                <p className="text-white/50 text-sm mt-1">{track.artists.map((a) => a.name).join(', ')}</p>
                <p className="text-white/30 text-xs mt-0.5">{track.album.name}</p>
                {result.guessedCorrectly ? (
                  <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-spotify-green/15 border border-spotify-green/30">
                    <span className="text-spotify-green font-bold">+{result.pointsEarned} points!</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                    <span className="text-red-400 font-semibold text-sm">Better luck next time</span>
                  </div>
                )}
              </div>
            )}

            <AudioPlayer
              previewUrl={track.preview_url!}
              currentStep={game.currentStep}
              currentStepIndex={game.currentStepIndex}
              onRevealMore={game.revealMore}
              canRevealMore={game.canRevealMore}
              roundDone={!!result}
            />

            {!result && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1 pt-1">
                  <span className="eyebrow text-yellow-300/80">Lock in your guess</span>
                  <span className="mono text-[10px] text-white/25">{game.currentStep}s heard</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Confidence</span>
                    <span className="text-xs text-spotify-green font-semibold capitalize">{confidence}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {CONFIDENCE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={confidence === option.value}
                        onClick={() => setConfidence(option.value)}
                        className={`px-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          confidence === option.value
                            ? 'bg-spotify-green text-black border-spotify-green'
                            : 'bg-white/[0.02] text-white/70 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {wrongFlash && (
                  <div className="flex items-center justify-center gap-2 text-red-400 font-bold animate-shake py-1">
                    <span>✗</span><span className="text-sm">Wrong! Listen again…</span>
                  </div>
                )}
                <GuessInput tracks={tracks} onGuess={(id) => game.submitGuess(id, confidence)} disabled={!!result} />
                <button onClick={game.skipRound} className="w-full text-xs text-white/25 hover:text-white/50 transition-colors py-2">
                  Skip this song
                </button>
              </div>
            )}

            {result && (
              <button onClick={game.nextSong} className="btn-primary w-full animate-slide-up">
                {game.remainingSongs > 0 ? 'Next Song →' : 'See Results →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
