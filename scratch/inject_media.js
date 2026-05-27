const fs = require('fs');
const path = require('path');

const files = [
    'public/preview.html',
    'public/htmlBackup/phygital-template.html',
    'public/htmlBackup/intercepted-template.html',
    'public/js/templates.js'
];

const mediaQuery = `
/* MOBILE RESPONSIVENESS INJECTED */
@media (max-width: 768px) {
    div[style*="flex-direction:row"], div[style*="flex-direction: row"], .module-content, .hero-inner, .mission-grid, .avatar-grid, .intel-grid, .footer-top {
        flex-direction: column !important;
        gap: 20px !important;
        padding: 15px !important;
        align-items: center !important;
        text-align: center !important;
    }
    .hero-content, .intel-left, .intel-right { width: 100% !important; text-align: center !important; }
    .hero-logo { max-width: 200px !important; margin: 0 auto !important; }
    h1, h2, .editable-text[style*="font-size:2.5rem"] { font-size: 1.8rem !important; line-height: 1.2 !important; }
    div[style*="width:50%"], div[style*="flex:2"], div[style*="flex:1"] { width: 100% !important; flex: none !important; }
    div[style*="display:flex; gap:20px"], div[style*="display: flex; gap: 20px"] { flex-direction: column !important; width: 100% !important; align-items: stretch !important; }
    section, .hero { padding: 30px 15px !important; }
    .features { grid-template-columns: 1fr !important; margin-top: 20px !important; }
    .step { position: static !important; width: 100% !important; margin-bottom: 15px !important; }
    svg.pipe { display: none !important; }
}
</style>
`;

for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('MOBILE RESPONSIVENESS INJECTED')) continue;
    
    // Replace all occurrences of </style> with the media query + </style>
    content = content.replace(/<\/style>/g, mediaQuery);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Injected media queries into ' + file);
}
