const knexLib = require('knex');
const config = require('./knexfile');

const knex = knexLib(config);

module.exports = knex;
