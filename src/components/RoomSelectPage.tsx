interface Props {
  userName: string
  onCreateRoom: () => void
  onJoinRoom: () => void
}

export function RoomSelectPage({ userName, onCreateRoom, onJoinRoom }: Props) {
  return (
    <div className="h-screen flex items-center justify-center px-6 py-8 bg-[#050b10]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-spotify-green text-black font-black mb-4 text-lg">B</div>
          <h1 className="text-4xl font-bold tracking-tight">Beat<span className="text-spotify-green">Blind</span></h1>
          <p className="eyebrow text-white/40 mt-3">Welcome, {userName}</p>
        </div>

        <button
          onClick={onCreateRoom}
          className="w-full rounded-2xl border border-spotify-green/30 bg-spotify-green/10 hover:bg-spotify-green/20 p-6 text-center transition-all group"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-spotify-green/80 group-hover:text-spotify-green mb-2">Start a game</p>
          <p className="text-xl font-bold text-white">Create Room</p>
          <p className="text-xs text-white/50 mt-2">Host a multiplayer game and invite friends</p>
        </button>

        <button
          onClick={onJoinRoom}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-6 text-center transition-all group"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 mb-2">Join a game</p>
          <p className="text-xl font-bold text-white">Join Room</p>
          <p className="text-xs text-white/50 mt-2">Enter a room code and play with others</p>
        </button>
      </div>
    </div>
  )
}
