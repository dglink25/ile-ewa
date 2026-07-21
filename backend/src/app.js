require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

/* ── CORS — liste blanche + fallback open en dev ── */
const ALLOWED = [
  'https://ile-ewa.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://portail-ileewa.com',
  'https://www.portail-ileewa.com',
  // Ajouter ici tout autre domaine frontend si besoin
  ...(process.env.CLIENT_URL || '').split(',').map((s) => s.trim()).filter(Boolean),
];

app.use(cors({
  origin: (origin, cb) => {
    // Sans origin = Postman / curl / server-to-server → OK
    if (!origin) return cb(null, true);
    if (ALLOWED.includes(origin)) return cb(null, true);
    // En NODE_ENV=development : tout autoriser
    if (process.env.NODE_ENV !== 'production') return cb(null, true);
    cb(new Error(`CORS: origine non autorisée → ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Répondre immédiatement aux preflight OPTIONS
app.options('*', cors());
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
app.use('/sitemap.xml', require('./routes/sitemap'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable.' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur.' });
});

module.exports = app;
