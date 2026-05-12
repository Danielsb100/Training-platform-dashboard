const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
async function run() {
  await client.connect();
  const res = await client.query('SELECT * FROM "CourseEditor"');
  console.log('CourseEditors:', res.rows);
  const users = await client.query('SELECT id, email, username FROM "User"');
  console.log('Users:', users.rows.filter(u => res.rows.some(r => r.userId === u.id)));
  await client.end();
}
run();
