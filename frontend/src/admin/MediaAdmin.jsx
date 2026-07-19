import { useEffect, useState } from 'react';
import api from '../api/client';

export default function MediaAdmin() {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);

  function load() {
    api.get('/media').then(({ data }) => setMedia(data.media));
  }
  useEffect(() => { load(); }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await api.post('/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      load();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce fichier ?')) return;
    await api.delete(`/media/${id}`);
    load();
  }

  function copyUrl(path) {
    navigator.clipboard.writeText(window.location.origin + path);
    alert('Lien copié ! Collez-le dans le champ "image de couverture" ou "photo".');
  }

  return (
    <div>
      <h1>Médiathèque</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Ajoutez vos images ici, puis copiez le lien pour l'utiliser dans une page, un article ou une fiche membre.
      </p>

      <label className="btn btn-primary" style={{ display: 'inline-block', marginBottom: 24 }}>
        {uploading ? 'Envoi en cours…' : '+ Ajouter un fichier'}
        <input type="file" onChange={handleUpload} style={{ display: 'none' }} accept="image/*,application/pdf" />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        {media.map((m) => (
          <div key={m.id} className="card" style={{ padding: 10 }}>
            {m.mime_type.startsWith('image/') ? (
              <img src={m.path} alt={m.original_name} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
            ) : (
              <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>PDF</div>
            )}
            <p style={{ fontSize: 12, marginTop: 8, wordBreak: 'break-all' }}>{m.original_name}</p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 10px' }} onClick={() => copyUrl(m.path)}>Copier le lien</button>
              <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 10px' }} onClick={() => handleDelete(m.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
