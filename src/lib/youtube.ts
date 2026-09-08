const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string

export async function getYouTubeVideoId(
  trackName: string,
  artistName: string
): Promise<string | null> {
  const query = encodeURIComponent(`${trackName} ${artistName}`)
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${API_KEY}`

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return data.items?.[0]?.id?.videoId ?? null
  } catch {
    return null
  }
}
