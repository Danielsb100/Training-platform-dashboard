// ==========================================
// ROOM SELECT — Student-facing room picker
// Loads rooms for the current course and
// displays them with real-time online counts.
// ==========================================

const API_URL = window.location.origin;

function getToken() {
    return localStorage.getItem('token');
}

function getCourseIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('courseId');
}

async function apiCall(endpoint) {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        throw new Error('No token');
    }
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request error');
    return data.data || data;
}

function checkRoomAccess(room) {
    if (room.isGlobal) return { canEnter: true, reason: null };
    
    if (!room.isActive) return { canEnter: false, reason: 'Room is inactive' };
    
    const now = new Date();
    if (room.startsAt) {
        const starts = new Date(room.startsAt);
        if (now < starts) {
            return { canEnter: false, reason: `Starts at ${starts.toLocaleString([], {day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'})}` };
        }
    }
    
    if (room.endsAt) {
        const ends = new Date(room.endsAt);
        if (now > ends) {
            return { canEnter: false, reason: 'Room has ended' };
        }
    }
    
    return { canEnter: true, reason: null };
}

function enterRoom(courseId, roomId) {
    const token = getToken();
    let url;
    if (roomId) {
        url = `/world/index.html?courseId=${courseId}&roomId=${roomId}&token=${token}&source=training-platform`;
    } else {
        // Global room — no roomId
        url = `/world/index.html?courseId=${courseId}&token=${token}&source=training-platform`;
    }
    window.location.href = url;
}

function renderRooms(rooms, courseId) {
    const grid = document.getElementById('rooms-grid');

    if (!rooms || rooms.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-door-closed"></i>
                <h3>No rooms available</h3>
                <p>You don't have access to any rooms in this course yet. Contact your teacher.</p>
            </div>`;
        return;
    }

    grid.innerHTML = rooms.map(room => {
        const isGlobal = room.isGlobal;
        const onlineCount = room.onlineCount || 0;
        const memberCount = room._count?.members || 0;
        const hasThumb = room.thumbnail;
        const roomIdParam = isGlobal ? null : room.id;
        
        const access = checkRoomAccess(room);
        const disabledStyle = access.canEnter ? '' : 'opacity: 0.6; filter: grayscale(1); pointer-events: none;';
        const reasonBadge = !access.canEnter ? `<div style="position:absolute; inset:0; background:rgba(15,23,42,0.8); z-index:10; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; font-weight:bold; pointer-events:auto; backdrop-filter:blur(4px); border-radius:16px;">
            <i class="fas fa-lock" style="font-size:2.5rem; margin-bottom:15px; color:#cf982e;"></i>
            <span style="background:#1e293b; padding:8px 20px; border-radius:20px; font-size:0.95rem; border:1px solid rgba(255,255,255,0.1); text-align:center;">${access.reason}</span>
        </div>` : '';

        return `
            <div class="room-card ${isGlobal ? 'global-room' : ''}" style="${disabledStyle} position:relative;" ${access.canEnter ? `onclick="enterRoom(${courseId}, ${roomIdParam})"` : ''} id="room-card-${room.id || 'global'}">
                ${reasonBadge}
                <div class="room-thumb" ${hasThumb ? `style="background:none;"` : ''}>
                    ${hasThumb ? `<img src="${room.thumbnail}" alt="${room.title}">` : `<i class="fas ${isGlobal ? 'fa-globe' : 'fa-door-open'} room-icon"></i>`}
                    ${isGlobal ? '<span class="global-badge"><i class="fas fa-globe"></i> Open to All</span>' : ''}
                    <span class="online-badge" data-room-id="${isGlobal ? 'global' : room.id}">
                        <span class="pulse"></span>
                        <span class="online-count">${onlineCount}</span> online
                    </span>
                </div>
                <div class="room-body">
                    <h3>${room.title}</h3>
                    <p>${room.description || (isGlobal ? 'Default room — all course students can enter.' : 'No description')}</p>
                </div>
                <div class="room-footer">
                    <span class="members">
                        <i class="fas fa-users"></i>
                        ${isGlobal ? 'All students' : `${memberCount} member${memberCount !== 1 ? 's' : ''}`}
                    </span>
                    <button class="enter-btn" ${access.canEnter ? `onclick="event.stopPropagation(); enterRoom(${courseId}, ${roomIdParam})"` : 'disabled'} style="${!access.canEnter ? 'background:#475569; color:#94a3b8;' : ''}">
                        <i class="fas fa-sign-in-alt"></i> Enter
                    </button>
                </div>
            </div>`;
    }).join('');
}

// ==========================================
// REAL-TIME ONLINE COUNT POLLING
// ==========================================

let onlineCountInterval = null;

async function updateOnlineCounts(courseId, rooms) {
    for (const room of rooms) {
        try {
            const roomIdParam = room.isGlobal ? 'global' : room.id;
            const data = await apiCall(`/api/courses/${courseId}/rooms/${roomIdParam}/online-count`);
            const badge = document.querySelector(`[data-room-id="${room.isGlobal ? 'global' : room.id}"] .online-count`);
            if (badge) badge.textContent = data.onlineCount || 0;
        } catch (e) {
            // Silently ignore polling errors
        }
    }
}

function startOnlineCountPolling(courseId, rooms) {
    // Poll every 10 seconds
    onlineCountInterval = setInterval(() => updateOnlineCounts(courseId, rooms), 10000);
}

// ==========================================
// INITIALIZATION
// ==========================================

async function init() {
    const courseId = getCourseIdFromUrl();
    if (!courseId) {
        document.getElementById('rooms-grid').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>No course specified</h3>
                <p>Please access this page from your enrolled courses.</p>
            </div>`;
        return;
    }

    try {
        // Load course info
        const course = await apiCall(`/courses/${courseId}`);
        document.getElementById('course-name').textContent = course.title || `Course #${courseId}`;

        // Load rooms
        const rooms = await apiCall(`/api/courses/${courseId}/rooms/my`);
        renderRooms(rooms, courseId);

        // If only 1 room (the global one) and no specific rooms, go directly to 3D world
        if (rooms.length === 1 && rooms[0].isGlobal) {
            enterRoom(courseId, null);
            return;
        }

        // Start real-time polling
        startOnlineCountPolling(courseId, rooms);

    } catch (err) {
        console.error('Failed to load rooms:', err);
        document.getElementById('rooms-grid').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error loading rooms</h3>
                <p>${err.message}</p>
            </div>`;
    }
}

// Cleanup on page leave
window.addEventListener('beforeunload', () => {
    if (onlineCountInterval) clearInterval(onlineCountInterval);
});

document.addEventListener('DOMContentLoaded', init);
