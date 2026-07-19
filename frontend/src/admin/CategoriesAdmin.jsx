import { useEffect, useState } from 'react';
import api from '../api/client';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function load() {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return;
    try {
      await api.post('/categories', { name: name.trim() });
      setName('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la création.");
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette catégorie ? Les articles associés perdront leur catégorie.')) return;
    await api.delete(`/categories/${id}`);
    load();
  }

  return (
    <div>
      <h1>Catégories du blog</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Créez ici les catégories qui apparaîtront dans le menu déroulant lors de la rédaction d'un article.
      </p>

      <form onSubmit={handleAdd} className="card" style={{ padding: 20, display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24, maxWidth: 480 }}>
        <div style={{ flex: 1 }}>
          <label>Nom de la catégorie</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Bien-être, Événements…" />
        </div>
        <button type="submit" className="btn btn-primary">Ajouter</button>
      </form>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14, marginTop: -12, marginBottom: 16 }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', maxWidth: 480 }}>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: 10 }}>{c.name}</td>
              <td style={{ padding: 10, textAlign: 'right' }}>
                <button className="btn btn-outline" onClick={() => handleDelete(c.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr><td style={{ padding: 10, color: 'var(--text-muted)' }}>Aucune catégorie pour le moment.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
