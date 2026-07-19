import { useEffect, useState } from 'react';
import api from '../api/client';
import RichTextEditor from '../components/RichTextEditor';
import ImageInput from '../components/ImageInput';
import { Link } from 'react-router-dom';

export default function MemberSpace() {
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

  if (!profile) return <div className="container" style={{ padding: 60 }}><p>Chargement…</p></div>;

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: 760 }}>
      <h1>Mon espace membre</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Modifiez votre fiche telle qu'elle apparaît dans l'annuaire public une fois publiée par l'administrateur.
      </p>
      <p style={{ fontSize: 14 }}>
        <Link to="/mon-compte">Gérer mon compte / changer mon mot de passe →</Link>
      </p>

      <form onSubmit={handleSave} className="card" style={{ padding: 24, display: 'grid', gap: 20, marginTop: 24 }}>
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
          <label>Présentation (texte, tableaux, couleurs...)</label>
          <RichTextEditor value={profile.bio_html} onChange={(html) => setProfile({ ...profile, bio_html: html })} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary">Enregistrer</button>
          {saved && <span style={{ color: 'var(--success)', fontSize: 14 }}>Enregistré ✓</span>}
        </div>
      </form>
    </div>
  );
}
