import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ImageInput from '../components/ImageInput';
import RichTextEditor from '../components/RichTextEditor';

function emptySlide() {
  return {
    id: crypto.randomUUID(),
    image_url: '',
    title: '',
    subtitle: '',
    quote: '',
    cta_text: '',
    cta_link: '',
  };
}

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({
    site_name: 'Ilé Ẹwà',
    logo_url: '',
    accent_color: '#c9974a',
    facebook_url: '',
    instagram_url: '',
    footer_text: '',
    contact_email: '',
    home_intro_html: '',
    home_testimonials_html: '',
  });
  const [slides, setSlides] = useState([emptySlide()]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      const loaded = data.settings || {};
      setSettings((prev) => ({ ...prev, ...loaded }));

      if (loaded.home_slides) {
        try {
          const parsed = JSON.parse(loaded.home_slides);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed.map((s) => ({ id: s.id || crypto.randomUUID(), ...s })));
          }
        } catch {
          // valeur invalide -> on garde le slide vide par défaut
        }
      }
      setLoading(false);
    });
  }, []);

  function updateSlide(id, patch) {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addSlide() {
    setSlides((prev) => [...prev, emptySlide()]);
  }

  function removeSlide(id) {
    setSlides((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
  }

  function moveSlide(index, direction) {
    setSlides((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    await api.put('/settings', { ...settings, home_slides: JSON.stringify(slides) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div>
      <h1>Paramètres du site</h1>
      <form onSubmit={handleSave} className="card" style={{ padding: 24, display: 'grid', gap: 20, maxWidth: 780 }}>
        <div>
          <label>Nom du site</label>
          <input value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} />
        </div>
        <ImageInput
          label="Logo"
          value={settings.logo_url}
          onChange={(url) => setSettings({ ...settings, logo_url: url })}
        />
        <div>
          <label>Email de réception des messages de contact</label>
          <input
            type="email"
            value={settings.contact_email || ''}
            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            placeholder="admin@ile-ewa.com"
          />
        </div>
        <div>
          <label>Couleur d'accent</label>
          <input type="color" value={settings.accent_color} onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })} />
        </div>
        <div>
          <label>Facebook</label>
          <input value={settings.facebook_url} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })} />
        </div>
        <div>
          <label>Instagram</label>
          <input value={settings.instagram_url} onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })} />
        </div>
        <div>
          <label>Texte de pied de page</label>
          <textarea rows={2} value={settings.footer_text} onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
        {/* ── Pages Blog & Agenda ── */}
        <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>Page Blog</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div>
            <label>Titre affiché dans le hero</label>
            <input value={settings.blog_title || ''} onChange={(e) => setSettings({ ...settings, blog_title: e.target.value })} placeholder="Blog" />
          </div>
          <div>
            <label>Sous-titre</label>
            <input value={settings.blog_subtitle || ''} onChange={(e) => setSettings({ ...settings, blog_subtitle: e.target.value })} placeholder="Articles, ressources…" />
          </div>
        </div>
        <ImageInput
          label="Image de fond du hero Blog (laissez vide pour utiliser l'image par défaut)"
          value={settings.blog_hero_image || ''}
          onChange={(url) => setSettings({ ...settings, blog_hero_image: url })}
        />

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
        <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>Page Agenda</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div>
            <label>Titre affiché dans le hero</label>
            <input value={settings.agenda_title || ''} onChange={(e) => setSettings({ ...settings, agenda_title: e.target.value })} placeholder="Agenda" />
          </div>
          <div>
            <label>Sous-titre</label>
            <input value={settings.agenda_subtitle || ''} onChange={(e) => setSettings({ ...settings, agenda_subtitle: e.target.value })} placeholder="Formations, ateliers…" />
          </div>
        </div>
        <ImageInput
          label="Image de fond du hero Agenda (laissez vide pour utiliser l'image par défaut)"
          value={settings.agenda_hero_image || ''}
          onChange={(url) => setSettings({ ...settings, agenda_hero_image: url })}
        />

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Diapositives de l'accueil</h2>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Défilent automatiquement toutes les 5 secondes</span>
        </div>        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -12 }}>
          Ajoutez autant d'images que vous le souhaitez. Chacune peut avoir son propre titre, sa description,
          sa citation et son bouton d'action.
        </p>

        <div style={{ display: 'grid', gap: 20 }}>
          {slides.map((slide, index) => (
            <div key={slide.id} className="card" style={{ padding: 20, display: 'grid', gap: 14, background: 'var(--bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 14 }}>Diapositive {index + 1}</strong>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-outline" onClick={() => moveSlide(index, -1)} disabled={index === 0}>↑</button>
                  <button type="button" className="btn btn-outline" onClick={() => moveSlide(index, 1)} disabled={index === slides.length - 1}>↓</button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => removeSlide(slide.id)}
                    disabled={slides.length === 1}
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <ImageInput
                label="Image de fond"
                value={slide.image_url}
                onChange={(url) => updateSlide(slide.id, { image_url: url })}
              />
              <div>
                <label>Titre</label>
                <input value={slide.title} onChange={(e) => updateSlide(slide.id, { title: e.target.value })} />
              </div>
              <div>
                <label>Description / sous-titre</label>
                <textarea rows={2} value={slide.subtitle} onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })} />
              </div>
              <div>
                <label>Citation / pensée (facultatif)</label>
                <textarea rows={2} value={slide.quote} onChange={(e) => updateSlide(slide.id, { quote: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label>Texte du bouton</label>
                  <input
                    value={slide.cta_text}
                    onChange={(e) => updateSlide(slide.id, { cta_text: e.target.value })}
                    placeholder="Ex : Découvrir"
                  />
                </div>
                <div>
                  <label>Lien du bouton</label>
                  <input
                    value={slide.cta_link}
                    onChange={(e) => updateSlide(slide.id, { cta_link: e.target.value })}
                    placeholder="Ex : /presentation"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-outline" onClick={addSlide} style={{ justifySelf: 'start' }}>
          + Ajouter une diapositive
        </button>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />

        <div>
          <label>Texte de présentation (affiché sous les diapositives)</label>
          <RichTextEditor
            value={settings.home_intro_html}
            onChange={(html) => setSettings({ ...settings, home_intro_html: html })}
          />
        </div>
        <div>
          <label>Témoignages (section libre, mise en forme comme vous le souhaitez)</label>
          <RichTextEditor
            value={settings.home_testimonials_html}
            onChange={(html) => setSettings({ ...settings, home_testimonials_html: html })}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary">Enregistrer</button>
          <Link to="/admin" className="btn btn-outline">Fermer</Link>
          {saved && <span style={{ color: 'var(--success)' }}>Enregistré ✓</span>}
        </div>
      </form>
    </div>
  );
}
