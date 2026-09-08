export default async function handler(req: any, res: any) {
  const path = Array.isArray(req.query.path)
    ? req.query.path.join('/')
    : req.query.path

  if (!path) {
    return res.status(400).send('Missing path')
  }

  try {
    const response = await fetch(`https://open.spotify.com/embed/${path}`)

    if (!response.ok) {
      return res.status(response.status).send('Spotify embed request failed')
    }

    const html = await response.text()

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(html)
  } catch (error) {
    console.error('Spotify embed error:', error)
    return res.status(500).send('Internal server error')
  }
}
