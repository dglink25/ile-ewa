import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

export default function DynamicPage({ fixedSlug }) {
  const params = useParams();
  const slug = fixedSlug || params.slug;
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPage(null);
    setError(null);
    api.get(`/pages/public/${slug}`)
      .then(({ data }) => setPage(data.page))
      .catch(() => setError("Cette page n'existe pas encore."));
  }, [slug]);

  if (error) return <div className="container" style={{ padding: 60 }}><p>{error}</p></div>;
  if (!page) return <div className="container" style={{ padding: 60 }}><p>Chargement…</p></div>;

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: 860 }}>
      <h1>{page.title}</h1>
      {page.cover_image_url && (
        <img src={page.cover_image_url} alt={page.title} style={{ width: '100%', borderRadius: 12, marginBottom: 24 }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: page.content_html }} />
    </div>
  );
}
