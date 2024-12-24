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
  
  async function fetchRadioPages() {
    const res = await fetch('https://tffwhfvevgjscrhkdmpl.supabase.co/radio');
    const data = await res.json();
    return data.map((item) => `/radio/${item.slug}`);
  }
  
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
  