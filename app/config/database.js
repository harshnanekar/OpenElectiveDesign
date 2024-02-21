const { Pool } = require('pg');
const { createClient } = require('redis');

const pgPool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'open_elective',
});

const redisDb = createClient();

module.exports = { pgPool,redisDb } ;