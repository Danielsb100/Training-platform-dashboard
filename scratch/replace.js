const fs = require('fs');
const path = require('path');

const phygitalHtmlPath = path.join(__dirname, '../public', 'phygital-template.html');
const interceptedHtmlPath = path.join(__dirname, '../public', 'intercepted-template.html');
const templatesJsPath = path.join(__dirname, '../public', 'templates.js');

const phygitalContent = fs.readFileSync(phygitalHtmlPath, 'utf8');
const interceptedContent = fs.readFileSync(interceptedHtmlPath, 'utf8');
let templatesJsContent = fs.readFileSync(templatesJsPath, 'utf8');

function extractHtml(content) {
    const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
    const bodyMatch = content.match(/<body>([\s\S]*?)<\/body>/);
    
    let style = styleMatch ? `<style>${styleMatch[1]}</style>` : '';
    let body = bodyMatch ? bodyMatch[1] : '';
    
    return style + '\n' + body;
}

const phygitalHtml = extractHtml(phygitalContent);
const interceptedHtml = extractHtml(interceptedContent);

const regex = /\{\s*id:\s*['"]phygital-oc-new['"][\s\S]*\}\s*\];\s*$/;

const newTemplates = `{
        id: "phygital-oc-new",
        name: "Project Phygital-OC",
        thumb: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
        html: \`${phygitalHtml.replace(/`/g, '\\`')}\`
    },
    {
        id: "intercepted-new",
        name: "Project INTERCEPTED",
        thumb: "intercepted-hero-hand.png",
        html: \`${interceptedHtml.replace(/`/g, '\\`')}\`
    }
];
`;

templatesJsContent = templatesJsContent.replace(regex, newTemplates);

fs.writeFileSync(templatesJsPath, templatesJsContent, 'utf8');
console.log('Templates replaced successfully.');
