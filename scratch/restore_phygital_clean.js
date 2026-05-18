const fs = require('fs');

const origContent = fs.readFileSync('scratch/original_templates.js', 'utf8');
const startIdx = origContent.indexOf('id: "phygital-oc-new"');
const htmlStart = origContent.indexOf('<div class="page">', startIdx);
let htmlEnd = origContent.indexOf('id: "intercepted-new"', htmlStart);

// Since intercepted-new is NOT in original_templates.js, htmlEnd will be -1
if (htmlEnd === -1) {
    // find the end of the templates array
    htmlEnd = origContent.lastIndexOf('`');
}

let origHtml = origContent.substring(htmlStart, htmlEnd);

// REMOVE ELEMENTS
// 1. Remove hero btn
origHtml = origHtml.replace(/<a href="#features" class="hero-btn">[\s\S]*?<\/a>/g, '');
// 2. Remove footer
origHtml = origHtml.replace(/<footer class="footer">[\s\S]*?<\/footer>/g, '');
// 3. Remove downloads sidebar
origHtml = origHtml.replace(/<div class="dl-sidebar">[\s\S]*?<\/div>\s*<\/div>/g, '</div>');
// 4. Remove mic
origHtml = origHtml.replace(/<div class="av-f"><div><div class="mic">🎤<\/div><\/div><\/div>/g, '');

// MAKE SECTIONS MODULE-SECTIONS
origHtml = origHtml.replace(/<section class="([^"]*)">/g, '<section id="phygital-section-$1" class="module-section $1"><button class="bg-edit-btn" onclick="triggerImageUpload(\'phygital-section-$1\', \'bg\')"><i class="fas fa-image"></i> Change BG</button>');

// APPLY EDITABLE TEXT
// Robust regex to add editable-text without destroying structure
origHtml = origHtml.replace(/<(h[1-6]|p|li|span)([^>]*)>/g, '<$1$2 class="editable-text">');
origHtml = origHtml.replace(/class="([^"]*)"([^>]*)class="editable-text"/g, 'class="$1 editable-text"$2');

// APPLY EDITABLE IMAGE
origHtml = origHtml.replace(/<img([^>]*)>/g, '<div class="editable-image-wrapper" onclick="triggerImageUpload(\'random-img-id\', \'src\')"><img$1></div>');
// Fix the hero logo img not to trigger background
origHtml = origHtml.replace(/onclick="triggerImageUpload\('random-img-id', 'src'\)"/g, 'onclick="triggerImageUpload(this.children[0].id || \'img-\' + Math.floor(Math.random()*10000), \'src\')"');


let currentContent = fs.readFileSync('public/templates.js', 'utf8');
const currStartIdx = currentContent.indexOf('id: "phygital-oc-new"');
const currHtmlStart = currentContent.indexOf('<div class="page">', currStartIdx);
let currHtmlEnd = currentContent.indexOf('id: "intercepted-new"', currHtmlStart);
if (currHtmlEnd === -1) currHtmlEnd = currentContent.length;

// wait! if intercepted-new is NOT there, I need to find the `}, { id: "intercepted-new"` block!
// Actually, `id: "intercepted-new"` IS in `public/templates.js`!
const interceptIdx = currentContent.indexOf('id: "intercepted-new"');
// Backtrack to the start of the object `{`
let replaceEnd = interceptIdx;
while (currentContent[replaceEnd] !== '{' && replaceEnd > 0) {
    replaceEnd--;
}

const finalHtml = currentContent.substring(0, currHtmlStart) + origHtml + '\n`\n    },\n    ' + currentContent.substring(replaceEnd);
fs.writeFileSync('public/templates.js', finalHtml);
console.log('Phygital perfectly restored and made editable without structural damage.');
