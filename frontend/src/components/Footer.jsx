import { useState } from 'react';
import api from '../api/client';
import logo from '../logo.png';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      setMessage('Merci, votre inscription est confirmée !');
      setEmail('');
    } catch {
      setMessage("Une erreur est survenue, réessayez.");
    }
  }

  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: 80, padding: '48px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
        <div>
          <img src={logo} alt="Ilé Ẹwà" style={{ height: 36, marginBottom: 10 }} />
          <h3 style={{ margin: 0 }}>Ilé Ẹwà</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 320, fontSize: 14 }}>
            Un espace communautaire pour se former, se rencontrer et grandir ensemble.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ minWidth: 280 }}>
          <label htmlFor="newsletter-email">Inscription à la newsletter</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">OK</button>
          </div>
          {message && <p style={{ fontSize: 13, color: 'var(--accent)', marginTop: 8 }}>{message}</p>}
        </form>
      </div>

      <div className="container" style={{ marginTop: 32, fontSize: 12, color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Ilé Ẹwà — Tous droits réservés.
      </div>
    </footer>
  );
}
