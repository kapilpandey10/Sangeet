import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

export default async function handler(req, res) {
  // Array with your dynamic routes
  const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
    { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  ];

  // Create a stream to write to
  const stream = new SitemapStream({ hostname: 'https://pandeykapil.com.np' });

  // Set the header to tell the browser that the content is XML
  res.setHeader('Content-Type', 'application/xml');

  try {
    const xmlString = await streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
      data.toString()
    );
    res.status(200).end(xmlString);
  } catch (err) {
    res.status(500).json({ error: 'Error generating sitemap' });
  }
}
