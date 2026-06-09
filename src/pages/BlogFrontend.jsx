import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublishedBlogs } from '../store/slices/blogSlice';

const SITE_NAME = 'HY Nutrition';
const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://hy-nutrition.com';

function SEOMeta({ title, description, url, image }) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setOG('og:title', title);
    setOG('og:description', description);
    setOG('og:url', url);
    setOG('og:type', 'website');
    setOG('og:site_name', SITE_NAME);
    if (image) setOG('og:image', image);
    setOG('twitter:card', 'summary_large_image');
    setOG('twitter:title', title);
    setOG('twitter:description', description);
    if (image) setOG('twitter:image', image);
    return () => { document.title = SITE_NAME; };
  }, [title, description, url, image]);
  return null;
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

export default function BlogFrontend() {
  const dispatch = useDispatch();
  const { published, loading } = useSelector(s => s.blogs);
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const category = searchParams.get('category');

  useEffect(() => {
    dispatch(fetchPublishedBlogs({ tag, category }));
  }, [dispatch, tag, category]);

  const pageTitle = `Blog${category ? ` – ${category}` : ''}${tag ? ` – #${tag}` : ''} | ${SITE_NAME}`;
  const pageDesc = `Expert nutrition tips, fitness guides, and healthy recipes from ${SITE_NAME}.`;

  return (
    <>
      <SEOMeta title={pageTitle} description={pageDesc} url={`${SITE_URL}/blog`} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        {/* Page Header */}
        <header style={{ textAlign: 'center', marginBottom: 52 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#111', lineHeight: 1.2 }}>
            HY Nutrition Blog
          </h1>
          <p style={{ color: '#6b7280', fontSize: 18, marginTop: 12, maxWidth: 520, margin: '12px auto 0' }}>
            Expert insights on nutrition, fitness, and healthy living
          </p>
          {(tag || category) && (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
              {category && <FilterBadge label={`Category: ${category}`} href="/blog" />}
              {tag && <FilterBadge label={`#${tag}`} href="/blog" />}
            </div>
          )}
        </header>

        {loading ? (
          <div className="spinner" />
        ) : published.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <p style={{ fontSize: 18 }}>No posts found.</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {!tag && !category && published[0] && <FeaturedPost post={published[0]} />}

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28, marginTop: 40 }}>
              {published.slice(!tag && !category ? 1 : 0).map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function FeaturedPost({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 8, background: '#fff', border: '1px solid #f0f0f0' }}>
      <article style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 340 }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {post.featuredImage
            ? <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#f59e0b20,#ef444420)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>📰</div>
          }
          <div style={{ position: 'absolute', top: 14, left: 14 }}>
            <span style={{ background: '#f59e0b', color: '#000', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>FEATURED</span>
          </div>
        </div>
        <div style={{ padding: '36px 36px 28px' }}>
          {post.category && <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{post.category}</div>}
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', lineHeight: 1.3, marginBottom: 14 }}>{post.title}</h2>
          <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: 15, marginBottom: 20 }}>{post.excerpt}</p>
          <PostMeta post={post} />
        </div>
      </article>
    </Link>
  );
}

function PostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <article style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}>
        <div style={{ height: 200, overflow: 'hidden', flexShrink: 0 }}>
          {post.featuredImage
            ? <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} loading="lazy" />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#f59e0b15,#ef444415)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📰</div>
          }
        </div>
        <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {post.category && <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{post.category}</span>}
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', lineHeight: 1.35, margin: '8px 0 10px' }}>{post.title}</h3>
          {post.excerpt && <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, flex: 1, marginBottom: 14 }}>{post.excerpt.slice(0, 120)}{post.excerpt.length > 120 ? '...' : ''}</p>}
          <PostMeta post={post} compact />
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
              {post.tags.slice(0, 3).map(t => (
                <span key={t} style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>#{t}</span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

function PostMeta({ post, compact }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 10 : 14, color: '#9ca3af', fontSize: compact ? 12 : 13 }}>
      <span>✍️ {post.author || 'Admin'}</span>
      <span>·</span>
      <span>📅 {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
    </div>
  );
}

function FilterBadge({ label, href }) {
  return (
    <Link to={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f3f4f6', color: '#374151', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
      {label} <span style={{ fontSize: 16 }}>✕</span>
    </Link>
  );
}
