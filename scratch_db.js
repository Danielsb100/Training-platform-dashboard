require('dotenv').config();
const prisma = require('./config/db');

async function main() {
    const course = await prisma.course.findUnique({ where: { id: 2 }, select: { contentHtml: true } });
    console.log(course.contentHtml);
}
main().catch(console.error).finally(() => prisma.$disconnect());
