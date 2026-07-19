exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 190).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.integer('role_id').unsigned().notNullable()
      .references('id').inTable('roles').onDelete('RESTRICT');
    table.enu('status', ['pending', 'active', 'suspended']).notNullable().defaultTo('active');
    table.string('reset_token', 255).nullable();
    table.timestamp('reset_token_expires_at').nullable();
    table.timestamp('last_login_at').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
