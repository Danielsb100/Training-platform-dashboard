// ==========================================
// ROOMS MANAGER — 3D World Room Management
// Used in course_builder.html student section
// ==========================================

let courseRooms = [];
let editingRoomId = null;
let roomMemberSearchTimeout = null;

const API_BASE = window.location.origin;

function getRoomToken() {
    return localStorage.getItem('token');
}

function getCourseOwnerMasterId() {
    return window.apiCourseData?.ownerMasterId || null;
}

async function roomApiCall(endpoint, method = 'GET', body = null) {
    const token = getRoomToken();
    if (!token) throw new Error('No token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request error');
    return data.data || data;
}

// ==========================================
// LOAD & RENDER ROOMS
// ==========================================

async function loadCourseRooms() {
    if (!window.editingCourseId) return;
    try {
        courseRooms = await roomApiCall(`/api/courses/${window.editingCourseId}/rooms`);
        renderRoomsDashboard();
        renderRoomsGrid();
    } catch (err) {
        console.error('Failed to load rooms:', err);
    }
}

function renderRoomsDashboard() {
    const container = document.getElementById('rooms-dashboard');
    if (!container) return;

    const totalRooms = courseRooms.length;
    const activeRooms = courseRooms.filter(r => r.isActive).length;
    const totalMembers = courseRooms.reduce((sum, r) => sum + (r._count?.members || 0), 0);
    const totalOnline = courseRooms.reduce((sum, r) => sum + (r.onlineCount || 0), 0);

    container.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:20px;">
            <div style="background:linear-gradient(135deg, #497aa7, #3b6a94); padding:16px; border-radius:10px; text-align:center; color:white;">
                <div style="font-size:1.8rem; font-weight:800;">${totalRooms}</div>
                <div style="font-size:0.75rem; opacity:0.9; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px;">Total Rooms</div>
            </div>
            <div style="background:linear-gradient(135deg, #10b981, #059669); padding:16px; border-radius:10px; text-align:center; color:white;">
                <div style="font-size:1.8rem; font-weight:800;">${activeRooms}</div>
                <div style="font-size:0.75rem; opacity:0.9; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px;">Active</div>
            </div>
            <div style="background:linear-gradient(135deg, #cf982e, #b88625); padding:16px; border-radius:10px; text-align:center; color:white;">
                <div style="font-size:1.8rem; font-weight:800;">${totalMembers}</div>
                <div style="font-size:0.75rem; opacity:0.9; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px;">Members</div>
            </div>
            <div style="background:linear-gradient(135deg, #6366f1, #4f46e5); padding:16px; border-radius:10px; text-align:center; color:white;">
                <div style="font-size:1.8rem; font-weight:800;">${totalOnline}</div>
                <div style="font-size:0.75rem; opacity:0.9; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px;">Online Now</div>
            </div>
        </div>
    `;
}

function renderRoomsGrid() {
    const container = document.getElementById('rooms-grid');
    if (!container) return;

    if (courseRooms.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:#94a3b8; grid-column: 1 / -1;">
                <i class="fas fa-door-open" style="font-size:3rem; margin-bottom:15px; opacity:0.4;"></i>
                <p style="margin:0; font-size:0.95rem;">No rooms created yet. Click <b>"+ Create Room"</b> to get started.</p>
            </div>`;
        return;
    }

    container.innerHTML = courseRooms.map(room => {
        const memberCount = room._count?.members || 0;
        const isActive = room.isActive;
        const statusColor = isActive ? '#10b981' : '#ef4444';
        const statusLabel = isActive ? 'Active' : 'Inactive';
        const hasSchedule = room.startsAt || room.endsAt;
        const thumbStyle = room.thumbnail
            ? `background-image:url('${room.thumbnail}'); background-size:cover; background-position:center;`
            : 'background: linear-gradient(135deg, #1e293b, #334155);';
        const isSelected = editingRoomId === room.id;

        return `
            <div class="room-card-item" onclick="selectRoomForEdit(${room.id})"
                 style="border-radius:12px; overflow:hidden; cursor:pointer; transition:all 0.2s; border:2px solid ${isSelected ? '#cf982e' : '#e2e8f0'}; box-shadow:${isSelected ? '0 0 0 3px rgba(207,152,46,0.2)' : '0 2px 4px rgba(0,0,0,0.04)'};"
                 onmouseover="if(!${isSelected}) this.style.borderColor='#cbd5e1'; this.style.transform='translateY(-2px)';"
                 onmouseout="if(!${isSelected}) this.style.borderColor='#e2e8f0'; this.style.transform='translateY(0)';">
                <div style="height:90px; ${thumbStyle} position:relative; display:flex; align-items:flex-end; padding:10px;">
                    <div style="background:linear-gradient(to top, rgba(0,0,0,0.7), transparent); position:absolute; inset:0;"></div>
                    <div style="position:relative; z-index:1; display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <span style="background:${statusColor}; color:white; padding:2px 8px; border-radius:10px; font-size:0.65rem; font-weight:700; text-transform:uppercase;">${statusLabel}</span>
                        <span style="color:rgba(255,255,255,0.9); font-size:0.7rem;"><i class="fas fa-users"></i> ${memberCount}</span>
                    </div>
                </div>
                <div style="padding:12px; background:white;">
                    <h4 style="margin:0 0 4px 0; font-size:0.95rem; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${room.title}</h4>
                    <p style="margin:0; font-size:0.75rem; color:#64748b; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${room.description || 'No description'}</p>
                    ${hasSchedule ? `<div style="margin-top:8px; font-size:0.7rem; color:#94a3b8;"><i class="fas fa-calendar-alt"></i> ${room.startsAt ? new Date(room.startsAt).toLocaleDateString() : '∞'} — ${room.endsAt ? new Date(room.endsAt).toLocaleDateString() : '∞'}</div>` : ''}
                    ${room.maxMembers ? `<div style="margin-top:4px; font-size:0.7rem; color:#94a3b8;"><i class="fas fa-user-lock"></i> Limit: ${memberCount}/${room.maxMembers}</div>` : ''}
                </div>
            </div>`;
    }).join('');
}

// ==========================================
// ROOM CREATION
// ==========================================

async function createNewRoom() {
    if (!window.editingCourseId) {
        alert('Save the course first before creating rooms.');
        return;
    }

    try {
        const room = await roomApiCall(`/api/courses/${window.editingCourseId}/rooms`, 'POST', {
            title: 'New Room',
            description: '',
        });
        await loadCourseRooms();
        selectRoomForEdit(room.id);
    } catch (err) {
        alert('Error creating room: ' + err.message);
    }
}

// ==========================================
// ROOM EDITING
// ==========================================

function selectRoomForEdit(roomId) {
    editingRoomId = roomId;
    renderRoomsGrid(); // Update selection highlight
    renderRoomEditor();
}

function closeRoomEditor() {
    editingRoomId = null;
    const editor = document.getElementById('room-editor-panel');
    if (editor) editor.style.display = 'none';
    renderRoomsGrid();
}

function renderRoomEditor() {
    const panel = document.getElementById('room-editor-panel');
    if (!panel) return;

    const room = courseRooms.find(r => r.id === editingRoomId);
    if (!room) { panel.style.display = 'none'; return; }

    panel.style.display = 'block';

    const members = room.members || [];

    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #e2e8f0; padding-bottom:15px;">
            <h3 style="margin:0; color:#1e293b; font-size:1.2rem;"><i class="fas fa-cog"></i> Room Settings</h3>
            <button onclick="closeRoomEditor()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer;" title="Close"><i class="fas fa-times"></i></button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
            <div>
                <label style="display:block; font-weight:bold; color:#475569; margin-bottom:5px; font-size:0.85rem;">Room Title</label>
                <input type="text" id="room-edit-title" value="${room.title || ''}" placeholder="Room title..."
                    style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit; font-size:0.9rem;">
            </div>
            <div>
                <label style="display:block; font-weight:bold; color:#475569; margin-bottom:5px; font-size:0.85rem;">Max Members</label>
                <input type="number" id="room-edit-max-members" value="${room.maxMembers || ''}" placeholder="Unlimited"
                    style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit; font-size:0.9rem;" min="1">
            </div>
        </div>

        <div style="margin-top:15px;">
            <label style="display:block; font-weight:bold; color:#475569; margin-bottom:5px; font-size:0.85rem;">Description</label>
            <textarea id="room-edit-description" rows="3" placeholder="What is this room for..."
                style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit; font-size:0.9rem; resize:vertical;">${room.description || ''}</textarea>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:15px;">
            <div>
                <label style="display:block; font-weight:bold; color:#475569; margin-bottom:5px; font-size:0.85rem;">Thumbnail URL</label>
                <div style="display:flex; gap:8px;">
                    <input type="text" id="room-edit-thumbnail" value="${room.thumbnail && !room.thumbnail.startsWith('data:') ? room.thumbnail : ''}" placeholder="https://..."
                        style="flex:1; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit; font-size:0.9rem;">
                    <input type="file" id="room-thumb-upload" accept="image/*" style="display:none;" onchange="handleRoomThumbUpload(event)">
                    <button onclick="document.getElementById('room-thumb-upload').click()" style="background:#e2e8f0; border:none; padding:0 15px; border-radius:8px; cursor:pointer; color:#475569; font-weight:bold;" title="Upload image"><i class="fas fa-upload"></i></button>
                </div>
            </div>
            <div>
                <label style="display:block; font-weight:bold; color:#475569; margin-bottom:5px; font-size:0.85rem;">Status</label>
                <select id="room-edit-active" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit; font-size:0.9rem;">
                    <option value="true" ${room.isActive ? 'selected' : ''}>Active</option>
                    <option value="false" ${!room.isActive ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:15px;">
            <div>
                <label style="display:block; font-weight:bold; color:#475569; margin-bottom:5px; font-size:0.85rem;">Start Date <span style="color:#94a3b8; font-weight:normal;">(optional)</span></label>
                <input type="datetime-local" id="room-edit-starts" value="${room.startsAt ? new Date(room.startsAt).toISOString().slice(0,16) : ''}"
                    style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit; font-size:0.9rem;">
            </div>
            <div>
                <label style="display:block; font-weight:bold; color:#475569; margin-bottom:5px; font-size:0.85rem;">End Date <span style="color:#94a3b8; font-weight:normal;">(optional)</span></label>
                <input type="datetime-local" id="room-edit-ends" value="${room.endsAt ? new Date(room.endsAt).toISOString().slice(0,16) : ''}"
                    style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit; font-size:0.9rem;">
            </div>
        </div>

        <div style="display:flex; gap:10px; margin-top:20px;">
            <button onclick="saveRoomEdits()" style="flex:1; padding:10px; background:#cf982e; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#b88625'" onmouseout="this.style.background='#cf982e'"><i class="fas fa-save"></i> Save Room</button>
            <button onclick="deleteRoom(${room.id})" style="padding:10px 20px; background:none; border:2px solid #ef4444; color:#ef4444; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#ef4444'; this.style.color='white'" onmouseout="this.style.background='none'; this.style.color='#ef4444'"><i class="fas fa-trash"></i></button>
        </div>

        <!-- Members Management -->
        <div style="margin-top:25px; border-top:2px solid #e2e8f0; padding-top:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h4 style="margin:0; color:#1e293b; font-size:1rem;"><i class="fas fa-link"></i> Link Students</h4>
            </div>
            <div style="position:relative; margin-bottom:15px;">
                <input type="text" id="room-member-search" placeholder="Filter enrolled students..."
                    style="width:100%; padding:10px 15px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit; font-size:0.9rem;"
                    oninput="renderRoomMembersLists()">
            </div>
            <div id="room-unlinked-list" style="max-height:200px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:8px; background:#f8fafc; margin-bottom: 20px;">
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h4 style="margin:0; color:#1e293b; font-size:1rem;"><i class="fas fa-users"></i> Room Members <span style="color:#94a3b8; font-weight:normal; font-size:0.85rem;">(${members.filter(m => m.user?.id !== getCourseOwnerMasterId()).length}${room.maxMembers ? '/' + room.maxMembers : ''})</span></h4>
            </div>
            <div id="room-members-list" style="max-height:200px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:8px; background:#f8fafc;">
            </div>
        </div>
    `;

    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(renderRoomMembersLists, 0);
}

// ==========================================
// ROOM SAVE / DELETE
// ==========================================

async function saveRoomEdits() {
    if (!editingRoomId || !window.editingCourseId) return;

    const title = document.getElementById('room-edit-title').value;
    const description = document.getElementById('room-edit-description').value;
    const thumbnailUrl = document.getElementById('room-edit-thumbnail').value;
    const maxMembers = document.getElementById('room-edit-max-members').value;
    const isActive = document.getElementById('room-edit-active').value === 'true';
    const startsAt = document.getElementById('room-edit-starts').value || null;
    const endsAt = document.getElementById('room-edit-ends').value || null;

    // Determine thumbnail: use URL field if provided, otherwise keep existing
    const room = courseRooms.find(r => r.id === editingRoomId);
    let thumbnail = room?.thumbnail || null;
    if (thumbnailUrl.trim()) {
        thumbnail = thumbnailUrl.trim();
    }

    try {
        await roomApiCall(`/api/courses/${window.editingCourseId}/rooms/${editingRoomId}`, 'PUT', {
            title, description, thumbnail, maxMembers: maxMembers || null, isActive, startsAt, endsAt
        });
        await loadCourseRooms();
        selectRoomForEdit(editingRoomId);
    } catch (err) {
        alert('Error saving room: ' + err.message);
    }
}

async function deleteRoom(roomId) {
    if (!confirm('Are you sure you want to permanently delete this room and remove all its members?')) return;

    try {
        await roomApiCall(`/api/courses/${window.editingCourseId}/rooms/${roomId}`, 'DELETE');
        editingRoomId = null;
        document.getElementById('room-editor-panel').style.display = 'none';
        await loadCourseRooms();
    } catch (err) {
        alert('Error deleting room: ' + err.message);
    }
}

// ==========================================
// THUMBNAIL UPLOAD
// ==========================================

async function handleRoomThumbUpload(event) {
    const file = event.target.files[0];
    if (!file || !editingRoomId) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            await roomApiCall(`/api/courses/${window.editingCourseId}/rooms/${editingRoomId}`, 'PUT', {
                thumbnail: e.target.result
            });
            await loadCourseRooms();
            selectRoomForEdit(editingRoomId);
        } catch (err) {
            alert('Error uploading thumbnail: ' + err.message);
        }
    };
    reader.readAsDataURL(file);
}

// ==========================================
// MEMBER MANAGEMENT
// ==========================================

function renderRoomMembersLists() {
    const unlinkedContainer = document.getElementById('room-unlinked-list');
    const linkedContainer = document.getElementById('room-members-list');
    const searchInput = document.getElementById('room-member-search');
    
    if (!unlinkedContainer || !linkedContainer) return;
    
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const room = courseRooms.find(r => r.id === editingRoomId);
    if (!room) return;
    
    const members = room.members || [];
    const memberUserIds = members.map(m => m.user?.id);
    const ownerMasterId = getCourseOwnerMasterId();
    
    // Filter enrolled students for unlinked list
    const enrolled = window.enrolledStudentsData || [];
    
    // Exclude already-linked students AND the course owner (owner has implicit access)
    const unlinked = enrolled.filter(u => !memberUserIds.includes(u.id) && u.id !== ownerMasterId).filter(u => 
        (u.username && u.username.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query))
    );
    
    if (unlinked.length === 0) {
        unlinkedContainer.innerHTML = '<p style="padding:15px; margin:0; text-align:center; color:#94a3b8; font-size:0.85rem;">No students found to link.</p>';
    } else {
        unlinkedContainer.innerHTML = unlinked.map(u => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 15px; border-bottom:1px solid #e2e8f0; transition:0.1s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${u.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.username || '?')}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                    <div>
                        <div style="font-weight:600; font-size:0.85rem; color:#1e293b;">${u.username || 'Unknown'}</div>
                        <div style="font-size:0.75rem; color:#94a3b8;">${u.email || ''}</div>
                    </div>
                </div>
                <button onclick="addRoomMember(${u.id})" style="background:none; border:none; color:#10b981; cursor:pointer; font-size:1.2rem; padding:4px;" title="Link Student"><i class="fas fa-plus-circle"></i></button>
            </div>
        `).join('');
    }
    
    // Render linked members
    if (members.length === 0) {
        linkedContainer.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:20px; margin:0; font-size:0.85rem;">No members yet. Link students from the list above.</p>';
    } else {
        linkedContainer.innerHTML = members.map(m => {
            const isOwner = m.user?.id === ownerMasterId;
            return `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 15px; border-bottom:1px solid #e2e8f0; transition:0.1s;${isOwner ? ' background:#fffbeb;' : ''}" onmouseover="this.style.background='${isOwner ? '#fef3c7' : '#f1f5f9'}'" onmouseout="this.style.background='${isOwner ? '#fffbeb' : 'transparent'}'">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${m.user?.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.user?.username || '?')}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                    <div>
                        <div style="font-weight:600; font-size:0.85rem; color:#1e293b;">${m.user?.username || 'Unknown'}${isOwner ? ' <span style="background:#cf982e; color:white; padding:1px 6px; border-radius:8px; font-size:0.65rem; font-weight:700; margin-left:6px;">OWNER</span>' : ''}</div>
                        <div style="font-size:0.75rem; color:#94a3b8;">${m.user?.email || ''}</div>
                    </div>
                </div>
                ${isOwner ? '' : `<button onclick="removeRoomMember(${room.id}, ${m.user?.id})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.2rem; padding:4px;" title="Remove"><i class="fas fa-minus-circle"></i></button>`}
            </div>`;
        }).join('');
    }
}

async function addRoomMember(userId) {
    if (!editingRoomId || !window.editingCourseId) return;

    document.getElementById('room-member-search').value = '';

    try {
        await roomApiCall(`/api/courses/${window.editingCourseId}/rooms/${editingRoomId}/members`, 'POST', {
            userIds: [userId]
        });
        await loadCourseRooms();
        selectRoomForEdit(editingRoomId);
    } catch (err) {
        alert('Error adding member: ' + err.message);
    }
}

async function removeRoomMember(roomId, userId) {
    if (!confirm('Remove this member from the room?')) return;

    try {
        await roomApiCall(`/api/courses/${window.editingCourseId}/rooms/${roomId}/members/${userId}`, 'DELETE');
        await loadCourseRooms();
        selectRoomForEdit(editingRoomId);
    } catch (err) {
        alert('Error removing member: ' + err.message);
    }
}
