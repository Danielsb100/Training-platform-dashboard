require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const editors = await prisma.courseEditor.findMany({ include: { user: true, course: true } });
  console.log('Total editors:', editors.length);
  for (const e of editors) {
    console.log(`Course: ${e.course.title}, Editor ID: ${e.userId}, Editor Email: ${e.user.email}`);
  }
}
run();
