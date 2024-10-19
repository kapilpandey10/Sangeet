import { supabase } from '../supabaseClient'; // Adjust the path if needed

const Sitemap = () => null; // This component does not render anything

export const getServerSideProps = async ({ res }) => {
  try {
    console.log('Generating sitemap...');

    // Fetch blogs from Supabase
    console.log('Fetching blogs...');
    const { data: blogs, error: blogError } = await supabase
      .from('blogs')
      .select('slug, updated_at');

    if (blogError || !blogs) {
      console.error('Error fetching blogs:', blogError);
      return { notFound: true }; // Return 404 if no blogs
    }
    console.log('Blogs fetched:', blogs);

    // Fetch lyrics from Supabase
    console.log('Fetching lyrics...');
    const { data: lyrics, error: lyricsError } = await supabase
      .from('lyrics')
      .select('slug, created_at');  // Use created_at instead of updated_at

    if (lyricsError || !lyrics) {
      console.error('Error fetching lyrics:', lyricsError);
      return { notFound: true }; // Return 404 if no lyrics
    }
    console.log('Lyrics fetched:', lyrics);

    // Set base URL for the sitemap
    const baseUrl = 'https://www.pandeykapil.com.np'; // Replace with your actual domain

    // Generate the sitemap XML content
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${baseUrl}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
        ${blogs
          .map(
            (blog) => `
          <url>
            <loc>${baseUrl}/blogs/${blog.slug}</loc>
            <lastmod>${blog.updated_at ? new Date(blog.updated_at).toISOString() : new Date().toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>`
          )
          .join('')}
        ${lyrics
          .map(
            (lyric) => `
          <url>
            <loc>${baseUrl}/lyrics/${lyric.slug}</loc>
            <lastmod>${lyric.created_at ? new Date(lyric.created_at).toISOString() : new Date().toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>`
          )
          .join('')}
      </urlset>`;

    // Set the response type to XML and send the sitemap
    console.log('Sending XML response...');
    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    console.log('Sitemap served successfully!');
    return {
      props: {}, // No props needed for the client-side component
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return { notFound: true }; // Return 404 if there is an error
  }
};

export default Sitemap;
