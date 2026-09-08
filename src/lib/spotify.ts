import { getValidToken } from './auth'
import type { SpotifyPlaylist, SpotifyTrack } from '../types'

interface PlaylistItem {
  is_local: boolean
  item?: SpotifyTrack | null
  track?: SpotifyTrack | null
}

interface TracksPage {
  items?: PlaylistItem[]
  tracks?: { items?: PlaylistItem[] }
  next: string | null
}

function extractTrack(item: PlaylistItem | SpotifyTrack): SpotifyTrack | null {
  const candidate = (item as PlaylistItem).item ?? (item as PlaylistItem).track ?? item as SpotifyTrack
  return candidate?.id ? candidate : null
}

async function apiFetch<T>(path: string): Promise<T> {
  const token = await getValidToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized')
    const body = await res.text().catch(() => '')
    throw new Error(`Spotify API error: ${res.status} ${body}`)
  }

  return res.json()
}

export async function getUserPlaylists(): Promise<SpotifyPlaylist[]> {
  const playlists: SpotifyPlaylist[] = []
  let url = '/me/playlists?limit=50'

  while (url) {
    const data = await apiFetch<{ items: SpotifyPlaylist[]; next: string | null }>(url)
    playlists.push(...data.items.filter((p) => p && p.name))
    url = data.next ? data.next.replace('https://api.spotify.com/v1', '') : ''
  }

  return playlists
}

export async function getFriendPlaylists(userId: string): Promise<SpotifyPlaylist[]> {
  const playlists: SpotifyPlaylist[] = []
  let url = `/users/${encodeURIComponent(userId)}/playlists?limit=50`

  while (url) {
    const data = await apiFetch<{ items: SpotifyPlaylist[]; next: string | null }>(url)
    playlists.push(...data.items.filter((p) => p && p.name && p.public !== false))
    url = data.next ? data.next.replace('https://api.spotify.com/v1', '') : ''
  }

  return playlists
}

export async function getPublicPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  return apiFetch<SpotifyPlaylist>(`/playlists/${encodeURIComponent(playlistId)}`)
}

export async function getPlaylistTracksViaEmbed(playlistId: string): Promise<SpotifyTrack[]> {
  const res = await fetch(`/api/spotify-embed/playlist/${encodeURIComponent(playlistId)}`)
  if (!res.ok) throw new Error(`Embed fetch failed: ${res.status}`)
  const html = await res.text()
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s)
  if (!match) throw new Error('Could not find __NEXT_DATA__ in embed page')
  const data = JSON.parse(match[1])
  const items: any[] =
    data?.props?.pageProps?.state?.data?.entity?.trackList ??
    data?.props?.pageProps?.state?.data?.entity?.items ??
    []
  return items
    .filter((item: any) => item?.title && item?.subtitle)
    .map((item: any, i: number) => ({
      id: item.uri?.split(':').pop() ?? item.uid ?? String(i),
      name: item.title,
      artists: item.subtitle.split(/,\s*|\u00a0/).map((n: string) => ({ name: n.trim() })),
      album: { name: '', images: [] },
      preview_url: item.audioPreview?.url ?? null,
      duration_ms: item.duration ?? 0,
      uri: item.uri ?? '',
    }))
}

export async function getTrackAlbumArt(trackId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/spotify-embed/track/${encodeURIComponent(trackId)}`)
    if (!res.ok) return null
    const html = await res.text()
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s)
    if (!match) return null
    const data = JSON.parse(match[1])
    const images = data?.props?.pageProps?.state?.data?.entity?.visualIdentity?.image
    return images?.find((img: any) => img.maxWidth >= 300)?.url ?? images?.[0]?.url ?? null
  } catch {
    return null
  }
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = []
  let market = ''
  try {
    const profile = await apiFetch<{ country?: string }>('/me')
    if (profile.country) market = `&market=${encodeURIComponent(profile.country)}`
  } catch {
    // Older tokens may not have user-read-private until the user signs in again.
  }

  let url = `/playlists/${encodeURIComponent(playlistId)}/items?limit=50${market}`

  while (url) {
    const page = await apiFetch<TracksPage>(url)
    const items = page.items ?? page.tracks?.items ?? []
    for (const item of items) {
      const track = extractTrack(item)
      if (track && !(item as PlaylistItem).is_local) {
        tracks.push(track)
      }
    }
    url = page.next ? page.next.replace('https://api.spotify.com/v1', '') : ''
  }

  if (tracks.length === 0) {
    let legacyUrl = `/playlists/${encodeURIComponent(playlistId)}/tracks?limit=50${market}`
    while (legacyUrl) {
      const legacy = await apiFetch<TracksPage>(legacyUrl)
      const items = legacy.items ?? legacy.tracks?.items ?? []
      for (const item of items) {
        const track = extractTrack(item)
        if (track && !(item as PlaylistItem).is_local) tracks.push(track)
      }
      legacyUrl = legacy.next ? legacy.next.replace('https://api.spotify.com/v1', '') : ''
    }
  }

  return tracks
}

export async function getCurrentUser(): Promise<{ display_name: string; email: string; images: { url: string }[] }> {
  return apiFetch('/me')
}

