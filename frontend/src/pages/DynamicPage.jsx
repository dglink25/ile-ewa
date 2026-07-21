import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api from '../api/client';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';
import SchemaOrg, { schemaBreadcrumb } from '../components/SchemaOrg';

/* ── Bandeau séparateur de section ── */
function SectionBanner({ title, index }) {
  return (
    <div style={{
      background: 'var(--accent)',
      color: 'var(--accent-contrast)',
      textAlign: 'center',
      padding: '18px 24px',
    }}>
      <span style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>
        {title}
      </span>
    </div>
  );
}

/* ── Héros de section avec image de fond plein-largeur ── */
function SectionHero({ section, index }) {
  return (
    <section
      id={section.anchor}
      className="section-hero"
      style={{
        scrollMarginTop: 80,
        position: 'relative',
        minHeight: section.image_url ? 'clamp(300px, 45vw, 520px)' : 'auto',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: section.image_url
          ? `linear-gradient(180deg, rgba(20,17,15,0.5) 0%, var(--bg) 100%), url(${section.image_url})`
          : undefined,
        backgroundColor: !section.image_url
          ? (index % 2 === 0 ? 'var(--bg)' : 'var(--bg-elevated)')
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: section.image_url ? 'fixed' : undefined,
      }}
    >
      <div className="container" style={{ maxWidth: 820, padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <Reveal delay={index * 0.04}>
          {section.content_html && (
            <div
              style={{ lineHeight: 1.8, fontSize: 16 }}
              dangerouslySetInnerHTML={{ __html: section.content_html }}
            />
          )}
        </Reveal>
      </div>
    </section>
  );
}

export default function DynamicPage({ fixedSlug }) {
  const params = useParams();
  const location = useLocation();
  const slug = fixedSlug || params.slug;
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPage(null); setSections([]); setError(null);
    api.get(`/pages/public/${slug}`)
      .then(({ data }) => {
        setPage(data.page);
        try {
          const parsed = JSON.parse(data.page.sections || '[]');
          if (Array.isArray(parsed)) setSections(parsed);
        } catch { setSections([]); }
      })
      .catch(() => setError("Cette page n'existe pas encore."));
  }, [slug]);

  /* Défilement fluide vers l'ancre */
  useEffect(() => {
    if (!page || !location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }, [page, location.hash]);

  if (error) return <div className="container" style={{ padding: 60 }}><p>{error}</p></div>;
  if (!page) return <div className="container" style={{ padding: 60 }}><p>Chargement…</p></div>;

  const hasSections = sections.length > 0;

  return (
    <div>
      <SEO
        title={page.title}
        description={page.content_html
          ? page.content_html.replace(/<[^>]*>/g, '').slice(0, 155)
          : `Découvrez la page ${page.title} sur le portail Ilé Ẹwà.`}
        image={page.cover_image_url || undefined}
        url={`/${slug}`}
      />
      <SchemaOrg schema={schemaBreadcrumb([
        { name: 'Accueil', url: '/' },
        { name: page.title, url: `/${slug}` },
      ])} />
      {/* ── Hero principal de la page ── */}
      <div style={{
        position: 'relative',
        minHeight: page.cover_image_url ? 'clamp(280px, 40vw, 480px)' : 180,
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: 'clamp(32px, 5vw, 56px)',
        backgroundImage: page.cover_image_url
          ? `linear-gradient(180deg, rgba(20,17,15,0.45) 0%, var(--bg) 100%), url(${page.cover_image_url})`
          : undefined,
        backgroundColor: !page.cover_image_url ? 'var(--bg-elevated)' : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="container" style={{ maxWidth: 860, padding: '40px 24px 0' }}>
          <Reveal>
            <h1 style={{ fontSize: 'clamp(28px, 6vw, 52px)', marginBottom: 0 }}>{page.title}</h1>
          </Reveal>
        </div>
      </div>

      {/* Intro texte (content_html de la page elle-même) */}
      {page.content_html && (
        <section className="container" style={{ maxWidth: 820, padding: '48px 24px' }}>
          <Reveal delay={0.1}>
            <div
              style={{ lineHeight: 1.8, fontSize: 16 }}
              dangerouslySetInnerHTML={{ __html: page.content_html }}
            />
          </Reveal>
        </section>
      )}

      {/* ── Sections avec bandeau titre + héros ── */}
      {sections.map((section, index) => (
        <div key={section.id || section.anchor}>
          {/* Bandeau séparateur */}
          {section.title && <SectionBanner title={section.title} index={index} />}
          {/* Héros de la section */}
          <SectionHero section={section} index={index} />
        </div>
      ))}
    </div>
  );
}
