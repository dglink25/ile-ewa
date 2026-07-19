const knex = require('../db/knex');

// Public : annuaire des membres publiés
async function listPublic(req, res) {
  const profiles = await knex('profiles')
    .where({ is_published: true })
    .select('id', 'display_name', 'slug', 'avatar_url', 'city', 'bio_html')
    .orderBy('display_name', 'asc');
  res.json({ profiles });
}

async function getPublicBySlug(req, res) {
  const profile = await knex('profiles').where({ slug: req.params.slug, is_published: true }).first();
  if (!profile) return res.status(404).json({ error: 'Profil introuvable.' });
  res.json({ profile });
}

// Membre connecté : gère sa propre fiche
async function getMyProfile(req, res) {
  const profile = await knex('profiles').where({ user_id: req.user.id }).first();
  res.json({ profile });
}

async function updateMyProfile(req, res) {
  const { display_name, avatar_url, bio_html, phone, city, socials } = req.body;
  await knex('profiles').where({ user_id: req.user.id }).update({
    display_name,
    avatar_url,
    bio_html,
    phone,
    city,
    socials: socials ? JSON.stringify(socials) : null,
    updated_at: knex.fn.now(),
  });
  res.json({ message: 'Profil mis à jour.' });
}

// Admin : liste complète + validation de publication
async function listAll(req, res) {
  const profiles = await knex('profiles')
    .join('users', 'users.id', 'profiles.user_id')
    .select('profiles.*', 'users.email', 'users.status as account_status')
    .orderBy('profiles.created_at', 'desc');
  res.json({ profiles });
}

async function setPublished(req, res) {
  const { is_published } = req.body;
  await knex('profiles').where({ id: req.params.id }).update({ is_published: !!is_published });
  res.json({ message: 'Statut de publication mis à jour.' });
}

async function adminUpdate(req, res) {
  const { display_name, avatar_url, bio_html, phone, city, socials, is_published } = req.body;
  await knex('profiles').where({ id: req.params.id }).update({
    display_name, avatar_url, bio_html, phone, city,
    socials: socials ? JSON.stringify(socials) : null,
    is_published: !!is_published,
    updated_at: knex.fn.now(),
  });
  res.json({ message: 'Fiche membre mise à jour.' });
}

module.exports = {
  listPublic, getPublicBySlug, getMyProfile, updateMyProfile,
  listAll, setPublished, adminUpdate,
};
