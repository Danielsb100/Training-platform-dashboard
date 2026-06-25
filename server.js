const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');

const env = require('./config/env');
const prisma = require('./config/db');
const { buildClientRuntimeConfig } = require('./config/runtime');
const { backfillAllUserIdentities } = require('./services/identityService');
const { sendSuccess, sendError } = require('./utils/http');

const authController = require('./controllers/authController');
const authenticateToken = require('./middleware/authMiddleware');
const userController = require('./controllers/userController');
const profileController = require('./controllers/profileController');
const roleMiddleware = require('./middleware/roleMiddleware');
const documentController = require('./controllers/documentController');
const moduleController = require('./controllers/moduleController');
const contentController = require('./controllers/contentController');
const forumController = require('./controllers/forumController');
const analyticsController = require('./controllers/analyticsController');
const placementController = require('./controllers/placementController');
const reportController = require('./controllers/reportController');
const notificationController = require('./controllers/notificationController');
const courseController = require('./controllers/courseController');
const channelController = require('./controllers/channelController');
const landingPageController = require('./controllers/landingPageController');
const moduleAiController = require('./controllers/moduleAiController');
const aiKnowledgeController = require('./controllers/aiKnowledgeController');
const trainingAiController = require('./controllers/trainingAiController');
const aiTipsController = require('./controllers/aiTipsController');
const systemController = require('./controllers/systemController');
const multiplayerController = require('./controllers/multiplayerController');
const languageSessionController = require('./controllers/languageSessionController');
const courseRoomController = require('./controllers/courseRoomController');
const certificateController = require('./controllers/certificateController');

const COURSE_MANAGER_ROLES = ['MASTER', 'ADMIN', 'SUPER_ADMIN', 'TUTOR', 'TEACHER', 'COORDINATOR'];
const MODULE_MANAGER_ROLES = ['MASTER', 'ADMIN', 'SUPER_ADMIN', 'TUTOR', 'TEACHER', 'COORDINATOR'];

fs.mkdirSync(env.upload.tempDir, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.upload.maxFileSizeBytes }
});

const handleUploadError = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `File is too large. Maximum allowed size is ${env.upload.maxFileSizeMb} MB.`
      });
    }

    return res.status(400).json({ error: error.message || 'File upload failed.' });
  });
};

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Allowed MIME types for document uploads (PDF, Office formats, plain text, etc.)
const ALLOWED_DOCUMENT_MIMES = [
  'application/pdf',
  // Microsoft Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Microsoft PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Microsoft Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // OpenDocument formats
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.spreadsheet',
  // Plain text & CSV
  'text/plain',
  'text/csv',
];

const uploadToDisk = multer({
  storage: multer.diskStorage({
    destination: env.upload.tempDir
  }),
  limits: { fileSize: env.upload.maxFileSizeBytes },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP images are allowed.`));
    }
  }
});

const handleUploadToDiskError = (fieldName) => (req, res, next) => {
  uploadToDisk.single(fieldName)(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `File is too large. Maximum allowed size is ${env.upload.maxFileSizeMb} MB.`
      });
    }

    return res.status(400).json({ error: error.message || 'File upload failed.' });
  });
};

// Separate multer for document uploads — allows PDF, Word, PowerPoint, Excel, etc.
const uploadDocumentToDisk = multer({
  storage: multer.diskStorage({
    destination: env.upload.tempDir
  }),
  limits: { fileSize: env.upload.maxFileSizeBytes },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_DOCUMENT_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ODT, ODP, ODS, TXT, CSV.`));
    }
  }
});

const handleUploadDocumentToDiskError = (fieldName) => (req, res, next) => {
  uploadDocumentToDisk.single(fieldName)(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `File is too large. Maximum allowed size is ${env.upload.maxFileSizeMb} MB.`
      });
    }

    return res.status(400).json({ error: error.message || 'File upload failed.' });
  });
};

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'
});

multiplayerController.initSocket(io);

// Inject the multiplayer rooms reference into the courseRoomController for online counts
courseRoomController.setRoomsRef(multiplayerController.getRoomsRef());

const PORT = env.port;

const corsOptions = env.cors.origins.length
  ? {
      origin(origin, callback) {
        if (!origin || env.cors.origins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error('Origin not allowed by CORS.'));
      }
    }
  : undefined;

app.use(helmet({
  contentSecurityPolicy: false, // Disabled: frontend uses inline scripts. Re-enable with nonces later.
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Rate Limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
});

app.use('/peerjs', peerServer);
app.get('/api/catalog', multiplayerController.getCatalog);

app.get('/app-config.js', (req, res) => {
  res.type('application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`window.__APP_CONFIG__ = Object.freeze(${JSON.stringify(buildClientRuntimeConfig(req))});`);
});

app.use(
  express.static(path.join(__dirname, 'public'), {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // 1. Heavy static assets (3D models, fonts, images) -> cache for 1 year
      if (/\.(glb|gltf|png|jpg|jpeg|gif|webp|svg|woff|woff2)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } 
      // 2. JavaScript and CSS -> cache but MUST revalidate with server (ETag) to ensure latest code
      else if (/\.(css|js)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, no-cache');
      } 
      // 3. HTML files -> strictly no caching
      else {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  })
);

// --- Prevent caching for all API and dynamic routes ---
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.post('/auth/register', authLimiter, authController.register);
app.post('/auth/login', authLimiter, authController.login);
app.post('/auth/verify-email', authLimiter, authController.verifyEmail);
app.post('/auth/resend-code', authLimiter, authController.resendCode);
app.post('/auth/password/request', authLimiter, authController.requestPasswordReset);
app.post('/auth/password/reset', authLimiter, authController.resetPassword);
app.get('/auth/verify', authenticateToken, authController.verify);

app.get('/api/users', authenticateToken, roleMiddleware(['ADMIN', 'MASTER']), userController.getAllUsers);
app.get('/api/users/search', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), userController.searchUsers);
app.patch('/api/users/:id/roles', authenticateToken, roleMiddleware(['ADMIN', 'MASTER', 'SUPER_ADMIN']), userController.updateUserRoles);
app.post('/api/users/reset', authenticateToken, roleMiddleware(['MASTER']), userController.resetDatabase);
app.delete('/api/users/:id', authenticateToken, roleMiddleware(['MASTER']), userController.deleteUser);
app.post(
  '/api/users/profile-picture',
  authenticateToken,
  handleUploadError('profilePicture'),
  userController.uploadProfilePicture
);
app.get('/api/users/:id/profile-card', authenticateToken, profileController.getUserProfileCard);

app.get('/api/profile/me', authenticateToken, profileController.getMyProfile);
app.put('/api/profile/me', authenticateToken, profileController.updateMyProfile);
app.put('/api/profile/preferences', authenticateToken, profileController.updateMyPreferences);
app.put('/api/profile/consents', authenticateToken, profileController.updateMyConsents);
app.post('/api/profile/portfolio', authenticateToken, profileController.createPortfolioItem);
app.put('/api/profile/portfolio/:id', authenticateToken, profileController.updatePortfolioItem);
app.delete('/api/profile/portfolio/:id', authenticateToken, profileController.deletePortfolioItem);

app.get('/api/notifications/summary', authenticateToken, notificationController.getSummary);
app.patch('/api/notifications/read-all', authenticateToken, notificationController.setAllNotificationsRead);
app.patch('/api/notifications/:id/read', authenticateToken, notificationController.setNotificationRead);
app.patch('/api/tasks/:id', authenticateToken, notificationController.updateTaskStatus);
app.patch('/api/reminders/:id', authenticateToken, notificationController.updateReminder);

app.post('/courses', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.createCourse);
app.get('/courses/my', authenticateToken, courseController.getMyCourses);
app.get('/courses/public', courseController.getPublicCourses);
app.get('/courses/accessible', authenticateToken, courseController.getAccessibleCourses);
app.get('/courses/:id', authenticateToken, courseController.getCourseDetail);
app.get('/courses/:id/runtime', authenticateToken, courseController.getCourseRuntime);
app.post('/courses/:id/modules/:moduleId/complete', authenticateToken, courseController.completeCourseModule);
app.get(
  '/api/students/overview',
  authenticateToken,
  roleMiddleware(['MASTER', 'ADMIN', 'TUTOR', 'TEACHER', 'COORDINATOR', 'SUPER_ADMIN']),
  courseController.getStudentsOverview
);
app.put('/courses/:id', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.updateCourse);
app.delete('/courses/:id', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.deleteCourse);
app.post('/courses/:id/modules', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.addModuleToCourse);
app.patch('/courses/:id/modules/reorder', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.reorderCourseModules);
app.patch('/courses/:id/modules/:courseModuleId', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.updateCourseModule);
app.delete('/courses/:id/modules/:courseModuleId', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.removeCourseModule);
app.post('/courses/:id/enrollments', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.enrollUser);
app.post('/api/courses/:id/enrollments', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.enrollUser);
app.get('/api/courses/:id/enrollments', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.getCourseStudents);
app.delete('/api/courses/:id/enrollments/:userId', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.removeStudent);
app.patch('/api/courses/:id/enrollments/:userId/approve', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.approveEnrollment);

// --- Channels ---
app.post('/channels', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), channelController.createChannel);
app.get('/channels/my', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), channelController.getMyChannels);
app.get('/channels/public', channelController.getPublicChannels);
app.get('/channels/:id', authenticateToken, channelController.getChannelDetail);
app.put('/channels/:id', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), channelController.updateChannel);
app.delete('/channels/:id', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), channelController.deleteChannel);
app.post('/channels/:id/courses', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), channelController.addCourseToChannel);
app.delete('/channels/:id/courses/:courseId', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), channelController.removeCourseFromChannel);
app.get('/courses/:id/runtime', authenticateToken, courseController.getCourseRuntime);
app.post('/courses/:id/modules/:moduleId/complete', authenticateToken, courseController.completeCourseModule);
app.post('/api/courses/:id/subscribe', authenticateToken, courseController.selfEnroll);
app.get('/api/courses/enrolled', authenticateToken, courseController.getEnrolledCourses);
app.delete('/api/courses/:id/unsubscribe', authenticateToken, courseController.unsubscribe);
app.get('/api/courses/:id/insights', authenticateToken, courseController.getCourseInsights);

app.get('/api/courses/:id/editors', authenticateToken, courseController.getCourseEditors);
app.post('/api/courses/:id/editors', authenticateToken, courseController.addCourseEditor);
app.delete('/api/courses/:id/editors/:userId', authenticateToken, courseController.removeCourseEditor);

// --- Course Rooms (3D World Room Management) ---
app.post('/api/courses/:id/rooms', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseRoomController.createRoom);
app.get('/api/courses/:id/rooms', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseRoomController.getRooms);
app.get('/api/courses/:id/rooms/my', authenticateToken, courseRoomController.getMyRooms);
app.put('/api/courses/:id/rooms/:roomId', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseRoomController.updateRoom);
app.delete('/api/courses/:id/rooms/:roomId', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseRoomController.deleteRoom);
app.post('/api/courses/:id/rooms/:roomId/members', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseRoomController.addMembers);
app.delete('/api/courses/:id/rooms/:roomId/members/:userId', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseRoomController.removeMember);
app.get('/api/courses/:id/rooms/:roomId/members', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseRoomController.getMembers);
app.get('/api/courses/:id/rooms/:roomId/online-count', authenticateToken, courseRoomController.getOnlineCount);
app.post('/api/courses/:id/rooms/:roomId/thumbnail', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), handleUploadError('thumbnail'), courseRoomController.uploadThumbnail);

// --- Landing Pages API ---
app.get('/api/landing-pages', authenticateToken, landingPageController.getLandingPages);
app.get('/api/landing-pages/:id', authenticateToken, landingPageController.getLandingPageById);
app.get('/api/landing-pages/course/:courseId', landingPageController.getLandingPageByCourseId);
app.post('/api/landing-pages', authenticateToken, landingPageController.createLandingPage);
app.put('/api/landing-pages/:id', authenticateToken, landingPageController.updateLandingPage);
app.delete('/api/landing-pages/:id', authenticateToken, landingPageController.deleteLandingPage);

// --- Certificates API ---
app.get('/api/courses/:id/certificate-template', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), certificateController.getTemplate);
app.put('/api/courses/:id/certificate-template', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), certificateController.upsertTemplate);
app.delete('/api/courses/:id/certificate-template', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), certificateController.deleteTemplate);
app.post('/api/courses/:id/certificates/issue', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), certificateController.issueCertificate);
app.post('/api/courses/:id/certificates/issue-bulk', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), certificateController.issueBulk);
app.get('/api/courses/:id/certificates', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), certificateController.listIssuedCertificates);
app.get('/api/certificates/my', authenticateToken, certificateController.getMyCertificates);
app.get('/api/certificates/:id/download', authenticateToken, certificateController.downloadCertificate);
app.post('/api/courses/:id/certificate-template/preview', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), certificateController.previewPdf);


app.post('/modules', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), moduleController.createModule);
app.get('/modules/my', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), moduleController.getMyModules);
app.get(
  '/modules/my/assignable',
  authenticateToken,
  roleMiddleware(MODULE_MANAGER_ROLES),
  moduleController.getMyAssignableModules
);
app.get('/modules', authenticateToken, moduleController.getAllPublishedModules);
app.get('/modules/:id', authenticateToken, moduleController.getModuleById);
app.put('/modules/:id', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), moduleController.updateModule);
app.patch('/modules/:id/publish', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), (req, res) =>
  moduleController.patchStatus(req, res, 'PUBLISHED')
);
app.patch('/modules/:id/archive', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), (req, res) =>
  moduleController.patchStatus(req, res, 'ARCHIVED')
);
app.delete('/modules/:id', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), moduleController.deleteModule);

app.get('/modules/:id/edit-format', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), moduleController.getEditFormat);
app.get('/runtime/modules/:id', authenticateToken, moduleController.getRuntimeFormat);

// --- Course Simulation ---
app.get('/courses/:id/simulation', authenticateToken, courseController.getSimulation);
app.put('/courses/:id/simulation', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), courseController.saveSimulation);

// [SECURITY] Debug endpoint removed — CRIT-01

app.post('/modules/:id/videos', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), contentController.addVideo);
app.put('/modules/:id/videos/:videoId', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), contentController.updateVideo);
app.delete(
  '/modules/:id/videos/:videoId',
  authenticateToken,
  roleMiddleware(MODULE_MANAGER_ROLES),
  contentController.deleteVideo
);

app.post('/modules/:id/documents', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), contentController.addDocument);
app.put(
  '/modules/:id/documents/:documentId',
  authenticateToken,
  roleMiddleware(MODULE_MANAGER_ROLES),
  contentController.updateDocument
);
app.delete(
  '/modules/:id/documents/:documentId',
  authenticateToken,
  roleMiddleware(MODULE_MANAGER_ROLES),
  contentController.deleteDocument
);
app.post('/modules/:id/quizzes', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), contentController.createQuiz);
app.put('/modules/:id/quizzes/:quizId', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), contentController.updateQuiz);
app.post('/modules/:id/quizzes/ai-generate', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), contentController.createAiGeneratedQuiz);
app.delete('/modules/:id/quizzes/:quizId', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), contentController.deleteQuiz);
app.post('/quizzes/:quizId/questions', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), contentController.addQuizQuestion);
app.delete('/modules/:id/quiz/questions/:questionId', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), contentController.deleteQuizQuestion);
app.put(
  '/quizzes/:quizId/questions/:questionId',
  authenticateToken,
  roleMiddleware(MODULE_MANAGER_ROLES),
  contentController.updateQuizQuestion
);

app.post('/modules/:id/quiz/submit', authenticateToken, contentController.submitQuiz);
app.get('/modules/:id/quiz/submissions', authenticateToken, contentController.getQuizzesSubmissions);
app.post('/modules/:id/quizzes/:quizId/translate', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), contentController.translateQuizEndpoint);
app.post('/modules/:id/assistant/chat', authenticateToken, moduleAiController.chatWithModuleAssistant);

// --- Language Sessions ---
app.get('/modules/:id/language-sessions', authenticateToken, languageSessionController.getSessions);
app.post('/modules/:id/language-sessions', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), languageSessionController.createSession);
app.delete('/modules/:id/language-sessions/:sessionId', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), languageSessionController.deleteSession);
app.post('/modules/:id/language-sessions/:sessionId/duplicate-to', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), languageSessionController.duplicateTo);
app.post('/modules/:id/language-sessions/:sessionId/copy-from/:sourceId', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), languageSessionController.copyFrom);
app.patch('/modules/:id/language-sessions/:sessionId/swap-locale', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), languageSessionController.swapLocale);

app.get('/api/ai-tips/me', authenticateToken, aiTipsController.getMyTips);
app.post('/api/ai-tips/:id/dismiss', authenticateToken, aiTipsController.dismissMyTip);
app.get('/api/courses/:courseId/ai-tips/students', authenticateToken, roleMiddleware(COURSE_MANAGER_ROLES), aiTipsController.getCourseStudentTips);

app.post('/api/ai/chat', authenticateToken, trainingAiController.chat);
app.get('/api/ai/knowledge-base/config', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.getConfig);
app.get('/api/ai/knowledge-base/connections', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.listConnections);
app.post('/api/ai/knowledge-base/connections', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.createConnection);
app.put('/api/ai/knowledge-base/connections/active', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.setActiveConnections);
app.put('/api/ai/knowledge-base/connections/:id', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.updateConnection);
app.delete('/api/ai/knowledge-base/connections/:id', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.deleteConnection);
app.post('/api/ai/knowledge-base/connections/:id/refresh', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.refresh);
app.post('/api/ai/knowledge-base/default', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.ensureDefault);
app.put('/api/ai/knowledge-base/config', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.updateConfig);
app.get('/api/ai/knowledge-base/remote', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.listRemote);
app.post('/api/ai/knowledge-base/refresh', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.refresh);
app.get('/api/ai/knowledge-base/sync-items', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.listSyncItems);
app.put('/api/ai/knowledge-base/sync-items/:id', authenticateToken, roleMiddleware(MODULE_MANAGER_ROLES), aiKnowledgeController.updateSyncItem);

app.post('/modules/:id/forum/threads', authenticateToken, forumController.createThread);
app.get('/modules/:id/forum/threads', authenticateToken, forumController.getThreadsByModule);
app.post('/forum/threads/:threadId/replies', authenticateToken, forumController.createReply);
app.get('/forum/threads/:threadId', authenticateToken, forumController.getThreadById);

app.post('/modules/:id/access', authenticateToken, analyticsController.logAccess);
app.post('/modules/:id/videos/:videoId/progress', authenticateToken, analyticsController.logVideoProgress);
app.post('/modules/:id/documents/:documentId/download', authenticateToken, analyticsController.logDocumentDownload);

app.post('/world/placements', authenticateToken, roleMiddleware(['MASTER']), placementController.createPlacement);
app.get('/world/placements', authenticateToken, placementController.getPlacementsByScene);
app.get('/world/placements/:id', authenticateToken, placementController.getPlacementById);
app.put('/world/placements/:id', authenticateToken, roleMiddleware(['MASTER']), placementController.updatePlacement);
app.delete('/world/placements/:id', authenticateToken, roleMiddleware(['MASTER']), placementController.deletePlacement);
app.patch('/world/placements/:id/assign-module', authenticateToken, roleMiddleware(['MASTER']), placementController.assignModule);
app.patch('/world/placements/:id/unassign-module', authenticateToken, roleMiddleware(['MASTER']), (req, res) => {
  req.body.moduleId = null;
  placementController.assignModule(req, res);
});
app.patch(
  '/world/placements/:id/model',
  authenticateToken,
  roleMiddleware(['MASTER']),
  upload.single('model'),
  placementController.uploadModel
);
app.get('/world/placements/:id/model', placementController.serveModel);

app.get(
  '/modules/:id/reports/overview',
  authenticateToken,
  roleMiddleware(['MASTER', 'ADMIN']),
  reportController.getModuleOverview
);
app.get(
  '/modules/:id/reports/users',
  authenticateToken,
  roleMiddleware(['MASTER', 'ADMIN']),
  reportController.getModuleUsers
);
app.get(
  '/modules/:id/reports/users/:userId',
  authenticateToken,
  roleMiddleware(['MASTER', 'ADMIN']),
  reportController.getUserDetailedReport
);

app.post('/api/documents/upload', authenticateToken, handleUploadDocumentToDiskError('document'), documentController.uploadDocument);
app.post('/api/documents/:id/ticket', authenticateToken, documentController.generateDownloadTicket);
app.get('/api/documents/ticket/:ticket', documentController.downloadByTicket);
app.get('/api/documents', authenticateToken, (req, res) => {
  req.params.username = req.user.username;
  documentController.getUserDocuments(req, res);
});
app.get('/api/documents/user/:username', authenticateToken, documentController.getUserDocuments);
app.get('/api/documents/download/:id', authenticateToken, documentController.downloadDocument);
app.delete('/api/documents/:id', authenticateToken, documentController.deleteDocument);

// --- System Settings API ---
// Public route: homepage_config must be readable without login (carousel, news banners)
app.get('/api/system/settings/homepage_config', (req, res) => {
  req.params.key = 'homepage_config';
  systemController.getSettings(req, res);
});
// All other settings require authentication
app.get('/api/system/settings/:key', authenticateToken, systemController.getSettings);
app.put('/api/system/settings/:key', authenticateToken, roleMiddleware(['MASTER']), systemController.updateSettings);
app.post('/api/system/settings/upload-public-image', authenticateToken, roleMiddleware(['MASTER']), handleUploadToDiskError('image'), systemController.uploadPublicImage);

app.get('/', (req, res) => {
  return sendSuccess(res, { message: 'Authentication API is running.' });
});

const seedMasterUser = async () => {
  if (!env.seed.autoSeedMaster) {
    return;
  }

  try {
    const { username, email, password } = env.seed.masterUser;

    const existingMaster = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (!existingMaster) {
      const password_hash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: { username, email, password_hash, role: 'MASTER' }
      });
      console.log(`[seed] Master user created automatically: ${username}`);
    } else if (existingMaster.role !== 'MASTER') {
      await prisma.user.update({
        where: { id: existingMaster.id },
        data: { role: 'MASTER' }
      });
      console.log(`[seed] Account ${username} converted to MASTER.`);
    }
  } catch (err) {
    console.error('Falha ao criar o Master User automaticamente:', err);
  }
};

app.use((req, res) => {
  return sendError(res, {
    status: 404,
    code: 'ROUTE_NOT_FOUND',
    message: 'Route not found.',
    extra: { path: req.originalUrl }
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, {
        status: 400,
        code: 'UPLOAD_FILE_TOO_LARGE',
        message: `Arquivo muito grande. Limite de ${env.upload.maxFileSizeMb}MB.`
      });
    }

    return sendError(res, {
      status: 400,
      code: 'UPLOAD_ERROR',
      message: `Erro no upload: ${err.message}`
    });
  }

  if (err && err.message === 'Origin not allowed by CORS.') {
    return sendError(res, {
      status: 403,
      code: 'CORS_ORIGIN_DENIED',
      message: 'Origin not allowed by CORS.'
    });
  }

  console.error(err);
  return sendError(res, {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Internal server error.'
  });
});

env.meta.warnings.forEach((warning) => {
  console.warn(`[config] ${warning}`);
});

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await seedMasterUser();
  await backfillAllUserIdentities();
});
