const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
async function run() {
  await client.connect();
  const res = await client.query('SELECT m.id, m.title, m.status, m."ownerMasterId" FROM "TrainingModule" m ORDER BY m.id DESC LIMIT 5');
  console.log('Recent Modules:', res.rows);
  await client.end();
}
run();
