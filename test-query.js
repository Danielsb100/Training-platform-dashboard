const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        enrollments: { some: { userId: 1, status: { not: 'CANCELLED' } } },
        ownerMasterId: { not: 1 }
      }
    });
    console.log('OK', courses.length);
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
