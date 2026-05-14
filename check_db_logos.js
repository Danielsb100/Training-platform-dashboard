const prisma = require('./config/db');

async function main() {
    const course = await prisma.course.findUnique({ where: { id: 14 } });
    if (!course) return;

    let css = course.contentCss || '';
    
    // Find the exact Logo 1 and Logo 2 block
    const match = css.match(/<div[^>]*>Logo 1<\/div>[\s\S]*?<div[^>]*>Logo 2<\/div>/i);
    if (match) {
        console.log("FOUND EXACT MATCH IN CSS:");
        console.log(match[0]);
    } else {
        console.log("COULD NOT FIND LOGO 1 AND LOGO 2 IN CSS!");
        // Let's just find "Logo 1"
        const idx = css.indexOf("Logo 1");
        if (idx !== -1) {
            console.log("Substring around Logo 1:");
            console.log(css.substring(idx - 100, idx + 200));
        } else {
            console.log("NOT FOUND AT ALL!");
        }
    }
}

main().finally(() => prisma.$disconnect());
