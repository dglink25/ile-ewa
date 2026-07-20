import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import RichTextEditor from '../components/RichTextEditor';
import ImageInput from '../components/ImageInput';
import MesFormations from './MesFormations';

/* ═══════════════════════════════════════
   ICÔNES
═══════════════════════════════════════ */
function IcoUser() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IcoShield() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function IcoBook() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function IcoCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IcoEye() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function IcoEyeOff() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}

/* ═══════════════════════════════════════
   ONGLET — MON PROFIL
═══════════════════════════════════════ */
function TabProfil({ profile, setProfile }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profiles/me', profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Carte de prévisualisation */}
      <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <img
          src={profile.avatar_url || 'https://placehold.co/80x80?text=' + encodeURIComponent(profile.display_name?.[0] || '?')}
          alt={profile.display_name}
          style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--accent)' }}
        />
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{profile.display_name}</h2>
          {profile.city && <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--text-muted)' }}>{profile.city}</p>}
          {profile.phone && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{profile.phone}</p>}
          <span style={{
            display: 'inline-block', marginTop: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: 10,
            background: profile.is_published
              ? 'color-mix(in srgb, var(--success) 15%, transparent)'
              : 'var(--bg-elevated)',
            color: profile.is_published ? 'var(--success)' : 'var(--text-muted)',
            border: `1px solid ${profile.is_published ? 'var(--success)' : 'var(--border)'}`,
          }}>
            {profile.is_published ? 'Visible dans l\'annuaire' : 'Non publié dans l\'annuaire'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: 24, display: 'grid', gap: 20 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Informations personnelles</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <label>Nom affiché *</label>
            <input required value={profile.display_name || ''} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
          </div>
          <div>
            <label>Ville</label>
            <input value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="Paris, Cotonou…" />
          </div>
          <div>
            <label>Téléphone</label>
            <input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+229 97 00 00 00" />
          </div>
        </div>

        <ImageInput
          label="Photo de profil"
          value={profile.avatar_url}
          onChange={(url) => setProfile({ ...profile, avatar_url: url })}
        />

        <div>
          <label>Présentation publique</label>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, marginTop: 0 }}>
            Ce texte apparaîtra sur votre fiche dans l'annuaire.
          </p>
          <RichTextEditor value={profile.bio_html} onChange={(html) => setProfile({ ...profile, bio_html: html })} />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 4 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer le profil'}
          </button>
          {saved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: 14, fontWeight: 600 }}>
              <IcoCheck /> Enregistré
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════
   ONGLET — COMPTE & SÉCURITÉ
═══════════════════════════════════════ */
function PasswordInput({ label, value, onChange, required, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          value={value}
          onChange={onChange}
          style={{ paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', padding: 0,
          }}
          aria-label={show ? 'Masquer' : 'Afficher'}
        >
          {show ? <IcoEyeOff /> : <IcoEye />}
        </button>
      </div>
    </div>
  );
}

function TabSecurite({ user }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  /* Force du mot de passe */
  function passwordStrength(pwd) {
    if (!pwd) return { score: 0, label: '', color: 'var(--border)' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: 'Très faible', color: 'var(--danger)' };
    if (score === 2) return { score, label: 'Faible', color: '#e67e22' };
    if (score === 3) return { score, label: 'Moyen', color: '#f1c40f' };
    if (score === 4) return { score, label: 'Fort', color: 'var(--success)' };
    return { score, label: 'Très fort', color: 'var(--success)' };
  }

  const strength = passwordStrength(form.new_password);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    if (form.new_password !== form.confirm_password) {
      setStatus({ type: 'error', message: 'Les deux nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setStatus({ type: 'success', message: data.message });
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Erreur lors du changement.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Infos du compte */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Informations du compte</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 80 }}>Email</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 80 }}>Rôle</span>
            <span style={{
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              padding: '2px 8px', borderRadius: 8,
              background: user?.role === 'admin' ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg-card)',
              color: user?.role === 'admin' ? 'var(--accent)' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
              {user?.role === 'admin' ? 'Administrateur' : 'Membre'}
            </span>
          </div>
        </div>
      </div>

      {/* Changer mot de passe */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15 }}>Changer le mot de passe</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <PasswordInput
            label="Mot de passe actuel"
            required
            value={form.current_password}
            onChange={(e) => setForm({ ...form, current_password: e.target.value })}
          />

          <div>
            <PasswordInput
              label="Nouveau mot de passe"
              required
              minLength={6}
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
            />
            {/* Barre de force */}
            {form.new_password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{
                      height: 4, flex: 1, borderRadius: 2,
                      background: i <= strength.score ? strength.color : 'var(--border)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: strength.color, fontWeight: 600 }}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          <PasswordInput
            label="Confirmer le nouveau mot de passe"
            required
            minLength={6}
            value={form.confirm_password}
            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
          />

          {form.confirm_password && form.new_password !== form.confirm_password && (
            <p style={{ color: 'var(--danger)', fontSize: 12, margin: 0 }}>Les mots de passe ne correspondent pas</p>
          )}

          {status && (
            <p style={{ color: status.type === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: 14, margin: 0 }}>
              {status.message}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifySelf: 'start' }}>
            {saving ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════ */
const TABS = [
  { key: 'profil',     label: 'Mon profil',        Icon: IcoUser   },
  { key: 'securite',  label: 'Compte & sécurité',  Icon: IcoShield },
  { key: 'formations',label: 'Mes formations',      Icon: IcoBook   },
];

export default function MemberSpace() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profil');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/profiles/me')
      .then(({ data }) => setProfile(data.profile || {}))
      .catch(() => setProfile({}));
  }, []);

  if (!profile) {
    return (
      <div className="container" style={{ padding: 80, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Chargement…</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'clamp(32px, 5vw, 60px) 24px 100px', maxWidth: 860 }}>
      {/* En-tête */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 4px' }}>Mon espace membre</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
          Bienvenue, <strong>{profile.display_name}</strong>
        </p>
      </div>

      {/* Onglets */}
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

      {/* Contenu */}
      {activeTab === 'profil'      && <TabProfil profile={profile} setProfile={setProfile} />}
      {activeTab === 'securite'    && <TabSecurite user={user} />}
      {activeTab === 'formations'  && <MesFormations />}
    </div>
  );
}
