document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // Auth Check
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const profileRes = await fetch('/api/profile/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileRes.ok) throw new Error('Not authenticated');
        const profileData = await profileRes.json();
        const user = profileData.user;
        
        if (user?.role !== 'MASTER') {
            window.location.href = 'marketplace.html';
            return;
        }

        // Show Master UI Elements
        document.getElementById('nav-user-avatar').style.display = 'flex';
        const navCreations = document.getElementById('nav-creations');
        if (navCreations) navCreations.style.display = 'flex';
        const navStudents = document.getElementById('nav-students');
        if (navStudents) navStudents.style.display = 'flex';
        const navSync = document.getElementById('nav-sync');
        if (navSync) navSync.style.display = 'flex';
        document.getElementById('nav-users').style.display = 'flex';

        // Set avatar
        const photoUrl = user?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
        document.getElementById('nav-user-avatar').innerHTML = `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;

        loadUsers();

        const logoutBtn = document.querySelector('.nav-item.logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            });
        }

    } catch (err) {
        console.error(err);
        window.location.href = 'login.html';
    }
});

async function loadUsers() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const users = data.users || data.data?.users;
        if (res.ok && users) {
            const tableBody = document.getElementById('users-table-body');
            tableBody.innerHTML = '';
            
            users.forEach(u => {
                const assignedRoles = u.roles || [];
                const roleDisplay = assignedRoles.length > 0 ? assignedRoles[0] : 'USER';
                
                tableBody.innerHTML += `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 15px 20px;">
                            <div style="font-weight: 600; color: #1e293b;">${u.username}</div>
                            <div style="font-size: 12px; color: #94a3b8;">ID: ${u.id}</div>
                        </td>
                        <td style="padding: 15px 20px; color: #64748b;">${u.email}</td>
                        <td style="padding: 15px 20px;">
                            <span style="background: ${u.role === 'MASTER' ? '#cf982e' : '#e2e8f0'}; color: ${u.role === 'MASTER' ? '#fff' : '#475569'}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                                ${u.role}
                            </span>
                        </td>
                        <td style="padding: 15px 20px;">
                            <select onchange="changeUserRole(${u.id}, this.value)" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px;">
                                <option value="USER" ${roleDisplay === 'USER' ? 'selected' : ''}>${window.t ? window.t('userManagement.roleNone', 'None') : 'None'}</option>
                                <option value="STUDENT" ${roleDisplay === 'STUDENT' ? 'selected' : ''}>${window.t ? window.t('userManagement.roleStudent', 'Student') : 'Student'}</option>
                                <option value="TEACHER" ${roleDisplay === 'TEACHER' ? 'selected' : ''}>${window.t ? window.t('userManagement.roleTeacher', 'Teacher') : 'Teacher'}</option>
                                <option value="TUTOR" ${roleDisplay === 'TUTOR' ? 'selected' : ''}>${window.t ? window.t('userManagement.roleTutor', 'Tutor') : 'Tutor'}</option>
                                <option value="BUSINESS_MENTOR" ${roleDisplay === 'BUSINESS_MENTOR' ? 'selected' : ''}>${window.t ? window.t('userManagement.roleBusinessMentor', 'Business Mentor') : 'Business Mentor'}</option>
                                <option value="COORDINATOR" ${roleDisplay === 'COORDINATOR' ? 'selected' : ''}>${window.t ? window.t('userManagement.roleCoordinator', 'Coordinator') : 'Coordinator'}</option>
                            </select>
                        </td>
                        <td style="padding: 15px 20px; text-align: right;">
                            <button onclick="deleteUser(${u.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 5px;" title="${window.t ? window.t('userManagement.deleteUser', 'Delete User') : 'Delete User'}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error(err);
    }
}

async function changeUserRole(userId, newRole) {
    const token = localStorage.getItem('token');
    const roles = newRole === 'USER' ? [] : [newRole];
    
    try {
        const res = await fetch(`/api/users/${userId}/roles`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roles })
        });
        
        if (res.ok) {
            // Optional: visual indication of success
        } else {
            const data = await res.json();
            alert(data.message || (window.t ? window.t('userManagement.failedUpdateRole', 'Failed to update user role.') : 'Failed to update user role.'));
            loadUsers(); // Revert back to original
        }
    } catch (err) {
        console.error(err);
        alert(window.t ? window.t('common.error', 'Error') : 'An error occurred.');
    }
}

async function deleteUser(userId) {
    const confirmMsg = window.t ? window.t('userManagement.confirmDelete', 'Are you sure you want to permanently delete this user? This action cannot be undone.') : 'Are you sure you want to permanently delete this user? This action cannot be undone.';
    if (!confirm(confirmMsg)) {
        return;
    }
    
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (res.ok) {
            loadUsers();
        } else {
            const data = await res.json();
            alert(data.message || (window.t ? window.t('userManagement.failedDelete', 'Failed to delete user.') : 'Failed to delete user.'));
        }
    } catch (err) {
        console.error(err);
        alert(window.t ? window.t('common.error', 'Error') : 'An error occurred.');
    }
}
