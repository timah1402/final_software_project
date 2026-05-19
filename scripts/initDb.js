require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { getDb } = require('../src/db');
const { createTables } = require('./schema');

createTables(getDb());
console.log('Database schema initialized successfully.');
