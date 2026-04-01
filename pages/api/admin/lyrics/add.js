// pages/api/admin/lyrics/add.js
// POST — insert a new lyric directly as approved (admin-added)
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const payload = req.body;
  const { error } = await supabaseAdmin.from('lyrics').insert([payload]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ok: true });
}