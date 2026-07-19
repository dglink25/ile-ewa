import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function AuthLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Retour à l'accueil</Link>
        <ThemeToggle />
      </div>
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
