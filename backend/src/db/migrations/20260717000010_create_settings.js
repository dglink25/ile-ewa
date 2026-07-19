exports.up = function (knex) {
  return knex.schema.createTable('settings', (table) => {
    table.string('key', 100).primary();
    table.text('value').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('settings');
};
