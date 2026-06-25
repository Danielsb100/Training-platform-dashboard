const htmlPdf = require('html-pdf-node');

const fs = require('fs');
const path = require('path');

function getBase64Image(filename, mimeType) {
  try {
    const filePath = path.join(__dirname, '..', 'public', 'assets', 'certificate', filename);
    const data = fs.readFileSync(filePath);
    return `data:${mimeType};base64,${data.toString('base64')}`;
  } catch (e) {
    return '';
  }
}

/**
 * Builds the HTML template that replicates the certificate layout.
 * The design matches the exact DataEquality certificate.
 */
function buildCertificateHtml(template, studentName) {
  const title = escapeHtml(template.title || 'CERTIFICATE');
  const subtitle = escapeHtml(template.subtitle || '');
  let bodyText = template.bodyText || '';
  
  // Replace placeholders (case-insensitive)
  bodyText = bodyText.replace(/\{studentName\}/gi, studentName);
  
  // Replace {courseName} if it exists
  const courseName = template.course?.title || 'Course';
  bodyText = bodyText.replace(/\{courseName\}/gi, courseName);

  bodyText = escapeHtml(bodyText);
  
  let bgImageStr = getBase64Image('bg_final.png', 'image/png');
  if (template.projectLogoUrl && template.projectLogoUrl !== '' && template.projectLogoUrl !== '/assets/certificate/img_52.png') {
    bgImageStr = template.projectLogoUrl;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { margin: 0; }
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  .cert-container {
    width: 100%;
    height: 100%;
    position: relative;
    background: url('${bgImageStr}') center/cover no-repeat;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
  }
  .content {
    position: absolute;
    top: 18%;
    left: 8%;
    width: 47%;
    bottom: 15%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    z-index: 4;
  }
  .title {
    font-weight: 900;
    font-size: 36px;
    color: #032b2f;
    letter-spacing: 2px;
    line-height: 1.1;
    margin-bottom: 4px;
  }
  .subtitle {
    font-size: 16px;
    color: #475569;
    letter-spacing: 3px;
    margin-bottom: 40px;
  }
  .no-subtitle {
    margin-bottom: 40px;
  }
  .student {
    font-family: 'DM Serif Display', serif;
    font-size: 34px;
    color: #018c94;
    margin-bottom: 6px;
  }
  .divider {
    width: 80%;
    height: 2px;
    background: #333;
    margin-bottom: 24px;
  }
  .body-text {
    font-size: 13px;
    color: #333;
    line-height: 1.6;
    max-width: 95%;
    font-weight: 500;
  }
</style>
</head>
<body>
  <div class="cert-container">
      <div class="content">
          <div class="title">${title}</div>
          ${subtitle ? `<div class="subtitle">${subtitle}</div>` : '<div class="no-subtitle"></div>'}
          <div class="student">${escapeHtml(studentName)}</div>
          <div class="divider"></div>
          <div class="body-text">${bodyText.replace(/\n/g, '<br>')}</div>
      </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate a PDF buffer from a certificate template + student name.
 * @param {object} template — CertificateTemplate record from DB
 * @param {string} studentName — The name to print on the certificate
 * @returns {Promise<Buffer>} PDF as a Node.js Buffer
 */
async function generateCertificatePdf(template, studentName) {
  const html = buildCertificateHtml(template, studentName);

  const file = { content: html };
  const options = {
    width: '11.69in',
    height: '8.27in',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  };

  const pdfBuffer = await htmlPdf.generatePdf(file, options);
  return pdfBuffer;
}

module.exports = {
  generateCertificatePdf,
  buildCertificateHtml
};
