import { useEffect, useState } from 'react';
import api from '../api/client';

export default function MenusAdmin() {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({ label: '', url: '', position: 0 });

  function load() {
    api.get('/menus').then(({ data }) => setMenus(data.menus));
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    await api.post('/menus', form);
    setForm({ label: '', url: '', position: 0 });
    load();
  }

  async function handleDelete(id) {
    await api.delete(`/menus/${id}`);
    load();
  }

  return (
    <div>
      <h1>Menu de navigation</h1>
      <form onSubmit={handleAdd} className="card" style={{ padding: 20, display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label>Libellé</label>
          <input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Lien (ex: /presentation)</label>
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </div>
        <div style={{ width: 100 }}>
          <label>Position</label>
          <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} />
        </div>
        <button type="submit" className="btn btn-primary">Ajouter</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {menus.sort((a, b) => a.position - b.position).map((m) => (
            <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: 10 }}>{m.label}</td>
              <td style={{ padding: 10, color: 'var(--text-muted)' }}>{m.url}</td>
              <td style={{ padding: 10 }}>{m.position}</td>
              <td style={{ padding: 10 }}><button className="btn btn-outline" onClick={() => handleDelete(m.id)}>Supprimer</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
