const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:wXbHDokoBRiBkWhuREsSpMmNvyVuKUae@shortline.proxy.rlwy.net:32534/railway' });
client.connect()
  .then(() => client.query('SELECT id, title, status FROM "Course"'))
  .then(res => {
    console.log(res.rows);
    client.end();
  })
  .catch(err => {
    console.error(err);
    client.end();
  });
