require('dotenv').config({ path: '.env.local' });
const courseController = require('./controllers/courseController');
const req = { user: { id: 8 } };
const res = {
  json: (data) => console.log('res.json called with', data.length, 'courses'),
  status: (code) => ({ json: (data) => console.log('res.status', code, data) })
};
async function run() {
  await courseController.getMyCourses(req, res);
}
run();
