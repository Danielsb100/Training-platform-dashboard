document.addEventListener('DOMContentLoaded', async () => {
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

    let rows = [];
    let courses = [];

    const tableBody = document.getElementById('students-table-body');
    const searchInput = document.getElementById('student-search');
    const courseFilter = document.getElementById('course-filter');
    const statusFilter = document.getElementById('status-filter');

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const truncate = (value, max = 110) => {
        const text = String(value || '');
        return text.length > max ? `${text.slice(0, max - 1)}...` : text;
    };

    const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`;

    const renderAvatar = (student) => {
        if (student.profilePicture) {
            return `<span class="student-avatar"><img src="${escapeHtml(student.profilePicture)}" alt=""></span>`;
        }
        const initials = (student.displayName || student.username || student.email || '?')
            .split(/\s+/)
            .map(part => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
        return `<span class="student-avatar">${escapeHtml(initials)}</span>`;
    };

    const summarizeQuizScores = (student) => {
        const scores = student.quizScores || [];
        if (!scores.length) return '<span class="pill">No quizzes</span>';
        const attempted = scores.filter(score => score.bestScore !== null && score.bestScore !== undefined);
        if (!attempted.length) return '<span class="pill">Pending quizzes</span>';
        const bestAvg = attempted.reduce((sum, score) => sum + Number(score.bestScore || 0), 0) / attempted.length;
        return `<span class="pill"><i class="fas fa-chart-line"></i> ${Math.round(bestAvg)}% avg · ${attempted.length}/${scores.length}</span>`;
    };

    const renderRows = () => {
        const query = (searchInput.value || '').trim().toLowerCase();
        const selectedCourse = courseFilter.value;
        const selectedStatus = statusFilter.value;

        const filtered = rows.filter((row) => {
            if (selectedCourse !== 'all' && String(row.courseId) !== selectedCourse) return false;
            if (selectedStatus !== 'all' && row.enrollmentStatus !== selectedStatus) return false;
            if (!query) return true;
            return [
                row.displayName,
                row.username,
                row.email,
                row.courseTitle,
                row.currentStage,
                row.aiTip,
                row.enrollmentStatus
            ].filter(Boolean).some(value => String(value).toLowerCase().includes(query));
        });

        if (!filtered.length) {
            tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No students match the current filters.</td></tr>';
            return;
        }

        tableBody.innerHTML = filtered.map((row, index) => `
            <tr onclick="openStudentModal(${rows.indexOf(row)})">
                <td>
                    <div class="student-name-cell">
                        ${renderAvatar(row)}
                        <div>
                            <strong style="display:block; color:#1e293b;">${escapeHtml(row.displayName || row.username || 'Student')}</strong>
                            <span style="font-size:.82rem; color:#64748b;">${escapeHtml(row.email || row.username || '')}</span>
                        </div>
                    </div>
                </td>
                <td><strong style="color:#1e293b;">${escapeHtml(row.courseTitle)}</strong><br><span style="font-size:.82rem; color:#64748b;">${escapeHtml(row.courseStatus)}</span></td>
                <td>${escapeHtml(row.currentStage || 'Not started')}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="progress-track"><div class="progress-fill" style="width:${Math.max(0, Math.min(100, Number(row.progressPercent) || 0))}%;"></div></div>
                        <strong>${formatPercent(row.progressPercent)}</strong>
                    </div>
                </td>
                <td>${summarizeQuizScores(row)}</td>
                <td><span class="tip-preview" title="${escapeHtml(row.aiTip || '')}">${escapeHtml(truncate(row.aiTip || 'No AI tip yet.'))}</span></td>
            </tr>
        `).join('');
    };

    const populateCourseFilter = () => {
        courseFilter.innerHTML = '<option value="all">All courses</option>' + courses.map(course =>
            `<option value="${course.id}">${escapeHtml(course.title)} (${course.studentCount || 0})</option>`
        ).join('');
    };

    const updateStats = (payload) => {
        document.getElementById('students-total-courses').textContent = payload.totalCourses ?? courses.length;
        document.getElementById('students-total-students').textContent = payload.totalStudents ?? rows.length;
        const avgProgress = rows.length
            ? rows.reduce((sum, row) => sum + (Number(row.progressPercent) || 0), 0) / rows.length
            : 0;
        document.getElementById('students-avg-progress').textContent = rows.length ? `${Math.round(avgProgress)}%` : '-';
    };

    const loadProfileChrome = async () => {
        try {
            const res = await fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } });
            const profileData = await res.json();
            const user = profileData.data?.user || profileData.user || {};
            const roles = user.roles || [];
            const navCreations = document.getElementById('nav-creations');
            const navStudents = document.getElementById('nav-students');
            const navUsers = document.getElementById('nav-users');
            const avatar = document.getElementById('nav-user-avatar');
            const managerRoles = ['TEACHER', 'TUTOR', 'BUSINESS_MENTOR', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN'];
            const canManage = roles.some(role => managerRoles.includes(role)) || ['MASTER', 'ADMIN'].includes(user.role);

            if (canManage) {
                if (navCreations) navCreations.style.display = 'flex';
                if (navStudents) navStudents.style.display = 'flex';
            }
            if (navUsers && (user.role === 'MASTER' || roles.includes('SUPER_ADMIN'))) {
                navUsers.style.display = 'flex';
            }
            if (avatar && user.profilePicture) {
                avatar.innerHTML = `<img src="${escapeHtml(user.profilePicture)}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            }
        } catch (error) {
            console.error('Failed to load profile chrome:', error);
        }
    };

    window.openStudentModal = (index) => {
        const row = rows[index];
        if (!row) return;

        const modal = document.getElementById('student-modal');
        const title = document.getElementById('student-modal-title');
        const body = document.getElementById('student-modal-body');

        title.innerHTML = `
            <div style="display:flex; gap:14px; align-items:center;">
                ${renderAvatar(row)}
                <div>
                    <h2 style="margin:0; color:white;">${escapeHtml(row.displayName || row.username || 'Student')}</h2>
                    <p style="margin:5px 0 0; opacity:.85;">${escapeHtml(row.courseTitle)} · ${formatPercent(row.progressPercent)} complete</p>
                </div>
            </div>`;

        const quizHtml = (row.quizScores || []).length
            ? row.quizScores.map(score => `
                <div class="module-row">
                    <div><strong>${escapeHtml(score.moduleTitle)}</strong><br><span style="color:#64748b; font-size:.85rem;">Attempts: ${score.attempts || 0}</span></div>
                    <span class="pill">${score.bestScore === null || score.bestScore === undefined ? 'Pending' : `${Math.round(score.bestScore)}% best`}</span>
                </div>`).join('')
            : '<p style="color:#64748b; margin:0;">No quizzes in this course yet.</p>';

        const modulesHtml = (row.modules || []).map(module => `
            <div class="module-row">
                <div><strong>${escapeHtml(module.title)}</strong><br><span style="color:#64748b; font-size:.85rem;">${module.hasQuiz ? 'Quiz module' : 'No quiz'}</span></div>
                <span class="pill">${module.completed ? '<i class="fas fa-check"></i> Completed' : 'Pending'}</span>
            </div>
        `).join('') || '<p style="color:#64748b; margin:0;">No modules configured.</p>';

        body.innerHTML = `
            <div class="modal-grid">
                <div class="modal-card"><label>Email</label><strong>${escapeHtml(row.email || '-')}</strong></div>
                <div class="modal-card"><label>Status</label><strong>${escapeHtml(row.enrollmentStatus || '-')}</strong></div>
                <div class="modal-card"><label>Current stage</label><strong>${escapeHtml(row.currentStage || '-')}</strong></div>
                <div class="modal-card"><label>Progress</label><strong>${formatPercent(row.progressPercent)} (${row.completedCount || 0}/${row.moduleCount || 0})</strong></div>
            </div>
            <div class="modal-card"><label>AI tip</label><p style="margin:0; color:#334155; line-height:1.6;">${escapeHtml(row.aiTip || 'No AI tip yet.')}</p></div>
            <div class="modal-card"><label>Quiz scores</label><div class="module-list">${quizHtml}</div></div>
            <div class="modal-card"><label>Modules</label><div class="module-list">${modulesHtml}</div></div>
        `;

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    };

    window.closeStudentModal = () => {
        const modal = document.getElementById('student-modal');
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    };

    document.getElementById('student-modal').addEventListener('click', (event) => {
        if (event.target.id === 'student-modal') window.closeStudentModal();
    });

    [searchInput, courseFilter, statusFilter].forEach(input => input.addEventListener('input', renderRows));
    [courseFilter, statusFilter].forEach(input => input.addEventListener('change', renderRows));

    try {
        await loadProfileChrome();
        const res = await fetch('/api/students/overview', { headers: { Authorization: `Bearer ${token}` } });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || payload.message || 'Failed to load students.');
        courses = payload.courses || [];
        rows = payload.students || [];
        populateCourseFilter();
        updateStats(payload);
        renderRows();
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="6" class="empty-state">${escapeHtml(error.message || 'Failed to load students.')}</td></tr>`;
    }
});
