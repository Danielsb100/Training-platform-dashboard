const courseController = require('./controllers/courseController');
const prisma = require('./config/db');

async function run() {
  const req = { user: { id: 1 } };
  const res = {
    json: (data) => console.log('JSON:', data),
    status: (code) => {
      console.log('STATUS:', code);
      return { json: (data) => console.log('JSON:', data) };
    }
  };
  
  try {
    await courseController.getEnrolledCourses(req, res);
  } catch (err) {
    console.error('CRASH:', err.message);
  } finally {
    process.exit(0);
  }
}
run();
