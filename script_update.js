const fs = require('fs');
const path = 'd:/GitHub/Training-platform-dashboard/controllers/contentController.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('assertModuleAccess')) {
    content = content.replace(
        "const { scheduleKnowledgeBaseRefresh } = require('../services/aiKnowledgeSyncService');",
        "const { scheduleKnowledgeBaseRefresh } = require('../services/aiKnowledgeSyncService');\nconst { assertModuleAccess } = require('./moduleController');"
    );
}

// Replace isModuleManager logic
const replacements = [
    {
        from: /if \(!isModuleManager\(req\.user, module\)\) \{\s*return res\.status\(403\)\.json\(\{ error: 'Unauthorized' \}\);\s*\}/g,
        to: `try {
            await assertModuleAccess(parseInt(id), req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message || 'Unauthorized' });
        }`
    },
    {
        from: /if \(!isModuleManager\(req\.user, video\.module\)\) \{\s*return res\.status\(403\)\.json\(\{ error: 'Unauthorized' \}\);\s*\}/g,
        to: `try {
            await assertModuleAccess(video.moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message || 'Unauthorized' });
        }`
    },
    {
        from: /if \(!isModuleManager\(req\.user, quiz\.module\)\) \{\s*return res\.status\(403\)\.json\(\{ error: 'Unauthorized' \}\);\s*\}/g,
        to: `try {
            await assertModuleAccess(quiz.moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message || 'Unauthorized' });
        }`
    },
    {
        from: /if \(!isModuleManager\(req\.user, question\.quiz\.module\)\) \{\s*return res\.status\(403\)\.json\(\{ error: 'Unauthorized' \}\);\s*\}/g,
        to: `try {
            await assertModuleAccess(question.quiz.moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message || 'Unauthorized' });
        }`
    },
    {
        from: /if \(video\.module\.ownerMasterId !== req\.user\.id && req\.user\.role !== 'ADMIN'\) \{\s*return res\.status\(403\)\.json\(\{ error: 'Unauthorized' \}\);\s*\}/g,
        to: `try {
            await assertModuleAccess(video.moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message || 'Unauthorized' });
        }`
    },
    {
        from: /if \(modDoc\.module\.ownerMasterId !== req\.user\.id && req\.user\.role !== 'ADMIN'\) \{\s*return res\.status\(403\)\.json\(\{ error: 'Unauthorized' \}\);\s*\}/g,
        to: `try {
            await assertModuleAccess(modDoc.moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message || 'Unauthorized' });
        }`
    }
];

replacements.forEach(rep => {
    content = content.replace(rep.from, rep.to);
});

// For createAiGeneratedQuiz which uses module but the regex above matches it to 'id' but we want moduleId
content = content.replace(/try \{\s*await assertModuleAccess\(parseInt\(id\), req\.user\);\s*\} catch \(authErr\) \{\s*return res\.status\(authErr\.statusCode \|\| 403\)\.json\(\{ error: authErr\.message \|\| 'Unauthorized' \}\);\s*\}([\s\S]*?)const videoAssetIds/g, `try {
            await assertModuleAccess(moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message || 'Unauthorized' });
        }$1const videoAssetIds`);


// Remove getEffectiveUserRoles and isModuleManager
content = content.replace(/const getEffectiveUserRoles[\s\S]*?const isModuleManager = \([\s\S]*?\};\n/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Script updated successfully!');
