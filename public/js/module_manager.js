const API_URL = window.location.origin;

function getAuthToken() {
    return localStorage.getItem('token');
}

async function apiCall(endpoint, method = 'GET', body = null, isFormData = false) {
    const token = getAuthToken();
    if (!token) {
        alert('Session expired. Please log in again.');
        window.location.href = 'login.html';
        throw new Error('No token');
    }

    const maxRetries = method === 'GET' ? 2 : 1;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            if (!isFormData) headers['Content-Type'] = 'application/json';

            const options = { method, headers };
            if (body) options.body = isFormData ? body : JSON.stringify(body);

            const res = await fetch(`${API_URL}${endpoint}`, options);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Request error');
            return data.data || data;
        } catch (err) {
            lastError = err;
            const isNetworkError = err.message === 'Failed to fetch' || err.name === 'TypeError';
            if (isNetworkError && attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

// ==========================================
// ESTADO DO GERENCIADOR DE MÓDULOS
// ==========================================
let dbModules = [];
let editingModuleId = null;
let currentLanguageSessionId = null; // Active language session filter (null = default/no session)
let moduleLanguageSessions = []; // Cached sessions for current module

const LOCALE_FLAGS = {
    'en-US': '🇬🇧', 'pt-BR': '🇧🇷', 'es-ES': '🇪🇸', 'it-IT': '🇮🇹',
    'fr-FR': '🇫🇷', 'ro-RO': '🇷🇴', 'de-DE': '🇩🇪', 'sq-AL': '🇦🇱',
    'el-GR': '🇬🇷', 'ru-RU': '🇷🇺'
};
const LOCALE_LABELS = {
    'en-US': 'English', 'pt-BR': 'Português', 'es-ES': 'Español', 'it-IT': 'Italiano',
    'fr-FR': 'Français', 'ro-RO': 'Română', 'de-DE': 'Deutsch', 'sq-AL': 'Shqip',
    'el-GR': 'Ελληνικά', 'ru-RU': 'Русский'
};

// ==========================================
// BANCO DE MÓDULOS (SELETOR)
// ==========================================

async function fetchModulesFromDB() {
    // Only used to keep dbModules cached if needed for other things
    try {
        const modules = await apiCall('/modules/my');
        dbModules = modules || [];
    } catch (error) {
        console.error('Error fetching modules:', error);
    }
}

function openModuleManager() {
    document.querySelector('.course-header').style.display = 'none';
    document.querySelector('.main-container').style.display = 'none';
    document.getElementById('module-editor-modal').style.display = 'block';
    document.getElementById('active-module-editor').style.display = 'none'; // hide detail panel initially
    window.scrollTo({ top: 0, behavior: 'instant' });
    renderAttachedModules();
    updateSimulationButton();
}
let sectionOpen = false;
function openStudentSection() {

    if (sectionOpen == false) {
        document.querySelector('.main-section').style.display = 'none';
        document.querySelector('.student-section').style.display = 'block';
        document.getElementById('student-section-p').innerText = 'Open Course Editor Section';
        sectionOpen = true;
        // Load rooms when opening student section
        if (typeof loadCourseRooms === 'function') loadCourseRooms();
    } else {
        document.querySelector('.main-section').style.display = 'grid';
        document.querySelector('.student-section').style.display = 'none';
        document.getElementById('student-section-p').innerText = 'Open Student Section';
        sectionOpen = false;
    }
}



function closeModuleEditor() {
    document.querySelector('.course-header').style.display = 'flex';
    document.querySelector('.main-container').style.display = 'grid';
    document.getElementById('module-editor-modal').style.display = 'none';
    if (typeof updateConstructionUI === 'function') {
        updateConstructionUI();
    }
}

function renderModuleBank(modulesToRender) {
    // Deprecated: We don't show the module bank anymore.
}

function filterModuleBank(query) {
    // Deprecated
}

function attachModuleToCourse(dbModuleId) {
    const module = dbModules.find(m => m.id === dbModuleId);
    if (!module) return;

    if (!window.courseModules) window.courseModules = [];

    if (window.courseModules.some(m => m.dbId === dbModuleId)) {
        alert('This module is already attached to this course!');
        return;
    }

    if (window.editingCourseId && !window.editingCourseId.toString().startsWith('course_')) {
        apiCall(`/courses/${window.editingCourseId}/modules`, 'POST', {
            moduleId: dbModuleId,
            requireQuizPass: false
        }).then(res => {
            window.courseModules.push({
                id: res.id, // courseModuleId
                dbId: dbModuleId,
                title: module.title,
                content: module.description || '',
                status: module.status,
                videos: module.videos || [],
                documents: module.documents || [],
                quizzes: module.quizzes || []
            });
            renderAttachedModules();
            alert('Module added to the course track!');
        }).catch(err => {
            alert('Error linking module: ' + err.message);
        });
    } else {
        alert('Save the course first before linking modules.');
    }
}

function renderAttachedModules() {
    const container = document.getElementById('modules-grid-container');
    const headerCount = document.getElementById('modules-count-header');

    if (!window.courseModules || window.courseModules.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:20px; grid-column: 1 / -1;">No module in this course track. Click on "+ Create Module".</p>';
        if (headerCount) headerCount.innerText = '0';
        return;
    }

    if (headerCount) headerCount.innerText = window.courseModules.length;

    container.innerHTML = window.courseModules.map((m, index) => {
        const bgImg = m.coverImage ? `url('${m.coverImage}')` : 'none';
        const bgColor = m.coverImage ? '#1e293b' : 'linear-gradient(135deg, #1e293b, #4c1d95)';
        const font = m.titleFont && m.titleFont !== 'inherit' ? m.titleFont : 'inherit';
        const color = m.textColor || '#ffffff';

        return `
        <div id="module-card-${m.dbId || m.id}" class="module-card-item" style="background: ${bgColor}; background-image: ${bgImg}; background-size: cover; background-position: center; border-radius:12px; padding:20px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s, outline 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); aspect-ratio: 1; position: relative; overflow: hidden;"
             onmouseover="if(this.style.outline === 'none' || !this.style.outline) { this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.2)'; }"
             onmouseout="if(this.style.outline === 'none' || !this.style.outline) { this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.02)'; }"
             onclick="openModuleEditor(${m.dbId || `'${m.id}'`})">

            <div style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); position: absolute; inset: 0; pointer-events: none;"></div>

            <div style="position: relative; z-index: 10; display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <span style="background: rgba(255,255,255,0.2); color: #fff; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold; backdrop-filter: blur(4px);">${window.t ? window.t('courseBuilder.module', 'MODULE') : 'MODULE'} ${index + 1}</span>
                <button onclick="event.stopPropagation(); removeModuleFromCourse(${m.id})" style="background:rgba(255,255,255,0.2); border:none; color:#ef4444; padding: 4px 8px; border-radius: 4px; cursor:pointer; backdrop-filter: blur(4px);" title="Remove from Track"><i class="fas fa-trash"></i></button>
            </div>

            <div style="position: relative; z-index: 10; margin-top: auto;">
                <h3 style="margin:0 0 5px 0; font-size:1.2rem; color: ${color}; font-family: ${font};">${m.title}</h3>
                <p style="margin:0; font-size:0.85rem; color: rgba(255,255,255,0.8); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${m.content || window.t ? window.t('courseBuilder.noDescription', 'No description') : 'No description'}</p>
                <div style="display:flex; gap:10px; margin-top:10px; font-size:0.8rem; color:rgba(255,255,255,0.6);">
                    <span title="Videos"><i class="fas fa-video"></i> ${m.videos ? m.videos.length : 0}</span>
                    <span title="Documents"><i class="fas fa-file-alt"></i> ${m.documents ? m.documents.length : 0}</span>
                    <span title="Quizzes"><i class="fas fa-question-circle"></i> ${m.quizzes ? m.quizzes.length : 0}</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function removeModuleFromCourse(localId) {
    const mod = window.courseModules.find(m => m.id === localId);
    if (!mod) return;

    if (window.editingCourseId && !window.editingCourseId.toString().startsWith('course_') && !localId.toString().startsWith('17')) {
        // If it's a real courseModuleId (not Date.now()), delete from DB
        apiCall(`/courses/${window.editingCourseId}/modules/${localId}`, 'DELETE')
            .then(() => {
                window.courseModules = window.courseModules.filter(m => m.id !== localId);
                renderAttachedModules();
                document.getElementById('active-module-editor').style.display = 'none';
            })
            .catch(err => alert('Error removing module from course: ' + err.message));
    } else {
        window.courseModules = window.courseModules.filter(m => m.id !== localId);
        renderAttachedModules();
        document.getElementById('active-module-editor').style.display = 'none';
    }
}

window.removeModule = removeModuleFromCourse;



// ==========================================
// EDITOR AVANÇADO DE MÓDULOS
// ==========================================

async function openModuleEditor(moduleId = null) {
    editingModuleId = moduleId;

    // Remove highlight from all cards
    document.querySelectorAll('.module-card-item').forEach(el => {
        el.style.outline = 'none';
        el.style.outlineOffset = '0';
        el.style.transform = 'translateY(0)';
    });

    // Highlight selected card
    if (moduleId) {
        const card = document.getElementById(`module-card-${moduleId}`);
        if (card) {
            card.style.outline = '3px solid #cf982e';
            card.style.outlineOffset = '4px';
        }
    }

    // Reset UI
    document.getElementById('module-basics-form').reset();
    document.getElementById('v-list').innerHTML = '<p style="text-align:center; color:#94a3b8;">Loading videos...</p>';
    document.getElementById('d-list').innerHTML = '<p style="text-align:center; color:#94a3b8;">Loading documents...</p>';

    // Preserve quiz forms before replacing q-list. The forms may have been moved
    // into a quiz-specific forms-container, which is inside q-list.
    const paneQuiz = document.getElementById('pane-quiz');
    const manualQuizForm = document.getElementById('manual-quiz-form');
    const aiQuizForm = document.getElementById('ai-quiz-form');
    if (manualQuizForm && paneQuiz) paneQuiz.appendChild(manualQuizForm);
    if (aiQuizForm && paneQuiz) paneQuiz.appendChild(aiQuizForm);

    document.getElementById('q-list').innerHTML = '<p style="text-align:center; color:#94a3b8;">Loading quiz...</p>';
    document.getElementById('btn-delete-module').style.display = 'none';

    switchModuleTab('basics');
    document.getElementById('active-module-editor').style.display = 'block';

    // Scroll immediately so the user sees the editor area without waiting for API data
    document.getElementById('active-module-editor').scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (!moduleId) {
        document.getElementById('editor-title').innerText = window.t ? window.t('courseBuilder.createNewModule', 'Create New Module') : 'Create New Module';
        try {
            const newModule = await apiCall('/modules', 'POST', {
                title: 'New Module',
                description: '',
                status: 'DRAFT'
            });
            editingModuleId = newModule.id;

            document.getElementById('m-title').value = newModule.title;
            document.getElementById('m-status').value = newModule.status;
            document.getElementById('btn-delete-module').style.display = 'block';

            if (window.editingCourseId && !window.editingCourseId.toString().startsWith('course_')) {
                try {
                    const cmRes = await apiCall(`/courses/${window.editingCourseId}/modules`, 'POST', {
                        moduleId: newModule.id,
                        requireQuizPass: false
                    });

                    if (!window.courseModules) window.courseModules = [];
                    window.courseModules.push({
                        id: cmRes.id,
                        dbId: newModule.id,
                        title: newModule.title,
                        content: newModule.description || '',
                        status: newModule.status,
                        videos: newModule.videos || [],
                        documents: newModule.documents || [],
                        quizzes: newModule.quizzes || []
                    });
                    renderAttachedModules();
                } catch (err) {
                    console.error('Failed to link new module to course', err);
                    alert('Falha ao vincular módulo ao curso: ' + err.message);
                }
            } else if (window.editingCourseId) {
                if (!window.courseModules) window.courseModules = [];
                window.courseModules.push({
                    id: `local_${Date.now()}`,
                    dbId: newModule.id,
                    title: newModule.title,
                    content: newModule.description || '',
                    status: newModule.status,
                    videos: newModule.videos || [],
                    documents: newModule.documents || [],
                    quizzes: newModule.quizzes || []
                });
                renderAttachedModules();
            }

            renderVideos([]);
            renderDocs([]);
            renderQuizzes([]);

        } catch (error) {
            alert('Error creating base module: ' + error.message);
            document.getElementById('active-module-editor').style.display = 'none';
        }
    } else {
        document.getElementById('editor-title').innerText = window.t ? window.t('courseBuilder.editModule', 'Edit Module') : 'Edit Module';
        document.getElementById('btn-delete-module').style.display = 'block';
        await loadModuleData(moduleId);
    }
}

function switchModuleTab(tabName) {
    document.querySelectorAll('.module-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.style.color = '#64748b';
        b.style.borderBottomColor = 'transparent';
    });

    document.querySelectorAll('.module-tab-pane').forEach(p => p.style.display = 'none');

    const activeBtn = document.querySelector(`.module-tab-btn[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = '#cf982e';
        activeBtn.style.borderBottomColor = '#cf982e';
    }

    const activePane = document.getElementById(`pane-${tabName}`);
    if (activePane) activePane.style.display = 'block';
}

async function loadModuleData(id) {
    try {
        const module = await apiCall(`/modules/${id}`);
        window.currentModuleData = module;

        // Basics
        document.getElementById('m-title').value = module.title || '';
        document.getElementById('m-description').value = module.description || '';
        document.getElementById('m-status').value = module.status || 'DRAFT';

        // Cover
        document.getElementById('m-coverImage').value = module.coverImage || '';
        document.getElementById('m-titleFont').value = module.titleFont || 'inherit';
        document.getElementById('m-textColor').value = module.textColor || '#ffffff';

        // Language Sessions
        moduleLanguageSessions = module.languageSessions || [];
        // Preserve current session if it still exists, otherwise reset to default
        if (currentLanguageSessionId !== null) {
            const stillExists = moduleLanguageSessions.some(s => s.id === currentLanguageSessionId);
            if (!stillExists) currentLanguageSessionId = null;
        }
        renderLanguageSessionTabs();

        // Filter content by current session (videos, quizzes, AND documents)
        const filteredVideos = filterBySession(module.videos || []);
        const filteredDocs = filterBySession(module.documents || []);
        const filteredQuizzes = filterBySession(module.quizzes || (module.quiz ? [module.quiz] : []));

        // Videos
        renderVideos(filteredVideos);

        // Docs (filtered by session like videos and quizzes)
        renderDocs(filteredDocs);

        // Quizzes
        renderQuizzes(filteredQuizzes);

        // Update the cover preview based on loaded data
        updateCoverPreview();

        // Update local memory to keep card counts in sync
        if (window.courseModules) {
            const localMod = window.courseModules.find(m => m.dbId === id);
            if (localMod) {
                localMod.videos = module.videos || [];
                localMod.documents = module.documents || [];
                localMod.quizzes = module.quizzes || (module.quiz ? [module.quiz] : []);
                if (typeof renderAttachedModules === 'function') renderAttachedModules();
            }
        }

    } catch (error) {
        alert('Error loading module: ' + error.message);
    }
}

// --- LANGUAGE SESSION MANAGEMENT ---

function filterBySession(items) {
    if (!items) return [];
    return items.filter(item => {
        if (currentLanguageSessionId === null) {
            return !item.languageSessionId;
        }
        return item.languageSessionId === currentLanguageSessionId;
    });
}

// Flag image URLs (high-quality European-priority from flagcdn)
const LOCALE_FLAG_IMG = {
    'en-US': 'https://flagcdn.com/w80/gb.png',
    'pt-BR': 'https://flagcdn.com/w80/pt.png',
    'es-ES': 'https://flagcdn.com/w80/es.png',
    'it-IT': 'https://flagcdn.com/w80/it.png',
    'fr-FR': 'https://flagcdn.com/w80/fr.png',
    'ro-RO': 'https://flagcdn.com/w80/ro.png',
    'de-DE': 'https://flagcdn.com/w80/de.png',
    'sq-AL': 'https://flagcdn.com/w80/al.png',
    'el-GR': 'https://flagcdn.com/w80/gr.png',
    'ru-RU': 'https://flagcdn.com/w80/ru.png'
};

function renderLanguageSessionTabs() {
    const editorDiv = document.getElementById('active-module-editor');
    if (!editorDiv) return;

    // 1. Render Flags Container (Top Right - Outside)
    let flagsContainer = document.getElementById('language-session-flags');
    if (!flagsContainer) {
        flagsContainer = document.createElement('div');
        flagsContainer.id = 'language-session-flags';
        // Absolute position to stick out the top right
        flagsContainer.style.cssText = 'position:absolute; top:-37px; right:20px; display:flex; gap:6px; align-items:flex-end; z-index:10;';
        editorDiv.appendChild(flagsContainer);
    }

    // Determine base locale: use the default session's locale if it exists, otherwise fallback to 'en-US'
    const defaultSession = moduleLanguageSessions.find(s => s.isDefault);
    const baseLocale = defaultSession ? defaultSession.locale : 'en-US';
    const baseFlag = LOCALE_FLAG_IMG[baseLocale] || LOCALE_FLAG_IMG['en-US'];
    const baseLabel = LOCALE_LABELS[baseLocale] || baseLocale;

    // Always show Base (default language tab)
    const isDefaultActive = currentLanguageSessionId === null;
    let flagsHtml = `
        <div onclick="switchLanguageSession(null)" 
             style="display:flex; align-items:center; justify-content:center; width:52px; height:${isDefaultActive ? '40px' : '34px'};
                    background:white; border:1px solid #e2e8f0; border-bottom:none; border-radius:8px 8px 0 0;
                    cursor:pointer; transition:all 0.15s ease; position:relative; box-shadow:0 -2px 4px rgba(0,0,0,0.02);
                    ${isDefaultActive ? 'border-top: 3px solid #cf982e; height: 38px; z-index:2;' : 'opacity:0.8;'}"
             onmouseover="if(!${isDefaultActive}) this.style.opacity='1';"
             onmouseout="if(!${isDefaultActive}) this.style.opacity='0.8';"
             title="${baseLabel} (Default)">
            <img src="${baseFlag}" alt="${baseLabel}" style="width:30px; height:auto; border-radius:2px; object-fit:cover;">
        </div>
    `;

    moduleLanguageSessions.forEach(session => {
        if (session.isDefault) return; // Skip base metadata session
        const flagImg = LOCALE_FLAG_IMG[session.locale] || LOCALE_FLAG_IMG['en-US'];
        const label = LOCALE_LABELS[session.locale] || session.locale;
        const isActive = currentLanguageSessionId === session.id;

        flagsHtml += `
            <div style="position:relative; display:inline-flex;">
                <div onclick="switchLanguageSession(${session.id})" 
                     style="display:flex; align-items:center; justify-content:center; width:52px; height:${isActive ? '40px' : '34px'};
                            background:white; border:1px solid #e2e8f0; border-bottom:none; border-radius:8px 8px 0 0;
                            cursor:pointer; transition:all 0.15s ease; box-shadow:0 -2px 4px rgba(0,0,0,0.02);
                            ${isActive ? 'border-top: 3px solid #cf982e; height: 38px; z-index:2;' : 'opacity:0.8;'}"
                     onmouseover="if(!${isActive}) this.style.opacity='1';"
                     onmouseout="if(!${isActive}) this.style.opacity='0.8';"
                     title="${label}">
                    <img src="${flagImg}" alt="${label}" style="width:30px; height:auto; border-radius:2px; object-fit:cover;">
                </div>
                <button onclick="event.stopPropagation(); deleteLanguageSession(${session.id}, '${session.locale}')" 
                        style="position:absolute; top:-6px; right:-6px; background:#ef4444; color:white; border:none; border-radius:50%; 
                               width:16px; height:16px; font-size:0.6rem; cursor:pointer; display:flex; align-items:center; 
                               justify-content:center; line-height:1; box-shadow:0 1px 3px rgba(0,0,0,0.2); z-index:3;"
                        title="Remove ${label}">&times;</button>
            </div>
        `;
    });

    flagsContainer.innerHTML = flagsHtml;

    // 2. Render Action Buttons Container (Inside editor, above content tabs)
    let actionContainer = document.getElementById('language-action-controls');
    if (!actionContainer) {
        const contentTabsRow = editorDiv.querySelector('[style*="gap:30px"]');
        if (!contentTabsRow) return;
        actionContainer = document.createElement('div');
        actionContainer.id = 'language-action-controls';
        actionContainer.style.cssText = 'display:flex; gap:12px; align-items:center; margin-bottom:20px; flex-wrap:wrap; background:#f8fafc; padding:10px 15px; border-radius:8px; border:1px solid #e2e8f0;';
        contentTabsRow.parentElement.insertBefore(actionContainer, contentTabsRow);
    }

    // Determine current language details
    const currentLocale = currentLanguageSessionId === null
        ? (moduleLanguageSessions.find(s => s.isDefault)?.locale || 'en-US')
        : (moduleLanguageSessions.find(s => s.id === currentLanguageSessionId)?.locale || 'en-US');
    const currentLabel = LOCALE_LABELS[currentLocale] || currentLocale;
    const currentFlag = LOCALE_FLAG_IMG[currentLocale] || LOCALE_FLAG_IMG['en-US'];

    let actionHtml = `
        <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:#64748b; font-size:0.85rem; font-weight:bold;">Current Session:</span>
            <button onclick="showSwapLanguageModal()" style="display:flex; align-items:center; gap:6px; background:white; border:1px solid #cbd5e1; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold; color:#1e293b; box-shadow:0 1px 2px rgba(0,0,0,0.05);" title="Change this session's language">
                <img src="${currentFlag}" style="width:18px; border-radius:2px;"> ${currentLabel} <i class="fas fa-exchange-alt" style="margin-left:4px; color:#94a3b8; font-size:0.75rem;"></i>
            </button>
        </div>
        <div style="flex:1;"></div>
        <div style="display:inline-flex; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            <button onclick="showAddLanguageModal()"
                    style="background:white; border:none; padding:8px 14px; cursor:pointer; color:#475569; font-weight:bold; font-size:0.85rem; border-right:1px solid #cbd5e1; display:flex; align-items:center; gap:6px;"
                    title="Add a new empty language session">
                <i class="fas fa-plus" style="color:#cf982e;"></i> Add extra language
            </button>
            <button id="btn-lang-options" onclick="showSessionOptionsDropdown(event)"
                    style="background:white; border:none; padding:8px 12px; cursor:pointer; color:#475569; font-size:0.75rem;"
                    title="Content Actions">
                <i class="fas fa-chevron-down"></i>
            </button>
        </div>
    `;

    actionContainer.innerHTML = actionHtml;

    // Clean up old header button if exists
    const oldHeaderBtn = document.getElementById('lang-add-btn-wrapper');
    if (oldHeaderBtn) oldHeaderBtn.remove();
}

function switchLanguageSession(sessionId) {
    currentLanguageSessionId = sessionId;
    renderLanguageSessionTabs();

    if (window.currentModuleData) {
        const module = window.currentModuleData;
        renderVideos(filterBySession(module.videos || []));
        renderDocs(filterBySession(module.documents || []));
        renderQuizzes(filterBySession(module.quizzes || []));
    }
}

// --- ADD EXTRA LANGUAGE (MODAL) ---
function showAddLanguageModal() {
    const existingLocales = moduleLanguageSessions.map(s => s.locale);
    const availableLocales = Object.keys(LOCALE_LABELS).filter(l => !existingLocales.includes(l));

    if (availableLocales.length === 0) {
        alert('All supported languages have been added already.');
        return;
    }

    const backdrop = document.createElement('div');
    backdrop.id = 'lang-modal-backdrop';
    backdrop.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index:9999;';

    const modal = document.createElement('div');
    modal.id = 'lang-picker-modal';
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10000; background:white; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,0.2); padding:20px; min-width:300px; max-height:80vh; overflow-y:auto;';

    let html = `<div style="font-weight:bold; color:#1e293b; margin-bottom:15px; font-size:1.1rem;">Add Extra Language</div>`;
    html += `<div style="margin-bottom:15px; color:#64748b; font-size:0.85rem;">Select a new language to create an empty session:</div>`;

    availableLocales.forEach(locale => {
        const flagImg = LOCALE_FLAG_IMG[locale] || '';
        const label = LOCALE_LABELS[locale];
        html += `<button onclick="addLanguageSession('${locale}')" 
                    style="display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:10px 12px; border:1px solid #e2e8f0; background:white; cursor:pointer; border-radius:8px; font-size:0.95rem; color:#334155; margin-bottom:8px; transition:all 0.1s;" 
                    onmouseover="this.style.borderColor='#cbd5e1'; this.style.boxShadow='0 2px 5px rgba(0,0,0,0.05)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                    <img src="${flagImg}" style="width:28px; height:auto; border-radius:3px;"> ${label}
                </button>`;
    });

    html += `<button onclick="closeLangModal()" style="width:100%; margin-top:10px; padding:10px; background:#f1f5f9; border:none; border-radius:8px; cursor:pointer; color:#64748b; font-weight:bold;">Cancel</button>`;

    modal.innerHTML = html;
    backdrop.onclick = () => closeLangModal();
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// --- SESSION OPTIONS DROPDOWN (DUPLICATE / COPY) ---
function showSessionOptionsDropdown(event) {
    event.stopPropagation();
    const existing = document.getElementById('session-options-dropdown');
    if (existing) { existing.remove(); return; }

    const dropdown = document.createElement('div');
    dropdown.id = 'session-options-dropdown';
    dropdown.style.cssText = 'position:fixed; z-index:9999; background:white; border:1px solid #e2e8f0; border-radius:8px; box-shadow:0 8px 25px rgba(0,0,0,0.15); padding:6px; min-width:260px;';

    let html = `
        <button onclick="showDuplicateToModal()" style="display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:10px; border:none; background:none; cursor:pointer; border-radius:6px; font-size:0.85rem; color:#334155;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'">
            <i class="fas fa-copy" style="color:#cf982e; width:20px; text-align:center;"></i> Duplicate content to...
        </button>
        <button onclick="showCopyFromModal()" style="display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:10px; border:none; background:none; cursor:pointer; border-radius:6px; font-size:0.85rem; color:#334155;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'">
            <i class="fas fa-download" style="color:#497aa7; width:20px; text-align:center;"></i> Copy content from...
        </button>
    `;

    dropdown.innerHTML = html;
    document.body.appendChild(dropdown);

    const btn = document.getElementById('btn-lang-options');
    const rect = btn.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + 5) + 'px';
    dropdown.style.left = Math.min(rect.right - 260, window.innerWidth - 270) + 'px';

    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            const dd = document.getElementById('session-options-dropdown');
            if (dd && !dd.contains(e.target)) {
                dd.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 50);
}

// --- SWAP LANGUAGE MODAL ---
function showSwapLanguageModal() {
    // English is null. If we are in English, we are changing the base content language?
    // The base content doesn't have a languageSessionId. If we "swap" it, we actually move base content into a session and vice versa.
    // To keep it simple, if current is null, alert that Base is implicitly English for now.
    // Or we allow swapping. Let's allow swapping via API.

    const availableLocales = Object.keys(LOCALE_LABELS);

    const backdrop = document.createElement('div');
    backdrop.id = 'lang-modal-backdrop';
    backdrop.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index:9999;';

    const modal = document.createElement('div');
    modal.id = 'lang-picker-modal';
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10000; background:white; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,0.2); padding:20px; min-width:300px; max-height:80vh; overflow-y:auto;';

    const currentLocale = currentLanguageSessionId === null
        ? (moduleLanguageSessions.find(s => s.isDefault)?.locale || 'en-US')
        : moduleLanguageSessions.find(s => s.id === currentLanguageSessionId).locale;

    let html = `<div style="font-weight:bold; color:#1e293b; margin-bottom:10px; font-size:1.1rem;">Change Session Language</div>`;
    html += `<div style="margin-bottom:15px; color:#64748b; font-size:0.85rem;">Select the new language for this session. If it already exists, they will be swapped.</div>`;

    availableLocales.forEach(locale => {
        if (locale === currentLocale) return;
        const flagImg = LOCALE_FLAG_IMG[locale] || '';
        const label = LOCALE_LABELS[locale];
        html += `<button onclick="executeSwap('${locale}')" 
                    style="display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:10px 12px; border:1px solid #e2e8f0; background:white; cursor:pointer; border-radius:8px; font-size:0.95rem; color:#334155; margin-bottom:8px; transition:all 0.1s;" 
                    onmouseover="this.style.borderColor='#cbd5e1'; this.style.boxShadow='0 2px 5px rgba(0,0,0,0.05)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                    <img src="${flagImg}" style="width:28px; height:auto; border-radius:3px;"> ${label}
                </button>`;
    });

    html += `<button onclick="closeLangModal()" style="width:100%; margin-top:10px; padding:10px; background:#f1f5f9; border:none; border-radius:8px; cursor:pointer; color:#64748b; font-weight:bold;">Cancel</button>`;

    modal.innerHTML = html;
    backdrop.onclick = () => closeLangModal();
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// --- DUPLICATE TO MODAL (Shows ALL system languages) ---
function showDuplicateToModal() {
    const dd = document.getElementById('session-options-dropdown');
    if (dd) dd.remove();

    const existingLocales = moduleLanguageSessions.map(s => s.locale);
    const availableLocales = Object.keys(LOCALE_LABELS).filter(l => !existingLocales.includes(l));

    if (availableLocales.length === 0) {
        alert('All supported languages have been added already.');
        return;
    }

    const backdrop = document.createElement('div');
    backdrop.id = 'lang-modal-backdrop';
    backdrop.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index:9999;';

    const modal = document.createElement('div');
    modal.id = 'lang-picker-modal';
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10000; background:white; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,0.2); padding:20px; min-width:300px; max-height:80vh; overflow-y:auto;';

    let html = `<div style="font-weight:bold; color:#1e293b; margin-bottom:10px; font-size:1.1rem;">Duplicate to...</div>`;
    html += `<div style="margin-bottom:15px; color:#64748b; font-size:0.85rem;">Select language to create and copy current content to:</div>`;

    availableLocales.forEach(locale => {
        const flagImg = LOCALE_FLAG_IMG[locale] || '';
        const label = LOCALE_LABELS[locale];
        html += `<button onclick="executeDuplicate(${currentLanguageSessionId === null ? "'base'" : currentLanguageSessionId}, '${locale}')" 
                    style="display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:10px 12px; border:1px solid #e2e8f0; background:white; cursor:pointer; border-radius:8px; font-size:0.95rem; color:#334155; margin-bottom:8px; transition:all 0.1s;" 
                    onmouseover="this.style.borderColor='#cbd5e1'; this.style.boxShadow='0 2px 5px rgba(0,0,0,0.05)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                    <img src="${flagImg}" style="width:28px; height:auto; border-radius:3px;"> ${label}
                </button>`;
    });

    html += `<button onclick="closeLangModal()" style="width:100%; margin-top:10px; padding:10px; background:#f1f5f9; border:none; border-radius:8px; cursor:pointer; color:#64748b; font-weight:bold;">Cancel</button>`;

    modal.innerHTML = html;
    backdrop.onclick = () => closeLangModal();
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// --- COPY FROM MODAL (Shows ONLY existing languages in this module) ---
function showCopyFromModal() {
    const dd = document.getElementById('session-options-dropdown');
    if (dd) dd.remove();

    // Source can be Base (null) or any existing session, EXCEPT the current one
    const sources = [];
    if (currentLanguageSessionId !== null) {
        const defaultSess = moduleLanguageSessions.find(s => s.isDefault);
        sources.push({ id: null, locale: defaultSess ? defaultSess.locale : 'en-US' });
    }
    moduleLanguageSessions.forEach(s => {
        if (s.id !== currentLanguageSessionId) {
            sources.push({ id: s.id, locale: s.locale });
        }
    });

    if (sources.length === 0) {
        alert('There are no other languages in this module to copy from.');
        return;
    }

    const backdrop = document.createElement('div');
    backdrop.id = 'lang-modal-backdrop';
    backdrop.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index:9999;';

    const modal = document.createElement('div');
    modal.id = 'lang-picker-modal';
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10000; background:white; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,0.2); padding:20px; min-width:300px; max-height:80vh; overflow-y:auto;';

    let html = `<div style="font-weight:bold; color:#1e293b; margin-bottom:10px; font-size:1.1rem;">Copy content from...</div>`;
    html += `<div style="margin-bottom:15px; color:#64748b; font-size:0.85rem;">Select an existing language to copy content into this session:</div>`;

    sources.forEach(src => {
        const flagImg = LOCALE_FLAG_IMG[src.locale] || '';
        const label = LOCALE_LABELS[src.locale];
        html += `<button onclick="executeCopyFrom(${src.id === null ? "'base'" : src.id})" 
                    style="display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:10px 12px; border:1px solid #e2e8f0; background:white; cursor:pointer; border-radius:8px; font-size:0.95rem; color:#334155; margin-bottom:8px; transition:all 0.1s;" 
                    onmouseover="this.style.borderColor='#cbd5e1'; this.style.boxShadow='0 2px 5px rgba(0,0,0,0.05)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                    <img src="${flagImg}" style="width:28px; height:auto; border-radius:3px;"> ${label}
                </button>`;
    });

    html += `<button onclick="closeLangModal()" style="width:100%; margin-top:10px; padding:10px; background:#f1f5f9; border:none; border-radius:8px; cursor:pointer; color:#64748b; font-weight:bold;">Cancel</button>`;

    modal.innerHTML = html;
    backdrop.onclick = () => closeLangModal();
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

function closeLangModal() {
    const m = document.getElementById('lang-picker-modal');
    const b = document.getElementById('lang-modal-backdrop');
    if (m) m.remove();
    if (b) b.remove();
}

// --- API ACTIONS ---

async function executeSwap(targetLocale) {
    if (!editingModuleId) return;
    closeLangModal();

    try {
        if (currentLanguageSessionId === null) {
            // Swapping the base session — use dedicated endpoint
            await apiCall(`/modules/${editingModuleId}/language-sessions/base/swap-locale`, 'PATCH', { targetLocale });
        } else {
            await apiCall(`/modules/${editingModuleId}/language-sessions/${currentLanguageSessionId}/swap-locale`, 'PATCH', { targetLocale });
        }
        await loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error swapping language: ' + error.message);
    }
}

async function addLanguageSession(locale) {
    if (!editingModuleId) return;
    closeLangModal();

    try {
        const session = await apiCall(`/modules/${editingModuleId}/language-sessions`, 'POST', { locale });
        const savedSessionId = session.id;
        await loadModuleData(editingModuleId);
        currentLanguageSessionId = savedSessionId;
        renderLanguageSessionTabs();
        switchLanguageSession(savedSessionId);
    } catch (error) {
        alert('Error creating language session: ' + error.message);
    }
}

async function executeDuplicate(sourceSessionId, targetLocale) {
    if (!editingModuleId) return;
    closeLangModal();

    try {
        // sourceSessionId can be 'base' (for base English) or a numeric session ID
        const sourceParam = sourceSessionId === 'base' ? 'base' : sourceSessionId;
        const result = await apiCall(`/modules/${editingModuleId}/language-sessions/${sourceParam}/duplicate-to`, 'POST', { targetLocale });

        await loadModuleData(editingModuleId);
        if (result && result.id) {
            currentLanguageSessionId = result.id;
            renderLanguageSessionTabs();
            switchLanguageSession(result.id);
        }
    } catch (error) {
        alert('Error duplicating content: ' + error.message);
    }
}

async function executeCopyFrom(sourceSessionId) {
    if (!editingModuleId || currentLanguageSessionId === null) {
        if (currentLanguageSessionId === null) alert("Cannot copy INTO the base English session.");
        return;
    }
    closeLangModal();

    // Check if current session has existing content (videos or quizzes)
    const module = window.currentModuleData;
    const currentVideos = filterBySession(module?.videos || []);
    const currentQuizzes = filterBySession(module?.quizzes || []);
    const hasExistingContent = currentVideos.length > 0 || currentQuizzes.length > 0;

    const sourceParam = sourceSessionId === 'base' ? 'base' : sourceSessionId;

    if (hasExistingContent) {
        // Show Replace/Merge choice modal
        showCopyModeModal(sourceParam, currentVideos.length, currentQuizzes.length);
    } else {
        // Session is empty — just copy directly (merge mode, since there's nothing to replace)
        try {
            await apiCall(`/modules/${editingModuleId}/language-sessions/${currentLanguageSessionId}/copy-from/${sourceParam}`, 'POST', { mode: 'merge' });
            await loadModuleData(editingModuleId);
        } catch (error) {
            alert('Error copying content: ' + error.message);
        }
    }
}

function showCopyModeModal(sourceParam, videoCount, quizCount) {
    const backdrop = document.createElement('div');
    backdrop.id = 'lang-modal-backdrop';
    backdrop.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index:9999;';

    const modal = document.createElement('div');
    modal.id = 'lang-picker-modal';
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10000; background:white; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,0.2); padding:24px; min-width:380px; max-width:440px;';

    modal.innerHTML = `
        <div style="font-weight:bold; color:#1e293b; margin-bottom:8px; font-size:1.1rem;"><i class="fas fa-exclamation-triangle" style="color:#f59e0b; margin-right:8px;"></i>Content Already Exists</div>
        <div style="margin-bottom:18px; color:#64748b; font-size:0.9rem; line-height:1.5;">
            This session already has <strong>${videoCount} video(s)</strong> and <strong>${quizCount} quiz(zes)</strong>. How would you like to proceed?
        </div>
        <button onclick="executeCopyWithMode('${sourceParam}', 'replace')" 
                style="display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:14px 16px; border:1px solid #fecaca; background:#fff5f5; cursor:pointer; border-radius:10px; font-size:0.95rem; color:#991b1b; margin-bottom:10px; transition:all 0.15s;"
                onmouseover="this.style.borderColor='#ef4444'; this.style.boxShadow='0 2px 8px rgba(239,68,68,0.15)';" 
                onmouseout="this.style.borderColor='#fecaca'; this.style.boxShadow='none';">
            <i class="fas fa-sync-alt" style="font-size:1.2rem; color:#ef4444;"></i>
            <div>
                <strong style="display:block; margin-bottom:2px;">Replace</strong>
                <span style="font-size:0.8rem; color:#64748b;">Remove existing content and replace with copied content</span>
            </div>
        </button>
        <button onclick="executeCopyWithMode('${sourceParam}', 'merge')" 
                style="display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:14px 16px; border:1px solid #bbf7d0; background:#f0fdf4; cursor:pointer; border-radius:10px; font-size:0.95rem; color:#166534; margin-bottom:10px; transition:all 0.15s;"
                onmouseover="this.style.borderColor='#22c55e'; this.style.boxShadow='0 2px 8px rgba(34,197,94,0.15)';" 
                onmouseout="this.style.borderColor='#bbf7d0'; this.style.boxShadow='none';">
            <i class="fas fa-layer-group" style="font-size:1.2rem; color:#22c55e;"></i>
            <div>
                <strong style="display:block; margin-bottom:2px;">Merge</strong>
                <span style="font-size:0.8rem; color:#64748b;">Add copied content alongside existing content</span>
            </div>
        </button>
        <button onclick="closeLangModal()" style="width:100%; margin-top:6px; padding:10px; background:#f1f5f9; border:none; border-radius:8px; cursor:pointer; color:#64748b; font-weight:bold;">Cancel</button>
    `;

    backdrop.onclick = () => closeLangModal();
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

async function executeCopyWithMode(sourceParam, mode) {
    closeLangModal();
    try {
        await apiCall(`/modules/${editingModuleId}/language-sessions/${currentLanguageSessionId}/copy-from/${sourceParam}`, 'POST', { mode });
        await loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error copying content: ' + error.message);
    }
}

async function deleteLanguageSession(sessionId, locale) {
    const label = LOCALE_LABELS[locale] || locale;
    if (!confirm(`Remove the ${label} language session? All content specific to this language will be removed.`)) return;

    try {
        await apiCall(`/modules/${editingModuleId}/language-sessions/${sessionId}`, 'DELETE');
        if (currentLanguageSessionId === sessionId) {
            currentLanguageSessionId = null;
        }
        await loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error deleting language session: ' + error.message);
    }
}

async function saveModuleBasics() {
    if (!editingModuleId) return;
    try {
        const title = document.getElementById('m-title').value;
        const description = document.getElementById('m-description').value;
        const status = document.getElementById('m-status').value;

        await apiCall(`/modules/${editingModuleId}`, 'PUT', { title, description, status });

        // Atualiza o local window.courseModules se este módulo estiver atrelado
        const localMod = window.courseModules.find(m => m.dbId === editingModuleId);
        if (localMod) {
            localMod.title = title;
            localMod.content = description;
            localMod.status = status;
            if (typeof saveDraft === 'function') saveDraft(true);
        }

        if (typeof renderAttachedModules === 'function') renderAttachedModules();

        alert('General changes saved successfully!');
        fetchModulesFromDB(); // update list in background
    } catch (error) {
        alert('Error saving: ' + error.message);
    }
}

async function saveModuleCover(silent = false) {
    if (!editingModuleId) return;
    try {
        const coverImage = document.getElementById('m-coverImage').value;
        const titleFont = document.getElementById('m-titleFont').value;
        const textColor = document.getElementById('m-textColor').value;

        await apiCall(`/modules/${editingModuleId}`, 'PUT', { coverImage, titleFont, textColor });

        // Update local memory
        const localMod = window.courseModules.find(m => m.dbId === editingModuleId);
        if (localMod) {
            localMod.coverImage = coverImage;
            localMod.titleFont = titleFont;
            localMod.textColor = textColor;
        }

        renderAttachedModules();

        if (!silent) alert('Cover layout saved successfully!');
        fetchModulesFromDB();
    } catch (error) {
        if (!silent) alert('Error saving cover layout: ' + error.message);
    }
}

async function removeCoverImage() {
    document.getElementById('m-coverImage').value = '';
    updateCoverPreview();
    await saveModuleCover(true);
}

async function deleteModuleFromDB() {
    if (!editingModuleId) return;
    if (!confirm('Are you sure you want to permanently delete this module from the database? It will disappear from all courses.')) return;

    try {
        await apiCall(`/modules/${editingModuleId}`, 'DELETE');

        // Remove do curso local se estiver atrelado
        window.courseModules = window.courseModules.filter(m => m.dbId !== editingModuleId);
        if (typeof saveDraft === 'function') saveDraft(true);

        alert('Module deleted!');
        closeModuleEditor();
    } catch (error) {
        alert('Error deleting: ' + error.message);
    }
}

// --- VIDEOS ---
function showAddVideoForm() {
    const form = document.getElementById('add-video-form');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function hideAddVideoForm() {
    document.getElementById('add-video-form').style.display = 'none';
    window.editingVideoId = null;
    document.getElementById('v-title-input').value = '';
    document.getElementById('v-desc-input').value = '';
    document.getElementById('v-url-input').value = '';
    document.getElementById('v-url-input').disabled = false;
    document.getElementById('btn-upload-video').style.display = 'block';

    // Change button text back to Save
    const submitBtn = document.querySelector('#add-video-form button[onclick="submitAddVideo()"]');
    if (submitBtn) submitBtn.innerText = 'Save Video';

    const h4 = document.querySelector('#add-video-form h4');
    if (h4) h4.innerText = 'New Video';
}

function openEditVideoForm(videoId) {
    const video = window.currentModuleData.videos.find(v => v.id === videoId);
    if (!video) return;

    window.editingVideoId = videoId;
    document.getElementById('v-title-input').value = video.title;
    document.getElementById('v-desc-input').value = video.description || '';
    document.getElementById('v-url-input').value = video.url;

    // Disable URL changing if it's an uploaded internal file (as requested by user)
    if (video.url.startsWith('/api/documents/') || video.url.startsWith('/uploads/')) {
        document.getElementById('v-url-input').disabled = true;
        document.getElementById('btn-upload-video').style.display = 'none';
    } else {
        document.getElementById('v-url-input').disabled = false;
        document.getElementById('btn-upload-video').style.display = 'block';
    }

    // Change button text
    const submitBtn = document.querySelector('#add-video-form button[onclick="submitAddVideo()"]');
    if (submitBtn) submitBtn.innerText = 'Save Changes';

    const h4 = document.querySelector('#add-video-form h4');
    if (h4) h4.innerText = 'Edit Video';

    const form = document.getElementById('add-video-form');
    form.style.display = 'block';
    setTimeout(() => {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

async function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const formData = new FormData();
        formData.append('document', file);

        const btn = document.getElementById('btn-upload-video');
        let oldText = '<i class="fas fa-upload"></i> Choose Video from Computer';
        const sizeMb = file.size ? (file.size / 1024 / 1024).toFixed(1) : null;

        if (btn) {
            oldText = btn.innerHTML;
            const loadingMsg = sizeMb ? `Uploading ${sizeMb} MB...` : 'Uploading...';
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingMsg}`;
            btn.disabled = true;
        }

        const docRes = await apiCall('/api/documents/upload', 'POST', formData, true);

        // Auto-fill inputs
        document.getElementById('v-url-input').value = `/api/documents/download/${docRes.id}`;
        if (!document.getElementById('v-title-input').value) {
            document.getElementById('v-title-input').value = file.name;
        }

        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> Video Uploaded!';
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            setTimeout(() => {
                btn.innerHTML = oldText;
                btn.style.borderColor = '#497aa7';
                btn.style.color = '#497aa7';
                btn.disabled = false;
            }, 3000);
        }
    } catch (error) {
        alert('Error uploading video: ' + error.message);
        const btn = document.getElementById('btn-upload-video');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-upload"></i> Choose Video from Computer';
            btn.disabled = false;
        }
    }
}

async function submitAddVideo() {
    if (!editingModuleId) return;
    const title = document.getElementById('v-title-input').value;
    const url = document.getElementById('v-url-input').value;

    if (!title || !url) return alert('Title and URL are required.');

    try {
        if (window.editingVideoId) {
            await apiCall(`/modules/${editingModuleId}/videos/${window.editingVideoId}`, 'PUT', { title, url });
        } else {
            const body = { title, url };
            if (currentLanguageSessionId) body.languageSessionId = currentLanguageSessionId;
            await apiCall(`/modules/${editingModuleId}/videos`, 'POST', body);
        }

        hideAddVideoForm();
        if (document.getElementById('v-upload-input')) {
            document.getElementById('v-upload-input').value = '';
        }
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error saving video: ' + error.message);
    }
}

async function deleteVideo(videoId) {
    if (!confirm('Delete video?')) return;
    try {
        await apiCall(`/modules/${editingModuleId}/videos/${videoId}`, 'DELETE');
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error deleting video: ' + error.message);
    }
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getYouTubeVideoId(url) {
    const match = String(url || '').match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match && match[1] ? match[1] : null;
}

function getThumbnailUrl(url) {
    const youtubeId = getYouTubeVideoId(url);
    if (youtubeId) {
        return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }
    return null;
}

function appendQueryParam(url, key, value) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

function getVideoHost(url) {
    try {
        return new URL(url, window.location.origin).hostname.toLowerCase();
    } catch (error) {
        return '';
    }
}

function buildOneDriveEmbedUrl(url) {
    try {
        const parsed = new URL(url, window.location.origin);
        const host = parsed.hostname.toLowerCase();

        if (host.includes('onedrive.live.com')) {
            if (parsed.pathname.includes('/embed')) {
                return url;
            }

            const remoteId = parsed.searchParams.get('resid') || parsed.searchParams.get('id');
            if (remoteId) {
                const embedUrl = new URL('https://onedrive.live.com/embed');
                embedUrl.searchParams.set('resid', remoteId);

                ['authkey', 'cid', 'em', 'ithint'].forEach((param) => {
                    const value = parsed.searchParams.get(param);
                    if (value) embedUrl.searchParams.set(param, value);
                });

                embedUrl.searchParams.set('wdVideoPlayback', '1');
                return embedUrl.toString();
            }
        }

        // Short 1drv.ms links cannot be resolved client-side without hitting the redirect,
        // but they can still be opened inside the modal as a Microsoft viewer iframe.
        if (host.includes('1drv.ms')) {
            return appendQueryParam(url, 'wdVideoPlayback', '1');
        }

        if (host.includes('sharepoint.com')) {
            const withWebView = appendQueryParam(url, 'web', '1');
            return appendQueryParam(withWebView, 'wdVideoPlayback', '1');
        }
    } catch (error) {
        // Fall back to the original link below.
    }

    return appendQueryParam(url, 'action', 'embedview');
}

function isSharePointEmbedUrl(url) {
    try {
        const parsed = new URL(url, window.location.origin);
        const path = parsed.pathname.toLowerCase();
        return parsed.hostname.toLowerCase().includes('sharepoint.com') && (
            path.includes('/_layouts/15/embed.aspx') ||
            path.includes('/_layouts/15/doc.aspx') ||
            parsed.searchParams.has('embed')
        );
    } catch (error) {
        return false;
    }
}

function buildVideoPlayerSource(url) {
    const rawUrl = String(url || '').trim();
    const host = getVideoHost(rawUrl);
    const youtubeId = getYouTubeVideoId(rawUrl);

    if (youtubeId) {
        return {
            type: 'iframe',
            src: `https://www.youtube.com/embed/${youtubeId}?autoplay=1`,
            provider: 'YouTube',
            fallbackUrl: rawUrl
        };
    }

    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
        return {
            type: 'iframe',
            src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
            provider: 'Vimeo',
            fallbackUrl: rawUrl
        };
    }

    const isOneDrive = host.includes('onedrive.live.com') || host.includes('1drv.ms');
    if (isOneDrive) {
        return {
            type: 'iframe',
            src: buildOneDriveEmbedUrl(rawUrl),
            provider: 'OneDrive',
            fallbackUrl: rawUrl
        };
    }

    if (host.includes('sharepoint.com')) {
        if (isSharePointEmbedUrl(rawUrl)) {
            return {
                type: 'iframe',
                src: buildOneDriveEmbedUrl(rawUrl),
                provider: 'SharePoint',
                fallbackUrl: rawUrl
            };
        }

        return {
            type: 'external',
            src: rawUrl,
            provider: 'SharePoint',
            fallbackUrl: rawUrl,
            message: 'SharePoint refused embedded playback for this sharing link. Open it in SharePoint, or paste the SharePoint embed URL if you want it to play inside the platform.'
        };
    }

    const isDirectVideo = rawUrl.includes('/api/documents/download/') || /\.(mp4|webm|ogg|mov)(?:$|[?#])/i.test(rawUrl);
    if (isDirectVideo) {
        const src = rawUrl.includes('/api/documents/download/')
            ? appendQueryParam(rawUrl, 'inline', 'true')
            : rawUrl;
        return {
            type: 'video',
            src,
            provider: 'Video file',
            fallbackUrl: rawUrl
        };
    }

    return {
        type: 'iframe',
        src: rawUrl,
        provider: 'External video',
        fallbackUrl: rawUrl
    };
}

function renderVideos(videos) {
    const list = document.getElementById('v-list');
    if (!videos || videos.length === 0) {
        list.innerHTML = '<p style="color: #64748b; text-align: center;">No video added.</p>';
        return;
    }

    // Configura o grid
    list.style.display = 'grid';
    list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    list.style.gap = '15px';

    list.innerHTML = videos.map(v => {
        const player = buildVideoPlayerSource(v.url);
        const thumb = getThumbnailUrl(v.url);
        const encodedUrl = encodeURIComponent(v.url || '');
        const encodedTitle = encodeURIComponent(v.title || '');
        const playIconOverlay = `<button type="button" onclick="playVideo(decodeURIComponent('${encodedUrl}'), decodeURIComponent('${encodedTitle}'))" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:50px; height:50px; background:rgba(0,0,0,0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid white; transition:background 0.2s;" onmouseover="this.style.background='rgba(207, 152, 46, 0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.6)'" aria-label="Play ${escapeHtml(v.title || 'video')}"><i class="fas fa-play" style="color:white; font-size:1.2rem; margin-left:4px;"></i></button>`;

        let thumbHtml;
        if (thumb) {
            thumbHtml = `<div style="height:140px; background:url('${thumb}') center/cover; position:relative;">${playIconOverlay}`;
        } else if (player.provider === 'OneDrive' || player.provider === 'SharePoint') {
            thumbHtml = `<div style="height:140px; background:linear-gradient(135deg, #1e3a8a, #0f172a); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; color:white;">
                <div style="text-align:center; opacity:0.88;">
                    <i class="fas fa-cloud" style="font-size:2rem; display:block; margin-bottom:8px;"></i>
                    <span style="font-size:0.85rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase;">${player.provider} video</span>
                </div>
                ${playIconOverlay}`;
        } else {
            const previewSrc = player.type === 'video' ? `${escapeHtml(player.src)}#t=0.1` : escapeHtml(v.url || '');
            thumbHtml = `<div style="height:140px; background:#1e293b; position:relative; overflow:hidden;">
                   ${player.type === 'video' ? `<video src="${previewSrc}" preload="metadata" style="width:100%; height:100%; object-fit:cover; display:block;" muted playsinline></video>` : ''}
                   ${playIconOverlay}`;
        }

        return `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; display:flex; flex-direction:column; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            ${thumbHtml}
                <div style="position:absolute; top:10px; right:10px; display:flex; gap:5px; z-index:10;">
                    <button onclick="openEditVideoForm(${Number(v.id)})" style="background:white; border:none; color:#cf982e; border-radius:50%; width:30px; height:30px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.2);" title="Edit Video"><i class="fas fa-pencil-alt"></i></button>
                    <button onclick="deleteVideo(${Number(v.id)})" style="background:white; border:none; color:#ef4444; border-radius:50%; width:30px; height:30px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.2);" title="Remove Video"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div style="padding:15px; flex:1; display:flex; flex-direction:column;">
                <strong style="color:#1e293b; display:block; margin-bottom:5px; font-size:1rem; line-height:1.3;">${escapeHtml(v.title)}</strong>
                <span style="font-size:0.85rem; color:#64748b; display:block; margin-bottom:10px; flex:1; line-height:1.4;">${escapeHtml(v.description || '')}</span>
                <span style="font-size:0.75rem; color:#64748b; background:#e2e8f0; align-self:flex-start; padding:3px 8px; border-radius:999px;">${escapeHtml(player.provider)}</span>
            </div>
        </div>
        `;
    }).join('');
}

function playVideo(url, title) {
    const modal = document.getElementById('video-player-modal');
    const container = document.getElementById('video-player-container');
    const titleEl = document.getElementById('video-player-title');

    if (!modal || !container) return;

    titleEl.innerText = title || 'Watch Video';
    const player = buildVideoPlayerSource(url);
    const safeSrc = escapeHtml(player.src);
    const safeFallback = escapeHtml(player.fallbackUrl || url);

    if (player.type === 'external') {
        window.open(player.fallbackUrl || player.src || url, '_blank', 'noopener,noreferrer');
        return;
    }

    if (player.type === 'video') {
        container.innerHTML = `<video src="${safeSrc}" style="position:absolute; top:0; left:0; width:100%; height:100%; outline:none; background:black;" controls autoplay playsinline></video>`;
    } else {
        container.innerHTML = `
            <iframe src="${safeSrc}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>
            <a href="${safeFallback}" target="_blank" rel="noopener noreferrer" style="position:absolute; right:12px; bottom:12px; background:rgba(15,23,42,0.82); color:white; text-decoration:none; padding:8px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; border:1px solid rgba(255,255,255,0.25);">Open original if blocked</a>
        `;
    }
    modal.style.display = 'flex';
}

function closeVideoPlayer() {
    const modal = document.getElementById('video-player-modal');
    const container = document.getElementById('video-player-container');
    if (container) container.innerHTML = '';
    if (modal) modal.style.display = 'none';
}

// --- DOCS ---
async function handleDocUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingModuleId) return;

    const btn = document.getElementById('btn-add-doc');
    let oldText = '<i class="fas fa-file-alt"></i> + Doc';
    if (btn) {
        oldText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading ${files.length} file(s)...`;
        btn.disabled = true;
    }

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // 1. Fazer upload do documento para a API de Documentos
            const formData = new FormData();
            formData.append('document', file);

            const docRes = await apiCall('/api/documents/upload', 'POST', formData, true);
            const docId = docRes.id;

            // 2. Vincular o Documento ao Módulo (with language session if active)
            const docLinkBody = { documentId: docId, title: file.name };
            if (currentLanguageSessionId) docLinkBody.languageSessionId = currentLanguageSessionId;
            await apiCall(`/modules/${editingModuleId}/documents`, 'POST', docLinkBody);
        }

        if (btn) {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }

        // Clear the input so the same files can be selected again if needed
        e.target.value = '';

        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error uploading: ' + error.message);
        if (btn) {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    }
}

async function handleCoverUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const formData = new FormData();
        formData.append('document', file);

        const btn = document.getElementById('btn-upload-cover');
        let oldText = '<i class="fas fa-upload"></i> Upload';
        if (btn) {
            oldText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            btn.disabled = true;
        }

        const docRes = await apiCall('/api/documents/upload', 'POST', formData, true);

        if (docRes && docRes.downloadUrl) {
            document.getElementById('m-coverImage').value = docRes.downloadUrl;
            updateCoverPreview();

            // Auto-save the cover silently
            await saveModuleCover(true);
        }

        if (btn) {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    } catch (error) {
        alert('Error uploading cover: ' + error.message);
        const btn = document.getElementById('btn-upload-cover');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-upload"></i> Upload';
            btn.disabled = false;
        }
    }
}

function updateCoverPreview() {
    const bgUrl = document.getElementById('m-coverImage').value;
    const font = document.getElementById('m-titleFont').value;
    const color = document.getElementById('m-textColor').value;
    const moduleTitle = document.getElementById('m-title').value || 'Preview Title';

    const previewBox = document.getElementById('cover-preview-box');
    const previewTitle = document.getElementById('cover-preview-title');

    if (previewBox) {
        previewBox.style.backgroundImage = bgUrl ? `url('${bgUrl}')` : 'none';
    }

    if (previewTitle) {
        previewTitle.textContent = moduleTitle;
        previewTitle.style.fontFamily = font !== 'inherit' ? font : 'inherit';
        previewTitle.style.color = color;
    }
}

async function deleteDoc(docId) {
    if (!confirm('Remove this document from the module?')) return;
    try {
        await apiCall(`/modules/${editingModuleId}/documents/${docId}`, 'DELETE');
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error deleting: ' + error.message);
    }
}

window.currentDocFilter = 'all';

function setDocFilter(filter) {
    window.currentDocFilter = filter;

    // Update active button styling
    document.querySelectorAll('.doc-filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
            btn.style.background = '#e2e8f0';
            btn.style.color = '#1e293b';
            btn.style.border = 'none';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#64748b';
            btn.style.border = '1px solid #e2e8f0';
        }
    });

    if (window.currentModuleData && window.currentModuleData.documents) {
        renderDocs(window.currentModuleData.documents); // Documents are shared globally — always render all
    }
}

function renderDocs(docs) {
    const list = document.getElementById('d-list');
    const grid = document.getElementById('d-grid');

    if (!docs || docs.length === 0) {
        list.style.display = 'flex';
        grid.style.display = 'none';
        list.innerHTML = '<p style="color: #64748b; text-align: center;">No document added.</p>';
        return;
    }

    const pdfs = [];
    const words = [];
    const ppts = [];
    const images = [];
    const others = [];

    docs.forEach(d => {
        const name = d.title || (d.document ? d.document.originalName : d.originalName) || 'Document';
        const fileUrl = (d.document ? d.document.fileUrl : d.fileUrl) || '';

        // Tentamos extrair a extensão do fileUrl primeiro, se não tiver, usamos o nome
        let stringToTest = fileUrl ? fileUrl.split('?')[0].toLowerCase() : name.toLowerCase();

        // Fallback se a URL não tiver extensão mas o nome tiver
        if (!stringToTest.includes('.') && name.includes('.')) {
            stringToTest = name.toLowerCase();
        }

        if (stringToTest.endsWith('.pdf')) pdfs.push(d);
        else if (stringToTest.endsWith('.doc') || stringToTest.endsWith('.docx')) words.push(d);
        else if (stringToTest.endsWith('.ppt') || stringToTest.endsWith('.pptx')) ppts.push(d);
        else if (/\.(jpe?g|png|gif|webp)$/i.test(stringToTest)) images.push(d);
        else others.push(d);
    });

    const filter = window.currentDocFilter;
    let itemsToRenderList = [];
    let itemsToRenderGrid = [];

    if (filter === 'all') {
        itemsToRenderList = [...pdfs, ...words, ...ppts, ...others];
        itemsToRenderGrid = images;
    } else if (filter === 'pdf') {
        itemsToRenderList = pdfs;
    } else if (filter === 'word') {
        itemsToRenderList = words;
    } else if (filter === 'ppt') {
        itemsToRenderList = ppts;
    } else if (filter === 'image') {
        itemsToRenderGrid = images;
    }

    // Render List
    if (itemsToRenderList.length > 0 || filter !== 'image' && filter !== 'all') {
        list.style.display = 'flex';
        if (itemsToRenderList.length === 0) {
            list.innerHTML = '<p style="color: #64748b; text-align: center;">No file found for this filter.</p>';
        } else {
            list.innerHTML = itemsToRenderList.map(d => {
                const name = d.title || (d.document ? d.document.originalName : d.originalName) || 'Document';
                const fileUrl = (d.document ? d.document.fileUrl : d.fileUrl) || '';
                let stringToTest = fileUrl ? fileUrl.split('?')[0].toLowerCase() : name.toLowerCase();
                if (!stringToTest.includes('.') && name.includes('.')) stringToTest = name.toLowerCase();

                let icon = 'fas fa-file';
                let color = '#64748b';

                if (stringToTest.endsWith('.pdf')) { icon = 'fas fa-file-pdf'; color = '#ef4444'; }
                else if (stringToTest.endsWith('.doc') || stringToTest.endsWith('.docx')) { icon = 'fas fa-file-word'; color = '#2563eb'; }
                else if (stringToTest.endsWith('.ppt') || stringToTest.endsWith('.pptx')) { icon = 'fas fa-file-powerpoint'; color = '#d97706'; }

                return `
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 15px; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <i class="${icon}" style="color: ${color}; font-size:1.2rem;"></i>
                            <strong style="color:#1e293b; font-size:0.95rem;">${name}</strong>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <a href="${API_URL}/api/documents/download/${d.documentId || d.id}?token=${getAuthToken()}" target="_blank" style="color:#10b981; background:#d1fae5; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:6px;" title="Download File"><i class="fas fa-download"></i></a>
                            <button onclick="deleteDoc(${d.id})" style="background:#fee2e2; border:none; color:#ef4444; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:6px; cursor:pointer;" title="Remove"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } else {
        list.style.display = 'none';
        list.innerHTML = '';
    }

    // Render Grid
    if (itemsToRenderGrid.length > 0 || filter === 'image') {
        grid.style.display = 'grid';
        if (itemsToRenderGrid.length === 0 && filter === 'image') {
            grid.innerHTML = '<div style="grid-column: 1 / -1;"><p style="color: #64748b; text-align: center;">No image found.</p></div>';
        } else {
            grid.innerHTML = itemsToRenderGrid.map(d => {
                const name = d.title || (d.document ? d.document.originalName : d.originalName) || 'Image';
                const url = `${API_URL}/api/documents/download/${d.documentId || d.id}?token=${getAuthToken()}&inline=true`;
                return `
                    <div style="background:white; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; display:flex; flex-direction:column; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div style="height:100px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                            <img src="${url}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src=''; this.alt='Error loading'; this.style.padding='10px';">
                        </div>
                        <div style="padding:10px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border-top:1px solid #e2e8f0;">
                            <span style="font-size:0.75rem; color:#475569; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:60px;" title="${name}">${name}</span>
                            <div style="display:flex; gap:5px;">
                                <a href="${url.replace('&inline=true', '')}" target="_blank" style="color:#10b981; font-size:0.9rem;" title="Download"><i class="fas fa-download"></i></a>
                                <button onclick="deleteDoc(${d.id})" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:0.9rem; padding:0;" title="Remove"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } else {
        grid.style.display = 'none';
        grid.innerHTML = '';
    }
}

// --- QUIZ & IA ---
function showGenerateAiQuizForm() {
    hideManualQuizForm();
    const form = document.getElementById('ai-quiz-form');
    if (!form) {
        alert('AI quiz form is unavailable. Please refresh the page and try again.');
        return;
    }
    const firstQuiz = window.currentQuizDataList && window.currentQuizDataList[0];
    const container = firstQuiz ? document.getElementById(`forms-container-${firstQuiz.id}`) : document.getElementById('pane-quiz');
    if (container) container.appendChild(form);
    form.style.display = 'block';
    setTimeout(() => {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}
function hideAiQuizForm() {
    const form = document.getElementById('ai-quiz-form');
    if (form) form.style.display = 'none';
}

function showManualQuizForm(quizId) {
    window.currentModuleQuizId = quizId;
    window.editingQuestionId = null;
    hideAiQuizForm();

    const form = document.getElementById('manual-quiz-form');
    const container = document.getElementById(`forms-container-${quizId}`);
    if (container && form) {
        container.appendChild(form);
    }

    form.style.display = 'block';
    document.getElementById('manual-q-text').value = '';
    document.querySelectorAll('.manual-q-opt').forEach(opt => opt.value = '');
    document.querySelector('input[name="manual-q-correct"][value="0"]').checked = true;

    setTimeout(() => {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function hideManualQuizForm() {
    const form = document.getElementById('manual-quiz-form');
    if (form) form.style.display = 'none';
}

function changeQuizType(quizId, newType) {
    apiCall(`/modules/${editingModuleId}/quizzes/${quizId}`, 'PUT', { type: newType })
        .then(() => loadModuleData(editingModuleId))
        .catch(err => alert('Error changing quiz type: ' + err.message));
}

function editQuizTitle(quizId) {
    const quiz = window.currentQuizDataList.find(q => q.id === quizId);
    if (!quiz) return;

    const newTitle = prompt('Enter the new title of the Quiz:', quiz.title || '');
    if (newTitle === null || newTitle.trim() === '') return;

    apiCall(`/modules/${editingModuleId}/quizzes/${quizId}`, 'PUT', { title: newTitle.trim() })
        .then(() => loadModuleData(editingModuleId))
        .catch(err => alert('Error updating title: ' + err.message));
}

async function showCreateQuizForm() {
    try {
        const order = window.currentQuizDataList ? window.currentQuizDataList.length : 0;
        const defaultTitle = `Quiz ${order + 1}`;

        const title = prompt('Enter the title for the new Quiz:', defaultTitle);
        if (title === null || title.trim() === '') return;

        const quizBody = { title: title.trim() };
        if (currentLanguageSessionId) quizBody.languageSessionId = currentLanguageSessionId;
        await apiCall(`/modules/${editingModuleId}/quizzes`, 'POST', quizBody);
        loadModuleData(editingModuleId);
    } catch (err) {
        alert('Error creating quiz: ' + err.message);
    }
}

function editQuestion(quizId, questionId) {
    if (!window.currentQuizDataList) return;
    const quiz = window.currentQuizDataList.find(q => q.id === quizId);
    if (!quiz) return;
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    window.currentModuleQuizId = quizId;
    window.editingQuestionId = questionId;

    const form = document.getElementById('manual-quiz-form');
    const container = document.getElementById(`forms-container-${quizId}`);
    if (container && form) {
        container.appendChild(form);
    }

    document.getElementById('manual-q-text').value = question.text;
    const optionsInputs = Array.from(document.querySelectorAll('.manual-q-opt'));

    // Clear first
    optionsInputs.forEach(opt => opt.value = '');
    document.querySelector('input[name="manual-q-correct"][value="0"]').checked = true;

    // Populate
    question.options.forEach((opt, idx) => {
        if (idx < 4) {
            optionsInputs[idx].value = opt.text;
            if (opt.isCorrect) {
                const radio = document.querySelector(`input[name="manual-q-correct"][value="${idx}"]`);
                if (radio) radio.checked = true;
            }
        }
    });

    hideAiQuizForm();
    const manualForm = document.getElementById('manual-quiz-form');
    manualForm.style.display = 'block';
    setTimeout(() => {
        manualForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

async function createEmptyQuiz() {
    if (!editingModuleId) return;
    try {
        const quizBody = { title: 'Module Quiz' };
        if (currentLanguageSessionId) quizBody.languageSessionId = currentLanguageSessionId;
        await apiCall(`/modules/${editingModuleId}/quizzes`, 'POST', quizBody);
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error creating quiz: ' + error.message);
    }
}

async function submitManualQuizQuestion() {
    if (!editingModuleId) return;

    // First, verify if a quiz exists
    let currentQuizId = window.currentModuleQuizId;

    if (!currentQuizId) {
        // Create quiz first
        try {
            const quizCreateBody = { title: 'Module Quiz' };
            if (currentLanguageSessionId) quizCreateBody.languageSessionId = currentLanguageSessionId;
            const newQuiz = await apiCall(`/modules/${editingModuleId}/quizzes`, 'POST', quizCreateBody);
            currentQuizId = newQuiz.id;
            window.currentModuleQuizId = currentQuizId;
        } catch (error) {
            alert('Error creating quiz: ' + error.message);
            return;
        }
    }

    const text = document.getElementById('manual-q-text').value;
    const optionsInputs = Array.from(document.querySelectorAll('.manual-q-opt'));
    const correctOptionRadio = document.querySelector('input[name="manual-q-correct"]:checked');
    const correctOptionIndex = correctOptionRadio ? parseInt(correctOptionRadio.value) : 0;

    const options = optionsInputs.map((opt, i) => ({
        text: opt.value.trim(),
        isCorrect: i === correctOptionIndex
    })).filter(val => val.text !== '');

    if (!text || options.length < 2) {
        alert('Please type the question and at least 2 options.');
        return;
    }

    try {
        if (window.editingQuestionId) {
            await apiCall(`/quizzes/${currentQuizId}/questions/${window.editingQuestionId}`, 'PUT', {
                text,
                options,
                type: 'MULTIPLE_CHOICE',
                explanation: ''
            });
            window.editingQuestionId = null;
        } else {
            await apiCall(`/quizzes/${currentQuizId}/questions`, 'POST', {
                text,
                options,
                type: 'MULTIPLE_CHOICE',
                explanation: ''
            });
        }

        hideManualQuizForm();
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error adding question: ' + error.message);
    }
}

async function submitAiQuiz() {
    if (!editingModuleId) return;
    const questionCount = parseInt(document.getElementById('ai-q-count').value) || 5;
    const difficulty = document.getElementById('ai-q-difficulty').value || 'medium';

    if ((window.currentQuizDataList || []).length > 0) {
        const proceed = confirm('This module already has a quiz. Generate another AI quiz? The existing quiz will be kept.');
        if (!proceed) return;
    }

    const btn = document.getElementById('btn-submit-ai-quiz');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating with AI...';
    btn.disabled = true;

    try {
        const body = { title: 'AI Quiz', questionCount, optionsPerQuestion: 4, difficulty };
        if (currentLanguageSessionId) body.languageSessionId = currentLanguageSessionId;
        await apiCall(`/modules/${editingModuleId}/quizzes/ai-generate`, 'POST', body);
        alert('Quiz generated successfully!');
        hideAiQuizForm();
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error generating quiz: ' + error.message);
    } finally {
        btn.innerHTML = 'Generate Questions Now';
        btn.disabled = false;
    }
}

async function deleteQuiz(quizId) {
    if (!confirm('Delete this quiz and all its questions?')) return;
    try {
        await apiCall(`/modules/${editingModuleId}/quizzes/${quizId}`, 'DELETE');
        window.currentModuleQuizId = null;
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error deleting quiz: ' + error.message);
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('Delete this question?')) return;
    try {
        await apiCall(`/modules/${editingModuleId}/quiz/questions/${questionId}`, 'DELETE');
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error deleting question: ' + error.message);
    }
}

function renderQuizzes(quizzes) {
    const list = document.getElementById('q-list');

    // SAFEGUARD: Move forms out of q-list before destroying its contents
    const manualForm = document.getElementById('manual-quiz-form');
    const aiForm = document.getElementById('ai-quiz-form');
    const paneQuiz = document.getElementById('pane-quiz');
    if (manualForm && paneQuiz) paneQuiz.appendChild(manualForm);
    if (aiForm && paneQuiz) paneQuiz.appendChild(aiForm);

    if (!quizzes || quizzes.length === 0) {
        window.currentQuizDataList = [];
        list.innerHTML = `
            <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px dashed #cbd5e1; text-align: center;">
                <p style="color:#64748b; margin-bottom: 20px;">No quiz found for this module.</p>
                <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
                    <button onclick="showCreateQuizForm()" style="padding: 10px 20px; background: #cf982e; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Create New Quiz</button>
                    <button onclick="showGenerateAiQuizForm()" style="padding: 10px 20px; background: #7c3aed; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;"><i class="fas fa-magic"></i> Generate with AI</button>
                </div>
            </div>
        `;
        return;
    }

    window.currentQuizDataList = quizzes;

    list.innerHTML = quizzes.map(quiz => {
        const questions = quiz.questions || [];
        const currentType = quiz.type || 'FINAL_EVALUATION';
        return `
            <div id="quiz-inner-container-${quiz.id}" style="background: #f1f5f9; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; flex-wrap:wrap; gap:10px;">
                    <div>
                        <h4 style="margin: 0; font-size: 1.2rem; display:flex; align-items:center; gap:8px; color: #1e293b;">
                            <i class="fas fa-list-ul" style="color: #497aa7;"></i> ${quiz.title || 'Module Quiz'}
                            <button onclick="editQuizTitle(${quiz.id})" style="background:transparent; border:none; color:#497aa7; cursor:pointer; font-size:1rem;" title="Edit Quiz Title"><i class="fas fa-edit"></i></button>
                        </h4>
                        <div style="display:flex; align-items:center; gap:10px; margin-top:8px; flex-wrap:wrap;">
                            <span style="font-size:0.8rem; background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 12px; display:inline-block; font-weight:bold;">${questions.length} questions</span>
                            <select onchange="changeQuizType(${quiz.id}, this.value)" style="font-size:0.8rem; padding:4px 8px; border-radius:6px; border:1px solid ${currentType === 'ENTRY_TEST' ? '#f59e0b' : '#44749f'}; background:${currentType === 'ENTRY_TEST' ? '#fef3c7' : '#f0f9ff'}; color:${currentType === 'ENTRY_TEST' ? '#92400e' : '#1e40af'}; font-weight:600; cursor:pointer;">
                                <option value="ENTRY_TEST" ${currentType === 'ENTRY_TEST' ? 'selected' : ''}>🧪 Entry Test</option>
                                <option value="FINAL_EVALUATION" ${currentType === 'FINAL_EVALUATION' ? 'selected' : ''}>📝 Final Evaluation</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <button onclick="showManualQuizForm(${quiz.id})" style="padding: 8px 12px; background: #cf982e; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.85rem;"><i class="fas fa-plus"></i> Question</button>
                        <button onclick="showGenerateAiQuizForm()" style="padding: 8px 12px; background: #7c3aed; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.85rem;"><i class="fas fa-magic"></i> Generate with AI</button>
                        <button onclick="translateQuizToSession(${quiz.id})" style="padding: 8px 12px; background: #0ea5e9; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.85rem;" title="Translate this quiz using AI"><i class="fas fa-language"></i> Translate Quiz</button>
                        <button onclick="deleteQuiz(${quiz.id})" style="padding: 8px 12px; background: transparent; color: #ef4444; border: none; cursor: pointer;" title="Delete Entire Quiz"><i class="fas fa-trash"></i></button>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${questions.map((q, idx) => `
                        <details style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; cursor: pointer; outline: none; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                            <summary style="display:flex; justify-content:space-between; align-items:flex-start; outline: none; list-style: none;">
                                <div style="display:flex; align-items:center; gap: 10px;">
                                    <span><i class="fas fa-chevron-down" style="font-size: 0.8rem; color: #94a3b8;"></i></span>
                                    <strong style="font-size: 1rem; color: #1e293b;">${idx + 1}. ${q.text}</strong>
                                </div>
                                <div style="display:flex; gap:10px;" onclick="event.preventDefault();">
                                    <button onclick="editQuestion(${quiz.id}, ${q.id})" style="background: transparent; border: none; color: #497aa7; cursor: pointer;" title="Edit"><i class="fas fa-edit"></i></button>
                                    <button onclick="deleteQuestion(${q.id})" style="background: transparent; border: none; color: #ef4444; cursor: pointer;" title="Delete"><i class="fas fa-trash"></i></button>
                                </div>
                            </summary>
                            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 15px; padding-left: 20px; cursor: default;" onclick="event.preventDefault();">
                                ${(q.options || []).map((opt) => `
                                    <label style="display:flex; align-items:center; gap: 8px; font-size: 0.9rem; color: ${opt.isCorrect ? '#10b981' : '#64748b'}; font-weight: ${opt.isCorrect ? 'bold' : 'normal'}; cursor: default;">
                                        <input type="radio" disabled ${opt.isCorrect ? 'checked' : ''} style="accent-color: #10b981;">
                                        ${opt.text}
                                    </label>
                                `).join('')}
                            </div>
                        </details>
                    `).join('')}

                    ${questions.length === 0 ? '<p style="color:#94a3b8; text-align:center; padding: 20px;">No questions in this quiz. Add manually or generate with AI.</p>' : ''}
                </div>
                <div id="forms-container-${quiz.id}"></div>
            </div>
        `;
    }).join('');

    // Make sure forms are attached to the DOM but hidden by default
    const firstContainer = document.getElementById(`forms-container-${quizzes[0].id}`);
    if (firstContainer && manualForm) {
        firstContainer.appendChild(manualForm);
        manualForm.style.display = 'none';
    }
    if (firstContainer && aiForm) {
        firstContainer.appendChild(aiForm);
        aiForm.style.display = 'none';
    }
}

// Sub-Modal Dinâmico
function openSubModal(title, html, onConfirm) {
    const modalId = 'dynamic-sub-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = modalId;
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000; display:flex; align-items:center; justify-content:center;';
    modal.innerHTML = `
        <div style="background:rgba(30, 41, 59, 0.95); width:90%; max-width:550px; border-radius:12px; padding:25px; position:relative; border: 1px solid rgba(255,255,255,0.1); color: white; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <h3 style="margin-top:0; color:white; margin-bottom: 20px;">${title}</h3>
            <div id="sub-modal-body" style="margin-bottom: 20px;">
                ${html}
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button onclick="document.getElementById('${modalId}').remove()" style="padding:10px 15px; background:rgba(255,255,255,0.1); color:white; border:none; border-radius:6px; cursor:pointer;">Cancel</button>
                <button id="sub-modal-confirm" style="padding:10px 15px; background:#6366f1; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('sub-modal-confirm').addEventListener('click', onConfirm);
}



async function deleteQuestion(questionId) {
    if (!confirm('Delete question?')) return;
    try {
        await apiCall(`/modules/${editingModuleId}/quiz/questions/${questionId}`, 'DELETE');
        loadModuleData(editingModuleId);
    } catch (err) {
        alert('Error deleting: ' + err.message);
    }
}

// --- TRANSLATE QUIZ ---
async function translateQuizToSession(quizId) {
    if (!editingModuleId) return;

    // Determine target locale for translation
    let targetLocale, targetLabel, targetSessionId;
    if (currentLanguageSessionId) {
        const session = moduleLanguageSessions.find(s => s.id === currentLanguageSessionId);
        if (!session) return;
        targetLocale = session.locale;
        targetLabel = LOCALE_LABELS[session.locale] || session.locale;
        targetSessionId = currentLanguageSessionId;
    } else {
        // Base session: use the default session's locale
        const defaultSession = moduleLanguageSessions.find(s => s.isDefault);
        targetLocale = defaultSession ? defaultSession.locale : 'en-US';
        targetLabel = LOCALE_LABELS[targetLocale] || targetLocale;
        targetSessionId = null; // base
    }

    if (!confirm(`Translate this quiz to ${targetLabel} using AI?\nA new translated quiz will be created in this language session.`)) return;

    try {
        const btn = event.target.closest('button');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
            btn.disabled = true;
        }

        await apiCall(`/modules/${editingModuleId}/quizzes/${quizId}/translate`, 'POST', {
            targetLocale: targetLocale,
            targetSessionId: targetSessionId
        });

        alert(`Quiz translated to ${targetLabel} successfully!`);
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error translating quiz: ' + error.message);
    }
}

// ==========================================
// SIMULATION BUILDER FUNCTIONS
// ==========================================

function updateSimulationButton() {
    const btn = document.getElementById('btn-create-simulation');
    const label = document.getElementById('btn-simulation-label');
    if (!btn || !label) return;

    const courseData = window.currentCourseData || window.apiCourseData;

    if (courseData && courseData.simulationHtml && courseData.simulationHtml.length > 50) {
        label.innerHTML = '<i class="fas fa-edit" style="margin-right:5px;"></i> Edit Simulation';
        btn.style.background = '#4f46e5';

        // Add delete button if it doesn't exist
        if (!document.getElementById('btn-delete-simulation')) {
            const deleteBtn = document.createElement('button');
            deleteBtn.id = 'btn-delete-simulation';
            deleteBtn.innerHTML = '<i class="fas fa-times" style="color:#ef4444;"></i>';
            deleteBtn.style.cssText = 'background:transparent; border:1px solid #ef4444; border-radius:6px; padding:8px 12px; cursor:pointer; margin-right:5px; transition:0.2s;';
            deleteBtn.title = 'Delete Simulation';
            deleteBtn.onmouseover = () => { deleteBtn.style.background = '#fee2e2'; };
            deleteBtn.onmouseout = () => { deleteBtn.style.background = 'transparent'; };
            deleteBtn.onclick = async () => {
                if (!confirm('Are you sure you want to delete the simulation page? This cannot be undone.')) return;
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`/courses/${window.editingCourseId}/simulation`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ simulationHtml: '' })
                    });
                    if (res.ok) {
                        if (window.apiCourseData) window.apiCourseData.simulationHtml = null;
                        if (window.currentCourseData) window.currentCourseData.simulationHtml = null;
                        updateSimulationButton();
                    } else {
                        const err = await res.json().catch(() => ({}));
                        alert('Failed to delete simulation: ' + (err.error || 'Unknown error'));
                    }
                } catch (e) {
                    console.error(e);
                    alert('Error deleting simulation.');
                }
            };
            btn.parentNode.insertBefore(deleteBtn, btn);
        }
    } else {
        label.innerHTML = '+ Create Simulation';
        btn.style.background = '#6366f1';

        const deleteBtn = document.getElementById('btn-delete-simulation');
        if (deleteBtn) deleteBtn.remove();
    }
}

function goToSimulationBuilder() {
    const courseId = window.editingCourseId || '';
    if (!courseId) {
        alert('Please select or create a course first.');
        return;
    }
    window.location.href = `builder.html?mode=simulation&courseId=${courseId}`;
}
