const knex = require('../db/knex');

async function upload(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });

  const [id] = await knex('media').insert({
    filename: req.file.filename,
    original_name: req.file.originalname,
    path: `/uploads/${req.file.filename}`,
    mime_type: req.file.mimetype,
    size_bytes: req.file.size,
    uploaded_by: req.user.id,
  });

  res.status(201).json({ id, path: `/uploads/${req.file.filename}` });
}

async function list(req, res) {
  const media = await knex('media').orderBy('created_at', 'desc');
  res.json({ media });
}

async function remove(req, res) {
  await knex('media').where({ id: req.params.id }).del();
  res.json({ message: 'Fichier supprimé de la médiathèque.' });
}

module.exports = { upload, list, remove };
