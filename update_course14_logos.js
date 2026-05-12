const prisma = require('./config/db');

async function main() {
    const course = await prisma.course.findUnique({ where: { id: 14 } });
    if (!course) return;

    let css = course.contentCss || '';
    let html = course.contentHtml || '';

    const searchString1 = '<div class="editable-text" style="background: white; padding: 8px 20px; border-radius: 4px; color: #1e293b; font-weight: bold; font-size: 0.8rem;" contenteditable="true">Logo 1</div>';
    const searchString2 = '<div class="editable-text" style="background: white; padding: 8px 20px; border-radius: 4px; color: #1e293b; font-weight: bold; font-size: 0.8rem;" contenteditable="true">Logo 2</div>';

    // also check without contenteditable
    const searchString3 = '<div class="editable-text" style="background: white; padding: 8px 20px; border-radius: 4px; color: #1e293b; font-weight: bold; font-size: 0.8rem;">Logo 1</div>';
    const searchString4 = '<div class="editable-text" style="background: white; padding: 8px 20px; border-radius: 4px; color: #1e293b; font-weight: bold; font-size: 0.8rem;">Logo 2</div>';

    const replacement = `
                            <div class="editable-image-wrapper" onclick="triggerImageUpload('logo-footer-1', 'src')">
                                <img src="https://placehold.co/120x60/ffffff/1e293b?text=Logo+1" id="logo-footer-1" style="height: 50px; width: auto; object-fit: contain; background: white; padding: 5px; border-radius: 6px;">
                            </div>
                            <div class="editable-image-wrapper" onclick="triggerImageUpload('logo-footer-2', 'src')">
                                <img src="https://placehold.co/120x60/ffffff/1e293b?text=Logo+2" id="logo-footer-2" style="height: 50px; width: auto; object-fit: contain; background: white; padding: 5px; border-radius: 6px;">
                            </div>
                            <div class="editable-image-wrapper" onclick="triggerImageUpload('logo-footer-3', 'src')">
                                <img src="https://placehold.co/120x60/ffffff/1e293b?text=Logo+3" id="logo-footer-3" style="height: 50px; width: auto; object-fit: contain; background: white; padding: 5px; border-radius: 6px;">
                            </div>`;

    // Regex replace to handle variations in attributes
    css = css.replace(/<div[^>]*>Logo 1<\/div>\s*<div[^>]*>Logo 2<\/div>/g, replacement);
    html = html.replace(/<div[^>]*>Logo 1<\/div>\s*<div[^>]*>Logo 2<\/div>/g, replacement);

    await prisma.course.update({
        where: { id: 14 },
        data: {
            contentCss: css,
            contentHtml: html
        }
    });

    console.log("Updated course 14");
}

main().finally(() => prisma.$disconnect());
