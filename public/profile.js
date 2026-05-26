function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

function getAiTipSeverityStyle(severity) {
    if (severity === 'CRITICAL') return { border: '#fecaca', bg: '#fff1f2', text: '#be123c', icon: 'fa-triangle-exclamation' };
    if (severity === 'WARNING') return { border: '#fed7aa', bg: '#fff7ed', text: '#c2410c', icon: 'fa-circle-exclamation' };
    return { border: '#bfdbfe', bg: '#eff6ff', text: '#1d4ed8', icon: 'fa-lightbulb' };
}

function renderAiTips(payload = {}) {
    const list = document.getElementById('ai-tips-list');
    const count = document.getElementById('ai-tips-count');
    const warning = document.getElementById('ai-tips-warning-count');
    if (!list) return;

    const tips = Array.isArray(payload.tips) ? payload.tips : [];
    const counts = payload.severityCounts || {};
    if (count) count.textContent = `${tips.length} tip${tips.length === 1 ? '' : 's'}`;
    if (warning) warning.textContent = `${(counts.WARNING || 0) + (counts.CRITICAL || 0)} attention`;

    if (!tips.length) {
        list.innerHTML = `<p style="font-size:13px; color:#64748b; margin:0;">${window.t ? window.t('profile.noAiTips', 'No AI tips right now. Keep studying and refresh when you want updated guidance.') : 'No AI tips right now. Keep studying and refresh when you want updated guidance.'}</p>`;
        return;
    }

    list.innerHTML = tips.map((tip) => {
        const style = getAiTipSeverityStyle(tip.severity);
        const metadata = tip.metadata || {};
        const focusLabel = window.t ? window.t('profile.focus', 'Focus:') : 'Focus:';
        const focusAreas = Array.isArray(metadata.focusAreas) && metadata.focusAreas.length
            ? `<div style="margin-top:8px;"><strong style="font-size:12px; color:#475569;">${focusLabel}</strong> <span style="font-size:12px; color:#64748b;">${metadata.focusAreas.map(escapeHtml).join(' • ')}</span></div>`
            : '';
        const nextSteps = Array.isArray(metadata.nextSteps) && metadata.nextSteps.length
            ? `<ul style="margin:8px 0 0 18px; padding:0; color:#64748b; font-size:12px; line-height:1.45;">${metadata.nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ul>`
            : '';
        const whyLabel = window.t ? window.t('profile.why', 'Why:') : 'Why:';
        const aiTipTitle = window.t ? window.t('profile.aiTip', 'AI tip') : 'AI tip';
        const openLabel = window.t ? window.t('common.open', 'Open') : 'Open';
        const dismissLabel = window.t ? window.t('common.dismiss', 'Dismiss') : 'Dismiss';
        return `
            <article data-ai-tip-id="${tip.id}" style="background:${style.bg}; border:1px solid ${style.border}; border-radius:10px; padding:14px; display:flex; justify-content:space-between; gap:14px; align-items:flex-start;">
                <div style="display:flex; gap:12px; min-width:0;">
                    <i class="fas ${style.icon}" style="color:${style.text}; margin-top:3px;"></i>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <strong style="color:#1e293b; font-size:14px;">${escapeHtml(tip.title || aiTipTitle)}</strong>
                            <span style="background:white; color:${style.text}; border:1px solid ${style.border}; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:bold;">${escapeHtml(tip.severity || 'INFO')}</span>
                            <span style="background:white; color:#475569; border:1px solid #e2e8f0; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:bold;">${escapeHtml(tip.scope || 'COURSE')}</span>
                        </div>
                        <p style="margin:6px 0 0 0; color:#475569; font-size:13px; line-height:1.45;">${escapeHtml(tip.message || '')}</p>
                        ${tip.reason ? `<p style="margin:6px 0 0 0; color:#94a3b8; font-size:12px; line-height:1.4;">${whyLabel} ${escapeHtml(tip.reason)}</p>` : ''}
                        ${focusAreas}
                        ${nextSteps}
                    </div>
                </div>
                <div style="display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap; justify-content:flex-end;">
                    ${tip.actionUrl ? `<a href="${escapeHtml(tip.actionUrl)}" style="background:white; border:1px solid #cbd5e1; color:#475569; padding:5px 10px; border-radius:8px; text-decoration:none; font-size:12px; font-weight:bold;">${escapeHtml(tip.actionLabel || openLabel)}</a>` : ''}
                    <button type="button" data-ai-tip-dismiss="${tip.id}" style="background:white; border:1px solid #cbd5e1; color:#475569; padding:5px 10px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:bold;">${dismissLabel}</button>
                </div>
            </article>
        `;
    }).join('');

    list.querySelectorAll('[data-ai-tip-dismiss]').forEach((button) => {
        button.addEventListener('click', async () => {
            button.disabled = true;
            try {
                await dismissAiTip(button.dataset.aiTipDismiss);
                await loadAiTips({ refresh: false });
            } catch (error) {
                console.error('Failed to dismiss AI tip:', error);
                button.disabled = false;
            }
        });
    });
}

async function fetchAiTips({ refresh = true } = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/ai-tips/me?refresh=${refresh ? 'true' : 'false'}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || 'Could not load AI tips.');
    return payload;
}

async function dismissAiTip(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/ai-tips/${encodeURIComponent(id)}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || 'Could not dismiss AI tip.');
    return payload;
}

async function loadAiTips({ refresh = true } = {}) {
    const list = document.getElementById('ai-tips-list');
    if (!list) return;
    try {
        if (refresh) list.innerHTML = `<p style="font-size:13px; color:#64748b; margin:0;">${window.t ? window.t('profile.refreshingTips', 'Refreshing AI tips...') : 'Refreshing AI tips...'}</p>`;
        const payload = await fetchAiTips({ refresh });
        renderAiTips(payload);
    } catch (error) {
        console.error('AI tips error:', error);
        list.innerHTML = `<p style="font-size:13px; color:#be123c; margin:0;">${window.t ? window.t('profile.couldNotLoadTips', 'Could not load AI tips yet.') : 'Could not load AI tips yet.'}</p>`;
    }
}

window.loadAiTips = loadAiTips;

function getEurobotSyncStatusStyle(status) {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'SYNCED' || normalized === 'ACTIVE') return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
    if (normalized === 'FAILED' || normalized === 'ERROR' || normalized === 'DELETE_FAILED') return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
    if (normalized === 'PENDING' || normalized === 'STALE') return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
    if (normalized === 'SKIPPED' || normalized === 'DELETED' || normalized === 'DISABLED') return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
}

function formatEurobotDate(value) {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Never';
    return date.toLocaleString();
}

function renderEurobotSyncPanel(payload = {}) {
    const statusEl = document.getElementById('eurobot-sync-status');
    const summaryEl = document.getElementById('eurobot-sync-summary');
    const itemsEl = document.getElementById('eurobot-sync-items');
    const ensureBtn = document.getElementById('btn-eurobot-ensure-default');
    if (!statusEl || !summaryEl || !itemsEl) return;

    const connection = payload.connection || null;
    const summary = payload.syncSummary || connection?.syncSummary || {};
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (!connection) {
        statusEl.innerHTML = window.t ? window.t('profile.noActiveKB', '<span style="color:#c2410c; font-weight:700;">No active Eurobot knowledge base yet.</span> Click <strong>Ensure KB</strong> to create/connect the default Training KB, then run sync.') : '<span style="color:#c2410c; font-weight:700;">No active Eurobot knowledge base yet.</span> Click <strong>Ensure KB</strong> to create/connect the default Training KB, then run sync.';
        summaryEl.innerHTML = '';
        itemsEl.innerHTML = '';
        if (ensureBtn) ensureBtn.style.display = 'inline-flex';
        return;
    }

    if (ensureBtn) ensureBtn.style.display = 'inline-flex';
    const connStyle = getEurobotSyncStatusStyle(connection.status);
    statusEl.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
            <span style="font-weight:800; color:#1e293b;">${escapeHtml(connection.displayName || connection.remoteName || connection.collectionName || 'Training Knowledge Base')}</span>
            <span style="background:${connStyle.bg}; color:${connStyle.text}; border:1px solid ${connStyle.border}; padding:3px 9px; border-radius:999px; font-size:11px; font-weight:800;">${escapeHtml(connection.status || 'ACTIVE')}</span>
            <span style="color:#64748b; font-size:12px;">Last refresh: ${escapeHtml(formatEurobotDate(connection.lastRefreshAt))}</span>
        </div>
        ${connection.lastError ? `<p style="margin:8px 0 0 0; color:#b91c1c; font-size:12px;">Last error: ${escapeHtml(connection.lastError)}</p>` : ''}
    `;

    const cards = [
        [window.t ? window.t('profile.total', 'Total') : 'Total', summary.total || 0, '#f8fafc', '#334155'],
        [window.t ? window.t('profile.synced', 'Synced') : 'Synced', summary.synced || 0, '#dcfce7', '#166534'],
        [window.t ? window.t('profile.pending', 'Pending') : 'Pending', summary.pending || 0, '#fff7ed', '#c2410c'],
        [window.t ? window.t('profile.failed', 'Failed') : 'Failed', (summary.failed || 0) + (summary.delete_failed || 0), '#fee2e2', '#b91c1c'],
        [window.t ? window.t('profile.skipped', 'Skipped') : 'Skipped', summary.skipped || 0, '#f1f5f9', '#475569'],
        [window.t ? window.t('profile.deleted', 'Deleted') : 'Deleted', summary.deleted || 0, '#f1f5f9', '#475569']
    ];
    summaryEl.innerHTML = cards.map(([label, value, bg, color]) => `
        <div style="background:${bg}; border:1px solid #e2e8f0; border-radius:10px; padding:10px;">
            <div style="font-size:11px; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">${label}</div>
            <div style="font-size:1.35rem; color:${color}; font-weight:900; line-height:1.2;">${value}</div>
        </div>
    `).join('');

    if (!items.length) {
        itemsEl.innerHTML = `<p style="font-size:12px; color:#64748b; margin:0;">${window.t ? window.t('profile.noSyncItems', 'No sync items to show yet. Click <strong>Sync now</strong> to reconcile existing course materials.') : 'No sync items to show yet. Click <strong>Sync now</strong> to reconcile existing course materials.'}</p>`;
        return;
    }

    const latestItems = items.slice(0, 8);
    itemsEl.innerHTML = `
        <div style="border-top:1px solid #e2e8f0; padding-top:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:10px;">
                <strong style="font-size:13px; color:#1e293b;">Latest sync items</strong>
                <span style="font-size:12px; color:#64748b;">Showing ${latestItems.length} of ${items.length}</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
                ${latestItems.map((item) => {
                    const itemStyle = getEurobotSyncStatusStyle(item.status);
                    const label = item.filename || `${item.sourceType || 'Material'} #${item.sourceId || item.id}`;
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:9px 10px;">
                            <div style="min-width:0;">
                                <div style="font-size:13px; color:#1e293b; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(label)}</div>
                                <div style="font-size:11px; color:#64748b;">${escapeHtml(item.sourceType || 'MATERIAL')} Ã¢â‚¬Â¢ Updated ${escapeHtml(formatEurobotDate(item.updatedAt))}</div>
                                ${item.lastError ? `<div style="font-size:11px; color:#b91c1c; margin-top:3px;">${escapeHtml(item.lastError)}</div>` : ''}
                            </div>
                            <span style="flex-shrink:0; background:${itemStyle.bg}; color:${itemStyle.text}; border:1px solid ${itemStyle.border}; padding:3px 8px; border-radius:999px; font-size:10px; font-weight:900;">${escapeHtml(item.status || 'PENDING')}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

async function eurobotSyncRequest(path, options = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(path, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {})
        }
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || 'Eurobot sync request failed.');
    return payload;
}

async function loadEurobotSyncPanel() {
    const statusEl = document.getElementById('eurobot-sync-status');
    if (!statusEl) return;
    try {
        statusEl.textContent = 'Loading Eurobot sync status...';
        const config = await eurobotSyncRequest('/api/ai/knowledge-base/config');
        const syncItems = await eurobotSyncRequest('/api/ai/knowledge-base/sync-items');
        renderEurobotSyncPanel({ ...config, items: syncItems.items || [], connection: config.connection || syncItems.connection });
    } catch (error) {
        console.error('Eurobot sync status failed:', error);
        statusEl.innerHTML = `<span style="color:#b91c1c; font-weight:700;">Could not load Eurobot sync status:</span> ${escapeHtml(error.message)}`;
    }
}

async function ensureEurobotKnowledgeBase() {
    const button = document.getElementById('btn-eurobot-ensure-default');
    if (!button) return;
    const previousHtml = button.innerHTML;
    try {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        const payload = await eurobotSyncRequest('/api/ai/knowledge-base/default', { method: 'POST' });
        renderEurobotSyncPanel(payload);
        await loadEurobotSyncPanel();
    } catch (error) {
        alert('Could not ensure Eurobot KB: ' + error.message);
    } finally {
        button.disabled = false;
        button.innerHTML = previousHtml;
    }
}

async function triggerEurobotKnowledgeSync() {
    const button = document.getElementById('btn-eurobot-sync');
    const statusEl = document.getElementById('eurobot-sync-status');
    if (!button) return;
    const previousHtml = button.innerHTML;
    try {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        if (statusEl) statusEl.textContent = 'Syncing existing Training materials to Eurobot...';
        const payload = await eurobotSyncRequest('/api/ai/knowledge-base/refresh', { method: 'POST', body: '{}' });
        renderEurobotSyncPanel(payload);
        await loadEurobotSyncPanel();
    } catch (error) {
        alert('Eurobot sync failed: ' + error.message);
        await loadEurobotSyncPanel();
    } finally {
        button.disabled = false;
        button.innerHTML = previousHtml;
    }
}

window.loadEurobotSyncPanel = loadEurobotSyncPanel;
window.triggerEurobotKnowledgeSync = triggerEurobotKnowledgeSync;
window.ensureEurobotKnowledgeBase = ensureEurobotKnowledgeBase;

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
            window.location.href = '/';
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
        const statusText = course.status === 'PUBLISHED' ? (window.t ? window.t('profile.published', 'Published') : 'Published') : (window.t ? window.t('profile.draft', 'Draft') : 'Draft');
        const textColor = course.status === 'PUBLISHED' ? '#166534' : '#475569';

        const thumbUrl = course.coverImage || course.thumbnailUrl || course.custom_thumb;
        const thumbHtml = thumbUrl
            ? `<div style="height:140px; background-image:url(${thumbUrl}); background-size:cover; background-position:center;"></div>`
            : `<div style="height:140px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:3rem;"><i class="fas fa-image"></i></div>`;

        const editLinkLabel = window.t ? window.t('profile.editLink', 'Edit Link') : 'Edit Link';
        const openLinkLabel = window.t ? window.t('profile.openLink', 'Open Link') : 'Open Link';
        const editLabel = window.t ? window.t('profile.edit', 'Edit') : 'Edit';
        const viewContentLabel = window.t ? window.t('profile.viewContent', 'View Content') : 'View Content';

        const buttonsHtml = course.externalUrl
            ? `
                <button onclick="openExternalLinkModal(${course.id}, '${(course.title || '').replace(/'/g, "\\'")}', '${(course.description || '').replace(/'/g, "\\'")}', '${(course.externalUrl || '').replace(/'/g, "\\'")}', '${(course.coverImage || '').replace(/'/g, "\\'")}', '${course.status}')" style="flex:1; padding:8px; border:1px solid #cbd5e1; background:white; color:#475569; border-radius:6px; font-size:0.85rem; font-weight:bold; cursor:pointer;">${editLinkLabel}</button>
                <button onclick="window.open('${course.externalUrl}', '_blank')" style="flex:1; padding:8px; background:#0f172a; color:white; border:none; border-radius:6px; font-size:0.85rem; font-weight:bold; cursor:pointer;">${openLinkLabel}</button>
            `
            : `
                <button onclick="window.location.href='course_builder.html?id=${course.id}'" style="flex:1; padding:8px; border:1px solid #cbd5e1; background:white; color:#475569; border-radius:6px; font-size:0.85rem; font-weight:bold; cursor:pointer;">${editLabel}</button>
                <button onclick="window.location.href='course_content.html?id=${course.id}'" style="flex:1; padding:8px; background:#497aa7; color:white; border:none; border-radius:6px; font-size:0.85rem; font-weight:bold; cursor:pointer;">${viewContentLabel}</button>
            `;

        return `
            <div class="course-card" style="background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; display:flex; flex-direction:column;">
                ${thumbHtml}
                <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                        <h4 style="margin:0; color:#1e293b; font-size:1.1rem;">${course.title}</h4>
                        <span style="font-size:0.7rem; padding:3px 8px; border-radius:10px; background:${statusColor}; color:${textColor}; font-weight:bold;">${statusText}</span>
                    </div>
                    <p style="color:#64748b; font-size:0.85rem; margin-bottom:15px; flex:1;">${course.description || (window.t ? window.t('profile.noDescription', 'No description') : 'No description')}</p>
                    <div style="display:flex; gap:10px;">
                        ${buttonsHtml}
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
                    <h3 style="color: #1e293b; margin-bottom: 10px;">${window.t ? window.t('profile.noCoursesYet', 'You don\'t have any Courses yet.') : 'You don\'t have any Courses yet.'}</h3>
                    <p style="color: #64748b; margin-bottom: 20px;">${window.t ? window.t('profile.createFirstCourseDesc', 'Create your first course right now and set up the modules and landing page!') : 'Create your first course right now and set up the modules and landing page!'}</p>
                    <a href="course_builder.html" class="btn-primary" style="padding:12px 25px; border-radius:30px; background:#cf982e; color:white; text-decoration:none; font-weight:bold; display:inline-block;"><i class="fas fa-plus"></i> ${window.t ? window.t('profile.createNow', 'Create Now') : 'Create Now'}</a>
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

    // --- 2b. Load student-facing AI Tips ---
    const refreshAiTipsBtn = document.getElementById('btn-refresh-ai-tips');
    if (refreshAiTipsBtn) {
        refreshAiTipsBtn.addEventListener('click', () => loadAiTips({ refresh: true }));
    }
    await loadAiTips({ refresh: false });

    // --- 2c. Load creator Eurobot sync status ---
    const eurobotSyncBtn = document.getElementById('btn-eurobot-sync');
    if (eurobotSyncBtn) {
        eurobotSyncBtn.addEventListener('click', triggerEurobotKnowledgeSync);
    }
    const eurobotEnsureBtn = document.getElementById('btn-eurobot-ensure-default');
    if (eurobotEnsureBtn) {
        eurobotEnsureBtn.addEventListener('click', ensureEurobotKnowledgeBase);
    }
    loadEurobotSyncPanel();

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

            // Enforce student access control for creations tab early
            const earlyRoles = user.roles || [];
            const isCreator = earlyRoles.some(r => ['TEACHER', 'TUTOR', 'BUSINESS_MENTOR', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN'].includes(r)) || ['MASTER', 'ADMIN'].includes(user.role) || publishedCourses.length > 0;
            if (!isCreator && new URLSearchParams(window.location.search).get('tab') === 'creations') {
                window.location.replace('marketplace.html');
                return;
            }

            // Preenche Header Visual
            const nameToDisplay = profile.displayName || user.username || 'No Name';
            if (document.getElementById('settings-name')) document.getElementById('settings-name').value = nameToDisplay;
            const headerName = document.querySelector('.profile-details h2');
            if (headerName) headerName.innerText = nameToDisplay;

            const headerRole = document.querySelector('.profile-role');
            if (headerRole) {
                const userRole = (user.roles && user.roles.length > 0) ? user.roles[0] : (user.role || 'USER');
                headerRole.innerText = profile.headline || userRole;
                if (document.getElementById('settings-role')) document.getElementById('settings-role').value = userRole;
            }

            const headerBio = document.querySelector('.profile-bio');
            if (headerBio) {
                headerBio.innerText = profile.bio || 'Add a biography in Settings.';
                if (document.getElementById('settings-bio')) document.getElementById('settings-bio').value = profile.bio || '';
                if (document.getElementById('port-bio')) document.getElementById('port-bio').value = profile.bio || '';
            }
            if (profile.interests && document.getElementById('settings-interests')) {
                document.getElementById('settings-interests').value = profile.interests.join(', ');
            }
            if (profile.spokenLanguages) {
                const langStr = profile.spokenLanguages.join(', ');
                if (document.getElementById('settings-languages')) document.getElementById('settings-languages').value = langStr;
                if (document.getElementById('port-languages')) document.getElementById('port-languages').value = langStr;
                const headerLang = document.getElementById('header-languages');
                if (headerLang) headerLang.innerText = langStr;
            }
            if (profile.linkedinUrl && document.getElementById('port-linkedin')) document.getElementById('port-linkedin').value = profile.linkedinUrl;
            if (profile.githubUrl && document.getElementById('port-github')) document.getElementById('port-github').value = profile.githubUrl;
            if (profile.behanceUrl && document.getElementById('port-behance')) document.getElementById('port-behance').value = profile.behanceUrl;
            if (profile.artstationUrl && document.getElementById('port-artstation')) document.getElementById('port-artstation').value = profile.artstationUrl;
            if (profile.timezone && document.getElementById('port-timezone')) document.getElementById('port-timezone').value = profile.timezone;
            if (profile.organization && document.getElementById('port-organization')) document.getElementById('port-organization').value = profile.organization;
            if (profile.course && document.getElementById('port-course')) document.getElementById('port-course').value = profile.course;
            if (profile.location) {
                if (document.getElementById('port-location')) document.getElementById('port-location').value = profile.location;
                const headerLoc = document.getElementById('header-location');
                if (headerLoc) headerLoc.innerText = profile.location;
            }
            if (profile.websiteUrl && document.getElementById('port-website')) document.getElementById('port-website').value = profile.websiteUrl;
            
            const prefs = profileData.preferences || {};
            if (prefs.language && document.getElementById('settings-pref-language')) document.getElementById('settings-pref-language').value = prefs.language;
            if (prefs.theme && document.getElementById('settings-pref-theme')) document.getElementById('settings-pref-theme').value = prefs.theme;
            if (prefs.emailNotifications !== undefined && document.getElementById('settings-pref-email')) document.getElementById('settings-pref-email').checked = prefs.emailNotifications;
            if (prefs.allowDirectMessages !== undefined && document.getElementById('settings-pref-contact')) document.getElementById('settings-pref-contact').checked = prefs.allowDirectMessages;
            if (prefs.reduceMotion !== undefined && document.getElementById('settings-pref-motion')) document.getElementById('settings-pref-motion').checked = prefs.reduceMotion;
            if (prefs.highContrast !== undefined && document.getElementById('settings-pref-contrast')) document.getElementById('settings-pref-contrast').checked = prefs.highContrast;

            const consents = profileData.consents || {};
            if (consents.termsAndPrivacy && document.getElementById('settings-consent-terms')) document.getElementById('settings-consent-terms').checked = consents.termsAndPrivacy.granted;
            if (consents.marketingEmails && document.getElementById('settings-consent-marketing')) document.getElementById('settings-consent-marketing').checked = consents.marketingEmails.granted;
            if (consents.profileDiscovery && document.getElementById('settings-consent-discovery')) document.getElementById('settings-consent-discovery').checked = consents.profileDiscovery.granted;
            if (consents.worldProfileCard && document.getElementById('settings-consent-world')) document.getElementById('settings-consent-world').checked = consents.worldProfileCard.granted;

            // Global Navigation Visibility Rules
            const navCreations = document.getElementById('nav-creations');
            const navStudents = document.getElementById('nav-students');
            const navUsers = document.getElementById('nav-users');
            const roles = user.roles || [];
            
            if (navCreations) {
                const canCreate = roles.some(r => ['TEACHER', 'TUTOR', 'BUSINESS_MENTOR', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN'].includes(r)) || ['MASTER', 'ADMIN'].includes(user.role) || publishedCourses.length > 0;
                if (canCreate) {
                    navCreations.style.display = 'flex';
                }
            }
            const canManageStudentsProfile = roles.some(r => ['TEACHER', 'TUTOR', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN'].includes(r)) || ['MASTER', 'ADMIN'].includes(user.role);
            if (navStudents && canManageStudentsProfile) {
                navStudents.style.display = 'flex';
            }
            if (navUsers && user.role === 'MASTER') {
                navUsers.style.display = 'flex';
            }

            // Also load the avatar properly            // Foto de perfil precisa vir de User (que estÃƒÂ¡ vinculado)
            if (user.profilePicture) {
                document.getElementById('settings-profile-img-preview').src = user.profilePicture;
                const headerPhoto = document.querySelector('.profile-photo');
                if (headerPhoto) headerPhoto.src = user.profilePicture;
            }

            // Tags / Skills
            if (profile.skills && profile.skills.length > 0) {
                window.userTags = profile.skills.map(s => ({ name: s, bg: '#f1f5f9', text: '#333' }));
                if (typeof renderSelectedTags === 'function') renderSelectedTags();
                
                const headerSkills = document.getElementById('header-skills');
                if (headerSkills) {
                    headerSkills.innerHTML = profile.skills.map(s => `<span style="background:var(--panel-border, #e2e8f0); color:var(--text-secondary, #475569); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600;">${s}</span>`).join('');
                }
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
    const interestsStr = document.getElementById('settings-interests').value;
    const interests = interestsStr ? interestsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const languagesStr = document.getElementById('settings-languages').value;
    const languages = languagesStr ? languagesStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const photo = window.profileCustomPhoto; // Base64 if updated

    const language = document.getElementById('settings-pref-language')?.value || 'en-US';
    const theme = document.getElementById('settings-pref-theme')?.value || 'system';
    const emailNotifications = document.getElementById('settings-pref-email')?.checked || false;
    const allowDirectMessages = document.getElementById('settings-pref-contact')?.checked || false;
    const reduceMotion = document.getElementById('settings-pref-motion')?.checked || false;
    const highContrast = document.getElementById('settings-pref-contrast')?.checked || false;

    const termsAndPrivacy = document.getElementById('settings-consent-terms')?.checked || false;
    const marketingEmails = document.getElementById('settings-consent-marketing')?.checked || false;
    const profileDiscovery = document.getElementById('settings-consent-discovery')?.checked || false;
    const worldProfileCard = document.getElementById('settings-consent-world')?.checked || false;

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
                spokenLanguages: languages,
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
            if (window.setLanguage) {
                window.setLanguage(language);
            }
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
            alert(window.t ? window.t('common.success', 'Success') : 'Profile saved successfully!');
            location.reload();
        } else {
            alert(window.t ? window.t('common.error', 'Error') : 'Failed to save profile.');
        }
    } catch (err) {
        console.error(err);
        alert(window.t ? window.t('common.error', 'Error') : 'Error saving profile.');
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

    const language = document.getElementById('settings-pref-language')?.value || 'en-US';
    const theme = document.getElementById('settings-pref-theme')?.value || 'system';
    const emailNotifications = document.getElementById('settings-pref-email')?.checked || false;
    const allowDirectMessages = document.getElementById('settings-pref-contact')?.checked || false;
    const reduceMotion = document.getElementById('settings-pref-motion')?.checked || false;
    const highContrast = document.getElementById('settings-pref-contrast')?.checked || false;

    const termsAndPrivacy = document.getElementById('settings-consent-terms')?.checked || false;
    const marketingEmails = document.getElementById('settings-consent-marketing')?.checked || false;
    const profileDiscovery = document.getElementById('settings-consent-discovery')?.checked || false;
    const worldProfileCard = document.getElementById('settings-consent-world')?.checked || false;

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
            if (window.setLanguage) {
                window.setLanguage(language);
            }
            alert(window.t ? window.t('common.success', 'Success') : 'Professional Profile and Networks saved successfully!');
        } else {
            alert(window.t ? window.t('common.error', 'Error') : 'Failed to save portfolio.');
        }
    } catch (err) {
        console.error(err);
        alert(window.t ? window.t('common.error', 'Error') : 'Error saving portfolio.');
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
    const actionLink = item.actionUrl ? `<a href="${escapeHtml(item.actionUrl)}" style="color:#0ea5e9; text-decoration:none; font-size:11px; font-weight:bold;">Open</a>` : '';
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
                    ${item.actionUrl ? `<a href="${escapeHtml(item.actionUrl)}" style="color:#0ea5e9; text-decoration:none; font-size:11px; font-weight:bold;">Open</a>` : ''}
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
                    ${item.actionUrl ? `<a href="${escapeHtml(item.actionUrl)}" style="color:#0ea5e9; text-decoration:none; font-size:11px; font-weight:bold;">Open</a>` : ''}
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

    container.innerHTML = '<p data-i18n="profile.loadingEnrollments">Loading enrollments...</p>';
    if (window.applyTranslations) window.applyTranslations(container);

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
                <h3 data-i18n="profile.noEnrollments" style="margin: 0 0 10px 0; color: #1e293b;">No Enrollments Found</h3>
                <p data-i18n="profile.noEnrollmentsDesc" style="color: #64748b; margin: 0; max-width: 400px; margin: 0 auto;">You have no enrollments with this filter. Visit the marketplace to explore new content!</p>
            `;
            if (window.applyTranslations) window.applyTranslations(container);
            return;
        }

        let html = '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; text-align:left;">';
        filteredCourses.forEach(course => {
            const thumbUrl = course.coverImage || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=400&q=80';
            const progress = course.progressPercent || 0;
            
            html += `
                <style>
                    body.dark-theme .btn-3d-world { background: #1e1e1e !important; border-color: rgba(80, 80, 80, 0.8) !important; }
                    body.dark-theme .btn-3d-world:hover { background: #333333 !important; }
                    body.dark-theme .btn-3d-world i { color: #38bdf8 !important; }
                    body.dark-theme .btn-3d-world span { color: #94a3b8 !important; }
                    body.dark-theme .course-card .card-thumb { background-color: #ffffff !important; }
                    body.dark-theme .progress-track { background: #1e1e1e !important; }
                </style>
                <div class="course-card" style="background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; display:flex; flex-direction:column; cursor:pointer;" onclick="window.location.href='course_content.html?id=${course.id}'">
                    <div class="card-thumb" style="height:140px; background-image:url('${thumbUrl}'); background-size:cover; background-position:center;"></div>
                    <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 10px;">
                            <h4 style="margin:0; color:#1e293b; font-size:1.1rem; flex:1; padding-right:10px;">${course.title}</h4>
                            <button class="btn-3d-world" onclick="event.stopPropagation(); window.location.href='/world/index.html?courseId=${course.id}&token=' + localStorage.getItem('token') + '&source=training-platform'" style="background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; border-radius: 8px; width: 65px; height: 65px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; padding: 0;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Enter 3D Course World">
                                <i class="fas fa-cube" style="color: #44749f; font-size: 1.6rem;"></i>
                                <span style="font-size: 0.55rem; color: #64748b; margin-top: 5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">3D World</span>
                            </button>
                        </div>
                        <p style="font-size:0.85rem; color:#64748b; flex:1; margin-top:0;">By: ${course.creator}</p>
                        
                        <div style="margin-top: 15px;">
                            <div class="progress-text" style="display:flex; justify-content:space-between; font-size:0.8rem; color:#475569; margin-bottom:5px;">
                                <span>Progress</span>
                                <span>${progress}%</span>
                            </div>
                            <div class="progress-track" style="background:#e2e8f0; border-radius:10px; height:6px; overflow:hidden;">
                                <div style="background:#10b981; height:100%; width:${progress}%"></div>
                            </div>
                        </div>
                        <button class="btn-unsubscribe" onclick="event.stopPropagation(); window.unsubscribeCourse(${course.id})" style="margin-top:15px; background:none; border:1px solid #ef4444; color:#ef4444; border-radius:6px; padding:6px 12px; font-size:0.85rem; cursor:pointer; width:100%; transition:all 0.2s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">
                            <i class="fas fa-times-circle" style="margin-right:5px;"></i> Unsubscribe
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:#ef4444;">Erro ao carregar suas inscriÃƒÂ§ÃƒÂµes.</p>';
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
    if (!confirm('Are you sure you want to unsubscribe from this course? You will lose your progress.')) return;
    
    try {
        const res = await fetch(`/api/courses/${courseId}/unsubscribe`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        
        if (res.ok) {
            alert('Successfully unsubscribed.');
            window.loadSubscriptions();
        } else {
            const data = await res.json();
            alert('Erro: ' + (data.error || 'NÃƒÂ£o foi possÃƒÂ­vel desinscrever-se.'));
        }
    } catch (err) {
        console.error(err);
        alert('Erro de rede ao tentar desinscrever.');
    }
};

let editingExternalLinkId = null;

window.openExternalLinkModal = function(id = null, title = '', desc = '', url = '', cover = '', status = 'PUBLISHED') {
    editingExternalLinkId = id;
    document.getElementById('ext-link-title').value = title;
    document.getElementById('ext-link-description').value = desc;
    document.getElementById('ext-link-url').value = url;
    document.getElementById('ext-link-cover').value = cover;
    document.getElementById('ext-link-status').value = status;
    
    if (id) {
        document.getElementById('ext-link-delete-btn').style.display = 'block';
    } else {
        document.getElementById('ext-link-delete-btn').style.display = 'none';
    }
    
    // Reset file input and preview
    document.getElementById('ext-link-cover-file').value = '';
    const preview = document.getElementById('ext-link-cover-preview');
    const nameLabel = document.getElementById('ext-link-cover-name');
    if (cover) {
        preview.style.backgroundImage = `url('${cover}')`;
        preview.style.display = 'block';
        nameLabel.textContent = 'Imagem atual carregada';
    } else {
        preview.style.backgroundImage = 'none';
        preview.style.display = 'none';
        nameLabel.textContent = 'Nenhuma imagem selecionada';
    }
    
    document.getElementById('external-link-modal').style.display = 'flex';
};

window.previewExternalLinkCover = function(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('ext-link-cover-preview');
    const nameLabel = document.getElementById('ext-link-cover-name');
    if (file) {
        nameLabel.textContent = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.style.backgroundImage = `url('${e.target.result}')`;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        nameLabel.textContent = 'Nenhuma imagem selecionada';
        preview.style.display = 'none';
        preview.style.backgroundImage = 'none';
    }
};

window.closeExternalLinkModal = function() {
    document.getElementById('external-link-modal').style.display = 'none';
};

window.saveExternalLink = async function() {
    const title = document.getElementById('ext-link-title').value;
    const description = document.getElementById('ext-link-description').value;
    const externalUrl = document.getElementById('ext-link-url').value;
    const status = document.getElementById('ext-link-status').value;
    let coverImage = document.getElementById('ext-link-cover').value;
    const fileInput = document.getElementById('ext-link-cover-file');

    if (!title || !externalUrl) {
        alert('TÃƒÂ­tulo e URL sÃƒÂ£o obrigatÃƒÂ³rios!');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        
        // If user selected a new file, upload it first
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('document', fileInput.files[0]);
            
            // Upload the file directly to the Database via our existing document endpoint
            const uploadRes = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                coverImage = uploadData.downloadUrl; // Keep the URL serving from DB
            } else {
                const errorData = await uploadRes.json();
                alert('Falha ao fazer upload da imagem de capa: ' + (errorData.error || 'Erro desconhecido'));
                return;
            }
        }

        let res;
        
        // Wait! The POST route in this codebase is `/courses` and PUT is `/courses/:id`
        if (editingExternalLinkId) {
            res = await fetch(`/courses/${editingExternalLinkId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, description, externalUrl, coverImage, status })
            });
        } else {
            res = await fetch('/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, description, externalUrl, coverImage, status })
            });
        }

        if (res.ok) {
            closeExternalLinkModal();
            location.reload();
        } else {
            const data = await res.json();
            alert('Erro: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Erro ao salvar o link externo.');
    }
};

window.deleteExternalLink = async function() {
    if (!editingExternalLinkId) return;
    if (!confirm('Tem certeza que deseja excluir este link externo permanentemente?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/courses/${editingExternalLinkId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            closeExternalLinkModal();
            location.reload();
        } else {
            const data = await res.json();
            alert('Erro ao excluir: ' + data.error);
        }
    } catch(err) {
        console.error(err);
        alert('Erro de conexÃƒÂ£o ao tentar excluir.');
    }
};

window.deleteChannelCard = async function(channelId) {
    if(!confirm('Tem certeza que deseja excluir este canal? Os cursos vinculados não serão apagados.')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/channels/' + channelId, { 
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token } 
        });
        if(res.ok) {
            alert('Canal excluído com sucesso.');
            location.reload();
        } else {
            const err = await res.json();
            alert('Erro ao excluir o canal: ' + err.error);
        }
    } catch(e) { 
        console.error(e); 
        alert('Erro na comunicaÃƒÂ§ÃƒÂ£o com o servidor.');
    }
};
