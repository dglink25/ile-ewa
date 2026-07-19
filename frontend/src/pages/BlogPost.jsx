import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

export default function BlogPost() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/articles/public/${slug}`)
      .then(({ data }) => setArticle(data.article))
      .catch(() => setError('Article introuvable.'));
  }, [slug]);

  if (error) return <div className="container" style={{ padding: 60 }}><p>{error}</p></div>;
  if (!article) return <div className="container" style={{ padding: 60 }}><p>Chargement…</p></div>;

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: 780 }}>
      {article.category_name && <span style={{ color: 'var(--accent)', fontSize: 13 }}>{article.category_name}</span>}
      <h1>{article.title}</h1>
      {article.author_name && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Par {article.author_name}</p>}
      {article.cover_image_url && (
        <img src={article.cover_image_url} alt={article.title} style={{ width: '100%', borderRadius: 12, margin: '16px 0' }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: article.content_html }} />
    </div>
  );
}
