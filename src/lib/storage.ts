import type { LeaderboardEntry, SpotifyPlaylist } from '../types'

const LEADERBOARD_KEY = 'beatblind:leaderboard'
const ROOM_KEY = 'beatblind:party-room'

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
}

export function getRoomCodeFromUrl(): string {
  if (typeof window === 'undefined') return ''
  const room = new URLSearchParams(window.location.search).get('room') ?? ''
  return normalizeRoomCode(room)
}

export function setRoomCodeInUrl(code: string) {
  if (typeof window === 'undefined') return
  const clean = normalizeRoomCode(code)
  const url = new URL(window.location.href)
  if (clean) url.searchParams.set('room', clean)
  else url.searchParams.delete('room')
  window.history.replaceState({}, '', `${url.pathname}${url.search}`)
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore write failures in restricted/browser storage environments.
  }
}

export function getLeaderboard(): LeaderboardEntry[] {
  const entries = readJSON<LeaderboardEntry[]>(LEADERBOARD_KEY, [])
  return [...entries].sort((a, b) => b.score - a.score).slice(0, 8)
}

export function saveLeaderboardEntry(entry: LeaderboardEntry) {
  const entries = getLeaderboard()
  const next = [...entries, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
  writeJSON(LEADERBOARD_KEY, next)
  return next
}

export function getPartyRoomCode(): string {
  return readJSON<string>(ROOM_KEY, '')
}

export function setPartyRoomCode(code: string) {
  const clean = normalizeRoomCode(code)
  writeJSON(ROOM_KEY, clean)
}

export function createPartyRoomCode() {
  const code = normalizeRoomCode(Math.random().toString(36).slice(2, 8).toUpperCase())
  if (!code) return ''
  setPartyRoomCode(code)
  return code
}

export function getDailyChallengePlaylist(playlists: SpotifyPlaylist[]) {
  if (playlists.length === 0) return null
  const day = new Date().toISOString().slice(0, 10)
  const total = Array.from(day).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const index = total % playlists.length
  return playlists[index]
}

export function getPlaylistCategory(playlistName: string) {
  const normalized = playlistName.toLowerCase()
  if (normalized.includes('chill') || normalized.includes('lofi') || normalized.includes('ambient')) return 'Chill'
  if (normalized.includes('party') || normalized.includes('dance') || normalized.includes('night')) return 'Party'
  if (normalized.includes('throwback') || normalized.includes('classic') || normalized.includes('retro')) return 'Throwback'
  if (normalized.includes('workout') || normalized.includes('gym') || normalized.includes('run')) return 'Workout'
  if (normalized.includes('focus') || normalized.includes('study') || normalized.includes('deep')) return 'Focus'
  if (normalized.includes('night') || normalized.includes('drive') || normalized.includes('after')) return 'Night Drive'
  return 'All'
}
