const slugify = require('slugify');
const knex = require('../db/knex');

// Public : uniquement les pages publiées
async function getPublicBySlug(req, res) {
  const page = await knex('pages').where({ slug: req.params.slug, status: 'published' }).first();
  if (!page) return res.status(404).json({ error: 'Page introuvable.' });
  res.json({ page });
}

// Admin : liste complète (brouillons inclus)
async function listAll(req, res) {
  const pages = await knex('pages').select('id', 'title', 'slug', 'status', 'updated_at').orderBy('updated_at', 'desc');
  res.json({ pages });
}

async function getById(req, res) {
  const page = await knex('pages').where({ id: req.params.id }).first();
  if (!page) return res.status(404).json({ error: 'Page introuvable.' });
  res.json({ page });
}

async function create(req, res) {
  const { title, content_html, cover_image_url, status, meta, sections } = req.body;
  if (!title) return res.status(400).json({ error: 'Le titre est requis.' });

  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;
  while (await knex('pages').where({ slug }).first()) slug = `${baseSlug}-${i++}`;

  const [id] = await knex('pages').insert({
    title,
    slug,
    content_html: content_html || '',
    cover_image_url: cover_image_url || null,
    status: status || 'draft',
    meta: meta ? JSON.stringify(meta) : null,
    sections: sections || null,
    created_by: req.user.id,
  });

  res.status(201).json({ id, slug });
}

async function update(req, res) {
  const { title, content_html, cover_image_url, status, meta, sections } = req.body;
  const page = await knex('pages').where({ id: req.params.id }).first();
  if (!page) return res.status(404).json({ error: 'Page introuvable.' });

  await knex('pages').where({ id: req.params.id }).update({
    title: title ?? page.title,
    content_html: content_html ?? page.content_html,
    cover_image_url: cover_image_url ?? page.cover_image_url,
    status: status ?? page.status,
    meta: meta ? JSON.stringify(meta) : page.meta,
    sections: sections ?? page.sections,
    updated_at: knex.fn.now(),
  });

  res.json({ message: 'Page mise à jour.' });
}

async function remove(req, res) {
  await knex('pages').where({ id: req.params.id }).del();
  res.json({ message: 'Page supprimée.' });
}

module.exports = { getPublicBySlug, listAll, getById, create, update, remove };
