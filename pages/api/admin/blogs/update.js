// pages/api/admin/blogs/update.js
// POST — update blog post fields (ManageBlog edit modal)
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, data } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  const { error } = await supabaseAdmin.from('blogs').update(data).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ok: true });
}