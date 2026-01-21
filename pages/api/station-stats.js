// File: pages/api/station-stats.js
export default async function handler(req, res) {
  const { url, slug } = req.query;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // 1. Logic for Centova Cast / FastCast4u (like hitsfm912)
    if (url.includes('fastcast4u.com') || slug) {
      const stationSlug = slug || url.split('/proxy/')[1]?.split('?')[0];
      const apiUrl = `https://usa15.fastcast4u.com/rpc/${stationSlug}/streaminfo.get`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data?.data?.[0]) {
        const info = data.data[0];
        return res.status(200).json({
          nowPlaying: info.track?.text || 'Live Stream',
          nextPlaying: info.nexttrack?.text || 'Coming up next...',
          listeners: info.listeners || 0,
          provider: 'Centova Cast'
        });
      }
    }

    // 2. Fallback for generic Icecast/Shoutcast Now-Playing only
    // This uses your existing metadata bridge logic
    const metaRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/metadata?url=${encodeURIComponent(url)}`);
    const metaData = await metaRes.json();
    
    res.status(200).json({
      nowPlaying: metaData.title || 'Live Broadcast',
      nextPlaying: 'Check schedule for more info',
      listeners: 'N/A',
      provider: 'Standard Stream'
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch details' });
  }
}