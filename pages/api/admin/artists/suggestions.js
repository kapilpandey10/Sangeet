// pages/api/admin/artists/suggestions.js
// GET — unique artist names from lyrics who don't yet have a bio (AddArtist)
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const [lyricsRes, bioRes] = await Promise.all([
    supabaseAdmin.from('lyrics').select('artist').not('artist', 'is', null),
    supabaseAdmin.from('artists').select('name').not('bio', 'is', null),
  ]);
  if (lyricsRes.error) return res.status(500).json({ error: lyricsRes.error.message });
  if (bioRes.error)    return res.status(500).json({ error: bioRes.error.message });

  const allArtists = [...new Set(
    lyricsRes.data.flatMap(l => l.artist.split(',').map(a => a.trim()))
  )];
  const withBio = new Set(bioRes.data.map(a => a.name));
  const filtered = allArtists.filter(a => !withBio.has(a));
  res.status(200).json(filtered);
}