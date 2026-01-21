/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://pandeykapil.com.np', // Replace with your actual site URL
    generateRobotsTxt: true, // Generates `robots.txt` alongside `sitemap.xml`
    exclude: ['/admin/*'], // Optionally exclude paths
    additionalPaths: async (config) => {
      const radioPages = await fetchRadioPages();
      const blogPages = await fetchBlogPages();
      const lyricsPages = await fetchLyricsPages();
  
      return [
        ...radioPages.map((path) => ({ loc: path })),
        ...blogPages.map((path) => ({ loc: path })),
        ...lyricsPages.map((path) => ({ loc: path })),
      ];
    },
  };
  
  // Replace the following functions with your actual data-fetching logic:
  
// Replace your existing mapping logic with this safe version
const fetchRadioPages = async () => {
  const { data, error } = await supabase.from('radio').select('slug');

  // Check if data is missing or not an array
  if (error || !Array.isArray(data)) {
    console.error("Sitemap Fetch Error:", error);
    return []; 
  }

  return data.map((station) => ({
    loc: `/radio/${station.slug}`,
    changefreq: 'daily',
    priority: 0.7,
    lastmod: new Date().toISOString(),
  }));
};
  
  async function fetchBlogPages() {
    const res = await fetch('https://tffwhfvevgjscrhkdmpl.supabase.co/blogs');
    const data = await res.json();
    return data.map((item) => `/blogs/${item.slug}`);
  }
  
  async function fetchLyricsPages() {
    const res = await fetch('https://tffwhfvevgjscrhkdmpl.supabase.co/lyrics');
    const data = await res.json();
    return data.map((item) => `/lyrics/${item.slug}`);
  }
  