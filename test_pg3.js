const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
async function run() {
  await client.connect();
  const res = await client.query('SELECT id, name, "storageProvider", length(data) as data_length FROM "Document" ORDER BY id DESC LIMIT 5');
  console.log('Recent Documents:', res.rows);
  await client.end();
}
run();
