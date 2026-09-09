import { useMemo, useState } from 'react'

interface Props {
  roomCode: string
  members: string[]
  userName: string
  onAddPlayer: (name: string) => void
  onContinue: () => void
  onBack: () => void
  onCopyInvite: () => void
}

export function RoomLobbyPage({ roomCode, members, userName, onAddPlayer, onContinue, onBack, onCopyInvite }: Props) {
  const [draftName, setDraftName] = useState('')

  const memberList = useMemo(() => {
    const base = members.length > 0 ? members : [userName || 'Host']
    return Array.from(new Set(base.map((name) => name.trim()).filter(Boolean)))
  }, [members, userName])

  const handleAddPlayer = () => {
    const name = draftName.trim()
    if (!name) return
    onAddPlayer(name)
    setDraftName('')
  }

  return (
    <div className="h-screen flex items-center justify-center px-6 py-8 bg-[#050b10]">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-spotify-green text-black flex items-center justify-center font-black">B</div>
            <div>
              <p className="eyebrow text-white/40">Room lobby</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Beat<span className="text-spotify-green">Blind</span></h1>
            </div>
          </div>

          <button onClick={onBack} className="text-xs text-white/40 hover:text-white transition-colors glass px-3 py-2 rounded-lg border border-white/5">
            Back
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-spotify-green/20 bg-spotify-green/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-spotify-green/80">Room code</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="text-3xl md:text-4xl font-black tracking-[0.25em] text-white">{roomCode || '—'}</div>
                <button onClick={onCopyInvite} className="btn-secondary text-xs px-3 py-2">Copy invite</button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Players</p>
                <span className="text-xs text-white/60">{memberList.length} in room</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {memberList.map((player) => (
                  <div key={player} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/80">
                    <span className="w-2 h-2 rounded-full bg-spotify-green" />
                    {player}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Add a player</p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Name"
                className="w-full glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none border border-white/5 focus:border-spotify-green/40 transition-colors"
              />
              <button onClick={handleAddPlayer} className="btn-primary text-xs px-3 py-2.5">Add</button>
            </div>

            <div className="mt-6 space-y-2">
              <button onClick={onContinue} className="btn-primary w-full">Continue to playlists</button>
              <button onClick={onBack} className="w-full text-xs text-white/40 hover:text-white transition-colors py-2">
                Back to menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
