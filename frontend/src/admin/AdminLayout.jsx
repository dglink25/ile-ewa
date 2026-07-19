import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import logo from '../logo.png';

const links = [
  { to: '/admin', label: '📊 Tableau de bord', end: true },
  { to: '/admin/pages', label: '📄 Pages du site' },
  { to: '/admin/articles', label: '✍️ Blog / Articles' },
  { to: '/admin/categories', label: '🏷️ Catégories' },
  { to: '/admin/membres', label: '👥 Membres' },
  { to: '/admin/menus', label: '🔗 Menu de navigation' },
  { to: '/admin/medias', label: '🖼️ Médiathèque' },
  { to: '/admin/parametres', label: '⚙️ Paramètres' },
];

function BurgerIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
        : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
      }
    </svg>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  /* Fermer la sidebar au changement de route sur mobile */
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  /* Verrouiller le scroll body quand sidebar ouverte */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const sidebarContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 4px' }}>
        <img src={logo} alt="Ilé Ẹwà" style={{ height: 32, flexShrink: 0 }} />
        <h2 style={{ fontSize: 15, margin: 0, lineHeight: 1.2 }}>Ilé Ẹwà<br /><span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>Administration</span></h2>
      </div>

      <nav style={{ display: 'grid', gap: 2 }}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            style={({ isActive }) => ({
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: isActive ? 'var(--accent-contrast)' : 'var(--text)',
              background: isActive ? 'var(--accent)' : 'transparent',
              transition: 'background 0.15s ease, color 0.15s ease',
            })}
          >
            {l.label}
          </NavLink>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
          <NavLink
            to="/"
            style={{ padding: '10px 12px', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)', display: 'block' }}
          >
            ← Revenir au site
          </NavLink>
        </div>
      </nav>

      <div style={{ marginTop: 24, padding: '0 4px' }}><ThemeToggle /></div>
    </>
  );

  return (
    <div className="admin-shell">
      {/* ── Sidebar desktop ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {sidebarContent}
      </aside>

      {/* Overlay mobile pour fermer la sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.5)' }}
          aria-hidden="true"
        />
      )}

      {/* ── Zone principale ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar mobile */}
        <div className="admin-topbar" style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Menu admin"
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 8px',
                color: 'var(--text)', display: 'flex', cursor: 'pointer',
              }}
            >
              <BurgerIcon open={sidebarOpen} />
            </button>
            <img src={logo} alt="" style={{ height: 28 }} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Admin</span>
          </div>
          <ThemeToggle />
        </div>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
