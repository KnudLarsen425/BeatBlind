# BeatBlind 🎵

A Songspot-style music guessing game using your own Spotify playlists.

## How it works

1. Connect your Spotify account
2. Pick one of your playlists
3. Listen to a tiny clip (starts at 0.1 seconds!)
4. Guess the song — the faster you guess, the more points you earn
5. Reveal progressively longer clips if you're stuck

**Scoring:** 0.1s = 100pts · 0.5s = 80pts · 2s = 60pts · 5s = 40pts · 10s = 20pts · 15s = 10pts

> Uses Spotify's official 30-second preview URLs. No music is downloaded or stored.

---

## Setup

### 1. Create a Google sign-in client

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project and configure the OAuth consent screen
3. Create a **Web application** OAuth client under Credentials
4. Add your local and deployed origins to **Authorized JavaScript origins**
5. Copy the client ID into `VITE_GOOGLE_CLIENT_ID`

### 2. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Fill in:
   - App name: `BeatBlind` (or anything)
   - Redirect URI: `http://localhost:5173/callback`
   - Check **Web API**
4. Copy your **Client ID**

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id_here
```

> ⚠️ Never put your Client Secret in the frontend. This app uses PKCE — no secret needed.

### 4. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Spotify Web API (OAuth 2.0 PKCE)
- Web Audio API (for precise clip timing)

## Notes on Spotify previews

Spotify provides 30-second `preview_url` clips on most (but not all) tracks. Tracks without previews are automatically filtered out. If a playlist has fewer than 2 playable tracks, you'll be prompted to choose a different one.

---

## Included features

- Daily challenge playlist selector
- Streak tracking with score bonuses
- Guess confidence meter with multiplier-based rewards
- Playlist filtering by category
- Local leaderboard using browser storage
- Share and copy-score actions
- Party-room code support for local game sessions
- Keyboard-friendly controls and aria labels for accessibility

---

## Deployment checklist

This app is configured as a static Vite SPA.

### Production build

```bash
npm install
npm run build
```

### Deploy to Vercel

1. Import the repository into Vercel
2. Set the environment variables from `.env.example`
3. Use the default Vite settings
4. Deploy

The included `vercel.json` ensures client-side routes fall back to `index.html`.

### Deploy to Netlify or similar host

- Publish the `dist/` folder from the build output
- Ensure SPA fallback is enabled for all routes
- Add the same environment variables in the hosting dashboard

> For a production app, make sure your Google OAuth origins include your deployed domain and your Spotify redirect URI matches your production URL.

---

## Local development

```bash
npm run dev
```

Open http://localhost:5173
