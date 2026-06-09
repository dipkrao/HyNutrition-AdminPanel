import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogBySlug, clearCurrent } from '../store/slices/blogSlice';
import MDEditor from '@uiw/react-md-editor';

const SITE_NAME = 'HY Nutrition';
const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://hy-nutrition.com';

export default function BlogDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: blog, loading } = useSelector(s => s.blogs);

  useEffect(() => {
    dispatch(fetchBlogBySlug(slug));
    window.scrollTo(0, 0);
    return () => dispatch(clearCurrent());
  }, [dispatch, slug]);

  // SEO: Update meta tags dynamically
  useEffect(() => {
    if (!blog) return;
    const title = `${blog.metaTitle || blog.title} | ${SITE_NAME}`;
    const description = blog.metaDescription || blog.excerpt || '';
    const url = `${SITE_URL}/blog/${blog.slug}`;
    const image = blog.featuredImage || '';

    document.title = title;
    setMeta('description', description);
    setMeta('robots', 'index, follow');

    // Open Graph
    setOG('og:title', title);
    setOG('og:description', description);
    setOG('og:url', url);
    setOG('og:type', 'article');
    setOG('og:site_name', SITE_NAME);
    if (image) setOG('og:image', image);
    setOG('article:author', blog.author || SITE_NAME);
    setOG('article:published_time', blog.createdAt);
    if (blog.category) setOG('article:section', blog.category);

    // Twitter Card
    setOG('twitter:card', 'summary_large_image');
    setOG('twitter:title', title);
    setOG('twitter:description', description);
    if (image) setOG('twitter:image', image);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = url;

    return () => { document.title = SITE_NAME; };
  }, [blog]);

  if (loading) return <div style={{ maxWidth: 780, margin: '80px auto' }}><div className="spinner" /></div>;
  if (!loading && !blog) return (
    <div style={{ maxWidth: 780, margin: '80px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Post Not Found</h1>
      <Link to="/blog" className="btn btn-primary">← Back to Blog</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Breadcrumb — SEO nav structure */}
      <nav aria-label="breadcrumb" style={{ marginBottom: 28 }}>
        <ol style={{ display: 'flex', gap: 6, listStyle: 'none', padding: 0, fontSize: 13, color: '#9ca3af' }}>
          <li><Link to="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</Link></li>
          <li style={{ margin: '0 4px' }}>›</li>
          <li><Link to="/blog" style={{ color: '#9ca3af', textDecoration: 'none' }}>Blog</Link></li>
          {blog.category && <>
            <li style={{ margin: '0 4px' }}>›</li>
            <li><Link to={`/blog?category=${blog.category}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>{blog.category}</Link></li>
          </>}
          <li style={{ margin: '0 4px' }}>›</li>
          <li style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{blog.title}</li>
        </ol>
      </nav>

      {/* Article */}
      <article itemScope itemType="https://schema.org/BlogPosting">
        {/* Category */}
        {blog.category && (
          <Link to={`/blog?category=${blog.category}`} style={{ display: 'inline-block', color: '#f59e0b', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14, textDecoration: 'none' }}>
            {blog.category}
          </Link>
        )}

        {/* H1 Title — critical for SEO */}
        <h1 itemProp="headline" style={{ fontSize: 38, fontWeight: 900, color: '#111', lineHeight: 1.2, marginBottom: 20 }}>
          {blog.title}
        </h1>

        {/* Meta Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#6b7280', fontSize: 14, marginBottom: 32, flexWrap: 'wrap' }}>
          <span itemProp="author" itemScope itemType="https://schema.org/Person">
            ✍️ <span itemProp="name">{blog.author || 'Admin'}</span>
          </span>
          <span>·</span>
          <time itemProp="datePublished" dateTime={blog.createdAt}>
            📅 {new Date(blog.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          {blog.updatedAt !== blog.createdAt && (
            <>
              <span>·</span>
              <time itemProp="dateModified" dateTime={blog.updatedAt} style={{ fontSize: 12, color: '#9ca3af' }}>
                Updated {new Date(blog.updatedAt).toLocaleDateString()}
              </time>
            </>
          )}
        </div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <figure style={{ margin: '0 0 36px', borderRadius: 16, overflow: 'hidden' }}>
            <img
              src={blog.featuredImage}
              alt={blog.featuredImageAlt || blog.title}
              itemProp="image"
              style={{ width: '100%', maxHeight: 460, objectFit: 'cover', display: 'block' }}
              loading="eager"
            />
          </figure>
        )}

        {/* Excerpt */}
        {blog.excerpt && (
          <p itemProp="description" style={{ fontSize: 18, color: '#374151', lineHeight: 1.8, fontStyle: 'italic', borderLeft: '4px solid #f59e0b', paddingLeft: 20, marginBottom: 36, background: '#fffbeb', padding: '16px 20px', borderRadius: '0 12px 12px 0' }}>
            {blog.excerpt}
          </p>
        )}

        {/* Main Content — Markdown rendered */}
        <div itemProp="articleBody" data-color-mode="light" style={{ fontSize: 16, lineHeight: 1.85, color: '#1f2937' }}>
          <style>{`
            .blog-content h2 { font-size: 26px; font-weight: 800; color: #111; margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #f3f4f6; }
            .blog-content h3 { font-size: 20px; font-weight: 700; color: #1f2937; margin: 28px 0 12px; }
            .blog-content h4 { font-size: 17px; font-weight: 700; color: #374151; margin: 22px 0 10px; }
            .blog-content p { margin-bottom: 20px; }
            .blog-content ul, .blog-content ol { padding-left: 28px; margin-bottom: 20px; }
            .blog-content li { margin-bottom: 8px; line-height: 1.7; }
            .blog-content blockquote { border-left: 4px solid #f59e0b; margin: 24px 0; padding: 16px 20px; background: #fffbeb; border-radius: 0 10px 10px 0; font-style: italic; color: #374151; }
            .blog-content a { color: #f59e0b; text-decoration: underline; }
            .blog-content img { max-width: 100%; border-radius: 10px; margin: 16px 0; }
            .blog-content code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
            .blog-content pre { background: #1f2937; color: #e5e7eb; padding: 20px; border-radius: 10px; overflow-x: auto; margin: 24px 0; }
            .blog-content pre code { background: none; color: inherit; padding: 0; }
            .wmde-markdown { font-size: 16px !important; line-height: 1.85 !important; }
          `}</style>
          <div className="blog-content">
            <MDEditor.Markdown source={blog.content} />
          </div>
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #f3f4f6' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Tags</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {blog.tags.map(tag => (
                <Link key={tag} to={`/blog?tag=${tag}`}
                  style={{ background: '#f3f4f6', color: '#374151', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid #e5e7eb', transition: 'all 0.15s' }}
                  rel="tag"
                  itemProp="keywords">
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div style={{ marginTop: 36, background: '#fffbeb', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontWeight: 700, color: '#374151' }}>Share this post</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Twitter/X', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`${SITE_URL}/blog/${blog.slug}`)}` },
              { label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE_URL}/blog/${blog.slug}`)}` },
              { label: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE_URL}/blog/${blog.slug}`)}` },
            ].map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#374151', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </article>

      {/* Back link */}
      <div style={{ marginTop: 40 }}>
        <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content || '');
}
function setOG(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content || '');
}
