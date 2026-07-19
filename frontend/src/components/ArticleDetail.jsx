import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

/* ═══════════════════════════════════════
   ICÔNES SVG
═══════════════════════════════════════ */
const Ico = {
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Lock:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Tag:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Clock:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Percent:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  Info:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  User:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Close:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Arrow:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

/* ═══════════════════════════════════════
   HELPERS PRIX
═══════════════════════════════════════ */
function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function computePrice(article) {
  const isFree = article.is_free === 1 || article.is_free === true;
  if (isFree) return { isFree: true, finalPrice: 0, originalPrice: 0, hasPromo: false, promoActive: false, discount: 0 };

  const originalPrice = Number(article.price) || 0;
  const now = new Date();

  let promoActive = false;
  let promoPrice = 0;
  let promoStart = null;
  let promoEnd = null;

  if ((article.has_promo === 1 || article.has_promo === true) && article.promo_price) {
    promoPrice = Number(article.promo_price) || 0;
    promoStart = parseDate(article.promo_start);
    promoEnd = parseDate(article.promo_end);
    const afterStart = !promoStart || now >= promoStart;
    const beforeEnd = !promoEnd || now <= promoEnd;
    promoActive = afterStart && beforeEnd;
  }

  const finalPrice = promoActive ? promoPrice : originalPrice;
  const discount = promoActive && originalPrice > 0
    ? Math.round(((originalPrice - promoPrice) / originalPrice) * 100)
    : 0;

  return {
    isFree: false,
    finalPrice,
    originalPrice,
    hasPromo: article.has_promo === 1 || article.has_promo === true,
    promoActive,
    promoPrice,
    promoStart,
    promoEnd,
    discount,
  };
}

function fmt(n) { return Number(n).toLocaleString('fr-FR'); }
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ═══════════════════════════════════════
   MIME HELPERS
═══════════════════════════════════════ */
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

/* ═══════════════════════════════════════
   BLOC PRIX COMPLET
═══════════════════════════════════════ */
function PriceBlock({ pricing }) {
  if (pricing.isFree) {
    return (
      <div style={{ padding: '14px 16px', borderRadius: 10, background: 'color-mix(in srgb, var(--success) 10%, transparent)', border: '1px solid var(--success)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ico.Check />
          <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: 18 }}>Gratuit</span>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--success)', opacity: 0.8 }}>Accès libre sur inscription</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', display: 'grid', gap: 10 }}>

      {/* Prix principal */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-heading)', color: pricing.promoActive ? 'var(--danger)' : 'var(--text)' }}>
            {fmt(pricing.finalPrice)} FCFA
          </span>
          {pricing.promoActive && (
            <span style={{ fontSize: 16, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              {fmt(pricing.originalPrice)} FCFA
            </span>
          )}
        </div>
        {!pricing.promoActive && (
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Prix plein tarif</p>
        )}
      </div>

      {/* Badge promo active */}
      {pricing.promoActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'color-mix(in srgb, var(--danger) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)' }}>
          <Ico.Percent />
          <div>
            <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 13 }}>
              -{pricing.discount}% de réduction
            </span>
            <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
              Vous économisez {fmt(pricing.originalPrice - pricing.promoPrice)} FCFA
            </p>
          </div>
        </div>
      )}

      {/* Période de promotion (même si pas encore active) */}
      {pricing.hasPromo && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'grid', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text)' }}>
            <Ico.Clock />
            Période de promotion
          </div>
          <div style={{ paddingLeft: 20 }}>
            {pricing.promoStart && <div>Du {fmtDate(pricing.promoStart)}</div>}
            {pricing.promoEnd && <div>Au {fmtDate(pricing.promoEnd)}</div>}
            {!pricing.promoStart && !pricing.promoEnd && <div>Sans limite de durée</div>}
          </div>
          {!pricing.promoActive && pricing.promoStart && new Date() < pricing.promoStart && (
            <div style={{ marginTop: 4, padding: '4px 8px', borderRadius: 6, background: 'var(--bg-elevated)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
              Promotion à venir — prix actuel : {fmt(pricing.originalPrice)} FCFA
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   MODAL QUESTIONS
═══════════════════════════════════════ */
function EnrollModal({ article, pricing, onClose, onSuccess }) {
  const questions = Array.isArray(article.registration_questions) ? article.registration_questions : [];
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        setError(`La question « ${q.label} » est obligatoire.`);
        return;
      }
    }
    setSubmitting(true);
    setError('');
    try {
      const answersArr = questions.map((q) => ({ id: q.id, label: q.label, answer: answers[q.id] || '' }));
      onSuccess(answersArr);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div className="card" style={{ maxWidth: 540, width: '100%', padding: 28, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <Ico.Close />
        </button>

        <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>Confirmer l'inscription</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 16px' }}>{article.title}</p>

        {/* Récap prix */}
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Montant à régler</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: pricing.promoActive ? 'var(--danger)' : 'var(--text)' }}>
            {pricing.isFree ? 'Gratuit' : `${fmt(pricing.finalPrice)} FCFA`}
            {pricing.promoActive && <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--danger)', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>-{pricing.discount}%</span>}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {questions.length > 0 && (
            <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
              {questions.map((q) => (
                <div key={q.id}>
                  <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                    {q.label}
                    {q.required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
                  </label>
                  <input type="text" value={answers[q.id] || ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    placeholder="Votre réponse…" />
                </div>
              ))}
            </div>
          )}

          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}
            disabled={submitting}>
            {submitting ? 'Validation…' : pricing.isFree ? 'Confirmer mon inscription' : `Payer ${fmt(pricing.finalPrice)} FCFA`}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════ */
export default function ArticleDetail({ article, backLink, backLabel }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const pricing = computePrice(article);
  const hasSupports = Array.isArray(article.supports) && article.supports.length > 0;
  const hasQuestions = Array.isArray(article.registration_questions) && article.registration_questions.length > 0;

  const [enrollment, setEnrollment] = useState(null);
  const [checkDone, setCheckDone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  useEffect(() => {
    if (!user) { setCheckDone(true); return; }
    api.get(`/enrollments/check/${article.id}`)
      .then(({ data }) => setEnrollment(data.enrolled ? data.enrollment : null))
      .catch(() => {})
      .finally(() => setCheckDone(true));
  }, [user, article.id]);

  const isEnrolled = !!enrollment;

  function handleEnrollClick() {
    if (!user) {
      navigate(`/connexion?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setShowModal(true);
  }

  async function doEnroll(answers) {
    setShowModal(false);
    setEnrolling(true);
    setEnrollError('');
    try {
      if (pricing.isFree) {
        const { data } = await api.post(`/enrollments/free/${article.id}`, { answers });
        setEnrollment(data.enrollment);
      } else {
        const { data } = await api.post(`/enrollments/pay/${article.id}`, {
          answers,
          from_path: window.location.pathname,
        });
        window.location.href = data.payment_url;
      }
    } catch (err) {
      setEnrollError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setEnrolling(false);
    }
  }

  /* ── Label du bouton d'inscription ── */
  function enrollLabel() {
    if (enrolling) return 'Traitement…';
    if (pricing.isFree) return 'S\'inscrire gratuitement';
    if (pricing.promoActive) return `S'inscrire — ${fmt(pricing.finalPrice)} FCFA (-${pricing.discount}%)`;
    return `S'inscrire — ${fmt(pricing.finalPrice)} FCFA`;
  }

  return (
    <>
      {/* ── Hero ── */}
      <div style={{
        minHeight: 'clamp(240px, 35vw, 380px)',
        backgroundImage: article.cover_image_url
          ? `linear-gradient(180deg, rgba(10,8,6,0.45) 0%, var(--bg) 100%), url(${article.cover_image_url})`
          : 'linear-gradient(135deg, var(--bg-elevated), var(--bg))',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'flex-end',
        paddingBottom: 'clamp(28px, 5vw, 48px)',
      }}>
        <div className="container" style={{ maxWidth: 960 }}>
          {article.category_name && (
            <span style={{ display: 'inline-block', background: 'var(--accent)', color: 'var(--accent-contrast)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>
              {article.category_name}
            </span>
          )}
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 40px)', marginBottom: 10, color: article.cover_image_url ? '#fff' : 'var(--text)', textShadow: article.cover_image_url ? '0 2px 16px rgba(0,0,0,0.5)' : 'none' }}>
            {article.title}
          </h1>
          {article.author_name && (
            <p style={{ color: article.cover_image_url ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', fontSize: 14, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ico.User /> Par {article.author_name}
            </p>
          )}
        </div>
      </div>

      {/* ── Corps ── */}
      <div className="container" style={{ maxWidth: 960, padding: '40px 24px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr clamp(260px, 30%, 320px)', gap: 40, alignItems: 'start' }}>

          {/* ── Colonne contenu ── */}
          <div style={{ minWidth: 0 }}>
            {backLink && (
              <Link to={backLink} style={{ fontSize: 14, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 28 }}>
                ← {backLabel || 'Retour'}
              </Link>
            )}
            <div style={{ lineHeight: 1.85, fontSize: 16 }} dangerouslySetInnerHTML={{ __html: article.content_html }} />
          </div>

          {/* ── Sidebar ── */}
          <aside style={{ position: 'sticky', top: 80, display: 'grid', gap: 16 }}>

            {/* ── Bloc prix ── */}
            <PriceBlock pricing={pricing} />

            {/* ── Dates de la formation ── */}
            {(article.start_date || article.end_date) && (
              <div className="card" style={{ padding: '14px 16px', display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <Ico.Calendar /> Période de déroulement
                </div>
                {article.start_date && (
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Du&nbsp;</span>
                    {fmtDate(article.start_date)}
                  </div>
                )}
                {article.end_date && (
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Au&nbsp;</span>
                    {fmtDate(article.end_date)}
                  </div>
                )}
              </div>
            )}

            {/* ── Bouton inscription ── */}
            {checkDone && (
              <>
                {isEnrolled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, background: 'color-mix(in srgb, var(--success) 10%, transparent)', border: '1px solid var(--success)' }}>
                    <Ico.Check />
                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: 14 }}>Vous êtes inscrit</span>
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={handleEnrollClick} disabled={enrolling}
                    style={{ justifyContent: 'center', fontSize: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {enrollLabel()}
                    {!enrolling && <Ico.Arrow />}
                  </button>
                )}
                {enrollError && <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0 }}>{enrollError}</p>}

                {!user && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
                    <Link to={`/connexion?redirect=${encodeURIComponent(window.location.pathname)}`}>Se connecter</Link> pour s'inscrire
                  </p>
                )}
              </>
            )}

            {/* ── Supports ── */}
            {hasSupports && (
              <div className="card" style={{ padding: '14px 16px', display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isEnrolled ? <Ico.Download /> : <Ico.Lock />}
                  Supports de formation
                  <span style={{ marginLeft: 'auto', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>
                    {article.supports.length}
                  </span>
                </div>

                {isEnrolled ? (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {article.supports.map((f, i) => (
                      <a key={i} href={f.path} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', textDecoration: 'none', fontSize: 12, transition: 'border-color 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                        <span style={{ fontSize: 9, fontWeight: 800, background: mimeColor(f.mime), color: '#fff', padding: '2px 5px', borderRadius: 3, flexShrink: 0 }}>
                          {mimeLabel(f.mime)}
                        </span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        <Ico.Download />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                    Disponibles après votre inscription
                  </p>
                )}
              </div>
            )}

          </aside>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <EnrollModal
          article={article}
          pricing={pricing}
          onClose={() => setShowModal(false)}
          onSuccess={doEnroll}
        />
      )}
    </>
  );
}
