require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

/* ── CORS — accepte toutes les origines autorisées ── */
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Toujours autoriser localhost en dev
ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:3000');

app.use(cors({
  origin: (origin, callback) => {
    // Requêtes sans origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // En l'absence de liste configurée, tout autoriser
    if (ALLOWED_ORIGINS.length <= 2) return callback(null, true);
    callback(new Error(`CORS bloqué pour l'origine : ${origin}`));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Fichiers uploadés (images, etc.) servis statiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/media', require('./routes/media'));
app.use('/api/menus', require('./routes/menus'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/enrollments', require('./routes/enrollments'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable.' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur.' });
});

module.exports = app;
