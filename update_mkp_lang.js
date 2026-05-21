const fs = require('fs');
const path = require('path');

const translations = {
  "en-US": {
    "marketplace.exclusiveChannels": "EXCLUSIVE CHANNELS",
    "marketplace.noExclusiveChannels": "No exclusive channels created.",
    "marketplace.servicesMarketplace": "SERVICES MARKETPLACE",
    "marketplace.latestNews": "LATEST NEWS",
    "marketplace.addNewsContainer": "+ Add News Container",
    "profile.loadingEnrollments": "Loading enrollments..."
  },
  "pt-BR": {
    "marketplace.exclusiveChannels": "CANAIS EXCLUSIVOS",
    "marketplace.noExclusiveChannels": "Nenhum canal exclusivo criado.",
    "marketplace.servicesMarketplace": "MARKETPLACE DE SERVIÇOS",
    "marketplace.latestNews": "ÚLTIMAS NOTÍCIAS",
    "marketplace.addNewsContainer": "+ Adicionar Contêiner de Notícias",
    "profile.loadingEnrollments": "Carregando inscrições..."
  }
};

const languages = ["en-US", "pt-BR", "es-ES", "it-IT", "fr-FR", "ro-RO", "de-DE", "sq-AL", "el-GR", "ru-RU"];

for (const lang of languages) {
    const filePath = path.join(__dirname, 'public', 'lang', `${lang}.json`);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const newKeys = translations[lang] || translations["en-US"];
        for (const key of Object.keys(newKeys)) {
            data[key] = newKeys[key];
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        console.log(`Updated ${lang}.json`);
    } else {
        console.log(`File not found: ${filePath}`);
    }
}
