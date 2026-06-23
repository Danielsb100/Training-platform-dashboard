const prisma = require('../config/db');
const { notifyModulePublished } = require('../services/notificationService');
const env = require('../config/env');
const { createLocalAssetStorage } = require('../services/assetStorage');
const assetStorage = createLocalAssetStorage({ rootDir: env.upload.storageDir });

/**
 * Helper to format module based on target (Edit vs Runtime)
 */
const formatModuleData = (module, format = 'runtime', userRole = 'USER', userId = null) => {
    const isOwner = userId === module.ownerMasterId;

    // Build video progress lookup from included data
    const videoProgressMap = new Map();
    if (module.videos) {
        for (const v of module.videos) {
            if (v.progress && v.progress.length > 0) {
                const userProgress = v.progress.find(p => p.userId === userId);
                if (userProgress) {
                    videoProgressMap.set(v.id, { completed: userProgress.completed, progress: userProgress.progress });
                }
            }
        }
    }

    // Build quiz submission lookup from included data
    const quizSubmissionMap = new Map();
    if (module.quizzes) {
        for (const qz of module.quizzes) {
            if (qz.submissions && qz.submissions.length > 0) {
                const userSubs = qz.submissions.filter(s => s.userId === userId);
                if (userSubs.length > 0) {
                    const bestScore = Math.max(...userSubs.map(s => s.score));
                    quizSubmissionMap.set(qz.id, { submitted: true, attemptCount: userSubs.length, bestScore });
                }
            }
        }
    }
    
    // Base data
    const formatted = {
        id: module.id,
        title: module.title,
        description: module.description,
        coverImage: module.coverImage,
        titleFont: module.titleFont,
        textColor: module.textColor,
        simulationHtml: module.simulationHtml || null,
        status: module.status,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
        videos: (module.videos || []).map(v => {
            const prog = videoProgressMap.get(v.id);
            return {
                id: v.id,
                title: v.title,
                url: v.url,
                order: v.order,
                languageSessionId: v.languageSessionId || null,
                viewed: prog ? prog.completed : false,
                progress: prog ? prog.progress : 0
            };
        }).sort((a, b) => a.order - b.order),
        documents: (module.documents || []).map(d => ({
            id: d.id,
            title: d.title,
            order: d.order,
            documentId: d.documentId,
            type: d.document ? d.document.type : 'application/octet-stream',
            languageSessionId: d.languageSessionId || null,
            isMandatory: Boolean(d.isMandatory)
        })).sort((a, b) => a.order - b.order),
        quizzes: (module.quizzes || []).map(qz => {
            const sub = quizSubmissionMap.get(qz.id);
            return {
                id: qz.id,
                title: qz.title,
                order: qz.order,
                type: qz.type || 'FINAL_EVALUATION',
                languageSessionId: qz.languageSessionId || null,
                submitted: sub ? sub.submitted : false,
                attemptCount: sub ? sub.attemptCount : 0,
                bestScore: sub ? sub.bestScore : null,
                questions: (qz.questions || []).map(q => ({
                    id: q.id,
                    text: q.text,
                    order: q.order,
                    options: (q.options || []).map(o => ({
                        id: o.id,
                        text: o.text,
                        ...(format === 'edit' && (userRole === 'MASTER' || userRole === 'ADMIN') ? { isCorrect: o.isCorrect } : {})
                    }))
                })).sort((a, b) => a.order - b.order)
            };
        }).sort((a, b) => a.order - b.order),
        languageSessions: (module.languageSessions || []).map(ls => ({
            id: ls.id,
            locale: ls.locale,
            isDefault: ls.isDefault,
            _count: ls._count || {}
        }))
    };
    console.log(`[DEBUG] Formatted module ${module.id}: v=${formatted.videos.length}, d=${formatted.documents.length}, q=${formatted.quizzes.length}`);

    if (format === 'edit') {
        formatted.ownerMasterId = module.ownerMasterId;
    }

    return formatted;
};

// --- Authorization Helper ---

async function assertModuleAccess(moduleId, user, tx = prisma) {
    const roles = new Set([
        ...(user?.roles || []),
        user?.primaryRole,
        user?.legacyRole,
        user?.role
    ].filter(Boolean));
    
    const module = await tx.trainingModule.findUnique({
        where: { id: moduleId },
        include: {
            courseModules: {
                include: {
                    course: {
                        include: { editors: true }
                    }
                }
            }
        }
    });
    
    if (!module) {
        const err = new Error('Module not found');
        err.statusCode = 404;
        throw err;
    }
    
    if (String(module.ownerMasterId) === String(user.id)) return module;
    if (roles.has('ADMIN') || roles.has('SUPER_ADMIN')) return module;
    
    const isCourseEditor = module.courseModules && module.courseModules.some(cm => 
        cm.course && (
            String(cm.course.ownerMasterId) === String(user.id) ||
            (cm.course.editors && cm.course.editors.some(e => String(e.userId) === String(user.id)))
        )
    );
    
    if (isCourseEditor) return module;
    
    const err = new Error('Unauthorized');
    err.statusCode = 403;
    throw err;
}

// --- Module CRUD ---

const createModule = async (req, res) => {
    try {
        const { title, description, coverImage, titleFont, textColor } = req.body || {};
        const normalizedTitle = typeof title === 'string' ? title.trim() : '';
        if (!normalizedTitle) {
            return res.status(400).json({ error: 'Module title is required.' });
        }

        const ownerMasterId = req.user.id;

        const newModule = await prisma.trainingModule.create({
            data: {
                title: normalizedTitle,
                description,
                coverImage,
                titleFont,
                textColor,
                ownerMasterId
            }
        });

        res.status(201).json(newModule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create module' });
    }
};

const getMyModules = async (req, res) => {
    try {
        const modules = await prisma.trainingModule.findMany({
            where: { ownerMasterId: req.user.id },
            include: {
                _count: {
                    select: { videos: true, documents: true, quizzes: true, placements: true }
                }
            }
        });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your modules' });
    }
};

const getAllPublishedModules = async (req, res) => {
    try {
        const modules = await prisma.trainingModule.findMany({
            where: { status: 'PUBLISHED' },
            select: {
                id: true,
                title: true,
                description: true,
                coverImage: true,
                titleFont: true,
                textColor: true,
                updatedAt: true
            }
        });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
};

const getModuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;
        const module = await prisma.trainingModule.findUnique({
            where: { id: parseInt(id) },
            include: {
                videos: {
                    include: {
                        progress: userId ? { where: { userId } } : false
                    }
                },
                documents: {
                    include: { document: true }
                },
                quizzes: {
                    include: {
                        questions: { include: { options: true } },
                        submissions: userId ? { where: { userId } } : false
                    }
                },
                languageSessions: {
                    include: {
                        _count: { select: { videos: true, quizzes: true, documents: true } }
                    },
                    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]
                },
                courseModules: {
                    include: {
                        course: {
                            include: {
                                editors: true
                            }
                        }
                    }
                }
            }
        });

        if (!module) return res.status(404).json({ error: 'Module not found' });
        
        const isOwner = String(module.ownerMasterId) === String(req.user.id) || req.user.role === 'ADMIN';
        const isEditor = module.courseModules.some(cm => cm.course && cm.course.editors && cm.course.editors.some(e => String(e.userId) === String(req.user.id)));
        const canViewDraft = isOwner || isEditor;

        // Logic check: Status rules
        if (module.status === 'ARCHIVED') {
            if (!canViewDraft) {
                return res.status(403).json({ error: 'Este módulo foi arquivado e não está mais disponível.' });
            }
        } else if (module.status === 'DRAFT') {
            if (!canViewDraft) {
                return res.status(403).json({ error: 'Este módulo ainda está em rascunho e não foi publicado.' });
            }
        }

        // Clean up courseModules from the payload to avoid leaking internal data or causing bloat
        delete module.courseModules;

        const format = req.query.format || 'runtime';
        const formatted = formatModuleData(module, format, req.user.role, req.user.id);
        
        // Add preview flag if it's draft and viewed by owner
        if (module.status === 'DRAFT') {
            formatted.isPreview = true;
        }

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch module' });
    }
};

const updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, coverImage, titleFont, textColor, status } = req.body || {};
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is required.' });
        }

        try {
            await assertModuleAccess(parseInt(id), req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message || 'Unauthorized' });
        }

        const updated = await prisma.trainingModule.update({
            where: { id: parseInt(id) },
            data: { title, description, coverImage, titleFont, textColor, status }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update module' });
    }
};

const patchStatus = async (req, res, status) => {
    try {
        const { id } = req.params;
        const moduleId = parseInt(id);
        
        let module;
        try {
            module = await assertModuleAccess(moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message || 'Unauthorized' });
        }

        const updated = await prisma.$transaction(async (tx) => {
            const nextModule = await tx.trainingModule.update({
                where: { id: moduleId },
                data: { status }
            });

            if (status === 'PUBLISHED' && module.status !== 'PUBLISHED') {
                await notifyModulePublished({
                    module: nextModule,
                    actorUserId: req.user.id
                }, tx);
            }

            return nextModule;
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

async function deepDeleteModule(moduleId, tx = prisma) {
    // Obter todos os documentos e vídeos para excluir arquivos físicos
    const documents = await tx.moduleDocument.findMany({ where: { moduleId }, include: { document: true } });
    const videos = await tx.moduleVideo.findMany({ where: { moduleId } });
    
    // Deletar documentos do disco
    for (const docLink of documents) {
        if (docLink.document) {
            if (docLink.document.storageProvider === 'local' && docLink.document.storageKey) {
                await assetStorage.remove(docLink.document.storageKey).catch(e => console.error(e));
            }
            await tx.document.delete({ where: { id: docLink.document.id } });
        }
    }
    
    // Deletar vídeos do disco (se foram por upload interno)
    for (const vid of videos) {
        if (vid.url && vid.url.includes('/api/documents/download/')) {
            const docIdMatch = vid.url.match(/\/api\/documents\/download\/(\d+)/);
            if (docIdMatch && docIdMatch[1]) {
                const docId = parseInt(docIdMatch[1]);
                const document = await tx.document.findUnique({ where: { id: docId } });
                if (document) {
                    if (document.storageProvider === 'local' && document.storageKey) {
                        await assetStorage.remove(document.storageKey).catch(e => console.error(e));
                    }
                    await tx.document.delete({ where: { id: docId } });
                }
            }
        }
    }

    // A exclusão do TrainingModule já irá disparar Cascade nos ModuleDocument, ModuleVideo, Quiz, etc.
    await tx.trainingModule.delete({ where: { id: moduleId } });
}

const deleteModule = async (req, res) => {
    try {
        const { id } = req.params;
        const moduleId = parseInt(id);
        
        try {
            await assertModuleAccess(moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message || 'Unauthorized' });
        }

        await deepDeleteModule(moduleId);
        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({ error: 'Failed to delete module' });
    }
};

// --- Specific Format Endpoints ---

const getEditFormat = async (req, res) => {
    req.query.format = 'edit';
    return getModuleById(req, res);
};

const getRuntimeFormat = async (req, res) => {
    req.query.format = 'runtime';
    // Potential bypass for masters to preview their own modules even if drafted
    return getModuleById(req, res);
};

// --- Assignability ---

const getMyAssignableModules = async (req, res) => {
    try {
        const modules = await prisma.trainingModule.findMany({
            where: { ownerMasterId: req.user.id },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                _count: {
                    select: { quizzes: true }
                }
            }
        });
        res.json(modules.map((module) => ({
            id: module.id,
            title: module.title,
            description: module.description,
            status: module.status,
            quizCount: module._count?.quizzes || 0
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignable modules' });
    }
};

module.exports = {
    assertModuleAccess,
    createModule,
    getMyModules,
    getAllPublishedModules,
    getModuleById,
    updateModule,
    patchStatus,
    deleteModule,
    deepDeleteModule,
    getEditFormat,
    getRuntimeFormat,
    getMyAssignableModules
};
