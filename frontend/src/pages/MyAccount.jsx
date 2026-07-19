import { useState } from 'react';
import api from '../api/client';

export default function MyAccount() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (form.new_password !== form.confirm_password) {
      setStatus({ type: 'error', message: 'Les deux nouveaux mots de passe ne correspondent pas.' });
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setStatus({ type: 'success', message: data.message });
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Erreur lors du changement de mot de passe.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: 480 }}>
      <h1>Mon compte</h1>
      <p style={{ color: 'var(--text-muted)' }}>Changez votre mot de passe de connexion.</p>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: 'grid', gap: 16, marginTop: 24 }}>
        <div>
          <label>Mot de passe actuel</label>
          <input
            type="password"
            required
            value={form.current_password}
            onChange={(e) => setForm({ ...form, current_password: e.target.value })}
          />
        </div>
        <div>
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.new_password}
            onChange={(e) => setForm({ ...form, new_password: e.target.value })}
          />
        </div>
        <div>
          <label>Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.confirm_password}
            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
          />
        </div>

        {status && (
          <p style={{ color: status.type === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: 14 }}>
            {status.message}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Changer mon mot de passe'}
        </button>
      </form>
    </div>
  );
}
