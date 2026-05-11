document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // Auth Check
    if (!token) {
        window.location.href = 'index.html';
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
            window.location.href = 'index.html';
            return;
        }

        // Show Master UI Elements
        document.getElementById('nav-user-avatar').style.display = 'flex';
        document.getElementById('nav-users').style.display = 'flex';

        // Set avatar
        const photoUrl = user?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
        document.getElementById('nav-user-avatar').innerHTML = `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;

        loadUsers();

    } catch (err) {
        console.error(err);
        window.location.href = 'index.html';
    }
});

async function loadUsers() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data && data.data.users) {
            const tableBody = document.getElementById('users-table-body');
            tableBody.innerHTML = '';
            
            data.data.users.forEach(u => {
                const assignedRoles = (u.roleAssignments || []).map(r => r.role);
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
                                <option value="USER" ${roleDisplay === 'USER' ? 'selected' : ''}>None</option>
                                <option value="STUDENT" ${roleDisplay === 'STUDENT' ? 'selected' : ''}>Student</option>
                                <option value="TEACHER" ${roleDisplay === 'TEACHER' ? 'selected' : ''}>Teacher</option>
                                <option value="TUTOR" ${roleDisplay === 'TUTOR' ? 'selected' : ''}>Tutor</option>
                                <option value="BUSINESS_MENTOR" ${roleDisplay === 'BUSINESS_MENTOR' ? 'selected' : ''}>Business Mentor</option>
                                <option value="COORDINATOR" ${roleDisplay === 'COORDINATOR' ? 'selected' : ''}>Coordinator</option>
                            </select>
                        </td>
                        <td style="padding: 15px 20px; text-align: right;">
                            <button onclick="deleteUser(${u.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 5px;" title="Delete User">
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
            alert(data.message || 'Failed to update user role.');
            loadUsers(); // Revert back to original
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred.');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
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
            alert(data.message || 'Failed to delete user.');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred.');
    }
}
