const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:bJvRylShtOIdHjQyHstFhVbYpGZkXzUa@railway.cxu1620.com:5432/railway';

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes('railway') ? { rejectUnauthorized: false } : false,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Adding titleFont and textColor columns to TrainingModule...');
    await client.query(`ALTER TABLE "TrainingModule" ADD COLUMN "titleFont" TEXT;`);
    await client.query(`ALTER TABLE "TrainingModule" ADD COLUMN "textColor" TEXT;`);
    console.log('Columns added successfully.');
  } catch (error) {
    if (error.code === '42701') {
      console.log('Columns already exist.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    client.release();
    pool.end();
  }
}

run();
