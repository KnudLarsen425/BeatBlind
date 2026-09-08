import { useEffect, useRef, useState } from 'react'
import { loadGoogleIdentity, renderGoogleButton, saveGoogleUser } from '../lib/google'
import type { GoogleUser } from '../lib/google'

interface Props {
  onAuthenticated: (user: GoogleUser) => void
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

export function GoogleLoginPage({ onAuthenticated }: Props) {
  const [username, setUsername] = useState('')
  const [googleProfile, setGoogleProfile] = useState<Omit<GoogleUser, 'username'> | null>(null)
  const [error, setError] = useState('')
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Add VITE_GOOGLE_CLIENT_ID to your .env file, then restart the dev server.')
      return
    }

    loadGoogleIdentity(GOOGLE_CLIENT_ID, setGoogleProfile)
      .then(() => {
        if (buttonRef.current) {
          buttonRef.current.replaceChildren()
          renderGoogleButton(buttonRef.current)
        }
      })
      .catch(() => setError('Google sign-in could not load. Check your connection and try again.'))
  }, [])

  function handleUsernameSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (username.trim().length < 2) {
      setError('Choose a username with at least 2 characters.')
      return
    }
    if (!googleProfile) return
    setError('')
    const user: GoogleUser = { ...googleProfile, username: username.trim() }
    saveGoogleUser(user)
    onAuthenticated(user)
  }

  return (
    <div className="h-screen flex items-center justify-center px-6 md:px-12 relative overflow-hidden animate-fade-in">
      <div className="absolute top-[-12rem] left-1/2 -translate-x-1/2 w-[38rem] h-[38rem] rounded-full bg-spotify-green/10 blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-lg -mt-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-spotify-green text-black flex items-center justify-center font-black text-lg">B</div>
          <span className="font-bold tracking-tight">Beat<span className="text-spotify-green">Blind</span></span>
        </div>

        <div className="glass rounded-2xl p-5 sm:p-7 border border-white/10 shadow-2xl shadow-black/30">
          <p className="eyebrow mb-3">welcome to the room</p>
          <h1 className="text-4xl font-bold tracking-tight leading-none mb-3">Make your<br /><span className="text-gradient">entrance.</span></h1>
          <p className="text-white/45 text-sm leading-relaxed mb-5">Sign in securely with Google, choose your player name, then connect Spotify to bring your playlists into the game.</p>

          {!googleProfile ? (
            <div className="space-y-3">
              <p className="eyebrow text-white/40">First, verify who you are</p>
              <div ref={buttonRef} className="flex justify-center min-h-10" />
            </div>
          ) : (
            <form onSubmit={handleUsernameSubmit} className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-spotify-green/10 border border-spotify-green/20 mb-5">
                {googleProfile.picture && <img src={googleProfile.picture} alt="" className="w-9 h-9 rounded-full" />}
                <div className="min-w-0"><p className="text-sm font-semibold truncate">{googleProfile.name}</p><p className="text-xs text-white/40 truncate">{googleProfile.email}</p></div>
                <span className="ml-auto text-spotify-green">✓</span>
              </div>
              <label htmlFor="username" className="eyebrow block">Now choose your username</label>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 focus-within:border-spotify-green/60 transition-colors">
                <span className="text-spotify-green font-bold">@</span>
                <input
                  id="username"
                  value={username}
                  onChange={(event) => { setUsername(event.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)); setError('') }}
                  placeholder="name_you_know"
                  autoComplete="username"
                  className="w-full bg-transparent py-3 text-white placeholder-white/20 focus:outline-none"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary w-full mt-2">Enter BeatBlind <span className="opacity-60">→</span></button>
            </form>
          )}

          {error && <p className="text-red-400 text-xs mt-4">{error}</p>}
        </div>
        <p className="mono text-[10px] text-white/25 text-center mt-5 tracking-wide">YOUR PROFILE STAYS YOURS / NO PASSWORD TO REMEMBER</p>
      </div>
    </div>
  )
}
