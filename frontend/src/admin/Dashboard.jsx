import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';

function IconPages() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function IconArticles() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  );
}
function IconMembers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" />
      <circle cx="18" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 6l10 7 10-7" />
    </svg>
  );
}
function IconMedia() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' } }),
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats').then(({ data }) => setStats(data)).catch(() => setStats(null));
  }, []);

  const statCards = stats ? [
    { label: 'Pages du site', value: stats.pages, Icon: IconPages },
    { label: 'Articles publiés', value: stats.articlesPublished, sub: `${stats.articlesDraft} brouillon(s)`, Icon: IconArticles },
    { label: 'Membres publiés', value: stats.membersPublished, sub: `${stats.membersTotal} au total`, Icon: IconMembers },
    { label: 'Abonnés newsletter', value: stats.subscribers, Icon: IconMail },
    { label: 'Fichiers médiathèque', value: stats.media, Icon: IconMedia },
  ] : [];

  const quickActions = [
    { label: 'Nouvelle page', to: '/admin/pages/nouvelle' },
    { label: 'Nouvel article', to: '/admin/articles/nouveau' },
    { label: 'Gérer les membres', to: '/admin/membres' },
    { label: 'Ajouter un média', to: '/admin/medias' },
    { label: 'Paramètres du site', to: '/admin/parametres' },
  ];

  return (
    <div>
      <h1>Tableau de bord</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Bienvenue dans le back office d'Ilé Ẹwà. Un aperçu de votre contenu, et vos raccourcis les plus utiles.
      </p>

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginTop: 24,
            marginBottom: 40,
          }}
        >
          {statCards.map(({ label, value, sub, Icon }, i) => (
            <motion.div
              key={label}
              className="card"
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              style={{ padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)', marginBottom: 10 }}>
                <Icon />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{value}</div>
              {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
            </motion.div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: 18 }}>Actions rapides</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {quickActions.map(({ label, to }, i) => (
          <motion.div
            key={to}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Link
              to={to}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <IconPlus /> {label}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
