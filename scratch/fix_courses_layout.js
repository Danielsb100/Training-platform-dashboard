const fs = require('fs');
const prisma = require('../config/db');

// The exact HTML block to remove (regex)
const sectionRegex = /<!-- Main Content & Methodology -->[\s\S]*?<!-- Dashboard -->/g;

function cleanHtml(html) {
    if (!html) return html;
    return html.replace(sectionRegex, '<!-- Dashboard -->');
}

async function updateTemplatesJs() {
    const filePath = './public/templates.js';
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We only want to remove it from 'phygital-oc-new' and 'intercepted-new'.
    // Actually, it's safer to use regex replacement on the specific strings, but since
    // 'ava-template' ALSO has this block, we must be careful!
    
    // Let's find the 'phygital-oc-new' block
    let phygitalIdx = content.indexOf("id: 'phygital-oc-new'");
    let interceptedIdx = content.indexOf("id: 'intercepted-new'");
    
    if (phygitalIdx !== -1) {
        let before = content.substring(0, phygitalIdx);
        let after = content.substring(phygitalIdx);
        
        // Find where the next template starts (e.g., id: 'corporate-template')
        let nextTemplateIdx = after.indexOf("id: '", 100);
        if (nextTemplateIdx === -1) nextTemplateIdx = after.length;
        
        let phygitalBlock = after.substring(0, nextTemplateIdx);
        phygitalBlock = cleanHtml(phygitalBlock);
        
        content = before + phygitalBlock + after.substring(nextTemplateIdx);
    }

    // Refresh index after previous replace
    interceptedIdx = content.indexOf("id: 'intercepted-new'");
    if (interceptedIdx !== -1) {
        let before = content.substring(0, interceptedIdx);
        let after = content.substring(interceptedIdx);
        
        let nextTemplateIdx = after.indexOf("id: '", 100);
        if (nextTemplateIdx === -1) nextTemplateIdx = after.length;
        
        let interceptedBlock = after.substring(0, nextTemplateIdx);
        interceptedBlock = cleanHtml(interceptedBlock);
        
        content = before + interceptedBlock + after.substring(nextTemplateIdx);
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Updated templates.js');
}

async function updateDatabase() {
    const landingPages = await prisma.landingPage.findMany();
    let count = 0;

    for (const page of landingPages) {
        let updated = false;
        let dataToUpdate = {};

        const isTarget = (page.compiledHtml && (page.compiledHtml.includes('PHYGITAL') || page.compiledHtml.includes('INTERCEPTED')));
        
        if (isTarget) {
            if (page.compiledHtml && page.compiledHtml.includes('<!-- Main Content & Methodology -->')) {
                dataToUpdate.compiledHtml = cleanHtml(page.compiledHtml);
                updated = true;
            }

            if (page.modularContent && page.modularContent.includes('<!-- Main Content & Methodology -->')) {
                dataToUpdate.modularContent = cleanHtml(page.modularContent);
                updated = true;
            }

            if (page.content && typeof page.content === 'object' && page.content.html && page.content.html.includes('<!-- Main Content & Methodology -->')) {
                const newHtml = cleanHtml(page.content.html);
                dataToUpdate.content = { ...page.content, html: newHtml };
                updated = true;
            }

            if (updated) {
                await prisma.landingPage.update({
                    where: { id: page.id },
                    data: dataToUpdate
                });
                count++;
                console.log(`Cleaned LandingPage ID: ${page.id} - ${page.title}`);
            }
        }
    }
    console.log(`Updated ${count} landing pages in the database.`);
}

async function main() {
    await updateTemplatesJs();
    await updateDatabase();
}

main().catch(console.error).finally(() => prisma.$disconnect());
