import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/client';
import RichTextEditor from '../components/RichTextEditor';
import ImageInput from '../components/ImageInput';
import { slugify } from '../utils/slugify';

function emptySection() {
  return {
    id: crypto.randomUUID(),
    title: '',
    anchor: '',
    image_url: '',
    content_html: '',
  };
}

export default function PageEditor() {
  const { id } = useParams();
  const isNew = id === 'nouvelle';
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content_html: '', cover_image_url: '', status: 'draft' });
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      api.get(`/pages/${id}`).then(({ data }) => {
        setForm(data.page);
        try {
          const parsed = JSON.parse(data.page.sections || '[]');
          if (Array.isArray(parsed)) setSections(parsed);
        } catch {
          setSections([]);
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  function updateSection(sectionId, patch) {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)));
  }

  function addSection() {
    setSections((prev) => [...prev, emptySection()]);
  }

  function removeSection(sectionId) {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }

  function moveSection(index, direction) {
    setSections((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Génère automatiquement une ancre unique pour chaque section (utilisée par le menu déroulant du header)
    const usedAnchors = new Set();
    const finalSections = sections.map((s) => {
      let anchor = slugify(s.title || 'section');
      let candidate = anchor;
      let i = 1;
      while (usedAnchors.has(candidate)) candidate = `${anchor}-${i++}`;
      usedAnchors.add(candidate);
      return { ...s, anchor: candidate };
    });

    const payload = { ...form, sections: JSON.stringify(finalSections) };

    if (isNew) await api.post('/pages', payload);
    else await api.put(`/pages/${id}`, payload);

    navigate('/admin/pages');
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div>
      <h1>{isNew ? 'Nouvelle page' : 'Modifier la page'}</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: 'grid', gap: 20, maxWidth: 780 }}>
        <div>
          <label>Titre</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <ImageInput
          label="Image de couverture (en haut de page)"
          value={form.cover_image_url}
          onChange={(url) => setForm({ ...form, cover_image_url: url })}
        />
        <div>
          <label>Texte d'introduction (facultatif, affiché avant les sections)</label>
          <RichTextEditor value={form.content_html} onChange={(html) => setForm({ ...form, content_html: html })} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Sections avec image de fond</h2>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Apparaissent aussi dans le menu déroulant du header
          </span>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          {sections.map((section, index) => (
            <div key={section.id} className="card" style={{ padding: 20, display: 'grid', gap: 14, background: 'var(--bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 14 }}>Section {index + 1}</strong>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-outline" onClick={() => moveSection(index, -1)} disabled={index === 0}>↑</button>
                  <button type="button" className="btn btn-outline" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1}>↓</button>
                  <button type="button" className="btn btn-outline" onClick={() => removeSection(section.id)}>Supprimer</button>
                </div>
              </div>

              <div>
                <label>Titre de la section</label>
                <input value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
              </div>
              <ImageInput
                label="Image de fond de cette section"
                value={section.image_url}
                onChange={(url) => updateSection(section.id, { image_url: url })}
              />
              <div>
                <label>Contenu</label>
                <RichTextEditor
                  value={section.content_html}
                  onChange={(html) => updateSection(section.id, { content_html: html })}
                />
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-outline" onClick={addSection} style={{ justifySelf: 'start' }}>
          + Ajouter une section
        </button>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />

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
