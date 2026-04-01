// pages/api/admin/messages/all.js
// GET — fetch all messages ordered newest first (Messages inbox)
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { data, error } = await supabaseAdmin
    .from('message')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}