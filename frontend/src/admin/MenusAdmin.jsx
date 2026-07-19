import { useEffect, useState } from 'react';
import api from '../api/client';

const PRESET_URLS = [
  { label: '— Sélectionner un lien prédéfini —', value: '' },
  { label: 'Accueil (/)', value: '/' },
  { label: 'Présentation (/presentation)', value: '/presentation' },
  { label: 'Membres (/membres)', value: '/membres' },
  { label: 'Actualités (/actualites)', value: '/actualites' },
  { label: 'Contact (/contact)', value: '/contact' },
  { label: 'Connexion (/connexion)', value: '/connexion' },
  { label: 'Inscription (/inscription)', value: '/inscription' },
  { label: 'Mon espace (/espace-membre)', value: '/espace-membre' },
];

const EMPTY_FORM = { label: '', url: '', position: 0, is_visible: true, parent_id: '' };

export default function MenusAdmin() {
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [urlMode, setUrlMode] = useState('preset'); // 'preset' | 'page' | 'custom'

  function load() {
    api.get('/menus').then(({ data }) => setMenus(data.menus || []));
    api.get('/pages').then(({ data }) => setPages(data.pages || [])).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  function handleUrlModeChange(mode) {
    setUrlMode(mode);
    setForm((f) => ({ ...f, url: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      label: form.label,
      url: form.url || null,
      position: Number(form.position) || 0,
      is_visible: form.is_visible,
      parent_id: form.parent_id || null,
    };
    if (editingId) {
      await api.put(`/menus/${editingId}`, payload);
      setEditingId(null);
    } else {
      await api.post('/menus', payload);
    }
    setForm(EMPTY_FORM);
    setUrlMode('preset');
    load();
  }

  function startEdit(m) {
    setEditingId(m.id);
    setForm({
      label: m.label,
      url: m.url || '',
      position: m.position,
      is_visible: m.is_visible !== false,
      parent_id: m.parent_id || '',
    });
    // Détecter le mode URL
    const preset = PRESET_URLS.find((p) => p.value && p.value === m.url);
    const page = pages.find((p) => m.url === `/pages/${p.slug}` || m.url === `/${p.slug}`);
    if (preset) setUrlMode('preset');
    else if (page) setUrlMode('page');
    else setUrlMode('custom');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setUrlMode('preset');
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cet élément de menu ?')) return;
    await api.delete(`/menus/${id}`);
    load();
  }

  async function toggleVisibility(m) {
    await api.put(`/menus/${m.id}`, { ...m, is_visible: !m.is_visible });
    load();
  }

  const sorted = [...menus].sort((a, b) => a.position - b.position);

  return (
    <div>
      <h1>Menu de navigation</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Gérez les éléments qui apparaissent dans la barre de navigation du site.
      </p>

      {/* ── Formulaire ── */}
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ padding: 24, marginBottom: 32 }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 20 }}>
          {editingId ? 'Modifier l\'élément' : 'Ajouter un élément'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
          {/* Libellé */}
          <div>
            <label>Libellé affiché *</label>
            <input
              required
              placeholder="Ex : À propos"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>

          {/* Position */}
          <div>
            <label>Position (ordre d'affichage)</label>
            <input
              type="number"
              min="0"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
            />
          </div>

          {/* Parent */}
          <div>
            <label>Élément parent (sous-menu)</label>
            <select
              value={form.parent_id}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
            >
              <option value="">— Aucun (niveau racine) —</option>
              {sorted.filter((m) => !m.parent_id && m.id !== editingId).map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Visibilité */}
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: 16, height: 16 }}
                checked={form.is_visible}
                onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
              />
              Visible sur le site
            </label>
          </div>
        </div>

        {/* ── Sélection du lien ── */}
        <div style={{ marginBottom: 16 }}>
          <label>Type de lien</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { key: 'preset', label: 'Lien prédéfini' },
              { key: 'page', label: 'Page du site' },
              { key: 'custom', label: 'URL personnalisée' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`btn ${urlMode === opt.key ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: 13, padding: '6px 14px' }}
                onClick={() => handleUrlModeChange(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {urlMode === 'preset' && (
            <select
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            >
              {PRESET_URLS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          )}

          {urlMode === 'page' && (
            <select
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            >
              <option value="">— Choisir une page —</option>
              {pages.map((p) => (
                <option key={p.id} value={`/pages/${p.slug}`}>
                  {p.title} → /pages/{p.slug}
                </option>
              ))}
            </select>
          )}

          {urlMode === 'custom' && (
            <input
              type="text"
              placeholder="Ex : /ma-page ou https://exemple.com"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          )}

          {form.url && (
            <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6, marginBottom: 0 }}>
              Lien : <strong>{form.url}</strong>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Enregistrer les modifications' : 'Ajouter au menu'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={cancelEdit}>
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* ── Liste des éléments ── */}
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Pos.</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Libellé</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Lien</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Visible</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  Aucun élément de menu. Ajoutez-en un ci-dessus.
                </td>
              </tr>
            )}
            {sorted.map((m) => (
              <tr
                key={m.id}
                style={{
                  borderBottom: '1px solid var(--border)',
                  opacity: m.is_visible ? 1 : 0.5,
                  background: editingId === m.id ? 'var(--bg-elevated)' : undefined,
                }}
              >
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', width: 50 }}>
                  {m.position}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                  {m.parent_id && <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>└</span>}
                  {m.label}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--accent)', fontSize: 13, fontFamily: 'monospace' }}>
                  {m.url || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(m)}
                    style={{
                      background: m.is_visible ? 'var(--success)' : 'var(--border)',
                      color: m.is_visible ? 'white' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: 12,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {m.is_visible ? 'OUI' : 'NON'}
                  </button>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '5px 12px', fontSize: 12 }}
                      onClick={() => startEdit(m)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn"
                      style={{ padding: '5px 12px', fontSize: 12, background: 'var(--danger)', color: 'white', border: 'none' }}
                      onClick={() => handleDelete(m.id)}
                    >
                      Supprimer
                    </button>
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
