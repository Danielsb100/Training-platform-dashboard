const prisma = require('../config/db');
const { generateCertificatePdf } = require('../services/certificatePdfService');
const { sendSuccess, sendError } = require('../utils/http');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEffectiveUserRoles(user) {
  return new Set(
    [...(user?.roles || []), user?.primaryRole, user?.legacyRole, user?.role].filter(Boolean)
  );
}

function isCourseManager(user, course) {
  const roles = getEffectiveUserRoles(user);
  if (roles.has('SUPER_ADMIN')) return true;
  if (String(course.ownerMasterId) === String(user?.id)) return true;
  if (course.editors && course.editors.some((e) => String(e.userId) === String(user?.id))) return true;
  return false;
}

async function assertCourseManager(courseId, user) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { editors: true }
  });
  if (!course) throw new Error('COURSE_NOT_FOUND');
  if (!isCourseManager(user, course)) throw new Error('UNAUTHORIZED');
  return course;
}

// ---------------------------------------------------------------------------
// Template CRUD
// ---------------------------------------------------------------------------

async function getTemplate(req, res) {
  try {
    const courseId = Number(req.params.id);
    await assertCourseManager(courseId, req.user);

    const template = await prisma.certificateTemplate.findUnique({ where: { courseId } });
    if (!template) {
      return res.json(null);
    }
    return res.json(template);
  } catch (err) {
    if (err.message === 'COURSE_NOT_FOUND') return sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Course not found.' });
    if (err.message === 'UNAUTHORIZED') return sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Not authorized.' });
    console.error('[certificateController.getTemplate]', err);
    return sendError(res, { status: 500, code: 'INTERNAL', message: 'Failed to load certificate template.' });
  }
}

async function upsertTemplate(req, res) {
  try {
    const courseId = Number(req.params.id);
    await assertCourseManager(courseId, req.user);

    const { title, subtitle, bodyText, projectLogoUrl, autoIssue } = req.body;
    if (!title || !bodyText) {
      return sendError(res, { status: 400, code: 'VALIDATION', message: 'Title and body text are required.' });
    }

    const template = await prisma.certificateTemplate.upsert({
      where: { courseId },
      update: {
        title: String(title).trim(),
        subtitle: subtitle ? String(subtitle).trim() : null,
        bodyText: String(bodyText),
        projectLogoUrl: projectLogoUrl || null,
        autoIssue: Boolean(autoIssue)
      },
      create: {
        courseId,
        title: String(title).trim(),
        subtitle: subtitle ? String(subtitle).trim() : null,
        bodyText: String(bodyText),
        projectLogoUrl: projectLogoUrl || null,
        autoIssue: Boolean(autoIssue)
      }
    });

    return res.json(template);
  } catch (err) {
    if (err.message === 'COURSE_NOT_FOUND') return sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Course not found.' });
    if (err.message === 'UNAUTHORIZED') return sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Not authorized.' });
    console.error('[certificateController.upsertTemplate]', err);
    return sendError(res, { status: 500, code: 'INTERNAL', message: 'Failed to save certificate template.' });
  }
}

async function deleteTemplate(req, res) {
  try {
    const courseId = Number(req.params.id);
    await assertCourseManager(courseId, req.user);

    await prisma.certificateTemplate.deleteMany({ where: { courseId } });
    return res.json({ message: 'Certificate template deleted.' });
  } catch (err) {
    if (err.message === 'COURSE_NOT_FOUND') return sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Course not found.' });
    if (err.message === 'UNAUTHORIZED') return sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Not authorized.' });
    console.error('[certificateController.deleteTemplate]', err);
    return sendError(res, { status: 500, code: 'INTERNAL', message: 'Failed to delete certificate template.' });
  }
}

// ---------------------------------------------------------------------------
// Issue Certificates
// ---------------------------------------------------------------------------

async function issueCertificate(req, res) {
  try {
    const courseId = Number(req.params.id);
    const course = await assertCourseManager(courseId, req.user);

    const { userId } = req.body;
    if (!userId) {
      return sendError(res, { status: 400, code: 'VALIDATION', message: 'userId is required.' });
    }

    const template = await prisma.certificateTemplate.findUnique({ where: { courseId } });
    if (!template) {
      return sendError(res, { status: 404, code: 'NO_TEMPLATE', message: 'No certificate template configured for this course.' });
    }

    // Check if already issued
    const existing = await prisma.issuedCertificate.findUnique({
      where: { templateId_userId: { templateId: template.id, userId: Number(userId) } }
    });
    if (existing) {
      return res.json({ alreadyIssued: true, certificate: { id: existing.id, issuedAt: existing.issuedAt } });
    }

    // Get student display name
    const student = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { profile: { select: { displayName: true } } }
    });
    if (!student) {
      return sendError(res, { status: 404, code: 'USER_NOT_FOUND', message: 'Student not found.' });
    }

    const studentName = student.profile?.displayName || student.username || 'Student';

    // Generate PDF
    const pdfBuffer = await generateCertificatePdf(template, studentName);

    const cert = await prisma.issuedCertificate.create({
      data: {
        templateId: template.id,
        userId: Number(userId),
        courseId,
        studentName,
        issuedBy: req.user.id,
        pdfData: pdfBuffer
      }
    });

    return res.status(201).json({ id: cert.id, studentName: cert.studentName, issuedAt: cert.issuedAt });
  } catch (err) {
    if (err.message === 'COURSE_NOT_FOUND') return sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Course not found.' });
    if (err.message === 'UNAUTHORIZED') return sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Not authorized.' });
    console.error('[certificateController.issueCertificate]', err);
    return sendError(res, { status: 500, code: 'INTERNAL', message: 'Failed to issue certificate.' });
  }
}

async function issueBulk(req, res) {
  try {
    const courseId = Number(req.params.id);
    await assertCourseManager(courseId, req.user);

    const template = await prisma.certificateTemplate.findUnique({ where: { courseId } });
    if (!template) {
      return sendError(res, { status: 404, code: 'NO_TEMPLATE', message: 'No certificate template configured.' });
    }

    // Get course module count
    const moduleCount = await prisma.courseModule.count({ where: { courseId } });
    if (moduleCount === 0) {
      return sendError(res, { status: 400, code: 'NO_MODULES', message: 'Course has no modules.' });
    }

    // Get enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: { in: ['ENROLLED', 'COMPLETED'] } },
      select: { userId: true }
    });

    const alreadyIssued = await prisma.issuedCertificate.findMany({
      where: { templateId: template.id },
      select: { userId: true }
    });
    const issuedSet = new Set(alreadyIssued.map((c) => c.userId));

    const results = { issued: 0, skipped: 0, errors: 0 };

    for (const enrollment of enrollments) {
      if (issuedSet.has(enrollment.userId)) {
        results.skipped++;
        continue;
      }

      // Check 100% completion
      const completionCount = await prisma.moduleCompletion.count({
        where: { courseId, userId: enrollment.userId }
      });
      if (completionCount < moduleCount) {
        results.skipped++;
        continue;
      }

      try {
        const student = await prisma.user.findUnique({
          where: { id: enrollment.userId },
          include: { profile: { select: { displayName: true } } }
        });
        const studentName = student?.profile?.displayName || student?.username || 'Student';
        const pdfBuffer = await generateCertificatePdf(template, studentName);

        await prisma.issuedCertificate.create({
          data: {
            templateId: template.id,
            userId: enrollment.userId,
            courseId,
            studentName,
            issuedBy: req.user.id,
            pdfData: pdfBuffer
          }
        });
        results.issued++;
      } catch (e) {
        console.error(`[issueBulk] Failed for userId ${enrollment.userId}:`, e.message);
        results.errors++;
      }
    }

    return res.json(results);
  } catch (err) {
    if (err.message === 'COURSE_NOT_FOUND') return sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Course not found.' });
    if (err.message === 'UNAUTHORIZED') return sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Not authorized.' });
    console.error('[certificateController.issueBulk]', err);
    return sendError(res, { status: 500, code: 'INTERNAL', message: 'Failed to issue certificates in bulk.' });
  }
}

// ---------------------------------------------------------------------------
// List / View / Download
// ---------------------------------------------------------------------------

async function listIssuedCertificates(req, res) {
  try {
    const courseId = Number(req.params.id);
    await assertCourseManager(courseId, req.user);

    const template = await prisma.certificateTemplate.findUnique({ where: { courseId } });
    if (!template) {
      return res.json([]);
    }

    const certs = await prisma.issuedCertificate.findMany({
      where: { templateId: template.id },
      select: {
        id: true,
        userId: true,
        studentName: true,
        issuedAt: true,
        issuedBy: true,
        user: { select: { username: true, email: true } }
      },
      orderBy: { issuedAt: 'desc' }
    });

    return res.json(certs);
  } catch (err) {
    if (err.message === 'COURSE_NOT_FOUND') return sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Course not found.' });
    if (err.message === 'UNAUTHORIZED') return sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Not authorized.' });
    console.error('[certificateController.listIssuedCertificates]', err);
    return sendError(res, { status: 500, code: 'INTERNAL', message: 'Failed to list certificates.' });
  }
}

async function getMyCertificates(req, res) {
  try {
    const userId = req.user.id;
    const certs = await prisma.issuedCertificate.findMany({
      where: { userId },
      select: {
        id: true,
        studentName: true,
        courseId: true,
        issuedAt: true,
        template: {
          select: {
            title: true,
            subtitle: true,
            bodyText: true,
            projectLogoUrl: true,
            course: { select: { id: true, title: true, coverImage: true } }
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    const result = certs.map((cert) => ({
      id: cert.id,
      studentName: cert.studentName,
      courseId: cert.courseId,
      courseTitle: cert.template?.course?.title || 'Course',
      courseCover: cert.template?.course?.coverImage || null,
      certificateTitle: cert.template?.title || 'Certificate',
      certificateSubtitle: cert.template?.subtitle || '',
      certificateBodyText: cert.template?.bodyText || '',
      projectLogoUrl: cert.template?.projectLogoUrl || null,
      issuedAt: cert.issuedAt
    }));

    return res.json(result);
  } catch (err) {
    console.error('[certificateController.getMyCertificates]', err);
    return sendError(res, { status: 500, code: 'INTERNAL', message: 'Failed to load certificates.' });
  }
}

async function downloadCertificate(req, res) {
  try {
    const certId = Number(req.params.id);
    const cert = await prisma.issuedCertificate.findUnique({
      where: { id: certId },
      include: {
        template: {
          include: {
            course: { include: { editors: true } }
          }
        }
      }
    });

    if (!cert) {
      return sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Certificate not found.' });
    }

    // Security: only the student themselves or course managers can download
    const isOwner = cert.userId === req.user.id;
    const isManager = cert.template?.course ? isCourseManager(req.user, cert.template.course) : false;

    if (!isOwner && !isManager) {
      return sendError(res, { status: 403, code: 'FORBIDDEN', message: 'You do not have access to this certificate.' });
    }

    const safeName = (cert.studentName || 'certificate').replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'certificate';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate_${safeName}.pdf"`);
    res.setHeader('Content-Length', cert.pdfData.length);
    return res.send(cert.pdfData);
  } catch (err) {
    console.error('[certificateController.downloadCertificate]', err);
    return sendError(res, { status: 500, code: 'INTERNAL', message: 'Failed to download certificate.' });
  }
}

async function previewPdf(req, res) {
  try {
    const courseId = Number(req.params.id);
    await assertCourseManager(courseId, req.user);

    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { title: true } });

    const { title, subtitle, bodyText, projectLogoUrl } = req.body;
    if (!title || !bodyText) {
      return sendError(res, { status: 400, code: 'VALIDATION', message: 'Title and body text are required for preview.' });
    }

    const fakeTemplate = { title, subtitle, bodyText, projectLogoUrl, course };
    const pdfBuffer = await generateCertificatePdf(fakeTemplate, 'John Doe');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="certificate_preview.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err) {
    if (err.message === 'COURSE_NOT_FOUND') return sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Course not found.' });
    if (err.message === 'UNAUTHORIZED') return sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Not authorized.' });
    console.error('[certificateController.previewPdf]', err);
    return sendError(res, { status: 500, code: 'INTERNAL', message: 'Failed to generate preview.' });
  }
}

// ---------------------------------------------------------------------------
// Auto-issue helper (called from courseController on 100% completion)
// ---------------------------------------------------------------------------

async function tryAutoIssueCertificate(courseId, userId) {
  try {
    const template = await prisma.certificateTemplate.findUnique({ 
      where: { courseId },
      include: { course: { select: { title: true } } }
    });
    if (!template || !template.autoIssue) return null;

    // Check if already issued
    const existing = await prisma.issuedCertificate.findUnique({
      where: { templateId_userId: { templateId: template.id, userId } }
    });
    if (existing) return null;

    // Check 100% completion
    const moduleCount = await prisma.courseModule.count({ where: { courseId } });
    if (moduleCount === 0) return null;

    const completionCount = await prisma.moduleCompletion.count({ where: { courseId, userId } });
    if (completionCount < moduleCount) return null;

    // Get student name
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { select: { displayName: true } } }
    });
    const studentName = student?.profile?.displayName || student?.username || 'Student';

    // Generate and save
    const pdfBuffer = await generateCertificatePdf(template, studentName);
    const cert = await prisma.issuedCertificate.create({
      data: {
        templateId: template.id,
        userId,
        courseId,
        studentName,
        issuedBy: null, // auto-issued
        pdfData: pdfBuffer
      }
    });

    console.log(`[certificate] Auto-issued certificate #${cert.id} for user ${userId} in course ${courseId}`);
    return cert;
  } catch (err) {
    console.error(`[certificate] Auto-issue failed for user ${userId} in course ${courseId}:`, err.message);
    return null;
  }
}

module.exports = {
  getTemplate,
  upsertTemplate,
  deleteTemplate,
  issueCertificate,
  issueBulk,
  listIssuedCertificates,
  getMyCertificates,
  downloadCertificate,
  previewPdf,
  tryAutoIssueCertificate
};
