interface Props {
  onLogin?: () => void
  isGoogleAuthenticated?: boolean
}

export function LandingPage({ onLogin, isGoogleAuthenticated = false }: Props) {
  return (
    <div className="h-screen flex flex-col px-4 py-3 md:px-8 relative overflow-hidden animate-fade-in">
      <header className="flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-spotify-green text-black flex items-center justify-center font-black text-lg">B</div>
          <span className="font-bold tracking-tight">Beat<span className="text-spotify-green">Blind</span></span>
        </div>
        <div className="flex items-center gap-5">
          <span className="eyebrow hidden sm:block">a game for your ears</span>
          {onLogin && <button onClick={onLogin} className="btn-secondary text-xs py-2 px-4">Log in with Google <span className="text-spotify-green">↗</span></button>}
        </div>
      </header>

      <main className="relative flex-1 min-h-0 max-w-7xl w-full mx-auto grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-6 py-3 lg:py-5">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">01 / listen closer</p>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-[-0.06em] leading-[0.9] mb-5">
            Name that song<br /><span className="text-gradient">before it plays.</span>
          </h1>
          <p className="text-base text-white/55 max-w-md leading-relaxed mb-6">
            Your playlists. Tiny previews. One sharp ear. Connect Spotify and see how quickly your muscle memory can find the beat.
          </p>
          <button onClick={onLogin} className="btn-primary text-base flex items-center gap-3 animate-pulse-green">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          {isGoogleAuthenticated ? 'Connect with Spotify' : 'Start with Google'}
          </button>
          <p className="mono text-[10px] text-white/25 mt-3 tracking-wide">SPOTIFY OAUTH / DEEZER PREVIEWS / NOTHING STORED</p>
        </div>

        <div className="relative max-w-lg w-full justify-self-end">
          <div className="absolute -inset-8 border border-spotify-green/10 rounded-full rotate-[-12deg]" />
          <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-[#161a17] p-5 shadow-2xl shadow-black/40">
            <div className="h-full rounded-2xl border border-white/10 p-5 flex flex-col justify-between bg-[linear-gradient(145deg,rgba(29,185,84,.18),rgba(255,255,255,.02)_45%,rgba(230,180,70,.12))]">
              <div className="flex justify-between items-start"><span className="eyebrow">the blind test</span><span className="mono text-xs text-white/40">0.1 / 15 sec</span></div>
              <div>
                <div className="flex items-end gap-1 h-32 mb-8">
                  {Array.from({ length: 34 }, (_, i) => <span key={i} className="flex-1 bg-spotify-green/70 rounded-full" style={{ height: `${18 + Math.abs(Math.sin(i * 0.8)) * 70}%` }} />)}
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4"><span className="text-2xl font-semibold">What do you hear?</span><span className="text-3xl text-spotify-green">↗</span></div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-7 glass rounded-lg px-4 py-3 rotate-[-4deg]"><p className="eyebrow text-yellow-300">fastest guess</p><p className="font-bold">0.1 seconds <span className="text-white/40 font-normal">/ 100 pts</span></p></div>
        </div>
      </main>

      <footer className="max-w-7xl w-full mx-auto border-t border-white/10 pt-5 flex flex-wrap gap-4 justify-between text-xs text-white/35">
        <span>BUILT FOR PEOPLE WHO KNOW THE INTRO</span><span>↑ 06 REVEAL STEPS &nbsp; / &nbsp; 50 TRACKS MAX</span>
      </footer>
    </div>
  )
}
