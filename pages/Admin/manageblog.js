import React, { useState, useEffect, useRef } from 'react';
import { FaTrash, FaEdit, FaSearch, FaTimes, FaGlobe, FaArchive } from 'react-icons/fa';
import styles from './style/ManageBlog.module.css';

const STATUS_ALL = 'all';

const ManageBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL);
  const [saving, setSaving] = useState(false);
  const contentRef = useRef(null);

  const [form, setForm] = useState({
    title: '', slug: '', content: '', published_date: '',
    status: '', excerpt: '', thumbnail_url: '', tags: '', author: '',
  });

  useEffect(() => { fetchBlogs(); }, []);

  useEffect(() => {
    let result = blogs;
    if (statusFilter !== STATUS_ALL) result = result.filter(b => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.tags?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [blogs, search, statusFilter]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blogs/all');
      const data = await res.json();
      setBlogs(data || []);
    } catch (err) {
      setError('Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleEditClick = (blog) => {
    setSelectedBlog(blog);
    setForm({
      title: blog.title || '', slug: blog.slug || '', content: blog.content || '',
      published_date: blog.published_date || '', status: blog.status || 'draft',
      excerpt: blog.excerpt || '', thumbnail_url: blog.thumbnail_url || '',
      tags: blog.tags || '', author: blog.author || '',
    });
    setIsEditing(true);
    setError(null);
  };

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const insertFormatting = (before, after = '') => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = form.content.slice(start, end);
    const newContent = form.content.slice(0, start) + before + selected + after + form.content.slice(end);
    handleFormChange('content', newContent);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + before.length, end + before.length); }, 0);
  };

  const toolbarActions = [
    { label: 'H2', action: () => insertFormatting('<h2>', '</h2>') },
    { label: 'H3', action: () => insertFormatting('<h3>', '</h3>') },
    { label: 'B', action: () => insertFormatting('<strong>', '</strong>'), style: { fontWeight: 700 } },
    { label: 'I', action: () => insertFormatting('<em>', '</em>'), style: { fontStyle: 'italic' } },
    { label: '❝', action: () => insertFormatting('<blockquote>', '</blockquote>') },
    { label: 'UL', action: () => insertFormatting('<ul>\n  <li>', '</li>\n</ul>') },
    { label: '<>', action: () => insertFormatting('<code>', '</code>') },
    { label: 'A', action: () => insertFormatting('<a href="', '">Link</a>') },
  ];

  const handleUpdateBlog = async () => {
    if (!form.title || !form.slug || !form.content || !form.author) {
      setError('Title, Author, Slug, and Content are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/blogs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedBlog.id, ...form }),
      });
      if (!res.ok) throw new Error();
      setBlogs(prev => prev.map(b => b.id === selectedBlog.id ? { ...b, ...form } : b));
      showSuccess('Post updated successfully.');
      setIsEditing(false);
      setSelectedBlog(null);
    } catch (err) {
      setError('Error updating post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      const res = await fetch('/api/admin/blogs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blogId }),
      });
      if (!res.ok) throw new Error();
      setBlogs(prev => prev.filter(b => b.id !== blogId));
      showSuccess('Post deleted.');
      setDeleteConfirm(null);
    } catch (err) {
      setError('Error deleting post.');
    }
  };

  const toggleStatus = async (blog) => {
    const newStatus = blog.status === 'draft' ? 'published' : 'draft';
    try {
      const res = await fetch('/api/admin/blogs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blog.id, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, status: newStatus } : b));
      showSuccess(`Post ${newStatus === 'published' ? 'published' : 'moved to draft'}.`);
    } catch (err) {
      setError('Error updating status.');
    }
  };

  const wordCount = (text) => text?.trim() ? text.trim().split(/\s+/).length : 0;
  const publishedCount = blogs.filter(b => b.status === 'published').length;
  const draftCount = blogs.filter(b => b.status === 'draft').length;

  return (
    <div className={styles.container}>

      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1 className={styles.pageTitle}>Blog Posts</h1>
          <div className={styles.statsRow}>
            <span className={styles.statItem}><span className={styles.statDot} style={{ background: '#22c55e' }} />{publishedCount} published</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.statItem}><span className={styles.statDot} style={{ background: '#f59e0b' }} />{draftCount} drafts</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.statItem}>{blogs.length} total</span>
          </div>
        </div>
        <div className={styles.topBarRight}>
          <div className={styles.searchWrap}>
            <FaSearch className={styles.searchIcon} />
            <input className={styles.searchInput} type="text" placeholder="Search posts..."
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className={styles.searchClear} onClick={() => setSearch('')}><FaTimes /></button>}
          </div>
          <div className={styles.filterTabs}>
            {[STATUS_ALL, 'published', 'draft'].map(s => (
              <button key={s} className={`${styles.filterTab} ${statusFilter === s ? styles.filterActive : ''}`}
                onClick={() => setStatusFilter(s)}>
                {s === STATUS_ALL ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {successMessage && <div className={styles.successBanner}><span>✓</span> {successMessage}</div>}
      {error && !isEditing && <div className={styles.errorBanner}><span>!</span> {error}</div>}

      {loading ? (
        <div className={styles.loadingState}><div className={styles.loadSpinner} /><span>Loading posts…</span></div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✦</div>
          <p>{search || statusFilter !== STATUS_ALL ? 'No posts match your filters.' : 'No blog posts yet.'}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Post</th><th>Author</th><th>Tag</th><th>Date</th><th>Status</th><th>Words</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(blog => (
                <tr key={blog.id} className={styles.tableRow}>
                  <td className={styles.titleCell}>
                    <div className={styles.postTitle}>{blog.title}</div>
                    <div className={styles.postSlug}>/blog/{blog.slug}</div>
                  </td>
                  <td className={styles.authorCell}>{blog.author}</td>
                  <td>{blog.tags ? <span className={styles.tagBadge}>{blog.tags}</span> : <span className={styles.emptyCell}>—</span>}</td>
                  <td className={styles.dateCell}>
                    {blog.published_date ? new Date(blog.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td><span className={blog.status === 'published' ? styles.statusPublished : styles.statusDraft}>{blog.status}</span></td>
                  <td className={styles.wordCell}>{wordCount(blog.content).toLocaleString()}</td>
                  <td>
                    <div className={styles.actionRow}>
                      <button className={styles.actionBtn} onClick={() => handleEditClick(blog)} title="Edit"><FaEdit /></button>
                      <button className={`${styles.actionBtn} ${styles.actionToggle}`} onClick={() => toggleStatus(blog)}
                        title={blog.status === 'draft' ? 'Publish' : 'Move to Draft'}>
                        {blog.status === 'draft' ? <FaGlobe /> : <FaArchive />}
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => setDeleteConfirm(blog.id)} title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <div className={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}>⚠</div>
            <h3 className={styles.confirmTitle}>Delete Post?</h3>
            <p className={styles.confirmText}>This action cannot be undone. The post will be permanently removed.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.deleteBtn} onClick={() => handleDeleteBlog(deleteConfirm)}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {isEditing && selectedBlog && (
        <div className={styles.overlay} onClick={() => setIsEditing(false)}>
          <div className={styles.editModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalBadge}>EDITING</div>
                <h2 className={styles.modalTitle}>{selectedBlog.title}</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsEditing(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Title <span className={styles.req}>*</span></label>
                  <input className={styles.input} value={form.title} onChange={e => handleFormChange('title', e.target.value)} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Author <span className={styles.req}>*</span></label>
                  <input className={styles.input} value={form.author} onChange={e => handleFormChange('author', e.target.value)} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Slug <span className={styles.req}>*</span></label>
                  <input className={styles.input} value={form.slug} onChange={e => handleFormChange('slug', e.target.value)} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Published Date</label>
                  <input className={styles.input} type="date" value={form.published_date} onChange={e => handleFormChange('published_date', e.target.value)} />
                </div>
                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Excerpt</label>
                  <textarea className={styles.textarea} rows={2} value={form.excerpt} onChange={e => handleFormChange('excerpt', e.target.value)} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Thumbnail URL</label>
                  <input className={styles.input} value={form.thumbnail_url} onChange={e => handleFormChange('thumbnail_url', e.target.value)} placeholder="https://..." />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Tags</label>
                  <input className={styles.input} value={form.tags} onChange={e => handleFormChange('tags', e.target.value)} />
                </div>
                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Content <span className={styles.req}>*</span>
                    <span className={styles.wc}>{wordCount(form.content)} words</span></label>
                  <div className={styles.contentEditor}>
                    <div className={styles.toolbar}>
                      {toolbarActions.map((t, i) => (
                        <button key={i} type="button" className={styles.toolbarBtn} onClick={t.action} style={t.style}>{t.label}</button>
                      ))}
                    </div>
                    <textarea ref={contentRef} className={styles.contentTextarea} rows={16}
                      value={form.content} onChange={e => handleFormChange('content', e.target.value)} />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Status</label>
                  <div className={styles.statusToggle}>
                    {['draft', 'published'].map(s => (
                      <button key={s} type="button"
                        className={`${styles.statusBtn} ${form.status === s ? styles.statusActive : ''}`}
                        onClick={() => handleFormChange('status', s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {error && isEditing && <div className={styles.errorBanner}><span>!</span> {error}</div>}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleUpdateBlog} disabled={saving}>
                {saving ? <><span className={styles.spinner} /> Saving…</> : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlog;