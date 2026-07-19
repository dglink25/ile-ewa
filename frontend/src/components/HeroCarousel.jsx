import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section style={{ position: 'relative', minHeight: 'clamp(380px, 55vw, 560px)', overflow: 'hidden' }}>
      {slides.map((slide, i) => (
        <div
          key={slide.id || i}
          style={{
            position: 'absolute', inset: 0,
            opacity: i === index ? 1 : 0,
            transition: 'opacity 1s ease',
            pointerEvents: i === index ? 'auto' : 'none',
            backgroundImage: slide.image_url
              ? `linear-gradient(180deg, rgba(20,17,15,0.55), var(--bg) 92%), url(${slide.image_url})`
              : undefined,
            backgroundColor: !slide.image_url ? 'var(--bg-elevated)' : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div className="container" style={{ maxWidth: 760, padding: 'clamp(60px, 10vw, 100px) 24px' }}>
            {slide.title && (
              <h1 className="hero-title" style={{ marginBottom: 16 }}>{slide.title}</h1>
            )}
            {slide.subtitle && (
              <p className="hero-subtitle" style={{ color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto' }}>
                {slide.subtitle}
              </p>
            )}
            {slide.quote && (
              <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontStyle: 'italic', color: 'var(--accent)', marginTop: 20 }}>
                « {slide.quote} »
              </p>
            )}
            {slide.cta_text && slide.cta_link && (
              <div style={{ marginTop: 28 }}>
                <Link to={slide.cta_link} className="btn btn-primary">{slide.cta_text}</Link>
              </div>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {slides.map((_, i) => (
            <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Diapositive ${i + 1}`}
              style={{
                width: 8, height: 8, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer',
                background: i === index ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
