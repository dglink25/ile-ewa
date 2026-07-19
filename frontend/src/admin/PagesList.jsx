import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function PagesList() {
  const [pages, setPages] = useState([]);

  function load() {
    api.get('/pages').then(({ data }) => setPages(data.pages));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm('Supprimer cette page ?')) return;
    await api.delete(`/pages/${id}`);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Pages du site</h1>
        <Link to="/admin/pages/nouvelle" className="btn btn-primary">+ Nouvelle page</Link>
      </div>

      <div style={{ overflowX: 'auto', marginTop: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: 10 }}>Titre</th>
            <th style={{ padding: 10 }}>Statut</th>
            <th style={{ padding: 10 }}></th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: 10 }}>{p.title}</td>
              <td style={{ padding: 10 }}>
                <span style={{ color: p.status === 'published' ? 'var(--success)' : 'var(--text-muted)' }}>
                  {p.status === 'published' ? 'Publiée' : 'Brouillon'}
                </span>
              </td>
              <td style={{ padding: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/admin/pages/${p.id}`} className="btn btn-outline">Modifier</Link>
                  <button className="btn btn-outline" onClick={() => handleDelete(p.id)}>Supprimer</button>
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
