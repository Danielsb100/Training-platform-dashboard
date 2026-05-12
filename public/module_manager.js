const API_URL = window.location.origin;

function getAuthToken() {
    return localStorage.getItem('token');
}

async function apiCall(endpoint, method = 'GET', body = null, isFormData = false) {
    const token = getAuthToken();
    if (!token) {
        alert('Session expired. Please log in again.');
        window.location.href = 'index.html';
        throw new Error('No token');
    }

    const headers = {
        'Authorization': `Bearer ${token}`
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = isFormData ? body : JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || data.message || 'Request error');
    }

    return data.data || data;
}

// ==========================================
// ESTADO DO GERENCIADOR DE MÓDULOS
// ==========================================
let dbModules = [];
let editingModuleId = null;

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
    document.getElementById('module-editor-modal').style.display = 'block';
    document.getElementById('active-module-editor').style.display = 'none'; // hide detail panel initially
    renderAttachedModules();
}

function closeModuleEditor() {
    document.getElementById('module-editor-modal').style.display = 'none';
    if(typeof updateConstructionUI === 'function') {
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
                status: module.status
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
        <div style="background: ${bgColor}; background-image: ${bgImg}; background-size: cover; background-position: center; border-radius:12px; padding:20px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); aspect-ratio: 1; position: relative; overflow: hidden;"
             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.2)';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.02)';"
             onclick="openModuleEditor(${m.dbId})">
            
            <div style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); position: absolute; inset: 0; pointer-events: none;"></div>
            
            <div style="position: relative; z-index: 10; display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <span style="background: rgba(255,255,255,0.2); color: #fff; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold; backdrop-filter: blur(4px);">MODULE ${index + 1}</span>
                <button onclick="event.stopPropagation(); removeModuleFromCourse(${m.id})" style="background:rgba(255,255,255,0.2); border:none; color:#ef4444; padding: 4px 8px; border-radius: 4px; cursor:pointer; backdrop-filter: blur(4px);" title="Remove from Track"><i class="fas fa-trash"></i></button>
            </div>
            
            <div style="position: relative; z-index: 10; margin-top: auto;">
                <h3 style="margin:0 0 5px 0; font-size:1.2rem; color: ${color}; font-family: ${font};">${m.title}</h3>
                <p style="margin:0; font-size:0.85rem; color: rgba(255,255,255,0.8); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${m.content || 'No description'}</p>
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
    
    // Reset UI
    document.getElementById('module-basics-form').reset();
    document.getElementById('v-list').innerHTML = '<p style="text-align:center; color:#94a3b8;">Loading videos...</p>';
    document.getElementById('d-list').innerHTML = '<p style="text-align:center; color:#94a3b8;">Loading documents...</p>';
    document.getElementById('q-list').innerHTML = '<p style="text-align:center; color:#94a3b8;">Loading quiz...</p>';
    document.getElementById('btn-delete-module').style.display = 'none';
    
    switchModuleTab('basics');
    document.getElementById('active-module-editor').style.display = 'block';

    if (!moduleId) {
        document.getElementById('editor-title').innerText = 'Create New Module';
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
                        status: newModule.status
                    });
                    renderAttachedModules();
                } catch (err) {
                    console.error('Failed to link new module to course', err);
                }
            }
            
            renderVideos([]);
            renderDocs([]);
            renderQuizzes([]);
            
        } catch (error) {
            alert('Error creating base module: ' + error.message);
            document.getElementById('active-module-editor').style.display = 'none';
        }
    } else {
        document.getElementById('editor-title').innerText = 'Edit Module';
        document.getElementById('btn-delete-module').style.display = 'block';
        loadModuleData(moduleId);
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
    if(activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = '#cf982e';
        activeBtn.style.borderBottomColor = '#cf982e';
    }
    
    const activePane = document.getElementById(`pane-${tabName}`);
    if(activePane) activePane.style.display = 'block';
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
        
        // Videos
        renderVideos(module.videos || []);
        
        // Docs
        renderDocs(module.documents || []);
        
        // Quizzes
        const quizzes = module.quizzes || (module.quiz ? [module.quiz] : []);
        renderQuizzes(quizzes);
        
        // Update the cover preview based on loaded data
        updateCoverPreview();
        
    } catch (error) {
        alert('Error loading module: ' + error.message);
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
        if(localMod) {
            localMod.title = title;
            localMod.content = description;
            localMod.status = status;
            if(typeof saveDraft === 'function') saveDraft(true);
        }
        
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
        if(localMod) {
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
    if(!editingModuleId) return;
    if(!confirm('Are you sure you want to permanently delete this module from the database? It will disappear from all courses.')) return;
    
    try {
        await apiCall(`/modules/${editingModuleId}`, 'DELETE');
        
        // Remove do curso local se estiver atrelado
        window.courseModules = window.courseModules.filter(m => m.dbId !== editingModuleId);
        if(typeof saveDraft === 'function') saveDraft(true);
        
        alert('Module deleted!');
        closeModuleEditor();
    } catch (error) {
        alert('Error deleting: ' + error.message);
    }
}

// --- VIDEOS ---
function showAddVideoForm() { document.getElementById('add-video-form').style.display = 'block'; }
function hideAddVideoForm() { document.getElementById('add-video-form').style.display = 'none'; }

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
    const description = document.getElementById('v-desc-input').value;
    const url = document.getElementById('v-url-input').value;
    
    if(!title || !url) return alert('Title and URL are required.');
    
    try {
        await apiCall(`/modules/${editingModuleId}/videos`, 'POST', { title, description, url });
        hideAddVideoForm();
        document.getElementById('v-title-input').value = '';
        document.getElementById('v-desc-input').value = '';
        document.getElementById('v-url-input').value = '';
        if (document.getElementById('v-upload-input')) {
            document.getElementById('v-upload-input').value = '';
        }
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error adding video: ' + error.message);
    }
}

async function deleteVideo(videoId) {
    if(!confirm('Delete video?')) return;
    try {
        await apiCall(`/modules/${editingModuleId}/videos/${videoId}`, 'DELETE');
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error deleting video: ' + error.message);
    }
}

function getThumbnailUrl(url) {
    if (!url) return null;
    let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
}

function renderVideos(videos) {
    const list = document.getElementById('v-list');
    if(!videos || videos.length === 0) {
        list.innerHTML = '<p style="color: #64748b; text-align: center;">No video added.</p>';
        return;
    }
    
    // Configura o grid
    list.style.display = 'grid';
    list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    list.style.gap = '15px';
    
    list.innerHTML = videos.map(v => {
        const thumb = getThumbnailUrl(v.url);
        // Transform the title and url into safe strings for onclick
        const safeUrl = v.url.replace(/"/g, '&quot;');
        const safeTitle = (v.title || '').replace(/"/g, '&quot;');
        const playIconOverlay = `<div onclick="playVideo('${safeUrl}', '${safeTitle}')" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:50px; height:50px; background:rgba(0,0,0,0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid white; transition:background 0.2s;" onmouseover="this.style.background='rgba(207, 152, 46, 0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.6)'"><i class="fas fa-play" style="color:white; font-size:1.2rem; margin-left:4px;"></i></div>`;

        const thumbHtml = thumb 
            ? `<div style="height:140px; background:url('${thumb}') center/cover; position:relative;">${playIconOverlay}`
            : `<div style="height:140px; background:#1e293b; position:relative; overflow:hidden;">
                   <video src="${safeUrl}#t=0.1" preload="metadata" style="width:100%; height:100%; object-fit:cover; display:block;" muted playsinline></video>
                   ${playIconOverlay}`;

        return `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; display:flex; flex-direction:column; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            ${thumbHtml}
                <button onclick="deleteVideo(${v.id})" style="position:absolute; top:10px; right:10px; background:white; border:none; color:#ef4444; border-radius:50%; width:30px; height:30px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.2); z-index:10;" title="Remove Video"><i class="fas fa-trash"></i></button>
            </div>
            <div style="padding:15px; flex:1; display:flex; flex-direction:column;">
                <strong style="color:#1e293b; display:block; margin-bottom:5px; font-size:1rem; line-height:1.3;">${v.title}</strong>
                <span style="font-size:0.85rem; color:#64748b; display:block; margin-bottom:15px; flex:1; line-height:1.4;">${v.description || ''}</span>
            </div>
        </div>
        `;
    }).join('');
}

function escapeVideoAttr(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function isOneDriveUrl(url) {
    try {
        const host = new URL(url, window.location.origin).hostname.toLowerCase();
        return host.includes('1drv.ms') || host.includes('onedrive.live.com') || host.includes('sharepoint.com');
    } catch (error) {
        return /(?:1drv\.ms|onedrive\.live\.com|sharepoint\.com)/i.test(url || '');
    }
}

function buildOneDriveEmbedUrl(rawUrl) {
    const url = String(rawUrl || '').trim();
    if (!url) return url;

    try {
        const parsed = new URL(url, window.location.origin);
        const host = parsed.hostname.toLowerCase();

        // 1drv.ms short links and modern SharePoint sharing links already carry the
        // public access token in their original URL. Stripping the query string was
        // the source of broken public OneDrive playback, so preserve it and only add
        // a non-destructive embed hint.
        if (host.includes('1drv.ms') || host.includes('sharepoint.com')) {
            if (!parsed.searchParams.has('web') && !parsed.searchParams.has('embed')) {
                parsed.searchParams.set('web', '1');
            }
            return parsed.toString();
        }

        if (host.includes('onedrive.live.com')) {
            const resid = parsed.searchParams.get('resid');
            const authkey = parsed.searchParams.get('authkey');
            if (resid) {
                const embed = new URL('https://onedrive.live.com/embed');
                embed.searchParams.set('resid', resid);
                if (authkey) embed.searchParams.set('authkey', authkey);
                embed.searchParams.set('em', '2');
                return embed.toString();
            }
        }
    } catch (error) {
        // Keep the original URL as the safest fallback for public sharing links.
    }

    return url;
}

function renderOneDrivePlayer(container, url) {
    const embedUrl = buildOneDriveEmbedUrl(url);
    const safeEmbedUrl = escapeVideoAttr(embedUrl);
    const safeOriginalUrl = escapeVideoAttr(url);
    container.innerHTML = `
        <div style="position:absolute; inset:0; display:flex; flex-direction:column; background:#020617;">
            <iframe src="${safeEmbedUrl}" style="flex:1; width:100%; border:none; background:white;" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
            <div style="display:flex; gap:12px; align-items:center; justify-content:space-between; padding:12px 16px; background:#0f172a; color:white; font-size:0.9rem;">
                <span>If OneDrive blocks embedded playback, open the public video link in a new tab.</span>
                <a href="${safeOriginalUrl}" target="_blank" rel="noopener noreferrer" style="color:white; background:#497aa7; padding:8px 14px; border-radius:999px; text-decoration:none; font-weight:700; white-space:nowrap;">Open in OneDrive</a>
            </div>
        </div>`;
}

function playVideo(url, title) {
    const modal = document.getElementById('video-player-modal');
    const container = document.getElementById('video-player-container');
    const titleEl = document.getElementById('video-player-title');

    if (!modal || !container) return;

    titleEl.innerText = title || 'Watch Video';

    let embedUrl = url;

    // Transform YouTube URL to embed
    let ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
        embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }

    // Transform Vimeo URL to embed
    let vimeoMatch = url.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    let isDirectVideo = false;
    if (url.includes('/api/documents/download/') || url.match(/\.(mp4|webm|ogg)(?:$|[?#])/i)) {
        isDirectVideo = true;
        if (url.includes('/api/documents/download/')) {
            embedUrl = url + (url.includes('?') ? '&' : '?') + 'inline=true';
        }
    }

    if (!isDirectVideo && isOneDriveUrl(url)) {
        renderOneDrivePlayer(container, url);
    } else if (isDirectVideo) {
        container.innerHTML = `<video src="${escapeVideoAttr(embedUrl)}" style="position:absolute; top:0; left:0; width:100%; height:100%; outline:none; background:black;" controls autoplay></video>`;
    } else {
        container.innerHTML = `<iframe src="${escapeVideoAttr(embedUrl)}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    }
    modal.style.display = 'flex';
}

function closeVideoPlayer() {
    const modal = document.getElementById('video-player-modal');
    const container = document.getElementById('video-player-container');
    if(container) container.innerHTML = '';
    if(modal) modal.style.display = 'none';
}

// --- DOCS ---
async function handleDocUpload(e) {
    const file = e.target.files[0];
    if (!file || !editingModuleId) return;

    try {
        // 1. Fazer upload do documento para a API de Documentos
        const formData = new FormData();
        formData.append('document', file);
        
        const btn = document.getElementById('btn-add-doc');
        let oldText = '<i class="fas fa-file-alt"></i> + Doc';
        if (btn) {
            oldText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            btn.disabled = true;
        }

        const docRes = await apiCall('/api/documents/upload', 'POST', formData, true);
        const docId = docRes.id;
        
        // 2. Vincular o Documento ao Módulo
        await apiCall(`/modules/${editingModuleId}/documents`, 'POST', { 
            documentId: docId,
            title: file.name 
        });
        
        if (btn) {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
        
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error uploading: ' + error.message);
        const btn = document.getElementById('btn-add-doc');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-file-alt"></i> + Doc';
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
    if(!confirm('Remove this document from the module?')) return;
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
        if(btn.dataset.filter === filter) {
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
    
    if(window.currentModuleData && window.currentModuleData.documents) {
        renderDocs(window.currentModuleData.documents);
    }
}

function renderDocs(docs) {
    const list = document.getElementById('d-list');
    const grid = document.getElementById('d-grid');
    
    if(!docs || docs.length === 0) {
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
    document.getElementById('ai-quiz-form').style.display = 'block'; 
}
function hideAiQuizForm() { document.getElementById('ai-quiz-form').style.display = 'none'; }

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
}

function hideManualQuizForm() {
    document.getElementById('manual-quiz-form').style.display = 'none';
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
        
        await apiCall(`/modules/${editingModuleId}/quizzes`, 'POST', { title: title.trim() });
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
    document.getElementById('manual-quiz-form').style.display = 'block';
    document.getElementById('manual-quiz-form').scrollIntoView({ behavior: 'smooth' });
}

async function createEmptyQuiz() {
    if (!editingModuleId) return;
    try {
        await apiCall(`/modules/${editingModuleId}/quizzes`, 'POST', { title: 'Module Quiz' });
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
            const newQuiz = await apiCall(`/modules/${editingModuleId}/quizzes`, 'POST', { title: 'Module Quiz' });
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
    
    const btn = document.getElementById('btn-submit-ai-quiz');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating with AI...';
    btn.disabled = true;
    
    try {
        await apiCall(`/modules/${editingModuleId}/quizzes/ai-generate`, 'POST', { title: 'AI Quiz', questionCount, optionsPerQuestion: 4 });
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
    if(!confirm('Delete this quiz and all its questions?')) return;
    try {
        await apiCall(`/modules/${editingModuleId}/quizzes/${quizId}`, 'DELETE');
        window.currentModuleQuizId = null;
        loadModuleData(editingModuleId);
    } catch (error) {
        alert('Error deleting quiz: ' + error.message);
    }
}

async function deleteQuestion(questionId) {
    if(!confirm('Delete this question?')) return;
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
    
    if(!quizzes || quizzes.length === 0) {
        window.currentQuizDataList = [];
        list.innerHTML = `
            <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px dashed #cbd5e1; text-align: center;">
                <p style="color:#64748b; margin-bottom: 20px;">No quiz found for this module.</p>
                <button onclick="showCreateQuizForm()" style="padding: 10px 20px; background: #cf982e; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Create New Quiz</button>
            </div>
        `;
        return;
    }
    
    window.currentQuizDataList = quizzes;
    
    list.innerHTML = quizzes.map(quiz => {
        const questions = quiz.questions || [];
        return `
            <div id="quiz-inner-container-${quiz.id}" style="background: #f1f5f9; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                    <div>
                        <h4 style="margin: 0; font-size: 1.2rem; display:flex; align-items:center; gap:8px; color: #1e293b;">
                            <i class="fas fa-list-ul" style="color: #497aa7;"></i> ${quiz.title || 'Module Quiz'}
                            <button onclick="editQuizTitle(${quiz.id})" style="background:transparent; border:none; color:#497aa7; cursor:pointer; font-size:1rem;" title="Edit Quiz Title"><i class="fas fa-edit"></i></button>
                        </h4>
                        <span style="font-size:0.8rem; background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 12px; display:inline-block; margin-top:5px; font-weight:bold;">${questions.length} questions</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="showManualQuizForm(${quiz.id})" style="padding: 8px 12px; background: #cf982e; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.85rem;"><i class="fas fa-plus"></i> Question</button>
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
    if(modal) modal.remove();
    
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
    if(!confirm('Delete question?')) return;
    try {
        await apiCall(`/modules/${editingModuleId}/quiz/questions/${questionId}`, 'DELETE');
        loadModuleData(editingModuleId);
    } catch (err) {
        alert('Error deleting: ' + err.message);
    }
}
