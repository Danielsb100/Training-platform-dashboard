const prisma = require('../config/db.js');

async function main() {
    const doc45 = await prisma.document.findUnique({where: {id: 45}});
    const doc83 = await prisma.document.findUnique({where: {id: 83}});
    
    console.log('Doc 45:', doc45 ? {
        id: doc45.id, 
        type: doc45.type, 
        sizeBytes: doc45.sizeBytes, 
        storageProvider: doc45.storageProvider, 
        hasData: !!doc45.data, 
        dataLength: doc45.data ? doc45.data.length : 0
    } : 'not found');
    
    console.log('Doc 83:', doc83 ? {
        id: doc83.id, 
        type: doc83.type, 
        sizeBytes: doc83.sizeBytes, 
        storageProvider: doc83.storageProvider, 
        hasData: !!doc83.data, 
        dataLength: doc83.data ? doc83.data.length : 0
    } : 'not found');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
