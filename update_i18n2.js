const fs = require('fs');
const path = require('path');

const translations = {
  "en-US": {
    "students.dashboard": "Dashboard",
    "students.title": "Students",
    "students.subtitle": "Track course progress, current stage, quiz scores, and AI tips for each enrolled student.",
    "students.courses": "Courses",
    "students.studentsCount": "Students",
    "students.avgProgress": "Avg. Progress",
    "students.searchPlaceholder": "Search by student, email, course, stage or AI tip...",
    "students.allCourses": "All courses",
    "students.allStatuses": "All statuses",
    "students.enrolled": "Enrolled",
    "students.completed": "Completed",
    "students.student": "Student",
    "students.course": "Course",
    "students.currentStage": "Current stage",
    "students.progress": "Progress",
    "students.quizScores": "Quiz scores",
    "students.aiTips": "AI tips",
    "students.loadingStudents": "Loading students...",
    "profile.eurobotSync": "Eurobot Sync",
    "profile.eurobotSyncDesc": "Manage the Training Platform knowledge-base connection and sync existing course videos, documents, quizzes, and module content to Eurobot.",
    "profile.eurobotKnowledgeSync": "Eurobot Knowledge Sync",
    "profile.eurobotSyncInfo": "Sync existing course videos, documents, quizzes, and module content to the active Eurobot knowledge base.",
    "profile.ensureKB": "Ensure KB",
    "profile.syncNow": "Sync now",
    "profile.loadingSyncStatus": "Loading Eurobot sync status...",
    "profile.noEnrollments": "No Enrollments Found",
    "profile.noEnrollmentsDesc": "You have no enrollments with this filter. Visit the marketplace to explore new content!"
  },
  "pt-BR": {
    "students.dashboard": "Dashboard",
    "students.title": "Estudantes",
    "students.subtitle": "Acompanhe o progresso no curso, estágio atual, notas de quizzes e dicas da IA para cada estudante matriculado.",
    "students.courses": "Cursos",
    "students.studentsCount": "Estudantes",
    "students.avgProgress": "Progresso Médio",
    "students.searchPlaceholder": "Pesquise por estudante, email, curso, estágio ou dica de IA...",
    "students.allCourses": "Todos os cursos",
    "students.allStatuses": "Todos os status",
    "students.enrolled": "Matriculado",
    "students.completed": "Concluído",
    "students.student": "Estudante",
    "students.course": "Curso",
    "students.currentStage": "Estágio atual",
    "students.progress": "Progresso",
    "students.quizScores": "Notas dos Quizzes",
    "students.aiTips": "Dicas de IA",
    "students.loadingStudents": "Carregando estudantes...",
    "profile.eurobotSync": "Sincronização do Eurobot",
    "profile.eurobotSyncDesc": "Gerencie a conexão da base de conhecimento da plataforma e sincronize vídeos de cursos, documentos, quizzes e conteúdos dos módulos com o Eurobot.",
    "profile.eurobotKnowledgeSync": "Sincronização de Conhecimento do Eurobot",
    "profile.eurobotSyncInfo": "Sincronize vídeos, documentos, quizzes e conteúdos de cursos para a base de conhecimento ativa do Eurobot.",
    "profile.ensureKB": "Garantir Base de Conhecimento",
    "profile.syncNow": "Sincronizar Agora",
    "profile.loadingSyncStatus": "Carregando o status de sincronização do Eurobot...",
    "profile.noEnrollments": "Nenhuma Matrícula Encontrada",
    "profile.noEnrollmentsDesc": "Você não tem matrículas com este filtro. Visite o marketplace para explorar novos conteúdos!"
  }
};

const languages = ["en-US", "pt-BR", "es-ES", "it-IT", "fr-FR", "ro-RO", "de-DE", "sq-AL", "el-GR", "ru-RU"];

for (const lang of languages) {
    const filePath = path.join(__dirname, 'public', 'lang', `${lang}.json`);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Use English as fallback for missing translations
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
