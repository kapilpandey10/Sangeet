import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient'; // kept ONLY for image storage upload
import styles from './style/AddBlog.module.css';

const TAGS = [
  'Politics','Business','Technology','Health','Science',
  'Sports','Entertainment','World','Environment','Lifestyle',
  'Education','Opinion','Crime','Weather','Local'
];

const WordCount = ({ text }) => {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const readTime = Math.max(1, Math.ceil(words / 200));
  return (
    <div className={styles.wordCount}>
      <span>{words} words</span>
      <span className={styles.dot}>·</span>
      <span>{chars} chars</span>
      <span className={styles.dot}>·</span>
      <span>{readTime} min read</span>
    </div>
  );
};

const AddBlog = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [status, setStatus] = useState('draft');
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('meta');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    setPublishedDate(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [title, slugManuallyEdited]);

  const handleFileSelect = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFileSelect(file);
  };

  const insertFormatting = (before, after = '') => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toolbarActions = [
    { label: 'H2', action: () => insertFormatting('<h2>', '</h2>'), title: 'Heading 2' },
    { label: 'H3', action: () => insertFormatting('<h3>', '</h3>'), title: 'Heading 3' },
    { label: 'B', action: () => insertFormatting('<strong>', '</strong>'), title: 'Bold', style: { fontWeight: 700 } },
    { label: 'I', action: () => insertFormatting('<em>', '</em>'), title: 'Italic', style: { fontStyle: 'italic' } },
    { label: '❝', action: () => insertFormatting('<blockquote>', '</blockquote>'), title: 'Blockquote' },
    { label: 'UL', action: () => insertFormatting('<ul>\n  <li>', '</li>\n</ul>'), title: 'Unordered List' },
    { label: 'OL', action: () => insertFormatting('<ol>\n  <li>', '</li>\n</ol>'), title: 'Ordered List' },
    { label: '<>', action: () => insertFormatting('<code>', '</code>'), title: 'Inline Code' },
    { label: 'HR', action: () => { setContent(c => c + '\n<hr />\n'); }, title: 'Divider' },
    { label: 'IMG', action: () => insertFormatting('<img src="', '" alt="" />'), title: 'Image tag' },
    { label: 'A', action: () => insertFormatting('<a href="', '">Link text</a>'), title: 'Link' },
  ];

  // Image upload still uses supabase storage directly (this is fine — storage is not a DB table)
  const uploadImage = async () => {
    if (!imageFile) return null;
    const fileName = `${slug}-${Date.now()}`;
    const { error } = await supabase.storage.from('images').upload(`thumbnails/${fileName}`, imageFile);
    if (error) throw new Error('Image upload failed: ' + error.message);
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(`thumbnails/${fileName}`);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!title || !author || !slug || !content) {
      setErrorMessage('Please fill in all required fields: Title, Author, Slug, and Content.');
      return;
    }
    setLoading(true);
    try {
      const imageUrl = imageFile ? await uploadImage() : '';

      // DB insert goes through the secure API route
      const res = await fetch('/api/admin/blogs/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, author, slug, excerpt,
          published_date: publishedDate,
          thumbnail_url: imageUrl,
          content, status,
          tags: selectedTag,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'An error occurred.');
      }

      setSuccessMessage('Blog published successfully!');
      resetForm();
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setAuthor(''); setSlug(''); setExcerpt('');
    setPublishedDate(new Date().toISOString().split('T')[0]);
    setSelectedTag(''); setContent(''); setStatus('draft');
    setImageFile(null); setImagePreview(null); setSlugManuallyEdited(false);
  };

  const completionScore = () => {
    let score = 0;
    if (title) score += 20;
    if (author) score += 10;
    if (slug) score += 10;
    if (excerpt) score += 15;
    if (content.length > 100) score += 25;
    if (imageFile) score += 10;
    if (selectedTag) score += 10;
    return score;
  };

  const score = completionScore();

  return (
    <div className={styles.addBlogContainer}>
      <div className={styles.editorHeader}>
        <div className={styles.editorHeaderLeft}>
          <div className={styles.editorBadge}>NEW POST</div>
          <h1 className={styles.editorTitle}>
            {title || <span className={styles.placeholder}>Untitled Story</span>}
          </h1>
        </div>
        <div className={styles.editorHeaderRight}>
          <div className={styles.completionWrap}>
            <div className={styles.completionLabel}>{score}% complete</div>
            <div className={styles.completionBar}>
              <div className={styles.completionFill}
                style={{ width: `${score}%`, background: score === 100 ? '#22c55e' : score > 60 ? '#f59e0b' : '#ef4444' }} />
            </div>
          </div>
          <div className={styles.statusToggle}>
            <button type="button" className={`${styles.statusBtn} ${status === 'draft' ? styles.statusActive : ''}`}
              onClick={() => setStatus('draft')}>Draft</button>
            <button type="button" className={`${styles.statusBtn} ${status === 'published' ? styles.statusActive : ''}`}
              onClick={() => setStatus('published')}>Publish</button>
          </div>
        </div>
      </div>

      <div className={styles.sectionTabs}>
        {['meta', 'content', 'settings'].map(s => (
          <button key={s} type="button"
            className={`${styles.sectionTab} ${activeSection === s ? styles.sectionTabActive : ''}`}
            onClick={() => setActiveSection(s)}>
            {s === 'meta' ? '① Post Details' : s === 'content' ? '② Content' : '③ Settings'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.editorForm}>

        {activeSection === 'meta' && (
          <div className={styles.section}>
            <div className={styles.fieldGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Title <span className={styles.required}>*</span></label>
                <input className={styles.input} type="text" value={title}
                  onChange={e => setTitle(e.target.value)} placeholder="Your compelling headline..." maxLength={120} />
                <div className={styles.charCount}>{title.length}/120</div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Author <span className={styles.required}>*</span></label>
                <input className={styles.input} type="text" value={author}
                  onChange={e => setAuthor(e.target.value)} placeholder="Author name" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Slug <span className={styles.required}>*</span>
                  <span className={styles.labelHint}>URL path for this post</span></label>
                <div className={styles.slugWrap}>
                  <span className={styles.slugPrefix}>/blog/</span>
                  <input className={`${styles.input} ${styles.slugInput}`} type="text" value={slug}
                    onChange={e => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                    placeholder="auto-generated-from-title" />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Published Date</label>
                <input className={styles.input} type="date" value={publishedDate}
                  onChange={e => setPublishedDate(e.target.value)} />
              </div>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Excerpt
                  <span className={styles.labelHint}>Short summary shown in listings</span></label>
                <textarea className={styles.textarea} value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  placeholder="Write a short description that draws readers in..." rows={3} maxLength={300} />
                <div className={styles.charCount}>{excerpt.length}/300</div>
              </div>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Thumbnail Image</label>
                <div className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${imagePreview ? styles.hasImage : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <div className={styles.imagePreviewWrap}>
                      <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                      <div className={styles.imageOverlay}><span>Click to change</span></div>
                    </div>
                  ) : (
                    <div className={styles.dropZoneInner}>
                      <div className={styles.dropIcon}>⬆</div>
                      <p className={styles.dropText}>Drop image here or <span>browse</span></p>
                      <p className={styles.dropHint}>PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.gif,.webp"
                    onChange={e => handleFileSelect(e.target.files[0])} style={{ display: 'none' }} />
                </div>
              </div>
            </div>
            <div className={styles.sectionNav}>
              <button type="button" className={styles.nextBtn} onClick={() => setActiveSection('content')}>
                Continue to Content →
              </button>
            </div>
          </div>
        )}

        {activeSection === 'content' && (
          <div className={styles.section}>
            <div className={styles.contentEditor}>
              <div className={styles.toolbar}>
                {toolbarActions.map((t, i) => (
                  <button key={i} type="button" className={styles.toolbarBtn}
                    onClick={t.action} title={t.title} style={t.style}>{t.label}</button>
                ))}
                <div className={styles.toolbarDivider} />
                <WordCount text={content} />
              </div>
              <textarea ref={contentRef} className={styles.contentTextarea} value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={`Start writing your story in HTML...\n\n<h2>Your First Section</h2>\n<p>Your content here...</p>`}
                rows={28} spellCheck />
            </div>
            <div className={styles.sectionNav}>
              <button type="button" className={styles.backBtn} onClick={() => setActiveSection('meta')}>← Back</button>
              <button type="button" className={styles.nextBtn} onClick={() => setActiveSection('settings')}>Continue to Settings →</button>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className={styles.section}>
            <div className={styles.settingsGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Category / Tag</label>
                <div className={styles.tagGrid}>
                  {TAGS.map(tag => (
                    <button key={tag} type="button"
                      className={`${styles.tagChip} ${selectedTag === tag ? styles.tagChipActive : ''}`}
                      onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}>{tag}</button>
                  ))}
                </div>
              </div>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Post Summary</h3>
                <div className={styles.summaryRow}><span>Title</span><span>{title || '—'}</span></div>
                <div className={styles.summaryRow}><span>Author</span><span>{author || '—'}</span></div>
                <div className={styles.summaryRow}><span>Slug</span><span>/blog/{slug || '—'}</span></div>
                <div className={styles.summaryRow}><span>Tag</span><span>{selectedTag || '—'}</span></div>
                <div className={styles.summaryRow}><span>Status</span>
                  <span className={status === 'published' ? styles.publishedBadge : styles.draftBadge}>{status}</span>
                </div>
                <div className={styles.summaryRow}><span>Thumbnail</span><span>{imageFile ? imageFile.name : '—'}</span></div>
                <div className={styles.summaryRow}><span>Word Count</span>
                  <span>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className={styles.errorBanner}><span className={styles.errorIcon}>!</span> {errorMessage}</div>
            )}
            {successMessage && (
              <div className={styles.successBanner}><span>✓</span> {successMessage}</div>
            )}

            <div className={styles.sectionNav}>
              <button type="button" className={styles.backBtn} onClick={() => setActiveSection('content')}>← Back</button>
              <button type="submit" className={styles.publishBtn} disabled={loading}>
                {loading ? <><span className={styles.spinner} /> Publishing…</> : status === 'published' ? '⚡ Publish Post' : '💾 Save Draft'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddBlog;