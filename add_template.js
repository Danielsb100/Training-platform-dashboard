const fs = require('fs');
const file = 'c:/Users/Danie/.gemini/antigravity/scratch/modular-template/templates.js';
let content = fs.readFileSync(file, 'utf8');

// Extrair o template global-justice-legislation
const match = content.match(/\{\s*id:\s*"global-justice-legislation"[\s\S]*?(?=\}\s*\])/);
if(match) {
    let tpl = match[0];
    
    // Substituições
    tpl = tpl.replace(/id: "global-justice-legislation"/, 'id: "agenfor-security"');
    tpl = tpl.replace(/name: "Institution: Global Justice & Legislation"/, 'name: "Institution: AGENFOR Security"');
    tpl = tpl.replace(/thumb: "institution_justice_thumb.png"/, 'thumb: "agency_template_thumb_1777569867995.png"');
    
    // Mudar acentos laranjas para ouro (AGENFOR style)
    tpl = tpl.replace(/#b45309/g, '#d4af37');
    
    // Mudar fontes com serifa para sem serifa
    tpl = tpl.replace(/'Georgia',\s*serif/g, "'Helvetica', 'Arial', sans-serif");
    
    // Mudar o fundo do Main Header para um gradiente do AGENFOR
    tpl = tpl.replace(/background-color:#ffffff;\s*padding:25px\s*30px;\s*border-bottom:3px\s*solid\s*#d4af37;/g, 'background:linear-gradient(to right, #cf982e, #898d8d, #497aa7); padding:25px 30px; border-bottom:3px solid #d4af37;');
    
    // Mudar as cores dos textos no Main Header de preto para branco
    tpl = tpl.replace(/<span class="editable-text" style="font-size:3\.5rem; color:#0f172a;">⚖️<\/span>/, '<span class="editable-text" style="font-size:3.5rem; color:white;">🛡️</span>');
    tpl = tpl.replace(/<h2 class="editable-text" style="margin:0; font-family:'Helvetica', 'Arial', sans-serif; font-size:2\.2rem; color:#0f172a; line-height:1\.1;">Global Justice & Legislation<\/h2>/, `<h2 class="editable-text" style="margin:0; font-family:'Helvetica', 'Arial', sans-serif; font-size:2.2rem; color:white; line-height:1.1;">AGENFOR International</h2>`);
    tpl = tpl.replace(/<span class="editable-text" style="color:#64748b; font-size:0\.95rem; font-family:'Arial', sans-serif; letter-spacing:0\.5px;">The Supreme Judiciary and Legislative Council combined records<\/span>/, `<span class="editable-text" style="color:#e2e8f0; font-size:0.95rem; font-family:'Arial', sans-serif; letter-spacing:0.5px;">Building Security Through Justice and Inclusion</span>`);
    
    // Mudar cores dos links no header
    tpl = tpl.replace(/color:#0f172a/g, 'color:#334155'); // default change
    // Fixar links do header especificamente
    tpl = tpl.replace(/<a href="#gjl-court" class="editable-text" style="text-decoration:none; color:#334155;">Court Rulings<\/a>/, '<a href="#gjl-court" class="editable-text" style="text-decoration:none; color:white;">About</a>');
    tpl = tpl.replace(/<a href="#gjl-laws" class="editable-text" style="text-decoration:none; color:#334155;">Ratified Laws<\/a>/, '<a href="#gjl-laws" class="editable-text" style="text-decoration:none; color:white;">Services</a>');
    tpl = tpl.replace(/<a href="#gjl-debates" class="editable-text" style="text-decoration:none; color:#334155;">Plenary Debates<\/a>/, '<a href="#gjl-debates" class="editable-text" style="text-decoration:none; color:white;">Database</a>');
    tpl = tpl.replace(/<a href="#gjl-committees" class="editable-text" style="text-decoration:none; color:#334155;">Committees<\/a>/, '<a href="#gjl-committees" class="editable-text" style="text-decoration:none; color:white;">News</a>');
    
    // TABS module background
    tpl = tpl.replace(/background-color:#f8fafc;\s*padding:0;/g, 'background:linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0)); padding:0;');
    
    // Inserir a imagem abstrata
    tpl = tpl.replace(/background-color:#ffffff;\s*padding:50px\s*0;/g, 'background-image:url(abstract_blue_bg_1777569899630.png); background-size:cover; padding:50px 0;');
    
    content = content.replace(/(?=\}\s*\])/, '},\n    ' + tpl + '\n');
    fs.writeFileSync(file, content, 'utf8');
    console.log("Template cloned and appended successfully.");
} else {
    console.log("Template not found.");
}
