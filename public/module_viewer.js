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
    let videos = [];
    let documents = [];
    let quizzes = [];
    
    // UI Elements
    const navTabs = document.querySelectorAll('.nav-tab');
    const hubSections = document.querySelectorAll('.hub-section');
    const playerView = document.getElementById('player-view');
    const btnBackHub = document.getElementById('btn-back-hub');
    const playerContent = document.getElementById('player-content');
    const playerTitle = document.getElementById('player-title');
    
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
        
        videos = (moduleData.videos || []).map(v => ({ ...v, contentType: 'video' })).sort((a,b) => a.order - b.order);
        documents = (moduleData.documents || []).map(d => ({ ...d, contentType: 'document' })).sort((a,b) => a.order - b.order);
        quizzes = (moduleData.quizzes || []).map(q => ({ ...q, contentType: 'quiz' })).sort((a,b) => a.order - b.order);
        
        // Update Badges
        document.getElementById('badge-videos').textContent = videos.length;
        document.getElementById('badge-documents').textContent = documents.length;
        document.getElementById('badge-quizzes').textContent = quizzes.length;
        
        renderHubs();
        
    } catch (error) {
        console.error(error);
        document.getElementById('overview-grid').innerHTML = `<div style="color: #ef4444; width:100%; text-align:center; padding:20px;">Erro ao carregar o conteúdo do módulo.</div>`;
    }
    
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    function parseVideoUrl(url) {
        if (!url) return { type: 'unknown', url: '', youtubeId: null };

        try {
            const parsedUrl = new URL(url, window.location.origin);
            const hostname = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();
            const pathname = parsedUrl.pathname;

            if (hostname === 'youtu.be') {
                const youtubeId = pathname.split('/').filter(Boolean)[0] || null;
                return { type: youtubeId ? 'youtube' : 'unknown', url, youtubeId };
            }

            if (hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'youtube-nocookie.com') {
                const watchId = parsedUrl.searchParams.get('v');
                const embedMatch = pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/);
                const youtubeId = watchId || (embedMatch ? embedMatch[1] : null);
                return { type: youtubeId ? 'youtube' : 'unknown', url, youtubeId };
            }

            if (hostname.endsWith('sharepoint.com') || hostname.endsWith('1drv.ms') || hostname.endsWith('onedrive.live.com')) {
                return { type: 'sharepoint', url, youtubeId: null };
            }

            if (/\.(mp4|webm|ogg|mov)(?:$|[?#])/i.test(parsedUrl.pathname)) {
                return { type: 'direct', url, youtubeId: null };
            }
        } catch (error) {
            console.warn('Invalid video URL:', url, error);
        }

        return { type: 'external', url, youtubeId: null };
    }

    function getVideoThumbnailHtml(video) {
        const videoInfo = parseVideoUrl(video.url);
        if (videoInfo.type === 'youtube' && videoInfo.youtubeId) {
            const thumbUrl = `https://img.youtube.com/vi/${encodeURIComponent(videoInfo.youtubeId)}/hqdefault.jpg`;
            return `<img src="${thumbUrl}" alt="Video Thumbnail" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="video-placeholder" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; background:#0f172a; color:#cf9c33; flex-direction:column; gap:8px;">
                    <i class="fas fa-video" style="font-size:3rem;"></i><span>Video</span>
                </div>`;
        }

        const label = videoInfo.type === 'sharepoint' ? 'SharePoint Video' : 'Video';
        return `<div class="video-placeholder" style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; background:#0f172a; color:#cf9c33; flex-direction:column; gap:8px;">
            <i class="fas fa-video" style="font-size:3rem;"></i><span>${label}</span>
        </div>`;
    }
    
    function renderHubs() {
        // --- Videos Grid ---
        const videosGrid = document.getElementById('videos-grid');
        videosGrid.innerHTML = videos.length ? videos.map((v, i) => {
            const thumbHtml = getVideoThumbnailHtml(v);
            
            return `
            <div class="card" onclick="openPlayer('video', ${i})">
                <div class="card-thumb">
                    ${thumbHtml}
                    <i class="fas fa-play-circle play-icon"></i>
                </div>
                <div class="card-body">
                    <div class="card-title">${escapeHtml(v.title)}</div>
                    <div class="card-meta"><i class="fas fa-video"></i> Aula em Vídeo</div>
                </div>
            </div>`;
        }).join('') : '<p style="color:#94a3b8;">Nenhum vídeo disponível neste módulo.</p>';
        
        // --- Documents List ---
        const docsList = document.getElementById('documents-list');
        docsList.innerHTML = documents.length ? documents.map(d => `
            <div class="list-item" onclick="downloadDocument(${d.documentId})">
                <div class="list-icon"><i class="fas fa-file-pdf"></i></div>
                <div class="list-content">
                    <div class="list-title">${d.title}</div>
                    <p class="list-desc">Arquivo PDF para estudos complementares.</p>
                </div>
                <div class="list-action"><i class="fas fa-download"></i> Baixar</div>
            </div>
        `).join('') : '<p style="color:#94a3b8;">Nenhum documento disponível neste módulo.</p>';
        
        // --- Quizzes List ---
        const quizzesList = document.getElementById('quizzes-list');
        quizzesList.innerHTML = quizzes.length ? quizzes.map((q, i) => `
            <div class="list-item" onclick="openPlayer('quiz', ${i})">
                <div class="list-icon" style="color:#cf9c33; background:rgba(207, 156, 51, 0.2);"><i class="fas fa-question-circle"></i></div>
                <div class="list-content">
                    <div class="list-title">${q.title}</div>
                    <p class="list-desc">${q.questions ? q.questions.length : 0} Questões • Avaliação Prática</p>
                </div>
                <div class="list-action"><i class="fas fa-pencil-alt"></i> Iniciar</div>
            </div>
        `).join('') : '<p style="color:#94a3b8;">Nenhum quiz disponível neste módulo.</p>';
        
        // --- Overview Grid (Combines everything for the home page of the module) ---
        const overviewGrid = document.getElementById('overview-grid');
        const allItems = [...videos, ...quizzes].sort((a,b) => a.order - b.order);
        overviewGrid.innerHTML = allItems.map(item => {
            if (item.contentType === 'video') {
                const i = videos.indexOf(item);
                const thumbHtml = getVideoThumbnailHtml(item);
                return `
                <div class="card" onclick="openPlayer('video', ${i})">
                    <div class="card-thumb">
                        ${thumbHtml}
                        <i class="fas fa-play-circle play-icon"></i>
                    </div>
                    <div class="card-body">
                        <div class="card-title">${escapeHtml(item.title)}</div>
                        <div class="card-meta"><i class="fas fa-video"></i> Aula em Vídeo</div>
                    </div>
                </div>`;
            } else if (item.contentType === 'quiz') {
                const i = quizzes.indexOf(item);
                return `
                <div class="card" onclick="openPlayer('quiz', ${i})">
                    <div class="card-thumb" style="background:#1e293b;">
                        <i class="fas fa-question-circle" style="font-size: 5rem; color:#cf9c33; opacity:0.8;"></i>
                    </div>
                    <div class="card-body">
                        <div class="card-title">${item.title}</div>
                        <div class="card-meta"><i class="fas fa-pencil-alt"></i> Avaliação Prática</div>
                    </div>
                </div>`;
            }
        }).join('');
        
        if (allItems.length === 0) {
            overviewGrid.innerHTML = '<p style="color:#94a3b8; width:100%; text-align:center;">Este módulo ainda não possui conteúdos interativos.</p>';
        }
    }
    
    // Tab Navigation
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            hubSections.forEach(s => s.classList.remove('active'));
            document.getElementById('section-' + tab.dataset.tab).classList.add('active');
        });
    });
    
    // Player Logic
    window.openPlayer = function(type, index) {
        playerContent.innerHTML = '';
        
        if (type === 'video') {
            const v = videos[index];
            const title = escapeHtml(v.title);
            playerTitle.textContent = v.title;
            const videoInfo = parseVideoUrl(v.url);

            if (videoInfo.type === 'sharepoint') {
                window.open(v.url, '_blank', 'noopener,noreferrer');
                playerView.classList.remove('active');
                return;
            }

            playerView.classList.add('active');
            
            if (videoInfo.type === 'youtube' && videoInfo.youtubeId) {
                const embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(videoInfo.youtubeId)}?autoplay=1`;
                playerContent.innerHTML = `
                    <div class="video-container">
                        <div class="video-wrapper">
                            <iframe src="${embedUrl}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
                        </div>
                        <div class="video-info">
                            <h2 style="color:#fff;">${title}</h2>
                        </div>
                    </div>
                `;
            } else if (videoInfo.type === 'direct') {
                playerContent.innerHTML = `
                    <div class="video-container">
                        <div class="video-wrapper">
                            <video src="${escapeAttr(v.url)}" controls autoplay></video>
                        </div>
                        <div class="video-info">
                            <h2 style="color:#fff;">${title}</h2>
                        </div>
                    </div>
                `;
            } else {
                const externalLabel = 'Abrir vídeo em nova aba';
                playerContent.innerHTML = `
                    <div class="video-container">
                        <div class="video-info" style="padding:40px; text-align:center;">
                            <h2 style="color:#fff;">${title}</h2>
                            <p style="color:#cbd5e1; margin-top:8px;">Este vídeo abre em uma nova aba.</p>
                            <a href="${escapeAttr(v.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:8px; margin-top:12px; color:#cf9c33; font-weight:700;">
                                <i class="fas fa-external-link-alt"></i> ${externalLabel}
                            </a>
                        </div>
                    </div>
                `;
            }
        } 
        else if (type === 'quiz') {
            playerView.classList.add('active');
            const q = quizzes[index];
            playerTitle.textContent = q.title;
            
            if (!q.questions || q.questions.length === 0) {
                playerContent.innerHTML = `<div class="quiz-container"><h2>${q.title}</h2><p>Este questionário ainda não possui perguntas.</p></div>`;
                return;
            }
            
            let questionsHtml = q.questions.map((quest, qIndex) => `
                <div class="question-block" data-question-id="${quest.id}">
                    <h3 class="question-text">${qIndex + 1}. ${quest.text}</h3>
                    <div class="options-list">
                        ${quest.options.map(opt => `
                            <label class="option-label">
                                <input type="radio" name="question_${quest.id}" value="${opt.id}">
                                <span>${opt.text}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `).join('');
            
            playerContent.innerHTML = `
                <div class="quiz-container">
                    <div class="quiz-header">
                        <h2><i class="fas fa-question-circle" style="margin-right:10px;"></i>${q.title}</h2>
                    </div>
                    <form id="quiz-form" data-quiz-id="${q.id}">
                        ${questionsHtml}
                        <button type="submit" class="btn-submit-quiz">Enviar Respostas</button>
                    </form>
                </div>
            `;
            
            document.getElementById('quiz-form').addEventListener('submit', handleQuizSubmit);
        }
    };
    
    btnBackHub.addEventListener('click', () => {
        playerView.classList.remove('active');
        playerContent.innerHTML = ''; // Stop video playback
    });
    
    // Telemetry and Actions
    window.downloadDocument = async function(documentId) {
        window.open(`/api/documents/download/${documentId}`, '_blank');
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
        const item = quizzes.find(c => c.id == quizId);
        
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
