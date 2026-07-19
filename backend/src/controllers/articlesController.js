const slugify = require('slugify');
const knex = require('../db/knex');

/* ── helpers ── */
function parseJson(val, fallback = null) {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

function toJson(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string') return val; // déjà sérialisé côté client
  return JSON.stringify(val);
}

/* ─────────────────────────────────────────
   PUBLIC
───────────────────────────────────────── */
async function listPublic(req, res) {
  const { category } = req.query;
  let query = knex('articles')
    .leftJoin('categories', 'categories.id', 'articles.category_id')
    .where('articles.status', 'published')
    .select(
      'articles.id', 'articles.title', 'articles.slug', 'articles.excerpt',
      'articles.cover_image_url', 'articles.published_at',
      'articles.start_date', 'articles.end_date',
      'articles.is_free', 'articles.price', 'articles.has_promo',
      'articles.promo_price', 'articles.promo_start', 'articles.promo_end',
      'categories.name as category_name', 'categories.slug as category_slug',
    )
    .orderBy('articles.published_at', 'desc');

  if (category) query = query.where('categories.slug', category);
  const articles = await query;
  res.json({ articles });
}

async function getPublicBySlug(req, res) {
  const article = await knex('articles')
    .leftJoin('categories', 'categories.id', 'articles.category_id')
    .leftJoin('profiles', 'profiles.user_id', 'articles.author_id')
    .where('articles.slug', req.params.slug)
    .andWhere('articles.status', 'published')
    .select('articles.*', 'categories.name as category_name', 'profiles.display_name as author_name')
    .first();

  if (!article) return res.status(404).json({ error: 'Article introuvable.' });

  // Désérialiser JSON
  article.supports = parseJson(article.supports, []);
  article.registration_questions = parseJson(article.registration_questions, []);

  res.json({ article });
}

/* ─────────────────────────────────────────
   ADMIN — liste
───────────────────────────────────────── */
async function listAll(req, res) {
  const articles = await knex('articles')
    .leftJoin('categories', 'categories.id', 'articles.category_id')
    .select(
      'articles.id', 'articles.title', 'articles.slug', 'articles.status',
      'articles.updated_at', 'categories.name as category_name',
    )
    .orderBy('articles.updated_at', 'desc');
  res.json({ articles });
}

async function getById(req, res) {
  const article = await knex('articles').where({ id: req.params.id }).first();
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });

  article.supports = parseJson(article.supports, []);
  article.registration_questions = parseJson(article.registration_questions, []);

  res.json({ article });
}

/* ─────────────────────────────────────────
   ADMIN — création
───────────────────────────────────────── */
async function create(req, res) {
  const {
    title, excerpt, content_html, cover_image_url, category_id, status,
    start_date, end_date,
    is_free, price, has_promo, promo_price, promo_start, promo_end,
    supports, registration_questions,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'Le titre est requis.' });

  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;
  while (await knex('articles').where({ slug }).first()) slug = `${baseSlug}-${i++}`;

  const [id] = await knex('articles').insert({
    title,
    slug,
    excerpt: excerpt || null,
    content_html: content_html || '',
    cover_image_url: cover_image_url || null,
    category_id: category_id || null,
    author_id: req.user.id,
    status: status || 'draft',
    published_at: status === 'published' ? knex.fn.now() : null,
    // Nouveaux champs
    start_date: start_date || null,
    end_date: end_date || null,
    is_free: is_free !== false && is_free !== 'false' ? 1 : 0,
    price: price || null,
    has_promo: has_promo === true || has_promo === 'true' ? 1 : 0,
    promo_price: promo_price || null,
    promo_start: promo_start || null,
    promo_end: promo_end || null,
    supports: toJson(supports),
    registration_questions: toJson(registration_questions),
  });

  res.status(201).json({ id, slug });
}

/* ─────────────────────────────────────────
   ADMIN — mise à jour
───────────────────────────────────────── */
async function update(req, res) {
  const article = await knex('articles').where({ id: req.params.id }).first();
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });

  const {
    title, excerpt, content_html, cover_image_url, category_id, status,
    start_date, end_date,
    is_free, price, has_promo, promo_price, promo_start, promo_end,
    supports, registration_questions,
  } = req.body;

  const becomesPublished = status === 'published' && article.status !== 'published';

  await knex('articles').where({ id: req.params.id }).update({
    title: title ?? article.title,
    excerpt: excerpt ?? article.excerpt,
    content_html: content_html ?? article.content_html,
    cover_image_url: cover_image_url ?? article.cover_image_url,
    category_id: category_id ?? article.category_id,
    status: status ?? article.status,
    published_at: becomesPublished ? knex.fn.now() : article.published_at,
    // Nouveaux champs
    start_date: start_date !== undefined ? (start_date || null) : article.start_date,
    end_date: end_date !== undefined ? (end_date || null) : article.end_date,
    is_free: is_free !== undefined ? (is_free === true || is_free === 'true' ? 1 : 0) : article.is_free,
    price: price !== undefined ? (price || null) : article.price,
    has_promo: has_promo !== undefined ? (has_promo === true || has_promo === 'true' ? 1 : 0) : article.has_promo,
    promo_price: promo_price !== undefined ? (promo_price || null) : article.promo_price,
    promo_start: promo_start !== undefined ? (promo_start || null) : article.promo_start,
    promo_end: promo_end !== undefined ? (promo_end || null) : article.promo_end,
    supports: supports !== undefined ? toJson(supports) : article.supports,
    registration_questions: registration_questions !== undefined ? toJson(registration_questions) : article.registration_questions,
    updated_at: knex.fn.now(),
  });

  res.json({ message: 'Article mis à jour.' });
}

/* ─────────────────────────────────────────
   ADMIN — upload de supports de formation
───────────────────────────────────────── */
async function uploadSupport(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucun fichier reçu.' });
  }

  const uploaded = req.files.map((f) => ({
    name: f.originalname,
    path: `/uploads/${f.filename}`,
    mime: f.mimetype,
    size: f.size,
  }));

  res.status(201).json({ files: uploaded });
}

/* ─────────────────────────────────────────
   ADMIN — suppression
───────────────────────────────────────── */
async function remove(req, res) {
  await knex('articles').where({ id: req.params.id }).del();
  res.json({ message: 'Article supprimé.' });
}

module.exports = {
  listPublic, getPublicBySlug,
  listAll, getById, create, update, remove,
  uploadSupport,
};
