const express = require('express');
const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');
const path = require('path'); // Add this
const { supabase } = require('./supabaseClient');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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

    // Use absolute path for saving the file in the public folder
    const sitemapPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
    console.log(`Attempting to save sitemap to: ${sitemapPath}`); // More verbose log
    fs.writeFileSync(sitemapPath, sitemap);
    fs.writeFileSync(sitemapPath, 'test content'); // Write a simple test file instead of the sitemap content
    console.log(`Test file written to: ${sitemapPath}`);
        
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap.');
  }
});

app.listen(PORT, () => {
  console.log(`Sitemap generator server running on port ${PORT}`);
});
