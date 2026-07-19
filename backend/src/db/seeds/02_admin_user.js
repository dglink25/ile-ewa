const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  const admin = await knex('users').where({ email: 'admin@ile-ewa.com' }).first();
  if (!admin) {
    const adminRole = await knex('roles').where({ name: 'admin' }).first();
    const password_hash = await bcrypt.hash('ChangeMoi123!', 10);
    await knex('users').insert({
      email: 'admin@ile-ewa.com',
      password_hash,
      role_id: adminRole.id,
      status: 'active',
    });
    console.log('Admin par défaut créé : admin@ile-ewa.com / ChangeMoi123! (à changer immédiatement)');
  }
};
