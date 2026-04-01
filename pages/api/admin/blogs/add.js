// pages/api/admin/blogs/add.js
// POST — insert new blog post (AddBlog)
// Note: image upload to Supabase Storage still happens client-side
// (storage has its own bucket policies). Only the DB insert goes here.
import { supabaseAdmin } from '../supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, author, slug, excerpt, published_date, thumbnail_url, content, status, tags } = req.body;
  if (!title || !author || !slug || !content) {
    return res.status(400).json({ error: 'title, author, slug, content required' });
  }
  const { error } = await supabaseAdmin.from('blogs').insert([{
    title, author, slug, excerpt, published_date, thumbnail_url, content, status, tags
  }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ok: true });
}