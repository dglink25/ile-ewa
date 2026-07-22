import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';
import SchemaOrg, { schemaBreadcrumb } from '../components/SchemaOrg';

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
const BLOG_HERO_FALLBACK = 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1600&q=80&auto=format&fit=crop';

function BlogHero({ settings }) {
  const bg = settings?.blog_hero_image || BLOG_HERO_FALLBACK;

  return (
    <section style={{
      position: 'relative',
      minHeight: 'clamp(300px, 42vw, 440px)',
      display: 'flex',
      alignItems: 'flex-end',
      overflow: 'hidden',
    }}>
      {/* Image de fond */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: 'scale(1.04)',
        transition: 'transform 8s ease',
      }} />

      {/* Overlay dégradé sombre */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(10,8,6,0.35) 0%, rgba(10,8,6,0.78) 100%)',
      }} />

      {/* Ligne accent bas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 4, background: 'var(--accent)', zIndex: 2,
      }} />

      <div className="container" style={{
        padding: 'clamp(40px, 6vw, 64px) 24px clamp(40px, 5vw, 56px)',
        position: 'relative', zIndex: 1,
      }}>
        <Reveal>
          {/* Étiquette */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent)', color: 'var(--accent-contrast)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', padding: '5px 14px',
            borderRadius: 20, marginBottom: 16,
          }}>
            <IcoPen /> Formations
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            color: '#fff',
            margin: '0 0 12px',
            textShadow: '0 2px 20px rgba(0,0,0,0.6)',
            lineHeight: 1.15,
          }}>
            {settings?.blog_title || 'Formations'}
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: 'rgba(255,255,255,0.8)',
            margin: 0,
            maxWidth: 560,
            textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            lineHeight: 1.6,
          }}>
            {settings?.blog_subtitle || 'Toutes nos formations, ressources et réflexions du cercle Ilé Ẹwà.'}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function IcoPen() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
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
  const [search, setSearch] = useState('');

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

  /* Filtrage catégorie + recherche texte */
  const byCat = activeCat === 'tout'
    ? articles
    : articles.filter((a) => a.category_slug === activeCat || a.category_name === activeCat);

  const filtered = search.trim()
    ? byCat.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.excerpt || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.author_name || '').toLowerCase().includes(search.toLowerCase()),
      )
    : byCat;

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
      <SEO
        title="Formations"
        description="Découvrez toutes les formations, ressources et publications du cercle Ilé Ẹwà."
        url="/blog"
      />
      <SchemaOrg schema={schemaBreadcrumb([
        { name: 'Accueil', url: '/' },
        { name: 'Formations', url: '/blog' },
      ])} />

      {/* ── Hero ── */}
      <BlogHero settings={settings} />

      {/* ── Espace + onglets catégories ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        position: 'sticky', top: 72, zIndex: 50,
        marginTop: 0,
      }}>
        <div className="container" style={{ padding: '0 24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', minWidth: 'max-content' }}>
            <button onClick={() => setCategorie('tout')} style={tabStyle(activeCat === 'tout')}>
              Toutes les formations
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setCategorie(cat.slug)}
                style={tabStyle(activeCat === cat.slug || activeCat === cat.name)}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section Rechercher une formation ── */}
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: 'clamp(24px, 4vw, 40px) 24px' }}>
        <div className="container">
          <h2 style={{ margin: '0 0 20px', fontSize: 'clamp(20px, 3vw, 28px)' }}>
            Rechercher une formation
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>

            {/* Filtre catégorie */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }}>
                <IcoFilter />
              </div>
              <select
                value={activeCat}
                onChange={(e) => setCategorie(e.target.value)}
                style={{ paddingLeft: 38, cursor: 'pointer', appearance: 'none', fontWeight: 500 }}
              >
                <option value="tout">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Recherche texte */}
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }}>
                <IcoSearch />
              </div>
              <input
                type="text"
                placeholder="Recherchez par formateur ou titre de formation"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>

            {/* Bouton */}
            <button
              className="btn btn-primary"
              style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => {}}
            >
              <IcoSearch /> Rechercher
            </button>
          </div>

          {/* Compteur résultats */}
          {(search || activeCat !== 'tout') && (
            <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> formation{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
              {search && <span> pour « {search} »</span>}
              {activeCat !== 'tout' && <span> · {categories.find((c) => c.slug === activeCat)?.name}</span>}
              <button
                onClick={() => { setSearch(''); setCategorie('tout'); }}
                style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 13 }}
              >
                Réinitialiser
              </button>
            </p>
          )}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="container" style={{ padding: '48px 24px 100px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 16 }}>Aucune formation ne correspond à votre recherche.</p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setCategorie('tout'); }} style={{ marginTop: 16 }}>
              Voir toutes les formations
            </button>
          </div>
        )}

        {/* Formation vedette */}
        {featured && (
          <div style={{ marginBottom: 48 }}>
            <ArticleCardFeatured article={featured} />
          </div>
        )}

        {/* Grille */}
        {rest.length > 0 && (
          <>
            <Reveal>
              <h2 style={{ fontSize: 18, marginBottom: 24, color: 'var(--text-muted)', fontWeight: 600 }}>
                {activeCat === 'tout'
                  ? 'Formations par ordre chronologique'
                  : categories.find((c) => c.slug === activeCat)?.name || activeCat
                }
              </h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 28 }}>
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

function tabStyle(active) {
  return {
    padding: '14px 20px', fontSize: 13, fontWeight: 600,
    border: 'none', background: 'none', cursor: 'pointer',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'color 0.15s ease, border-color 0.15s ease',
    whiteSpace: 'nowrap',
  };
}

function IcoFilter() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
}

function IcoSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
