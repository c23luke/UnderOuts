// Vercel serverless proxy for The Odds API.
// Keeps your API key secret: the browser calls /api/odds, this reads the key
// from the ODDS_API_KEY environment variable (set in Vercel → Settings → Environment Variables).
export default async function handler(req, res) {
  const key = process.env.ODDS_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'ODDS_API_KEY environment variable is not set in Vercel.' });
    return;
  }
  const base = 'https://api.the-odds-api.com/v4/sports/baseball_mlb';
  const eventId = req.query.eventId;
  const url = eventId
    ? `${base}/events/${encodeURIComponent(eventId)}/odds?apiKey=${key}&regions=us&markets=pitcher_outs&oddsFormat=american`
    : `${base}/events?apiKey=${key}`;
  try {
    const r = await fetch(url);
    const body = await r.text();
    const rem = r.headers.get('x-requests-remaining');
    if (rem) res.setHeader('x-requests-remaining', rem);
    res.setHeader('Access-Control-Expose-Headers', 'x-requests-remaining');
    res.setHeader('content-type', 'application/json');
    res.status(r.status).send(body);
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
}
