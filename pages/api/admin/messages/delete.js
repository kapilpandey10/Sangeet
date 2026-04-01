import { supabaseAdmin } from '../supabaseAdmin';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id } = req.body;
  const { error } = await supabaseAdmin.from('message').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ok: true });
}