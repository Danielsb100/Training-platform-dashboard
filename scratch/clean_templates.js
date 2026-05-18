const fs = require('fs');
const path = require('path');

const templatesFile = path.join(__dirname, '../public/templates.js');
let content = fs.readFileSync(templatesFile, 'utf8');

const startIdx = content.indexOf('id: "phygital-oc-new"');
const htmlStart = content.indexOf('<div class="page">', startIdx);
const htmlEnd = content.indexOf('id: "intercepted-new"', htmlStart);

let htmlChunk = content.substring(htmlStart, htmlEnd);

// Clean up duplicate classes created by previous script errors
// e.g., class="editable-container editable-container features" -> class="editable-container features"
htmlChunk = htmlChunk.replace(/class="editable-container editable-container /g, 'class="editable-container ');
htmlChunk = htmlChunk.replace(/class="editable-container editable-container"/g, 'class="editable-container"');

// e.g., class="editable-text" class="editable-text" -> class="editable-text"
htmlChunk = htmlChunk.replace(/class="editable-text" class="editable-text"/g, 'class="editable-text"');

// e.g., <div class="editable-image-wrapper"><div class="editable-image-wrapper">...</div></div>
htmlChunk = htmlChunk.replace(/<div class="editable-image-wrapper"><div class="editable-image-wrapper">/g, '<div class="editable-image-wrapper">');
htmlChunk = htmlChunk.replace(/<\/div><\/div>/g, '</div>'); // This might be risky, let's just do a safer approach.

content = content.substring(0, htmlStart) + htmlChunk + content.substring(htmlEnd);
fs.writeFileSync(templatesFile, content);
console.log('Cleaned up templates.js');
