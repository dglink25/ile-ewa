import { useEffect, useState } from 'react';
import api from '../api/client';

export default function MembersAdmin() {
  const [profiles, setProfiles] = useState([]);

  function load() {
    api.get('/profiles').then(({ data }) => setProfiles(data.profiles));
  }

  useEffect(() => { load(); }, []);

  async function togglePublish(p) {
    await api.put(`/profiles/${p.id}/publish`, { is_published: !p.is_published });
    load();
  }

  return (
    <div>
      <h1>Membres</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Validez les fiches à publier dans l'annuaire public. Les membres modifient leur propre contenu
        depuis leur espace membre.
      </p>

      <div style={{ overflowX: 'auto', marginTop: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: 10 }}>Nom</th>
            <th style={{ padding: 10 }}>Email</th>
            <th style={{ padding: 10 }}>Publié dans l'annuaire</th>
            <th style={{ padding: 10 }}></th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: 10 }}>{p.display_name}</td>
              <td style={{ padding: 10 }}>{p.email}</td>
              <td style={{ padding: 10 }}>{p.is_published ? 'Oui' : 'Non'}</td>
              <td style={{ padding: 10 }}>
                <button className="btn btn-outline" onClick={() => togglePublish(p)}>
                  {p.is_published ? 'Dépublier' : 'Publier'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
