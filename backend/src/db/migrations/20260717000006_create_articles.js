exports.up = function (knex) {
  return knex.schema.createTable('articles', (table) => {
    table.increments('id').primary();
    table.string('title', 190).notNullable();
    table.string('slug', 190).notNullable().unique();
    table.text('excerpt').nullable();
    table.longtext('content_html').nullable(); // WYSIWYG
    table.string('cover_image_url', 500).nullable();
    table.integer('category_id').unsigned().nullable()
      .references('id').inTable('categories').onDelete('SET NULL');
    table.integer('author_id').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.enu('status', ['draft', 'published']).notNullable().defaultTo('draft');
    table.timestamp('published_at').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('articles');
};
