async function loadGlobalNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch('/api/notifications/summary', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const result = await res.json();
            const summary = result.data || result;
            const inbox = summary.inbox || [];
            
            const unreadCount = inbox.filter(n => !n.isRead).length;
            
            // Update nav badges
            document.querySelectorAll('.global-nav-bell-badge').forEach(badge => {
                if (unreadCount > 0) {
                    badge.style.display = 'inline-block';
                    badge.innerText = unreadCount;
                } else {
                    badge.style.display = 'none';
                }
            });
            
            const popupBadge = document.getElementById('popup-unread-badge');
            if (popupBadge) {
                if (unreadCount > 0) {
                    popupBadge.style.display = 'inline-block';
                    const renderBadge = () => { popupBadge.innerText = `${unreadCount} ${window.t ? window.t('common.new', 'new') : 'new'}`; };
                    if (window.onI18nReady) window.onI18nReady(renderBadge); else renderBadge();
                } else {
                    popupBadge.style.display = 'none';
                }
            }
            
            const listContainer = document.getElementById('popup-notification-list');
            if (listContainer) {
                if (inbox.length === 0) {
                    const renderEmpty = () => {
                        listContainer.innerHTML = `<div style="padding:15px; color:#64748b; text-align:center;">${window.t ? window.t('notifications.noNotifications', 'No notifications') : 'No notifications'}</div>`;
                    };
                    if (window.onI18nReady) window.onI18nReady(renderEmpty); else renderEmpty();
                } else {
                    const renderList = () => {
                        listContainer.innerHTML = inbox.map(n => {
                            let title = n.title || 'Notification';
                            let message = n.message || '';
                            if (title.startsWith('You have subscribed to ')) {
                                let courseName = title.replace('You have subscribed to ', '');
                                title = window.t ? window.t('notifications.subscribedTitle', 'You have subscribed to {course}').replace('{course}', courseName) : title;
                            } else if (title.startsWith('You have been added as a Co-Editor')) {
                                title = window.t ? window.t('notifications.coEditorTitle', 'You have been added as a Co-Editor') : title;
                            }
                            
                            if (message.startsWith('You successfully enrolled in ')) {
                                let courseName = message.replace('You successfully enrolled in ', '').replace('.', '');
                                message = window.t ? window.t('notifications.subscribedMessage', 'You successfully enrolled in {course}.').replace('{course}', courseName) : message;
                            } else if (message.includes('has added you as a co-editor')) {
                                let parts = message.split(' has added you as a co-editor on ');
                                if(parts.length === 2) {
                                    message = window.t ? window.t('notifications.coEditorMessage', '{user} has added you as a co-editor on {course}').replace('{user}', parts[0]).replace('{course}', parts[1]) : message;
                                }
                            }
                            
                            return `
                            <div style="padding:15px 20px; border-bottom:1px solid #f1f5f9; cursor:pointer; background: ${n.isRead ? 'transparent' : '#e0f2fe'}" onclick="markNotificationRead(${n.id})">
                                <strong style="color:#cf982e; font-size:14px;">${title}</strong>
                                <p style="margin:5px 0 0 0; font-size:13px; color:#64748b;">${message}</p>
                            </div>
                        `;
                        }).join('');
                    };
                    if (window.onI18nReady) window.onI18nReady(renderList); else renderList();
                }
            }
        }
    } catch (e) {
        console.error('Failed to load notifications', e);
    }
}

async function markNotificationRead(id) {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        await fetch(`/api/notifications/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadGlobalNotifications();
    } catch (e) {
        console.error('Failed to mark read', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadGlobalNotifications();
});

function toggleNotifications(event) {
    if (event) event.stopPropagation();
    const popup = document.getElementById('notification-popup');
    if (popup) {
        popup.style.display = (popup.style.display === 'none') ? 'block' : 'none';
        if (popup.style.display === 'block') {
            loadGlobalNotifications();
        }
    }
}

document.addEventListener('click', function (event) {
    const popup = document.getElementById('notification-popup');
    if (popup && popup.style.display === 'block' && !popup.contains(event.target)) {
        popup.style.display = 'none';
    }
});

window.applyThemeToBody = function(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    if (theme) {
        localStorage.setItem('user-theme', theme);
    } else {
        localStorage.removeItem('user-theme');
    }
};

// Initialize theme globally
(function() {
    const savedTheme = localStorage.getItem('user-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
})();
