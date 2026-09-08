import { useEffect, useMemo, useState } from 'react'
import { getLeaderboard, saveLeaderboardEntry } from '../lib/storage'
import type { GameStats, RoundResult, GameMode, LeaderboardEntry } from '../types'

interface Props {
  stats: GameStats
  history: RoundResult[]
  playlistName: string
  mode: GameMode
  teamScores?: Record<'A' | 'B', number>
  userName?: string
  onPlayAgain: () => void
  onChangePlaylist: () => void
}

export function ResultsScreen({ stats, history, playlistName, mode, teamScores, userName = 'Player', onPlayAgain, onChangePlaylist }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [shareState, setShareState] = useState('')
  const accuracy = stats.songsPlayed > 0 ? Math.round((stats.correct / stats.songsPlayed) * 100) : 0

  useEffect(() => {
    setLeaderboard(getLeaderboard())
  }, [])

  const grade =
    accuracy >= 90 ? { label: 'Legendary', emoji: '🏆', color: 'text-yellow-400', glow: 'shadow-yellow-400/20' } :
    accuracy >= 70 ? { label: 'Expert', emoji: '🎯', color: 'text-spotify-green', glow: 'shadow-spotify-green/20' } :
    accuracy >= 50 ? { label: 'Good Ear', emoji: '👂', color: 'text-blue-400', glow: 'shadow-blue-400/20' } :
    accuracy >= 30 ? { label: 'Learning', emoji: '📚', color: 'text-orange-400', glow: 'shadow-orange-400/20' } :
    { label: 'Keep Trying', emoji: '💪', color: 'text-red-400', glow: 'shadow-red-400/20' }

  const shareText = useMemo(
    () => `${userName} scored ${stats.score} on BeatBlind in ${mode === 'singleplayer' ? 'singleplayer' : 'teams'} mode for “${playlistName}”.`,
    [mode, playlistName, stats.score, userName]
  )

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'BeatBlind score', text: shareText })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
      }
      setShareState('Shared successfully!')
    } catch {
      setShareState('Sharing wasn’t available, but your score is ready to copy.')
    }
  }

  function handleSaveScore() {
    const nextBoard = saveLeaderboardEntry({
      name: userName,
      score: stats.score,
      playlist: playlistName,
      mode,
      date: new Date().toISOString(),
    })
    setLeaderboard(nextBoard)
    setShareState('Saved to leaderboard.')
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 md:px-12 py-4 relative overflow-hidden animate-fade-in">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-spotify-green/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl w-full space-y-3">
        <div className="text-center">
          <p className="eyebrow mb-2">{mode === 'singleplayer' ? '03 / final score' : '03 / team battle'}</p>
          <div className={`text-5xl mb-2 drop-shadow-2xl ${grade.glow}`}>{grade.emoji}</div>
          <h2 className="text-4xl font-bold tracking-tight mb-1">Game Over</h2>
          <p className={`text-xl font-bold ${grade.color}`}>{grade.label}</p>
          <p className="text-white/30 text-sm mt-1">{playlistName}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <div className="rounded-2xl p-4 text-center relative overflow-hidden"
              style={{ background: 'rgba(29,185,84,0.08)', border: '1px solid rgba(29,185,84,0.2)', backdropFilter: 'blur(20px)' }}>
              <div className="text-5xl font-bold tracking-tight text-spotify-green">{stats.score}</div>
              <div className="text-white/40 text-sm uppercase tracking-widest mt-1">{mode === 'singleplayer' ? 'Total Score' : 'Combined Points'}</div>
            </div>

            {mode === 'teams' && teamScores && (
              <div className="grid grid-cols-2 gap-3">
                {(['A', 'B'] as const).map((teamKey) => (
                  <div key={teamKey} className="rounded-xl p-3 text-center border border-white/10 bg-white/[0.03]">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{teamKey === 'A' ? 'Team A' : 'Team B'}</div>
                    <div className="mt-2 text-3xl font-black text-white">{teamScores[teamKey]}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: `${accuracy}%`, label: 'Accuracy', color: 'text-white' },
                { value: `🔥 ${stats.bestStreak}`, label: 'Best Streak', color: 'text-white' },
                { value: stats.correct, label: 'Correct', color: 'text-green-400' },
                { value: stats.wrong, label: 'Wrong', color: 'text-red-400' },
              ].map(({ value, label, color }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className={`text-2xl font-black ${color}`}>{value}</div>
                  <div className="text-xs text-white/30 mt-1 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Leaderboard</p>
                <button type="button" onClick={handleSaveScore} className="text-[10px] uppercase tracking-wide text-spotify-green">Save score</button>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {leaderboard.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-white/35">No scores yet. Be the first.</p>
                ) : leaderboard.map((entry, index) => (
                  <div key={`${entry.name}-${entry.date}-${index}`} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/3 last:border-0">
                    <span className="text-xs text-white/35 font-bold w-5">#{index + 1}</span>
                    <span className="flex-1 truncate text-sm text-white/75">{entry.name}</span>
                    <span className="text-sm font-bold text-spotify-green">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="button" onClick={handleShare} className="btn-secondary w-full text-base">
              Share score
            </button>
            {shareState && <p className="text-xs text-white/45 text-center">{shareState}</p>}
          </div>
        </div>

        {history.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Round History</p>
            </div>
            <div className="max-h-28 overflow-y-auto">
              {history.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/3 last:border-0">
                  <span className={`text-sm font-bold ${r.guessedCorrectly ? 'text-green-400' : 'text-red-400'}`}>
                    {r.guessedCorrectly ? '✓' : '✗'}
                  </span>
                  <span className="flex-1 truncate text-sm text-white/70">{r.track.name}</span>
                  <span className="text-xs text-white/25">{r.revealStep}s</span>
                  <span className={`text-sm font-bold min-w-8 text-right ${r.pointsEarned > 0 ? 'text-spotify-green' : 'text-white/20'}`}>
                    +{r.pointsEarned}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={onPlayAgain} className="btn-primary text-base w-full">Play Again</button>
          <button onClick={onChangePlaylist} className="btn-secondary text-base w-full">Choose Another Playlist</button>
        </div>
      </div>
    </div>
  )
}
