const fs = require('fs');
const path = require('path');

const newTranslations = {
    "courseBuilder.viewContent": "View Content",
    "courseBuilder.backToProfile": "Back to Profile",
    "courseBuilder.shortDesc": "Short Description",
    "courseBuilder.descPlaceholder": "Summary of what students will learn in this course...",
    "courseBuilder.noneChannel": "None (Standalone Course)",
    "courseBuilder.channelHint": "Only channels created by you will appear here.",
    "courseBuilder.coEditorsDesc": "Assign other users to help you edit this course and its landing page.",
    "courseBuilder.searchUser": "Search user by name or email...",
    "courseBuilder.inviteStudentsDesc": "Manually enroll users directly into this course.",
    "courseBuilder.courseCoverDesc": "Upload an image. If left blank, it will use the Landing Page cover.",
    "courseBuilder.saveChanges": "Save Changes",
    "courseBuilder.publishCourse": "Publish Course",
    "courseBuilder.howItWorks": "How does it work?",
    "courseBuilder.step1": "1. Define the basic information.",
    "courseBuilder.step2": "2. Create your Landing Page. When published, it will be the showcase of this course.",
    "courseBuilder.step3": "3. Create the Modules (Classes/Videos).",
    "courseBuilder.step4": "4. When everything is ready, publish the Course so it appears in the Marketplace and students can enroll!",
    "courseBuilder.enrolledStudents": "Enrolled Students",
    "courseBuilder.filterStudentsPlaceholder": "Filter enrolled students...",
    "courseBuilder.constructionLayout": "Construction and Layout",
    "courseBuilder.whatToEdit": "What do you want to edit now?",
    "courseBuilder.createLandingPage": "Create Landing Page",
    "courseBuilder.landingPageDesc": "The design of your course's sales page.",
    "courseBuilder.dangerZone": "Danger Zone",
    "courseBuilder.irreversibleActions": "Irreversible actions for this course.",
    "courseBuilder.permanentlyDelete": "Permanently Delete this Course",
    "courseBuilder.courseModules": "Course Modules",
    "courseBuilder.modulesCreated": "modules created",
    "courseBuilder.createModuleBtn": "+ Create Module",
    "courseBuilder.backToCourse": "Back to Course",
    "courseBuilder.newModule": "New Module",
    "courseBuilder.noDescription": "No description",
    "courseBuilder.createNewModule": "Create New Module",
    "courseBuilder.editModule": "Edit Module",
    "courseBuilder.module": "MODULE",
    "courseBuilder.general": "General",
    "courseBuilder.videos": "Videos",
    "courseBuilder.documents": "Documents",
    "courseBuilder.quizAi": "Quiz & AI",
    "courseBuilder.cover": "Cover",
    "courseBuilder.moduleTitle": "Module Title",
    "courseBuilder.descriptionOfCovered": "Description of what will be covered...",
    "courseBuilder.status": "Status",
    "courseBuilder.draft": "Draft"
};

const ptBrTranslations = {
    "courseBuilder.viewContent": "Ver Conteúdo",
    "courseBuilder.backToProfile": "Voltar ao Perfil",
    "courseBuilder.shortDesc": "Descrição Curta",
    "courseBuilder.descPlaceholder": "Resumo do que os alunos vão aprender...",
    "courseBuilder.noneChannel": "Nenhum (Curso Independente)",
    "courseBuilder.channelHint": "Apenas canais criados por você aparecerão aqui.",
    "courseBuilder.coEditorsDesc": "Atribua outros usuários para ajudar a editar o curso e sua landing page.",
    "courseBuilder.searchUser": "Pesquisar usuário por nome ou email...",
    "courseBuilder.inviteStudentsDesc": "Matricular usuários manualmente neste curso.",
    "courseBuilder.courseCoverDesc": "Faça o upload de uma imagem. Se deixado em branco, a capa da Landing Page será usada.",
    "courseBuilder.saveChanges": "Salvar Alterações",
    "courseBuilder.publishCourse": "Publicar Curso",
    "courseBuilder.howItWorks": "Como funciona?",
    "courseBuilder.step1": "1. Defina as informações básicas.",
    "courseBuilder.step2": "2. Crie sua Landing Page. Quando publicada, ela será a vitrine deste curso.",
    "courseBuilder.step3": "3. Crie os Módulos (Aulas/Vídeos).",
    "courseBuilder.step4": "4. Quando tudo estiver pronto, publique o Curso no Marketplace para alunos se matricularem!",
    "courseBuilder.enrolledStudents": "Alunos Matriculados",
    "courseBuilder.filterStudentsPlaceholder": "Filtrar alunos matriculados...",
    "courseBuilder.constructionLayout": "Construção e Layout",
    "courseBuilder.whatToEdit": "O que você quer editar agora?",
    "courseBuilder.createLandingPage": "Criar Landing Page",
    "courseBuilder.landingPageDesc": "O design da página de vendas do seu curso.",
    "courseBuilder.dangerZone": "Zona de Perigo",
    "courseBuilder.irreversibleActions": "Ações irreversíveis para este curso.",
    "courseBuilder.permanentlyDelete": "Excluir este Curso Permanentemente",
    "courseBuilder.courseModules": "Módulos do Curso",
    "courseBuilder.modulesCreated": "módulos criados",
    "courseBuilder.createModuleBtn": "+ Criar Módulo",
    "courseBuilder.backToCourse": "Voltar ao Curso",
    "courseBuilder.newModule": "Novo Módulo",
    "courseBuilder.noDescription": "Sem descrição",
    "courseBuilder.createNewModule": "Criar Novo Módulo",
    "courseBuilder.editModule": "Editar Módulo",
    "courseBuilder.module": "MÓDULO",
    "courseBuilder.general": "Geral",
    "courseBuilder.videos": "Vídeos",
    "courseBuilder.documents": "Documentos",
    "courseBuilder.quizAi": "Quiz e IA",
    "courseBuilder.cover": "Capa",
    "courseBuilder.moduleTitle": "Título do Módulo",
    "courseBuilder.descriptionOfCovered": "Descrição do que será abordado...",
    "courseBuilder.status": "Status",
    "courseBuilder.draft": "Rascunho"
};

const languages = ["en-US", "pt-BR", "es-ES", "it-IT", "fr-FR", "ro-RO", "de-DE", "sq-AL", "el-GR", "ru-RU"];

for (const lang of languages) {
    const filePath = path.join(__dirname, 'public', 'lang', `${lang}.json`);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const additions = (lang === "pt-BR") ? ptBrTranslations : newTranslations;
        
        for (const [key, value] of Object.entries(additions)) {
            if (!data[key]) {
                data[key] = value;
            } else if (lang === "pt-BR") {
                // Force update pt-br to correct translations
                data[key] = value;
            }
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        console.log(`Updated ${lang}.json`);
    }
}
