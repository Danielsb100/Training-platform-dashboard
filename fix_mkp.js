const fs = require('fs');
let content = fs.readFileSync('public/marketplace.html', 'utf8');

if (!content.includes('<script src="i18n.js"></script>')) {
    content = content.replace('<script src="home.js"></script>', '<script src="i18n.js"></script>\n    <script src="home.js"></script>');
}

if (!content.includes('marketplace.latestNews')) {
    content = content.replace('LATEST NEWS', '<span data-i18n="marketplace.latestNews">LATEST NEWS</span>');
}
if (!content.includes('marketplace.addNewsContainer')) {
    content = content.replace('+ Add News Container', '<span data-i18n="marketplace.addNewsContainer">+ Add News Container</span>');
}

fs.writeFileSync('public/marketplace.html', content);
console.log("Replaced strings in marketplace.html");
