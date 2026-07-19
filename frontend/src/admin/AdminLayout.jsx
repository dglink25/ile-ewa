import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import logo from '../logo.png';

/* ── Icônes SVG ── */
function IcoDashboard() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function IcoPages() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
}
function IcoArticles() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
}
function IcoCategories() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}
function IcoMembers() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IcoMenu() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function IcoMedia() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
}
function IcoSettings() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function IcoBack() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function IcoBurger({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
        : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
      }
    </svg>
  );
}

const links = [
  { to: '/admin',            label: 'Tableau de bord',    Icon: IcoDashboard,  end: true },
  { to: '/admin/pages',      label: 'Pages du site',      Icon: IcoPages },
  { to: '/admin/articles',   label: 'Articles',           Icon: IcoArticles },
  { to: '/admin/categories', label: 'Catégories',         Icon: IcoCategories },
  { to: '/admin/membres',    label: 'Membres',            Icon: IcoMembers },
  { to: '/admin/menus',      label: 'Menu de navigation', Icon: IcoMenu },
  { to: '/admin/medias',     label: 'Médiathèque',        Icon: IcoMedia },
  { to: '/admin/parametres', label: 'Paramètres',         Icon: IcoSettings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const sidebarContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 4px' }}>
        <img src={logo} alt="Ilé Ẹwà" style={{ height: 32, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Ilé Ẹwà</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administration</div>
        </div>
      </div>

      <nav style={{ display: 'grid', gap: 2 }}>
        {links.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              padding: '9px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: isActive ? 'var(--accent-contrast)' : 'var(--text)',
              background: isActive ? 'var(--accent)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'background 0.15s ease, color 0.15s ease',
            })}
          >
            <Icon />
            {label}
          </NavLink>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
          <NavLink
            to="/"
            style={{ padding: '9px 12px', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <IcoBack />
            Revenir au site
          </NavLink>
        </div>
      </nav>

      <div style={{ marginTop: 24, padding: '0 4px' }}><ThemeToggle /></div>
    </>
  );

  return (
    <div className="admin-shell">
      {/* Sidebar desktop */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {sidebarContent}
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.5)' }}
          aria-hidden="true"
        />
      )}

      {/* Zone principale */}
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
              <IcoBurger open={sidebarOpen} />
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
