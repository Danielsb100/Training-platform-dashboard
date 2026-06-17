const prisma = require('../config/db');
const { translateLandingPage, markTranslationsStale, getTranslatedHtml } = require('../services/translationService');

function getEffectiveUserRoles(user) {
  return new Set([
    ...(user.roles || []),
    user.primaryRole,
    user.legacyRole,
    user.role
  ].filter(Boolean));
}

// Access Control Helper
function canManageLandingPages(user) {
  const roles = getEffectiveUserRoles(user);
  return roles.has('MASTER') || roles.has('ADMIN') || roles.has('SUPER_ADMIN') || roles.has('TEACHER') || roles.has('COORDINATOR');
}

/**
 * Get all landing pages for the authenticated user (manager/owner)
 */
async function getLandingPages(req, res) {
  try {
    if (!canManageLandingPages(req.user)) {
      return res.status(403).json({ error: 'Access denied: Insufficient privileges.' });
    }

    const pages = await prisma.landingPage.findMany({
      where: { ownerMasterId: req.user.id },
      include: {
        course: {
          select: { title: true, id: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.json(pages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to retrieve landing pages' });
  }
}

/**
 * Get a specific landing page by ID
 */
async function getLandingPageById(req, res) {
  try {
    const id = Number(req.params.id);
    const page = await prisma.landingPage.findUnique({
      where: { id },
      include: {
        course: { select: { title: true, id: true } }
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    // Determine access: either the owner, or someone trying to view a course's linked landing page
    // For simplicity, if requested, we permit viewing (since it's a public-facing description)
    return res.json(page);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to retrieve landing page' });
  }
}

/**
 * Get the landing page for a specific course (used by Multiplayer viewer)
 */
async function getLandingPageByCourseId(req, res) {
  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) return res.status(400).json({ error: 'Invalid course ID' });

    const page = await prisma.landingPage.findUnique({
      where: { courseId },
      include: { course: { include: { editors: true } } }
    });

    if (!page) {
      return res.status(404).json({ error: 'No landing page linked to this course' });
    }

    let isAuthorized = false;

    // Optional authentication to verify ownership
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const env = require('../config/env');
                req.user = jwt.verify(token, env.auth.jwtSecret);
            } catch (err) {
                // Ignore invalid token, just treat as unauthorized viewer
            }
        }
    }

    if (req.user) {
        const isOwner = String(page.ownerMasterId) === String(req.user.id) || (page.course && String(page.course.ownerMasterId) === String(req.user.id));
        const isEditor = page.course?.editors?.some(e => String(e.userId) === String(req.user.id));
        const isSuperAdmin = getEffectiveUserRoles(req.user).has('SUPER_ADMIN');
        isAuthorized = isOwner || isEditor || isSuperAdmin;
    }

    if (isAuthorized) {
        // Return the full page for viewers and editors
        return res.json(page);
    } else {
        // Check if a translated version is requested
        const locale = req.query.lang || req.headers['accept-language']?.split(',')[0]?.trim() || 'en-US';
        let finalHtml = page.compiledHtml;

        // Try to serve a translated version
        if (locale && locale !== 'en-US') {
            const translatedHtml = await getTranslatedHtml(page.id, locale);
            if (translatedHtml) {
                finalHtml = translatedHtml;
            }
        }

        // Return only the compiled version for regular viewers
        return res.json({
            id: page.id,
            title: page.title,
            compiledHtml: finalHtml,
            compiledCss: page.compiledCss,
            courseId: page.courseId
        });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to retrieve course landing page' });
  }
}

/**
 * Create a new landing page
 */
async function createLandingPage(req, res) {
  try {
    if (!canManageLandingPages(req.user)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, content, compiledHtml, compiledCss, courseId } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const landingPage = await prisma.landingPage.create({
      data: {
        title,
        content: content || {},
        compiledHtml: compiledHtml || '',
        compiledCss: compiledCss || '',
        ownerMasterId: req.user.id,
        courseId: courseId ? Number(courseId) : null
      }
    });

    // Trigger async translation in background (don't block the response)
    if (compiledHtml) {
      translateLandingPage(landingPage.id, compiledHtml).catch(err => {
        console.error('[LandingPage] Background translation failed:', err.message);
      });
    }

    return res.status(201).json(landingPage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create landing page' });
  }
}

/**
 * Update an existing landing page
 */
async function updateLandingPage(req, res) {
  try {
    const id = Number(req.params.id);
    const { title, content, compiledHtml, compiledCss, courseId } = req.body;

    const existing = await prisma.landingPage.findUnique({ 
        where: { id },
        include: { course: { include: { editors: true } } }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    const isEditor = existing.course?.editors?.some(e => String(e.userId) === String(req.user.id));
    const isOwner = String(existing.ownerMasterId) === String(req.user.id) || (existing.course && String(existing.course.ownerMasterId) === String(req.user.id));
    const isSuperAdmin = getEffectiveUserRoles(req.user).has('SUPER_ADMIN');

    if (!isOwner && !isEditor && !isSuperAdmin) {
        return res.status(403).json({ error: 'You do not have permission to edit this landing page' });
    }

    // Unlink old course if courseId is provided and changed to null/different
    // Prisma will handle standard 1-1 updates automatically if we assign `courseId`

    const updated = await prisma.landingPage.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        content: content !== undefined ? content : existing.content,
        compiledHtml: compiledHtml !== undefined ? compiledHtml : existing.compiledHtml,
        compiledCss: compiledCss !== undefined ? compiledCss : existing.compiledCss,
        courseId: courseId === null ? null : (courseId ? Number(courseId) : existing.courseId)
      }
    });

    // If compiledHtml was updated, re-translate in background
    if (compiledHtml !== undefined && compiledHtml !== existing.compiledHtml) {
      markTranslationsStale(id).catch(() => {});
      translateLandingPage(id, compiledHtml).catch(err => {
        console.error('[LandingPage] Background re-translation failed:', err.message);
      });
    }

    return res.json(updated);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
        return res.status(400).json({ error: 'This course is already linked to another landing page.' });
    }
    return res.status(500).json({ error: 'Failed to update landing page' });
  }
}

/**
 * Delete a landing page
 */
async function deleteLandingPage(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.landingPage.findUnique({ 
        where: { id },
        include: { course: { include: { editors: true } } }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    const isEditor = existing.course?.editors?.some(e => String(e.userId) === String(req.user.id));
    const isOwner = String(existing.ownerMasterId) === String(req.user.id) || (existing.course && String(existing.course.ownerMasterId) === String(req.user.id));
    const isSuperAdmin = getEffectiveUserRoles(req.user).has('SUPER_ADMIN');

    if (!isOwner && !isEditor && !isSuperAdmin) {
      return res.status(403).json({ error: 'You do not have permission to delete this landing page' });
    }

    await prisma.landingPage.delete({ where: { id } });
    return res.json({ message: 'Landing page deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete landing page' });
  }
}

module.exports = {
  getLandingPages,
  getLandingPageById,
  getLandingPageByCourseId,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage
};
