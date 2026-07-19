import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Reveal from '../components/Reveal';

/* ── Mini-carousel hero pour les 3 derniers articles en vedette ── */
function ActualitesHero({ articles }) {
  const [index, setIndex] = useState(0);
  const featured = articles.slice(0, 3);

  useEffect(() => {
    if (featured.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % featured.length), 5500);
    return () => clearInterval(t);
  }, [featured.length]);

  if (!featured.length) return null;

  return (
    <section style={{ position: 'relative', minHeight: 'clamp(320px, 50vw, 520px)', overflow: 'hidden' }}>
      {featured.map((a, i) => (
        <div
          key={a.id}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: 'opacity 1.2s ease',
            pointerEvents: i === index ? 'auto' : 'none',
            backgroundImage: a.cover_image_url
              ? `linear-gradient(180deg, rgba(20,17,15,0.55) 0%, var(--bg) 95%), url(${a.cover_image_url})`
              : 'linear-gradient(135deg, var(--bg-elevated), var(--bg))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div className="container" style={{ maxWidth: 760, padding: 'clamp(60px, 10vw, 100px) 24px clamp(40px, 6vw, 60px)' }}>
            {a.category_name && (
              <span style={{
                display: 'inline-block', background: 'var(--accent)', color: 'var(--accent-contrast)',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '4px 12px', borderRadius: 20, marginBottom: 16,
              }}>
                {a.category_name}
              </span>
            )}
            <h1 style={{ fontSize: 'clamp(26px, 5vw, 46px)', lineHeight: 1.15, marginBottom: 16 }}>{a.title}</h1>
            {a.excerpt && (
              <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 28px' }}>
                {a.excerpt}
              </p>
            )}
            <Link to={`/actualites/${a.slug}`} className="btn btn-primary">Lire l'article</Link>
          </div>
        </div>
      ))}

      {/* Indicateurs */}
      {featured.length > 1 && (
        <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 2 }}>
          {featured.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Article ${i + 1}`}
              style={{
                width: i === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: i === index ? 'var(--accent)' : 'rgba(255,255,255,0.35)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Carte article ── */
function ArticleCard({ article, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <Link
        to={`/actualites/${article.slug}`}
        className="card card-hover"
        style={{ display: 'block', overflow: 'hidden', height: '100%' }}
      >
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            style={{ width: '100%', height: 180, objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: 180,
            background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 32 }}>✦</span>
          </div>
        )}
        <div style={{ padding: '16px 20px 20px' }}>
          {article.category_name && (
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--accent)',
            }}>
              {article.category_name}
            </span>
          )}
          <h3 style={{ margin: '8px 0 8px', fontSize: 17, lineHeight: 1.3 }}>{article.title}</h3>
          {article.excerpt && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              {article.excerpt.length > 100 ? article.excerpt.slice(0, 100) + '…' : article.excerpt}
            </p>
          )}
          {article.author_name && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, marginBottom: 0 }}>
              Par {article.author_name}
            </p>
          )}
        </div>
      </Link>
    </Reveal>
  );
}

/* ── Page principale ── */
export default function Actualites() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/articles/public')
      .then(({ data }) => setArticles(data.articles || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container" style={{ padding: 100, textAlign: 'center' }}>Chargement…</div>;
  }

  const rest = articles.slice(3);

  return (
    <div>
      {/* Hero carousel avec les 3 premières actualités */}
      <ActualitesHero articles={articles} />

      {/* Grille du reste des articles */}
      <section className="container" style={{ padding: '60px 24px 100px' }}>
        {rest.length > 0 ? (
          <>
            <Reveal>
              <h2 style={{ marginBottom: 32 }}>Toutes les actualités</h2>
            </Reveal>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 28,
            }}>
              {rest.map((a, i) => (
                <ArticleCard key={a.id} article={a} delay={i * 0.05} />
              ))}
            </div>
          </>
        ) : articles.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
            Aucune actualité publiée pour le moment.
          </p>
        ) : null}
      </section>
    </div>
  );
}
