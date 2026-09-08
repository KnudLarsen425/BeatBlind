const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI as string
const SCOPES = 'playlist-read-private playlist-read-collaborative user-read-email user-read-private'

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => chars[b % chars.length]).join('')
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  return crypto.subtle.digest('SHA-256', encoder.encode(plain))
}

function base64urlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function initiateLogin(): Promise<void> {
  const verifier = generateRandomString(64)
  const challenge = base64urlEncode(await sha256(verifier))
  const state = generateRandomString(16)

  localStorage.setItem('pkce_verifier', verifier)
  localStorage.setItem('pkce_state', state)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function handleCallback(code: string, state: string): Promise<string> {
  const storedState = localStorage.getItem('pkce_state')
  const verifier = localStorage.getItem('pkce_verifier')

  if (state !== storedState || !verifier) throw new Error('State mismatch or missing verifier')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
  })

  if (!res.ok) throw new Error('Token exchange failed')

  const data = await res.json()
  const expiresAt = Date.now() + data.expires_in * 1000

  localStorage.setItem('spotify_access_token', data.access_token)
  localStorage.setItem('spotify_refresh_token', data.refresh_token)
  localStorage.setItem('spotify_expires_at', String(expiresAt))

  localStorage.removeItem('pkce_verifier')
  localStorage.removeItem('pkce_state')

  return data.access_token
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('spotify_refresh_token')
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  })

  if (!res.ok) throw new Error('Token refresh failed')

  const data = await res.json()
  const expiresAt = Date.now() + data.expires_in * 1000

  localStorage.setItem('spotify_access_token', data.access_token)
  localStorage.setItem('spotify_expires_at', String(expiresAt))
  if (data.refresh_token) localStorage.setItem('spotify_refresh_token', data.refresh_token)

  return data.access_token
}

export async function getValidToken(): Promise<string | null> {
  const token = localStorage.getItem('spotify_access_token')
  const expiresAt = Number(localStorage.getItem('spotify_expires_at'))

  if (!token) return null

  if (Date.now() > expiresAt - 60_000) {
    try {
      return await refreshAccessToken()
    } catch {
      logout()
      return null
    }
  }

  return token
}

export function logout(): void {
  localStorage.removeItem('spotify_access_token')
  localStorage.removeItem('spotify_refresh_token')
  localStorage.removeItem('spotify_expires_at')
  localStorage.removeItem('pkce_verifier')
  localStorage.removeItem('pkce_state')
}
