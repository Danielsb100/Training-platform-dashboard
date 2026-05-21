const fs = require('fs');
let content = fs.readFileSync('public/course_builder.html', 'utf8');

const replacements = {
    '<i class="fas fa-upload"></i> Change': '<i class="fas fa-upload"></i> <span data-i18n="change">Change</span>',
    '<h4>Create Modules</h4>': '<h4> <span data-i18n="courseBuilder.createModules">Create Modules</span> </h4>',
    '<p>The classes and videos of the course content.</p>': '<p> <span data-i18n="courseBuilder.createModulesDesc">The classes and videos of the course content.</span> </p>',
    '<i class="fas fa-trash"></i> Permanently Delete this Course': '<i class="fas fa-trash"></i> <span data-i18n="courseBuilder.permanentlyDelete">Permanently Delete this Course</span>'
};

for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
}

fs.writeFileSync('public/course_builder.html', content);

console.log('Fixed course_builder.html remaining strings');
