const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  const admin = await knex('users').where({ email: 'admin@ile-ewa.com' }).first();

  let adminId;

  if (!admin) {
    const adminRole = await knex('roles').where({ name: 'admin' }).first();
    const password_hash = await bcrypt.hash('ChangeMoi123!', 10);
    const [id] = await knex('users').insert({
      email: 'admin@ile-ewa.com',
      password_hash,
      role_id: adminRole.id,
      status: 'active',
    });
    adminId = id;
    console.log('Admin par défaut créé : admin@ile-ewa.com / ChangeMoi123! (à changer immédiatement)');
  } else {
    adminId = admin.id;
  }

  // Créer le profil admin s'il n'existe pas
  const existing = await knex('profiles').where({ user_id: adminId }).first();
  if (!existing) {
    await knex('profiles').insert({
      user_id: adminId,
      display_name: 'Administrateur',
      slug: 'administrateur',
      is_published: false,
    });
    console.log('Profil admin créé.');
  }
};
