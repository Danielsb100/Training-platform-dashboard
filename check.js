const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.course.findFirst({ where: { title: 'BigOSint' } });
  if (c) {
    console.log('Course ID:', c.id);
    console.log('coverImage length:', c.coverImage ? c.coverImage.length : 0);
    if (c.coverImage) {
        console.log('coverImage snippet:', c.coverImage.substring(0, 50));
    }
  } else {
    console.log('Course not found');
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
