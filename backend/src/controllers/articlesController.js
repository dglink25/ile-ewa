const slugify = require('slugify');
const knex = require('../db/knex');

async function listPublic(req, res) {
  const { category } = req.query;
  let query = knex('articles')
    .leftJoin('categories', 'categories.id', 'articles.category_id')
    .where('articles.status', 'published')
    .select('articles.id', 'articles.title', 'articles.slug', 'articles.excerpt',
      'articles.cover_image_url', 'articles.published_at', 'categories.name as category_name', 'categories.slug as category_slug')
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
  res.json({ article });
}

async function listAll(req, res) {
  const articles = await knex('articles')
    .leftJoin('categories', 'categories.id', 'articles.category_id')
    .select('articles.id', 'articles.title', 'articles.slug', 'articles.status',
      'articles.updated_at', 'categories.name as category_name')
    .orderBy('articles.updated_at', 'desc');
  res.json({ articles });
}

async function getById(req, res) {
  const article = await knex('articles').where({ id: req.params.id }).first();
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });
  res.json({ article });
}

async function create(req, res) {
  const { title, excerpt, content_html, cover_image_url, category_id, status } = req.body;
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
  });

  res.status(201).json({ id, slug });
}

async function update(req, res) {
  const article = await knex('articles').where({ id: req.params.id }).first();
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });

  const { title, excerpt, content_html, cover_image_url, category_id, status } = req.body;
  const becomesPublished = status === 'published' && article.status !== 'published';

  await knex('articles').where({ id: req.params.id }).update({
    title: title ?? article.title,
    excerpt: excerpt ?? article.excerpt,
    content_html: content_html ?? article.content_html,
    cover_image_url: cover_image_url ?? article.cover_image_url,
    category_id: category_id ?? article.category_id,
    status: status ?? article.status,
    published_at: becomesPublished ? knex.fn.now() : article.published_at,
    updated_at: knex.fn.now(),
  });

  res.json({ message: 'Article mis à jour.' });
}

async function remove(req, res) {
  await knex('articles').where({ id: req.params.id }).del();
  res.json({ message: 'Article supprimé.' });
}

module.exports = { listPublic, getPublicBySlug, listAll, getById, create, update, remove };
