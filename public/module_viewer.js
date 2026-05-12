document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('moduleId');
    const courseId = urlParams.get('courseId');
    
    if (!moduleId) {
        alert('ID do módulo está ausente');
        window.location.href = 'home.html';
        return;
    }
    
    const btnBack = document.getElementById('btn-back');
    btnBack.onclick = () => {
        window.location.href = courseId ? `course_content.html?id=${courseId}` : 'home.html';
    };
    
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    let moduleData = null;
    let combinedContent = [];
    let activeContentIndex = 0;
    
    try {
        const response = await fetch(`/runtime/modules/${moduleId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar os dados do módulo');
        }
        
        moduleData = await response.json();
        
        document.getElementById('module-name').textContent = moduleData.title || 'Módulo Sem Nome';
        document.getElementById('course-title').textContent = 'Conteúdo da Aula';
        
        // Unificar os conteúdos
        const videos = (moduleData.videos || []).map(v => ({ ...v, contentType: 'video' }));
        const documents = (moduleData.documents || []).map(d => ({ ...d, contentType: 'document' }));
        const quizzes = (moduleData.quizzes || []).map(q => ({ ...q, contentType: 'quiz' }));
        
        combinedContent = [...videos, ...documents, ...quizzes].sort((a, b) => a.order - b.order);
        
        renderSidebar();
        
        if (combinedContent.length > 0) {
            selectContent(0);
        } else {
            document.getElementById('content-display').innerHTML = `
                <div style="text-align: center; color: #94a3b8;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>Este módulo ainda não possui conteúdos.</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error(error);
        document.getElementById('content-display').innerHTML = `<div style="color: #ef4444;">Erro ao carregar o conteúdo do módulo.</div>`;
    }
    
    function renderSidebar() {
        const listContainer = document.getElementById('content-list');
        listContainer.innerHTML = '';
        
        combinedContent.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'content-item';
            
            let icon = 'fa-file';
            if (item.contentType === 'video') icon = 'fa-play-circle';
            else if (item.contentType === 'document') icon = 'fa-file-pdf';
            else if (item.contentType === 'quiz') icon = 'fa-question-circle';
            
            li.innerHTML = `
                <div class="content-icon"><i class="fas ${icon}"></i></div>
                <div class="content-text">${item.title}</div>
            `;
            
            li.onclick = () => selectContent(index);
            listContainer.appendChild(li);
        });
    }
    
    function selectContent(index) {
        const listItems = document.querySelectorAll('.content-item');
        listItems.forEach(item => item.classList.remove('active'));
        if(listItems[index]) listItems[index].classList.add('active');
        
        activeContentIndex = index;
        const item = combinedContent[index];
        renderMainContent(item);
    }
    
    function renderMainContent(item) {
        const display = document.getElementById('content-display');
        display.innerHTML = '';
        
        if (item.contentType === 'video') {
            const isYouTube = item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be'));
            
            if (isYouTube) {
                // Extrair ID do vídeo
                let videoId = '';
                if(item.url.includes('v=')) videoId = item.url.split('v=')[1].split('&')[0];
                else if(item.url.includes('youtu.be/')) videoId = item.url.split('youtu.be/')[1].split('?')[0];
                
                const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                display.innerHTML = `
                    <div class="video-container">
                        <iframe src="${embedUrl}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
                    </div>
                `;
            } else {
                display.innerHTML = `
                    <div class="video-container">
                        <video src="${item.url}" controls autoplay></video>
                    </div>
                `;
            }
        } 
        else if (item.contentType === 'document') {
            display.innerHTML = `
                <div class="document-container">
                    <i class="fas fa-file-pdf"></i>
                    <h2>${item.title}</h2>
                    <p style="color: #94a3b8; margin-bottom: 30px;">Clique abaixo para baixar este arquivo de estudo.</p>
                    <button class="btn-download" onclick="downloadDocument(${item.documentId})">
                        <i class="fas fa-download"></i> Baixar Arquivo
                    </button>
                </div>
            `;
        }
        else if (item.contentType === 'quiz') {
            if (!item.questions || item.questions.length === 0) {
                display.innerHTML = `<div class="quiz-container"><h2>${item.title}</h2><p>Este questionário ainda não possui perguntas.</p></div>`;
                return;
            }
            
            let questionsHtml = item.questions.map((q, qIndex) => `
                <div class="question-block" data-question-id="${q.id}">
                    <h3 class="question-text">${qIndex + 1}. ${q.text}</h3>
                    <div class="options-list">
                        ${q.options.map(opt => `
                            <label class="option-label">
                                <input type="radio" name="question_${q.id}" value="${opt.id}">
                                <span>${opt.text}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `).join('');
            
            display.innerHTML = `
                <div class="quiz-container">
                    <div class="quiz-header">
                        <h2><i class="fas fa-question-circle" style="margin-right:10px;"></i>${item.title}</h2>
                    </div>
                    <form id="quiz-form" data-quiz-id="${item.id}">
                        ${questionsHtml}
                        <button type="submit" class="btn-submit-quiz">Enviar Respostas</button>
                    </form>
                </div>
            `;
            
            document.getElementById('quiz-form').addEventListener('submit', handleQuizSubmit);
        }
    }
    
    window.downloadDocument = async function(documentId) {
        // Dispara o download numa nova aba
        window.open(`/api/documents/download/${documentId}`, '_blank');
        
        // Log telemetry
        try {
            await fetch(`/modules/${moduleId}/documents/${documentId}/download`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ source: 'dashboard' })
            });
        } catch(e) {
            console.error('Failed to log document download telemtry:', e);
        }
    };
    
    async function handleQuizSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const quizId = form.getAttribute('data-quiz-id');
        const item = combinedContent.find(c => c.id == quizId && c.contentType === 'quiz');
        
        if (!item) return;
        
        const answers = [];
        let allAnswered = true;
        
        item.questions.forEach(q => {
            const selected = form.querySelector(`input[name="question_${q.id}"]:checked`);
            if (selected) {
                answers.push({ questionId: q.id, optionId: parseInt(selected.value) });
            } else {
                allAnswered = false;
            }
        });
        
        if (!allAnswered) {
            alert('Por favor, responda a todas as perguntas antes de enviar.');
            return;
        }
        
        const btn = form.querySelector('.btn-submit-quiz');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        try {
            const res = await fetch(`/modules/${moduleId}/quiz/submit`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ answers, courseId })
            });
            
            if (!res.ok) throw new Error('Falha ao enviar respostas');
            
            const result = await res.json();
            
            // Show modal
            const modal = document.getElementById('quiz-modal');
            const scoreEl = document.getElementById('quiz-score');
            const feedbackEl = document.getElementById('quiz-feedback');
            
            const scorePercent = Math.round(result.score);
            scoreEl.textContent = `${scorePercent}%`;
            
            if (scorePercent >= 80) {
                scoreEl.style.borderColor = '#22c55e';
                scoreEl.style.color = '#22c55e';
                feedbackEl.textContent = 'Excelente! Você foi aprovado no quiz.';
            } else if (scorePercent >= 60) {
                scoreEl.style.borderColor = '#f59e0b';
                scoreEl.style.color = '#f59e0b';
                feedbackEl.textContent = 'Bom esforço! Mas você pode tentar de novo para melhorar.';
            } else {
                scoreEl.style.borderColor = '#ef4444';
                scoreEl.style.color = '#ef4444';
                feedbackEl.textContent = 'Continue estudando e tente novamente!';
            }
            
            modal.classList.add('active');
            
            btn.innerHTML = 'Refazer Quiz';
            btn.disabled = false;
            
        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro ao enviar suas respostas.');
            btn.innerHTML = 'Enviar Respostas';
            btn.disabled = false;
        }
    }
});
