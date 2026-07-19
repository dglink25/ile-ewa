const knex = require('../db/knex');

async function listPublic(req, res) {
  const menus = await knex('menus')
    .leftJoin('pages', 'pages.id', 'menus.page_id')
    .where('menus.is_visible', true)
    .select('menus.id', 'menus.label', 'menus.url', 'menus.parent_id', 'menus.position', 'pages.slug as page_slug')
    .orderBy('menus.position', 'asc');
  res.json({ menus });
}

async function listAll(req, res) {
  const menus = await knex('menus').orderBy('position', 'asc');
  res.json({ menus });
}

async function create(req, res) {
  const { label, url, page_id, parent_id, position, is_visible } = req.body;
  const [id] = await knex('menus').insert({
    label, url: url || null, page_id: page_id || null, parent_id: parent_id || null,
    position: position || 0, is_visible: is_visible !== false,
  });
  res.status(201).json({ id });
}

async function update(req, res) {
  const { label, url, page_id, parent_id, position, is_visible } = req.body;
  await knex('menus').where({ id: req.params.id }).update({
    label, url: url || null, page_id: page_id || null, parent_id: parent_id || null,
    position, is_visible,
  });
  res.json({ message: 'Menu mis à jour.' });
}

async function remove(req, res) {
  await knex('menus').where({ id: req.params.id }).del();
  res.json({ message: 'Élément de menu supprimé.' });
}

module.exports = { listPublic, listAll, create, update, remove };
