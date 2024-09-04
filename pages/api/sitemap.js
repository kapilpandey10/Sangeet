import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

export default async function handler(req, res) {
  const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
    { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  ];

  const stream = new SitemapStream({ hostname: 'https://pandeykapil.com.np' });

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
