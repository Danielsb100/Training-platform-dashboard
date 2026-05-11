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
                    popupBadge.innerText = `${unreadCount} new`;
                } else {
                    popupBadge.style.display = 'none';
                }
            }
            
            const listContainer = document.getElementById('popup-notification-list');
            if (listContainer) {
                if (inbox.length === 0) {
                    listContainer.innerHTML = '<div style="padding:15px; color:#64748b; text-align:center;">No notifications</div>';
                } else {
                    listContainer.innerHTML = inbox.map(n => `
                        <div style="padding:15px 20px; border-bottom:1px solid #f1f5f9; cursor:pointer; background: ${n.isRead ? 'transparent' : '#e0f2fe'}" onclick="markNotificationRead(${n.id})">
                            <strong style="color:#cf982e; font-size:14px;">${n.title || 'Notification'}</strong>
                            <p style="margin:5px 0 0 0; font-size:13px; color:#64748b;">${n.message}</p>
                        </div>
                    `).join('');
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
