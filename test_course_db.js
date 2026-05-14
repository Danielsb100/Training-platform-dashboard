const prisma = require('./config/db');

async function main() {
    const courses = await prisma.course.findMany({
        select: {
            id: true,
            title: true,
            contentHtml: true,
            contentCss: true
        }
    });

    for (const c of courses) {
        console.log(`Course ${c.id}: ${c.title}`);
        console.log(`  contentHtml length: ${c.contentHtml ? c.contentHtml.length : 0}`);
        console.log(`  contentCss length: ${c.contentCss ? c.contentCss.length : 0}`);
        if (c.contentCss && c.contentCss.includes('editable-text')) {
            console.log(`  contentCss HAS editable-text!`);
        }
        if (c.contentHtml && c.contentHtml.includes('editable-text')) {
            console.log(`  contentHtml HAS editable-text!`);
        }
        if (c.contentCss && c.contentCss.includes('AGENFOR')) {
            console.log(`  contentCss has AGENFOR`);
        }
        if (c.contentHtml && c.contentHtml.includes('AGENFOR')) {
            console.log(`  contentHtml has AGENFOR`);
        }
    }
}

main().finally(() => prisma.$disconnect());
