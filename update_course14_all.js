const prisma = require('./config/db');

async function main() {
    const course = await prisma.course.findUnique({ where: { id: 14 } });
    if (!course) return;

    let css = course.contentCss || '';
    let html = course.contentHtml || '';

    // Fix Parceiros Logos
    const logoRegex = /<div[^>]*>Logo 1<\/div>[\s\S]*?<div[^>]*>Logo 2<\/div>/i;
    const replacementLogos = `
                            <div class="editable-image-wrapper" onclick="triggerImageUpload('logo-footer-1', 'src')">
                                <img src="https://placehold.co/120x60/ffffff/1e293b?text=Logo+1" id="logo-footer-1" style="height: 50px; width: auto; object-fit: contain; background: white; padding: 5px; border-radius: 6px;">
                            </div>
                            <div class="editable-image-wrapper" onclick="triggerImageUpload('logo-footer-2', 'src')">
                                <img src="https://placehold.co/120x60/ffffff/1e293b?text=Logo+2" id="logo-footer-2" style="height: 50px; width: auto; object-fit: contain; background: white; padding: 5px; border-radius: 6px;">
                            </div>
                            <div class="editable-image-wrapper" onclick="triggerImageUpload('logo-footer-3', 'src')">
                                <img src="https://placehold.co/120x60/ffffff/1e293b?text=Logo+3" id="logo-footer-3" style="height: 50px; width: auto; object-fit: contain; background: white; padding: 5px; border-radius: 6px;">
                            </div>`;

    if (logoRegex.test(css)) {
        css = css.replace(logoRegex, replacementLogos);
        console.log("Replaced logos in CSS");
    }
    if (logoRegex.test(html)) {
        html = html.replace(logoRegex, replacementLogos);
        console.log("Replaced logos in HTML");
    }

    // Fix Globe Icon
    const globeRegex = /<i class="fas fa-globe"[^>]*><\/i>/i;
    const replacementGlobe = `
                        <div class="editable-image-wrapper" onclick="triggerImageUpload('main-logo', 'src')" style="display: inline-block; margin-right: 10px;">
                            <img src="https://placehold.co/40x40/ffffff/1e293b?text=Logo" id="main-logo" style="height: 25px; width: auto; object-fit: contain; border-radius: 4px; background: rgba(255,255,255,0.2); padding: 2px;">
                        </div>`;

    if (globeRegex.test(css)) {
        css = css.replace(globeRegex, replacementGlobe);
        console.log("Replaced globe in CSS");
    }
    if (globeRegex.test(html)) {
        html = html.replace(globeRegex, replacementGlobe);
        console.log("Replaced globe in HTML");
    }

    await prisma.course.update({
        where: { id: 14 },
        data: { contentCss: css, contentHtml: html }
    });

    console.log("Done updating course 14");
}

main().finally(() => prisma.$disconnect());
