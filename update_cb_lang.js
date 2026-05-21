const fs = require('fs');
const path = require('path');

const translations = {
  "en-US": {
    "courseBuilder.dashboard": "Course Management Dashboard",
    "courseBuilder.newCourse": "New Course",
    "courseBuilder.viewContent": "View Content",
    "courseBuilder.backToProfile": "Back to Profile",
    "courseBuilder.basicInfo": "Basic Information",
    "courseBuilder.basicInfoDesc": "Define the title, description and course details.",
    "courseBuilder.courseTitle": "Course Title",
    "courseBuilder.shortDesc": "Short Description",
    "courseBuilder.linkedChannel": "Linked Channel",
    "courseBuilder.noneChannel": "None (Standalone Course)",
    "courseBuilder.channelHint": "Only channels created by you will appear here.",
    "courseBuilder.coEditors": "Co-Editors & Instructors",
    "courseBuilder.coEditorsDesc": "Assign other users to help you edit this course and its landing page.",
    "courseBuilder.inviteStudents": "Invite Students",
    "courseBuilder.inviteStudentsDesc": "Manually enroll users directly into this course.",
    "courseBuilder.courseCover": "Course Cover",
    "courseBuilder.courseCoverDesc": "Upload an image. If left blank, it will use the Landing Page cover.",
    "courseBuilder.coverNotSelected": "(Cover not selected)",
    "courseBuilder.saveChanges": "Save Changes",
    "courseBuilder.publishCourse": "Publish Course",
    "courseBuilder.howItWorks": "How does it work?",
    "courseBuilder.step1": "1. Define the basic information.",
    "courseBuilder.step2": "2. Create your Landing Page. When published, it will be the showcase of this course",
    "courseBuilder.step3": "3. Create the Modules (Classes/Videos).",
    "courseBuilder.step4": "4. When everything is ready, publish the Course so it appears in the Marketplace and students can enroll",
    "courseBuilder.courseModules": "Course Modules",
    "courseBuilder.modulesCreated": "modules created",
    "courseBuilder.createModule": "+ Create Module",
    "courseBuilder.backToCourse": "Back to Course",
    "courseBuilder.editModule": "Edit Module",
    "courseBuilder.tabGeneral": "General",
    "courseBuilder.tabVideos": "Videos",
    "courseBuilder.tabDocs": "Documents",
    "courseBuilder.tabQuiz": "Quiz & AI",
    "courseBuilder.tabCover": "Cover",
    "courseBuilder.moduleTitle": "Module Title",
    "courseBuilder.description": "Description",
    "courseBuilder.status": "Status",
    "courseBuilder.draft": "Draft",
    "courseBuilder.published": "Published",
    "courseBuilder.titlePlaceholder": "Ex: Information Security Course",
    "courseBuilder.descPlaceholder": "Summary of what students will learn in this course...",
    "courseBuilder.searchUser": "Search user by name or email...",
    "notifications.loading": "Loading...",
    "notifications.subscribedTitle": "You have subscribed to {course}",
    "notifications.subscribedMessage": "You successfully enrolled in {course}.",
    "notifications.coEditorTitle": "You have been added as a Co-Editor",
    "notifications.coEditorMessage": "{user} has added you as a co-editor on {course}"
  },
  "pt-BR": {
    "courseBuilder.dashboard": "Painel de Gerenciamento do Curso",
    "courseBuilder.newCourse": "Novo Curso",
    "courseBuilder.viewContent": "Ver Conteúdo",
    "courseBuilder.backToProfile": "Voltar ao Perfil",
    "courseBuilder.basicInfo": "Informações Básicas",
    "courseBuilder.basicInfoDesc": "Defina o título, descrição e detalhes do curso.",
    "courseBuilder.courseTitle": "Título do Curso",
    "courseBuilder.shortDesc": "Descrição Curta",
    "courseBuilder.linkedChannel": "Canal Vinculado",
    "courseBuilder.noneChannel": "Nenhum (Curso Independente)",
    "courseBuilder.channelHint": "Apenas canais criados por você aparecerão aqui.",
    "courseBuilder.coEditors": "Co-Editores e Instrutores",
    "courseBuilder.coEditorsDesc": "Atribua outros usuários para ajudar a editar este curso e sua landing page.",
    "courseBuilder.inviteStudents": "Convidar Estudantes",
    "courseBuilder.inviteStudentsDesc": "Matricule manualmente os usuários neste curso.",
    "courseBuilder.courseCover": "Capa do Curso",
    "courseBuilder.courseCoverDesc": "Faça upload de uma imagem. Se deixado em branco, usará a capa da Landing Page.",
    "courseBuilder.coverNotSelected": "(Nenhuma capa selecionada)",
    "courseBuilder.saveChanges": "Salvar Alterações",
    "courseBuilder.publishCourse": "Publicar Curso",
    "courseBuilder.howItWorks": "Como funciona?",
    "courseBuilder.step1": "1. Defina as informações básicas.",
    "courseBuilder.step2": "2. Crie sua Landing Page. Quando publicada, será a vitrine deste curso.",
    "courseBuilder.step3": "3. Crie os Módulos (Aulas/Vídeos).",
    "courseBuilder.step4": "4. Quando tudo estiver pronto, publique o curso para que apareça no Marketplace e os estudantes possam se matricular.",
    "courseBuilder.courseModules": "Módulos do Curso",
    "courseBuilder.modulesCreated": "módulos criados",
    "courseBuilder.createModule": "+ Criar Módulo",
    "courseBuilder.backToCourse": "Voltar ao Curso",
    "courseBuilder.editModule": "Editar Módulo",
    "courseBuilder.tabGeneral": "Geral",
    "courseBuilder.tabVideos": "Vídeos",
    "courseBuilder.tabDocs": "Documentos",
    "courseBuilder.tabQuiz": "Quiz & IA",
    "courseBuilder.tabCover": "Capa",
    "courseBuilder.moduleTitle": "Título do Módulo",
    "courseBuilder.description": "Descrição",
    "courseBuilder.status": "Status",
    "courseBuilder.draft": "Rascunho",
    "courseBuilder.published": "Publicado",
    "courseBuilder.titlePlaceholder": "Ex: Curso de Segurança da Informação",
    "courseBuilder.descPlaceholder": "Resumo do que os estudantes aprenderão neste curso...",
    "courseBuilder.searchUser": "Procurar usuário por nome ou email...",
    "notifications.loading": "Carregando...",
    "notifications.subscribedTitle": "Você se inscreveu em {course}",
    "notifications.subscribedMessage": "Você foi matriculado com sucesso em {course}.",
    "notifications.coEditorTitle": "Você foi adicionado como Co-Editor",
    "notifications.coEditorMessage": "{user} adicionou você como co-editor em {course}"
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
