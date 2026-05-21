const fs = require('fs');
const path = require('path');

// 1. Fix global_notifications.js
let gNotif = fs.readFileSync('public/global_notifications.js', 'utf8');
gNotif = gNotif.replace('popupBadge.innerText = `${unreadCount} ${window.t ? window.t(\'common.new\', \'new\') : \'new\'}`;',
`
                    const renderBadge = () => { popupBadge.innerText = \`\${unreadCount} \${window.t ? window.t('common.new', 'new') : 'new'}\`; };
                    if (window.onI18nReady) window.onI18nReady(renderBadge); else renderBadge();
`);

gNotif = gNotif.replace('const listContainer = document.getElementById(\'popup-notification-list\');',
`const listContainer = document.getElementById('popup-notification-list');`);

gNotif = gNotif.replace('listContainer.innerHTML = inbox.map(n => `',
`listContainer.innerHTML = inbox.map(n => {
                        let title = n.title || 'Notification';
                        let message = n.message || '';
                        if (title.startsWith('You have subscribed to ')) {
                            let courseName = title.replace('You have subscribed to ', '');
                            title = window.t ? window.t('notifications.subscribedTitle', 'You have subscribed to {course}').replace('{course}', courseName) : title;
                        } else if (title.startsWith('You have been added as a Co-Editor')) {
                            title = window.t ? window.t('notifications.coEditorTitle', 'You have been added as a Co-Editor') : title;
                        }
                        
                        if (message.startsWith('You successfully enrolled in ')) {
                            let courseName = message.replace('You successfully enrolled in ', '').replace('.', '');
                            message = window.t ? window.t('notifications.subscribedMessage', 'You successfully enrolled in {course}.').replace('{course}', courseName) : message;
                        } else if (message.includes('has added you as a co-editor')) {
                            let parts = message.split(' has added you as a co-editor on ');
                            if(parts.length === 2) {
                                message = window.t ? window.t('notifications.coEditorMessage', '{user} has added you as a co-editor on {course}').replace('{user}', parts[0]).replace('{course}', parts[1]) : message;
                            }
                        }
                        
                        return \``);
gNotif = gNotif.replace('</div>\n                    `).join(\'\');', '</div>\n                    `;\n                    }).join(\'\');');
fs.writeFileSync('public/global_notifications.js', gNotif);


// 2. Fix profile.js No Enrollments
let prfjs = fs.readFileSync('public/profile.js', 'utf8');
prfjs = prfjs.replace('<h3 style="margin: 0 0 10px 0; color: #1e293b;">${window.t ? window.t(\'profile.noEnrollments\', \'No Enrollments Found\') : \'No Enrollments Found\'}</h3>', '<h3 data-i18n="profile.noEnrollments" style="margin: 0 0 10px 0; color: #1e293b;">No Enrollments Found</h3>');
prfjs = prfjs.replace('<p style="color: #64748b; margin: 0; max-width: 400px; margin: 0 auto;">${window.t ? window.t(\'profile.noEnrollmentsDesc\', \'You have no enrollments with this filter. Visit the marketplace to explore new content!\') : \'You have no enrollments with this filter. Visit the marketplace to explore new content!\'}</p>', '<p data-i18n="profile.noEnrollmentsDesc" style="color: #64748b; margin: 0; max-width: 400px; margin: 0 auto;">You have no enrollments with this filter. Visit the marketplace to explore new content!</p>');
if (!prfjs.includes('if (window.applyTranslations) window.applyTranslations(container);')) {
    prfjs = prfjs.replace('container.innerHTML = `\n                <i class="fas fa-box-open"', 'container.innerHTML = `\n                <i class="fas fa-box-open"');
    prfjs = prfjs.replace('            return;\n        }\n\n        container.innerHTML =', '            if (window.applyTranslations) window.applyTranslations(container);\n            return;\n        }\n\n        container.innerHTML =');
}
fs.writeFileSync('public/profile.js', prfjs);

// 3. Fix students.html script tag
let st = fs.readFileSync('public/students.html', 'utf8');
if (!st.includes('<script src="i18n.js"></script>')) {
    st = st.replace('<script src="global_notifications.js"></script>', '<script src="i18n.js"></script>\n    <script src="global_notifications.js"></script>');
    fs.writeFileSync('public/students.html', st);
}

// 4. Update course_builder.html script tag and attributes
let cb = fs.readFileSync('public/course_builder.html', 'utf8');
if (!cb.includes('<script src="i18n.js"></script>')) {
    cb = cb.replace('</body>', '    <script src="i18n.js"></script>\n</body>');
}
// Inject data-i18n into course_builder.html
const replacements = [
    { target: 'Course Management Dashboard', key: 'courseBuilder.dashboard' },
    { target: '>New Course<', key: 'courseBuilder.newCourse', isTag: true },
    { target: 'View Content', key: 'courseBuilder.viewContent' },
    { target: 'Back to Profile', key: 'courseBuilder.backToProfile' },
    { target: 'Basic Information', key: 'courseBuilder.basicInfo' },
    { target: 'Define the title, description and course details.', key: 'courseBuilder.basicInfoDesc' },
    { target: '>Course Title<', key: 'courseBuilder.courseTitle', isTag: true },
    { target: '>Short Description<', key: 'courseBuilder.shortDesc', isTag: true },
    { target: '>Linked Channel<', key: 'courseBuilder.linkedChannel', isTag: true },
    { target: '>None (Standalone Course)<', key: 'courseBuilder.noneChannel', isTag: true },
    { target: 'Only channels created by you will appear here.', key: 'courseBuilder.channelHint' },
    { target: 'Co-Editors & Instructors', key: 'courseBuilder.coEditors' },
    { target: 'Assign other users to help you edit this course and its landing page.', key: 'courseBuilder.coEditorsDesc' },
    { target: 'Invite Students', key: 'courseBuilder.inviteStudents' },
    { target: 'Manually enroll users directly into this course.', key: 'courseBuilder.inviteStudentsDesc' },
    { target: 'Course Cover', key: 'courseBuilder.courseCover' },
    { target: 'Upload an image. If left blank, it will use the Landing Page cover.', key: 'courseBuilder.courseCoverDesc' },
    { target: '(Cover not selected)', key: 'courseBuilder.coverNotSelected' },
    { target: '>Save Changes<', key: 'courseBuilder.saveChanges', isTag: true },
    { target: '>Publish Course<', key: 'courseBuilder.publishCourse', isTag: true },
    { target: 'How does it work?', key: 'courseBuilder.howItWorks' },
    { target: '1. Define the basic information.', key: 'courseBuilder.step1' },
    { target: '2. Create your Landing Page. When published, it will be the showcase of this course', key: 'courseBuilder.step2' },
    { target: '3. Create the Modules (Classes/Videos).', key: 'courseBuilder.step3' },
    { target: '4. When everything is ready, publish the Course so it appears in the Marketplace and students can enroll', key: 'courseBuilder.step4' },
    { target: '>Course Modules<', key: 'courseBuilder.courseModules', isTag: true },
    { target: 'modules created', key: 'courseBuilder.modulesCreated' },
    { target: '+ Create Module', key: 'courseBuilder.createModule' },
    { target: 'Back to Course', key: 'courseBuilder.backToCourse' },
    { target: '>Edit Module<', key: 'courseBuilder.editModule', isTag: true },
    { target: '>General<', key: 'courseBuilder.tabGeneral', isTag: true },
    { target: '>Videos<', key: 'courseBuilder.tabVideos', isTag: true },
    { target: '>Documents<', key: 'courseBuilder.tabDocs', isTag: true },
    { target: '>Quiz & AI<', key: 'courseBuilder.tabQuiz', isTag: true },
    { target: '>Cover<', key: 'courseBuilder.tabCover', isTag: true },
    { target: '>Module Title<', key: 'courseBuilder.moduleTitle', isTag: true },
    { target: '>Description<', key: 'courseBuilder.description', isTag: true },
    { target: '>Status<', key: 'courseBuilder.status', isTag: true },
    { target: '>Draft<', key: 'courseBuilder.draft', isTag: true },
    { target: '>Published<', key: 'courseBuilder.published', isTag: true }
];

for (const r of replacements) {
    if (r.isTag) {
        let text = r.target.substring(1, r.target.length - 1);
        cb = cb.replace(r.target, ` data-i18n="${r.key}">${text}<`);
    } else {
        cb = cb.replace('>' + r.target + '<', ` data-i18n="${r.key}">${r.target}<`);
    }
}
cb = cb.replace('placeholder="Ex: Information Security Course"', 'data-i18n-placeholder="courseBuilder.titlePlaceholder" placeholder="Ex: Information Security Course"');
cb = cb.replace('placeholder="Summary of what students will learn in this course..."', 'data-i18n-placeholder="courseBuilder.descPlaceholder" placeholder="Summary of what students will learn in this course..."');
cb = cb.replace('placeholder="Search user by name or email..."', 'data-i18n-placeholder="courseBuilder.searchUser" placeholder="Search user by name or email..."');
cb = cb.replace('placeholder="Search user by name or email..."', 'data-i18n-placeholder="courseBuilder.searchUser" placeholder="Search user by name or email..."');

fs.writeFileSync('public/course_builder.html', cb);

console.log('Done fixing HTML and JS');
