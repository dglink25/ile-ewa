import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

/* ── Icônes SVG ── */
function IcoCheckCircle() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
      stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IcoXCircle() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
      stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function IcoAlertCircle() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
      stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IcoLoader() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
      stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'spin 1s linear infinite' }}>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

/* ── Compteur circulaire ── */
function CountdownRing({ seconds, total }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const progress = (seconds / total) * circ;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      {/* Fond */}
      <circle cx="26" cy="26" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
      {/* Arc progressif */}
      <circle
        cx="26" cy="26" r={r}
        fill="none"
        stroke="var(--danger)"
        strokeWidth="3"
        strokeDasharray={`${progress} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ transition: 'stroke-dasharray 1s linear' }}
      />
      <text x="26" y="31" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--danger)">
        {seconds}
      </text>
    </svg>
  );
}

const REDIRECT_DELAY = 5; // secondes

export default function PaiementConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const transactionId = searchParams.get('id');
  /* La page d'origine est passée en query param depuis le controller */
  const returnPath = searchParams.get('from') || '/blog';

  const [status, setStatus] = useState('loading');
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);

  /* Vérification du paiement */
  useEffect(() => {
    if (!transactionId) { setStatus('unknown'); return; }
    api.get(`/enrollments/confirm/${transactionId}`)
      .then(({ data }) => setStatus(data.enrolled ? 'success' : 'failed'))
      .catch(() => setStatus('failed'));
  }, [transactionId]);

  /* Compte à rebours + redirection automatique en cas d'échec */
  useEffect(() => {
    if (status !== 'failed') return;
    if (countdown <= 0) { navigate(returnPath); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate, returnPath]);

  return (
    <>
      {/* Animation spin */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div className="container" style={{
        maxWidth: 480, padding: 'clamp(60px, 10vw, 100px) 24px',
        textAlign: 'center', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 20,
      }}>

        {/* ── Chargement ── */}
        {status === 'loading' && (
          <>
            <IcoLoader />
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Vérification du paiement en cours…
            </p>
          </>
        )}

        {/* ── Succès ── */}
        {status === 'success' && (
          <>
            <IcoCheckCircle />
            <div>
              <h1 style={{ margin: '0 0 8px' }}>Paiement confirmé</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: 0 }}>
                Votre inscription est validée. Retrouvez vos supports dans votre espace membre.
              </p>
            </div>
            <Link to="/espace-membre" className="btn btn-primary" style={{ marginTop: 8 }}>
              Accéder à mes formations
            </Link>
          </>
        )}

        {/* ── Échec — avec compte à rebours ── */}
        {status === 'failed' && (
          <>
            <IcoXCircle />
            <div>
              <h1 style={{ margin: '0 0 8px' }}>Paiement non confirmé</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: 0 }}>
                Le paiement n'a pas pu être vérifié. Si vous avez été débité, contactez-nous.
              </p>
            </div>

            {/* Compte à rebours */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <CountdownRing seconds={countdown} total={REDIRECT_DELAY} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Redirection dans {countdown} seconde{countdown > 1 ? 's' : ''}…
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate(returnPath)}
              >
                Retour maintenant
              </button>
              <Link to="/contact" className="btn btn-outline">
                Nous contacter
              </Link>
            </div>
          </>
        )}

        {/* ── Référence inconnue ── */}
        {status === 'unknown' && (
          <>
            <IcoAlertCircle />
            <div>
              <h1 style={{ margin: '0 0 8px' }}>Référence introuvable</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: 0 }}>
                Aucune transaction ne correspond à cette référence.
              </p>
            </div>
            <Link to="/" className="btn btn-outline">Retour à l'accueil</Link>
          </>
        )}

      </div>
    </>
  );
}
