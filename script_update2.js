const fs = require('fs');
const path = 'd:/GitHub/Training-platform-dashboard/controllers/courseController.js';
let content = fs.readFileSync(path, 'utf8');

// Function names to look for
const functionsToFix = [
    'deleteCourse',
    'addModuleToCourse',
    'removeModuleFromCourse',
    'reorderCourseModules',
    'enrollUser'
];

content = content.replace(/const course = await prisma\.course\.findUnique\(\{\s*where: \{\s*id: courseId\s*\}\s*\}\);/g, "const course = await prisma.course.findUnique({ where: { id: courseId }, include: { editors: true } });");

content = content.replace(/const course = await prisma\.course\.findUnique\(\{\s*where: \{\s*id: courseId\s*\},?\s*include: \{\s*courseModules: true\s*\}\s*\}\);/g, "const course = await prisma.course.findUnique({ where: { id: courseId }, include: { courseModules: true, editors: true } });");

fs.writeFileSync(path, content, 'utf8');
console.log('courseController updated successfully!');
