import { useState, useRef, useEffect } from 'react'
import type { SpotifyTrack } from '../types'

interface Props {
  tracks: SpotifyTrack[]
  onGuess: (trackId: string) => void
  disabled: boolean
}

export function GuessInput({ tracks, onGuess, disabled }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = query.length > 0
    ? tracks.filter((t) =>
        `${t.name} ${t.artists.map((a) => a.name).join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : []

  useEffect(() => {
    setHighlighted(0)
  }, [query])

  function select(track: SpotifyTrack) {
    setQuery('')
    setOpen(false)
    onGuess(track.id)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlighted]) select(filtered[highlighted])
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => query && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Search for a song…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-spotify-green/50 focus:bg-spotify-green/[0.06] transition-all disabled:opacity-40"
          />

          {open && filtered.length > 0 && (
            <ul
              ref={listRef}
              className="absolute z-50 w-full bottom-full mb-2 bg-[#0f0f1a] border border-white/10 rounded-xl overflow-y-auto shadow-2xl shadow-black/50 overscroll-contain"
              style={{ maxHeight: 'min(50vh, 24rem)' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {filtered.map((track, i) => (
                <li key={track.id}>
                  <button
                    type="button"
                    onMouseDown={() => select(track)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      i === highlighted ? 'bg-spotify-green/15' : 'hover:bg-white/5'
                    }`}
                  >
                    {track.album.images?.[0]?.url ? (
                      <img
                        src={track.album.images[0].url}
                        alt=""
                        className="w-9 h-9 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded bg-white/10 flex items-center justify-center flex-shrink-0 text-base">🎵</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm">{track.name}</p>
                      <p className="text-xs text-spotify-light truncate">
                        {track.artists.map((a) => a.name).join(', ')}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
