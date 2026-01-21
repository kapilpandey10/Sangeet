import icy from 'icy';

export default async function handler(req, res) {
  const { streamUrl } = req.query;

  if (!streamUrl) {
    return res.status(400).json({ error: 'Stream URL is required' });
  }

  try {
    icy.get(streamUrl, (response) => {
      // Listen for the 'metadata' event
      response.on('metadata', (metadata) => {
        const parsed = icy.parse(metadata);
        res.status(200).json({
          info: parsed,
          // 'StreamTitle' usually contains 'Artist - Song'
          currentTrack: parsed.StreamTitle || 'Unknown'
        });
        response.destroy(); // Close the connection after getting metadata
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
}