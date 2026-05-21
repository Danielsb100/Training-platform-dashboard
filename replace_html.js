const fs = require('fs');

// 1. marketplace.html
let mkp = fs.readFileSync('public/marketplace.html', 'utf8');
mkp = mkp.replace('SERVICES MARKETPLACE', '<span data-i18n="marketplace.servicesMarketplace">SERVICES MARKETPLACE</span>');
mkp = mkp.replace('LATEST NEWS', '<span data-i18n="marketplace.latestNews">LATEST NEWS</span>');
mkp = mkp.replace('EXCLUSIVE CHANNELS', '<span data-i18n="marketplace.exclusiveChannels">EXCLUSIVE CHANNELS</span>');
mkp = mkp.replace('>Services<', ' data-i18n="common.services">Services<');
mkp = mkp.replace('>News<', ' data-i18n="common.news">News<');
mkp = mkp.replace('>Contact<', ' data-i18n="common.contact">Contact<');
mkp = mkp.replace('+ Add News Container', '<span data-i18n="marketplace.addNewsContainer">+ Add News Container</span>');
fs.writeFileSync('public/marketplace.html', mkp);

// 2. students.html
let std = fs.readFileSync('public/students.html', 'utf8');
std = std.replace('<p style="font-size:.78rem; text-transform:uppercase; letter-spacing:.12em; font-weight:800; margin-bottom:8px;">Dashboard</p>', '<p data-i18n="students.dashboard" style="font-size:.78rem; text-transform:uppercase; letter-spacing:.12em; font-weight:800; margin-bottom:8px;">Dashboard</p>');
std = std.replace('<h1>Students</h1>', '<h1 data-i18n="students.title">Students</h1>');
std = std.replace('<p>Track course progress, current stage, quiz scores, and AI tips for each enrolled student.</p>', '<p data-i18n="students.subtitle">Track course progress, current stage, quiz scores, and AI tips for each enrolled student.</p>');
std = std.replace(' Refresh</button>', ' <span data-i18n="common.refresh">Refresh</span></button>');
std = std.replace('<span>Courses</span>', '<span data-i18n="students.courses">Courses</span>');
std = std.replace('<span>Students</span>', '<span data-i18n="students.studentsCount">Students</span>');
std = std.replace('<span>Avg. Progress</span>', '<span data-i18n="students.avgProgress">Avg. Progress</span>');
std = std.replace('placeholder="Search by student, email, course, stage or AI tip..."', 'data-i18n-placeholder="students.searchPlaceholder" placeholder="Search by student, email, course, stage or AI tip..."');
std = std.replace('>All courses<', ' data-i18n="students.allCourses">All courses<');
std = std.replace('>All statuses<', ' data-i18n="students.allStatuses">All statuses<');
std = std.replace('>Enrolled<', ' data-i18n="students.enrolled">Enrolled<');
std = std.replace('>Completed<', ' data-i18n="students.completed">Completed<');
std = std.replace('<th>Student</th>', '<th data-i18n="students.student">Student</th>');
std = std.replace('<th>Course</th>', '<th data-i18n="students.course">Course</th>');
std = std.replace('<th>Current stage</th>', '<th data-i18n="students.currentStage">Current stage</th>');
std = std.replace('<th>Progress</th>', '<th data-i18n="students.progress">Progress</th>');
std = std.replace('<th>Quiz scores</th>', '<th data-i18n="students.quizScores">Quiz scores</th>');
std = std.replace('<th>AI tips</th>', '<th data-i18n="students.aiTips">AI tips</th>');
fs.writeFileSync('public/students.html', std);

// 3. profile.html
let prf = fs.readFileSync('public/profile.html', 'utf8');
prf = prf.replace('>Eurobot Sync<', ' data-i18n="profile.eurobotSync">Eurobot Sync<');
prf = prf.replace('Manage the Training Platform knowledge-base connection and sync existing course videos, documents, quizzes, and module content to Eurobot.', '<span data-i18n="profile.eurobotSyncDesc">Manage the Training Platform knowledge-base connection and sync existing course videos, documents, quizzes, and module content to Eurobot.</span>');
prf = prf.replace('>Eurobot Knowledge Sync<', ' data-i18n="profile.eurobotKnowledgeSync">Eurobot Knowledge Sync<');
prf = prf.replace('Sync existing course videos, documents, quizzes, and module content to the active Eurobot knowledge base.', '<span data-i18n="profile.eurobotSyncInfo">Sync existing course videos, documents, quizzes, and module content to the active Eurobot knowledge base.</span>');
prf = prf.replace(' Ensure KB</button>', ' <span data-i18n="profile.ensureKB">Ensure KB</span></button>');
prf = prf.replace(' Sync now</button>', ' <span data-i18n="profile.syncNow">Sync now</span></button>');
prf = prf.replace('Loading Eurobot sync status...', '<span data-i18n="profile.loadingSyncStatus">Loading Eurobot sync status...</span>');
prf = prf.replace('<h3 id="profile-name">Loading...</h3>', '<h3 id="profile-name" data-i18n="common.loading">Loading...</h3>');
fs.writeFileSync('public/profile.html', prf);

console.log('HTML files updated successfully.');
