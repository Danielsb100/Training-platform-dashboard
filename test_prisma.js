const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.landingPage.findFirst();
  console.log(JSON.stringify(page, null, 2));
}

main().finally(() => prisma.$disconnect());
