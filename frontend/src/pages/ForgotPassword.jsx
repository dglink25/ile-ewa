import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import logo from '../logo.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } finally {
      setSending(false);
      setSent(true); // on affiche toujours ce message, même si l'email n'existe pas (sécurité)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src={logo} alt="Ilé Ẹwà" style={{ height: 56 }} />
      </div>
      <h1>Mot de passe oublié</h1>

      {sent ? (
        <div className="card" style={{ padding: 24 }}>
          <p>Si cet email correspond à un compte, un lien de réinitialisation vient de vous être envoyé.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Pensez à vérifier vos courriers indésirables.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: 'grid', gap: 16 }}>
          <div>
            <label>Votre email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Envoi…' : 'Recevoir le lien de réinitialisation'}
          </button>
        </form>
      )}

      <p style={{ marginTop: 16, fontSize: 14 }}>
        <Link to="/connexion">← Retour à la connexion</Link>
      </p>
    </div>
  );
}
