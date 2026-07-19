exports.up = function (knex) {
  return knex.schema.createTable('newsletter_subscribers', (table) => {
    table.increments('id').primary();
    table.string('email', 190).notNullable().unique();
    table.enu('status', ['subscribed', 'unsubscribed']).notNullable().defaultTo('subscribed');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('newsletter_subscribers');
};
