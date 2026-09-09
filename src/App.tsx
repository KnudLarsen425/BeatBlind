import { useState, useEffect, useCallback } from 'react'
import { getValidToken, handleCallback, logout } from './lib/auth'
import { getCurrentUser } from './lib/spotify'
import { LandingPage } from './components/LandingPage'
import { PlaylistSelector } from './components/PlaylistSelector'
import { GameScreen } from './components/GameScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { GoogleLoginPage } from './components/GoogleLoginPage'
import { SpotifyConnectPage } from './components/SpotifyConnectPage'
import { getGoogleUser, logoutGoogle } from './lib/google'
import { getPartyRoomCode, setPartyRoomCode, getRoomCodeFromUrl, setRoomCodeInUrl, createPartyRoomCode, normalizeRoomCode, getRoomMembers, setRoomMembers } from './lib/storage'
import { RoomLobbyPage } from './components/RoomLobbyPage'
import type { GoogleUser } from './lib/google'
import type { GameScreen as GameScreenType, SpotifyTrack, SpotifyPlaylist, GameStats, RoundResult, GameMode } from './types'

export default function App() {
  const [screen, setScreen] = useState<GameScreenType>('landing')
  const [userName, setUserName] = useState('')
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null)
  const [mode, setMode] = useState<GameMode>('singleplayer')
  const [finalStats, setFinalStats] = useState<GameStats | null>(null)
  const [finalHistory, setFinalHistory] = useState<RoundResult[]>([])
  const [finalTeamScores, setFinalTeamScores] = useState<Record<'A' | 'B', number>>({ A: 0, B: 0 })
  const [authLoading, setAuthLoading] = useState(true)
  const [googleUser, setGoogleUser] = useState(() => getGoogleUser())
  const [showGoogleLogin, setShowGoogleLogin] = useState(false)
  const [partyRoomCode, setPartyRoomCodeState] = useState(() => getPartyRoomCode() || getRoomCodeFromUrl())
  const [roomMembers, setRoomMembersState] = useState<string[]>(() => getRoomMembers())

  const syncPartyRoomCode = useCallback((code: string) => {
    const next = normalizeRoomCode(code)
    setPartyRoomCodeState(next)
    setPartyRoomCode(next)
    setRoomCodeInUrl(next)
  }, [])

  const addRoomMember = useCallback((name: string) => {
    const clean = name.trim()
    if (!clean) return
    setRoomMembersState((prev) => {
      const next = Array.from(new Set([...prev, clean]))
      setRoomMembers(next)
      return next
    })
  }, [])

  const handleGoogleAuthenticated = useCallback((user: GoogleUser) => {
    setGoogleUser(user)
    setUserName(user.username)
    setScreen('landing')
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    logoutGoogle()
    setGoogleUser(null)
    setScreen('landing')
    setTracks([])
    setPlaylist(null)
    setMode('singleplayer')
    setFinalStats(null)
    setFinalHistory([])
    setFinalTeamScores({ A: 0, B: 0 })
    setPartyRoomCodeState('')
    setPartyRoomCode('')
    setRoomCodeInUrl('')
    setRoomMembersState([])
    setRoomMembers([])
  }, [])

  // Handle OAuth callback
  useEffect(() => {
    const roomCodeFromUrl = getRoomCodeFromUrl()
    if (roomCodeFromUrl) {
      syncPartyRoomCode(roomCodeFromUrl)
      const members = getRoomMembers()
      if (members.length === 0 && userName) setRoomMembersState([userName])
    }

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')

    if (error) {
      window.history.replaceState({}, '', window.location.pathname)
      setAuthLoading(false)
      return
    }

    if (code && state) {
      // Remove params immediately to prevent double-execution in StrictMode
      window.history.replaceState({}, '', window.location.pathname)
      handleCallback(code, state)
        .then(() => getCurrentUser())
        .then((user) => {
          console.log('logged in as:', user.email)
          setUserName(getGoogleUser()?.username ?? user.display_name)
          setScreen('playlists')
        })
        .catch((e) => {
          console.error('Auth error:', e)
        })
        .finally(() => setAuthLoading(false))
      return
    }

    // Check existing token
    getValidToken().then((token) => {
      if (token) {
        getCurrentUser()
          .then((user) => {
            setUserName(getGoogleUser()?.username ?? user.display_name)
            setScreen('playlists')
          })
          .catch(() => {})
          .finally(() => setAuthLoading(false))
      } else {
        setAuthLoading(false)
      }
    })
  }, [])

  const handleCreateRoom = useCallback(() => {
    const next = createPartyRoomCode() || 'ROOM'
    const hostName = userName || 'Host'
    syncPartyRoomCode(next)
    setRoomMembersState([hostName])
    setRoomMembers([hostName])
    setScreen('room')
  }, [syncPartyRoomCode, userName])

  const handleJoinRoom = useCallback((code: string) => {
    const next = normalizeRoomCode(code)
    if (!next) return
    const currentMembers = getRoomMembers()
    const guestName = userName || 'Player'
    const members = Array.from(new Set([...currentMembers, guestName]))
    syncPartyRoomCode(next)
    setRoomMembersState(members)
    setRoomMembers(members)
    setScreen('room')
  }, [syncPartyRoomCode, userName])

  const handleRoomCopyInvite = useCallback(() => {
    if (!partyRoomCode) return
    const invite = `${window.location.origin}${window.location.pathname}?room=${partyRoomCode}`
    void navigator.clipboard.writeText(invite)
  }, [partyRoomCode])

  const handleGameStart = useCallback((t: SpotifyTrack[], p: SpotifyPlaylist, gameMode: GameMode) => {
    setTracks(t)
    setPlaylist(p)
    setMode(gameMode)
    setScreen('game')
  }, [])

  const handleGameFinish = useCallback((stats: GameStats, history: RoundResult[], teamScores?: Record<'A' | 'B', number>) => {
    setFinalStats(stats)
    setFinalHistory(history)
    setFinalTeamScores(teamScores ?? { A: 0, B: 0 })
    setScreen('results')
  }, [])

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!googleUser && showGoogleLogin) return <GoogleLoginPage onAuthenticated={handleGoogleAuthenticated} />
  if (!googleUser) return <LandingPage onLogin={() => setShowGoogleLogin(true)} />

  if (screen === 'landing') return <SpotifyConnectPage userName={googleUser.username} />

  if (screen === 'room') {
    return (
      <RoomLobbyPage
        roomCode={partyRoomCode}
        members={roomMembers}
        userName={userName || 'Host'}
        onAddPlayer={addRoomMember}
        onContinue={() => setScreen('playlists')}
        onBack={() => setScreen('playlists')}
        onCopyInvite={handleRoomCopyInvite}
      />
    )
  }

  if (screen === 'playlists') {
    return (
      <PlaylistSelector
        userName={userName}
        onStart={handleGameStart}
        onLogout={handleLogout}
        roomCode={partyRoomCode}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    )
  }

  if (screen === 'game' && tracks.length > 0 && playlist) {
    return (
      <GameScreen
        tracks={tracks}
        playlist={playlist}
        mode={mode}
        roomCode={partyRoomCode}
        onFinish={(stats, history, teamScores) => handleGameFinish(stats, history, teamScores)}
        onChangePlaylist={() => setScreen('playlists')}
      />
    )
  }

  if (screen === 'results' && finalStats && playlist) {
    return (
      <ResultsScreen
        stats={finalStats}
        history={finalHistory}
        playlistName={playlist.name}
        mode={mode}
        teamScores={finalTeamScores}
        userName={userName}
        onPlayAgain={() => setScreen('game')}
        onChangePlaylist={() => setScreen('playlists')}
      />
    )
  }

  return <LandingPage />
}
