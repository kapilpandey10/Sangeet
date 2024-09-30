import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../style/RelatedBlogs.css'; // Import the CSS file

const RelatedBlogs = ({ tags, slug }) => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      let { data: blogsWithSameTags } = await supabase
        .from('blogs')
        .select('*')
        .contains('tags', tags)
        .neq('slug', slug) // Exclude the current blog
        .limit(4); // Fetch only 4 blogs

      // If no related blogs with the same tags are found, fetch the latest 4 blogs
      if (blogsWithSameTags.length === 0) {
        const { data: latestBlogs } = await supabase
          .from('blogs')
          .select('*')
          .neq('slug', slug) // Exclude the current blog
          .order('published_date', { ascending: false }) // Order by latest date
          .limit(4); // Fetch only the latest 4 blogs

        blogsWithSameTags = latestBlogs;
      }

      setRelatedBlogs(blogsWithSameTags);
    };

    fetchRelatedBlogs();
  }, [tags, slug]);

  if (relatedBlogs.length === 0) return null;

  return (
    <aside className="related-blogs" aria-label="Suggested articles">
      <h3>Suggested Articles</h3>
      <ul className="suggested-list">
        {relatedBlogs.map((relatedBlog) => (
          <li key={relatedBlog.id} className="suggested-item">
            <Link to={`/blogs/${relatedBlog.slug}`}>
              <img
                src={relatedBlog.thumbnail_url || 'https://via.placeholder.com/150'}
                alt={`Thumbnail for ${relatedBlog.title}`}
                className="related-blog-thumbnail"
                loading="lazy"
              />
              <h4>{relatedBlog.title}</h4>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default RelatedBlogs;
