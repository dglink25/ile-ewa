import { useState } from 'react';
import api from '../api/client';
import SEO from '../components/SEO';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: 620 }}>
      <SEO
        title="Contact"
        description="Contactez le cercle Ilé Ẹwà. Une question, une envie de collaborer ? Écrivez-nous."
        url="/contact"
      />
      <h1>Contact</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Une question, une envie de collaborer ? Écrivez-nous, nous revenons vers vous rapidement.
      </p>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: 'grid', gap: 16, marginTop: 24 }}>
        <div>
          <label>Votre nom</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label>Votre email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label>Message</label>
          <textarea rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        {status === 'success' && (
          <p style={{ color: 'var(--success)', fontSize: 14 }}>Votre message a bien été envoyé, merci !</p>
        )}
        {status === 'error' && (
          <p style={{ color: 'var(--danger)', fontSize: 14 }}>Une erreur est survenue, merci de réessayer.</p>
        )}
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? 'Envoi en cours…' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}
