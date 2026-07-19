const knex = require('../db/knex');

async function subscribe(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis.' });

  const existing = await knex('newsletter_subscribers').where({ email }).first();
  if (existing) {
    if (existing.status === 'unsubscribed') {
      await knex('newsletter_subscribers').where({ email }).update({ status: 'subscribed' });
    }
    return res.json({ message: 'Inscription confirmée.' });
  }

  await knex('newsletter_subscribers').insert({ email, status: 'subscribed' });
  res.status(201).json({ message: 'Inscription confirmée.' });
}

async function unsubscribe(req, res) {
  const { email } = req.body;
  await knex('newsletter_subscribers').where({ email }).update({ status: 'unsubscribed' });
  res.json({ message: 'Désinscription effectuée.' });
}

// Admin : export liste
async function listAll(req, res) {
  const subscribers = await knex('newsletter_subscribers').orderBy('created_at', 'desc');
  res.json({ subscribers });
}

module.exports = { subscribe, unsubscribe, listAll };
