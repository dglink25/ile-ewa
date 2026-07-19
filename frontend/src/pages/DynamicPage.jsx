import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api from '../api/client';
import Reveal from '../components/Reveal';

export default function DynamicPage({ fixedSlug }) {
  const params = useParams();
  const location = useLocation();
  const slug = fixedSlug || params.slug;
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPage(null);
    setSections([]);
    setError(null);
    api.get(`/pages/public/${slug}`)
      .then(({ data }) => {
        setPage(data.page);
        try {
          const parsed = JSON.parse(data.page.sections || '[]');
          if (Array.isArray(parsed)) setSections(parsed);
        } catch {
          setSections([]);
        }
      })
      .catch(() => setError("Cette page n'existe pas encore."));
  }, [slug]);

  // Défilement fluide vers la section demandée via l'ancre (#anchor) dans l'URL
  useEffect(() => {
    if (!page || !location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [page, location.hash]);

  if (error) return <div className="container" style={{ padding: 60 }}><p>{error}</p></div>;
  if (!page) return <div className="container" style={{ padding: 60 }}><p>Chargement…</p></div>;

  return (
    <div>
      <div className="container" style={{ padding: '60px 24px 20px', maxWidth: 860 }}>
        <Reveal>
          <h1>{page.title}</h1>
        </Reveal>
        {page.cover_image_url && (
          <Reveal delay={0.1}>
            <img src={page.cover_image_url} alt={page.title} style={{ width: '100%', borderRadius: 12, margin: '16px 0' }} />
          </Reveal>
        )}
        {page.content_html && (
          <Reveal delay={0.15}>
            <div dangerouslySetInnerHTML={{ __html: page.content_html }} />
          </Reveal>
        )}
      </div>

      {sections.map((section, index) => (
        <section
          key={section.id || section.anchor}
          id={section.anchor}
          style={{
            scrollMarginTop: 90,
            padding: '80px 24px',
            backgroundImage: section.image_url
              ? `linear-gradient(180deg, rgba(20,17,15,0.6), var(--bg) 96%), url(${section.image_url})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="container" style={{ maxWidth: 780 }}>
            <Reveal delay={index * 0.05}>
              {section.title && <h2 style={{ marginBottom: 20 }}>{section.title}</h2>}
              {section.content_html && <div dangerouslySetInnerHTML={{ __html: section.content_html }} />}
            </Reveal>
          </div>
        </section>
      ))}
    </div>
  );
}
