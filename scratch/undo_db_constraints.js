const fs = require('fs');
const prisma = require('../config/db');

function revertStyles(content) {
    if (!content) return content;
    let newContent = content;

    // .hero-inner
    newContent = newContent.replace(
        /\.hero-inner\{max-width:1100px;margin:0 auto;position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:40px;\}/g,
        ".hero-inner{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:40px;}"
    );

    // .features
    newContent = newContent.replace(
        /\.features\{max-width:1100px;margin-left:auto;margin-right:auto;display:grid;grid-template-columns:repeat\(3,1fr\);gap:14px;padding:0 30px;margin-top:-90px;position:relative;z-index:20;\}/g,
        ".features{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:0 30px;margin-top:-90px;position:relative;z-index:20;}"
    );

    // .mission
    newContent = newContent.replace(
        /\.mission\{max-width:1100px;margin:0 auto;padding:50px 30px;text-align:center;\}/g,
        ".mission{padding:50px 30px;text-align:center;}"
    );

    // .journey-header
    newContent = newContent.replace(
        /\.journey-header\{max-width:1100px;margin:0 auto 30px;display:flex;align-items:center;justify-content:center;gap:12px;\}/g,
        ".journey-header{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:30px;}"
    );

    // .journey-body
    newContent = newContent.replace(
        /\.journey-body\{max-width:1100px;margin:0 auto;position:relative;min-height:750px;\}/g,
        ".journey-body{position:relative;min-height:750px;}"
    );

    // .avatar-section
    newContent = newContent.replace(
        /\.avatar-section\{max-width:1100px;margin:0 auto;padding:50px 30px;background:#fff;\}/g,
        ".avatar-section{padding:50px 30px;background:#fff;}"
    );

    // .intel-grid
    newContent = newContent.replace(
        /\.intel-grid\{max-width:1100px;margin:0 auto;display:flex;gap:40px;\}/g,
        ".intel-grid{display:flex;gap:40px;}"
    );

    // .footer-top
    newContent = newContent.replace(
        /\.footer-top\{max-width:1100px;margin:0 auto 20px;display:flex;gap:30px;flex-wrap:wrap;\}/g,
        ".footer-top{display:flex;gap:30px;margin-bottom:20px;flex-wrap:wrap;}"
    );

    // .footer-bottom
    newContent = newContent.replace(
        /\.footer-bottom\{max-width:1100px;margin:0 auto;border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;font-size:0\.75rem;color:#94a3b8;\}/g,
        ".footer-bottom{border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;font-size:0.75rem;color:#94a3b8;}"
    );
    
    // Also make sure .page is 100%
    newContent = newContent.replace(
        /\.page\{max-width:1100px;margin:0 auto;background:#fff;box-shadow:0 0 60px rgba\(0,0,0,0\.08\);\}/g,
        ".page{width:100%;margin:0 auto;background:#fff;}"
    );

    return newContent;
}

async function main() {
    const landingPages = await prisma.landingPage.findMany();
    let count = 0;

    for (const page of landingPages) {
        let updated = false;
        let dataToUpdate = {};

        if (page.compiledHtml && (page.compiledHtml.includes('max-width:1100px') || page.compiledHtml.includes('.page{max-width:1100px;'))) {
            const newHtml = revertStyles(page.compiledHtml);
            if (newHtml !== page.compiledHtml) {
                dataToUpdate.compiledHtml = newHtml;
                updated = true;
            }
        }

        if (page.modularContent && (page.modularContent.includes('max-width:1100px') || page.modularContent.includes('.page{max-width:1100px;'))) {
            const newModular = revertStyles(page.modularContent);
            if (newModular !== page.modularContent) {
                dataToUpdate.modularContent = newModular;
                updated = true;
            }
        }

        if (page.content && typeof page.content === 'object' && page.content.html && (page.content.html.includes('max-width:1100px') || page.content.html.includes('.page{max-width:1100px;'))) {
            const newHtml = revertStyles(page.content.html);
            if (newHtml !== page.content.html) {
                dataToUpdate.content = { ...page.content, html: newHtml };
                updated = true;
            }
        }

        if (updated) {
            await prisma.landingPage.update({
                where: { id: page.id },
                data: dataToUpdate
            });
            count++;
            console.log(`Reverted LandingPage ID: ${page.id} - ${page.title}`);
        }
    }
    console.log(`Reverted ${count} landing pages in the database.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
