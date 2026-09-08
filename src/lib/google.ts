export interface GoogleUser {
  username: string
  name: string
  email: string
  picture: string
  sub: string
}

const STORAGE_KEY = 'beatblind_google_user'
const GOOGLE_SCRIPT_ID = 'google-identity-services'

interface GoogleCredentialResponse {
  credential: string
}

interface GoogleAccountsId {
  initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void
  renderButton: (element: HTMLElement, options: { theme: string; size: string; text: string; shape: string; width: number }) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

function decodeCredential(credential: string): Omit<GoogleUser, 'username'> {
  const payload = credential.split('.')[1]
  const json = decodeURIComponent(atob(payload.replace(/-/g, '+').replace(/_/g, '/')).split('').map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`).join(''))
  const data = JSON.parse(json) as { sub: string; name?: string; email?: string; picture?: string }
  return {
    sub: data.sub,
    name: data.name ?? '',
    email: data.email ?? '',
    picture: data.picture ?? '',
  }
}

export function getGoogleUser(): GoogleUser | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as GoogleUser
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveGoogleUser(user: GoogleUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function logoutGoogle(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function loadGoogleIdentity(clientId: string, onCredential: (user: Omit<GoogleUser, 'username'>) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const initialize = () => {
      if (!window.google) return reject(new Error('Google Identity Services unavailable'))
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(decodeCredential(response.credential)),
      })
      resolve()
    }

    if (window.google) {
      initialize()
      return
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', initialize, { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load Google Identity Services')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initialize
    script.onerror = () => reject(new Error('Could not load Google Identity Services'))
    document.head.appendChild(script)
  })
}

export function renderGoogleButton(element: HTMLElement, options?: { width?: number }): void {
  window.google?.accounts.id.renderButton(element, {
    theme: 'filled_black',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    width: options?.width ?? 360,
  })
}
