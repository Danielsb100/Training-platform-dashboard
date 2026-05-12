const prisma = require('../config/db');
const { deepDeleteModule } = require('./moduleController');
const { createEnrollmentNotification, createEventInviteNotification } = require('../services/notificationService');
const { generateCourseInsightsForStudent } = require('../services/moduleAiService');

function getEffectiveUserRoles(user) {
  return new Set([
    ...(user?.roles || []),
    user?.primaryRole,
    user?.legacyRole,
    user?.role
  ].filter(Boolean));
}

function isCourseManager(user, course) {
  const roles = getEffectiveUserRoles(user);
  if (roles.has('SUPER_ADMIN')) return true;
  if (String(course.ownerMasterId) === String(user?.id)) return true;
  if (course.editors && course.editors.some(e => String(e.userId) === String(user?.id))) return true;
  return false;
}

function slugify(value) {
  return String(value || 'course')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'course';
}

function buildSceneId(course) {
  return course.sceneId || `course-${course.id}-${slugify(course.title)}`;
}

const COURSE_ROOM_SPACING = 14;
const DEFAULT_MINIMUM_QUIZ_SCORE = 70;

function buildRoomPosition(index) {
  return {
    x: index * COURSE_ROOM_SPACING,
    y: 0,
    z: 0
  };
}

function normalizeMinimumQuizScore(value, fallback = DEFAULT_MINIMUM_QUIZ_SCORE) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(100, Math.max(0, parsed));
}

function buildProgressModuleInclude(userId) {
  return {
    placement: true,
    module: {
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        coverImage: true,
        titleFont: true,
        textColor: true,
        videos: true,
        documents: true,
        quizzes: {
          select: { id: true, title: true, questions: true }
        },
        submissions: {
          where: { userId },
          select: {
            id: true,
            userId: true,
            score: true,
            attemptNumber: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    }
  };
}

function buildCourseInclude(userId, { includeEnrollmentUsers = false, includeLandingPage = false } = {}) {
  return {
    enrollments: includeEnrollmentUsers
      ? {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profile: { select: { displayName: true } }
              }
            }
          }
        }
      : true,
    completions: true,
    courseModules: {
      include: buildProgressModuleInclude(userId),
      orderBy: { orderIndex: 'asc' }
    },
    ...(includeLandingPage
      ? {
          landingPage: {
            select: { id: true, title: true, compiledHtml: true, compiledCss: true }
          }
        }
      : {}),
    editors: true
  };
}

function getCourseModuleQuizState(courseModule, userId) {
  const hasQuiz = Boolean(courseModule.module?.quizzes?.length);
  const submissions = (courseModule.module?.submissions || [])
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latestSubmission = submissions[0] || null;
  const bestQuizScore = submissions.length
    ? submissions.reduce((best, entry) => Math.max(best, Number(entry.score) || 0), 0)
    : null;
  const latestQuizScore = latestSubmission ? Number(latestSubmission.score) || 0 : null;
  const quizRequirementActive = Boolean(hasQuiz && courseModule.requireQuizPass);
  const minimumQuizScore = quizRequirementActive
    ? normalizeMinimumQuizScore(courseModule.minimumQuizScore)
    : null;
  const quizPassed = !quizRequirementActive || (bestQuizScore !== null && bestQuizScore >= minimumQuizScore);

  return {
    hasQuiz,
    quizRequirementActive,
    minimumQuizScore,
    bestQuizScore,
    latestQuizScore,
    latestAttemptNumber: latestSubmission?.attemptNumber || null,
    quizAttemptCount: submissions.length,
    quizPassed
  };
}

async function syncCoursePlacements(courseId, tx = prisma) {
  const course = await tx.course.findUnique({
    where: { id: courseId },
    include: {
      courseModules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          module: { select: { title: true } },
          placement: true
        }
      }
    }
  });

  if (!course) {
    throw new Error('COURSE_NOT_FOUND');
  }

  const sceneId = buildSceneId(course);
  if (course.sceneId !== sceneId) {
    await tx.course.update({ where: { id: courseId }, data: { sceneId } });
  }

  const activeCourseModuleIds = [];

  for (const [index, courseModule] of course.courseModules.entries()) {
    activeCourseModuleIds.push(courseModule.id);
    const position = buildRoomPosition(index);
    const label = courseModule.roomLabel || `Module Room ${index + 1}`;

    const placementData = {
      ownerMasterId: course.ownerMasterId,
      courseId: course.id,
      courseModuleId: courseModule.id,
      moduleId: courseModule.moduleId,
      sceneId,
      objectType: 'COURSE_MODULE_ROOM',
      label,
      positionX: position.x,
      positionY: position.y,
      positionZ: position.z,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      status: 'ACTIVE'
    };

    if (courseModule.placement) {
      await tx.worldModulePlacement.update({
        where: { id: courseModule.placement.id },
        data: placementData
      });
    } else {
      await tx.worldModulePlacement.create({ data: placementData });
    }
  }

  await tx.worldModulePlacement.deleteMany({
    where: {
      courseId,
      courseModuleId: { notIn: activeCourseModuleIds.length ? activeCourseModuleIds : [-1] }
    }
  });
}

function buildCourseProgress(course, userId, isManagerView = false) {
  const completions = new Set(
    (course.completions || [])
      .filter((entry) => entry.userId === userId)
      .map((entry) => entry.moduleId)
  );

  let requiredGateOpen = true;
  const modules = (course.courseModules || []).map((courseModule, index) => {
    const completed = completions.has(courseModule.moduleId);
    const unlocked = isManagerView || requiredGateOpen;
    const roomPosition = buildRoomPosition(index);
    const quizState = getCourseModuleQuizState(courseModule, userId);
    const completionBlockedByQuiz = !isManagerView && quizState.quizRequirementActive && !quizState.quizPassed;

    const payload = {
      courseModuleId: courseModule.id,
      moduleId: courseModule.moduleId,
      title: courseModule.module?.title || 'Untitled module',
      description: courseModule.module?.description || '',
      moduleStatus: courseModule.module?.status || 'DRAFT',
      coverImage: courseModule.module?.coverImage || null,
      titleFont: courseModule.module?.titleFont || 'inherit',
      textColor: courseModule.module?.textColor || '#ffffff',
      orderIndex: courseModule.orderIndex,
      isRequired: courseModule.isRequired,
      requireQuizPass: Boolean(courseModule.requireQuizPass),
      minimumQuizScore: quizState.minimumQuizScore,
      hasQuiz: quizState.hasQuiz,
      quizRequirementActive: quizState.quizRequirementActive,
      quizPassed: quizState.quizPassed,
      bestQuizScore: quizState.bestQuizScore,
      latestQuizScore: quizState.latestQuizScore,
      quizAttemptCount: quizState.quizAttemptCount,
      latestQuizAttemptNumber: quizState.latestAttemptNumber,
      videos: courseModule.module?.videos || [],
      documents: courseModule.module?.documents || [],
      quizzes: courseModule.module?.quizzes || [],
      canMarkComplete: isManagerView || !completionBlockedByQuiz,
      completionBlockedReason: completionBlockedByQuiz
        ? `Pass the module quiz with at least ${quizState.minimumQuizScore}% before marking this room as done.`
        : null,
      roomLabel: courseModule.roomLabel || courseModule.placement?.label || `Module Room ${courseModule.orderIndex + 1}`,
      completed,
      unlocked,
      placement: courseModule.placement
        ? {
            id: courseModule.placement.id,
            label: courseModule.placement.label,
            position: roomPosition,
            rotation: {
              x: courseModule.placement.rotationX,
              y: courseModule.placement.rotationY,
              z: courseModule.placement.rotationZ
            }
          }
        : null
    };

    const requiredGateSatisfied = completed && (!quizState.quizRequirementActive || quizState.quizPassed);
    if (courseModule.isRequired && !requiredGateSatisfied) {
      requiredGateOpen = false;
    }

    return payload;
  });

  const completedCount = modules.filter((module) => module.completed).length;
  const progressPercent = modules.length ? Math.round((completedCount / modules.length) * 100) : 0;
  return { modules, completedCount, progressPercent };
}

async function assertCourseAccess(courseId, user) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: buildCourseInclude(user.id, { includeEnrollmentUsers: true, includeLandingPage: true })
  });

  if (!course) {
    throw new Error('COURSE_NOT_FOUND');
  }

  const managerView = isCourseManager(user, course);
  const enrollment = course.enrollments.find((item) => item.userId === user.id && item.status !== 'CANCELLED');

  if (!managerView && !enrollment) {
    throw new Error('COURSE_ACCESS_DENIED');
  }

  return { course, managerView, enrollment };
}

async function createCourse(req, res) {
  try {
    const { title, description, coverImage } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Course title is required.' });
    }

    const created = await prisma.$transaction(async (tx) => {
      const initialSceneId = `course-draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const course = await tx.course.create({
        data: {
          ownerMasterId: req.user.id,
          title: String(title).trim(),
          description: description || null,
          coverImage: coverImage || null,
          sceneId: initialSceneId
        }
      });

      const sceneId = buildSceneId(course);
      const updatedCourse = await tx.course.update({
        where: { id: course.id },
        data: { sceneId }
      });

      await tx.enrollment.upsert({
        where: { courseId_userId: { courseId: course.id, userId: req.user.id } },
        update: { status: 'ENROLLED' },
        create: { courseId: course.id, userId: req.user.id, status: 'ENROLLED' }
      });

      return updatedCourse;
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create course.' });
  }
}

async function getMyCourses(req, res) {
  try {
    const courses = await prisma.course.findMany({
      where: { ownerMasterId: req.user.id },
      include: buildCourseInclude(req.user.id),
      orderBy: { updatedAt: 'desc' }
    });

    const result = courses.map((course) => {
      const progress = buildCourseProgress(course, req.user.id, true);
      return {
        ...course,
        moduleCount: course.courseModules.length,
        enrollmentCount: course.enrollments.length,
        progressPercent: progress.progressPercent,
        modules: progress.modules
      };
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to load courses.' });
  }
}

async function getAccessibleCourses(req, res) {
  try {
    const roles = getEffectiveUserRoles(req.user);
    const canManage = roles.has('MASTER') || roles.has('ADMIN') || roles.has('SUPER_ADMIN') || roles.has('TEACHER') || roles.has('COORDINATOR');

    const courses = await prisma.course.findMany({
      where: canManage
        ? {
            OR: [
              { ownerMasterId: req.user.id },
              { enrollments: { some: { userId: req.user.id, status: { not: 'CANCELLED' } } } }
            ]
          }
        : { enrollments: { some: { userId: req.user.id, status: { not: 'CANCELLED' } } } },
      include: {
        ...buildCourseInclude(req.user.id),
        landingPage: {
          select: { id: true, title: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const result = courses.map((course) => {
      const managerView = isCourseManager(req.user, course);
      const progress = buildCourseProgress(course, req.user.id, managerView);
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        coverImage: course.coverImage,
        sceneId: course.sceneId,
        status: course.status,
        moduleCount: course.courseModules.length,
        progressPercent: progress.progressPercent,
        completedCount: progress.completedCount,
        modules: progress.modules,
        canManage: managerView,
        landingPage: course.landingPage
      };
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to load accessible courses.' });
  }
}

async function getPublicCourses(req, res) {
  try {
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        landingPage: {
          select: { id: true, title: true }
        },
        owner: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const result = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      coverImage: course.coverImage,
      status: course.status,
      landingPage: course.landingPage,
      instructor: course.owner?.profile?.displayName || course.owner?.username || 'Instructor'
    }));

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to load public courses.' });
  }
}

async function getCourseDetail(req, res) {
  try {
    const courseId = Number(req.params.id);
    const { course, managerView, enrollment } = await assertCourseAccess(courseId, req.user);
    const progress = buildCourseProgress(course, req.user.id, managerView);

    return res.json({
      id: course.id,
      title: course.title,
      description: course.description,
      coverImage: course.coverImage,
      contentHtml: course.contentHtml,
      contentCss: course.contentCss,
      status: course.status,
      sceneId: course.sceneId,
      canManage: managerView,
      enrollment,
      progressPercent: progress.progressPercent,
      completedCount: progress.completedCount,
      modules: progress.modules,
      landingPage: course.landingPage,
      enrollments: managerView
        ? course.enrollments.map((item) => ({
            id: item.id,
            userId: item.userId,
            username: item.user?.username,
            email: item.user?.email,
            displayName: item.user?.profile?.displayName || item.user?.username,
            status: item.status,
            progressPercent: item.progressPercent
          }))
        : undefined
    });
  } catch (error) {
    if (error.message === 'COURSE_NOT_FOUND') {
      return res.status(404).json({ error: 'Course not found.' });
    }
    if (error.message === 'COURSE_ACCESS_DENIED') {
      return res.status(403).json({ error: 'You do not have access to this course.' });
    }

    console.error(error);
    return res.status(500).json({ error: 'Failed to load course.' });
  }
}

async function updateCourse(req, res) {
  try {
    const courseId = Number(req.params.id);
    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    if (!isCourseManager(req.user, existing)) {
      return res.status(403).json({ error: 'Not authorized to update this course.' });
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: req.body.title || existing.title,
        description: req.body.description === undefined ? existing.description : req.body.description,
        coverImage: req.body.coverImage === undefined ? existing.coverImage : req.body.coverImage,
        contentHtml: req.body.contentHtml === undefined ? existing.contentHtml : req.body.contentHtml,
        contentCss: req.body.contentCss === undefined ? existing.contentCss : req.body.contentCss,
        status: req.body.status || existing.status
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update course.' });
  }
}

async function deleteCourse(req, res) {
  try {
    const courseId = Number(req.params.id);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { courseModules: true }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    if (!isCourseManager(req.user, course)) {
      return res.status(403).json({ error: 'Not authorized to delete this course.' });
    }

    // Deletar profundamente todos os módulos vinculados ao curso
    for (const cm of course.courseModules) {
      await deepDeleteModule(cm.moduleId);
    }

    // A exclusão do Curso já irá disparar Cascade no Enrollment, CourseModule (o vinculo), WorldModulePlacement, etc.
    await prisma.course.delete({ where: { id: courseId } });

    return res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({ error: 'Failed to delete course.' });
  }
}

async function addModuleToCourse(req, res) {
  try {
    const courseId = Number(req.params.id);
    const moduleId = Number(req.body.moduleId);
    const requireQuizPass = Boolean(req.body.requireQuizPass);
    const minimumQuizScore = requireQuizPass ? normalizeMinimumQuizScore(req.body.minimumQuizScore) : null;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    if (!isCourseManager(req.user, course)) {
      return res.status(403).json({ error: 'Not authorized to manage this course.' });
    }

    const module = await prisma.trainingModule.findUnique({
      where: { id: moduleId },
      include: {
        _count: {
          select: { quizzes: true }
        }
      }
    });
    if (!module) {
      return res.status(404).json({ error: 'Module not found.' });
    }
    if (module.ownerMasterId !== req.user.id && !getEffectiveUserRoles(req.user).has('ADMIN') && !getEffectiveUserRoles(req.user).has('SUPER_ADMIN')) {
      return res.status(403).json({ error: 'Only the module owner can attach this module to the course.' });
    }
    if (requireQuizPass && module._count.quizzes === 0) {
      return res.status(400).json({ error: 'This module does not have a quiz to require for course progression.' });
    }

    const lastModule = await prisma.courseModule.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'desc' }
    });

    const courseModule = await prisma.$transaction(async (tx) => {
      const created = await tx.courseModule.create({
        data: {
          courseId,
          moduleId,
          orderIndex: typeof req.body.orderIndex === 'number' ? req.body.orderIndex : (lastModule?.orderIndex || 0) + 1,
          isRequired: req.body.isRequired !== false,
          requireQuizPass,
          minimumQuizScore,
          roomLabel: req.body.roomLabel || null
        }
      });

      await syncCoursePlacements(courseId, tx);
      return created;
    });

    return res.status(201).json(courseModule);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'This module is already attached to the course.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Failed to attach module to course.' });
  }
}

async function updateCourseModule(req, res) {
  try {
    const courseModuleId = Number(req.params.courseModuleId);
    const current = await prisma.courseModule.findUnique({
      where: { id: courseModuleId },
      include: {
        course: true,
        module: {
          include: {
            _count: {
              select: { quizzes: true }
            }
          }
        }
      }
    });
    if (!current) {
      return res.status(404).json({ error: 'Course module not found.' });
    }
    if (!isCourseManager(req.user, current.course)) {
      return res.status(403).json({ error: 'Not authorized to update this course module.' });
    }

    const nextRequireQuizPass = req.body.requireQuizPass === undefined
      ? current.requireQuizPass
      : Boolean(req.body.requireQuizPass);
    if (nextRequireQuizPass && current.module?._count?.quizzes === 0) {
      return res.status(400).json({ error: 'This module does not have a quiz to require for course progression.' });
    }

    let nextMinimumQuizScore = current.minimumQuizScore;
    if (nextRequireQuizPass) {
      if (req.body.minimumQuizScore !== undefined || req.body.requireQuizPass !== undefined || nextMinimumQuizScore == null) {
        nextMinimumQuizScore = normalizeMinimumQuizScore(
          req.body.minimumQuizScore === undefined ? nextMinimumQuizScore : req.body.minimumQuizScore
        );
      }
    } else if (req.body.requireQuizPass !== undefined || req.body.minimumQuizScore !== undefined) {
      nextMinimumQuizScore = null;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const entity = await tx.courseModule.update({
        where: { id: courseModuleId },
        data: {
          isRequired: req.body.isRequired === undefined ? current.isRequired : Boolean(req.body.isRequired),
          requireQuizPass: nextRequireQuizPass,
          minimumQuizScore: nextMinimumQuizScore,
          roomLabel: req.body.roomLabel === undefined ? current.roomLabel : req.body.roomLabel
        }
      });
      await syncCoursePlacements(current.courseId, tx);
      return entity;
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update course module.' });
  }
}

async function reorderCourseModules(req, res) {
  try {
    const courseId = Number(req.params.id);
    const orderedIds = Array.isArray(req.body.orderedCourseModuleIds) ? req.body.orderedCourseModuleIds.map(Number) : [];
    const course = await prisma.course.findUnique({ where: { id: courseId }, include: { courseModules: true } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    if (!isCourseManager(req.user, course)) {
      return res.status(403).json({ error: 'Not authorized to reorder modules in this course.' });
    }

    const currentIds = course.courseModules.map((item) => item.id).sort((a, b) => a - b);
    const nextIds = [...orderedIds].sort((a, b) => a - b);
    if (currentIds.length !== nextIds.length || currentIds.some((value, index) => value !== nextIds[index])) {
      return res.status(400).json({ error: 'The provided order does not match the current course modules.' });
    }

    await prisma.$transaction(async (tx) => {
      for (const [index, courseModuleId] of orderedIds.entries()) {
        await tx.courseModule.update({ where: { id: courseModuleId }, data: { orderIndex: index + 1 } });
      }
      await syncCoursePlacements(courseId, tx);
    });

    return res.json({ message: 'Course modules reordered successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to reorder course modules.' });
  }
}

async function removeCourseModule(req, res) {
  try {
    const courseModuleId = Number(req.params.courseModuleId);
    const current = await prisma.courseModule.findUnique({
      where: { id: courseModuleId },
      include: { course: true }
    });
    if (!current) {
      return res.status(404).json({ error: 'Course module not found.' });
    }
    if (!isCourseManager(req.user, current.course)) {
      return res.status(403).json({ error: 'Not authorized to remove this module.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.courseModule.delete({ where: { id: courseModuleId } });
      await syncCoursePlacements(current.courseId, tx);
    });

    return res.json({ message: 'Module removed from course.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to remove module from course.' });
  }
}

async function enrollUser(req, res) {
  try {
    const courseId = Number(req.params.id);
    const userId = Number(req.body.userId);
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    if (!isCourseManager(req.user, course)) {
      return res.status(403).json({ error: 'Not authorized to enroll users in this course.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const enrollment = await prisma.enrollment.upsert({
      where: { courseId_userId: { courseId, userId } },
      update: { status: 'ENROLLED' },
      create: { courseId, userId, status: 'ENROLLED' }
    });

    if (enrollment) {
      await createEnrollmentNotification({
        recipientUserId: userId,
        title: `You have been enrolled in ${course.title}`,
        message: `You were manually enrolled in this course by an instructor.`,
        actorUserId: req.user.id,
        sourceEntityType: 'Course',
        sourceEntityId: course.id
      });
    }

    return res.status(201).json(enrollment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to enroll user.' });
  }
}

async function getCourseRuntime(req, res) {
  try {
    const courseId = Number(req.params.id);
    const { course, managerView, enrollment } = await assertCourseAccess(courseId, req.user);
    const progress = buildCourseProgress(course, req.user.id, managerView);

    return res.json({
      id: course.id,
      title: course.title,
      description: course.description,
      coverImage: course.coverImage,
      status: course.status,
      sceneId: course.sceneId,
      canManage: managerView,
      enrollment,
      progressPercent: progress.progressPercent,
      completedCount: progress.completedCount,
      modules: progress.modules,
      landingPage: course.landingPage
    });
  } catch (error) {
    if (error.message === 'COURSE_NOT_FOUND') {
      return res.status(404).json({ error: 'Course not found.' });
    }
    if (error.message === 'COURSE_ACCESS_DENIED') {
      return res.status(403).json({ error: 'You do not have access to this course.' });
    }

    console.error(error);
    return res.status(500).json({ error: 'Failed to load course runtime.' });
  }
}

async function completeCourseModule(req, res) {
  try {
    const courseId = Number(req.params.id);
    const moduleId = Number(req.params.moduleId);
    const { course, managerView, enrollment } = await assertCourseAccess(courseId, req.user);
    const progress = buildCourseProgress(course, req.user.id, managerView);
    const target = progress.modules.find((item) => item.moduleId === moduleId);

    if (!target) {
      return res.status(404).json({ error: 'Module is not part of this course.' });
    }
    if (!target.unlocked && !managerView) {
      return res.status(403).json({ error: 'This module is still locked by the course path.' });
    }
    if (!target.canMarkComplete && !managerView) {
      return res.status(403).json({ error: target.completionBlockedReason || 'Pass the required quiz before marking this module as done.' });
    }

    await prisma.moduleCompletion.upsert({
      where: { courseId_moduleId_userId: { courseId, moduleId, userId: req.user.id } },
      update: { source: req.body.source || 'DASHBOARD', completedAt: new Date() },
      create: { courseId, moduleId, userId: req.user.id, source: req.body.source || 'DASHBOARD' }
    });

    const refreshed = await prisma.course.findUnique({
      where: { id: courseId },
      include: buildCourseInclude(req.user.id)
    });
    const refreshedProgress = buildCourseProgress(refreshed, req.user.id, managerView);

    if (enrollment) {
      await prisma.enrollment.update({
        where: { courseId_userId: { courseId, userId: req.user.id } },
        data: {
          progressPercent: refreshedProgress.progressPercent,
          status: refreshedProgress.completedCount === refreshedProgress.modules.length && refreshedProgress.modules.length > 0
            ? 'COMPLETED'
            : 'ENROLLED'
        }
      });
    }

    return res.json({
      message: 'Module marked as completed.',
      progressPercent: refreshedProgress.progressPercent,
      completedCount: refreshedProgress.completedCount
    });
  } catch (error) {
    if (error.message === 'COURSE_NOT_FOUND') {
      return res.status(404).json({ error: 'Course not found.' });
    }
    if (error.message === 'COURSE_ACCESS_DENIED') {
      return res.status(403).json({ error: 'You do not have access to this course.' });
    }

    console.error(error);
    return res.status(500).json({ error: 'Failed to complete course module.' });
  }
}

async function selfEnroll(req, res) {
  try {
    const courseId = Number(req.params.id);
    const userId = req.user.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    if (course.status !== 'PUBLISHED') {
      return res.status(403).json({ error: 'Cannot subscribe to an unpublished course.' });
    }

    const enrollment = await prisma.enrollment.upsert({
      where: { courseId_userId: { courseId, userId } },
      update: { status: 'ENROLLED' },
      create: { courseId, userId, status: 'ENROLLED' }
    });

    if (enrollment) {
      // Notify the student
      await createEnrollmentNotification({
        recipientUserId: userId,
        title: `You have subscribed to ${course.title}`,
        message: `You successfully enrolled in ${course.title}.`,
        actorUserId: userId,
        sourceEntityType: 'Course',
        sourceEntityId: course.id
      });
      // Notify the course owner
      if (course.ownerMasterId && course.ownerMasterId !== userId) {
        await createEnrollmentNotification({
          recipientUserId: course.ownerMasterId,
          title: `${req.user.username} has subscribed to ${course.title}`,
          message: `${req.user.username} enrolled in your course.`,
          actorUserId: userId,
          sourceEntityType: 'Course',
          sourceEntityId: course.id
        });
      }
    }

    return res.status(201).json(enrollment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to subscribe to course.' });
  }
}

async function getEnrolledCourses(req, res) {
  try {
    const courses = await prisma.course.findMany({
      where: { 
        enrollments: { some: { userId: req.user.id, status: { not: 'CANCELLED' } } },
        ownerMasterId: { not: req.user.id }
      },
      include: {
        ...buildCourseInclude(req.user.id),
        landingPage: {
          select: { id: true, title: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const result = courses.map((course) => {
      const managerView = isCourseManager(req.user, course);
      const progress = buildCourseProgress(course, req.user.id, managerView);
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        coverImage: course.coverImage,
        sceneId: course.sceneId,
        status: course.status,
        moduleCount: course.courseModules.length,
        progressPercent: progress.progressPercent,
        completedCount: progress.completedCount,
        enrollmentCount: course.enrollments.length,
        creator: course.ownerMaster ? course.ownerMaster.name : 'Platform',
        landingPageId: course.landingPage?.id || null
      };
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to load enrolled courses.' });
  }
}

async function unsubscribe(req, res) {
  try {
    const courseId = Number(req.params.id);
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ error: 'Invalid course ID.' });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId, userId } }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    await prisma.enrollment.delete({
      where: { courseId_userId: { courseId, userId } }
    });

    return res.json({ message: 'Unsubscribed successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to unsubscribe from course.' });
  }
}


function buildStudentAiTip({ progressPercent, currentStage, quizScores, status }) {
  const lowScores = quizScores.filter((score) => typeof score.bestScore === 'number' && score.bestScore < 70);
  const pendingQuizzes = quizScores.filter((score) => score.hasQuiz && score.attempts === 0);

  if (status === 'COMPLETED' || progressPercent >= 100) {
    return 'Course completed. Invite this student to an advanced activity or collect feedback while the content is still fresh.';
  }
  if (lowScores.length) {
    return `Review ${lowScores[0].moduleTitle}: the best quiz score is ${Math.round(lowScores[0].bestScore)}%, below the recommended threshold.`;
  }
  if (pendingQuizzes.length) {
    return `Ask the student to complete the quiz for ${pendingQuizzes[0].moduleTitle} so progress can be assessed.`;
  }
  if (progressPercent === 0) {
    return 'Student has not started yet. Send a welcome reminder and point them to the first module.';
  }
  if (progressPercent < 50) {
    return `Student is in progress at ${currentStage || 'the next module'}. Check if they need support before the next milestone.`;
  }
  return 'Student is progressing well. Encourage completion of the next module and keep monitoring quiz performance.';
}

function buildCourseStudentsInclude() {
  return {
    owner: { select: { id: true, username: true, email: true, profile: { select: { displayName: true } } } },
    editors: true,
    enrollments: {
      where: { status: { not: 'CANCELLED' } },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePicture: true,
            profile: {
              select: {
                displayName: true,
                headline: true,
                organization: true,
                location: true,
                course: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    },
    completions: true,
    courseModules: {
      orderBy: { orderIndex: 'asc' },
      include: {
        placement: true,
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            coverImage: true,
            titleFont: true,
            textColor: true,
            quizzes: { select: { id: true, title: true } },
            submissions: {
              select: {
                id: true,
                userId: true,
                score: true,
                attemptNumber: true,
                createdAt: true
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    }
  };
}

async function getStudentsOverview(req, res) {
  try {
    const roles = getEffectiveUserRoles(req.user);
    const canViewAll = roles.has('ADMIN') || roles.has('SUPER_ADMIN') || roles.has('MASTER');
    const where = canViewAll
      ? {}
      : {
          OR: [
            { ownerMasterId: req.user.id },
            { editors: { some: { userId: req.user.id } } }
          ]
        };

    const courses = await prisma.course.findMany({
      where,
      include: buildCourseStudentsInclude(),
      orderBy: { updatedAt: 'desc' }
    });

    const courseSummaries = courses.map((course) => {
      const students = (course.enrollments || []).map((enrollment) => {
        const progress = buildCourseProgress(course, enrollment.userId, true);
        const firstIncomplete = progress.modules.find((module) => !module.completed);
        const currentStage = firstIncomplete?.title || (progress.modules.length ? 'Course completed' : 'No modules yet');
        const quizScores = progress.modules
          .filter((module) => module.hasQuiz)
          .map((module) => ({
            moduleId: module.moduleId,
            moduleTitle: module.title,
            latestScore: module.latestQuizScore,
            bestScore: module.bestQuizScore,
            attempts: module.quizAttemptCount,
            minimumQuizScore: module.minimumQuizScore,
            quizPassed: module.quizPassed,
            hasQuiz: module.hasQuiz
          }));
        const student = enrollment.user || {};
        const profile = student.profile || {};
        const aiTip = buildStudentAiTip({
          progressPercent: progress.progressPercent,
          currentStage,
          quizScores,
          status: enrollment.status
        });

        return {
          enrollmentId: enrollment.id,
          userId: enrollment.userId,
          username: student.username,
          email: student.email,
          displayName: profile.displayName || student.username || student.email || 'Student',
          profilePicture: student.profilePicture,
          headline: profile.headline,
          organization: profile.organization,
          location: profile.location,
          profileCourse: profile.course,
          enrollmentStatus: enrollment.status,
          progressPercent: progress.progressPercent,
          completedCount: progress.completedCount,
          moduleCount: progress.modules.length,
          currentStage,
          quizScores,
          aiTip,
          modules: progress.modules.map((module) => ({
            moduleId: module.moduleId,
            title: module.title,
            orderIndex: module.orderIndex,
            completed: module.completed,
            unlocked: module.unlocked,
            hasQuiz: module.hasQuiz,
            latestQuizScore: module.latestQuizScore,
            bestQuizScore: module.bestQuizScore,
            quizAttemptCount: module.quizAttemptCount,
            quizPassed: module.quizPassed
          })),
          enrolledAt: enrollment.createdAt,
          updatedAt: enrollment.updatedAt
        };
      });

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        status: course.status,
        coverImage: course.coverImage,
        owner: course.owner ? {
          id: course.owner.id,
          username: course.owner.username,
          email: course.owner.email,
          displayName: course.owner.profile?.displayName || course.owner.username
        } : null,
        moduleCount: course.courseModules.length,
        studentCount: students.length,
        students
      };
    });

    const flatStudents = courseSummaries.flatMap((course) => course.students.map((student) => ({
      ...student,
      courseId: course.id,
      courseTitle: course.title,
      courseStatus: course.status,
      courseModuleCount: course.moduleCount
    })));

    return res.json({
      courses: courseSummaries,
      students: flatStudents,
      totalCourses: courseSummaries.length,
      totalStudents: flatStudents.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to load students overview.' });
  }
}

async function getCourseEditors(req, res) {
  try {
    const courseId = Number(req.params.id);
    const editors = await prisma.courseEditor.findMany({
      where: { courseId },
      include: {
        user: {
          select: { id: true, username: true, email: true, profile: { select: { displayName: true } } }
        }
      }
    });
    return res.json(editors);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load editors' });
  }
}

async function addCourseEditor(req, res) {
  try {
    const courseId = Number(req.params.id);
    const { userId } = req.body;
    
    const course = await prisma.course.findUnique({ where: { id: courseId }, include: { editors: true } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (!isCourseManager(req.user, course)) return res.status(403).json({ error: 'Forbidden' });

    if (String(course.ownerMasterId) === String(userId)) {
        return res.status(400).json({ error: 'User is already the owner' });
    }

    const newEditor = await prisma.courseEditor.upsert({
      where: { courseId_userId: { courseId, userId: Number(userId) } },
      update: {},
      create: { courseId, userId: Number(userId) },
      include: { user: { select: { id: true, username: true, email: true } } }
    });

    if (newEditor) {
      await createEventInviteNotification({
        recipientUserId: Number(userId),
        title: `You have been added as a Co-Editor`,
        message: `You are now a co-editor for ${course.title}`,
        actorUserId: req.user.id,
        sourceEntityType: 'Course',
        sourceEntityId: course.id
      });
    }

    return res.status(201).json(newEditor);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to add editor' });
  }
}

async function removeCourseEditor(req, res) {
  try {
    const courseId = Number(req.params.id);
    const userId = Number(req.params.userId);

    const course = await prisma.course.findUnique({ where: { id: courseId }, include: { editors: true } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (!isCourseManager(req.user, course)) return res.status(403).json({ error: 'Forbidden' });

    await prisma.courseEditor.deleteMany({
      where: { courseId, userId }
    });
    return res.json({ message: 'Editor removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to remove editor' });
  }
}

async function getCourseInsights(req, res) {
  try {
    const courseId = Number(req.params.id);
    const { course, managerView } = await assertCourseAccess(courseId, req.user);
    const progress = buildCourseProgress(course, req.user.id, managerView);

    // Calculate average score for the user in this course
    let totalScore = 0;
    let quizCount = 0;

    progress.modules.forEach(m => {
      if (m.hasQuiz && m.bestQuizScore !== null) {
        totalScore += m.bestQuizScore;
        quizCount++;
      }
    });

    const averageScore = quizCount > 0 ? Math.round(totalScore / quizCount) : 0;

    const studentStats = {
      courseTitle: course.title,
      totalModules: progress.modules.length,
      completedModules: progress.completedCount,
      progressPercent: progress.progressPercent,
      averageScore,
      recentlyCompleted: progress.modules.filter(m => m.completed).map(m => m.title).slice(-3) // last 3 completed
    };

    const insights = await generateCourseInsightsForStudent(studentStats);
    
    return res.json(insights);
  } catch (error) {
    if (error.message === 'COURSE_NOT_FOUND') {
      return res.status(404).json({ error: 'Course not found.' });
    }
    if (error.message === 'COURSE_ACCESS_DENIED') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    console.error('Error fetching course insights:', error);
    return res.status(500).json({ error: 'Failed to fetch course insights.' });
  }
}

module.exports = {
  getCourseInsights,
  addCourseEditor,
  removeCourseEditor,
  getStudentsOverview,
  getCourseEditors,
  getEffectiveUserRoles,
  isCourseManager,
  buildCourseInclude,
  buildCourseProgress,
  assertCourseAccess,
  createCourse,
  getMyCourses,
  getAccessibleCourses,
  getPublicCourses,
  getCourseDetail,
  updateCourse,
  deleteCourse,
  addModuleToCourse,
  updateCourseModule,
  reorderCourseModules,
  removeCourseModule,
  enrollUser,
  selfEnroll,
  unsubscribe,
  getEnrolledCourses,
  getCourseRuntime,
  completeCourseModule,
  syncCoursePlacements
};
