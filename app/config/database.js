const { Pool } = require('pg');

const pgPool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'open_elective',
});

module.exports = { pgPool } ;