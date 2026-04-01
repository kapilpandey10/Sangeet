// pages/api/admin/blogs/all.js
// GET — fetch all blog posts (ManageBlog)
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { data, error } = await supabaseAdmin
    .from('blogs')
    .select('id, title, slug, content, published_date, status, excerpt, thumbnail_url, tags, author')
    .order('published_date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}