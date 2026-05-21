const fs = require('fs');
let content = fs.readFileSync('public/course_builder.html', 'utf8');

const replacements = {
    '>View Content<': '> <span data-i18n="courseBuilder.viewContent">View Content</span> <',
    '>Back to Profile<': '> <span data-i18n="courseBuilder.backToProfile">Back to Profile</span> <',
    '>Short Description<': '> <span data-i18n="courseBuilder.shortDesc">Short Description</span> <',
    'placeholder="Summary of what students will learn in this course..."': 'data-i18n-placeholder="courseBuilder.descPlaceholder" placeholder="Summary of what students will learn in this course..."',
    '>None (Standalone Course)<': '> <span data-i18n="courseBuilder.noneChannel">None (Standalone Course)</span> <',
    '>Only channels created by you will appear here.<': '> <span data-i18n="courseBuilder.channelHint">Only channels created by you will appear here.</span> <',
    '>Assign other users to help you edit this course and its landing page.<': '> <span data-i18n="courseBuilder.coEditorsDesc">Assign other users to help you edit this course and its landing page.</span> <',
    'placeholder="Search user by name or email..."': 'data-i18n-placeholder="courseBuilder.searchUser" placeholder="Search user by name or email..."',
    '>Manually enroll users directly into this course.<': '> <span data-i18n="courseBuilder.inviteStudentsDesc">Manually enroll users directly into this course.</span> <',
    '>Upload an image. If left blank, it will use the Landing Page cover.<': '> <span data-i18n="courseBuilder.courseCoverDesc">Upload an image. If left blank, it will use the Landing Page cover.</span> <',
    '>Save Changes<': ' data-i18n="courseBuilder.saveChanges">Save Changes<',
    '>Publish Course<': ' data-i18n="courseBuilder.publishCourse">Publish Course<',
    '>How does it work?<': '> <span data-i18n="courseBuilder.howItWorks">How does it work?</span> <',
    '>1. Define the basic information.<': '> <span data-i18n="courseBuilder.step1">1. Define the basic information.</span> <',
    '>2. Create your Landing Page. When published, it will be the showcase of this course.<': '> <span data-i18n="courseBuilder.step2">2. Create your Landing Page. When published, it will be the showcase of this course.</span> <',
    '>3. Create the Modules (Classes/Videos).<': '> <span data-i18n="courseBuilder.step3">3. Create the Modules (Classes/Videos).</span> <',
    '>4. When everything is ready, publish the Course so it appears in the Marketplace and students can enroll!<': '> <span data-i18n="courseBuilder.step4">4. When everything is ready, publish the Course so it appears in the Marketplace and students can enroll!</span> <',
    '>Enrolled Students<': '> <span data-i18n="courseBuilder.enrolledStudents">Enrolled Students</span> <',
    'placeholder="Filter enrolled students..."': 'data-i18n-placeholder="courseBuilder.filterStudentsPlaceholder" placeholder="Filter enrolled students..."',
    '>Construction and Layout<': '> <span data-i18n="courseBuilder.constructionLayout">Construction and Layout</span> <',
    '>What do you want to edit now?<': '> <span data-i18n="courseBuilder.whatToEdit">What do you want to edit now?</span> <',
    '>Create Landing Page<': '> <span data-i18n="courseBuilder.createLandingPage">Create Landing Page</span> <',
    ">The design of your course's sales page.<": '> <span data-i18n="courseBuilder.landingPageDesc">The design of your course\'s sales page.</span> <',
    '>Danger Zone<': '> <span data-i18n="courseBuilder.dangerZone">Danger Zone</span> <',
    '>Irreversible actions for this course.<': '> <span data-i18n="courseBuilder.irreversibleActions">Irreversible actions for this course.</span> <',
    '>Permanently Delete this Course<': ' data-i18n="courseBuilder.permanentlyDelete">Permanently Delete this Course<'
};

for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
}

fs.writeFileSync('public/course_builder.html', content);
console.log('Fixed course_builder.html strings');
