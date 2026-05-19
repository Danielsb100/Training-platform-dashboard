const fs = require('fs');

const file = 'public/templates.js';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('id: "intercepted-new"');
if (startIdx === -1) {
    console.error("Could not find intercepted-new template");
    process.exit(1);
}

let templateStr = content.substring(startIdx);

// 1. Remove brackets from title
templateStr = templateStr.replace('<h1>[PROJECT INTERCEPTED]</h1>', '<h1>PROJECT INTERCEPTED</h1>');

// 2. Remove intel-left block
const intelLeftStart = templateStr.indexOf('<div class="intel-left">');
const intelRightStart = templateStr.indexOf('<div class="intel-right">');
if (intelLeftStart !== -1 && intelRightStart !== -1) {
    templateStr = templateStr.substring(0, intelLeftStart) + templateStr.substring(intelRightStart);
} else {
    console.log("Could not find intel-left bounds");
}

// 3. Remove footer-bottom block
const footerBottomStart = templateStr.indexOf('<div class="footer-bottom">');
const footerEnd = templateStr.indexOf('</footer>', footerBottomStart);
if (footerBottomStart !== -1 && footerEnd !== -1) {
    templateStr = templateStr.substring(0, footerBottomStart) + '\n' + templateStr.substring(footerEnd);
} else {
    console.log("Could not find footer-bottom bounds");
}

// Update file
content = content.substring(0, startIdx) + templateStr;
fs.writeFileSync(file, content);
console.log('Successfully adjusted intercepted-new template!');
