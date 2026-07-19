require('dotenv').config();

/**
 * Configuration Knex — migrations évolutives.
 * Chaque évolution du schéma = un nouveau fichier de migration (jamais on
 * modifie un ancien fichier déjà exécuté en prod). On lance
 * `npm run migrate` pour appliquer les nouvelles migrations sans jamais
 * toucher aux données déjà en base.
 */
module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ile_ewa',
    charset: 'utf8mb4',
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
  },
  pool: { min: 0, max: 10 },
};
