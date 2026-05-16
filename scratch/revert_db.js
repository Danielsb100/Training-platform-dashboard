const prisma = require('../config/db');

function revertStyles(content) {
    if (!content) return content;
    let newContent = content;

    // .page
    newContent = newContent.replace(
        /\.page\{width:100%;margin:0 auto;background:#fff;\}/g,
        ".page{max-width:1100px;margin:0 auto;background:#fff;box-shadow:0 0 60px rgba(0,0,0,0.08);}"
    );

    return newContent;
}

function isPhygitalOrIntercepted(html) {
    if (!html) return false;
    const lowerHtml = html.toLowerCase();
    // Unique keywords for Phygital and Intercepted
    if (lowerHtml.includes('project phygital-oc') || lowerHtml.includes('project intercepted')) {
        return true;
    }
    // Also check for specific hero classes if they were added
    if (lowerHtml.includes('intercepted-hero-hand.png') || lowerHtml.includes('phygital')) {
        return true;
    }
    return false;
}

async function main() {
    let count = 0;
    const landingPages = await prisma.landingPage.findMany();

    for (const page of landingPages) {
        let updated = false;
        let dataToUpdate = {};

        // Only revert if it's NOT Phygital or Intercepted
        const isTargetTemplate = isPhygitalOrIntercepted(page.compiledHtml) || isPhygitalOrIntercepted(page.modularContent);
        
        if (!isTargetTemplate) {
            if (page.compiledHtml && page.compiledHtml.includes('.page{width:100%')) {
                const newHtml = revertStyles(page.compiledHtml);
                if (newHtml !== page.compiledHtml) {
                    dataToUpdate.compiledHtml = newHtml;
                    updated = true;
                }
            }

            if (page.modularContent && page.modularContent.includes('.page{width:100%')) {
                const newModular = revertStyles(page.modularContent);
                if (newModular !== page.modularContent) {
                    dataToUpdate.modularContent = newModular;
                    updated = true;
                }
            }

            if (page.content && typeof page.content === 'object' && page.content.html && page.content.html.includes('.page{width:100%')) {
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
    }
    
    console.log(`Successfully reverted ${count} landing pages in the database.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
