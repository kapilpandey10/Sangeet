// ─────────────────────────────────────────────────────────────────────────────
// pages/api/admin/lyrics/pending.js
// GET — fetch all pending lyrics for ApproveLyrics
// ─────────────────────────────────────────────────────────────────────────────
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { data, error } = await supabaseAdmin
    .from('lyrics')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}