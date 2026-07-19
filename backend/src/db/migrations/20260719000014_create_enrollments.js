/**
 * Table enrollments — inscriptions aux formations/articles
 *
 * status :
 *   - 'pending'   : paiement initié mais non confirmé
 *   - 'paid'      : paiement confirmé (FedaPay webhook ou gratuit direct)
 *   - 'free'      : inscription gratuite
 *   - 'cancelled' : annulée
 */
exports.up = function (knex) {
  return knex.schema.createTable('enrollments', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('article_id').unsigned().notNullable()
      .references('id').inTable('articles').onDelete('CASCADE');
    table.enu('status', ['pending', 'paid', 'free', 'cancelled'])
      .notNullable().defaultTo('pending');
    // Réponses aux questions d'inscription (JSON)
    table.text('answers').nullable();
    // Référence transaction FedaPay
    table.string('fedapay_transaction_id', 100).nullable();
    table.integer('amount_paid').nullable(); // en FCFA
    table.timestamp('paid_at').nullable();
    table.timestamps(true, true);
    // Un utilisateur ne peut s'inscrire qu'une fois par article
    table.unique(['user_id', 'article_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enrollments');
};
