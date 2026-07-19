const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const knex = require('../db/knex');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const categories = await knex('categories').select('*').orderBy('name');
  res.json({ categories });
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom est requis.' });
  const slug = slugify(name, { lower: true, strict: true });
  const [id] = await knex('categories').insert({ name, slug });
  res.status(201).json({ id, slug });
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await knex('categories').where({ id: req.params.id }).del();
  res.json({ message: 'Catégorie supprimée.' });
});

module.exports = router;
