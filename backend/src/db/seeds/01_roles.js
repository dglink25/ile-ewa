exports.seed = async function (knex) {
  const existing = await knex('roles').select('id');
  if (existing.length === 0) {
    await knex('roles').insert([
      { name: 'admin' },
      { name: 'member' },
    ]);
  }
};
