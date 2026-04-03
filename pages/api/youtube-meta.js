// pages/api/youtube-meta.js
// Server-side YouTube page scraper — no API key needed.
// Extracts JSON-LD structured data + og: meta tags from the YouTube page.

export default async function handler(req, res) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  let html;
  try {
    const r = await fetch(url, {
      headers: {
        // Pretend to be a real browser — YouTube serves richer markup to known UAs
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    html = await r.text();
  } catch (e) {
    return res.status(502).json({ error: 'Could not fetch YouTube page', detail: e.message });
  }

  // ── 1. JSON-LD structured data ────────────────────────────────
  // YouTube embeds a VideoObject schema — the richest source of metadata
  let jsonLd = null;
  try {
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (match) jsonLd = JSON.parse(match[1]);
  } catch (_) {}

  // ── 2. og: / twitter: meta tags ──────────────────────────────
  const meta = (prop) => {
    const m =
      html.match(new RegExp(`<meta property="${prop}" content="([^"]+)"`)) ||
      html.match(new RegExp(`<meta name="${prop}" content="([^"]+)"`));
    return m ? decodeHtmlEntities(m[1]) : null;
  };

  // ── 3. ytInitialData micro-extraction ────────────────────────
  // We pull ONLY the tiny bits we need — not the whole 3 MB blob
  const ytKeyword = (key) => {
    const m = html.match(new RegExp(`"${key}":"([^"]+)"`));
    return m ? decodeHtmlEntities(m[1]) : null;
  };

  // Duration: ISO 8601 from JSON-LD (PT3M45S)
  const isoDuration = jsonLd?.duration || null;
  const duration    = isoDuration ? parseDuration(isoDuration) : null;

  // Upload date
  const uploadDate =
    jsonLd?.uploadDate ||
    jsonLd?.datePublished ||
    meta('datePublished') ||
    null;

  // View count (from JSON-LD interaction statistic)
  const viewCount =
    jsonLd?.interactionStatistic?.interactionCount ||
    jsonLd?.interactionCount ||
    null;

  // Full description (JSON-LD has the full one, og:description is truncated)
  const description =
    (jsonLd?.description || meta('og:description') || '').slice(0, 500);

  // Keywords / tags
  const keywordsRaw = meta('keywords') || ytKeyword('keywords') || '';
  const tags = keywordsRaw
    ? keywordsRaw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 12)
    : [];

  // Thumbnail — try maxresdefault first, fall back to hqdefault
  const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  // Channel / artist info
  const channelName =
    jsonLd?.author?.name ||
    jsonLd?.author ||
    ytKeyword('ownerChannelName') ||
    meta('og:video:director') ||
    null;

  // Full title (og:title is the cleanest — no extra channel suffix)
  const fullTitle = meta('og:title') || jsonLd?.name || null;

  // Music-specific meta (only present on music videos)
  const musicSong    = meta('music:song')          || null;
  const musicArtist  = meta('music:musician')      || null;
  const musicAlbum   = meta('music:album')         || null;

  // Genre (JSON-LD)
  const genre = jsonLd?.genre || null;

  // Paid / family-friendly flags for context
  const familyFriendly = jsonLd?.isFamilyFriendly ?? null;

  return res.status(200).json({
    videoId,
    title:         fullTitle,
    channelName,
    description,
    thumbnail,
    duration,          // { seconds: 225, formatted: '3:45' }
    uploadDate,        // '2024-03-15'
    viewCount,         // '12345678'
    tags,
    genre,
    musicSong,         // null unless YouTube knows it's a music video
    musicArtist,
    musicAlbum,
    familyFriendly,
  });
}

// ── Helpers ───────────────────────────────────────────────────

function parseDuration(iso) {
  // PT1H3M45S → { seconds: 3825, formatted: '1:03:45' }
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] || 0);
  const min = parseInt(m[2] || 0);
  const s = parseInt(m[3] || 0);
  const total = h * 3600 + min * 60 + s;
  const parts = h > 0
    ? [h, String(min).padStart(2, '0'), String(s).padStart(2, '0')]
    : [min, String(s).padStart(2, '0')];
  return { seconds: total, formatted: parts.join(':') };
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/\\u0026/g, '&')
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>');
}