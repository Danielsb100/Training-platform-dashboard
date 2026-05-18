const prisma = require('../config/db.js');
async function main() {
    const doc45 = await prisma.document.findUnique({where: {id: 45}});
    console.log('Doc 45:', doc45 ? {id: doc45.id, storageKey: doc45.storageKey} : 'not found');
}
main().finally(() => prisma.$disconnect());
