import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/client';
import RichTextEditor from '../components/RichTextEditor';
import ImageInput from '../components/ImageInput';

export default function ArticleEditor() {
  const { id } = useParams();
  const isNew = id === 'nouveau';
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', excerpt: '', content_html: '', cover_image_url: '', category_id: '', status: 'draft',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
    if (!isNew) {
      api.get(`/articles/${id}`).then(({ data }) => { setForm(data.article); setLoading(false); });
    }
  }, [id, isNew]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isNew) await api.post('/articles', form);
    else await api.put(`/articles/${id}`, form);
    navigate('/admin/articles');
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div>
      <h1>{isNew ? 'Nouvel article' : "Modifier l'article"}</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: 'grid', gap: 20, maxWidth: 760 }}>
        <div>
          <label>Titre</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label>Résumé (affiché dans la liste)</label>
          <textarea rows={2} value={form.excerpt || ''} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </div>
        <div>
          <label>Catégorie</label>
          <select value={form.category_id || ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">— Aucune —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            <Link to="/admin/categories">
              {categories.length === 0 ? 'Aucune catégorie : cliquez ici pour en créer une' : 'Gérer les catégories'}
            </Link>
          </p>
        </div>
        <ImageInput
          label="Image de couverture"
          value={form.cover_image_url}
          onChange={(url) => setForm({ ...form, cover_image_url: url })}
        />
        <div>
          <label>Contenu</label>
          <RichTextEditor value={form.content_html} onChange={(html) => setForm({ ...form, content_html: html })} />
        </div>
        <div>
          <label>Statut</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary">Enregistrer</button>
          <Link to="/admin/articles" className="btn btn-outline">Fermer</Link>
        </div>
      </form>
    </div>
  );
}
