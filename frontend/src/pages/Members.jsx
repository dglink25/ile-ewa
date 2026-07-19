import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Members() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    api.get('/profiles/public').then(({ data }) => setProfiles(data.profiles));
  }, []);

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <h1>Les membres du cercle</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginTop: 32 }}>
        {profiles.map((p) => (
          <Link to={`/membres/${p.slug}`} key={p.id} className="card" style={{ padding: 20, textAlign: 'center' }}>
            <img
              src={p.avatar_url || 'https://placehold.co/100x100?text=%20'}
              alt={p.display_name}
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }}
            />
            <h3 style={{ margin: '8px 0 4px' }}>{p.display_name}</h3>
            {p.city && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.city}</p>}
          </Link>
        ))}
        {profiles.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aucun membre publié pour le moment.</p>}
      </div>
    </div>
  );
}
