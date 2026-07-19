/**
 * Ajout des champs événement / formation sur la table articles :
 *  - start_date / end_date        : période de déroulement
 *  - is_free                      : gratuit (1) ou payant (0)
 *  - price                        : tarif plein (décimal)
 *  - has_promo                    : promotion active
 *  - promo_price                  : prix promotionnel
 *  - promo_start / promo_end      : période de la promotion
 *  - supports                     : JSON — tableau de { name, path, mime }
 *  - registration_questions       : JSON — tableau de { id, label, required }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('articles', (table) => {
    table.date('start_date').nullable();
    table.date('end_date').nullable();
    table.boolean('is_free').notNullable().defaultTo(true);
    table.decimal('price', 10, 2).nullable();
    table.boolean('has_promo').notNullable().defaultTo(false);
    table.decimal('promo_price', 10, 2).nullable();
    table.date('promo_start').nullable();
    table.date('promo_end').nullable();
    table.text('supports').nullable();               // JSON stringifié
    table.text('registration_questions').nullable(); // JSON stringifié
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('articles', (table) => {
    table.dropColumn('start_date');
    table.dropColumn('end_date');
    table.dropColumn('is_free');
    table.dropColumn('price');
    table.dropColumn('has_promo');
    table.dropColumn('promo_price');
    table.dropColumn('promo_start');
    table.dropColumn('promo_end');
    table.dropColumn('supports');
    table.dropColumn('registration_questions');
  });
};
