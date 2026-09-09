import { useState } from 'react'
import { normalizeRoomCode } from '../lib/storage'

interface Props {
  onJoinRoom: (code: string, playerName: string) => void
  onBack: () => void
  defaultPlayerName?: string
}

export function JoinRoomPage({ onJoinRoom, onBack, defaultPlayerName = '' }: Props) {
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState(defaultPlayerName)
  const [error, setError] = useState('')

  const handleJoin = () => {
    const code = normalizeRoomCode(roomCode)
    const name = playerName.trim()

    if (!code) {
      setError('Enter a valid room code.')
      return
    }
    if (!name) {
      setError('Enter your name.')
      return
    }

    setError('')
    onJoinRoom(code, name)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJoin()
  }

  return (
    <div className="h-screen flex items-center justify-center px-6 py-8 bg-[#050b10]">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-black/50">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-spotify-green text-black font-black mb-4">B</div>
          <h1 className="text-3xl font-bold tracking-tight">Beat<span className="text-spotify-green">Blind</span></h1>
          <p className="eyebrow text-white/40 mt-2">Join a multiplayer room</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="room-code" className="text-[10px] uppercase tracking-[0.2em] text-white/40">Room code</label>
            <input
              id="room-code"
              type="text"
              value={roomCode}
              onChange={(e) => { setRoomCode(e.target.value); setError('') }}
              onKeyPress={handleKeyPress}
              placeholder="e.g. ABC123"
              className="w-full mt-2 glass rounded-xl px-4 py-3 text-lg text-white placeholder-white/25 focus:outline-none border border-white/5 focus:border-spotify-green/40 transition-colors uppercase tracking-widest"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="player-name" className="text-[10px] uppercase tracking-[0.2em] text-white/40">Your name</label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => { setPlayerName(e.target.value); setError('') }}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name"
              className="w-full mt-2 glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none border border-white/5 focus:border-spotify-green/40 transition-colors"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <button onClick={handleJoin} className="btn-primary w-full mt-6">
            Join room
          </button>

          <button onClick={onBack} className="w-full text-xs text-white/40 hover:text-white transition-colors py-2">
            Back to menu
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-white/[0.02] border border-white/10 p-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Don't have a room code?</p>
          <p className="text-xs text-white/60">Ask someone in your party to create one and share the code with you.</p>
        </div>
      </div>
    </div>
  )
}
