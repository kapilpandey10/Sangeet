// pages/api/admin/lyrics/autocomplete.js
// GET ?q=searchterm — artist name suggestions for AddLyrics
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { q } = req.query;
  if (!q || q.length < 2) return res.status(200).json([]);
  const { data, error } = await supabaseAdmin
    .from('lyrics')
    .select('artist')
    .ilike('artist', `%${q}%`)
    .limit(5);
  if (error) return res.status(500).json({ error: error.message });
  const unique = [...new Set(data.map(l => l.artist))];
  res.status(200).json(unique);
}