import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import api from '../api/client';
import logo from '../logo.png';

function ChevronDown({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* ── Dropdown desktop ── */
function DropdownMenu({ label, to, items }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  function openMenu() { clearTimeout(closeTimer.current); setOpen(true); }
  function scheduleClose() { closeTimer.current = setTimeout(() => setOpen(false), 150); }

  return (
    <div style={{ position: 'relative' }} onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <Link to={to} style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {items.length > 0 && <ChevronDown open={open} />}
      </Link>
      {open && items.length > 0 && (
        <div className="card" style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 10,
          minWidth: 220, padding: 8, zIndex: 200,
        }}>
          {items.map((item) => (
            <Link key={item.key} to={item.to}
              style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: 14, color: 'var(--text)' }}
              onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PresentationMenu() {
  const [sections, setSections] = useState([]);
  useEffect(() => {
    api.get('/pages/public/presentation')
      .then(({ data }) => {
        try {
          const parsed = JSON.parse(data.page.sections || '[]');
          if (Array.isArray(parsed)) setSections(parsed);
        } catch { setSections([]); }
      }).catch(() => setSections([]));
  }, []);
  const items = sections.map((s) => ({ key: s.anchor || s.title, to: `/presentation#${s.anchor}`, label: s.title }));
  return <DropdownMenu label="Présentation" to="/presentation" items={items} />;
}

/* ── Icône burger ── */
function BurgerIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
        : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
      }
    </svg>
  );
}

/* ── Accordion item pour le menu mobile ── */
function MobileAccordion({ label, to, items, onClose }) {
  const [open, setOpen] = useState(false);
  if (!items.length) {
    return <Link to={to} onClick={onClose} style={{ display: 'block', padding: '14px 12px', fontSize: 17, fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>{label}</Link>;
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
        onClick={() => setOpen((v) => !v)}>
        <Link to={to} onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ fontSize: 17, fontWeight: 500, color: 'var(--text)' }}>{label}</Link>
        <ChevronDown open={open} />
      </div>
      {open && (
        <div style={{ background: 'var(--bg-elevated)', paddingLeft: 12 }}>
          {items.map((item) => (
            <Link key={item.key} to={item.to} onClick={onClose}
              style={{ display: 'block', padding: '12px 12px', fontSize: 15, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              {item.label}
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
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [preseSections, setPreseSections] = useState([]);

  /* Fermer le menu au changement de route */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* Verrouiller le scroll body quand le menu mobile est ouvert */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Sections de présentation pour le menu mobile */
  useEffect(() => {
    api.get('/pages/public/presentation')
      .then(({ data }) => {
        try {
          const parsed = JSON.parse(data.page.sections || '[]');
          if (Array.isArray(parsed)) setPreseSections(parsed);
        } catch { setPreseSections([]); }
      }).catch(() => setPreseSections([]));
  }, []);

  function handleLogout() { logout(); navigate('/'); }
  function closeMenu() { setMobileOpen(false); }

  const preseItems = preseSections.map((s) => ({ key: s.anchor || s.title, to: `/presentation#${s.anchor}`, label: s.title }));
  const actusItems = [{ key: 'all', to: '/actualites', label: 'Toutes les actualités' }];

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'var(--bg)',
        zIndex: 1000,
        borderBottom: '2px solid var(--accent)',
        boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.28)' : '0 1px 8px rgba(0,0,0,0.10)',
        transition: 'box-shadow 0.2s ease',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', flexShrink: 0 }}>
            <img src={logo} alt="Ilé Ẹwà" style={{ height: 36, width: 'auto' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 700 }}>Ilé Ẹwà</span>
          </Link>

          {/* ── Navigation desktop ── */}
          <nav className="nav-desktop" style={{ gap: 24, fontSize: 14, fontWeight: 500, alignItems: 'center' }}>
            <PresentationMenu />
            <Link to="/membres" style={{ color: 'var(--text)' }}>Membres</Link>
            <DropdownMenu label="Actualités" to="/actualites" items={actusItems} />
            <Link to="/contact" style={{ color: 'var(--text)' }}>Contact</Link>
          </nav>

          {/* ── Actions + burger ── */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />

            {/* Boutons auth — desktop */}
            <div className="nav-desktop" style={{ alignItems: 'center', gap: 8 }}>
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

            {/* Burger button */}
            <button
              className="burger-btn"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 8px',
                color: 'var(--text)', display: 'none', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <BurgerIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Menu mobile drawer ── */}
      <nav className={`nav-mobile ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <MobileAccordion label="Présentation" to="/presentation" items={preseItems} onClose={closeMenu} />
        <Link to="/membres" onClick={closeMenu} style={{ display: 'block', padding: '14px 12px', fontSize: 17, fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>Membres</Link>
        <MobileAccordion label="Actualités" to="/actualites" items={actusItems} onClose={closeMenu} />
        <Link to="/contact" onClick={closeMenu} style={{ display: 'block', padding: '14px 12px', fontSize: 17, fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>Contact</Link>

        {/* Auth links dans le menu mobile */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, padding: '0 12px' }}>
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin" onClick={closeMenu} className="btn btn-outline" style={{ justifyContent: 'center' }}>Admin</Link>}
              <Link to="/espace-membre" onClick={closeMenu} className="btn btn-outline" style={{ justifyContent: 'center' }}>Mon espace</Link>
              <button className="btn btn-primary" onClick={() => { handleLogout(); closeMenu(); }} style={{ justifyContent: 'center' }}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/connexion" onClick={closeMenu} className="btn btn-outline" style={{ justifyContent: 'center' }}>Connexion</Link>
              <Link to="/inscription" onClick={closeMenu} className="btn btn-primary" style={{ justifyContent: 'center' }}>Inscription</Link>
            </>
          )}
        </div>
      </nav>

      {/* Overlay pour fermer le menu en cliquant dehors */}
      {mobileOpen && (
        <div
          onClick={closeMenu}
          style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.4)' }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
