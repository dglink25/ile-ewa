import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ display_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await register(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container auth-container" style={{ maxWidth: 420, padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src={logo} alt="Ilé Ẹwà" style={{ height: 56 }} />
      </div>
      <h1>Rejoindre le cercle</h1>

      {submitted ? (
        <div className="card" style={{ padding: 24 }}>
          <p style={{ color: 'var(--success)' }}>
            Votre compte a bien été créé. Un email de confirmation vient de vous être envoyé à{' '}
            <strong>{form.email}</strong>.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Cliquez sur le lien reçu par email pour activer votre compte, puis connectez-vous.
            Pensez à vérifier vos courriers indésirables si vous ne le voyez pas.
          </p>
          <Link to="/connexion" className="btn btn-primary" style={{ marginTop: 8, display: 'inline-block' }}>
            Aller à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: 'grid', gap: 16 }}>
          <div>
            <label>Nom affiché</label>
            <input required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label>Mot de passe</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>
      )}

      {!submitted && (
        <p style={{ marginTop: 16, fontSize: 14 }}>
          Déjà membre ? <Link to="/connexion">Connectez-vous</Link>
        </p>
      )}
    </div>
  );
}
