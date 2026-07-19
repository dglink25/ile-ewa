exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.timestamp('email_verified_at').nullable();
    table.string('verification_token', 255).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('email_verified_at');
    table.dropColumn('verification_token');
  });
};
