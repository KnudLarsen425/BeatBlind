export interface SpotifyImage {
  url: string
  width: number | null
  height: number | null
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: SpotifyImage[]
  tracks: { total: number }
  items?: { total: number }
  owner: { display_name: string }
  public: boolean | null
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: SpotifyImage[]
  }
  preview_url: string | null
  duration_ms: number
  uri: string
  youtube_id?: string
}

export interface PlaylistTrackItem {
  track: SpotifyTrack | null
  item: SpotifyTrack | null
  is_local: boolean
}

export type GameScreen = 'landing' | 'roomSelect' | 'room' | 'joinRoom' | 'playlists' | 'game' | 'results'

export type GameMode = 'singleplayer' | 'teams'

export type RevealStep = 0.1 | 0.5 | 2 | 5 | 10 | 15

export type PlaylistCategory = 'All' | 'Chill' | 'Party' | 'Throwback' | 'Workout' | 'Focus' | 'Night Drive'

export const REVEAL_STEPS: RevealStep[] = [0.1, 0.5, 2, 5, 10, 15]

export const STEP_POINTS: Record<number, number> = {
  0.1: 100,
  0.5: 80,
  2: 60,
  5: 40,
  10: 20,
  15: 10,
}

export interface GameStats {
  score: number
  correct: number
  wrong: number
  streak: number
  bestStreak: number
  songsPlayed: number
}

export interface RoundResult {
  track: SpotifyTrack
  guessedCorrectly: boolean
  pointsEarned: number
  revealStep: RevealStep
}

export interface LeaderboardEntry {
  name: string
  score: number
  playlist: string
  mode: GameMode
  date: string
}
