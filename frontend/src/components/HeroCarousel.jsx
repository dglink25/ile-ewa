import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ── Flèche gauche ── */
function ArrowLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/* ── Flèche droite ── */
function ArrowRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [slides.length, paused, next]);

  if (!slides.length) return null;

  const slide = slides[index];

  return (
    <section
      style={{ position: 'relative', height: 'clamp(380px, 55vw, 580px)', overflow: 'hidden' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides ── */}
      {slides.map((s, i) => (
        <div
          key={s.id || i}
          aria-hidden={i !== index}
          style={{
            position: 'absolute', inset: 0,
            opacity: i === index ? 1 : 0,
            transition: 'opacity 1s ease',
            pointerEvents: i === index ? 'auto' : 'none',
            backgroundImage: s.image_url
              ? `url(${s.image_url})`
              : undefined,
            backgroundColor: !s.image_url ? 'var(--bg-elevated)' : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      {/* ── Overlay dégradé — bas de l'image assombri pour lisibilité du texte ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(10,8,6,0.72) 0%, rgba(10,8,6,0.35) 60%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Contenu — aligné en bas à gauche ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'flex-end',
        paddingBottom: 'clamp(48px, 8vw, 80px)',
      }}>
        <div className="container" style={{ maxWidth: 1160 }}>
          <div style={{ maxWidth: 'clamp(300px, 55%, 620px)' }}>

            {/* Catégorie / label */}
            {slide.quote && (
              <p style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontStyle: 'italic',
                color: 'var(--accent)',
                marginBottom: 10, marginTop: 0,
              }}>
                « {slide.quote} »
              </p>
            )}

            {/* Titre */}
            {slide.title && (
              <h1 style={{
                fontSize: 'clamp(26px, 5vw, 52px)',
                lineHeight: 1.12,
                color: '#fff',
                margin: '0 0 14px',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                fontFamily: 'var(--font-heading)',
              }}>
                {slide.title}
              </h1>
            )}

            {/* Sous-titre */}
            {slide.subtitle && (
              <p style={{
                fontSize: 'clamp(14px, 2vw, 18px)',
                color: 'rgba(255,255,255,0.82)',
                margin: '0 0 28px',
                lineHeight: 1.6,
                textShadow: '0 1px 8px rgba(0,0,0,0.4)',
              }}>
                {slide.subtitle}
              </p>
            )}

            {/* Bouton CTA — style outline blanc */}
            {slide.cta_text && slide.cta_link && (
              <Link
                to={slide.cta_link}
                style={{
                  display: 'inline-block',
                  padding: '9px 20px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.7)',
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(4px)',
                  transition: 'background 0.2s ease, border-color 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.borderColor = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
                }}
              >
                {slide.cta_text}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Flèches de navigation ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Diapositive précédente"
            style={arrowStyle('left')}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.25)'}
          >
            <ArrowLeft />
          </button>
          <button
            onClick={next}
            aria-label="Diapositive suivante"
            style={arrowStyle('right')}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.25)'}
          >
            <ArrowRight />
          </button>
        </>
      )}

      {/* ── Indicateurs (points) ── */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 18, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 8, zIndex: 2,
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Aller à la diapositive ${i + 1}`}
              style={{
                width: i === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: i === index ? 'var(--accent)' : 'rgba(255,255,255,0.45)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* Style des boutons flèche */
function arrowStyle(side) {
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 16,
    zIndex: 3,
    width: 42,
    height: 42,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.4)',
    background: 'rgba(0,0,0,0.25)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    backdropFilter: 'blur(4px)',
  };
}
