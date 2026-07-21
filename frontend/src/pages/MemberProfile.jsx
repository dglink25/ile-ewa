import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import SEO from '../components/SEO';
import SchemaOrg, { schemaPerson, schemaBreadcrumb } from '../components/SchemaOrg';

export default function MemberProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/profiles/public/${slug}`)
      .then(({ data }) => setProfile(data.profile))
      .catch(() => setError('Profil introuvable.'));
  }, [slug]);

  if (error) return <div className="container" style={{ padding: 60 }}><p>{error}</p></div>;
  if (!profile) return <div className="container" style={{ padding: 60 }}><p>Chargement…</p></div>;

  const description = profile.bio_html
    ? profile.bio_html.replace(/<[^>]*>/g, '').slice(0, 155)
    : `Profil de ${profile.display_name} — membre du cercle Ilé Ẹwà.`;

  return (
    <div className="container" style={{ padding: 'clamp(32px, 6vw, 60px) 24px', maxWidth: 720 }}>
      <SEO
        title={profile.display_name}
        description={description}
        image={profile.avatar_url || undefined}
        url={`/membres/${profile.slug}`}
      />
      <SchemaOrg schema={[
        schemaPerson({ profile }),
        schemaBreadcrumb([
          { name: 'Accueil', url: '/' },
          { name: 'Membres', url: '/membres' },
          { name: profile.display_name, url: `/membres/${profile.slug}` },
        ]),
      ]} />

      <div className="profile-header" style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32 }}>
        <img
          src={profile.avatar_url || 'https://placehold.co/120x120?text=%20'}
          alt={profile.display_name}
          style={{ width: 'clamp(80px, 15vw, 120px)', height: 'clamp(80px, 15vw, 120px)', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
        <div>
          <h1 style={{ margin: 0 }}>{profile.display_name}</h1>
          {profile.city && <p style={{ color: 'var(--text-muted)' }}>{profile.city}</p>}
        </div>
      </div>
      <div style={{ lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: profile.bio_html || '' }} />
    </div>
  );
}
