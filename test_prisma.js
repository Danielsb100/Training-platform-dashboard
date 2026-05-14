const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      landingPage: {
        select: { id: true, title: true }
      },
      owner: {
        select: {
          id: true,
          username: true,
          profile: { select: { displayName: true } }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
  console.log("Returned courses:", courses.length);
  console.log(courses.map(c => c.title));
}
main().catch(console.error).finally(() => prisma.$disconnect());
