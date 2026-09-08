export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q, limit = '10' } = req.query

  if (!q) {
    return res.status(400).json({ error: 'Missing query' })
  }

  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`
    const response = await fetch(url)

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Deezer request failed',
      })
    }

    const data = await response.json()

    return res.status(200).json(data)
  } catch (error) {
    console.error('Deezer API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
