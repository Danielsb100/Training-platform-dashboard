/**
 * Certificate Editor — Manages certificate template creation, editing, preview, and issuance.
 * Used in course_builder.html via the certificate modal.
 */

// ============================================================================
// State
// ============================================================================

let certTemplate = null; // Current loaded template
let certIssuedList = []; // List of issued certificates

// ============================================================================
// Modal Open / Close
// ============================================================================

function openCertificateModal() {
  const modal = document.getElementById('certificate-editor-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  loadCertificateTemplate();
}

function closeCertificateModal() {
  const modal = document.getElementById('certificate-editor-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// ============================================================================
// Template CRUD
// ============================================================================

async function loadCertificateTemplate() {
  const courseId = window.editingCourseId;
  if (!courseId) return;

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`/api/courses/${courseId}/certificate-template`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Failed to load template');
    const data = await res.json();

    certTemplate = data;
    populateTemplateForm(data);
    updateCertificatePreview();
    loadIssuedCertificates();
    updateCertActionCardState(!!data);
  } catch (err) {
    console.error('[cert] Load template error:', err);
  }
}

function populateTemplateForm(template) {
  const titleInput = document.getElementById('cert-title-input');
  const subtitleInput = document.getElementById('cert-subtitle-input');
  const bodyInput = document.getElementById('cert-body-input');
  const logoInput = document.getElementById('cert-logo-input');
  const autoIssueToggle = document.getElementById('cert-auto-issue');
  const filenameDisplay = document.getElementById('cert-logo-filename');

  if (template) {
    titleInput.value = template.title || '';
    subtitleInput.value = template.subtitle || '';
    bodyInput.value = template.bodyText || '';
    logoInput.value = template.projectLogoUrl || '';
    autoIssueToggle.checked = Boolean(template.autoIssue);
    if (filenameDisplay) filenameDisplay.textContent = template.projectLogoUrl ? 'Image loaded' : 'No file selected';
  } else {
    titleInput.value = 'CERTIFICATE';
    subtitleInput.value = 'OF ATTENDANCE';
    bodyInput.value = 'has attended the series of Workshops, Working Groups, and the\nFinal Workshop of the DATA EQUALITY Methodology Development\non data collection, management, analysis and exchange, between\nApril and July 2025.';
    logoInput.value = '';
    autoIssueToggle.checked = false;
    if (filenameDisplay) filenameDisplay.textContent = 'No file selected';
  }

  const saveBtn = document.getElementById('cert-save-btn');
  if (saveBtn) {
    saveBtn.style.background = '#e2e8f0';
    saveBtn.style.color = '#94a3b8';
  }
}

function handleCertLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const filenameDisplay = document.getElementById('cert-logo-filename');
  if (filenameDisplay) filenameDisplay.textContent = file.name;

  const reader = new FileReader();
  reader.onload = function(e) {
    const logoInput = document.getElementById('cert-logo-input');
    if (logoInput) {
      logoInput.value = e.target.result;
      updateCertificatePreview();
    }
  };
  reader.readAsDataURL(file);
}

async function saveCertificateTemplate() {
  const courseId = window.editingCourseId;
  if (!courseId) return;

  const token = localStorage.getItem('token');
  const saveBtn = document.getElementById('cert-save-btn');
  const origText = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  saveBtn.disabled = true;

  try {
    const payload = {
      title: document.getElementById('cert-title-input').value.trim(),
      subtitle: document.getElementById('cert-subtitle-input').value.trim() || null,
      bodyText: document.getElementById('cert-body-input').value.trim(),
      projectLogoUrl: document.getElementById('cert-logo-input').value.trim() || null,
      autoIssue: document.getElementById('cert-auto-issue').checked
    };

    if (!payload.title || !payload.bodyText) {
      alert('Title and body text are required.');
      saveBtn.innerHTML = origText;
      saveBtn.disabled = false;
      return;
    }

    const res = await fetch(`/api/courses/${courseId}/certificate-template`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Save failed');
    const saved = await res.json();
    certTemplate = saved;
    updateCertActionCardState(true);

    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    saveBtn.style.background = '#10b981';
    saveBtn.style.color = 'white';
    setTimeout(() => {
      saveBtn.innerHTML = origText;
      saveBtn.style.background = '#e2e8f0';
      saveBtn.style.color = '#94a3b8';
      saveBtn.disabled = false;
    }, 2000);
  } catch (err) {
    console.error('[cert] Save error:', err);
    alert('Failed to save certificate template: ' + err.message);
    saveBtn.innerHTML = origText;
    saveBtn.disabled = false;
  }
}

async function deleteCertificateTemplate() {
  if (!confirm('Are you sure you want to delete the certificate template? All issued certificates will also be deleted.')) return;

  const courseId = window.editingCourseId;
  const token = localStorage.getItem('token');

  try {
    await fetch(`/api/courses/${courseId}/certificate-template`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    certTemplate = null;
    populateTemplateForm(null);
    updateCertificatePreview();
    updateCertActionCardState(false);
    loadIssuedCertificates();
  } catch (err) {
    console.error('[cert] Delete error:', err);
    alert('Failed to delete template.');
  }
}

// ============================================================================
// Live Preview
// ============================================================================

function updateCertificatePreview() {
  const container = document.getElementById('cert-preview-container');
  if (!container) return;

  const title = document.getElementById('cert-title-input')?.value || 'CERTIFICATE';
  const subtitle = document.getElementById('cert-subtitle-input')?.value || '';
  let bodyText = document.getElementById('cert-body-input')?.value || '';
  bodyText = bodyText.replace(/\{studentName\}/gi, 'Viviana Gullo');
  const courseTitle = document.getElementById('course-title-input')?.value || 'Course Name';
  bodyText = bodyText.replace(/\{courseName\}/gi, courseTitle);
  const logoUrl = document.getElementById('cert-logo-input')?.value || '';

  let bgUrl = '/assets/certificate/bg_final.png';
  if (logoUrl && logoUrl !== '/assets/certificate/img_52.png' && logoUrl !== '') {
      bgUrl = escapeHtmlAttr(logoUrl);
  }

  container.innerHTML = `
    <div style="width:100%; aspect-ratio:3508/2480; position:relative; background:url('${bgUrl}') center/cover no-repeat; border-radius:6px; overflow:hidden; font-family:'Inter',sans-serif; box-shadow:0 2px 10px rgba(0,0,0,0.12);">
      
      <!-- Content Area -->
      <div style="position:absolute; top:18%; left:8%; right:45%; bottom:15%; display:flex; flex-direction:column; justify-content:flex-start; z-index:4;">
        <div style="font-weight:900; font-size:4.5cqi; color:#032b2f; letter-spacing:2px; line-height:1.1; margin-bottom:1.5%; font-family:sans-serif;">${escapeHtmlContent(title)}</div>
        ${subtitle ? `<div style="font-size:2cqi; color:#475569; letter-spacing:3px; margin-bottom:8%;">${escapeHtmlContent(subtitle)}</div>` : '<div style="margin-bottom:8%;"></div>'}
        
        <div style="font-family:'DM Serif Display',serif; font-size:4.2cqi; color:#018c94; margin-bottom:1.5%;">${escapeHtmlContent('Viviana Gullo')}</div>
        <div style="width:80%; height:2px; background:#333; margin-bottom:6%;"></div>
        
        <div style="font-size:1.6cqi; color:#333; line-height:1.6; max-width:95%; font-weight:500;">${escapeHtmlContent(bodyText).replace(/\n/g, '<br>')}</div>
      </div>

    </div>
  `;
  
  // Use container queries for fluid font sizing based on width
  container.style.containerType = 'inline-size';

  const saveBtn = document.getElementById('cert-save-btn');
  if (saveBtn) {
    saveBtn.style.background = '#c9a84c';
    saveBtn.style.color = 'white';
  }
}

function escapeHtmlContent(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function escapeHtmlAttr(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================================
// Issue Certificates
// ============================================================================

async function loadIssuedCertificates() {
  const courseId = window.editingCourseId;
  if (!courseId) return;

  const token = localStorage.getItem('token');
  const container = document.getElementById('cert-issued-list');
  if (!container) return;

  try {
    const res = await fetch(`/api/courses/${courseId}/certificates`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Failed');
    certIssuedList = await res.json();
    renderIssuedCertificates();
  } catch (err) {
    container.innerHTML = '<p style="color:#94a3b8; text-align:center; font-size:0.9rem;">Could not load issued certificates.</p>';
  }
}

function renderIssuedCertificates() {
  const container = document.getElementById('cert-issued-list');
  if (!container) return;

  if (!certIssuedList.length) {
    container.innerHTML = '<p style="color:#94a3b8; text-align:center; font-size:0.9rem;">No certificates issued yet.</p>';
    return;
  }

  container.innerHTML = certIssuedList.map(cert => `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 15px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
      <div>
        <div style="font-weight:600; color:#1e293b; font-size:0.95rem;">${escapeHtmlContent(cert.studentName)}</div>
        <div style="font-size:0.8rem; color:#64748b;">${cert.user?.username || ''} · ${new Date(cert.issuedAt).toLocaleDateString()}</div>
      </div>
      <a href="/api/certificates/${cert.id}/download" target="_blank" style="background:#497aa7; color:white; border:none; padding:6px 14px; border-radius:6px; font-size:0.8rem; font-weight:600; cursor:pointer; text-decoration:none;">
        <i class="fas fa-download"></i> PDF
      </a>
    </div>
  `).join('');
}

async function issueCertificateToStudent(userId) {
  const courseId = window.editingCourseId;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`/api/courses/${courseId}/certificates/issue`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to issue');
    }
    const data = await res.json();
    if (data.alreadyIssued) {
      alert('Certificate already issued to this student.');
    } else {
      alert(`Certificate issued to ${data.studentName}!`);
    }
    loadIssuedCertificates();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function issueBulkCertificates() {
  if (!confirm('Issue certificates to all students with 100% completion who don\'t have one yet?')) return;

  const courseId = window.editingCourseId;
  const token = localStorage.getItem('token');
  const btn = document.getElementById('cert-bulk-issue-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Issuing...'; }

  try {
    const res = await fetch(`/api/courses/${courseId}/certificates/issue-bulk`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Bulk issue failed');
    const { issued, skipped, errors, failedUsers } = await res.json();
    let msg = `Done! Issued: ${issued}, Skipped: ${skipped}, Errors: ${errors}`;
    if (failedUsers && failedUsers.length > 0) {
      msg += `\nFailed to issue for: ${failedUsers.join(', ')}`;
    }
    alert(msg);
    loadIssuedCertificates();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Issue to All Eligible'; }
  }
}

// ============================================================================
// Action Card State (in course_builder)
// ============================================================================

function updateCertActionCardState(hasTemplate) {
  const card = document.getElementById('cert-action-container');
  if (!card) return;

  const actionCard = card.querySelector('.action-card');
  if (!actionCard) return;

  const icon = actionCard.querySelector('i');
  const h4 = actionCard.querySelector('h4 span') || actionCard.querySelector('h4');
  const p = actionCard.querySelector('p span') || actionCard.querySelector('p');

  if (hasTemplate) {
    if (icon) icon.className = 'fas fa-certificate';
    if (h4) h4.textContent = 'Edit Certificate';
    if (p) p.textContent = 'Certificate template is configured.';
    actionCard.style.borderColor = '#c9a84c';
    actionCard.style.background = '#fffdf5';
  } else {
    if (icon) icon.className = 'fas fa-certificate';
    if (h4) h4.textContent = 'Create Certificate';
    if (p) p.textContent = 'Design a certificate for your students.';
    actionCard.style.borderColor = '';
    actionCard.style.background = '';
  }
}

// ============================================================================
// Init — Check for template on page load
// ============================================================================

async function initCertificateCard() {
  const courseId = window.editingCourseId;
  if (!courseId) return;

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`/api/courses/${courseId}/certificate-template`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      const data = await res.json();
      updateCertActionCardState(!!data);
    }
  } catch (e) {
    // Silently fail — card stays in default state
  }
}
