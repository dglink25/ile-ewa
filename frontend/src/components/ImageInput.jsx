import { useRef, useState } from 'react';
import api from '../api/client';

/**
 * Champ image universel : permet de coller une URL d'image existante
 * OU d'uploader directement un fichier depuis son ordinateur (le fichier
 * est envoyé à la médiathèque et l'URL obtenue remplace automatiquement
 * le champ). Pensé pour un utilisateur non technique.
 */
export default function ImageInput({ value, onChange, label }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.path);
    } catch (err) {
      setError("Erreur lors de l'envoi du fichier.");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      {label && <label>{label}</label>}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Collez une URL d'image, ou cliquez sur « Parcourir »"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ whiteSpace: 'nowrap' }}
        >
          {uploading ? 'Envoi…' : 'Parcourir…'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 4 }}>{error}</p>}
      {value && (
        <img
          src={value}
          alt="Aperçu"
          style={{ marginTop: 10, maxHeight: 140, borderRadius: 8, border: '1px solid var(--border)' }}
        />
      )}
    </div>
  );
}
