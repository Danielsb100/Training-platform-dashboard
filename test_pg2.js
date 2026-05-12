const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
async function run() {
  await client.connect();
  const userId = 8;
  const res = await client.query(`
    SELECT * FROM "Course" 
    WHERE "ownerMasterId" = $1 
    OR id IN (SELECT "courseId" FROM "CourseEditor" WHERE "userId" = $1)
  `, [userId]);
  console.log('Courses for User 8:', res.rows.map(c => c.title));
  await client.end();
}
run();
