import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function ArticlesList() {
  const [articles, setArticles] = useState([]);

  function load() {
    api.get('/articles').then(({ data }) => setArticles(data.articles));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm('Supprimer cet article ?')) return;
    await api.delete(`/articles/${id}`);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Blog / Articles</h1>
        <Link to="/admin/articles/nouveau" className="btn btn-primary">+ Nouvel article</Link>
      </div>

      <div style={{ overflowX: 'auto', marginTop: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: 10 }}>Titre</th>
            <th style={{ padding: 10 }}>Catégorie</th>
            <th style={{ padding: 10 }}>Statut</th>
            <th style={{ padding: 10 }}></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: 10 }}>{a.title}</td>
              <td style={{ padding: 10 }}>{a.category_name || '—'}</td>
              <td style={{ padding: 10 }}>
                <span style={{ color: a.status === 'published' ? 'var(--success)' : 'var(--text-muted)' }}>
                  {a.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
              </td>
              <td style={{ padding: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/admin/articles/${a.id}`} className="btn btn-outline">Modifier</Link>
                  <button className="btn btn-outline" onClick={() => handleDelete(a.id)}>Supprimer</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
