document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('moduleId');
    const courseId = urlParams.get('courseId');
    
    if (!moduleId) {
        alert(window.t ? window.t('moduleViewer.missingId', 'ID do módulo está ausente') : 'ID do módulo está ausente');
        window.location.href = 'home.html';
        return;
    }
    
    const btnBack = document.getElementById('btn-back');
    const viewerContainer = document.getElementById('app');
    const worldIframe = document.getElementById('world-iframe');
    let isWorldMode = false;

    function exitWorldMode() {
        isWorldMode = false;
        viewerContainer.classList.remove('world-mode');
        worldIframe.src = ''; // Free up memory and WebGL context
        btnBack.innerHTML = '<i class="fas fa-arrow-left"></i> ' + (window.t ? window.t('moduleViewer.back', 'Back') : 'Back');
        btnBack.title = window.t ? window.t('moduleViewer.backToCourse', 'Back to Course') : 'Back to Course';
        
        // Reset tabs to entry-test if coming from world mode
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        const defaultTab = document.querySelector('[data-tab="entry-test"]') || document.querySelector('[data-tab="overview"]');
        if (defaultTab) defaultTab.classList.add('active');
    }

    btnBack.onclick = () => {
        if (isWorldMode) {
            exitWorldMode();
        } else {
            window.location.href = courseId ? `course_content.html?id=${courseId}` : 'home.html';
        }
    };
    
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const getMultiplayerUrl = () => {
        // Point to the newly merged local public/world directory
        return window.location.origin + '/world';
    };

    function buildCourseWorldUrl() {
        const multiplayerUrl = getMultiplayerUrl();
        if (!multiplayerUrl) return null;

        try {
            // Append index.html explicitly
            const targetUrl = new URL(multiplayerUrl + '/index.html');
            if (courseId) targetUrl.searchParams.set('courseId', courseId);
            if (moduleId) targetUrl.searchParams.set('moduleId', moduleId);
            targetUrl.searchParams.set('token', token);
            targetUrl.searchParams.set('source', 'training-platform');
            return targetUrl.toString();
        } catch (error) {
            console.error('Invalid PUBLIC_MULTIPLAYER_URL:', error);
            return null;
        }
    }

    function openCourseWorld() {
        const targetUrl = buildCourseWorldUrl();
        if (!targetUrl) {
            alert('3D Course World is not configured yet. Set PUBLIC_MULTIPLAYER_URL in Railway for this environment.');
            return;
        }
        
        // Setup iframe and world mode
        worldIframe.src = targetUrl;
        isWorldMode = true;
        viewerContainer.classList.add('world-mode');
        
        // Change back button behavior
        btnBack.innerHTML = '<i class="fas fa-times"></i> ' + (window.t ? window.t('moduleViewer.exit3DWorld', 'Exit 3D World') : 'Exit 3D World');
        btnBack.title = window.t ? window.t('moduleViewer.returnCourseContent', 'Return to course content') : 'Return to course content';
    }
    
    let moduleData = null;
    let videos = [];
    let documents = [];
    let quizzes = [];
    let entryTests = [];
    let finalEvaluations = [];
    let entryTestPassed = false;
    
    // UI Elements
    const navTabs = document.querySelectorAll('.nav-tab');
    const worldButton = document.getElementById('btn-enter-course-world');
    const hubSections = document.querySelectorAll('.hub-section');
    const playerView = document.getElementById('player-view');
    const btnBackHub = document.getElementById('btn-back-hub');
    const playerContent = document.getElementById('player-content');
    const playerTitle = document.getElementById('player-title');

    if (worldButton && !getMultiplayerUrl()) {
        worldButton.classList.add('is-disabled');
        worldButton.title = 'Set PUBLIC_MULTIPLAYER_URL in Railway to enable the 3D Course World.';
    }
    
    try {
        const response = await fetch(`/runtime/modules/${moduleId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error(window.t ? window.t('moduleViewer.loadFailed', 'Falha ao carregar os dados do módulo') : 'Falha ao carregar os dados do módulo');
        }
        
        moduleData = await response.json();
        
        document.getElementById('module-name').textContent = moduleData.title || (window.t ? window.t('moduleViewer.unnamedModule', 'Unnamed Module') : 'Unnamed Module');
        document.getElementById('course-title').textContent = window.t ? window.t('moduleViewer.courseContent', 'Course Content') : 'Course Content';
        
        // --- Language Session Auto-detect ---
        const languageSessions = moduleData.languageSessions || [];
        let activeSessionId = null;
        
        if (languageSessions.length > 0) {
            // Get user's preferred locale from profile
            let userLocale = null;
            try {
                const profileRes = await fetch('/api/profile/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    const profileData = profile.data || profile;
                    let prefs = {};
                    if (typeof profileData.preferences === 'string') {
                        try { prefs = JSON.parse(profileData.preferences); } catch(e){}
                    } else {
                        prefs = profileData.preferences || {};
                    }
                    userLocale = prefs.language || profileData.language || null;
                }
            } catch (e) {
                console.warn('Could not fetch user locale for language session:', e);
            }

            if (userLocale) {
                const matchSession = languageSessions.find(s => s.locale === userLocale);
                if (matchSession) {
                    activeSessionId = matchSession.id;
                }
            }
            // If no match found, activeSessionId stays null => base content
        }

        // Filter content by session
        const filterBySession = (items) => {
            if (!items) return [];
            return items.filter(item => {
                if (activeSessionId === null) {
                    return !item.languageSessionId;
                }
                return item.languageSessionId === activeSessionId;
            });
        };

        videos = filterBySession(moduleData.videos || []).map(v => ({ ...v, contentType: 'video' })).sort((a,b) => a.order - b.order);
        documents = (moduleData.documents || []).map(d => ({ ...d, contentType: 'document' })).sort((a,b) => a.order - b.order); // Documents are shared globally — no session filter
        let quizzesRaw = moduleData.quizzes || [];
        quizzes = filterBySession(quizzesRaw).map(q => ({ ...q, contentType: 'quiz' })).sort((a,b) => a.order - b.order);
        
        // Split quizzes by type
        entryTests = quizzes.filter(q => q.type === 'ENTRY_TEST');
        
        // Fallback: If no entry test in current language session, use the base module's entry test
        if (entryTests.length === 0 && activeSessionId !== null) {
            const baseEntryTests = quizzesRaw
                .filter(q => !q.languageSessionId && q.type === 'ENTRY_TEST')
                .map(q => ({ ...q, contentType: 'quiz' }));
                
            if (baseEntryTests.length > 0) {
                entryTests = baseEntryTests;
                // Add the base entry tests to the rendering list
                quizzes = [...baseEntryTests, ...quizzes].sort((a,b) => a.order - b.order);
            }
        }
        
        finalEvaluations = quizzes.filter(q => q.type !== 'ENTRY_TEST');
        
        // Check if entry test has been passed (check submissions)
        if (entryTests.length > 0) {
            try {
                const subsRes = await fetch(`/modules/${moduleId}/quiz/submissions?t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
                });
                if (subsRes.ok) {
                    const submissions = await subsRes.json();
                    const entryTestQuizIds = entryTests.map(et => et.id);
                    // Check both: submission quizId matches known entry tests, OR submission's quiz.type is ENTRY_TEST
                    entryTestPassed = submissions.some(s => 
                        entryTestQuizIds.includes(s.quizId) || 
                        (s.quiz && s.quiz.type === 'ENTRY_TEST')
                    );
                }
            } catch (e) {
                console.warn('Could not check entry test submissions:', e);
            }
        } else {
            // No entry test exists, so final evaluation is unlocked
            entryTestPassed = true;
        }
        
        // Update Badges
        document.getElementById('badge-videos').textContent = videos.length;
        document.getElementById('badge-documents').textContent = documents.length;
        document.getElementById('badge-quizzes').textContent = finalEvaluations.length;
        const badgeEntryTest = document.getElementById('badge-entry-test');
        if (badgeEntryTest) badgeEntryTest.textContent = entryTests.length;
        
        renderHubs();
        updateFinalEvaluationLock();
        
    } catch (error) {
        console.error(error);
        const errorContainer = document.getElementById('entry-test-list') || document.getElementById('overview-grid');
        if (errorContainer) errorContainer.innerHTML = `<div style="color: #ef4444; width:100%; text-align:center; padding:20px;">${window.t ? window.t('moduleViewer.errorLoadContent', 'Erro ao carregar o conteúdo do módulo.') : 'Erro ao carregar o conteúdo do módulo.'}</div>`;
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
                    <div class="card-meta"><i class="fas fa-video"></i> ${window.t ? window.t('moduleViewer.videoLesson', 'Video Lesson') : 'Video Lesson'}</div>
                </div>
            </div>`;
        }).join('') : '<p style="color:#94a3b8;">' + (window.t ? window.t('moduleViewer.noVideos', 'No videos available in this module.') : 'No videos available in this module.') + '</p>';
        
        // --- Documents ---
        renderDocuments('all');
        
        // --- Entry Tests List ---
        const entryTestList = document.getElementById('entry-test-list');
        if (entryTestList) {
            entryTestList.innerHTML = entryTests.length ? entryTests.map((q) => {
                const globalIdx = quizzes.indexOf(q);
                return `
                <div class="list-item" onclick="openPlayer('quiz', ${globalIdx})">
                    <div class="list-icon" style="color:#f59e0b; background:rgba(245, 158, 11, 0.15);"><i class="fas fa-clipboard-check"></i></div>
                    <div class="list-content">
                        <div class="list-title">${q.title}</div>
                        <p class="list-desc">${q.questions ? q.questions.length : 0} ${window.t ? window.t('moduleViewer.questionsAssessment', 'Questions') : 'Questions'} • ${window.t ? window.t('moduleViewer.entryTest', 'Entry Test') : 'Entry Test'}</p>
                    </div>
                    <div class="list-action"><i class="fas fa-pencil-alt"></i>${window.t ? window.t('moduleViewer.start', 'Start') : 'Start'}</div>
                </div>`;
            }).join('') : '<p style="color:#94a3b8;">' + (window.t ? window.t('moduleViewer.noEntryTest', 'No entry test available yet.') : 'No entry test available yet.') + '</p>';
        }
        
        // --- Final Evaluation Quizzes List ---
        const quizzesList = document.getElementById('quizzes-list');
        quizzesList.innerHTML = finalEvaluations.length ? finalEvaluations.map((q) => {
            const globalIdx = quizzes.indexOf(q);
            return `
            <div class="list-item" onclick="openPlayer('quiz', ${globalIdx})">
                <div class="list-icon" style="color:#cf9c33; background:rgba(207, 156, 51, 0.2);"><i class="fas fa-question-circle"></i></div>
                <div class="list-content">
                    <div class="list-title">${q.title}</div>
                    <p class="list-desc">${q.questions ? q.questions.length : 0} ${window.t ? window.t('moduleViewer.questionsAssessment', 'Questions') : 'Questions'} • ${window.t ? window.t('moduleViewer.practicalAssessment', 'Practical Assessment') : 'Practical Assessment'}</p>
                </div>
                <div class="list-action"><i class="fas fa-pencil-alt"></i>${window.t ? window.t('moduleViewer.start', 'Start') : 'Start'}</div>
            </div>`;
        }).join('') : '<p style="color:#94a3b8;">' + (window.t ? window.t('moduleViewer.noQuizzes', 'No quizzes available in this module.') : 'No quizzes available in this module.') + '</p>';
        
        // --- Overview Grid (Combines everything for the home page of the module) ---
        const overviewGrid = document.getElementById('overview-grid');
        if (overviewGrid) {
            const allItems = [...videos, ...documents, ...quizzes].sort((a,b) => a.order - b.order);
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
                            <div class="card-meta"><i class="fas fa-video"></i> ${window.t ? window.t('moduleViewer.videoLesson', 'Video Lesson') : 'Video Lesson'}</div>
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
                            <div class="card-meta"><i class="fas fa-pencil-alt"></i> ${window.t ? window.t('moduleViewer.practicalAssessment', 'Practical Assessment') : 'Practical Assessment'}</div>
                        </div>
                    </div>`;
                } else if (item.contentType === 'document') {
                    const docType = getDocType(item.title);
                    const i = documents.indexOf(item);
                    let icon = 'fa-file-alt';
                    let color = '#64748b';
                    
                    if (docType === 'pdf') { icon = 'fa-file-pdf'; color = '#ef4444'; }
                    else if (docType === 'word') { icon = 'fa-file-word'; color = '#3b82f6'; }
                    else if (docType === 'ppt') { icon = 'fa-file-powerpoint'; color = '#f97316'; }
                    else if (docType === 'image') { icon = 'fa-image'; color = '#10b981'; }
                    
                    return `
                    <div class="card" onclick="openPlayer('document', ${i})">
                        <div class="card-thumb" style="background:#f1f5f9;">
                            <i class="fas ${icon}" style="font-size: 5rem; color:${color}; opacity:0.8;"></i>
                        </div>
                        <div class="card-body">
                            <div class="card-title">${escapeHtml(item.title)}</div>
                            <div class="card-meta"><i class="fas ${icon}"></i> ${window.t ? window.t('moduleViewer.document', 'Document') : 'Document'}</div>
                        </div>
                    </div>`;
                }
            }).join('');
            
            if (allItems.length === 0) {
                overviewGrid.innerHTML = '<p style="color:#94a3b8; width:100%; text-align:center;">' + (window.t ? window.t('moduleViewer.noInteractiveContent', 'This module does not have interactive content yet.') : 'This module does not have interactive content yet.') + '</p>';
            }
        }
    }
    
    function updateFinalEvaluationLock() {
        const quizzesTab = document.querySelector('.nav-tab[data-tab="quizzes"]');
        if (!quizzesTab) return;
        
        if (!entryTestPassed && entryTests.length > 0) {
            // Lock the final evaluation tab
            quizzesTab.style.opacity = '0.45';
            quizzesTab.style.pointerEvents = 'none';
            quizzesTab.style.cursor = 'not-allowed';
            quizzesTab.title = window.t ? window.t('moduleViewer.completEntryTestFirst', 'Complete the Entry Test first to unlock') : 'Complete the Entry Test first to unlock';
            
            // Add lock icon to badge
            const badge = quizzesTab.querySelector('.badge');
            if (badge) {
                badge.innerHTML = '<i class="fas fa-lock" style="font-size:0.7rem;"></i>';
                badge.style.background = '#94a3b8';
            }
        } else {
            // Unlock the final evaluation tab
            quizzesTab.style.opacity = '';
            quizzesTab.style.pointerEvents = '';
            quizzesTab.style.cursor = '';
            quizzesTab.title = '';
            
            const badge = quizzesTab.querySelector('.badge');
            if (badge) {
                badge.textContent = finalEvaluations.length;
                badge.style.background = '';
            }
        }
    }
    
    function getDocType(filename) {
        const ext = (filename || '').split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return 'pdf';
        if (['doc', 'docx'].includes(ext)) return 'word';
        if (['ppt', 'pptx'].includes(ext)) return 'ppt';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        return 'other';
    }

    function renderDocuments(filter = 'all') {
        const container = document.getElementById('documents-container');
        
        // Update Filter Buttons
        document.querySelectorAll('.doc-filter').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === filter);
        });

        const filteredDocs = documents.filter(d => filter === 'all' || getDocType(d.title) === filter);

        if (filteredDocs.length === 0) {
            container.innerHTML = '<p style="color:#94a3b8; padding-top:20px;">' + (window.t ? window.t('moduleViewer.noDocsFilter', 'No documents found for this filter.') : 'No documents found for this filter.') + '</p>';
            return;
        }

        let html = '';
        
        // Split into List (PDF/Word/Other) and Grid (Images/PPT)
        const listItems = [];
        const gridItems = [];
        
        filteredDocs.forEach(d => {
            const type = getDocType(d.title);
            const originalIndex = documents.indexOf(d);
            
            if (type === 'image' || type === 'ppt') {
                const icon = type === 'image' ? 'fa-image' : 'fa-file-powerpoint';
                const color = type === 'image' ? '#10b981' : '#f97316';
                
                let thumbContent = `<i class="fas ${icon}" style="color: ${color}"></i>`;
                if (type === 'image') {
                    // Try to load actual thumbnail if inline view is available
                    // Use fetch to bypass auth limits, or keep icon if it fails
                    thumbContent = `<div class="auth-img-thumb" data-url="/api/documents/download/${d.documentId}?inline=true" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;"><i class="fas fa-spinner fa-spin" style="color: #cbd5e1;"></i></div>`;
                }

                gridItems.push(`
                    <div class="doc-grid-item" onclick="openPlayer('document', ${originalIndex})">
                        <div class="doc-grid-thumb">${thumbContent}</div>
                        <div class="doc-grid-body">
                            <div class="doc-grid-title">${escapeHtml(d.title)}</div>
                            <div class="doc-grid-meta">
                                <span><i class="fas ${icon}"></i> ${type.toUpperCase()}</span>
                                <i class="fas fa-eye" style="color:#cf9c33;"></i>
                            </div>
                        </div>
                    </div>
                `);
            } else {
                let icon = 'fa-file-alt';
                let color = '#94a3b8';
                let desc = (window.t ? window.t('moduleViewer.genericDocument', 'Generic Document') : 'Generic Document');
                
                if (type === 'pdf') { icon = 'fa-file-pdf'; color = '#ef4444'; desc = (window.t ? window.t('moduleViewer.interactivePdf', 'Interactive PDF File') : 'Interactive PDF File'); }
                if (type === 'word') { icon = 'fa-file-word'; color = '#3b82f6'; desc = (window.t ? window.t('moduleViewer.textDocument', 'Text Document') : 'Text Document'); }

                listItems.push(`
                    <div class="list-item">
                        <div class="list-icon" style="color:${color}; background:#f0f9ff;"><i class="fas ${icon}"></i></div>
                        <div class="list-content" style="cursor:pointer;" onclick="openPlayer('document', ${originalIndex})">
                            <div class="list-title">${escapeHtml(d.title)}</div>
                            <p class="list-desc">${desc}</p>
                        </div>
                        <div class="list-action">
                            <button class="btn-action-icon" title="View" onclick="openPlayer('document', ${originalIndex})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action-icon download" title="Download" onclick="downloadDocument(${d.documentId})">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                `);
            }
        });

        // Construct final HTML
        if (listItems.length > 0) {
            html += `<div class="list-layout" style="margin-bottom: 25px;">${listItems.join('')}</div>`;
        }
        if (gridItems.length > 0) {
            html += `<div class="grid-layout">${gridItems.join('')}</div>`;
        }

        container.innerHTML = html;
        
        // Load authenticated thumbnails
        document.querySelectorAll('.auth-img-thumb').forEach(async (el) => {
            try {
                const res = await fetch(el.dataset.url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
                if (res.ok) {
                    const blob = await res.blob();
                    el.innerHTML = `<img src="${URL.createObjectURL(blob)}" alt="Thumbnail" style="width:100%; height:100%; object-fit:cover;">`;
                } else {
                    el.innerHTML = `<i class="fas fa-image" style="color: #10b981;"></i>`;
                }
            } catch (err) {
                el.innerHTML = `<i class="fas fa-image" style="color: #10b981;"></i>`;
            }
        });
    }

    document.querySelectorAll('.doc-filter').forEach(btn => {
        btn.addEventListener('click', () => renderDocuments(btn.dataset.type));
    });
    
    // Tab Navigation
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.dataset.action === 'course-world') {
                openCourseWorld();
                return;
            }

            if (!tab.dataset.tab) return;
        
        // Force close player view when navigating
        playerView.classList.remove('active');
        document.querySelector('.viewer-main').classList.remove('no-padding');
        playerContent.innerHTML = '';
        playerContent.style.padding = '40px';

        navTabs.forEach(t => {
            if (t.dataset.tab) t.classList.remove('active');
        });
        tab.classList.add('active');
        
        hubSections.forEach(s => s.classList.remove('active'));
        document.getElementById('section-' + tab.dataset.tab).classList.add('active');
    });
});

btnBackHub.addEventListener('click', () => {
    playerView.classList.remove('active');
    document.querySelector('.viewer-main').classList.remove('no-padding');
    playerContent.innerHTML = ''; // Stop video playback
    playerContent.style.padding = '40px';
    
    // Reactivate the currently selected tab's section
    const activeTab = document.querySelector('.nav-tab.active');
    if (activeTab && activeTab.dataset.tab) {
        const section = document.getElementById('section-' + activeTab.dataset.tab);
        if (section) section.classList.add('active');
    } else {
        const fallback = document.getElementById('section-entry-test') || document.getElementById('section-overview');
        if (fallback) fallback.classList.add('active');
    }
});
    
    // Player Logic
    window.openPlayer = function(type, index) {
    const hubSections = document.querySelectorAll('.hub-section');
    hubSections.forEach(s => s.classList.remove('active'));
    
    document.querySelector('.viewer-main').classList.add('no-padding');
    
    if (type === 'video') {
        playerView.classList.add('active');
        playerContent.style.overflowY = 'auto';
        playerContent.style.padding = '40px';
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
                const externalLabel = (window.t ? window.t('moduleViewer.openVideoNewTab', 'Abrir vídeo em nova aba') : 'Abrir vídeo em nova aba');
                playerContent.innerHTML = `
                    <div class="video-container">
                        <div class="video-info" style="padding:40px; text-align:center;">
                            <h2 style="color:#fff;">${title}</h2>
                            <p style="color:#cbd5e1; margin-top:8px;">${window.t ? window.t('moduleViewer.videoOpensNewTab', 'Este vídeo abre em uma nova aba.') : 'Este vídeo abre em uma nova aba.'}</p>
                            <a href="${escapeAttr(v.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:8px; margin-top:12px; color:#cf9c33; font-weight:700;">
                                <i class="fas fa-external-link-alt"></i> ${externalLabel}
                            </a>
                        </div>
                    </div>
                `;
            }
        }
        else if (type === 'document') {
            playerView.classList.add('active');
            const d = documents[index];
            const title = escapeHtml(d.title);
            playerTitle.textContent = title;
            const docType = getDocType(title);
            const downloadUrl = `/api/documents/download/${d.documentId}?inline=true`;
            const rawDownloadUrl = `/api/documents/download/${d.documentId}`;

            // Telemetry call for opening document
            fetch(`/modules/${moduleId}/documents/${d.documentId}/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ source: 'dashboard_view' })
            }).catch(e => console.error(e));

            if (docType === 'pdf') {
                playerContent.style.padding = '0'; // Remove padding for full bleed
                playerContent.innerHTML = `
                    <div class="doc-viewer-wrapper" id="pdf-container" style="width:100%; height:100%; max-width:100%; max-height:100%; background:#f8fafc; display:flex; align-items:center; justify-content:center;">
                        <div style="text-align:center; color:#64748b;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>Gerando ticket de acesso...</div>
                    </div>
                `;
                
                fetch(`/api/documents/${d.documentId}/ticket`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
                    .then(res => res.json())
                    .then(data => {
                        if (data.ticket) {
                            document.getElementById('pdf-container').innerHTML = `<iframe src="/api/documents/ticket/${data.ticket}?inline=true" style="width:100%; height:100%; border:none; border-radius:0; display:block;"></iframe>`;
                        } else {
                            document.getElementById('pdf-container').innerHTML = `<div style="color:red; text-align:center;"><i class="fas fa-times-circle fa-2x"></i><br>Erro ao gerar acesso seguro.</div>`;
                        }
                    })
                    .catch(err => {
                        document.getElementById('pdf-container').innerHTML = `<div style="color:red; text-align:center;"><i class="fas fa-times-circle fa-2x"></i><br>Falha na comunicação.</div>`;
                    });
            } else if (docType === 'image') {
                playerContent.innerHTML = `
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; width:100%;" id="img-container">
                        <div style="text-align:center; color:#64748b; padding: 50px;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>${window.t ? window.t('moduleViewer.loadingImage', 'Loading Image...') : 'Loading Image...'}</div>
                    </div>
                `;
                
                fetch(downloadUrl, { headers: { 'Authorization': `Bearer ${token}` } })
                    .then(res => {
                        if (!res.ok) throw new Error('Network response was not ok');
                        return res.blob();
                    })
                    .then(blob => {
                        const blobUrl = URL.createObjectURL(blob);
                        document.getElementById('img-container').innerHTML = `
                            <img src="${blobUrl}" class="doc-viewer-image" alt="${title}" style="max-width: 100%; max-height: 80vh; border-radius: 8px; object-fit: contain; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
                            <a href="${rawDownloadUrl}" class="btn-submit-quiz" style="width:auto; margin-top:20px; text-decoration:none;"><i class="fas fa-download"></i> ${window.t ? window.t('moduleViewer.downloadOriginal', 'Fazer Download Original') : 'Fazer Download Original'}</a>
                        `;
                    })
                    .catch(err => {
                        document.getElementById('img-container').innerHTML = `<div style="text-align:center; color:#ef4444; padding:50px;"><i class="fas fa-times-circle fa-2x"></i><br>${window.t ? window.t('moduleViewer.failedLoadImage', 'Falha ao carregar a imagem.') : 'Falha ao carregar a imagem.'}</div>`;
                    });
            } else if (docType === 'ppt') {
                // PowerPoint Fallback to Office Viewer (Requires Public URL)
                const publicUrl = window.location.origin + rawDownloadUrl;
                const msViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`;
                
                playerContent.innerHTML = `
                    <div class="doc-viewer-wrapper" style="width:100%; height:100%; max-width:1200px; margin: 0 auto; display:flex; flex-direction:column; background:#f8fafc; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                        <div style="padding: 15px; background: #fff3cd; color: #856404; border-bottom: 1px solid #ffeeba; font-size: 0.9rem; text-align: center;">
                            <i class="fas fa-info-circle"></i> O visualizador de PowerPoint utiliza um serviço da Microsoft que exige que a plataforma esteja online. Se você estiver testando em <b>localhost</b>, o slide não carregará abaixo.
                        </div>
                        <iframe src="${msViewerUrl}" class="doc-viewer-iframe" style="flex:1; border-radius:0;"></iframe>
                        <div style="text-align:center; padding: 15px; background:#fff; border-top: 1px solid #e2e8f0;">
                            <a href="${rawDownloadUrl}" class="btn-submit-quiz" style="width:auto; text-decoration:none;"><i class="fas fa-download"></i> ${window.t ? window.t('moduleViewer.downloadFile', 'Baixar Arquivo') : 'Baixar Arquivo'} PPTX Original</a>
                        </div>
                    </div>
                `;
            } else if (docType === 'word') {
                // Word DOCX Rendering
                playerContent.innerHTML = `
                    <div class="doc-viewer-wrapper" id="docx-container" style="background:#fff; padding: 40px; color: #000; overflow-x: auto; max-width: 900px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 8px;">
                        <div style="text-align:center; color:#64748b; padding: 50px;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>Loading Document...</div>
                    </div>
                `;
                
                fetch(rawDownloadUrl, { headers: { 'Authorization': `Bearer ${token}` } })
                    .then(res => {
                        if (!res.ok) throw new Error('Network response was not ok');
                        return res.blob();
                    })
                    .then(blob => {
                        const container = document.getElementById('docx-container');
                        container.innerHTML = '';
                        // Render with docx-preview
                        docx.renderAsync(blob, container, null, {
                            className: 'docx-viewer',
                            inWrapper: true,
                            ignoreWidth: false,
                            ignoreHeight: false
                        }).catch(err => {
                            container.innerHTML = `<div style="text-align:center; color:#ef4444; padding:50px;"><i class="fas fa-exclamation-triangle fa-2x"></i><br>Erro ao renderizar documento. O arquivo pode não estar no formato .docx moderno.<br><br><a href="${rawDownloadUrl}" class="btn-submit-quiz" style="display:inline-block; width:auto; text-decoration:none; margin-top:15px;"><i class="fas fa-download"></i> ${window.t ? window.t('moduleViewer.downloadTraditional', 'Fazer Download Tradicional') : 'Fazer Download Tradicional'}</a></div>`;
                        });
                    })
                    .catch(err => {
                        document.getElementById('docx-container').innerHTML = `<div style="text-align:center; color:#ef4444; padding:50px;"><i class="fas fa-times-circle fa-2x"></i><br>${window.t ? window.t('moduleViewer.failedDownload', 'Falha ao baixar arquivo.') : 'Falha ao baixar arquivo.'}</div>`;
                    });
            } else {
                playerContent.innerHTML = `
                    <div class="quiz-container" style="text-align:center; margin: 0 auto; max-width: 600px;">
                        <i class="fas fa-file-alt" style="font-size: 5rem; color:#94a3b8; margin-bottom: 20px;"></i>
                        <h2 style="color:#0f172a; margin-bottom: 10px;">${window.t ? window.t('moduleViewer.genericDocument', 'Documento Genérico') : 'Documento Genérico'}</h2>
                        <p style="color:#64748b; margin-bottom: 25px;">${window.t ? window.t('moduleViewer.noWebPreview', 'Visualização web não disponível para este formato.') : 'Visualização web não disponível para este formato.'}</p>
                        <a href="${rawDownloadUrl}" class="btn-submit-quiz" style="text-decoration:none; display:inline-block; width:auto;"><i class="fas fa-download"></i> ${window.t ? window.t('moduleViewer.downloadFile', 'Baixar Arquivo') : 'Baixar Arquivo'}</a>
                    </div>
                `;
            }
        } 
        else if (type === 'quiz') {
            playerContent.style.padding = '40px'; // Reset padding for quiz
            playerContent.style.overflowY = 'auto';
            playerView.classList.add('active');
            const q = quizzes[index];
            playerTitle.textContent = q.title;
            
            if (!q.questions || q.questions.length === 0) {
                playerContent.innerHTML = `<div class="quiz-container"><h2>${q.title}</h2><p>${window.t ? window.t('moduleViewer.noQuestionsYet', 'Este questionário ainda não possui perguntas.') : 'Este questionário ainda não possui perguntas.'}</p></div>`;
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
                        <button type="submit" class="btn-submit-quiz">${window.t ? window.t('moduleViewer.submitAnswers', 'Enviar Respostas') : 'Enviar Respostas'}</button>
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
        try {
            const ticketRes = await fetch(`/api/documents/${documentId}/ticket`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
            const { ticket } = await ticketRes.json();
            if (ticket) {
                window.open(`/api/documents/ticket/${ticket}`, '_blank');
            } else {
                alert('Falha ao gerar ticket de download.');
                return;
            }
            
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
            alert(window.t ? window.t('moduleViewer.answerAllQuestions', 'Por favor, responda a todas as perguntas antes de enviar.') : 'Por favor, responda a todas as perguntas antes de enviar.');
            return;
        }
        
        const btn = form.querySelector('.btn-submit-quiz');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (window.t ? window.t('moduleViewer.submitting', 'Enviando...') : 'Enviando...');
        
        try {
            const res = await fetch(`/modules/${moduleId}/quiz/submit`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ answers, courseId, quizId: parseInt(quizId) })
            });
            
            if (!res.ok) throw new Error(window.t ? window.t('moduleViewer.failedSubmitAnswers', 'Falha ao enviar respostas') : 'Falha ao enviar respostas');
            
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
                feedbackEl.textContent = window.t ? window.t('moduleViewer.excellentQuiz', 'Excelente! Você foi aprovado no quiz.') : 'Excelente! Você foi aprovado no quiz.';
            } else if (scorePercent >= 60) {
                scoreEl.style.borderColor = '#f59e0b';
                scoreEl.style.color = '#f59e0b';
                feedbackEl.textContent = window.t ? window.t('moduleViewer.goodEffort', 'Bom esforço! Mas você pode tentar de novo para melhorar.') : 'Bom esforço! Mas você pode tentar de novo para melhorar.';
            } else {
                scoreEl.style.borderColor = '#ef4444';
                scoreEl.style.color = '#ef4444';
                feedbackEl.textContent = window.t ? window.t('moduleViewer.keepStudying', 'Continue estudando e tente novamente!') : 'Continue estudando e tente novamente!';
            }
            
            modal.classList.add('active');
            
            btn.innerHTML = window.t ? window.t('moduleViewer.retakeQuiz', 'Refazer Quiz') : 'Refazer Quiz';
            btn.disabled = false;

            // Automatically unlock final evaluation if this was an entry test
            if (item.type === 'ENTRY_TEST') {
                entryTestPassed = true;
                updateFinalEvaluationLock();
            }
            
        } catch (error) {
            console.error(error);
            alert(window.t ? window.t('moduleViewer.errorSubmitAnswers', 'Ocorreu um erro ao enviar suas respostas.') : 'Ocorreu um erro ao enviar suas respostas.');
            btn.innerHTML = (window.t ? window.t('moduleViewer.submitAnswers', 'Enviar Respostas') : 'Enviar Respostas');
            btn.disabled = false;
        }
    }
});
