const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const lastCert = await prisma.issuedCertificate.findFirst({
    orderBy: { issuedAt: 'desc' },
    include: { template: true }
  });
  console.log(lastCert.template.bodyText);
}
main();
