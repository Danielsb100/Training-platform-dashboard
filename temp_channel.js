
        let apiCourses = []; // Cache from DB

        async function fetchMyCourses() {
            if (apiCourses.length > 0) return apiCourses;
            const token = localStorage.getItem('token');
            if (!token) return [];
            try {
                const res = await fetch('/courses/my', { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                if (res.ok) apiCourses = Array.isArray(data) ? data : (data.data || []);
            } catch(e) { console.error('Erro fetching courses', e); }
            return apiCourses;
        }

        async function openLinkModal() {
            const modal = document.getElementById('link-course-modal');
            const grid = document.getElementById('available-courses-grid');
            const urlParams = new URLSearchParams(window.location.search);
            const channelId = urlParams.get('id');
            
            const channels = JSON.parse(localStorage.getItem('my_channels') || '[]');
            const channel = channels.find(c => c.id === channelId);
            const linkedIds = channel && channel.linkedCourses ? channel.linkedCourses : [];
            
            const courses = await fetchMyCourses();
            const available = courses.filter(c => !linkedIds.includes(c.id.toString()));
            
            if (available.length === 0) {
                grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:40px; color:#64748b;">Você não tem outros cursos disponíveis para vincular.</p>';
            } else {
                grid.innerHTML = '';
                available.forEach(course => {
                    const card = document.createElement('div');
                    card.style.border = '1px solid #e2e8f0';
                    card.style.borderRadius = '10px';
                    card.style.overflow = 'hidden';
                    card.innerHTML = `
                        <div style="height:100px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:2rem; overflow:hidden;">
                            ${course.coverImage || course.thumbnailUrl ? `<img src="${course.coverImage || course.thumbnailUrl}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-image"></i>`}
                        </div>
                        <div style="padding:15px;">
                            <h4 style="margin:0; font-size:0.9rem; color:#1e293b; height:2.4rem; overflow:hidden;">${course.title}</h4>
                            <button onclick="linkCourseToChannel('${course.id}')" style="width:100%; margin-top:10px; padding:8px; background:#497aa7; color:white; border:none; border-radius:4px; font-size:0.8rem; font-weight:bold; cursor:pointer;">Vincular</button>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            }
            
            modal.style.display = 'flex';
        }

        function closeLinkModal() {
            document.getElementById('link-course-modal').style.display = 'none';
        }

        function linkCourseToChannel(courseId) {
            const urlParams = new URLSearchParams(window.location.search);
            const channelId = urlParams.get('id');
            let channels = JSON.parse(localStorage.getItem('my_channels') || '[]');
            const index = channels.findIndex(c => c.id === channelId);
            
            if (index !== -1) {
                if(!channels[index].linkedCourses) channels[index].linkedCourses = [];
                if(!channels[index].linkedCourses.includes(courseId.toString())) {
                    channels[index].linkedCourses.push(courseId.toString());
                    localStorage.setItem('my_channels', JSON.stringify(channels));
                }
                location.reload();
            }
        }

        function deleteChannel() {
            if(!confirm("Tem certeza que deseja excluir este canal? Os cursos não serão apagados.")) return;
            const urlParams = new URLSearchParams(window.location.search);
            const channelId = urlParams.get('id');
            let channels = JSON.parse(localStorage.getItem('my_channels') || '[]');
            channels = channels.filter(c => c.id !== channelId);
            localStorage.setItem('my_channels', JSON.stringify(channels));
            
            window.location.href = 'profile.html?tab=creations';
        }

        function unlinkCourse(courseId) {
            if(!confirm("Desvincular este curso do canal?")) return;
            const urlParams = new URLSearchParams(window.location.search);
            const channelId = urlParams.get('id');
            let channels = JSON.parse(localStorage.getItem('my_channels') || '[]');
            const index = channels.findIndex(c => c.id === channelId);
            if (index !== -1 && channels[index].linkedCourses) {
                channels[index].linkedCourses = channels[index].linkedCourses.filter(id => id !== courseId.toString());
                localStorage.setItem('my_channels', JSON.stringify(channels));
                location.reload();
            }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const channelId = urlParams.get('id');
            const container = document.getElementById('channel-content');

            if (!channelId) {
                container.innerHTML = '<div class="empty-state">ID do canal não encontrado.</div>';
                return;
            }

            let channels = JSON.parse(localStorage.getItem('my_channels') || '[]');
            
            // Migration: Ensure all channels have linkedCourses
            let needsMigration = false;
            channels.forEach(ch => {
                if (!ch.linkedCourses) {
                    ch.linkedCourses = [];
                    const legacyCourses = JSON.parse(localStorage.getItem('published_courses') || '[]');
                    legacyCourses.forEach(lc => {
                        if (lc.channelId === ch.id) ch.linkedCourses.push(lc.id.toString());
                    });
                    needsMigration = true;
                }
            });
            if (needsMigration) localStorage.setItem('my_channels', JSON.stringify(channels));
            
            const channel = channels.find(c => c.id === channelId);
            
            if (!channel) {
                container.innerHTML = '<div class="empty-state">Canal não encontrado.</div>';
                return;
            }

            const courses = await fetchMyCourses();
            const channelCourses = courses.filter(c => channel.linkedCourses.includes(c.id.toString()));

            const isPublic = urlParams.get('view') === 'public';

            let coursesHTML = '';
            if (channelCourses.length === 0) {
                coursesHTML = `
                    <div class="empty-state">
                        <i class="fas fa-layer-group" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 20px; display: block;"></i>
                        <p style="color: #64748b;">Este canal ainda não possui cursos vinculados.</p>
                        ${!isPublic ? '<button onclick="openLinkModal()" style="background:none; border:none; color: #cf9c33; font-weight: bold; cursor:pointer; font-size:1rem;">Vincular um curso agora</button>' : ''}
                    </div>
                `;
            } else {
                coursesHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                        <h2 class="section-title" style="margin:0;"><i class="fas fa-graduation-cap" style="color: #cf9c33;"></i> Cursos no Canal (${channelCourses.length})</h2>
                        ${!isPublic ? '<button onclick="openLinkModal()" style="padding:10px 20px; border-radius:30px; background:#497aa7; color:white; border:none; font-weight:bold; cursor:pointer;"><i class="fas fa-plus"></i> Vincular Mais</button>' : ''}
                    </div>
                    <div class="courses-grid">
                `;
                channelCourses.forEach(course => {
                    const thumbHtml = course.coverImage || course.thumbnailUrl || course.custom_thumb 
                        ? `<div class="course-thumb" style="background-image:url(${course.coverImage || course.thumbnailUrl || course.custom_thumb}); background-size:cover; background-position:center;"></div>`
                        : `<div class="course-thumb" style="background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:3rem;"><i class="fas fa-image"></i></div>`;
                    
                    const courseLink = isPublic ? `viewer.html?id=${course.id}` : `course_content.html?id=${course.id}`;
                    
                    coursesHTML += `
                        <div class="course-card" style="position:relative;">
                            ${thumbHtml}
                            <div class="course-body">
                                <h4>${course.title}</h4>
                                <p>${course.description || 'Sem descrição'}</p>
                                <div style="display:flex; gap:10px;">
                                    <a href="${courseLink}" class="btn-view">Ver Conteúdo</a>
                                    ${!isPublic ? `<button onclick="unlinkCourse('${course.id}')" style="padding:10px; border-radius:6px; background:#fee2e2; color:#ef4444; border:none; cursor:pointer;" title="Desvincular"><i class="fas fa-unlink"></i></button>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
                coursesHTML += '</div>';
            }

            const backLinkHtml = isPublic 
                ? '<a href="index.html" class="back-link"><i class="fas fa-home"></i> Voltar para Home</a>'
                : '<a href="profile.html?tab=creations" class="back-link"><i class="fas fa-arrow-left"></i> Voltar para minhas criações</a>';
                
            const editBtnHtml = isPublic ? '' : `<button onclick="window.location.href='builder.html?channelId=${channel.id}'" style="background:rgba(255,255,255,0.2); color:white; border:none; padding:8px 15px; border-radius:30px; cursor:pointer; font-weight:bold; transition:0.3s;" onmouseover="this.style.background='white'; this.style.color='#1e293b'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'"><i class="fas fa-edit"></i> Editar Configurações</button>`;
            
            const dangerZoneHtml = isPublic ? '' : `
                <div style="margin-top:100px; padding-top:40px; border-top:1px solid #e2e8f0; text-align:center;">
                    <h3 style="color:#ef4444; margin-bottom:10px;">Zona de Perigo</h3>
                    <p style="color:#64748b; margin-bottom:20px; font-size:0.9rem;">Ao excluir o canal, você não perde os cursos, eles apenas deixam de estar agrupados.</p>
                    <button onclick="deleteChannel()" style="padding:12px 25px; background:none; border:2px solid #ef4444; color:#ef4444; border-radius:30px; font-weight:bold; cursor:pointer; transition:0.3s;" onmouseover="this.style.background='#ef4444'; this.style.color='white'" onmouseout="this.style.background='none'; this.style.color='#ef4444'"><i class="fas fa-trash"></i> Excluir este Canal</button>
                </div>
            `;

            if (channel.compiled_content) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = channel.compiled_content;
                
                const placeholder = tempDiv.querySelector('#courses-placeholder');
                if (placeholder) {
                    placeholder.innerHTML = `<div style="margin-top:-20px;">${coursesHTML}</div>`;
                    placeholder.style.padding = '0';
                    placeholder.style.border = 'none';
                    placeholder.style.background = 'transparent';
                } else {
                    tempDiv.innerHTML += `<main class="main-content">${coursesHTML}</main>`;
                }

                if (dangerZoneHtml) {
                    tempDiv.innerHTML += `<div class="main-content" style="padding-top:0;">${dangerZoneHtml}</div>`;
                }

                container.innerHTML = `
                    <div style="position:relative;">
                        <div style="position:absolute; top:20px; left:20px; z-index:100; display:flex; justify-content:space-between; width:calc(100% - 40px); pointer-events:none;">
                            <div style="pointer-events:auto;">${backLinkHtml}</div>
                            <div style="pointer-events:auto;">${editBtnHtml}</div>
                        </div>
                        ${tempDiv.innerHTML}
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; min-height: 100vh;">
                        <!-- Nav -->
                        <nav style="background-color: #cf9c33; padding: 15px 40px; display: flex; align-items: center; justify-content: space-between;">
                            <div style="display:flex; align-items:center; gap:15px; color:white; font-weight:bold; font-size:1.2rem;">
                                <i class="fas fa-globe"></i> AGENFOR
                            </div>
                            <div style="display:flex; gap:15px;">
                                ${backLinkHtml}
                                ${editBtnHtml}
                            </div>
                        </nav>
                        
                        <!-- Header -->
                        <header style="background: white; padding: 60px 40px; border-bottom: 1px solid #e2e8f0;">
                            <div style="max-width: 1200px; margin: 0 auto;">
                                <h1 style="color: #1e293b; font-size: 2.8rem; margin: 0; font-weight: 800;">${channel.name || 'Advanced Virtual Academy'}</h1>
                                <h2 style="color: #cf9c33; font-size: 1.5rem; margin: 10px 0;">AVA</h2>
                                <p style="color: #64748b; font-size: 1.1rem; max-width: 800px; line-height: 1.6; font-weight: 600;">${channel.description || "To deliver trainings in a virtual ecosystem to empower public institutions, organisations and professionals with the skills and expertise needed to navigate today's complex challenges."}</p>
                            </div>
                        </header>

                        <!-- Main Content -->
                        <main style="max-width: 1200px; margin: 0 auto; padding: 40px;">
                            <div style="display: flex; gap: 40px; flex-wrap: wrap;">
                                <!-- Courses Grid -->
                                <div style="flex: 3; min-width: 300px;">
                                    ${coursesHTML}
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
                            
                            ${dangerZoneHtml}
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
        });
    