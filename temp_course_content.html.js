
        function toggleModule(id) {
            const content = document.getElementById('content-' + id);
            const icon = document.getElementById('icon-' + id);
            const isVisible = content.style.display === 'block';
            
            content.style.display = isVisible ? 'none' : 'block';
            icon.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        }

        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const courseId = urlParams.get('id');
            const container = document.getElementById('course-content-root');

            if (!courseId) {
                container.innerHTML = '<div class="empty-state">Course ID not found.</div>';
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                container.innerHTML = '<div class="empty-state">Please log in to view this course.</div>';
                return;
            }

            Promise.all([
                fetch(`/api/profile/me`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
                fetch(`/courses/${courseId}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => {
                    if (!res.ok) throw new Error('Course not found');
                    return res.json();
                })
            ])
            .then(([profileData, courseData]) => {
                const actualProfileData = profileData.data || profileData;
                const currentUser = actualProfileData.user || {};
                const course = courseData.data || courseData;
                
                if (!course) {
                    container.innerHTML = '<div class="empty-state">Course not found.</div>';
                    return;
                }

                // Handle modules format from DB or Local
                const rawModules = course.modules || (course.courseModules ? course.courseModules.map(cm => cm.module) : []);
                const modules = rawModules.map((m, i) => ({
                    id: m.courseModuleId || m.id,
                    title: m.title || `Module ${i+1}`,
                    content: m.description || m.content || 'No description available for this module.',
                    coverImage: m.coverImage || 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&q=80&w=800',
                    titleFont: m.titleFont || 'inherit',
                    textColor: m.textColor || '#ffffff'
                }));

                let modulesHTML = '';
                if (modules.length === 0) {
                    modulesHTML = `
                        <div class="empty-state" style="grid-column: 1 / -1;">
                            <i class="fas fa-book-open" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 20px; display: block;"></i>
                            <p style="color: #64748b;">This course does not have content modules yet.</p>
                            <a href="course_builder.html?id=${course.id}" style="color: #cf9c33; font-weight: bold; text-decoration: none;">Add modules now</a>
                        </div>
                    `;
                } else {
                    modulesHTML = `<div class="modules-grid">`;
                    modules.forEach(m => {
                        modulesHTML += `
                            <div class="module-card" onclick="alert('Module access flow to be implemented')">
                                <div class="module-cover" style="background-image: url('${m.coverImage}');"></div>
                                <div class="module-overlay">
                                    <h3 class="module-title" style="font-family: ${m.titleFont}; color: ${m.textColor};">${m.title}</h3>
                                    <p class="module-desc">${m.content}</p>
                                </div>
                            </div>
                        `;
                    });
                    modulesHTML += `</div>`;
                }

                // Inject custom CSS if exists
                if (course.contentCss) {
                    const style = document.createElement('style');
                    style.innerHTML = course.contentCss;
                    document.head.appendChild(style);
                }

                // Check if current user is owner or editor via the backend flag
                const isOwnerOrEditor = course.canManage === true;

                const editSettingsButtonHTML = isOwnerOrEditor ? `
                    <div style="position: absolute; right: 20px; top: 20px; z-index: 100;">
                        <button onclick="window.location.href='content_builder.html?courseId=${course.id}'" style="background:rgba(255,255,255,0.2); color:white; border:none; padding:8px 15px; border-radius:30px; cursor:pointer; font-weight:bold; transition:0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" onmouseover="this.style.background='white'; this.style.color='#1e293b'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'"><i class="fas fa-edit"></i> Editar Configurações</button>
                    </div>
                ` : '';

                // If the course has a custom design, use it and append modules at the bottom
                if (course.contentHtml) {
                    let finalHtml = course.contentHtml;
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = finalHtml;
                    
                    const modSec = tempDiv.querySelector('#course-modules-section');
                    const coursesPlaceholder = tempDiv.querySelector('#courses-placeholder');
                    
                    if (coursesPlaceholder) {
                        coursesPlaceholder.innerHTML = modulesHTML;
                        
                        // Setup placeholders for AI fetching
                        const statsBlock = tempDiv.querySelector('.stat-block h3');
                        if (statsBlock) {
                            statsBlock.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                            const p = statsBlock.nextElementSibling;
                            if (p) p.innerText = 'Calculating AI Insights...';
                        }
                        
                        finalHtml = tempDiv.innerHTML;
                    } else if (modSec) {
                        modSec.style.flex = "1";
                        modSec.innerHTML = `
                            <div style="width: 100%; max-width: 1200px; margin: 0 auto;">
                                <h2 style="color: #1e293b; display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                                    <i class="fas fa-th-large" style="color: #cf9c33;"></i> Course Modules 
                                </h2>
                                ${modulesHTML}
                            </div>
                        `;
                        finalHtml = tempDiv.innerHTML;
                    } else {
                        finalHtml += `
                            <main class="main-content" style="max-width: 1200px; margin: 40px auto; padding: 0 40px;">
                                <h2 class="section-title"><i class="fas fa-th-large" style="color: #cf9c33;"></i> Course Modules</h2>
                                ${modulesHTML}
                            </main>
                        `;
                    }
                    
                    container.innerHTML = `
                        <div id="custom-design-container">
                            <div style="position: absolute; left: 20px; top: 20px; z-index: 100;">
                                <button onclick="window.location.href='profile.html?tab=creations'" style="background:rgba(0,0,0,0.5); color:white; border:1px solid rgba(255,255,255,0.2); padding:8px 15px; border-radius:30px; cursor:pointer; font-weight:bold; transition:0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); backdrop-filter: blur(5px);" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'" onmouseout="this.style.background='rgba(0,0,0,0.5)'; this.style.color='white'"><i class="fas fa-arrow-left"></i> Voltar</button>
                            </div>
                            ${editSettingsButtonHTML}
                            ${finalHtml}
                        </div>
                    `;
                } else {                     // Fallback to default template layout (AGENFOR layout)
                    container.innerHTML = `
                        <div id="custom-design-container" style="font-family: 'Inter', sans-serif; background-color: #f8fafc; min-height: 100vh;">
                            <div style="position: absolute; left: 20px; top: 20px; z-index: 100;">
                                <button onclick="window.location.href='profile.html?tab=creations'" style="background:rgba(0,0,0,0.5); color:white; border:1px solid rgba(255,255,255,0.2); padding:8px 15px; border-radius:30px; cursor:pointer; font-weight:bold; transition:0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); backdrop-filter: blur(5px);" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'" onmouseout="this.style.background='rgba(0,0,0,0.5)'; this.style.color='white'"><i class="fas fa-arrow-left"></i> Voltar</button>
                            </div>
                            ${editSettingsButtonHTML}
                            
                            <!-- Nav -->
                            <nav style="background-color: #cf9c33; padding: 15px 40px; display: flex; align-items: center; justify-content: flex-end; height: 60px;">
                                <div style="position: absolute; left: 40px; display:flex; align-items:center; gap:15px; color:white; font-weight:bold; font-size:1.2rem;">
                                    <i class="fas fa-globe"></i> AGENFOR
                                </div>
                            </nav>
                            
                            <!-- Header -->
                            <header style="background: white; padding: 60px 40px; border-bottom: 1px solid #e2e8f0;">
                                <div style="max-width: 1200px; margin: 0 auto;">
                                    <h1 style="color: #1e293b; font-size: 2.8rem; margin: 0; font-weight: 800;">${course.title || 'Advanced Virtual Academy'}</h1>
                                    <h2 style="color: #cf9c33; font-size: 1.5rem; margin: 10px 0;">AVA</h2>
                                    <p style="color: #64748b; font-size: 1.1rem; max-width: 800px; line-height: 1.6; font-weight: 600;">${course.description || "To deliver trainings in a virtual ecosystem to empower public institutions, organisations and professionals with the skills and expertise needed to navigate today's complex challenges."}</p>
                                </div>
                            </header>

                            <!-- Main Content -->
                            <main style="max-width: 1200px; margin: 0 auto; padding: 40px;">
                                <div style="display: flex; gap: 40px; flex-wrap: wrap;">
                                    <!-- Modules Grid -->
                                    <div style="flex: 3; min-width: 300px;">
                                        <h2 style="color: #1e293b; display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                                            <i class="fas fa-layer-group" style="color: #cf9c33;"></i> Módulos do Curso
                                        </h2>
                                        ${modulesHTML}
                                    </div>
                                    
                                    <!-- Methodology Sidebar -->
                                    <div style="flex: 1; min-width: 300px;">
                                        <div style="border: 2px solid #cf9c33; border-radius: 12px; padding: 25px; background: white;">
                                            <h3 style="color: #cf9c33; margin-top: 0; font-size: 1.2rem; font-weight: bold; margin-bottom: 20px;">NOSSA METODOLOGIA</h3>
                                            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; color: #1e293b; font-size: 0.9rem; font-weight: 600;">
                                                <li style="display:flex; gap:10px;"><i class="fas fa-circle" style="font-size:0.5rem; margin-top:6px; color:#cf9c33;"></i> AVA is an advanced training platform that supports blended courses to enhance participants knowledge retention.</li>
                                                <li style="display:flex; gap:10px;"><i class="fas fa-circle" style="font-size:0.5rem; margin-top:6px; color:#cf9c33;"></i> AVA is trained as legal.</li>
                                                <li style="display:flex; gap:10px;"><i class="fas fa-circle" style="font-size:0.5rem; margin-top:6px; color:#cf9c33;"></i> Assessment of trainees' expectations and needs.</li>
                                                <li style="display:flex; gap:10px;"><i class="fas fa-circle" style="font-size:0.5rem; margin-top:6px; color:#cf9c33;"></i> Design training plans and curricula.</li>
                                                <li style="display:flex; gap:10px;"><i class="fas fa-circle" style="font-size:0.5rem; margin-top:6px; color:#cf9c33;"></i> Design online training.</li>
                                                <li style="display:flex; gap:10px;"><i class="fas fa-circle" style="font-size:0.5rem; margin-top:6px; color:#cf9c33;"></i> Layout on-the-job training.</li>
                                                <li style="display:flex; gap:10px;"><i class="fas fa-circle" style="font-size:0.5rem; margin-top:6px; color:#cf9c33;"></i> Record video-based training.</li>
                                                <li style="display:flex; gap:10px;"><i class="fas fa-circle" style="font-size:0.5rem; margin-top:6px; color:#cf9c33;"></i> Support to Q&A through avatars.</li>
                                                <li style="display:flex; gap:10px;"><i class="fas fa-circle" style="font-size:0.5rem; margin-top:6px; color:#cf9c33;"></i> Build case studies, scenarios and simulation.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </main>

                            <!-- Footer -->
                            <footer style="background: linear-gradient(to right, #1e293b 0%, #cf9c33 100%); padding: 40px; color: white; margin-top: 40px;">
                                <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px;">
                                    <div style="flex: 1; min-width: 250px;">
                                        <h3 style="color: white; margin-top: 0; font-size:1.2rem;">Sobre Nós</h3>
                                        <p style="font-size: 0.9rem; opacity: 0.9; line-height:1.6;">Somos uma instituição dedicada a entregar o melhor conteúdo educacional. Nosso foco é democratizar o conhecimento através da tecnologia aberta.</p>
                                    </div>
                                    <div style="flex: 1; min-width: 250px;">
                                        <h3 style="color: white; margin-top: 0; font-size:1.2rem;">Contato</h3>
                                        <p style="font-size: 0.9rem; opacity: 0.9; line-height:1.6;">Email: contato@exemplo.com<br>Telefone: (11) 9999-9999<br>Endereço: Avenida Principal, 1000 - Centro</p>
                                    </div>
                                    <div style="flex: 1; min-width: 250px;">
                                        <h3 style="color: white; margin-top: 0; font-size:1.2rem;">Parceiros</h3>
                                        <div style="display: flex; gap: 10px;">
                                            <div style="background: white; padding: 8px 20px; border-radius: 4px; color: #1e293b; font-weight: bold; font-size: 0.8rem;">Logo 1</div>
                                            <div style="background: white; padding: 8px 20px; border-radius: 4px; color: #1e293b; font-weight: bold; font-size: 0.8rem;">Logo 2</div>
                                            <div style="background: white; padding: 8px 20px; border-radius: 4px; color: #1e293b; font-weight: bold; font-size: 0.8rem;">Logo 3</div>
                                        </div>
                                    </div>
                                </div>
                            </footer>
                        </div>
                    `;
                }

                // Fetch AI Insights dynamically after rendering
                if (course.contentHtml && course.contentHtml.includes('courses-placeholder')) {
                    fetch(`/api/courses/${courseId}/insights`, { headers: { 'Authorization': `Bearer ${token}` } })
                    .then(res => res.json())
                    .then(insights => {
                        // Update Performance Dashboard
                        const statBlocks = document.querySelectorAll('#custom-design-container .stat-block');
                        if (statBlocks.length > 0 && insights.stats) {
                            statBlocks[0].innerHTML = `
                                <h3 style="margin:0; font-size:1.8rem; color:#cf9c33;">${insights.stats.completedModules}</h3>
                                <p style="margin:5px 0 0 0; font-size:0.9rem; opacity:0.8;">Módulos Concluídos</p>
                            `;
                        }
                        if (statBlocks.length > 1 && insights.stats) {
                            statBlocks[1].innerHTML = `
                                <h3 style="margin:0; font-size:1.8rem; color:#cf9c33;">${insights.stats.averageScore}</h3>
                                <p style="margin:5px 0 0 0; font-size:0.9rem; opacity:0.8;">Média de Notas - ${insights.stats.status}</p>
                            `;
                        }

                        // Update Reminders
                        const tasksList = document.querySelector('#custom-design-container ul');
                        if (tasksList && insights.reminders) {
                            tasksList.innerHTML = insights.reminders.map(r => `
                                <li style="display:flex; align-items:flex-start; gap:10px;">
                                    <i class="fas fa-exclamation-circle" style="color:#cf9c33; margin-top:3px;"></i>
                                    <div><p style="margin:0; font-size:0.9rem;">${r}</p></div>
                                </li>
                            `).join('');
                        }

                        // Update News / Tips
                        const newsContainer = document.querySelectorAll('#custom-design-container .glass-panel')[2];
                        if (newsContainer && insights.news) {
                            const newsHTML = insights.news.map(n => `
                                <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                                    <span style="font-size:0.75rem; color:#cf9c33;">${n.date}</span>
                                    <p style="margin:5px 0 0 0; font-size:0.9rem;">${n.title}</p>
                                </div>
                            `).join('');
                            
                            // Replace existing news items keeping the title intact
                            const titleHtml = `<h3 style="margin-top:0; color:#cf9c33; font-size:1.1rem; margin-bottom:15px; display:flex; align-items:center; gap:8px;"><i class="fas fa-bullhorn"></i> Dicas da IA</h3>`;
                            newsContainer.innerHTML = titleHtml + `<div style="display:flex; flex-direction:column; gap:15px;">${newsHTML}</div>`;
                        }
                    })
                    .catch(err => console.error("Failed to fetch AI Insights", err));
                }
            })
            .catch(err => {
                // Tenta carregar do localStorage como fallback para testes antigos
                const courses = JSON.parse(localStorage.getItem('published_courses') || '[]');
                const course = courses.find(c => String(c.id) === String(courseId));
                
                if (course) {
                    // Copiar o mesmo código de renderização do then(...)
                        const modules = course.modules || [];
                        let modulesHTML = '';
                        if (modules.length === 0) {
                            modulesHTML = `
                                <div class="empty-state" style="grid-column: 1 / -1;">
                                    <i class="fas fa-book-open" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 20px; display: block;"></i>
                                    <p style="color: #64748b;">This course does not have content modules yet.</p>
                                    <a href="course_builder.html?id=${course.id}" style="color: #cf9c33; font-weight: bold; text-decoration: none;">Add modules now</a>
                                </div>
                            `;
                        } else {
                            modulesHTML = `<div class="modules-grid">`;
                            modules.forEach((m, i) => {
                                const mTitle = m.title || `Module ${i+1}`;
                                const mDesc = m.description || m.content || 'No description';
                                const mCover = m.coverImage || 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&q=80&w=800';
                                modulesHTML += `
                                    <div class="module-card">
                                        <div class="module-cover" style="background-image: url('${mCover}');"></div>
                                        <div class="module-overlay">
                                            <h3 class="module-title">${mTitle}</h3>
                                            <p class="module-desc">${mDesc}</p>
                                        </div>
                                    </div>
                                `;
                            });
                            modulesHTML += `</div>`;
                        }
                        container.innerHTML = `
                        <header class="course-header" style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="flex:1;">
                                <a href="profile.html?tab=creations" class="back-link"><i class="fas fa-arrow-left"></i> Back to my creations</a>
                                <div class="course-info">
                                    <h1>${course.title} (Local)</h1>
                                    <p>${course.description || 'This course offers structured content for your professional development.'}</p>
                                </div>
                            </div>
                            <button onclick="window.location.href='course_builder.html?id=${course.id}'" style="display:${isOwnerOrEditor ? 'flex' : 'none'}; background:rgba(255,255,255,0.2); color:white; border:1px solid rgba(255,255,255,0.4); padding:12px 25px; border-radius:30px; font-weight:bold; cursor:pointer; align-items:center; gap:10px; transition:0.3s;">
                                <i class="fas fa-edit"></i> Edit Course
                            </button>
                        </header>
                        <main class="main-content">
                            <h2 class="section-title"><i class="fas fa-list-ul" style="color: #cf9c33;"></i> Course Content (${modules.length} modules)</h2>
                            ${modulesHTML}
                        </main>
                    `;
                } else {
                    container.innerHTML = '<div class="empty-state">Course not found (API failed and not in Local Storage).</div>';
                }
            });
        });
    
