// pages/api/admin/artists/musicurl.js
// GET ?artist=name — fetch one music_url for a given artist (AddArtist autofill)
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { artist } = req.query;
  if (!artist) return res.status(400).json({ error: 'artist required' });
  const { data, error } = await supabaseAdmin
    .from('lyrics')
    .select('music_url')
    .eq('artist', artist)
    .limit(1)
    .single();
  if (error) return res.status(200).json({ music_url: '' }); // not found is fine
  res.status(200).json({ music_url: data?.music_url || '' });
}