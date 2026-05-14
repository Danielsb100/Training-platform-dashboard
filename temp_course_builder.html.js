
        async function deleteCourse() {
            if (confirm('ARE YOU SURE? This action will permanently delete this course and all its modules, videos and files.')) {
                if (window.editingCourseId && !window.editingCourseId.toString().startsWith('course_')) {
                    try {
                        await apiCall(`/courses/${window.editingCourseId}`, 'DELETE');
                        window.location.href = 'profile.html?tab=creations';
                    } catch (error) {
                        alert('Error deleting course: ' + error.message);
                    }
                } else {
                    window.location.href = 'profile.html?tab=creations';
                }
            }
        }

        function checkCourseSaveStatus() {
            const titleInput = document.getElementById('course-title').value.trim();
            const btnSaveDraft = document.getElementById('btn-save-draft');
            const btnPublish = document.getElementById('btn-publish');
            const btnCreateModule = document.getElementById('btn-create-module');
            const btnCreateLP = document.getElementById('btn-create-lp');

            if (btnSaveDraft) {
                btnSaveDraft.disabled = titleInput.length === 0;
                btnSaveDraft.style.opacity = titleInput.length === 0 ? '0.5' : '1';
                btnSaveDraft.style.cursor = titleInput.length === 0 ? 'not-allowed' : 'pointer';
            }
            if (btnPublish) {
                btnPublish.disabled = titleInput.length === 0;
                btnPublish.style.opacity = titleInput.length === 0 ? '0.5' : '1';
                btnPublish.style.cursor = titleInput.length === 0 ? 'not-allowed' : 'pointer';
            }

            const isSaved = window.editingCourseId && !window.editingCourseId.toString().startsWith('course_');
            
            if (btnCreateModule) {
                if (!isSaved) {
                    btnCreateModule.setAttribute('disabled', 'true');
                    btnCreateModule.style.opacity = '0.5';
                    btnCreateModule.style.cursor = 'not-allowed';
                    btnCreateModule.title = 'Save the course first to add modules.';
                } else {
                    btnCreateModule.removeAttribute('disabled');
                    btnCreateModule.style.opacity = '1';
                    btnCreateModule.style.cursor = 'pointer';
                    btnCreateModule.title = '';
                }
            }

            if (btnCreateLP) {
                if (!isSaved) {
                    btnCreateLP.setAttribute('disabled', 'true');
                    btnCreateLP.style.opacity = '0.5';
                    btnCreateLP.style.cursor = 'not-allowed';
                    btnCreateLP.title = 'Save the course first to create a Landing Page.';
                } else {
                    btnCreateLP.removeAttribute('disabled');
                    btnCreateLP.style.opacity = '1';
                    btnCreateLP.style.cursor = 'pointer';
                    btnCreateLP.title = '';
                }
            }
        }


        // Load Course Data for Editing
        window.addEventListener('DOMContentLoaded', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            let courseId = urlParams.get('id');
            
            // Força a criação de um ID se for novo, para que a LP saiba de onde vem
            if (!courseId) {
                courseId = 'course_' + Date.now();
                window.editingCourseId = courseId;
            } else {
                window.editingCourseId = courseId;
            }

            const channelSelect = document.getElementById('course-channel');
            
            // Tenta carregar os canais reais salvos no navegador ANTES de preencher o formulário
            const tokenForChannels = localStorage.getItem('token');
            fetch('/channels/my', { headers: { 'Authorization': `Bearer ${tokenForChannels}` } })
                .then(r => r.json())
                .then(res => {
                    const savedChannels = res.data || [];
                    if (savedChannels.length > 0) {
                        savedChannels.forEach(ch => {
                            const opt = document.createElement('option');
                            opt.value = ch.id;
                            opt.innerText = ch.name;
                            channelSelect.appendChild(opt);
                        });
                    }
                }).catch(e => console.error(e));

            const coursesLocal = JSON.parse(localStorage.getItem('published_courses') || '[]');
            let course = coursesLocal.find(c => String(c.id) === String(courseId));
            
            // Tenta buscar o curso no backend se for um ID real
            if (courseId && !courseId.startsWith('course_')) {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const res = await fetch(`/courses/${courseId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data && data.id) {
                                course = data;
                                window.apiCourseData = data;
                            } else if (data && data.data) {
                                course = data.data;
                                window.apiCourseData = data.data;
                            }
                            
                            // Load editors if saved course
                            loadCoEditors(window.editingCourseId);
                            document.getElementById('editors-section').style.display = 'block';
                            loadStudents(window.editingCourseId);
                            document.getElementById('students-section').style.display = 'block';
                        }
                    }
                } catch (err) {
                    console.error('Erro ao buscar curso da API:', err);
                }
            }
            
            if (course) {
                document.getElementById('course-title').value = course.title || '';
                document.getElementById('course-desc').value = course.description || '';
                
                // Set channel
                if (course.channelId) {
                    document.getElementById('course-channel').value = course.channelId;
                } else if (course.CourseChannel && course.CourseChannel.length > 0) {
                    document.getElementById('course-channel').value = course.CourseChannel[0].channelId;
                }
                
                document.getElementById('course-title-display').innerText = course.title || 'New Course';
                
                // Lógica da Capa: Se tem coverImage ou custom_thumb usa, senão usa lp_thumb
                if (course.coverImage || course.custom_thumb || course.thumbnailUrl) {
                    const thumbUrl = course.coverImage || course.thumbnailUrl || course.custom_thumb;
                    document.getElementById('cover-preview').style.backgroundImage = `url(${thumbUrl})`;
                    document.getElementById('cover-preview').querySelector('.fa-image').style.display = 'none';
                    document.getElementById('cover-status-text').innerText = '(Custom Course Cover)';
                    window.courseCustomThumb = thumbUrl;
                } else if (course.lp_thumb) {
                    document.getElementById('cover-preview').style.backgroundImage = `url(${course.lp_thumb})`;
                    document.getElementById('cover-preview').querySelector('.fa-image').style.display = 'none';
                    document.getElementById('cover-status-text').innerText = '(Inheriting Landing Page cover)';
                    course.thumb = course.lp_thumb; // fallback para exibição geral
                } else if (course.modular_content) {
                    // Fallback antigo de extrair do HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = course.modular_content;
                    const firstImg = tempDiv.querySelector('img');
                    if(firstImg) {
                        const bgImage = firstImg.src;
                        document.getElementById('cover-preview').style.backgroundImage = `url(${bgImage})`;
                        document.getElementById('cover-preview').querySelector('.fa-image').style.display = 'none';
                        document.getElementById('cover-status-text').innerText = '(Inheriting Landing Page cover)';
                        course.thumb = bgImage;
                    }
                }
                
                if (course.modules) {
                    window.courseModules = course.modules.map(m => ({
                        id: m.courseModuleId,
                        dbId: m.moduleId,
                        title: m.title,
                        content: m.description || '',
                        status: m.moduleStatus || 'DRAFT',
                        coverImage: m.coverImage,
                        titleFont: m.titleFont,
                        textColor: m.textColor
                    }));
                } else {
                    window.courseModules = [];
                }
                
                document.getElementById('btn-view-content-fast').style.display = 'flex';
                document.querySelector('.publish-btn').innerText = 'Save Changes';
            } else {
                window.courseModules = [];
            }
            
            updateConstructionUI();
            checkCourseSaveStatus();
        });

        function goToLandingPageBuilder() {
            // Garante que pelo menos o curso exista no array com esse ID antes de ir, ou apenas passa via URL
            window.location.href = 'builder.html?courseId=' + window.editingCourseId;
        }

        function updateConstructionUI() {
            // Verifica se tem Landing Page (via storage para este ID)
            const courses = JSON.parse(localStorage.getItem('published_courses') || '[]');
            let course = courses.find(c => String(c.id) === String(window.editingCourseId));
            
            if (window.apiCourseData && window.apiCourseData.landingPage) {
                if (!course) course = {};
                course.modular_content = true;
                course.lp_thumb = window.apiCourseData.landingPage.thumbUrl || window.apiCourseData.coverImage || '';
            }

            const lpContainer = document.getElementById('lp-action-container');
            const modContainer = document.getElementById('modules-action-container');
            
            const isSaved = window.editingCourseId && !window.editingCourseId.toString().startsWith('course_');

            if (course && course.modular_content) {
                const lpThumbHTML = course.lp_thumb 
                    ? `<div style="width:100%; height:120px; background-image:url(${course.lp_thumb}); background-size:cover; background-position:center; border-radius:8px 8px 0 0; border-bottom:1px solid #cbd5e1;"></div>`
                    : `<div style="width:100%; height:120px; background:#e2e8f0; border-radius:8px 8px 0 0; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:0.9rem;">No Cover</div>`;
                
                lpContainer.innerHTML = `
                    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; display:flex; flex-direction:column; overflow:hidden; height:100%;">
                        ${lpThumbHTML}
                        <div style="padding: 15px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                            <div>
                                <h4 style="margin:0 0 5px 0; color:#1e293b;">Custom Design</h4>
                                <p style="margin:0 0 15px 0; font-size:0.85rem; color:#166534; font-weight:bold;"><i class="fas fa-check-circle"></i> Linked Landing Page</p>
                            </div>
                            <div style="display:flex; gap:10px;">
                                <button onclick="goToLandingPageBuilder()" class="btn-outline" style="flex:1; background:white; color:#497aa7; border-color:#cbd5e1; font-size:0.8rem; padding:8px; cursor:pointer;"><i class="fas fa-edit"></i> Edit</button>
                                <button onclick="deleteLandingPage()" class="btn-outline" style="background:white; color:#ef4444; border-color:#ef4444; font-size:0.8rem; padding:8px; cursor:pointer;" title="Delete Landing Page"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                if (isSaved) {
                    lpContainer.innerHTML = `
                        <div class="action-card" onclick="goToLandingPageBuilder()" style="height: 100%; display:flex; flex-direction:column; justify-content:center;">
                            <i class="fas fa-desktop"></i>
                            <h4>Create Landing Page</h4>
                            <p>The design of your course's sales page.</p>
                        </div>
                    `;
                } else {
                    lpContainer.innerHTML = `
                        <div class="action-card" style="height: 100%; display:flex; flex-direction:column; justify-content:center; opacity: 0.6; cursor: not-allowed; background: #f1f5f9; border-color: #cbd5e1;" title="Save the course first to enable.">
                            <i class="fas fa-desktop" style="color: #94a3b8;"></i>
                            <h4 style="color: #64748b;">Create Landing Page</h4>
                            <p style="color: #94a3b8;">Save the course to enable.</p>
                        </div>
                    `;
                }
            }

            if (window.courseModules && window.courseModules.length > 0) {
                let modulesHTML = window.courseModules.map((m, index) => `
                    <div style="background:white; border:1px solid #e2e8f0; border-radius:8px; padding:10px 15px; margin-bottom:10px; display:flex; align-items:center; gap:15px; font-size:0.9rem;">
                        <span style="font-weight:bold; color:#cf982e; font-size:1.1rem;">${index + 1}</span>
                        <div>
                            <strong style="display:block; color:#1e293b;">${m.title}</strong>
                        </div>
                    </div>
                `).join('');
                
                modContainer.innerHTML = `
                    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:15px; height:100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h4 style="margin:0; color:#1e293b;">Modules (${window.courseModules.length})</h4>
                            <div style="display: flex; gap: 10px;">
                                <button onclick="openModuleManager()" style="background:none; border:none; color:#497aa7; font-weight:bold; cursor:pointer;"><i class="fas fa-cog"></i> Manage</button>
                            </div>
                        </div>
                        <div style="max-height: 250px; overflow-y: auto; padding-right:5px;">
                            ${modulesHTML}
                        </div>
                    </div>
                `;
            } else {
                if (isSaved) {
                    modContainer.innerHTML = `
                        <div class="action-card" onclick="openModuleManager()" style="height: 100%; display:flex; flex-direction:column; justify-content:center;">
                            <i class="fas fa-photo-video"></i>
                            <h4>Create Modules</h4>
                            <p>The classes and videos of the course content.</p>
                        </div>
                    `;
                } else {
                    modContainer.innerHTML = `
                        <div class="action-card" style="height: 100%; display:flex; flex-direction:column; justify-content:center; opacity: 0.6; cursor: not-allowed; background: #f1f5f9; border-color: #cbd5e1;" title="Save the course first to enable.">
                            <i class="fas fa-photo-video" style="color: #94a3b8;"></i>
                            <h4 style="color: #64748b;">Create Modules</h4>
                            <p style="color: #94a3b8;">Save the course to enable.</p>
                        </div>
                    `;
                }
            }
        }

        async function saveDraft(silent = false) {
            const title = document.getElementById('course-title').value;
            const desc = document.getElementById('course-desc').value;
            const channelId = document.getElementById('course-channel').value;
            
            if(!title && !silent) {
                alert('Please give the course a title before saving.');
                return;
            }
            if(!title && silent) return;

            try {
                let courseRes;
                if (window.editingCourseId && !window.editingCourseId.toString().startsWith('course_')) {
                    // Update
                    courseRes = await apiCall(`/courses/${window.editingCourseId}`, 'PUT', {
                        title: title,
                        description: desc,
                        status: 'DRAFT',
                        coverImage: window.courseCustomThumb || null
                    });
                } else {
                    // Create
                    courseRes = await apiCall('/courses', 'POST', {
                        title: title,
                        description: desc,
                        coverImage: window.courseCustomThumb || null
                    });
                    window.editingCourseId = courseRes.id.toString();
                    window.history.replaceState({}, '', `?id=${window.editingCourseId}`);
                }
                
                checkCourseSaveStatus();
                updateConstructionUI();
                if(!silent) alert('Draft saved successfully to the database!');
            } catch (error) {
                if(!silent) alert('Error saving draft: ' + error.message);
            }
        }

        async function publishCourse() {
            const title = document.getElementById('course-title').value;
            const desc = document.getElementById('course-desc').value;

            if(!title) {
                alert('Please give the course a title before publishing.');
                return;
            }

            try {
                if (window.editingCourseId && !window.editingCourseId.toString().startsWith('course_')) {
                    await apiCall(`/courses/${window.editingCourseId}`, 'PUT', {
                        title: title,
                        description: desc,
                        status: 'PUBLISHED',
                        coverImage: window.courseCustomThumb || null
                    });
                } else {
                    const courseRes = await apiCall('/courses', 'POST', {
                        title: title,
                        description: desc
                    });
                    window.editingCourseId = courseRes.id.toString();
                    await apiCall(`/courses/${window.editingCourseId}`, 'PUT', { status: 'PUBLISHED' });
                    window.history.replaceState({}, '', `?id=${window.editingCourseId}`);
                }
                
                checkCourseSaveStatus();
                alert('Changes saved and course published!');
                window.location.href = 'profile.html?tab=creations';
            } catch (error) {
                alert('Error publishing course: ' + error.message);
            }
        }

        function deleteLandingPage() {
            if(!confirm("Are you sure you want to unlink and delete the Landing Page of this course?")) return;
            
            const courses = JSON.parse(localStorage.getItem('published_courses') || '[]');
            const index = courses.findIndex(c => c.id === window.editingCourseId);
            
            if (index !== -1) {
                courses[index].modular_content = '';
                courses[index].compiled_content = '';
                courses[index].lp_thumb = '';
                
                // Fallback do thumb se não tiver custom thumb
                if (!courses[index].custom_thumb) {
                    courses[index].thumb = '';
                    document.getElementById('cover-preview').style.backgroundImage = 'none';
                    document.getElementById('cover-preview').querySelector('.fa-image').style.display = 'block';
                    document.getElementById('cover-status-text').innerText = '(Cover not selected)';
                }
                
                localStorage.setItem('published_courses', JSON.stringify(courses));
                updateConstructionUI();
                alert("Landing Page removed!");
            }
        }

        function handleCourseThumbUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const MAX_WIDTH = 800; // max width
                        
                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Compress as JPEG
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        
                        window.courseCustomThumb = dataUrl;
                        document.getElementById('cover-preview').style.backgroundImage = `url(${dataUrl})`;
                        document.getElementById('cover-preview').querySelector('.fa-image').style.display = 'none';
                        document.getElementById('cover-status-text').innerText = '(Custom Course Cover)';
                        
                        // Salvar o rascunho automaticamente para não perder a capa
                        saveDraft(true); // true = silent save
                    };
                    img.src = e.result;
                };
                reader.readAsDataURL(file);
            }
        }

        async function loadCoEditors(courseId) {
            try {
                const res = await fetch(`/api/courses/${courseId}/editors`, {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                });
                if (res.ok) {
                    const editors = await res.json();
                    const list = document.getElementById('editors-list');
                    list.innerHTML = '';
                    editors.forEach(e => {
                        list.innerHTML += `
                            <li style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:10px; border-radius:6px; margin-bottom:8px;">
                                <span>${e.user.profile?.displayName || e.user.username} (${e.user.email})</span>
                                <button type="button" onclick="removeCoEditor(${e.userId})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
                            </li>
                        `;
                    });
                }
            } catch (err) {
                console.error(err);
            }
        }

        let searchTimeout;
        async function searchUsersForRole(query, roleType) {
            const resultsDiv = document.getElementById(`${roleType}-search-results`);
            if (!query || query.length < 2) {
                resultsDiv.style.display = 'none';
                return;
            }
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const users = data.data?.users || data.users || [];
                        if (users.length > 0) {
                            resultsDiv.innerHTML = users.map(u => `
                                <div style="padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #f1f5f9; display:flex; flex-direction:column;" onclick="selectUserForRole('${roleType}', ${u.id}, '${u.username}')">
                                    <span style="font-weight: 600;">${u.username}</span>
                                    <span style="font-size: 12px; color: #64748b;">${u.email}</span>
                                </div>
                            `).join('');
                            resultsDiv.style.display = 'block';
                        } else {
                            resultsDiv.innerHTML = '<div style="padding: 10px 15px; color: #94a3b8;">No users found.</div>';
                            resultsDiv.style.display = 'block';
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }, 300);
        }

        function selectUserForRole(roleType, userId, username) {
            document.getElementById(`new-${roleType}-search`).value = username;
            document.getElementById(`${roleType}-search-results`).style.display = 'none';
            if (roleType === 'editor') {
                addCoEditor(userId);
            } else if (roleType === 'student') {
                inviteStudent(userId);
            }
        }

        async function addCoEditor(userId) {
            if (!userId) return;
            try {
                const res = await fetch(`/api/courses/${window.editingCourseId}/editors`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId })
                });
                if (res.ok) {
                    document.getElementById('new-editor-search').value = '';
                    loadCoEditors(window.editingCourseId);
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to add editor');
                }
            } catch (err) {
                console.error(err);
                alert('Error adding editor');
            }
        }

        async function inviteStudent(userId) {
            if (!userId) return;
            try {
                const res = await fetch(`/api/courses/${window.editingCourseId}/enrollments`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId })
                });
                if (res.ok) {
                    document.getElementById('new-student-search').value = '';
                    loadStudents(window.editingCourseId);
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to invite student');
                }
            } catch (err) {
                console.error(err);
                alert('Error inviting student');
            }
        }

        async function loadStudents(courseId) {
            // we will implement a fetch to get enrollments later if there's an API. For now, it will just notify.
        }

        async function removeCoEditor(userId) {
            if (!confirm('Are you sure you want to remove this editor?')) return;
            try {
                const res = await fetch(`/api/courses/${window.editingCourseId}/editors/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                });
                if (res.ok) {
                    loadCoEditors(window.editingCourseId);
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to remove editor');
                }
            } catch (err) {
                console.error(err);
                alert('Error removing editor');
            }
        }
    

