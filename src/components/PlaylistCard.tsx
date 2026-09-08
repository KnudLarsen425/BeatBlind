import type { SpotifyPlaylist } from '../types'

interface Props {
  playlist: SpotifyPlaylist
  onSelect: (playlist: SpotifyPlaylist) => void
  selected: boolean
}

export function PlaylistCard({ playlist, onSelect, selected }: Props) {
  const image = playlist.images?.[0]?.url
  const trackCount = (playlist.items ?? playlist.tracks)?.total ?? 0

  return (
    <button
      onClick={() => onSelect(playlist)}
      className={`w-full text-left flex items-center gap-4 p-3 rounded-lg transition-all duration-200 border ${
        selected
          ? 'border-spotify-green/60 bg-spotify-green/10 shadow-lg shadow-spotify-green/10'
          : 'border-white/5 bg-white/3 hover:bg-white/6 hover:border-white/10'
      }`}
      style={{ background: selected ? 'rgba(29,185,84,0.08)' : 'rgba(255,255,255,0.03)' }}
    >
      {image ? (
        <img src={image} alt={playlist.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-md" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xl flex-shrink-0">🎵</div>
      )}

      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate text-sm">{playlist.name}</p>
        <p className="text-xs text-white/40 mt-0.5">{trackCount} tracks · {playlist.owner?.display_name}</p>
      </div>

      {selected && (
        <div className="w-5 h-5 rounded-md bg-spotify-green flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-black"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
      )}
    </button>
  )
}
