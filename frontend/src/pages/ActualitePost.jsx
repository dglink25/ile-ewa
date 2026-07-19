import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

export default function ActualitePost() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/articles/public/${slug}`)
      .then(({ data }) => setArticle(data.article))
      .catch(() => setError('Article introuvable.'));
  }, [slug]);

  if (error) return (
    <div className="container" style={{ padding: 60 }}>
      <p>{error}</p>
      <Link to="/actualites" style={{ color: 'var(--accent)' }}>← Retour aux actualités</Link>
    </div>
  );
  if (!article) return (
    <div className="container" style={{ padding: 60, textAlign: 'center' }}>
      <p>Chargement…</p>
    </div>
  );

  return (
    <div>
      {/* Hero de l'article */}
      <div style={{
        minHeight: 'clamp(240px, 35vw, 380px)',
        backgroundImage: article.cover_image_url
          ? `linear-gradient(180deg, rgba(20,17,15,0.5) 0%, var(--bg) 100%), url(${article.cover_image_url})`
          : 'linear-gradient(135deg, var(--bg-elevated), var(--bg))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: 'clamp(28px, 5vw, 48px)',
      }}>
        <div className="container" style={{ maxWidth: 780 }}>
          {article.category_name && (
            <span style={{
              display: 'inline-block', background: 'var(--accent)', color: 'var(--accent-contrast)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 12px', borderRadius: 20, marginBottom: 16,
            }}>
              {article.category_name}
            </span>
          )}
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 40px)', marginBottom: 12 }}>{article.title}</h1>
          {article.author_name && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>Par {article.author_name}</p>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="container" style={{ maxWidth: 780, padding: '48px 24px 80px' }}>
        <Link
          to="/actualites"
          style={{ fontSize: 14, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 32 }}
        >
          ← Retour aux actualités
        </Link>
        <div
          style={{ lineHeight: 1.8, fontSize: 16 }}
          dangerouslySetInnerHTML={{ __html: article.content_html }}
        />
      </div>
    </div>
  );
}
