exports.up = function (knex) {
  return knex.schema.createTable('profiles', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().unique()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('display_name', 150).notNullable();
    table.string('slug', 190).notNullable().unique();
    table.string('avatar_url', 500).nullable();
    table.text('bio_html').nullable(); // contenu riche (gras, tableau, couleurs...)
    table.string('phone', 50).nullable();
    table.string('city', 150).nullable();
    table.json('socials').nullable(); // { facebook, instagram, linkedin, website }
    table.boolean('is_published').notNullable().defaultTo(false); // visible dans l'annuaire public
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('profiles');
};
