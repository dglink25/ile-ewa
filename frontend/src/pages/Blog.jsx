import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Blog() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.get('/articles/public').then(({ data }) => setArticles(data.articles));
  }, []);

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <h1>Blog</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, marginTop: 32 }}>
        {articles.map((a) => (
          <Link to={`/blog/${a.slug}`} key={a.id} className="card" style={{ overflow: 'hidden' }}>
            {a.cover_image_url && (
              <img src={a.cover_image_url} alt={a.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
            )}
            <div style={{ padding: 16 }}>
              {a.category_name && <span style={{ fontSize: 12, color: 'var(--accent)' }}>{a.category_name}</span>}
              <h3 style={{ margin: '6px 0' }}>{a.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{a.excerpt}</p>
            </div>
          </Link>
        ))}
        {articles.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aucun article publié pour le moment.</p>}
      </div>
    </div>
  );
}
