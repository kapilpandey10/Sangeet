// File: pages/api/metadata.js
import icy from 'icy';
import { supabase } from '../../supabaseClient';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) return res.status(400).json({ error: 'Station slug is required' });

  try {
    // 1. Fetch the stream URL from your Supabase 'radio' table
    const { data: station, error } = await supabase
      .from('radio')
      .select('stream_url')
      .eq('slug', slug)
      .single();

    if (error || !station) return res.status(404).json({ error: 'Station not found' });

    const url = station.stream_url;

    // 2. Specialized Check for FastCast4u / Centova Cast
    if (url.includes('fastcast4u.com')) {
      try {
        const stationId = url.split('/proxy/')[1]?.split('?')[0];
        const statsUrl = `https://usa15.fastcast4u.com/rpc/${stationId}/streaminfo.get`;
        
        const statsRes = await fetch(statsUrl, { signal: AbortSignal.timeout(3000) });
        const statsData = await statsRes.json();

        if (statsData?.data?.[0]) {
          const info = statsData.data[0];
          // Check if the source is connected (online)
          const isOffline = info.source !== 'yes' && !info.track?.text;
          
          return res.status(200).json({
            now: info.track?.text || 'Live Broadcast',
            next: info.nexttrack?.text || 'Stay tuned!',
            listeners: info.listeners || 0,
            isOffline: isOffline
          });
        }
      } catch (e) {
        // If API fails, proceed to ICY check as fallback
      }
    }

    // 3. Generic ICY Check with Offline Detection
    let metadataSent = false;
    const request = icy.get(url, (response) => {
      // If we get a 200 OK, the server is at least responding
      response.on('metadata', (metadata) => {
        const parsed = icy.parse(metadata);
        metadataSent = true;
        res.status(200).json({
          now: parsed.StreamTitle || 'Live Stream',
          isOffline: false
        });
        response.destroy();
      });

      // Give the stream 3 seconds to send metadata
      setTimeout(() => {
        if (!metadataSent && !res.writableEnded) {
          res.status(200).json({ now: 'Live Stream', isOffline: false });
          response.destroy();
        }
      }, 3000);
    });

    request.on('error', () => {
      if (!res.writableEnded) {
        res.status(200).json({ now: 'Offline', isOffline: true });
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}