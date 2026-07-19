import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import logo from '../logo.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setResent(false);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/espace-membre');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || 'Erreur de connexion.');
      if (data?.code === 'EMAIL_NOT_VERIFIED') setNeedsVerification(true);
    }
  }

  async function handleResend() {
    try {
      await api.post('/auth/resend-verification', { email: form.email });
    } finally {
      setResent(true);
    }
  }

  return (
    <div className="container auth-container" style={{ maxWidth: 420, padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src={logo} alt="Ilé Ẹwà" style={{ height: 56 }} />
      </div>
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: 'grid', gap: 16 }}>
        <div>
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}

        {needsVerification && !resent && (
          <button type="button" className="btn btn-outline" onClick={handleResend}>
            Renvoyer l'email de confirmation
          </button>
        )}
        {resent && (
          <p style={{ color: 'var(--success)', fontSize: 13 }}>
            Email renvoyé, vérifiez votre boîte de réception.
          </p>
        )}

        <button type="submit" className="btn btn-primary">Se connecter</button>
        <Link to="/mot-de-passe-oublie" style={{ fontSize: 13, textAlign: 'center' }}>Mot de passe oublié ?</Link>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        Pas encore de compte ? <Link to="/inscription">Inscrivez-vous</Link>
      </p>
    </div>
  );
}
