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

/* TABLET & SMALL DESKTOPS (992px) */
@media (max-width: 992px) {
    .features, .mission-grid, .avatar-grid, .intel-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 20px !important;
    }
    
    .mission-grid { flex-direction: column !important; }
    
    div[style*="width:50%"],
    div[style*="flex:2"] { width: 100% !important; flex: none !important; }
}

/* SMARTPHONES (768px) */
@media (max-width: 768px) {
    /* 1. Force Column Layout cleanly */
    div[style*="flex-direction:row"],
    div[style*="flex-direction: row"],
    .module-content,
    .hero-inner,
    .features,
    .avatar-grid,
    .intel-grid,
    .footer-top {
        flex-direction: column !important;
        grid-template-columns: 1fr !important;
        gap: 20px !important;
        padding: 20px !important;
        align-items: center !important;
        text-align: center !important;
    }
    
    /* 2. Hero & Header Fixes */
    .hero-content, .intel-left, .intel-right {
        width: 100% !important;
    }
    
    .hero-logo {
        max-width: 250px !important;
        margin: 0 auto !important;
    }
    
    /* 3. Typography Adjustments */
    h1, h2, .hero h1, .hero h2, .editable-text[style*="font-size:2.5rem"], .editable-text[style*="font-size: 2.5rem"] {
        font-size: 2.2rem !important;
        line-height: 1.2 !important;
    }
    
    /* 4. Improve Touch Targets & Widths */
    div[style*="display:flex; gap:20px"],
    div[style*="display: flex; gap: 20px"],
    .hero-ctas {
        flex-direction: column !important;
        width: 100% !important;
        align-items: stretch !important;
    }
    
    .editable-text[style*="padding:10px 20px"], .hero-btn {
        text-align: center !important;
        width: 100% !important;
        justify-content: center !important;
        padding: 14px 20px !important;
    }
    
    /* 5. Padding Reductions (Edge-to-Edge feel) */
    section, .hero, .mission, .avatar-section, .intel, .footer {
        padding: 40px 15px !important;
    }
    
    /* 6. Hide SVG Decorations that break vertical flow */
    svg.pipe { display: none !important; }
    .step { position: static !important; width: 100% !important; margin-bottom: 15px !important; }
}

/* SMALL SMARTPHONES (480px) */
@media (max-width: 480px) {
    h1, .hero h1, .editable-text[style*="font-size:2.5rem"], .editable-text[style*="font-size: 2.5rem"] {
        font-size: 1.8rem !important;
    }
    p, .editable-text[style*="font-size:1.1rem"] {
        font-size: 1rem !important;
    }
    section, .hero {
        padding: 30px 10px !important;
    }
}
</style>
`;

for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove old block if exists
    content = content.replace(/\/\* MOBILE RESPONSIVENESS INJECTED \*\/[\s\S]*?<\/style>/g, '</style>');
    
    // Inject new block
    content = content.replace(/<\/style>/g, mediaQuery);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Injected updated media queries into ' + file);
}
