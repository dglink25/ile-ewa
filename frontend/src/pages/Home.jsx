import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import HeroCarousel from '../components/HeroCarousel';

const DEFAULT_SLIDE = {
  id: 'default',
  image_url: '',
  title: 'Ilé Ẹwà',
  subtitle: "La maison de la beauté et de l'harmonie — un cercle de membres, de savoirs et de rencontres.",
  quote: '',
  cta_text: 'Rejoindre le cercle',
  cta_link: '/inscription',
};

export default function Home() {
  const [settings, setSettings] = useState({});
  const [slides, setSlides] = useState([DEFAULT_SLIDE]);
  const [profiles, setProfiles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/settings'),
      api.get('/profiles/public'),
      api.get('/articles/public'),
    ]).then(([settingsRes, profilesRes, articlesRes]) => {
      const loaded = settingsRes.data.settings || {};
      setSettings(loaded);

      if (loaded.home_slides) {
        try {
          const parsed = JSON.parse(loaded.home_slides);
          if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
        } catch {
          // valeur invalide -> on garde la diapositive par défaut
        }
      }

      setProfiles((profilesRes.data.profiles || []).slice(0, 3));
      setArticles((articlesRes.data.articles || []).slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container" style={{ padding: 100, textAlign: 'center' }}>Chargement…</div>;
  }

  return (
    <div>
      <HeroCarousel slides={slides} />

      {/* INTRODUCTION (texte libre, éditable depuis Admin → Paramètres) */}
      {settings.home_intro_html && (
        <section className="container" style={{ maxWidth: 760, padding: '60px 24px 80px', textAlign: 'center' }}>
          <div dangerouslySetInnerHTML={{ __html: settings.home_intro_html }} />
        </section>
      )}

      {/* PILIERS DU SITE */}
      <section className="container" style={{ padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          <Link to="/presentation" className="card" style={{ padding: 28, display: 'block' }}>
            <h3 style={{ marginTop: 0 }}>Présentation</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Notre vision, nos valeurs et notre approche.</p>
          </Link>
          <Link to="/membres" className="card" style={{ padding: 28, display: 'block' }}>
            <h3 style={{ marginTop: 0 }}>Annuaire des membres</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Découvrez les praticien·ne·s et complices du cercle.</p>
          </Link>
          <Link to="/blog" className="card" style={{ padding: 28, display: 'block' }}>
            <h3 style={{ marginTop: 0 }}>Blog</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Articles, ressources et actualités du cercle.</p>
          </Link>
        </div>
      </section>

      {/* APERÇU ANNUAIRE DES MEMBRES */}
      {profiles.length > 0 && (
        <section className="container" style={{ padding: '0 24px 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <h2 style={{ margin: 0 }}>Les membres du cercle</h2>
            <Link to="/membres" style={{ fontSize: 14 }}>Voir tout l'annuaire →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {profiles.map((p) => (
              <Link to={`/membres/${p.slug}`} key={p.id} className="card" style={{ padding: 24, textAlign: 'center' }}>
                <img
                  src={p.avatar_url || 'https://placehold.co/100x100?text=%20'}
                  alt={p.display_name}
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }}
                />
                <h3 style={{ margin: '8px 0 4px' }}>{p.display_name}</h3>
                {p.city && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.city}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* APERÇU DU BLOG */}
      {articles.length > 0 && (
        <section className="container" style={{ padding: '0 24px 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <h2 style={{ margin: 0 }}>Derniers articles</h2>
            <Link to="/blog" style={{ fontSize: 14 }}>Voir tout le blog →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {articles.map((a) => (
              <Link to={`/blog/${a.slug}`} key={a.id} className="card" style={{ overflow: 'hidden' }}>
                {a.cover_image_url && (
                  <img src={a.cover_image_url} alt={a.title} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                )}
                <div style={{ padding: 16 }}>
                  {a.category_name && <span style={{ fontSize: 12, color: 'var(--accent)' }}>{a.category_name}</span>}
                  <h3 style={{ margin: '6px 0' }}>{a.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{a.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TÉMOIGNAGES (texte libre, éditable depuis Admin → Paramètres) */}
      {settings.home_testimonials_html && (
        <section className="container" style={{ padding: '0 24px 80px', maxWidth: 820 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Ils en parlent</h2>
          <div
            className="card"
            style={{ padding: 32, fontStyle: 'italic' }}
            dangerouslySetInnerHTML={{ __html: settings.home_testimonials_html }}
          />
        </section>
      )}

      {/* APPEL À REJOINDRE */}
      <section className="container" style={{ padding: '0 24px 100px', textAlign: 'center' }}>
        <div className="card" style={{ padding: 48, background: 'var(--bg-elevated)' }}>
          <h2 style={{ marginTop: 0 }}>Envie de nous rejoindre ?</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 24px' }}>
            Créez votre compte pour rejoindre le cercle et, une fois votre fiche validée, apparaître dans l'annuaire public.
          </p>
          <Link to="/inscription" className="btn btn-primary">Créer mon compte</Link>
        </div>
      </section>
    </div>
  );
}
