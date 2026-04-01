// pages/api/admin/artists/upsert.js
// POST — upsert artist record (AddArtist)
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, image_url, bio, video_url } = req.body;
  if (!name || !image_url || !bio) return res.status(400).json({ error: 'name, image_url, bio required' });
  const { error } = await supabaseAdmin
    .from('artists')
    .upsert([{ name, image_url, bio, video_url }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ok: true });
}