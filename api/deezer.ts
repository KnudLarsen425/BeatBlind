export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { q } = req.query

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter' })
  }

  try {
    const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=10`)
    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Deezer API error:', error)
    return res.status(500).json({ error: 'Failed to fetch from Deezer' })
  }
}
