import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ile-ewa-access-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rafraîchit automatiquement le token expiré une fois puis rejoue la requête
let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem('ile-ewa-refresh-token');
      if (!refreshToken) return Promise.reject(error);

      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject, original });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`, { refreshToken });
        localStorage.setItem('ile-ewa-access-token', data.accessToken);
        queue.forEach(({ resolve, original: o }) => {
          o.headers.Authorization = `Bearer ${data.accessToken}`;
          resolve(api(o));
        });
        queue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        localStorage.removeItem('ile-ewa-access-token');
        localStorage.removeItem('ile-ewa-refresh-token');
        queue = [];
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
