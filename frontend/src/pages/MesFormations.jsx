import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Reveal from '../components/Reveal';

/* ── Icônes ── */
function IcoDownload() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function IcoCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IcoCalendar() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IcoBook() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}

function mimeLabel(mime = '') {
  if (mime === 'application/pdf') return 'PDF';
  if (mime.includes('word')) return 'DOC';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'XLS';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'PPT';
  if (mime.startsWith('image/')) return 'IMG';
  return 'FIC';
}
function mimeColor(mime = '') {
  if (mime === 'application/pdf') return '#e74c3c';
  if (mime.includes('word')) return '#2980b9';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return '#27ae60';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return '#e67e22';
  if (mime.startsWith('image/')) return '#8e44ad';
  return '#7f8c8d';
}

export default function MesFormations() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSupports, setOpenSupports] = useState(null); // id enrollment

  useEffect(() => {
    api.get('/enrollments/mine')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Chargement…</div>;
  }

  if (enrollments.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <div style={{ marginBottom: 20, color: 'var(--text-muted)', opacity: 0.4 }}>
          <IcoBook />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Vous n'êtes inscrit à aucune formation pour le moment.
        </p>
        <Link to="/agenda" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
          Voir l'agenda des formations
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        {enrollments.length} formation{enrollments.length > 1 ? 's' : ''} — accédez à vos supports à tout moment.
      </p>

      <div style={{ display: 'grid', gap: 16 }}>
        {enrollments.map((enr, i) => {
          const isOpen = openSupports === enr.id;
          const hasSupports = Array.isArray(enr.supports) && enr.supports.length > 0;

          return (
            <Reveal key={enr.id} delay={i * 0.04}>
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center', padding: '16px 20px' }}>

                  {/* Image miniature */}
                  {enr.cover_image_url ? (
                    <img src={enr.cover_image_url} alt={enr.title}
                      style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 64, height: 64, borderRadius: 8, flexShrink: 0,
                      background: 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent)',
                    }}>
                      <IcoBook />
                    </div>
                  )}

                  {/* Infos */}
                  <div style={{ minWidth: 0 }}>
                    {enr.category_name && (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                        {enr.category_name}
                      </span>
                    )}
                    <h3 style={{ margin: '3px 0 6px', fontSize: 15, lineHeight: 1.3 }}>
                      <Link to={`/blog/${enr.slug}`} style={{ color: 'var(--text)' }}>{enr.title}</Link>
                    </h3>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Badge statut */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700,
                        color: 'var(--success)',
                        background: 'color-mix(in srgb, var(--success) 12%, transparent)',
                        padding: '2px 8px', borderRadius: 10,
                      }}>
                        <IcoCheck />
                        {enr.status === 'free' ? 'Gratuit' : `Payé — ${Number(enr.amount_paid || 0).toLocaleString('fr-FR')} FCFA`}
                      </span>

                      {/* Date de la formation */}
                      {enr.start_date && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                          <IcoCalendar />
                          {new Date(enr.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {enr.end_date && ` → ${new Date(enr.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bouton supports */}
                  {hasSupports && (
                    <button
                      onClick={() => setOpenSupports(isOpen ? null : enr.id)}
                      className="btn btn-outline"
                      style={{ fontSize: 12, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                    >
                      <IcoDownload />
                      {isOpen ? 'Masquer' : `Supports (${enr.supports.length})`}
                    </button>
                  )}
                </div>

                {/* Supports déroulants */}
                {isOpen && hasSupports && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', background: 'var(--bg)', display: 'grid', gap: 8 }}>
                    {enr.supports.map((f, idx) => (
                      <a
                        key={idx}
                        href={f.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 12px', borderRadius: 8,
                          border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                          color: 'var(--text)', textDecoration: 'none', fontSize: 13,
                          transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <span style={{
                          fontSize: 9, fontWeight: 800, background: mimeColor(f.mime),
                          color: '#fff', padding: '2px 6px', borderRadius: 3, flexShrink: 0,
                        }}>
                          {mimeLabel(f.mime)}
                        </span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.name}
                        </span>
                        <IcoDownload />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
