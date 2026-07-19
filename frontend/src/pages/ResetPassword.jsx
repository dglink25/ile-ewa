import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import logo from '../logo.png';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la réinitialisation.');
    } finally {
      setSaving(false);
    }
  }

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: 420, padding: '80px 24px' }}>
        <h1>Lien invalide</h1>
        <p>Ce lien de réinitialisation est incomplet. Merci de refaire une demande.</p>
        <Link to="/mot-de-passe-oublie">Faire une nouvelle demande</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 420, padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src={logo} alt="Ilé Ẹwà" style={{ height: 56 }} />
      </div>
      <h1>Choisir un nouveau mot de passe</h1>

      {success ? (
        <div className="card" style={{ padding: 24 }}>
          <p style={{ color: 'var(--success)' }}>Mot de passe réinitialisé avec succès. Redirection vers la connexion…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: 'grid', gap: 16 }}>
          <div>
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Réinitialiser mon mot de passe'}
          </button>
        </form>
      )}
    </div>
  );
}
