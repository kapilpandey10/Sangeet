const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Function to generate the sitemap
async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://pandeykapil.com.np' });

  // Fetch lyrics data from Supabase
  const { data, error } = await supabase
    .from('lyrics')
    .select('title');

  if (error) {
    console.error('Error fetching lyrics:', error.message);
    return;
  }

  // Add the home page
  sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });

  // Dynamically add lyrics URLs
  data.forEach((lyric) => {
    const formattedTitle = lyric.title.replace(/\s+/g, '_');
    sitemap.write({ url: `/lyrics/${formattedTitle}`, changefreq: 'weekly', priority: 0.8 });
  });

  // Add more static pages if needed
  sitemap.write({ url: '/contactus', changefreq: 'monthly', priority: 0.5 });

  // End the sitemap stream
  sitemap.end();

  // Convert the stream to a promise
  return streamToPromise(sitemap).then((sm) => sm.toString());
}

// Route to generate the sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);

    // Save the sitemap to the public folder as well
    fs.writeFileSync('public/sitemap.xml', sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap.');
  }
});

app.listen(PORT, () => {
  console.log(`Sitemap generator server running on port ${PORT}`);
});
