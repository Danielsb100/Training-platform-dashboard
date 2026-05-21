const fs = require('fs');
const path = require('path');

const newTranslations = {
    "courseBuilder.createModules": "Create Modules",
    "courseBuilder.createModulesDesc": "The classes and videos of the course content."
};

const ptBrTranslations = {
    "courseBuilder.createModules": "Criar Módulos",
    "courseBuilder.createModulesDesc": "As aulas e vídeos do conteúdo do curso."
};

const languages = ["en-US", "pt-BR", "es-ES", "it-IT", "fr-FR", "ro-RO", "de-DE", "sq-AL", "el-GR", "ru-RU"];

for (const lang of languages) {
    const filePath = path.join(__dirname, 'public', 'lang', `${lang}.json`);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const additions = (lang === "pt-BR") ? ptBrTranslations : newTranslations;
        
        for (const [key, value] of Object.entries(additions)) {
            data[key] = value;
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    }
}
console.log('Updated new keys to JSON');
