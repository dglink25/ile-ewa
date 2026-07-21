import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';
import SchemaOrg, { schemaBreadcrumb } from '../components/SchemaOrg';

/* ────────────────────────────────────────
   ICÔNES
──────────────────────────────────────── */
function IcoCalendar() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IcoClock() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IcoTag() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function IcoSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function IcoArrowLeft() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function IcoArrowRight() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function IcoFree() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M8 12h8"/></svg>;
}

/* ────────────────────────────────────────
   HELPERS
──────────────────────────────────────── */
const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MOIS_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_COURT = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function parseLocalDate(str) {
  if (!str) return null;
  const [y, m, d] = str.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateLabel(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  return `${d.getDate()} ${MOIS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0') !== '00' ? String(d.getMinutes()).padStart(2, '0') : ''}`;
}

function formatPrice(event) {
  if (event.is_free || event.is_free === 1) return 'Gratuit';
  const now = new Date();
  if (event.has_promo && event.promo_price) {
    const ps = parseLocalDate(event.promo_start);
    const pe = parseLocalDate(event.promo_end);
    if ((!ps || now >= ps) && (!pe || now <= pe)) {
      return `${Number(event.promo_price).toLocaleString('fr-FR')} FCFA`;
    }
  }
  if (event.price) return `${Number(event.price).toLocaleString('fr-FR')} FCFA`;
  return 'Gratuit';
}

/* Grouper les événements par mois */
function groupByMonth(events) {
  const groups = [];
  let current = null;
  for (const ev of events) {
    const d = parseLocalDate(ev.start_date);
    const key = d ? `${d.getFullYear()}-${d.getMonth()}` : 'unknown';
    const label = d ? `${MOIS_LONG[d.getMonth()]} ${d.getFullYear()}` : '';
    if (!current || current.key !== key) {
      current = { key, label, events: [] };
      groups.push(current);
    }
    current.events.push(ev);
  }
  return groups;
}

/* ────────────────────────────────────────
   COMPOSANT — Carte événement
──────────────────────────────────────── */
function EventRow({ event }) {
  const start = parseLocalDate(event.start_date);
  const end = parseLocalDate(event.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = end ? end < today : start && start < today;
  const price = formatPrice(event);
  const isFree = price === 'Gratuit';

  return (
    <Reveal>
      <Link
        to={`/blog/${event.slug}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr auto',
          gap: 20,
          alignItems: 'start',
          padding: '20px 0',
          borderBottom: '1px solid var(--border)',
          opacity: isPast ? 0.6 : 1,
          textDecoration: 'none',
        }}
      >
        {/* Date badge */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          {start && (
            <>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-muted)',
              }}>
                {JOURS[start.getDay()]}
              </div>
              <div style={{
                fontSize: 36, fontWeight: 800, lineHeight: 1,
                color: isPast ? 'var(--text-muted)' : 'var(--accent)',
                fontFamily: 'var(--font-heading)',
              }}>
                {start.getDate()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {MOIS_COURT[start.getMonth()]}
              </div>
            </>
          )}
        </div>

        {/* Contenu */}
        <div style={{ minWidth: 0 }}>
          {/* Horaire + date fin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
              <IcoClock />
              {start ? formatDateLabel(event.start_date) : ''}
              {end && end.getTime() !== start?.getTime() && (
                <> → {formatDateLabel(event.end_date)}</>
              )}
            </span>
          </div>

          <h3 style={{ margin: '0 0 8px', fontSize: 17, lineHeight: 1.3, color: 'var(--text)' }}>
            {event.title}
          </h3>

          {event.excerpt && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {event.excerpt.length > 120 ? event.excerpt.slice(0, 120) + '…' : event.excerpt}
            </p>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {event.category_name && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'var(--accent)',
                background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                padding: '3px 8px', borderRadius: 20,
              }}>
                <IcoTag /> {event.category_name}
              </span>
            )}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 700,
              color: isFree ? 'var(--success)' : 'var(--text)',
              background: isFree
                ? 'color-mix(in srgb, var(--success) 12%, transparent)'
                : 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              padding: '3px 8px', borderRadius: 20,
            }}>
              <IcoFree /> {price}
            </span>
          </div>
        </div>

        {/* Image */}
        {event.cover_image_url && (
          <img
            src={event.cover_image_url}
            alt={event.title}
            style={{ width: 110, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          />
        )}
      </Link>
    </Reveal>
  );
}

/* ────────────────────────────────────────
   HERO AGENDA
──────────────────────────────────────── */
const AGENDA_HERO_FALLBACK = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&q=80&auto=format&fit=crop';

function AgendaHero({ settings }) {
  const bg = settings?.agenda_hero_image || AGENDA_HERO_FALLBACK;
  return (
    <section style={{
      position: 'relative',
      minHeight: 'clamp(300px, 42vw, 440px)',
      display: 'flex',
      alignItems: 'flex-end',
      overflow: 'hidden',
    }}>
      {/* Image de fond */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Overlay dégradé */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(10,8,6,0.3) 0%, rgba(10,8,6,0.82) 100%)',
      }} />

      {/* Ligne accent bas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 4, background: 'var(--accent)', zIndex: 2,
      }} />

      <div className="container" style={{
        padding: 'clamp(40px, 6vw, 64px) 24px clamp(40px, 5vw, 56px)',
        position: 'relative', zIndex: 1,
      }}>
        <Reveal>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent)', color: 'var(--accent-contrast)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', padding: '5px 14px',
            borderRadius: 20, marginBottom: 16,
          }}>
            <IcoCalendar /> Agenda
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            color: '#fff',
            margin: '0 0 12px',
            textShadow: '0 2px 20px rgba(0,0,0,0.6)',
            lineHeight: 1.15,
          }}>
            {settings?.agenda_title || 'Agenda'}
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: 'rgba(255,255,255,0.8)',
            margin: 0,
            maxWidth: 560,
            textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            lineHeight: 1.6,
          }}>
            {settings?.agenda_subtitle || 'Formations, ateliers et rendez-vous du cercle Ilé Ẹwà.'}
          </p>
        </Reveal>
      </div>
    </section>
  );
}


export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCat = searchParams.get('categorie') || 'tout';
  const activePeriod = searchParams.get('periode') || 'upcoming';

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ period: activePeriod });
    if (activeCat !== 'tout') params.set('category', activeCat);

    Promise.all([
      api.get(`/articles/agenda?${params}`),
      api.get('/categories'),
      api.get('/settings'),
    ]).then(([evRes, catRes, setRes]) => {
      setEvents(evRes.data.events || []);
      setCategories(catRes.data.categories || []);
      setSettings(setRes.data.settings || {});
    }).finally(() => setLoading(false));
  }, [activeCat, activePeriod]);

  useEffect(() => { load(); }, [load]);

  function setParam(key, val) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === 'tout' || val === 'upcoming') next.delete(key);
      else next.set(key, val);
      return next;
    });
  }

  /* Filtrage local par recherche */
  const filtered = search.trim()
    ? events.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.excerpt || '').toLowerCase().includes(search.toLowerCase()),
      )
    : events;

  const groups = groupByMonth(filtered);

  const PERIODS = [
    { key: 'upcoming', label: 'À venir' },
    { key: 'past',     label: 'Passés' },
    { key: 'all',      label: 'Tous' },
  ];

  return (
    <div>
      <SEO
        title={settings?.agenda_title || 'Agenda'}
        description={settings?.agenda_subtitle || 'Formations, ateliers et rendez-vous du cercle Ilé Ẹwà. Consultez les prochains événements et inscrivez-vous.'}
        url="/agenda"
      />
      <SchemaOrg schema={schemaBreadcrumb([
        { name: 'Accueil', url: '/' },
        { name: 'Agenda', url: '/agenda' },
      ])} />
      {/* ── Hero ── */}
      <AgendaHero settings={settings} />

      {/* ── Barre filtres + recherche ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        position: 'sticky', top: 64, zIndex: 50,
      }}>
        <div className="container" style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'nowrap', overflowX: 'auto' }}>
            {/* Filtres catégorie */}
            <button
              onClick={() => setParam('categorie', 'tout')}
              style={tabStyle(activeCat === 'tout')}
            >
              Tout l'agenda
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setParam('categorie', cat.slug)}
                style={tabStyle(activeCat === cat.slug)}
              >
                {cat.name}
              </button>
            ))}

            {/* Séparateur */}
            <div style={{ flexShrink: 0, width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />

            {/* Filtres période */}
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setParam('periode', p.key)}
                style={tabStyle(activePeriod === p.key, true)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Zone principale ── */}
      <div className="container" style={{ padding: '32px 24px 100px' }}>

        {/* Barre de recherche */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 10,
          border: '1px solid var(--border)', background: 'var(--bg-elevated)',
          marginBottom: 32, maxWidth: 420,
        }}>
          <IcoSearch />
          <input
            type="text"
            placeholder="Rechercher un événement…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: 'var(--text)', flex: 1, padding: 0,
            }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Chargement…</div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <IcoCalendar />
            <p style={{ marginTop: 16, fontSize: 16 }}>
              {search ? 'Aucun événement ne correspond à votre recherche.' : 'Aucun événement à afficher pour cette période.'}
            </p>
            {(activeCat !== 'tout' || search) && (
              <button className="btn btn-outline" style={{ marginTop: 12 }}
                onClick={() => { setSearch(''); setSearchParams({}); }}>
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* Groupes par mois */}
        {!loading && groups.map((group) => (
          <div key={group.key} style={{ marginBottom: 48 }}>
            {/* Séparateur mois */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--accent)',
              }}>
                {group.label}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--accent)', opacity: 0.3 }} />
            </div>

            {/* Liste des événements du mois */}
            {group.events.map((ev) => (
              <EventRow key={ev.id} event={ev} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Style onglet */
function tabStyle(active, small = false) {
  return {
    padding: small ? '12px 14px' : '14px 18px',
    fontSize: small ? 12 : 13,
    fontWeight: 600,
    border: 'none', background: 'none', cursor: 'pointer',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'color 0.15s ease, border-color 0.15s ease',
    whiteSpace: 'nowrap', flexShrink: 0,
  };
}
