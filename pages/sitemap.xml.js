// File: pages/sitemap.xml.js

import { supabase } from '../supabaseClient'; // Adjust to your supabase client path

const Sitemap = () => {
  return null; // This component doesn't render anything
};

// Fetch blog and lyrics data and generate the sitemap.xml content
export const getServerSideProps = async ({ res }) => {
  // Fetch blog slugs from Supabase
  const { data: blogs, error: blogError } = await supabase
    .from('blogs')
    .select('slug, updated_at');

  // Fetch lyrics slugs from Supabase
  const { data: lyrics, error: lyricsError } = await supabase
    .from('lyrics')
    .select('slug, updated_at');

  if (blogError || lyricsError) {
    console.error('Error fetching data for sitemap:', blogError || lyricsError);
    return {
      notFound: true,
    };
  }

  // Define the base URL
  const baseUrl = 'https://www.pandeykapil.com.np';
  

  // Generate XML structure for blogs
  const blogUrls = blogs
    .map((blog) => {
      return `
        <url>
          <loc>${baseUrl}/blogs/${blog.slug}</loc>
          <lastmod>${new Date(blog.updated_at).toISOString()}</lastmod>
          <priority>0.80</priority>
        </url>`;
    })
    .join('');

  // Generate XML structure for lyrics
  const lyricsUrls = lyrics
    .map((lyric) => {
      return `
        <url>
          <loc>${baseUrl}/lyrics/${lyric.slug}</loc>
          <lastmod>${new Date(lyric.updated_at).toISOString()}</lastmod>
          <priority>0.80</priority>
        </url>`;
    })
    .join('');

  // Combine the blog and lyrics URLs
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>1.00</priority>
      </url>
      ${blogUrls}
      ${lyricsUrls}
    </urlset>`;

  // Set the response headers to serve XML
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {}, // Next.js requires props to be returned
  };
};

export default Sitemap;
