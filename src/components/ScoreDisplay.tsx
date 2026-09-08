import type { GameStats } from '../types'

interface Props {
  stats: GameStats
  remainingSongs: number
}

export function ScoreDisplay({ stats, remainingSongs }: Props) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 rounded-lg glass border border-spotify-green/20 text-center min-w-16">
          <div className="text-xl font-black text-spotify-green">{stats.score}</div>
          <div className="text-xs text-white/40 uppercase tracking-wider">Score</div>
        </div>
        <div className="px-4 py-2 rounded-lg glass border border-white/5 text-center min-w-16">
          <div className="text-xl font-black">{stats.streak > 0 ? `🔥${stats.streak}` : stats.streak}</div>
          <div className="text-xs text-white/40 uppercase tracking-wider">Streak</div>
        </div>
        <div className="px-4 py-2 rounded-lg glass border border-white/5 text-center min-w-14">
          <div className="text-xl font-black text-green-400">{stats.correct}</div>
          <div className="text-xs text-white/40 uppercase tracking-wider">✓</div>
        </div>
        <div className="px-4 py-2 rounded-lg glass border border-white/5 text-center min-w-14">
          <div className="text-xl font-black text-red-400">{stats.wrong}</div>
          <div className="text-xs text-white/40 uppercase tracking-wider">✗</div>
        </div>
      </div>
      <div className="text-xs text-white/30 glass px-3 py-1.5 rounded-full border border-white/5">
        {remainingSongs} left
      </div>
    </div>
  )
}
