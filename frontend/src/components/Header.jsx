import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import api from '../api/client';
import logo from '../logo.png';

function ChevronDown({ open }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PresentationMenu() {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const closeTimer = useRef(null);

  useEffect(() => {
    api.get('/pages/public/presentation')
      .then(({ data }) => {
        try {
          const parsed = JSON.parse(data.page.sections || '[]');
          if (Array.isArray(parsed)) setSections(parsed);
        } catch {
          setSections([]);
        }
      })
      .catch(() => setSections([]));
  }, []);

  function openMenu() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        to="/presentation"
        style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        Présentation
        {sections.length > 0 && <ChevronDown open={open} />}
      </Link>

      {open && sections.length > 0 && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 10,
            minWidth: 220,
            padding: 8,
            zIndex: 20,
          }}
        >
          {sections.map((s) => (
            <Link
              key={s.anchor || s.title}
              to={`/presentation#${s.anchor}`}
              style={{
                display: 'block',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 14,
                color: 'var(--text)',
              }}
              onClick={() => setOpen(false)}
            >
              {s.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
          <img src={logo} alt="Ilé Ẹwà" style={{ height: 40, width: 'auto' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>Ilé Ẹwà</span>
        </Link>

        <nav style={{ display: 'flex', gap: 24, fontSize: 14, fontWeight: 500, alignItems: 'center' }}>
          <PresentationMenu />
          <Link to="/membres" style={{ color: 'var(--text)' }}>Membres</Link>
          <Link to="/blog" style={{ color: 'var(--text)' }}>Blog</Link>
          <Link to="/contact" style={{ color: 'var(--text)' }}>Contact</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin" className="btn btn-outline">Admin</Link>}
              <Link to="/espace-membre" className="btn btn-outline">Mon espace</Link>
              <button className="btn btn-primary" onClick={handleLogout}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="btn btn-outline">Connexion</Link>
              <Link to="/inscription" className="btn btn-primary">Inscription</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
