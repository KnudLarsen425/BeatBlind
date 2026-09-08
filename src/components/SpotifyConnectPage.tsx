import { initiateLogin } from '../lib/auth'

interface Props {
  userName: string
}

export function SpotifyConnectPage({ userName }: Props) {
  return (
    <div className="h-screen flex items-center justify-center px-6 md:px-12 relative overflow-hidden animate-fade-in">
      <div className="absolute top-[-12rem] left-1/2 -translate-x-1/2 w-[38rem] h-[38rem] rounded-full bg-spotify-green/10 blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-xl text-center -mt-6">
        <div className="flex items-center justify-center gap-3 mb-6">
           <div className="w-9 h-9 rounded-lg bg-spotify-green text-black flex items-center justify-center font-black text-lg">B</div>
           <span className="font-bold tracking-tight">Beat<span className="text-spotify-green">Blind</span></span>
        </div>

        <div className="glass rounded-2xl p-5 sm:p-7 border border-white/10 shadow-2xl shadow-black/30">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-[#1ed760] flex items-center justify-center shadow-xl shadow-green-500/20">
            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-black"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
          </div>
          <p className="eyebrow mb-4">profile ready, @{userName}</p>
          <h1 className="text-4xl font-bold tracking-tight leading-none mb-4">Bring your<br /><span className="text-gradient">sound in.</span></h1>
          <p className="text-white/45 text-sm leading-relaxed max-w-sm mx-auto mb-5">Connect Spotify to choose a playlist and start guessing songs from your own library.</p>
          <button onClick={() => initiateLogin()} className="btn-primary w-full text-base">Connect with Spotify <span className="opacity-60">→</span></button>
          <p className="mono text-[10px] text-white/25 mt-5 tracking-wide">READ-ONLY PLAYLIST ACCESS / NO PASSWORD SHARED</p>
        </div>
      </div>
    </div>
  )
}
