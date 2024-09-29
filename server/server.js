require('dotenv').config(); // This line should be at the very top

const express = require('express');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron'); // Import node-cron for scheduling tasks

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const port = 3001;

// Function to generate the sitemap
const generateSitemap = async () => {
  try {
    // Fetch all lyrics with their slugs from Supabase 'lyrics' table
    const { data: lyrics, error: lyricsError } = await supabase
      .from('lyrics')
      .select('slug');

    if (lyricsError) {
      console.error('Error fetching lyrics:', lyricsError);
      return false;
    }

    // Generate dynamic URLs for lyrics using slug
    const lyricsUrls = lyrics.map((lyric) => ({
      loc: `https://pandeykapil.com.np/lyrics/${lyric.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    }));

    // Fetch all blogs with their slugs from Supabase 'blogs' table
    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select('slug');

    if (blogsError) {
      console.error('Error fetching blogs:', blogsError);
      return false;
    }

    // Generate dynamic URLs for blogs using slug
    const blogUrls = blogs.map((blog) => ({
      loc: `https://pandeykapil.com.np/blogs/${blog.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    }));

    // Add other static URLs if needed
    const staticUrls = [
      { loc: 'https://pandeykapil.com.np/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' },
      { loc: 'https://pandeykapil.com.np/contact', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.5' },
    ];

    const allUrls = [...lyricsUrls, ...blogUrls, ...staticUrls];

    // Create the sitemap XML structure
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

    // Write the sitemap.xml file to the public folder
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml'); // Adjust this line to point outside the server folder
    fs.writeFileSync(sitemapPath, sitemap);

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
    res.send('Sitemap generated and saved successfully.');
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key must be defined in environment variables.');
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Sitemap generator server running on port ${port}`);
});
