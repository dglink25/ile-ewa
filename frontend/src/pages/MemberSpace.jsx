import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import RichTextEditor from '../components/RichTextEditor';
import ImageInput from '../components/ImageInput';
import MesFormations from './MesFormations';

/* ── Icônes ── */
function IcoUser() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IcoBook() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}

const TABS = [
  { key: 'profil',     label: 'Mon profil',      Icon: IcoUser },
  { key: 'formations', label: 'Mes formations',   Icon: IcoBook },
];

export default function MemberSpace() {
  const [activeTab, setActiveTab] = useState('profil');
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/profiles/me').then(({ data }) => setProfile(data.profile));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    await api.put('/profiles/me', profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!profile) {
    return <div className="container" style={{ padding: 60 }}><p>Chargement…</p></div>;
  }

  return (
    <div className="container" style={{ padding: 'clamp(32px, 5vw, 60px) 24px 100px', maxWidth: 820 }}>
      <h1 style={{ marginBottom: 4 }}>Mon espace membre</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
        Bienvenue, <strong>{profile.display_name}</strong> — gérez votre profil et accédez à vos formations.
      </p>

      {/* ── Onglets ── */}
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 32, display: 'flex', gap: 0, overflowX: 'auto' }}>
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 20px', fontSize: 14, fontWeight: 600,
              border: 'none', background: 'none', cursor: 'pointer',
              color: activeTab === key ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === key ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      {/* ── Onglet Profil ── */}
      {activeTab === 'profil' && (
        <>
          <p style={{ fontSize: 14, marginBottom: 20 }}>
            <Link to="/mon-compte">Gérer mon compte / changer mon mot de passe →</Link>
          </p>

          <form onSubmit={handleSave} className="card" style={{ padding: 24, display: 'grid', gap: 20 }}>
            <div>
              <label>Nom affiché</label>
              <input value={profile.display_name || ''} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
            </div>
            <div>
              <label>Ville</label>
              <input value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            </div>
            <div>
              <label>Téléphone</label>
              <input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <ImageInput
              label="Photo de profil"
              value={profile.avatar_url}
              onChange={(url) => setProfile({ ...profile, avatar_url: url })}
            />
            <div>
              <label>Présentation</label>
              <RichTextEditor value={profile.bio_html} onChange={(html) => setProfile({ ...profile, bio_html: html })} />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
              {saved && <span style={{ color: 'var(--success)', fontSize: 14 }}>Enregistré ✓</span>}
            </div>
          </form>
        </>
      )}

      {/* ── Onglet Mes formations ── */}
      {activeTab === 'formations' && <MesFormations />}
    </div>
  );
}
