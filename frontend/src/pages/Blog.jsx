import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import Reveal from '../components/Reveal';

/* ── Icônes ── */
function IcoArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IcoClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ── Hero statique plein-largeur ── */
function BlogHero({ settings }) {
  const bg = settings?.blog_hero_image || '';
  return (
    <section style={{
      position: 'relative',
      minHeight: 'clamp(260px, 35vw, 380px)',
      display: 'flex',
      alignItems: 'flex-end',
      backgroundImage: bg
        ? `linear-gradient(to bottom, rgba(20,17,15,0.45) 0%, rgba(20,17,15,0.75) 100%), url(${bg})`
        : 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg) 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overflow: 'hidden',
    }}>
      {/* Overlay accent bas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 4, background: 'var(--accent)',
      }} />

      <div className="container" style={{ padding: 'clamp(32px, 5vw, 56px) 24px clamp(36px, 5vw, 52px)', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            color: bg ? '#fff' : 'var(--text)',
            margin: '0 0 10px',
            textShadow: bg ? '0 2px 12px rgba(0,0,0,0.5)' : 'none',
          }}>
            {settings?.blog_title || 'Blog'}
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: bg ? 'rgba(255,255,255,0.82)' : 'var(--text-muted)',
            margin: 0,
            maxWidth: 560,
            textShadow: bg ? '0 1px 6px rgba(0,0,0,0.4)' : 'none',
          }}>
            {settings?.blog_subtitle || 'Articles, ressources et réflexions du cercle Ilé Ẹwà.'}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Carte article layout horizontal (article vedette) ── */
function ArticleCardFeatured({ article }) {
  return (
    <Reveal>
      <Link
        to={`/blog/${article.slug}`}
        className="card card-hover"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', minHeight: 260 }}
      >
        <div style={{
          background: article.cover_image_url
            ? `url(${article.cover_image_url}) center/cover no-repeat`
            : 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
          minHeight: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {!article.cover_image_url && (
            <span style={{ fontSize: 48, opacity: 0.2 }}>✦</span>
          )}
        </div>
        <div style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {article.category_name && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10,
            }}>
              {article.category_name}
            </span>
          )}
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(17px, 2vw, 22px)', lineHeight: 1.3 }}>
            {article.title}
          </h2>
          {article.excerpt && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.65, margin: '0 0 20px' }}>
              {article.excerpt.length > 140 ? article.excerpt.slice(0, 140) + '…' : article.excerpt}
            </p>
          )}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
          }}>
            Lire l'article <IcoArrow />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

/* ── Carte article standard ── */
function ArticleCard({ article, delay = 0 }) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <Reveal delay={delay}>
      <Link
        to={`/blog/${article.slug}`}
        className="card card-hover"
        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
      >
        {/* Image */}
        {article.cover_image_url ? (
          <img src={article.cover_image_url} alt={article.title}
            style={{ width: '100%', height: 190, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: '100%', height: 190, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 36, opacity: 0.25 }}>✦</span>
          </div>
        )}

        <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {article.category_name && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8,
            }}>
              {article.category_name}
            </span>
          )}
          <h3 style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.35, flex: 1 }}>
            {article.title}
          </h3>
          {article.excerpt && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, margin: '0 0 14px' }}>
              {article.excerpt.length > 90 ? article.excerpt.slice(0, 90) + '…' : article.excerpt}
            </p>
          )}
          {/* Meta bas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginTop: 'auto' }}>
            <IcoClock />
            {date || 'À venir'}
            {article.author_name && <span>· {article.author_name}</span>}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════ */
export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCat = searchParams.get('categorie') || 'tout';

  useEffect(() => {
    Promise.all([
      api.get('/articles/public'),
      api.get('/categories'),
      api.get('/settings'),
    ]).then(([artRes, catRes, setRes]) => {
      setArticles(artRes.data.articles || []);
      setCategories(catRes.data.categories || []);
      setSettings(setRes.data.settings || {});
    }).finally(() => setLoading(false));
  }, []);

  /* Filtrage par catégorie */
  const filtered = activeCat === 'tout'
    ? articles
    : articles.filter((a) => a.category_slug === activeCat || a.category_name === activeCat);

  const [featured, ...rest] = filtered;

  function setCategorie(slug) {
    if (slug === 'tout') setSearchParams({});
    else setSearchParams({ categorie: slug });
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Chargement…</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero ── */}
      <BlogHero settings={settings} />

      {/* ── Barre de filtres ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        position: 'sticky',
        top: 64,
        zIndex: 50,
      }}>
        <div className="container" style={{ padding: '0 24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', minWidth: 'max-content' }}>
            {/* Tout */}
            <button
              onClick={() => setCategorie('tout')}
              style={{
                padding: '14px 20px',
                fontSize: 13, fontWeight: 600,
                border: 'none', background: 'none', cursor: 'pointer',
                color: activeCat === 'tout' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeCat === 'tout' ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Tout le blog
            </button>

            {/* Une catégorie par onglet */}
            {categories.map((cat) => {
              const isActive = activeCat === cat.slug || activeCat === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategorie(cat.slug)}
                  style={{
                    padding: '14px 20px',
                    fontSize: 13, fontWeight: 600,
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="container" style={{ padding: '48px 24px 100px' }}>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 16 }}>Aucun article dans cette catégorie pour le moment.</p>
            <button className="btn btn-outline" onClick={() => setCategorie('tout')} style={{ marginTop: 16 }}>
              Voir tout le blog
            </button>
          </div>
        )}

        {/* Article vedette (layout horizontal) */}
        {featured && (
          <div style={{ marginBottom: 48 }}>
            <ArticleCardFeatured article={featured} />
          </div>
        )}

        {/* Grille des autres articles */}
        {rest.length > 0 && (
          <>
            <Reveal>
              <h2 style={{ fontSize: 18, marginBottom: 24, color: 'var(--text-muted)', fontWeight: 600 }}>
                {activeCat === 'tout'
                  ? `Articles, RDV et Replays par ordre chronologique`
                  : `${categories.find((c) => c.slug === activeCat)?.name || activeCat}`
                }
              </h2>
            </Reveal>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: 28,
            }}>
              {rest.map((a, i) => (
                <ArticleCard key={a.id} article={a} delay={i * 0.04} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
