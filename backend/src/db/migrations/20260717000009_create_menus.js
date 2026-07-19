exports.up = function (knex) {
  return knex.schema.createTable('menus', (table) => {
    table.increments('id').primary();
    table.string('label', 150).notNullable();
    table.string('url', 500).nullable(); // lien externe ou interne libre
    table.integer('page_id').unsigned().nullable()
      .references('id').inTable('pages').onDelete('CASCADE'); // ou lien vers une page interne
    table.integer('parent_id').unsigned().nullable()
      .references('id').inTable('menus').onDelete('CASCADE');
    table.integer('position').unsigned().notNullable().defaultTo(0);
    table.boolean('is_visible').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('menus');
};
