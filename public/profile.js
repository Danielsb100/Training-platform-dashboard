document.addEventListener('DOMContentLoaded', async () => {
    const userPagesGrid = document.getElementById('user-pages-grid');
    const pagesCount = document.getElementById('pages-count');
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.querySelector('.nav-item.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    // --- 1. Load Published Courses ---
    let publishedCourses = [];
    try {
        const res = await fetch('/courses/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            publishedCourses = Array.isArray(data) ? data : (data.data || []);
        }
    } catch (err) {
        console.error('Failed to load courses:', err);
    }
    
    if (pagesCount) pagesCount.innerText = publishedCourses.length;

    function renderCourseCard(course) {
        const statusColor = course.status === 'PUBLISHED' ? '#dcfce7' : '#f1f5f9';
        const statusText = course.status === 'PUBLISHED' ? 'Published' : 'Draft';
        const textColor = course.status === 'PUBLISHED' ? '#166534' : '#475569';

        const thumbUrl = course.coverImage || course.thumbnailUrl || course.custom_thumb;
        const thumbHtml = thumbUrl
            ? `<div style="height:140px; background-image:url(${thumbUrl}); background-size:cover; background-position:center;"></div>`
            : `<div style="height:140px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:3rem;"><i class="fas fa-image"></i></div>`;

        return `
            <div class="course-card" style="background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; display:flex; flex-direction:column;">
                ${thumbHtml}
                <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                        <h4 style="margin:0; color:#1e293b; font-size:1.1rem;">${course.title}</h4>
                        <span style="font-size:0.7rem; padding:3px 8px; border-radius:10px; background:${statusColor}; color:${textColor}; font-weight:bold;">${statusText}</span>
                    </div>
                    <p style="color:#64748b; font-size:0.85rem; margin-bottom:15px; flex:1;">${course.description || 'No description'}</p>
                    <div style="display:flex; gap:10px;">
                        <button onclick="window.location.href='course_builder.html?id=${course.id}'" style="flex:1; padding:8px; border:1px solid #cbd5e1; background:white; color:#475569; border-radius:6px; font-size:0.85rem; font-weight:bold; cursor:pointer;">Edit</button>
                        <button onclick="window.location.href='course_content.html?id=${course.id}'" style="flex:1; padding:8px; background:#497aa7; color:white; border:none; border-radius:6px; font-size:0.85rem; font-weight:bold; cursor:pointer;">View Content</button>
                    </div>
                </div>
            </div>
        `;
    }

    if (userPagesGrid) {
        if (publishedCourses.length === 0) {
            userPagesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px; background: white; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <i class="fas fa-graduation-cap" style="font-size:3rem; color:#e2e8f0; margin-bottom:15px; display:block;"></i>
                    <h3 style="color: #1e293b; margin-bottom: 10px;">You don't have any Courses yet.</h3>
                    <p style="color: #64748b; margin-bottom: 20px;">Create your first course right now and set up the modules and landing page!</p>
                    <a href="course_builder.html" class="btn-primary" style="padding:12px 25px; border-radius:30px; background:#cf982e; color:white; text-decoration:none; font-weight:bold; display:inline-block;"><i class="fas fa-plus"></i> Create Now</a>
                </div>
            `;
        } else {
            let html = '';
            publishedCourses.forEach(course => {
                html += renderCourseCard(course);
            });
            userPagesGrid.innerHTML = html;
        }
    }

    // --- 2. Load Operational Agenda / Notifications ---
    await loadNotificationsSummary();

    // --- 3. Load Profile API ---
    try {
        const profileRes = await fetch('/api/profile/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        
        if (profileRes.ok && (profileData.ok || profileData.data)) {
            const actualData = profileData.data || profileData;
            const profile = actualData.profile || {};
            const user = actualData.user || {};

            // Preenche Header Visual
            const nameToDisplay = profile.displayName || user.username || 'No Name';
            document.getElementById('settings-name').value = nameToDisplay;
            const headerName = document.querySelector('.profile-details h2');
            if (headerName) headerName.innerText = nameToDisplay;

            const headerRole = document.querySelector('.profile-role');
            if (headerRole) {
                headerRole.innerText = profile.headline || 'No role defined';
                document.getElementById('settings-role').value = profile.headline || '';
            }

            const headerBio = document.querySelector('.profile-bio');
            if (headerBio) {
                headerBio.innerText = profile.bio || 'Add a biography in Settings.';
                document.getElementById('settings-bio').value = profile.bio || '';
                document.getElementById('port-bio').value = profile.bio || '';
            }
            if (profile.interests) {
                document.getElementById('settings-interests').value = profile.interests.join(', ');
            }
            if (profile.spokenLanguages) {
                document.getElementById('settings-languages').value = profile.spokenLanguages.join(', ');
                document.getElementById('port-languages').value = profile.spokenLanguages.join(', ');
            }
            if (profile.linkedinUrl) document.getElementById('port-linkedin').value = profile.linkedinUrl;
            if (profile.githubUrl) document.getElementById('port-github').value = profile.githubUrl;
            if (profile.behanceUrl) document.getElementById('port-behance').value = profile.behanceUrl;
            if (profile.artstationUrl) document.getElementById('port-artstation').value = profile.artstationUrl;
            if (profile.timezone) document.getElementById('port-timezone').value = profile.timezone;
            if (profile.organization) document.getElementById('port-organization').value = profile.organization;
            if (profile.course) document.getElementById('port-course').value = profile.course;
            if (profile.location) document.getElementById('port-location').value = profile.location;
            if (profile.websiteUrl) document.getElementById('port-website').value = profile.websiteUrl;
            
            const prefs = profileData.preferences || {};
            if (prefs.language) document.getElementById('port-pref-language').value = prefs.language;
            if (prefs.theme) document.getElementById('port-pref-theme').value = prefs.theme;
            if (prefs.emailNotifications !== undefined) document.getElementById('port-pref-email').checked = prefs.emailNotifications;
            if (prefs.allowDirectMessages !== undefined) document.getElementById('port-pref-contact').checked = prefs.allowDirectMessages;
            if (prefs.reduceMotion !== undefined) document.getElementById('port-pref-motion').checked = prefs.reduceMotion;
            if (prefs.highContrast !== undefined) document.getElementById('port-pref-contrast').checked = prefs.highContrast;

            const consents = profileData.consents || {};
            if (consents.termsAndPrivacy) document.getElementById('port-consent-terms').checked = consents.termsAndPrivacy.granted;
            if (consents.marketingEmails) document.getElementById('port-consent-marketing').checked = consents.marketingEmails.granted;
            if (consents.profileDiscovery) document.getElementById('port-consent-discovery').checked = consents.profileDiscovery.granted;
            if (consents.worldProfileCard) document.getElementById('port-consent-world').checked = consents.worldProfileCard.granted;

            // Global Navigation Visibility Rules
            const navCreations = document.getElementById('nav-creations');
            const navUsers = document.getElementById('nav-users');
            const roles = user.roles || [];
            
            if (navCreations) {
                const isOnlyStudent = roles.includes('STUDENT') && !roles.some(r => ['TEACHER', 'TUTOR', 'BUSINESS_MENTOR', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN'].includes(r));
                if (isOnlyStudent || (roles.length === 1 && roles[0] === 'STUDENT')) {
                    navCreations.style.display = 'none';
                }
            }
            if (navUsers && user.role === 'MASTER') {
                navUsers.style.display = 'flex';
            }

            // Also load the avatar properly            // Foto de perfil precisa vir de User (que está vinculado)
            if (user.profilePicture) {
                document.getElementById('settings-profile-img-preview').src = user.profilePicture;
                const headerPhoto = document.querySelector('.profile-photo');
                if (headerPhoto) headerPhoto.src = user.profilePicture;
            }

            // Tags / Skills
            if (profile.skills && profile.skills.length > 0) {
                window.userTags = profile.skills.map(s => ({ name: s, bg: '#f1f5f9', text: '#333' }));
                if (typeof renderSelectedTags === 'function') renderSelectedTags();
            }
        } else {
            console.error('Failed to load profile, status:', profileRes.status);
            if (profileRes.status === 401 || profileRes.status === 404) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            const nameToDisplay = 'Error loading profile';
            document.getElementById('settings-name').value = nameToDisplay;
            const headerName = document.querySelector('.profile-details h2');
            if (headerName) headerName.innerText = nameToDisplay;
        }
    } catch (err) {
        console.error('Failed to load profile API:', err);
    }
    // --- 3. Load Notifications ---
    try {
        const notifRes = await fetch('/api/notifications/summary', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const notifData = await notifRes.json();
        if (notifRes.ok && notifData.ok) {
            const unreadCount = notifData.unreadCount || 0;
            const recent = notifData.recent || [];

            const popup = document.getElementById('notification-popup');
            if (popup) {
                const headerSpan = popup.querySelector('span');
                if (headerSpan) headerSpan.innerText = `${unreadCount} novas`;

                const listContainer = popup.querySelector('div:nth-child(2)');
                if (listContainer) {
                    if (recent.length === 0) {
                        listContainer.innerHTML = '<div style="padding:15px 20px; color:#64748b; font-size:13px;">No notifications.</div>';
                    } else {
                        listContainer.innerHTML = recent.map(n => `
                            <div style="padding:15px 20px; border-bottom:1px solid #f1f5f9; cursor:pointer; background: ${n.isRead ? 'transparent' : '#f8fafc'};">
                                <strong style="color:${n.isRead ? '#1e293b' : '#cf982e'}; font-size:0.9rem;">${n.title}</strong>
                                <p style="margin:5px 0 0 0; font-size:0.85rem; color:#64748b;">${n.content}</p>
                            </div>
                        `).join('');
                    }
                }
            }
        }
    } catch (err) {
        console.error('Failed to load notifications:', err);
    }
});

// Sobrescrevendo a função de salvar no perfil para bater na API
window.saveSettingsProfile = async function() {
    const token = localStorage.getItem('token');
    const name = document.getElementById('settings-name').value;
    const role = document.getElementById('settings-role').value;
    const bio = document.getElementById('settings-bio').value;
    const interests = document.getElementById('settings-interests').value.split(',').map(s => s.trim());
    const languages = document.getElementById('settings-languages').value.split(',').map(s => s.trim());
    const photo = window.profileCustomPhoto; // Base64 if updated

    try {
        const res = await fetch('/api/profile/me', {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                displayName: name,
                headline: role,
                bio: bio,
                interests: interests,
                spokenLanguages: languages
            })
        });

        if (res.ok) {
            // Se houver uma foto nova, envia para a rota de upload (que aceita multipart)
            if (photo && photo.startsWith('data:image')) {
                // Convert Base64 to File
                const resPhoto = await fetch(photo);
                const blob = await resPhoto.blob();
                const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
                
                const formData = new FormData();
                formData.append('profilePicture', file);
                
                await fetch('/api/users/profile-picture', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            }
            alert('Profile saved successfully!');
            location.reload();
        } else {
            alert('Failed to save profile.');
        }
    } catch (err) {
        console.error(err);
        alert('Error saving profile.');
    }
};

window.saveAdvancedPortfolio = async function() {
    const token = localStorage.getItem('token');
    const bio = document.getElementById('port-bio').value;
    const linkedin = document.getElementById('port-linkedin').value;
    const github = document.getElementById('port-github').value;
    const behance = document.getElementById('port-behance').value;
    const artstation = document.getElementById('port-artstation').value;
    
    const languagesStr = document.getElementById('port-languages').value;
    const spokenLanguages = languagesStr ? languagesStr.split(',').map(s => s.trim()) : [];
    const timezone = document.getElementById('port-timezone').value;
    const organization = document.getElementById('port-organization').value;
    const course = document.getElementById('port-course').value;
    const location = document.getElementById('port-location').value;
    const websiteUrl = document.getElementById('port-website').value;

    const skills = window.userTags ? window.userTags.map(t => t.name) : [];

    const language = document.getElementById('port-pref-language').value;
    const theme = document.getElementById('port-pref-theme').value;
    const emailNotifications = document.getElementById('port-pref-email').checked;
    const allowDirectMessages = document.getElementById('port-pref-contact').checked;
    const reduceMotion = document.getElementById('port-pref-motion').checked;
    const highContrast = document.getElementById('port-pref-contrast').checked;

    const termsAndPrivacy = document.getElementById('port-consent-terms').checked;
    const marketingEmails = document.getElementById('port-consent-marketing').checked;
    const profileDiscovery = document.getElementById('port-consent-discovery').checked;
    const worldProfileCard = document.getElementById('port-consent-world').checked;

    try {
        const res = await fetch('/api/profile/me', {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bio: bio,
                skills: skills,
                spokenLanguages: spokenLanguages,
                timezone: timezone,
                organization: organization,
                course: course,
                location: location,
                websiteUrl: websiteUrl,
                linkedinUrl: linkedin,
                githubUrl: github,
                behanceUrl: behance,
                artstationUrl: artstation,
                preferences: {
                    language, theme, emailNotifications, allowDirectMessages, reduceMotion, highContrast
                },
                consents: {
                    termsAndPrivacy: { granted: termsAndPrivacy },
                    marketingEmails: { granted: marketingEmails },
                    profileDiscovery: { granted: profileDiscovery },
                    worldProfileCard: { granted: worldProfileCard }
                }
            })
        });

        if (res.ok) {
            alert('Professional Profile and Networks saved successfully!');
        } else {
            alert('Failed to save portfolio.');
        }
    } catch (err) {
        console.error(err);
        alert('Error saving portfolio.');
    }
};

// --- OPERATIONAL AGENDA & NOTIFICATIONS LOGIC ---

const PRIORITY_LABELS = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical'
};

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDateLabel(value) {
    if (!value) return 'No due date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No due date';

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function renderEmptyState(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<p style="font-size:13px; color:#64748b; margin:0;">${escapeHtml(message)}</p>`;
}

function renderOperationItems(containerId, items, renderer, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        renderEmptyState(containerId, emptyMessage);
        return;
    }

    container.innerHTML = items.map(renderer).join('');
}

function renderNotificationItem(item) {
    const statusTag = item.status === 'UNREAD' ? '<span style="background:#fef3c7; color:#d97706; padding:3px 8px; border-radius:12px; font-size:10px; font-weight:bold;">Unread</span>' : '<span style="background:#e2e8f0; color:#64748b; padding:3px 8px; border-radius:12px; font-size:10px; font-weight:bold;">Read</span>';
    const actionLink = item.actionUrl ? `<a href="${escapeHtml(item.actionUrl)}" style="color:#0ea5e9; text-decoration:none; font-size:11px; font-weight:bold;">Abrir</a>` : '';
    const readAction = item.status === 'UNREAD'
        ? `<button type="button" onclick="markNotificationRead(${Number(item.id)})" style="background:transparent; border:1px solid #cbd5e1; color:#475569; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer; font-weight:bold;">Mark read</button>`
        : '';

    return `
        <article style="padding:10px; border-radius:8px; border:1px solid #e2e8f0; background:${item.status === 'UNREAD' ? '#f0f9ff' : 'white'};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:5px;">
                <div style="flex:1; padding-right:10px;">
                    <h5 style="color:#1e293b; margin:0 0 5px 0; font-size:13px;">${escapeHtml(item.title)}</h5>
                    <p style="color:#64748b; margin:0; font-size:12px;">${escapeHtml(item.message)}</p>
                </div>
                ${statusTag}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <div style="display:flex; gap:5px;">
                    <span style="font-size:11px; color:#94a3b8;">${escapeHtml(formatDateLabel(item.createdAt))}</span>
                </div>
                <div style="display:flex; gap:5px; align-items:center;">
                    ${actionLink}
                    ${readAction}
                </div>
            </div>
        </article>
    `;
}

function renderTaskQueueItem(item) {
    const statusAction = item.status === 'IN_PROGRESS'
        ? `<button type="button" onclick="updateTaskQueueItemStatus(${Number(item.id)}, 'COMPLETED')" style="background:#166534; border:none; color:white; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer; font-weight:bold;">Complete</button>`
        : `<button type="button" onclick="updateTaskQueueItemStatus(${Number(item.id)}, 'IN_PROGRESS')" style="background:#1e40af; border:none; color:white; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer; font-weight:bold;">Start</button>`;

    const isUrgent = item.priority === 'CRITICAL';

    return `
        <article style="padding:10px; border-radius:8px; border:1px solid ${isUrgent ? '#fecaca' : '#e2e8f0'}; background:${isUrgent ? '#fff1f2' : 'white'};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:5px;">
                <div style="flex:1; padding-right:10px;">
                    <h5 style="color:${isUrgent ? '#be123c' : '#1e293b'}; margin:0 0 5px 0; font-size:13px;">${escapeHtml(item.title)}</h5>
                    <p style="color:${isUrgent ? '#e11d48' : '#64748b'}; margin:0; font-size:12px;">${escapeHtml(item.summary || 'No operational summary.')}</p>
                </div>
                <span style="background:${isUrgent ? '#ffe4e6' : '#f1f5f9'}; color:${isUrgent ? '#e11d48' : '#475569'}; padding:3px 8px; border-radius:12px; font-size:10px; font-weight:bold;">${escapeHtml(PRIORITY_LABELS[item.priority] || item.priority || 'Low')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <div style="display:flex; gap:5px;">
                    <span style="font-size:11px; color:#94a3b8;">${escapeHtml(formatDateLabel(item.dueAt || item.scheduledFor))}</span>
                </div>
                <div style="display:flex; gap:5px; align-items:center;">
                    ${item.actionUrl ? `<a href="${escapeHtml(item.actionUrl)}" style="color:#0ea5e9; text-decoration:none; font-size:11px; font-weight:bold;">Abrir</a>` : ''}
                    ${statusAction}
                    <button type="button" onclick="updateTaskQueueItemStatus(${Number(item.id)}, 'DISMISSED')" style="background:transparent; border:1px solid #cbd5e1; color:#475569; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer; font-weight:bold;">Dismiss</button>
                </div>
            </div>
        </article>
    `;
}

function renderReminderItem(item) {
    return `
        <article style="padding:10px; border-radius:8px; border:1px solid #e2e8f0; background:white;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:5px;">
                <div style="flex:1; padding-right:10px;">
                    <h5 style="color:#1e293b; margin:0 0 5px 0; font-size:13px;">${escapeHtml(item.title)}</h5>
                    <p style="color:#64748b; margin:0; font-size:12px;">${escapeHtml(item.description || 'Internal reminder with no additional description.')}</p>
                </div>
                <span style="background:#f1f5f9; color:#475569; padding:3px 8px; border-radius:12px; font-size:10px; font-weight:bold;">${escapeHtml(PRIORITY_LABELS[item.priority] || item.priority || 'Low')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <div style="display:flex; gap:5px;">
                    <span style="font-size:11px; color:#94a3b8;">${escapeHtml(formatDateLabel(item.dueAt))}</span>
                </div>
                <div style="display:flex; gap:5px; align-items:center;">
                    ${item.actionUrl ? `<a href="${escapeHtml(item.actionUrl)}" style="color:#0ea5e9; text-decoration:none; font-size:11px; font-weight:bold;">Abrir</a>` : ''}
                    <button type="button" onclick="updateReminderStatus(${Number(item.id)}, 'COMPLETED')" style="background:#166534; border:none; color:white; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer; font-weight:bold;">Complete</button>
                    <button type="button" onclick="updateReminderStatus(${Number(item.id)}, 'DISMISSED')" style="background:transparent; border:1px solid #cbd5e1; color:#475569; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer; font-weight:bold;">Dismiss</button>
                </div>
            </div>
        </article>
    `;
}

let currentNotificationsSummary = null;

function renderNotificationsSummary(summary) {
    currentNotificationsSummary = summary;
    const elUnreadCount = document.getElementById('ops-unread-count');
    const elUrgentCount = document.getElementById('ops-urgent-count');
    const elInboxMeta = document.getElementById('ops-inbox-meta');
    const elTodayMeta = document.getElementById('ops-today-meta');
    const elUrgentMeta = document.getElementById('ops-urgent-meta');
    const elWeekMeta = document.getElementById('ops-week-meta');
    const elRemindersMeta = document.getElementById('ops-reminders-meta');

    if (elUnreadCount) elUnreadCount.textContent = `${summary.counts.unread} unread`;
    if (elUrgentCount) elUrgentCount.textContent = `${summary.counts.urgent} urgent`;
    if (elInboxMeta) elInboxMeta.textContent = `${summary.inbox.length} itens`;
    if (elTodayMeta) elTodayMeta.textContent = `${summary.operational.today.length} pending`;
    if (elUrgentMeta) elUrgentMeta.textContent = `${summary.operational.urgent.length} blocks`;
    if (elWeekMeta) elWeekMeta.textContent = `${summary.weeklyGoals.length} goals`;
    if (elRemindersMeta) elRemindersMeta.textContent = `${summary.reminders.length} reminders`;

    renderOperationItems('notifications-inbox', summary.inbox, renderNotificationItem, 'No messages.');
    renderOperationItems('operations-today', summary.operational.today, renderTaskQueueItem, 'Nothing planned.');
    renderOperationItems('operations-urgent', summary.operational.urgent, renderTaskQueueItem, 'No blocks.');
    renderOperationItems('operations-week', summary.weeklyGoals, renderTaskQueueItem, 'Set your goals.');
    renderOperationItems('operations-reminders', summary.reminders, renderReminderItem, 'No open automatic reminders.');
}

async function loadNotificationsSummary() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/notifications/summary', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const result = await res.json();
            const summaryData = result.data || result;
            renderNotificationsSummary(summaryData);
        }
    } catch (err) {
        console.error('Failed to load notifications:', err);
    }
}

window.markNotificationRead = async function(id) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`/api/notifications/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        await loadNotificationsSummary();
    } catch (err) {
        console.error('Error marking notification as read:', err);
    }
};

window.markAllNotificationsRead = async function() {
    try {
        const token = localStorage.getItem('token');
        await fetch('/api/notifications/read-all', {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        await loadNotificationsSummary();
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
    }
};

window.updateTaskQueueItemStatus = async function(id, status) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        await loadNotificationsSummary();
    } catch (err) {
        console.error('Error updating task status:', err);
    }
};

window.updateReminderStatus = async function(id, status) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`/api/reminders/${id}`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        await loadNotificationsSummary();
    } catch (err) {
        console.error('Error updating reminder status:', err);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btnMarkRead = document.getElementById('btn-mark-notifications-read');
    if (btnMarkRead) {
        btnMarkRead.addEventListener('click', window.markAllNotificationsRead);
    }
});

window.loadSubscriptions = async function() {
    const container = document.getElementById('subscriptions-container');
    if (!container) return;

    container.innerHTML = '<p>Carregando inscrições...</p>';

    try {
        const res = await fetch('/api/courses/enrolled', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        
        if (!res.ok) throw new Error('Falha ao buscar inscrições');
        const courses = await res.json();

        window.currentSubscriptionsType = window.currentSubscriptionsType || 'ALL';
        
        let filteredCourses = courses;
        if (window.currentSubscriptionsType === 'COURSE') {
            filteredCourses = courses.filter(c => !c.channelId);
        } else if (window.currentSubscriptionsType === 'CHANNEL') {
            filteredCourses = courses.filter(c => !!c.channelId);
        }

        if (!filteredCourses || filteredCourses.length === 0) {
            container.innerHTML = `
                <i class="fas fa-box-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 20px;"></i>
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">Nenhuma Inscrição Encontrada</h3>
                <p style="color: #64748b; margin: 0; max-width: 400px; margin: 0 auto;">Você não possui inscrições com esse filtro. Visite o marketplace para explorar novos conteúdos!</p>
            `;
            return;
        }

        let html = '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; text-align:left;">';
        filteredCourses.forEach(course => {
            const thumbUrl = course.coverImage || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=400&q=80';
            const progress = course.progressPercent || 0;
            
            html += `
                <div class="course-card" style="background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; display:flex; flex-direction:column; cursor:pointer;" onclick="window.location.href='course_content.html?id=${course.id}'">
                    <div style="height:140px; background-image:url('${thumbUrl}'); background-size:cover; background-position:center;"></div>
                    <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
                        <h4 style="margin:0 0 10px 0; color:#1e293b; font-size:1.1rem;">${course.title}</h4>
                        <p style="font-size:0.85rem; color:#64748b; flex:1;">By: ${course.creator}</p>
                        
                        <div style="margin-top: 15px;">
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#475569; margin-bottom:5px;">
                                <span>Progresso</span>
                                <span>${progress}%</span>
                            </div>
                            <div style="background:#e2e8f0; border-radius:10px; height:6px; overflow:hidden;">
                                <div style="background:#10b981; height:100%; width:${progress}%"></div>
                            </div>
                        </div>
                        <button onclick="event.stopPropagation(); window.unsubscribeCourse(${course.id})" style="margin-top:15px; background:none; border:1px solid #ef4444; color:#ef4444; border-radius:6px; padding:6px 12px; font-size:0.85rem; cursor:pointer; width:100%; transition:all 0.2s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">
                            <i class="fas fa-times-circle" style="margin-right:5px;"></i> Desinscrever
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:#ef4444;">Erro ao carregar suas inscrições.</p>';
    }
};

window.filterSubscriptions = function(type) {
    window.currentSubscriptionsType = type;
    document.getElementById('sub-filter-ALL').style.cssText = type === 'ALL' ? 'border:none; background:#fff; padding:6px 15px; border-radius:5px; box-shadow:0 1px 3px rgba(0,0,0,0.1); font-weight:bold; cursor:pointer;' : 'border:none; background:transparent; padding:6px 15px; border-radius:5px; color:#64748b; font-weight:600; cursor:pointer;';
    document.getElementById('sub-filter-COURSE').style.cssText = type === 'COURSE' ? 'border:none; background:#fff; padding:6px 15px; border-radius:5px; box-shadow:0 1px 3px rgba(0,0,0,0.1); font-weight:bold; cursor:pointer;' : 'border:none; background:transparent; padding:6px 15px; border-radius:5px; color:#64748b; font-weight:600; cursor:pointer;';
    document.getElementById('sub-filter-CHANNEL').style.cssText = type === 'CHANNEL' ? 'border:none; background:#fff; padding:6px 15px; border-radius:5px; box-shadow:0 1px 3px rgba(0,0,0,0.1); font-weight:bold; cursor:pointer;' : 'border:none; background:transparent; padding:6px 15px; border-radius:5px; color:#64748b; font-weight:600; cursor:pointer;';
    window.loadSubscriptions();
};

window.unsubscribeCourse = async function(courseId) {
    if (!confirm('Tem certeza de que deseja desinscrever-se deste curso? Você perderá seu progresso.')) return;
    
    try {
        const res = await fetch(`/api/courses/${courseId}/unsubscribe`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        
        if (res.ok) {
            alert('Desinscrito com sucesso.');
            window.loadSubscriptions();
        } else {
            const data = await res.json();
            alert('Erro: ' + (data.error || 'Não foi possível desinscrever-se.'));
        }
    } catch (err) {
        console.error(err);
        alert('Erro de rede ao tentar desinscrever.');
    }
};
