const knex = require('../db/knex');

async function getPublicSettings(req, res) {
  const rows = await knex('settings').select('key', 'value');
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json({ settings });
}

async function updateSettings(req, res) {
  const updates = req.body; // { site_name: '...', logo_url: '...', accent_color: '#...', ... }
  const entries = Object.entries(updates);
  await knex.transaction(async (trx) => {
    for (const [key, value] of entries) {
      const existing = await trx('settings').where({ key }).first();
      if (existing) {
        await trx('settings').where({ key }).update({ value, updated_at: trx.fn.now() });
      } else {
        await trx('settings').insert({ key, value });
      }
    }
  });
  res.json({ message: 'Paramètres mis à jour.' });
}

module.exports = { getPublicSettings, updateSettings };
