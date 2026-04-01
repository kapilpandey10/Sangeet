// pages/api/admin/lyrics/all.js
// GET — fetch approved + private lyrics for ManageLyrics
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { data, error } = await supabaseAdmin
    .from('lyrics')
    .select('*')
    .in('status', ['approved', 'private'])
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}