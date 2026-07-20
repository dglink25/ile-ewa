exports.up = function (knex) {
  return knex.schema.alterTable('pages', (table) => {
    // Stocké en JSON texte (comme home_slides) : tableau de sections,
    // chacune avec sa propre image de fond, son titre, son ancre et son contenu riche.
    table.text('sections').nullable(); // JSON texte — tableau de sections
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('pages', (table) => {
    table.dropColumn('sections');
  });
};
