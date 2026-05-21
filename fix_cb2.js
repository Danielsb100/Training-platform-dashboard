const fs = require('fs');
let content = fs.readFileSync('public/course_builder.html', 'utf8');

const replacements = {
    '<h1 style="margin: 0; color: #1e293b; font-size: 2rem;">Course Modules</h1>': '<h1 style="margin: 0; color: #1e293b; font-size: 2rem;" data-i18n="courseBuilder.courseModules">Course Modules</h1>',
    'modules created</p>': 'modules created</p>', // need to wrap "modules created" but it's part of <p> so I'll handle it below
    '>+ Create Module<': '> <span data-i18n="courseBuilder.createModuleBtn">+ Create Module</span> <',
    '>Back to Course<': '> <span data-i18n="courseBuilder.backToCourse">Back to Course</span> <',
    '>New Module<': '> <span data-i18n="courseBuilder.newModule">New Module</span> <',
    '>No description<': '> <span data-i18n="courseBuilder.noDescription">No description</span> <',
    '>Create New Module<': '> <span data-i18n="courseBuilder.createNewModule">Create New Module</span> <',
    '>General<': '> <span data-i18n="courseBuilder.general">General</span> <',
    '>Videos<': '> <span data-i18n="courseBuilder.videos">Videos</span> <',
    '>Documents<': '> <span data-i18n="courseBuilder.documents">Documents</span> <',
    '>Quiz & AI<': '> <span data-i18n="courseBuilder.quizAi">Quiz & AI</span> <',
    '>Cover<': '> <span data-i18n="courseBuilder.cover">Cover</span> <',
    '>Module Title<': '> <span data-i18n="courseBuilder.moduleTitle">Module Title</span> <',
    'placeholder="Description of what will be covered..."': 'data-i18n-placeholder="courseBuilder.descriptionOfCovered" placeholder="Description of what will be covered..."',
    '>Status<': '> <span data-i18n="courseBuilder.status">Status</span> <',
    '>Draft<': '> <span data-i18n="courseBuilder.draft">Draft</span> <'
};

for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
}

// Special case for "modules created"
content = content.replace(/<span id="modules-count-header">0<\/span> modules created/, '<span id="modules-count-header">0</span> <span data-i18n="courseBuilder.modulesCreated">modules created</span>');

fs.writeFileSync('public/course_builder.html', content);

// Also modify module_manager.js for dynamic stuff
let modJs = fs.readFileSync('public/module_manager.js', 'utf8');
modJs = modJs.split("'Create New Module'").join("window.t ? window.t('courseBuilder.createNewModule', 'Create New Module') : 'Create New Module'");
modJs = modJs.split("'Edit Module'").join("window.t ? window.t('courseBuilder.editModule', 'Edit Module') : 'Edit Module'");
modJs = modJs.split("'No description'").join("window.t ? window.t('courseBuilder.noDescription', 'No description') : 'No description'");
modJs = modJs.split("MODULE ${index + 1}").join("${window.t ? window.t('courseBuilder.module', 'MODULE') : 'MODULE'} ${index + 1}");

fs.writeFileSync('public/module_manager.js', modJs);

console.log('Fixed course_builder.html and module_manager.js');
