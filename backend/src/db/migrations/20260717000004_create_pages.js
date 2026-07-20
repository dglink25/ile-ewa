exports.up = function (knex) {
  return knex.schema.createTable('pages', (table) => {
    table.increments('id').primary();
    table.string('title', 190).notNullable();
    table.string('slug', 190).notNullable().unique();
    table.text('content_html').nullable(); // édité via TipTap (WYSIWYG)
    table.string('cover_image_url', 500).nullable();
    table.enu('status', ['draft', 'published']).notNullable().defaultTo('draft');
    table.json('meta').nullable(); // seo title/description etc.
    table.integer('created_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('pages');
};
