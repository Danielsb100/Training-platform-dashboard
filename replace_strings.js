const fs = require('fs');
let content = fs.readFileSync('public/module_viewer.js', 'utf8');

const reps = [
    ["'ID do módulo está ausente'", "window.t ? window.t('moduleViewer.missingId', 'ID do módulo está ausente') : 'ID do módulo está ausente'"],
    ["'<i class=\"fas fa-arrow-left\"></i> Back'", "'<i class=\"fas fa-arrow-left\"></i> ' + (window.t ? window.t('moduleViewer.back', 'Back') : 'Back')"],
    ["'Back to Course'", "window.t ? window.t('moduleViewer.backToCourse', 'Back to Course') : 'Back to Course'"],
    ["'<i class=\"fas fa-times\"></i> Exit 3D World'", "'<i class=\"fas fa-times\"></i> ' + (window.t ? window.t('moduleViewer.exit3DWorld', 'Exit 3D World') : 'Exit 3D World')"],
    ["'Return to course content'", "window.t ? window.t('moduleViewer.returnCourseContent', 'Return to course content') : 'Return to course content'"],
    ["'Falha ao carregar os dados do módulo'", "window.t ? window.t('moduleViewer.loadFailed', 'Falha ao carregar os dados do módulo') : 'Falha ao carregar os dados do módulo'"],
    ["'Unnamed Module'", "window.t ? window.t('moduleViewer.unnamedModule', 'Unnamed Module') : 'Unnamed Module'"],
    ["'Course Content'", "window.t ? window.t('moduleViewer.courseContent', 'Course Content') : 'Course Content'"],
    ["Erro ao carregar o conteúdo do módulo.", "${window.t ? window.t('moduleViewer.errorLoadContent', 'Erro ao carregar o conteúdo do módulo.') : 'Erro ao carregar o conteúdo do módulo.'}"],
    ["Video Lesson", "${window.t ? window.t('moduleViewer.videoLesson', 'Video Lesson') : 'Video Lesson'}"],
    ["'<p style=\"color:#94a3b8;\">No videos available in this module.</p>'", "'<p style=\"color:#94a3b8;\">' + (window.t ? window.t('moduleViewer.noVideos', 'No videos available in this module.') : 'No videos available in this module.') + '</p>'"],
    ["Questions • Practical Assessment", "${window.t ? window.t('moduleViewer.questionsAssessment', 'Questions • Practical Assessment') : 'Questions • Practical Assessment'}"],
    ["> Start<", ">${window.t ? window.t('moduleViewer.start', 'Start') : 'Start'}<"],
    ["'<p style=\"color:#94a3b8;\">No quizzes available in this module.</p>'", "'<p style=\"color:#94a3b8;\">' + (window.t ? window.t('moduleViewer.noQuizzes', 'No quizzes available in this module.') : 'No quizzes available in this module.') + '</p>'"],
    ["Practical Assessment", "${window.t ? window.t('moduleViewer.practicalAssessment', 'Practical Assessment') : 'Practical Assessment'}"],
    ["</i> Document</div>", "</i> ${window.t ? window.t('moduleViewer.document', 'Document') : 'Document'}</div>"],
    [">This module does not have interactive content yet.<", ">${window.t ? window.t('moduleViewer.noInteractiveContent', 'This module does not have interactive content yet.') : 'This module does not have interactive content yet.'}<"],
    [">No documents found for this filter.<", ">${window.t ? window.t('moduleViewer.noDocsFilter', 'No documents found for this filter.') : 'No documents found for this filter.'}<"],
    ["Generic Document", "${window.t ? window.t('moduleViewer.genericDocument', 'Generic Document') : 'Generic Document'}"],
    ["Interactive PDF File", "${window.t ? window.t('moduleViewer.interactivePdf', 'Interactive PDF File') : 'Interactive PDF File'}"],
    ["Text Document", "${window.t ? window.t('moduleViewer.textDocument', 'Text Document') : 'Text Document'}"],
    ["Loading Image...", "${window.t ? window.t('moduleViewer.loadingImage', 'Loading Image...') : 'Loading Image...'}"],
    ["Fazer Download Original", "${window.t ? window.t('moduleViewer.downloadOriginal', 'Fazer Download Original') : 'Fazer Download Original'}"],
    ["Falha ao carregar a imagem.", "${window.t ? window.t('moduleViewer.failedLoadImage', 'Falha ao carregar a imagem.') : 'Falha ao carregar a imagem.'}"],
    ["Este vídeo abre em uma nova aba.", "${window.t ? window.t('moduleViewer.videoOpensNewTab', 'Este vídeo abre em uma nova aba.') : 'Este vídeo abre em uma nova aba.'}"],
    ["Abrir vídeo em nova aba", "${window.t ? window.t('moduleViewer.openVideoNewTab', 'Abrir vídeo em nova aba') : 'Abrir vídeo em nova aba'}"],
    ["Baixar Arquivo PPTX Original", "${window.t ? window.t('moduleViewer.downloadPPTX', 'Baixar Arquivo PPTX Original') : 'Baixar Arquivo PPTX Original'}"],
    ["Fazer Download Tradicional", "${window.t ? window.t('moduleViewer.downloadTraditional', 'Fazer Download Tradicional') : 'Fazer Download Tradicional'}"],
    ["Falha ao baixar arquivo.", "${window.t ? window.t('moduleViewer.failedDownload', 'Falha ao baixar arquivo.') : 'Falha ao baixar arquivo.'}"],
    ["Documento Genérico", "${window.t ? window.t('moduleViewer.genericDocument', 'Documento Genérico') : 'Documento Genérico'}"],
    ["Visualização web não disponível para este formato.", "${window.t ? window.t('moduleViewer.noWebPreview', 'Visualização web não disponível para este formato.') : 'Visualização web não disponível para este formato.'}"],
    ["Baixar Arquivo", "${window.t ? window.t('moduleViewer.downloadFile', 'Baixar Arquivo') : 'Baixar Arquivo'}"],
    ["Este questionário ainda não possui perguntas.", "${window.t ? window.t('moduleViewer.noQuestionsYet', 'Este questionário ainda não possui perguntas.') : 'Este questionário ainda não possui perguntas.'}"],
    ["Enviar Respostas", "${window.t ? window.t('moduleViewer.submitAnswers', 'Enviar Respostas') : 'Enviar Respostas'}"],
    ["'Por favor, responda a todas as perguntas antes de enviar.'", "window.t ? window.t('moduleViewer.answerAllQuestions', 'Por favor, responda a todas as perguntas antes de enviar.') : 'Por favor, responda a todas as perguntas antes de enviar.'"],
    ["Enviando...", "${window.t ? window.t('moduleViewer.submitting', 'Enviando...') : 'Enviando...'}"],
    ["'Falha ao enviar respostas'", "window.t ? window.t('moduleViewer.failedSubmitAnswers', 'Falha ao enviar respostas') : 'Falha ao enviar respostas'"],
    ["'Excelente! Você foi aprovado no quiz.'", "window.t ? window.t('moduleViewer.excellentQuiz', 'Excelente! Você foi aprovado no quiz.') : 'Excelente! Você foi aprovado no quiz.'"],
    ["'Bom esforço! Mas você pode tentar de novo para melhorar.'", "window.t ? window.t('moduleViewer.goodEffort', 'Bom esforço! Mas você pode tentar de novo para melhorar.') : 'Bom esforço! Mas você pode tentar de novo para melhorar.'"],
    ["'Continue estudando e tente novamente!'", "window.t ? window.t('moduleViewer.keepStudying', 'Continue estudando e tente novamente!') : 'Continue estudando e tente novamente!'"],
    ["'Refazer Quiz'", "window.t ? window.t('moduleViewer.retakeQuiz', 'Refazer Quiz') : 'Refazer Quiz'"],
    ["'Ocorreu um erro ao enviar suas respostas.'", "window.t ? window.t('moduleViewer.errorSubmitAnswers', 'Ocorreu um erro ao enviar suas respostas.') : 'Ocorreu um erro ao enviar suas respostas.'"]
];

reps.forEach(rep => {
    content = content.replace(new RegExp(rep[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), rep[1]);
});

fs.writeFileSync('public/module_viewer.js', content, 'utf8');
console.log('Done!');
