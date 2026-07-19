import { NavLink, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import logo from '../logo.png';

const links = [
  { to: '/admin', label: 'Tableau de bord', end: true },
  { to: '/admin/pages', label: 'Pages du site' },
  { to: '/admin/articles', label: 'Blog / Articles' },
  { to: '/admin/categories', label: 'Catégories du blog' },
  { to: '/admin/membres', label: 'Membres' },
  { to: '/admin/menus', label: 'Menu de navigation' },
  { to: '/admin/medias', label: 'Médiathèque' },
  { to: '/admin/parametres', label: 'Paramètres du site' },

  { to: '/', label: 'Revenir au site' },

];

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, borderRight: '1px solid var(--border)', padding: 24, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <img src={logo} alt="Ilé Ẹwà" style={{ height: 32 }} />
          <h2 style={{ fontSize: 16, margin: 0 }}>Ilé Ẹwà — Admin</h2>
        </div>
        <nav style={{ display: 'grid', gap: 4 }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 14,
                color: isActive ? 'var(--accent-contrast)' : 'var(--text)',
                background: isActive ? 'var(--accent)' : 'transparent',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 32 }}><ThemeToggle /></div>
      </aside>
      <main style={{ flex: 1, padding: 32, maxWidth: 1000 }}>
        <Outlet />
      </main>
    </div>
  );
}
