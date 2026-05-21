require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    console.log('User ID:', user.id);
    console.log('Profile language:', profile.language);
    console.log('Profile preferences:', profile.preferences);
    
    const module = await prisma.module.findFirst({
        include: {
            videos: true,
            languageSessions: true
        }
    });
    console.log('Module ID:', module.id);
    console.log('Module videos:', JSON.stringify(module.videos.map(v => ({ title: v.title, languageSessionId: v.languageSessionId }))));
    console.log('Module languageSessions:', JSON.stringify(module.languageSessions.map(s => ({ id: s.id, locale: s.locale }))));
}

main().catch(console.error).finally(() => prisma.$disconnect());
