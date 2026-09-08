function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9æøå]/g, ' ').replace(/\s+/g, ' ').trim()
}

function score(item: any, trackName: string, artistName: string): number {
  const title = normalize(item.title)
  const artist = normalize(item.artist?.name ?? '')
  const t = normalize(trackName)
  const a = normalize(artistName)

  let s = 0
  if (title === t) s += 3
  else if (title.includes(t) || t.includes(title)) s += 1

  if (artist === a) s += 3
  else if (artist.includes(a) || a.includes(artist)) s += 1

  return s
}

export async function getDeezerPreview(
  trackName: string,
  artistName: string
): Promise<string | null> {
  const query = encodeURIComponent(`${trackName} ${artistName}`)
  try {
    const res = await fetch(`/deezer/search?q=${query}&limit=10`)
    if (!res.ok) return null
    const data = await res.json()
    if (!data.data?.length) return null

    const best = data.data
      .map((item: any) => ({ item, score: score(item, trackName, artistName) }))
      .sort((a: any, b: any) => b.score - a.score)[0]

    return best?.item?.preview ?? null
  } catch {
    return null
  }
}
