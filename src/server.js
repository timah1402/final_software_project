require('dotenv').config();
const app = require('./app');
const { getDb } = require('./db');
const { createTables } = require('../scripts/schema');

const PORT = process.env.PORT || 3000;

async function start() {
  const db = getDb();
  createTables(db);

  // Auto-seed if database is empty (needed for Vercel cold starts)
  const staffCount = db.prepare('SELECT COUNT(*) as count FROM STAFF_USER').get().count;
  if (staffCount === 0) {
    console.log('Empty database detected — running seed...');
    await require('../scripts/seed').seedDb(db);
  }

  app.listen(PORT, () => {
    console.log(`Gym System API running on http://localhost:${PORT}`);
  });
}

start().catch(err => { console.error(err); process.exit(1); });
