import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/client';
import RichTextEditor from '../components/RichTextEditor';
import ImageInput from '../components/ImageInput';

export default function PageEditor() {
  const { id } = useParams();
  const isNew = id === 'nouvelle';
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content_html: '', cover_image_url: '', status: 'draft' });
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      api.get(`/pages/${id}`).then(({ data }) => { setForm(data.page); setLoading(false); });
    }
  }, [id, isNew]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isNew) {
      await api.post('/pages', form);
    } else {
      await api.put(`/pages/${id}`, form);
    }
    navigate('/admin/pages');
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div>
      <h1>{isNew ? 'Nouvelle page' : 'Modifier la page'}</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: 'grid', gap: 20, maxWidth: 760 }}>
        <div>
          <label>Titre</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
            <option value="published">Publiée</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary">Enregistrer</button>
          <Link to="/admin/pages" className="btn btn-outline">Fermer</Link>
        </div>
      </form>
    </div>
  );
}
