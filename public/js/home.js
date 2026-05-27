document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // UI Elements
    const sideNav = document.querySelector('.side-nav');
    const loginBtn = document.getElementById('nav-login-btn');
    const userAvatarBtn = document.getElementById('nav-user-avatar');
    const coursesGrid = document.getElementById('courses-grid');
    const logoutBtn = document.querySelector('.nav-item.logout');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/';
        });
    }
    
    // --- 1. Auth State Management ---
    if (!token) {
        // Guest mode
        if (sideNav) sideNav.style.display = 'none';
        if (userAvatarBtn) userAvatarBtn.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        
        // Adjust main content margin since sidebar is gone
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.marginLeft = '0';
        }
    } else {
        // Logged In mode
        if (sideNav) sideNav.style.display = 'flex'; // It's flex in CSS
        if (loginBtn) loginBtn.style.display = 'none';
        if (userAvatarBtn) userAvatarBtn.style.display = 'flex';
        
        // Check cache first for immediate render
        const cachedProfileImg = sessionStorage.getItem('cached_profile_img');
        if (cachedProfileImg) {
            userAvatarBtn.innerHTML = `<img src="${cachedProfileImg}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            userAvatarBtn.style.border = '2px solid rgba(255,255,255,0.2)';
        }

        // Fetch User Profile for Avatar in background
        fetch('/api/profile/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(profileData => {
            const actualData = profileData.data || profileData;
            const user = actualData.user || {};
            const roles = user.roles || [];
            const photoUrl = user.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
            
            if (photoUrl !== cachedProfileImg) {
                sessionStorage.setItem('cached_profile_img', photoUrl);
                userAvatarBtn.innerHTML = `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                userAvatarBtn.style.border = '2px solid rgba(255,255,255,0.2)';
            }

            // Hide/Show navigation buttons based on role
            const navCreations = document.getElementById('nav-creations');
            const navStudents = document.getElementById('nav-students');
            const navUsers = document.getElementById('nav-users');

            if (navCreations) {
                const canCreate = roles.some(r => ['TEACHER', 'TUTOR', 'BUSINESS_MENTOR', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN'].includes(r)) || ['MASTER', 'ADMIN'].includes(user?.role);
                if (canCreate) {
                    navCreations.style.display = 'flex';
                }
            }

            const canManageStudents = roles.some(r => ['TEACHER', 'TUTOR', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN'].includes(r)) || ['MASTER', 'ADMIN'].includes(user?.role);
            if (navStudents && canManageStudents) {
                navStudents.style.display = 'flex';
            }

            if (user?.role === 'MASTER') {
                if (navUsers) navUsers.style.display = 'flex';
                if (typeof window.enableMasterControls === 'function') {
                    window.enableMasterControls();
                }
            }
        })
        .catch(err => console.error('Failed to fetch profile', err));
    }

    // --- 2. Render Utilities ---
    function renderCourseCard(course) {
        let thumbUrl = course.coverImage || course.landingPage?.thumbUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

        const rating = (Math.random() * (5 - 4) + 4).toFixed(1); // Mocado por enquanto
        const clickAction = course.externalUrl 
            ? `window.open('${course.externalUrl}', '_blank')`
            : `window.location.href='viewer.html?id=${course.id}'`;
        
        const defaultDesc = window.t ? window.t('marketplace.exploreDescription', 'Explore this amazing course inside our platform to improve your skills.') : 'Explore this amazing course inside our platform to improve your skills.';
        const description = course.description ? course.description.substring(0, 80) + '...' : defaultDesc;

        return `
            <div class="course-card" style="cursor: pointer; display: flex; flex-direction: column;" onclick="${clickAction}">
                <img src="${thumbUrl}" alt="Thumbnail" class="course-thumb" style="width: 100%; object-fit: cover; border-bottom: 1px solid #e2e8f0; height: 180px;">
                <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                    <h3 class="course-title" style="margin-top:0;">${course.title}</h3>

                    <p style="font-size: 0.9rem; color: #475569; margin-bottom: 15px; line-height: 1.4; flex: 1;">${description}</p>
                    <div class="course-meta" style="margin-top: auto; margin-bottom: 15px;">
                        <div class="rating"><i class="fas fa-star" style="color: #cf982e;"></i> ${rating}</div>
                    </div>
                    <button class="btn-outline" style="width:100%; margin-top:0; pointer-events: none;">${window.t ? window.t('marketplace.viewCourseDetails', 'VIEW COURSE DETAILS') : 'VIEW COURSE DETAILS'}</button>
                </div>
            </div>
        `;
    }

    // Default mock courses for visual fallback
    const mockCourses = [
        { id: 'mock_1', title: 'Mastering Technology Labs', thumbUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80' },
        { id: 'mock_2', title: 'Law Conteroom Basics', thumbUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80' },
        { id: 'mock_3', title: 'Digital Investigations', thumbUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80' }
    ];

    // --- 3. Load Courses from API ---
    // Check cache first for immediate render
    const cachedCoursesHtml = sessionStorage.getItem('cached_public_courses_html');
    if (cachedCoursesHtml && coursesGrid) {
        coursesGrid.innerHTML = cachedCoursesHtml;
    }

    fetch('/courses/public')
        .then(res => res.json())
        .then(publicCourses => {
            let html = '';
            if (Array.isArray(publicCourses) && publicCourses.length > 0) {
                publicCourses.forEach(course => {
                    const courseHtml = renderCourseCard(course);
                    if (coursesGrid) coursesGrid.insertAdjacentHTML('beforeend', courseHtml);
                    html += courseHtml;
                });
                if (window.applyTranslations && coursesGrid) window.applyTranslations(coursesGrid);
            } else {
                // Fallback to mocks if no courses are published yet
                mockCourses.forEach(mock => {
                    html += renderCourseCard({
                        id: mock.id,
                        title: mock.title,
                        coverImage: mock.thumbUrl,
                        instructor: 'Plataforma Training'
                    });
                });
            }
            
            // Only update DOM and cache if the content changed
            if (coursesGrid && html !== cachedCoursesHtml) {
                coursesGrid.innerHTML = html;
                sessionStorage.setItem('cached_public_courses_html', html);
            }
            if (window.applyTranslations && coursesGrid) window.applyTranslations(coursesGrid);
        })
        .catch(err => {
            console.error('Failed to load public courses:', err);
            // Fallback on error if nothing was cached
            if (!cachedCoursesHtml && coursesGrid) {
                let html = '';
                mockCourses.forEach(mock => {
                    html += renderCourseCard({
                        id: mock.id,
                        title: mock.title,
                        coverImage: mock.thumbUrl,
                        instructor: 'Plataforma Training'
                    });
                });
                coursesGrid.innerHTML = html;
            }
        });

    // --- 4. Render Featured Channels (from API) ---
    const featuredContainer = document.getElementById('featured-container');
    if (featuredContainer) {
        fetch('/channels/public')
            .then(res => res.json())
            .then(resData => {
                const channels = resData.data || [];
                let featuredHtml = '';

                channels.forEach(ch => {
                    const thumbHtml = ch.thumb
                        ? `<div style="width:100%; height:120px; background-image:url(${ch.thumb}); background-size:cover; background-position:center; border-radius:8px; margin-bottom:15px;"></div>`
                        : `<div style="width:100%; height:120px; background:#497aa7; border-radius:8px; margin-bottom:15px; display:flex; align-items:center; justify-content:center; color:white; font-size:30px;"><i class="fas fa-tv"></i></div>`;
                        
                    featuredHtml += `
                        <div style="min-width:250px; background:white; border-radius:12px; border:1px solid #e2e8f0; padding:15px; text-align:center; cursor:pointer;" onclick="window.location.href='channel_view.html?id=${ch.id}&view=public'">
                            ${thumbHtml}
                            <h3 style="font-size:18px; color:#1e293b; margin:0 0 5px 0;">${ch.name}</h3>
                            <p style="font-size:14px; color:#64748b; margin:0 0 15px 0;">${ch.description ? ch.description.substring(0, 30) + '...' : 'Exclusive Channel'}</p>
                            <button class="btn-outline" style="width:100%; color:#1e293b; border-color:#e2e8f0; background:#f8fafc;">${window.t ? window.t('marketplace.accessChannel', 'Access Channel') : 'Access Channel'}</button>
                        </div>
                    `;
                });

                if (featuredHtml === '') {
                    const emptyMsg = window.t ? window.t('marketplace.noExclusiveChannels', 'No exclusive channels created.') : 'No exclusive channels created.';
                    featuredContainer.innerHTML = `<p data-i18n="marketplace.noExclusiveChannels" style="color:#64748b; padding:10px;">${emptyMsg}</p>`;
                } else {
                    featuredContainer.innerHTML = featuredHtml;
                }
                if (window.applyTranslations) window.applyTranslations(featuredContainer);
            })
            .catch(err => {
                console.error('Failed to load channels:', err);
                featuredContainer.innerHTML = '<p style="color:#64748b; padding:10px;">Falha ao carregar canais.</p>';
            });
    }
});
