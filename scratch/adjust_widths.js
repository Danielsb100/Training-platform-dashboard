const fs = require('fs');
const file = 'public/templates.js';
let content = fs.readFileSync(file, 'utf8');

// Limit replacements to the phygital-oc-new template
const startIdx = content.indexOf('id: "phygital-oc-new"');
const endIdx = content.indexOf('id: "intercepted-new"');

if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find phygital template boundaries');
    process.exit(1);
}

let templateStr = content.substring(startIdx, endIdx);

// 1. Revert gradient
templateStr = templateStr.replace('transparent 10%, #ffffff 70%', 'transparent 50%, #ffffff 100%');

// 2. Remove max-width and margins from specific containers to make them full-width
// hero-inner
templateStr = templateStr.replace('.hero-inner{max-width:1100px;margin:0 auto;', '.hero-inner{');
// features
templateStr = templateStr.replace('.features{max-width:1100px;margin-left:auto;margin-right:auto;', '.features{');
// mission
templateStr = templateStr.replace('.mission{max-width:1100px;margin:0 auto;', '.mission{');
// avatar-section
templateStr = templateStr.replace('.avatar-section{max-width:1100px;margin:0 auto;', '.avatar-section{');
// intel-grid
templateStr = templateStr.replace('.intel-grid{max-width:1100px;margin:0 auto;', '.intel-grid{');
// footer-top
templateStr = templateStr.replace('.footer-top{max-width:1100px;margin:0 auto;', '.footer-top{');
// footer-bottom (just in case it was there, although I deleted the div earlier, the CSS might still be there)
templateStr = templateStr.replace('.footer-bottom{max-width:1100px;margin:0 auto;', '.footer-bottom{');


// Reconstruct
content = content.substring(0, startIdx) + templateStr + content.substring(endIdx);
fs.writeFileSync(file, content);
console.log('Successfully adjusted max-widths and reverted gradient!');
