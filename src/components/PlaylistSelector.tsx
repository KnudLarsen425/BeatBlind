import { useState, useEffect, useMemo } from 'react'
import { getUserPlaylists, getPlaylistTracks, getPlaylistTracksViaEmbed, getTrackAlbumArt, getPublicPlaylist } from '../lib/spotify'
import { getDeezerPreview } from '../lib/deezer'
import { getDailyChallengePlaylist, getPlaylistCategory } from '../lib/storage'
import { PlaylistCard } from './PlaylistCard'
import type { SpotifyPlaylist, SpotifyTrack, GameMode, PlaylistCategory } from '../types'

interface Props {
  onStart: (tracks: SpotifyTrack[], playlist: SpotifyPlaylist, mode: GameMode) => void
  onLogout: () => void
  userName: string
  roomCode?: string
  onCreateRoom?: () => void
}

const CATEGORIES: PlaylistCategory[] = ['All', 'Chill', 'Party', 'Throwback', 'Workout', 'Focus', 'Night Drive']

export function PlaylistSelector({ onStart, onLogout, userName, roomCode = '', onCreateRoom }: Props) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [selected, setSelected] = useState<SpotifyPlaylist | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const [urlPreview, setUrlPreview] = useState<SpotifyPlaylist | null>(null)
  const [urlPreviewLoading, setUrlPreviewLoading] = useState(false)
  const [urlPreviewError, setUrlPreviewError] = useState('')
  const [mode, setMode] = useState<GameMode>('singleplayer')
  const [selectedCategory, setSelectedCategory] = useState<PlaylistCategory>('All')

  useEffect(() => {
    getUserPlaylists()
      .then(setPlaylists)
      .catch(() => setError('Failed to load playlists'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => search.length > 0
      ? playlists.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
      : [],
    [playlists, search]
  )

  const dropdownOptions = useMemo(() => {
    const items = urlPreview ? [urlPreview] : []
    return [...items, ...filtered.filter((p) => p.id !== urlPreview?.id)]
  }, [filtered, urlPreview])

  const visiblePlaylists = useMemo(() => {
    const query = search.trim().toLowerCase()
    return playlists.filter((playlist) => {
      const matchesCategory = selectedCategory === 'All' || getPlaylistCategory(playlist.name) === selectedCategory
      const matchesQuery = !query || playlist.name.toLowerCase().includes(query)
      return matchesCategory && matchesQuery
    })
  }, [playlists, search, selectedCategory])

  const dailyChallenge = useMemo(() => getDailyChallengePlaylist(playlists), [playlists])

  function extractSpotifyPlaylistId(value: string): string | null {
    const input = value.trim()
    const match = input.match(/open\.spotify\.com\/playlist\/([^/?#]+)/i)
    if (match) return decodeURIComponent(match[1])

    const uri = input.match(/^spotify:playlist:([^:?/]+)/i)
    if (uri) return uri[1]

    return null
  }

  useEffect(() => {
    const trimmed = search.trim()
    const playlistId = extractSpotifyPlaylistId(trimmed)
    if (!playlistId) {
      setUrlPreview(null)
      setUrlPreviewError('')
      setUrlPreviewLoading(false)
      return
    }

    const timeout = window.setTimeout(async () => {
      try {
        setUrlPreviewLoading(true)
        setUrlPreviewError('')
        const playlist = await getPublicPlaylist(playlistId)
        setPlaylists((prev) => {
          if (prev.some((item) => item.id === playlist.id)) return prev
          return [...prev, playlist]
        })
        setUrlPreview(playlist)
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : ''
        setUrlPreviewError(
          message.includes('403') || message.includes('404')
            ? 'That Spotify playlist link could not be opened.'
            : 'Could not load this playlist link.'
        )
        setUrlPreview(null)
      } finally {
        setUrlPreviewLoading(false)
      }
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setHighlighted(0)
  }, [search])

  function handleSelectPlaylist(playlist: SpotifyPlaylist) {
    setSelected(playlist)
    setSearch('')
    setOpen(false)
    setUrlPreview(null)
    void handleStart(playlist)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || dropdownOptions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, dropdownOptions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selectedOption = dropdownOptions[highlighted]
      if (selectedOption) handleSelectPlaylist(selectedOption)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  async function handleStart(playlistArg?: SpotifyPlaylist) {
    const pl = playlistArg ?? selected
    if (!pl) return
    setLoadingTracks(true)
    setError('')
    setLoadingProgress('Loading tracks…')
    try {
      const rawTracks = await getPlaylistTracks(pl.id).catch(async (e) => {
        if (e.message.includes('403')) return getPlaylistTracksViaEmbed(pl.id)
        throw e
      })
      if (rawTracks.length === 0) {
        setError('No tracks found in this playlist. Try another.')
        return
      }
      const tracksToSearch = rawTracks.slice(0, 50)
      setLoadingProgress(`Loading songs (0/${tracksToSearch.length})`)
      const enriched: SpotifyTrack[] = []
      for (let i = 0; i < tracksToSearch.length; i++) {
        const track = tracksToSearch[i]
        setLoadingProgress(`Loading songs (${i + 1}/${tracksToSearch.length})`)
        const preview = track.preview_url ?? await getDeezerPreview(track.name, track.artists[0]?.name ?? '')
        if (!preview) { if (i % 5 === 4) await new Promise((r) => setTimeout(r, 100)); continue }
        const albumArt = track.album.images[0]?.url ?? await getTrackAlbumArt(track.id)
        const finalTrack = albumArt && !track.album.images[0]
          ? { ...track, preview_url: preview, album: { ...track.album, images: [{ url: albumArt, width: 300, height: 300 }] } }
          : { ...track, preview_url: preview }
        enriched.push(finalTrack)
        if (i % 5 === 4) await new Promise((r) => setTimeout(r, 100))
      }
      if (enriched.length < 2) {
        setError(`Only ${enriched.length} track(s) had available previews. Try a different playlist.`)
        return
      }
      onStart(enriched, pl, mode)
    } catch (e) {
      console.error('handleStart error:', e)
      setError('Failed to load tracks. Please try again.')
    } finally {
      setLoadingTracks(false)
      setLoadingProgress('')
    }
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden animate-fade-in">
      <header className="relative flex-shrink-0 flex items-center justify-between px-6 md:px-12 py-3 border-b border-white/10 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-spotify-green text-black flex items-center justify-center font-black">B</div><span className="font-bold">Beat<span className="text-spotify-green">Blind</span></span></div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-sm">
            <div className="w-2 h-2 rounded-full bg-spotify-green" />
            <span className="text-white/70">{userName}</span>
          </div>
          <button onClick={onLogout} className="text-xs text-white/40 hover:text-white transition-colors">
            Log out
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 max-w-4xl mx-auto w-full px-6 md:px-12 py-3 lg:py-5 flex flex-col overflow-hidden">
        <div className="mb-3 flex items-end justify-between gap-5">
          <div><p className="eyebrow mb-1">02 / choose your arena</p><h2 className="text-3xl md:text-4xl font-bold tracking-tight">Pick a <span className="text-gradient">playlist.</span></h2></div>
          <p className="hidden sm:block text-right text-white/35 text-xs max-w-32">Up to 50 tracks<br />per game</p>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {(['singleplayer', 'teams'] as GameMode[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                mode === option
                  ? 'bg-spotify-green text-black border-spotify-green shadow-lg shadow-spotify-green/20'
                  : 'bg-white/[0.03] text-white/70 border-white/10 hover:border-white/20'
              }`}
            >
              {option === 'singleplayer' ? 'Singleplayer' : 'Teams'}
            </button>
          ))}
        </div>

        <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto] items-center">
          <div className="relative">
            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-white/30">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              aria-label="Search playlists or share a Spotify playlist URL"
              type="text"
              placeholder="Search playlists or paste a Spotify playlist URL…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
              onFocus={() => search && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={handleSearchKeyDown}
              className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none border border-white/5 focus:border-spotify-green/40 transition-colors"
            />

            {open && dropdownOptions.length > 0 && (
              <ul className="absolute z-50 w-full top-full mt-2 bg-gradient-to-b from-[#071018] to-[#0f1724] border border-spotify-green/10 rounded-2xl backdrop-blur-md shadow-2xl shadow-black/70 max-h-72 overflow-y-auto ring-1 ring-spotify-green/10">
                {dropdownOptions.map((playlist, index) => (
                  <li key={playlist.id}>
                    <button
                      type="button"
                      aria-label={`Select playlist ${playlist.name}`}
                      onMouseDown={() => handleSelectPlaylist(playlist)}
                      onMouseEnter={() => setHighlighted(index)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 ${index === highlighted ? 'bg-spotify-green/20' : 'hover:bg-white/6'}`}
                    >
                      {playlist.images?.[0]?.url ? (
                        <img src={playlist.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-base flex-shrink-0">🎵</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm">{playlist.name}</p>
                        <p className="text-xs text-white/45 truncate">
                          {(playlist.tracks?.total ?? playlist.items?.total ?? 0)} tracks · {playlist.owner?.display_name}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={onCreateRoom}
            className="btn-secondary text-xs px-4 py-2.5 min-w-[120px]"
            aria-label="Create party room code"
          >
            {roomCode ? `Room ${roomCode}` : 'Create room'}
          </button>
        </div>

        {dailyChallenge && (
          <div className="mb-3 rounded-xl border border-spotify-green/20 bg-spotify-green/10 p-3 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-spotify-green/80">Daily challenge</p>
              <p className="text-sm font-semibold text-white">{dailyChallenge.name}</p>
            </div>
            <button type="button" onClick={() => handleSelectPlaylist(dailyChallenge)} className="btn-primary text-xs px-3 py-2">
              Play challenge
            </button>
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2.5 py-1.5 rounded-full text-xs border transition-all ${
                selectedCategory === category
                  ? 'bg-white text-black border-white'
                  : 'bg-white/[0.03] text-white/70 border-white/10 hover:border-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {urlPreviewLoading && (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/60 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
            Looking up playlist…
          </div>
        )}

        {urlPreviewError && (
          <p className="text-red-400 text-xs mb-3 px-1">{urlPreviewError}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error && visiblePlaylists.length === 0 ? (
          <p className="text-red-400 text-center py-10">{error}</p>
        ) : (
          <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
            {visiblePlaylists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} onSelect={setSelected} selected={selected?.id === p.id} />
            ))}
            {visiblePlaylists.length === 0 && !loading && (
              <p className="text-white/30 text-center py-10 text-sm">No playlists found</p>
            )}
          </div>
        )}

        {error && visiblePlaylists.length > 0 && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}

        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            onClick={() => void handleStart()}
            disabled={!selected || loadingTracks}
            className="btn-primary text-base min-w-52 flex items-center justify-center gap-2"
          >
            {loadingTracks ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                {loadingProgress || 'Loading…'}
              </>
            ) : (
              <>Start Game <span className="opacity-60">→</span></>
            )}
          </button>
          {loadingTracks && (
            <p className="text-xs text-white/25">This may take a moment for large playlists</p>
          )}
        </div>
      </div>
    </div>
  )
}
