require('dotenv').config();
const app = require('./app');
const { getDb } = require('./db');
const { createTables } = require('../scripts/schema');

const PORT = process.env.PORT || 3000;

// Auto-initialize schema on first start
createTables(getDb());

app.listen(PORT, () => {
  console.log(`Gym System API running on http://localhost:${PORT}`);
});
