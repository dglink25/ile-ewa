import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ImageInput from '../components/ImageInput';

/* ═══════════════════════════════════════
   ICÔNES
═══════════════════════════════════════ */
function IcoCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IcoEye() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function IcoEyeOff() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}
function IcoShield() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function IcoUser() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

/* ═══════════════════════════════════════
   INPUT MOT DE PASSE
═══════════════════════════════════════ */
function PasswordInput({ label, value, onChange, required, minLength, placeholder }) {
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
          placeholder={placeholder}
          style={{ paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', padding: 4,
          }}
          aria-label={show ? 'Masquer' : 'Afficher'}
        >
          {show ? <IcoEyeOff /> : <IcoEye />}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   BARRE FORCE MOT DE PASSE
═══════════════════════════════════════ */
function StrengthBar({ pwd }) {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;

  const levels = [
    { score: 1, label: 'Très faible', color: 'var(--danger)' },
    { score: 2, label: 'Faible',      color: '#e67e22' },
    { score: 3, label: 'Moyen',       color: '#f1c40f' },
    { score: 4, label: 'Fort',        color: 'var(--success)' },
    { score: 5, label: 'Très fort',   color: 'var(--success)' },
  ];
  const { label, color } = levels[Math.min(score, 5) - 1] || levels[0];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4,5].map((i) => (
          <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= score ? color : 'var(--border)', transition: 'background 0.2s' }} />
        ))}
      </div>
      <p style={{ margin: '4px 0 0', fontSize: 11, color, fontWeight: 600 }}>{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════
   PAGE
═══════════════════════════════════════ */
const TABS = [
  { key: 'profil',   label: 'Mon profil',       Icon: IcoUser   },
  { key: 'securite', label: 'Compte & sécurité', Icon: IcoShield },
];

export default function AdminProfile() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profil');
  const [profile, setProfile] = useState(null);

  /* Profil */
  const [savedProfil, setSavedProfil] = useState(false);
  const [savingProfil, setSavingProfil] = useState(false);

  /* Mot de passe */
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdStatus, setPwdStatus] = useState(null);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    api.get('/profiles/me').then(({ data }) => setProfile(data.profile)).catch(() => {});
  }, []);

  async function saveProfil(e) {
    e.preventDefault();
    setSavingProfil(true);
    try {
      await api.put('/profiles/me', profile);
      setSavedProfil(true);
      setTimeout(() => setSavedProfil(false), 2500);
    } finally {
      setSavingProfil(false);
    }
  }

  async function savePwd(e) {
    e.preventDefault();
    setPwdStatus(null);
    if (pwd.next !== pwd.confirm) {
      setPwdStatus({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    setSavingPwd(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        current_password: pwd.current,
        new_password: pwd.next,
      });
      setPwdStatus({ type: 'success', message: data.message });
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwdStatus({ type: 'error', message: err.response?.data?.error || 'Erreur lors du changement.' });
    } finally {
      setSavingPwd(false);
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ marginBottom: 4 }}>Mon profil</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
        Gérez vos informations personnelles et la sécurité de votre compte administrateur.
      </p>

      {/* ── Onglets ── */}
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 28, display: 'flex', gap: 0 }}>
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', fontSize: 14, fontWeight: 600,
              border: 'none', background: 'none', cursor: 'pointer',
              color: tab === key ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            }}>
            <Icon /> {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          ONGLET PROFIL
      ══════════════════════════════════════ */}
      {tab === 'profil' && profile && (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Carte aperçu */}
          <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <img
              src={profile.avatar_url || `https://placehold.co/72x72?text=${encodeURIComponent(profile.display_name?.[0] || 'A')}`}
              alt={profile.display_name}
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)', flexShrink: 0 }}
            />
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 19 }}>{profile.display_name}</h2>
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', padding: '2px 10px', borderRadius: 10,
                background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                color: 'var(--accent)', border: '1px solid var(--accent)',
              }}>
                Administrateur
              </span>
              {user?.email && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{user.email}</p>}
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={saveProfil} className="card" style={{ padding: 24, display: 'grid', gap: 18 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Informations
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label>Nom affiché *</label>
                <input required value={profile.display_name || ''} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
              </div>
              <div>
                <label>Ville</label>
                <input value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="Cotonou…" />
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

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary" disabled={savingProfil}>
                {savingProfil ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              {savedProfil && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: 14, fontWeight: 600 }}>
                  <IcoCheck /> Enregistré
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════
          ONGLET SÉCURITÉ
      ══════════════════════════════════════ */}
      {tab === 'securite' && (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Infos compte */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Informations du compte
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--bg)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 60 }}>Email</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--bg)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 60 }}>Rôle</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '2px 8px', borderRadius: 8,
                  background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                  color: 'var(--accent)', border: '1px solid var(--accent)',
                }}>
                  Administrateur
                </span>
              </div>
            </div>
          </div>

          {/* Changement mot de passe */}
          <form onSubmit={savePwd} className="card" style={{ padding: 24, display: 'grid', gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Changer le mot de passe
            </h3>

            <PasswordInput
              label="Mot de passe actuel"
              required value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            />

            <div>
              <PasswordInput
                label="Nouveau mot de passe"
                required minLength={6}
                value={pwd.next}
                onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              />
              <StrengthBar pwd={pwd.next} />
            </div>

            <div>
              <PasswordInput
                label="Confirmer le nouveau mot de passe"
                required minLength={6}
                value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              />
              {pwd.confirm && pwd.next !== pwd.confirm && (
                <p style={{ color: 'var(--danger)', fontSize: 12, margin: '4px 0 0' }}>
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            {pwdStatus && (
              <p style={{ color: pwdStatus.type === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: 14, margin: 0 }}>
                {pwdStatus.message}
              </p>
            )}

            <button type="submit" className="btn btn-primary" disabled={savingPwd} style={{ justifySelf: 'start' }}>
              {savingPwd ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
