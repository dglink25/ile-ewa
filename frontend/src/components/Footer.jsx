import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import logo from '../logo.png';

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconYoutube() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/settings').then(({ data }) => setSettings(data.settings || {})).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      setMessage('Merci, votre inscription est confirmée !');
      setEmail('');
    } catch {
      setMessage('Une erreur est survenue, réessayez.');
    }
  }

  const navLinks = [
    { to: '/presentation', label: 'Présentation' },
    { to: '/membres', label: 'Annuaire des membres' },
    { to: '/actualites', label: 'Actualités' },
    { to: '/contact', label: 'Contact' },
  ];

  const socialLinks = [
    settings.social_facebook && { href: settings.social_facebook, label: 'Facebook', icon: <IconFacebook /> },
    settings.social_instagram && { href: settings.social_instagram, label: 'Instagram', icon: <IconInstagram /> },
    settings.social_youtube && { href: settings.social_youtube, label: 'YouTube', icon: <IconYoutube /> },
  ].filter(Boolean);

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-elevated)',
      marginTop: 80,
    }}>
      {/* Bande accent en haut */}
      <div style={{ height: 4, background: 'var(--accent)' }} />

      <div className="container" style={{ padding: '56px 24px 40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40,
        }}>

          {/* Colonne 1 — Identité */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <img src={logo} alt="Ilé Ẹwà" style={{ height: 36, width: 'auto' }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Ilé Ẹwà
              </span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              {settings.site_tagline || 'Un espace communautaire pour se former, se rencontrer et grandir ensemble.'}
            </p>

            {/* Réseaux sociaux */}
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{
                      width: 36, height: 36,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      transition: 'color 0.15s ease, border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Colonne 2 — Navigation */}
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    style={{ fontSize: 14, color: 'var(--text)', transition: 'color 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Espace membre */}
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Espace membre
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><Link to="/connexion" style={{ fontSize: 14, color: 'var(--text)' }}>Connexion</Link></li>
              <li><Link to="/inscription" style={{ fontSize: 14, color: 'var(--text)' }}>Inscription</Link></li>
              <li><Link to="/espace-membre" style={{ fontSize: 14, color: 'var(--text)' }}>Mon espace</Link></li>
              {settings.contact_email && (
                <li>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    style={{ fontSize: 14, color: 'var(--text)' }}
                  >
                    {settings.contact_email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Colonne 4 — Newsletter */}
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Newsletter
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Recevez les dernières actualités du cercle directement dans votre boîte mail.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="newsletter-row" style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email" required placeholder="votre@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} aria-label="Adresse e-mail newsletter"
                  style={{ flex: 1, minWidth: 0 }}
                />
                <button type="submit" className="btn btn-primary">OK</button>
              </div>
              {message && (
                <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 8, marginBottom: 0 }}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bas de page */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 0' }}>
        <div className="container footer-bottom" style={{
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
          gap: 8, fontSize: 12, color: 'var(--text-muted)',
        }}>
          <span>© {new Date().getFullYear()} Ilé Ẹwà - Tous droits réservés.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/pages/mentions-legales" style={{ color: 'var(--text-muted)', fontSize: 12 }}>Mentions légales</Link>
            <Link to="/pages/confidentialite" style={{ color: 'var(--text-muted)', fontSize: 12 }}>Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
