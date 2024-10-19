require('dotenv').config(); // This line should be at the very top

const express = require('express');
const fs = require('fs').promises; // Use fs promises for async file operations
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron'); // Import node-cron for scheduling tasks
const { exit } = require('process');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key must be defined in environment variables.');
  exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const port = process.env.PORT || 3001; // Allow dynamic port configuration

// Function to generate the sitemap
const generateSitemap = async () => {
  try {
    const [lyricsResult, blogsResult] = await Promise.all([
      supabase.from('lyrics').select('slug'),
      supabase.from('blogs').select('slug'),
    ]);

    const { data: lyrics, error: lyricsError } = lyricsResult;
    const { data: blogs, error: blogsError } = blogsResult;

    if (lyricsError) throw new Error(`Error fetching lyrics: ${lyricsError.message}`);
    if (blogsError) throw new Error(`Error fetching blogs: ${blogsError.message}`);

    // Generate dynamic URLs for lyrics
    const lyricsUrls = lyrics.map((lyric) => ({
      loc: `https://www.pandeykapil.com.np/lyrics/${lyric.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    }));

    // Generate dynamic URLs for blogs
    const blogUrls = blogs.map((blog) => ({
      loc: `https://www.pandeykapil.com.np/blogs/${blog.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    }));

    // Static URLs stored in a config file or array
    const staticUrls = [
      { loc: 'https://www.pandeykapil.com.np/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' },
      { loc: 'https://www.pandeykapil.com.np/contactus', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.5' },
      // Add other static URLs as needed
    ];

    const allUrls = [...lyricsUrls, ...blogUrls, ...staticUrls];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${allUrls
          .map(
            (url) => `
          <url>
            <loc>${url.loc}</loc>
            <lastmod>${url.lastmod}</lastmod>
            <changefreq>${url.changefreq}</changefreq>
            <priority>${url.priority}</priority>
          </url>`
          )
          .join('')}
      </urlset>`;

    // Dynamic path for the sitemap
    const sitemapPath = path.resolve(__dirname, '../build/sitemap.xml');
    await fs.writeFile(sitemapPath, sitemap);

    console.log('Sitemap generated successfully!');
    return true;
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return false;
  }
};

// Route for manual sitemap generation
app.get('/generate-sitemap', async (req, res) => {
  const result = await generateSitemap();
  if (result) {
    res.status(200).send('Sitemap generated and saved successfully. Check it at https://www.pandeykapil.com.np/sitemap.xml');
  } else {
    res.status(500).send('Error generating sitemap.');
  }
});

// Automatically generate the sitemap every 3 minutes
cron.schedule('*/3 * * * *', async () => {
  console.log('Automatically generating sitemap...');
  const result = await generateSitemap();
  if (result) {
    console.log('Sitemap automatically generated successfully.');
  } else {
    console.log('Error in automatic sitemap generation.');
  }
});

app.listen(port, () => {
  console.log(`Sitemap generator server running on port ${port}.`);
});
