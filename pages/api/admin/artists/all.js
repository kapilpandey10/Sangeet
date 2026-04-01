// pages/api/admin/artists/all.js
// GET — fetch all artists (ManageArtist)
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { data, error } = await supabaseAdmin
    .from('artists')
    .select('*')
    .order('name', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}