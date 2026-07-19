import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import logo from '../logo.png';

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

        <nav style={{ display: 'flex', gap: 24, fontSize: 14, fontWeight: 500 }}>
          <Link to="/presentation" style={{ color: 'var(--text)' }}>Présentation</Link>
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
