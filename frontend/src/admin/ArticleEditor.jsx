import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/client';
import RichTextEditor from '../components/RichTextEditor';
import ImageInput from '../components/ImageInput';

/* ── Icônes SVG inline ── */
function IcoPlus() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IcoTrash() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function IcoFile() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function IcoUpload() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
}
function IcoCalendar() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IcoTag() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function IcoEuro() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7 7 0 1 0 0 12"/></svg>;
}
function IcoQuestion() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

/* ── Section bloc avec titre ── */
function Section({ icon, title, children }) {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ── Mime → label lisible ── */
function mimeLabel(mime) {
  if (mime.startsWith('image/')) return 'Image';
  if (mime === 'application/pdf') return 'PDF';
  if (mime.includes('word')) return 'Word';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'Excel';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'PowerPoint';
  if (mime.includes('zip')) return 'Archive';
  return 'Fichier';
}

/* ── Couleur badge par type ── */
function mimeColor(mime) {
  if (mime === 'application/pdf') return '#e74c3c';
  if (mime.includes('word')) return '#2980b9';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return '#27ae60';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return '#e67e22';
  if (mime.startsWith('image/')) return '#8e44ad';
  return '#7f8c8d';
}

/* ── Taille lisible ── */
function humanSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

const EMPTY_FORM = {
  title: '', excerpt: '', content_html: '', cover_image_url: '', category_id: '', status: 'draft',
  start_date: '', end_date: '',
  is_free: true,
  price: '',
  has_promo: false, promo_price: '', promo_start: '', promo_end: '',
  supports: [],
  registration_questions: [],
};

export default function ArticleEditor() {
  const { id } = useParams();
  const isNew = id === 'nouveau';
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
    if (!isNew) {
      api.get(`/articles/${id}`).then(({ data }) => {
        const a = data.article;
        setForm({
          ...EMPTY_FORM,
          ...a,
          is_free: a.is_free === 1 || a.is_free === true,
          has_promo: a.has_promo === 1 || a.has_promo === true,
          supports: Array.isArray(a.supports) ? a.supports : [],
          registration_questions: Array.isArray(a.registration_questions) ? a.registration_questions : [],
          start_date: a.start_date ? a.start_date.slice(0, 10) : '',
          end_date: a.end_date ? a.end_date.slice(0, 10) : '',
          promo_start: a.promo_start ? a.promo_start.slice(0, 10) : '',
          promo_end: a.promo_end ? a.promo_end.slice(0, 10) : '',
        });
        setLoading(false);
      });
    }
  }, [id, isNew]);

  /* ── Champ simple ── */
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  /* ── Supports : upload ── */
  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      const { data } = await api.post('/articles/upload-supports', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, supports: [...f.supports, ...data.files] }));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeSupport(idx) {
    setForm((f) => ({ ...f, supports: f.supports.filter((_, i) => i !== idx) }));
  }

  /* ── Questions d'inscription ── */
  function addQuestion() {
    setForm((f) => ({
      ...f,
      registration_questions: [
        ...f.registration_questions,
        { id: crypto.randomUUID(), label: '', required: false },
      ],
    }));
  }

  function updateQuestion(idx, patch) {
    setForm((f) => ({
      ...f,
      registration_questions: f.registration_questions.map((q, i) => i === idx ? { ...q, ...patch } : q),
    }));
  }

  function removeQuestion(idx) {
    setForm((f) => ({ ...f, registration_questions: f.registration_questions.filter((_, i) => i !== idx) }));
  }

  /* ── Soumission ── */
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.is_free ? null : (form.price || null),
        promo_price: form.has_promo ? (form.promo_price || null) : null,
        promo_start: form.has_promo ? (form.promo_start || null) : null,
        promo_end: form.has_promo ? (form.promo_end || null) : null,
        supports: JSON.stringify(form.supports),
        registration_questions: JSON.stringify(form.registration_questions),
      };
      if (isNew) await api.post('/articles', payload);
      else await api.put(`/articles/${id}`, payload);
      navigate('/admin/articles');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Chargement…</p>;

  const isFree = form.is_free;
  const hasPromo = form.has_promo;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0 }}>{isNew ? 'Nouvel article / formation' : "Modifier l'article"}</h1>
        <Link to="/admin/articles" className="btn btn-outline">← Retour</Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 0, maxWidth: 820 }}>
        <div className="card" style={{ padding: '28px 28px', display: 'grid', gap: 22 }}>

          {/* ── Infos de base ── */}
          <div>
            <label>Titre *</label>
            <input required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Titre de l'article ou de la formation" />
          </div>

          <div>
            <label>Résumé (affiché dans la liste)</label>
            <textarea rows={2} value={form.excerpt || ''} onChange={(e) => set('excerpt', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label>Catégorie</label>
              <select value={form.category_id || ''} onChange={(e) => set('category_id', e.target.value)}>
                <option value="">— Aucune —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <p style={{ fontSize: 12, marginTop: 4, marginBottom: 0 }}>
                <Link to="/admin/categories">{categories.length === 0 ? 'Créer une catégorie' : 'Gérer les catégories'}</Link>
              </p>
            </div>
            <div>
              <label>Statut</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
          </div>

          <ImageInput label="Image de couverture" value={form.cover_image_url} onChange={(url) => set('cover_image_url', url)} />

          <div>
            <label>Description / contenu</label>
            <RichTextEditor value={form.content_html} onChange={(html) => set('content_html', html)} />
          </div>

          {/* ─── Période de déroulement ─── */}
          <Section icon={<IcoCalendar />} title="Période de déroulement">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label>Date de début</label>
                <input type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
              </div>
              <div>
                <label>Date de fin</label>
                <input type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} />
              </div>
            </div>
          </Section>

          {/* ─── Tarification ─── */}
          <Section icon={<IcoEuro />} title="Tarification">
            {/* Gratuit / Payant */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {[
                { val: true,  label: 'Gratuit' },
                { val: false, label: 'Payant' },
              ].map(({ val, label }) => (
                <label key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  padding: '10px 18px', borderRadius: 8,
                  border: `1px solid ${isFree === val ? 'var(--accent)' : 'var(--border)'}`,
                  background: isFree === val ? 'var(--accent)' : 'transparent',
                  color: isFree === val ? 'var(--accent-contrast)' : 'var(--text)',
                  transition: 'all 0.15s ease',
                  fontWeight: 600, fontSize: 14,
                }}>
                  <input type="radio" name="is_free" style={{ display: 'none' }}
                    checked={isFree === val} onChange={() => set('is_free', val)} />
                  {label}
                </label>
              ))}
            </div>

            {/* Champs payants */}
            {!isFree && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label>Montant (FCFA)</label>
                  <input type="number" min="0" step="1" placeholder="0"
                    value={form.price} onChange={(e) => set('price', e.target.value)} />
                </div>

                {/* Promotion */}
                <div style={{
                  padding: 16, borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--bg)',
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: hasPromo ? 16 : 0 }}>
                    <input type="checkbox" style={{ width: 16, height: 16 }}
                      checked={hasPromo} onChange={(e) => set('has_promo', e.target.checked)} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Activer une promotion</span>
                  </label>

                  {hasPromo && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                      <div>
                        <label>Prix promotionnel (FCFA)</label>
                        <input type="number" min="0" step="1" placeholder="0"
                          value={form.promo_price} onChange={(e) => set('promo_price', e.target.value)} />
                      </div>
                      <div>
                        <label>Début de la promotion</label>
                        <input type="date" value={form.promo_start} onChange={(e) => set('promo_start', e.target.value)} />
                      </div>
                      <div>
                        <label>Fin de la promotion</label>
                        <input type="date" value={form.promo_end} onChange={(e) => set('promo_end', e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Section>

          {/* ─── Supports de formation ─── */}
          <Section icon={<IcoFile />} title="Supports de formation">
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0, marginBottom: 16 }}>
              PDF, Word, Excel, PowerPoint, images… Plusieurs fichiers acceptés (max 32 Mo / fichier).
            </p>

            {/* Zone d'upload */}
            <div
              style={{
                border: '2px dashed var(--border)', borderRadius: 10,
                padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
                transition: 'border-color 0.15s ease',
                marginBottom: form.supports.length ? 16 : 0,
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dt = e.dataTransfer;
                if (dt.files.length) {
                  const fakeEvent = { target: { files: dt.files, value: '' } };
                  handleFileUpload(fakeEvent);
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif,.zip"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <div style={{ color: 'var(--accent)', marginBottom: 8 }}><IcoUpload /></div>
              {uploading
                ? <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Envoi en cours…</p>
                : <>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Cliquez ou glissez vos fichiers ici</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>PDF, Word, Excel, PowerPoint, images</p>
                  </>
              }
            </div>

            {/* Liste des fichiers uploadés */}
            {form.supports.length > 0 && (
              <div style={{ display: 'grid', gap: 8 }}>
                {form.supports.map((f, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'var(--bg)',
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                      background: mimeColor(f.mime), color: '#fff',
                      padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                    }}>
                      {mimeLabel(f.mime)}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </span>
                    {f.size && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                        {humanSize(f.size)}
                      </span>
                    )}
                    <button type="button" onClick={() => removeSupport(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                      aria-label="Supprimer ce fichier">
                      <IcoTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ─── Questions d'inscription ─── */}
          <Section icon={<IcoQuestion />} title="Questions à l'inscription">
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0, marginBottom: 16 }}>
              Ces questions seront posées lors de l'inscription à cet article / cette formation.
            </p>

            <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
              {form.registration_questions.map((q, idx) => (
                <div key={q.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: 10, alignItems: 'center',
                  padding: '12px 14px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--bg)',
                }}>
                  <input
                    placeholder={`Question ${idx + 1}…`}
                    value={q.label}
                    onChange={(e) => updateQuestion(idx, { label: e.target.value })}
                    style={{ margin: 0 }}
                  />
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: 'pointer',
                    margin: 0,
                  }}>
                    <input type="checkbox" style={{ width: 14, height: 14 }}
                      checked={q.required} onChange={(e) => updateQuestion(idx, { required: e.target.checked })} />
                    Obligatoire
                  </label>
                  <button type="button" onClick={() => removeQuestion(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                    aria-label="Supprimer cette question">
                    <IcoTrash />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="btn btn-outline" onClick={addQuestion}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <IcoPlus /> Ajouter une question
            </button>
          </Section>

          {/* ─── Actions ─── */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <Link to="/admin/articles" className="btn btn-outline">Annuler</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
