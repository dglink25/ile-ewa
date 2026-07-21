import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';

export default function Members() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    api.get('/profiles/public').then(({ data }) => setProfiles(data.profiles));
  }, []);

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <SEO
        title="Annuaire des membres"
        description="Découvrez les praticien·ne·s et complices du cercle Ilé Ẹwà. Consultez les profils des membres de notre communauté."
        url="/membres"
      />
      <Reveal><h1>Les membres du cercle</h1></Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginTop: 32 }}>
        {profiles.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <Link to={`/membres/${p.slug}`} className="card" style={{ padding: 20, textAlign: 'center', display: 'block' }}>
              <img
                src={p.avatar_url || 'https://placehold.co/100x100?text=%20'}
                alt={p.display_name}
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }}
              />
              <h3 style={{ margin: '8px 0 4px' }}>{p.display_name}</h3>
              {p.city && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.city}</p>}
            </Link>
          </Reveal>
        ))}
        {profiles.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aucun membre publié pour le moment.</p>}
      </div>
    </div>
  );
}
