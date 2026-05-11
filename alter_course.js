const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    
    // Check if columns exist
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Course' AND column_name='contentHtml';
    `);
    
    if (res.rows.length === 0) {
      console.log('Adding contentHtml and contentCss to Course table...');
      await client.query(`ALTER TABLE "Course" ADD COLUMN "contentHtml" TEXT;`);
      await client.query(`ALTER TABLE "Course" ADD COLUMN "contentCss" TEXT;`);
      console.log('Columns added successfully.');
    } else {
      console.log('Columns already exist.');
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
