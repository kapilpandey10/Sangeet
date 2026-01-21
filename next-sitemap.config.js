const { createClient } = require('@supabase/supabase-js');

// 1. Initialize Supabase manually for the config script
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://pandeykapil.com.np',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/Admin/*'],
  additionalPaths: async (config) => {
    // Fetch all dynamic paths
    const radioPages = await fetchRadioPages();
    const blogPages = await fetchBlogPages();
    const lyricsPages = await fetchLyricsPages();

    // Combine them directly (they already have the correct format)
    return [...radioPages, ...blogPages, ...lyricsPages];
  },
};

const fetchRadioPages = async () => {
  const { data, error } = await supabase.from('radio').select('slug');
  if (error || !Array.isArray(data)) return [];
  return data.map((station) => ({ loc: `/radio/${station.slug}` }));
};

const fetchBlogPages = async () => {
  const { data, error } = await supabase.from('blogs').select('slug');
  if (error || !Array.isArray(data)) return [];
  return data.map((post) => ({ loc: `/blogs/${post.slug}` }));
};

const fetchLyricsPages = async () => {
  const { data, error } = await supabase.from('lyrics').select('slug').eq('status', 'approved');
  if (error || !Array.isArray(data)) return [];
  return data.map((lyric) => ({ loc: `/viewlyrics/${lyric.slug}` }));
};