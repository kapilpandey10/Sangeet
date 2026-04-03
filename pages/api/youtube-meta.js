// pages/api/youtube-meta.js
// Strategy:
//   1. oEmbed  → always works for public videos (title, channel, thumb)
//   2. noembed → fallback oEmbed if YouTube oEmbed fails
//   3. Page scrape → bonus metadata (description, duration, views, tags, etc.)
//      Wrapped in try/catch — if blocked we still return oEmbed data cleanly.

export default async function handler(req, res) {
  let { videoId } = req.query;

  // ── Support full URLs passed directly to the API ──────────────────────────
  // e.g. /api/youtube-meta?videoId=https://youtu.be/abc123?list=XYZ
  if (videoId && videoId.length > 11) {
    videoId = extractVideoId(videoId);
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid video ID' });
  }

  // ── Step 1: oEmbed (primary — never fails for public videos) ──────────────
  let oEmbed = null;
  try {
    oEmbed = await fetchOEmbed(videoId);
  } catch (_) {}

  // ── Step 2: noembed fallback if YouTube oEmbed failed ─────────────────────
  if (!oEmbed) {
    try {
      oEmbed = await fetchNoEmbed(videoId);
    } catch (_) {}
  }

  // If both oEmbed sources fail → video is private, deleted, or invalid
  if (!oEmbed || !oEmbed.title) {
    return res.status(404).json({
      error: 'Video not found. It may be private, deleted, or the ID is wrong.',
    });
  }

  // ── Step 3: Page scrape for bonus metadata (silently fails if blocked) ─────
  let extras = {};
  try {
    extras = await scrapeYoutubePage(videoId);
  } catch (_) {
    // Blocked by YouTube — that's fine, we still return oEmbed data
  }

  // ── Build final response ───────────────────────────────────────────────────
  return res.status(200).json({
    videoId,
    title:       oEmbed.title,
    channelName: oEmbed.author_name || extras.channelName || null,
    thumbnail:   `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    thumbnailFallback: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,

    // Return FULL description — let the client truncate for display
    description: extras.description || null,

    // Extras from page scrape (null if scraping was blocked)
    duration:    extras.duration    || null,
    uploadDate:  extras.uploadDate  || null,
    viewCount:   extras.viewCount   || null,
    tags:        extras.tags        || [],
    genre:       extras.genre       || null,
    musicSong:   extras.musicSong   || null,
    musicArtist: extras.musicArtist || null,
    musicAlbum:  extras.musicAlbum  || null,
  });
}

// ─── Extract video ID from any YouTube URL ────────────────────────────────────
function extractVideoId(input) {
  if (!input) return null;
  const trimmed = input.trim();

  // Already a bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];

      const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch (_) {}

  // Regex fallback
  const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// ─── oEmbed via YouTube ───────────────────────────────────────────────────────
async function fetchOEmbed(videoId) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot/1.0)' },
  });
  if (!res.ok) throw new Error(`oEmbed HTTP ${res.status}`);
  return res.json();
}

// ─── oEmbed via noembed.com (fallback) ───────────────────────────────────────
async function fetchNoEmbed(videoId) {
  const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`noembed HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ─── Page scraper for bonus metadata ─────────────────────────────────────────
async function scrapeYoutubePage(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
  ];

  let html = null;
  for (const agent of agents) {
    try {
      const r = await fetch(url, {
        headers: {
          'User-Agent':      agent,
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
        },
      });
      if (!r.ok) continue;
      const text = await r.text();
      if (text.includes('ytInitialData') || text.includes('application/ld+json')) {
        html = text;
        break;
      }
    } catch (_) {
      continue;
    }
  }

  if (!html) throw new Error('All scrape attempts failed');

  // ── Extract JSON-LD ────────────────────────────────────────────
  let jsonLd = null;
  try {
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (match) jsonLd = JSON.parse(match[1]);
  } catch (_) {}

  // ── Meta tag extractor ─────────────────────────────────────────
  const meta = (prop) => {
    const m =
      html.match(new RegExp(`<meta\\s+property="${prop}"\\s+content="([^"]+)"`)) ||
      html.match(new RegExp(`<meta\\s+name="${prop}"\\s+content="([^"]+)"`)) ||
      html.match(new RegExp(`<meta\\s+content="([^"]+)"\\s+property="${prop}"`));
    return m ? decode(m[1]) : null;
  };

  // ── ytInitialData micro-extraction ────────────────────────────
  const ytVal = (key) => {
    const m = html.match(new RegExp(`"${key}":\\s*"([^"]+)"`));
    return m ? decode(m[1]) : null;
  };

  // ── Duration ──────────────────────────────────────────────────
  const isoDuration = jsonLd?.duration || null;
  const duration    = isoDuration ? parseDuration(isoDuration) : null;

  // ── Description — return FULL text, no truncation ─────────────
  const rawDesc =
    jsonLd?.description ||
    meta('og:description') ||
    ytVal('shortDescription') ||
    '';
  // Decode escape sequences but don't slice — let the client handle display
  const description = rawDesc.trim();

  // ── Upload date ────────────────────────────────────────────────
  const uploadDate =
    jsonLd?.uploadDate ||
    jsonLd?.datePublished ||
    null;

  // ── View count ────────────────────────────────────────────────
  const viewCount =
    jsonLd?.interactionStatistic?.interactionCount ||
    jsonLd?.interactionCount ||
    null;

  // ── Tags ──────────────────────────────────────────────────────
  const keywordsRaw = meta('keywords') || '';
  const tags = keywordsRaw
    ? keywordsRaw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 12)
    : [];

  // ── Channel / Genre / Music meta ──────────────────────────────
  const channelName =
    jsonLd?.author?.name ||
    (typeof jsonLd?.author === 'string' ? jsonLd.author : null) ||
    ytVal('ownerChannelName') ||
    null;

  const genre       = jsonLd?.genre            || null;
  const musicSong   = meta('music:song')       || null;
  const musicArtist = meta('music:musician')   || null;
  const musicAlbum  = meta('music:album')      || null;

  return {
    description,
    duration,
    uploadDate,
    viewCount,
    tags,
    genre,
    channelName,
    musicSong,
    musicArtist,
    musicAlbum,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h   = parseInt(m[1] || 0);
  const min = parseInt(m[2] || 0);
  const s   = parseInt(m[3] || 0);
  const total = h * 3600 + min * 60 + s;
  const parts = h > 0
    ? [h, String(min).padStart(2, '0'), String(s).padStart(2, '0')]
    : [min, String(s).padStart(2, '0')];
  return { seconds: total, formatted: parts.join(':') };
}

function decode(str) {
  return str
    .replace(/&amp;/g,  '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/\\u0026/g,'&')
    .replace(/\\u003c/g,'<')
    .replace(/\\u003e/g,'>')
    .replace(/\\n/g,    '\n');
}