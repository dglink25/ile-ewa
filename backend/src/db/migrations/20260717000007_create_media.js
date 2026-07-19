exports.up = function (knex) {
  return knex.schema.createTable('media', (table) => {
    table.increments('id').primary();
    table.string('filename', 255).notNullable();
    table.string('original_name', 255).notNullable();
    table.string('path', 500).notNullable(); // chemin public /uploads/xxx
    table.string('mime_type', 100).notNullable();
    table.integer('size_bytes').unsigned().notNullable();
    table.integer('uploaded_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('media');
};
