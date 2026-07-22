import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PublicLayout() {
  return (
    /* Le overflow-x ici (pas sur body) préserve position:fixed du Header */
    <div style={{ overflowX: 'hidden' }}>
      <Header />
      {/* Espace réservé pour le header fixe (hauteur 72px) */}
      <div style={{ height: 72, flexShrink: 0 }} aria-hidden="true" />
      <main style={{ minHeight: '70vh' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
