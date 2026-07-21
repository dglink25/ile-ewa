const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

const BASE = 'https://portail-ileewa.com';

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function url(loc, changefreq = 'monthly', priority = '0.7', lastmod = null) {
  return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

router.get('/', async (req, res) => {
  try {
    /* Pages statiques */
    const staticUrls = [
      url(`${BASE}/`,            'weekly',  '1.0'),
      url(`${BASE}/presentation`,'monthly', '0.9'),
      url(`${BASE}/blog`,        'weekly',  '0.8'),
      url(`${BASE}/actualites`,  'weekly',  '0.8'),
      url(`${BASE}/agenda`,      'weekly',  '0.8'),
      url(`${BASE}/membres`,     'monthly', '0.7'),
      url(`${BASE}/contact`,     'yearly',  '0.5'),
    ];

    /* Articles publiés */
    const articles = await knex('articles')
      .where({ status: 'published' })
      .select('slug', 'updated_at')
      .orderBy('updated_at', 'desc');

    const articleUrls = articles.map((a) =>
      url(`${BASE}/blog/${escapeXml(a.slug)}`, 'monthly', '0.7',
        a.updated_at ? new Date(a.updated_at) : null),
    );

    /* Articles avec date (agenda) */
    const events = await knex('articles')
      .where({ status: 'published' })
      .whereNotNull('start_date')
      .select('slug', 'updated_at');

    const eventUrls = events.map((e) =>
      url(`${BASE}/agenda`,  'weekly', '0.8'),
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join('')}
${articleUrls.join('')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // cache 1h
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Erreur génération sitemap');
  }
});

module.exports = router;
