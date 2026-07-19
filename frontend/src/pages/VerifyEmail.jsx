import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import logo from '../logo.png';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Ce lien de vérification est incomplet.');
      return;
    }
    api.post('/auth/verify-email', { token })
      .then(({ data }) => {
        setStatus('success');
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Lien invalide ou expiré.');
      });
  }, [token]);

  return (
    <div className="container" style={{ maxWidth: 420, padding: '80px 24px', textAlign: 'center' }}>
      <img src={logo} alt="Ilé Ẹwà" style={{ height: 56, marginBottom: 16 }} />
      <h1>Vérification de l'email</h1>
      <div className="card" style={{ padding: 24 }}>
        {status === 'loading' && <p>Vérification en cours…</p>}
        {status === 'success' && (
          <>
            <p style={{ color: 'var(--success)' }}>{message}</p>
            <Link to="/connexion" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-block' }}>
              Se connecter
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p style={{ color: 'var(--danger)' }}>{message}</p>
            <Link to="/connexion" style={{ fontSize: 14 }}>← Retour à la connexion</Link>
          </>
        )}
      </div>
    </div>
  );
}
