require('dotenv').config();  // This line should be at the very top

const express = require('express');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const port = 3001;

// Helper function to generate the URL-friendly version of the title
const generateSlug = (title) => {
  return title.trim().replace(/\s+/g, '_').toLowerCase(); // Replaces spaces with underscores and converts to lowercase
};

// Generate the sitemap.xml
app.get('/generate-sitemap', async (req, res) => {
  try {
    // Fetch all lyrics titles from Supabase 'lyrics' table
    const { data: lyrics, error } = await supabase
      .from('lyrics')
      .select('title');

    if (error) {
      console.error('Error fetching lyrics:', error);
      return res.status(500).send('Error generating sitemap.');
    }

    // Generate dynamic URLs based on the fetched titles
    const urls = lyrics.map((lyric) => ({
      loc: `https://pandeykapil.com.np/lyrics/${generateSlug(lyric.title)}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',  // Define change frequency
      priority: '0.8',  // Set priority (scale 0.0 - 1.0)
    }));

    // Add other static URLs if needed
    const staticUrls = [
      { loc: 'https://pandeykapil.com.np/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' },
      { loc: 'https://pandeykapil.com.np/contact', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.5' },
    ];

    const allUrls = [...urls, ...staticUrls];

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
    res.send('Sitemap generated and saved successfully.');
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Error generating sitemap.');
  }
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key must be defined in environment variables.');
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Sitemap generator server running on port ${port}`);
});
