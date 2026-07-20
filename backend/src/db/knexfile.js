const path = require('path');

// Essayer plusieurs chemins pour trouver le .env
// (le CLI knex change le cwd vers src/db/)
const envPaths = [
  path.resolve(__dirname, '../../../../.env'),  // src/db/ → ile-ewa/ (racine projet)
  path.resolve(__dirname, '../../../.env'),      // src/db/ → backend/
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '../../../.env'),
];

for (const p of envPaths) {
  const result = require('dotenv').config({ path: p });
  if (!result.error && process.env.DATABASE_URL) break;
}

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    `DATABASE_URL introuvable.\nChemins testés :\n${envPaths.join('\n')}\n` +
    `cwd: ${process.cwd()}, __dirname: ${__dirname}`,
  );
}

module.exports = {
  client: 'pg',

  connection: {
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  },

  migrations: {
    directory: path.resolve(__dirname, 'migrations'),
    tableName: 'knex_migrations',
  },

  seeds: {
    directory: path.resolve(__dirname, 'seeds'),
  },

  pool: { min: 0, max: 10 },
};
