const prisma = require('../config/db');
const { assertModuleAccess } = require('./moduleController');

// --- Language Session CRUD ---

const createSession = async (req, res) => {
    try {
        const moduleId = parseInt(req.params.id);
        const { locale } = req.body;

        if (!locale || typeof locale !== 'string') {
            return res.status(400).json({ error: 'locale is required (e.g. "pt-BR")' });
        }

        try {
            await assertModuleAccess(moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message });
        }

        // Check if session already exists
        const existing = await prisma.moduleLanguageSession.findUnique({
            where: { moduleId_locale: { moduleId, locale: locale.trim() } }
        });
        if (existing) {
            return res.status(409).json({ error: 'Language session already exists for this locale.' });
        }

        // Check if any session exists; if not, this is the first additional session
        const sessionCount = await prisma.moduleLanguageSession.count({ where: { moduleId } });

        const session = await prisma.moduleLanguageSession.create({
            data: {
                moduleId,
                locale: locale.trim(),
                isDefault: false
            }
        });

        res.status(201).json(session);
    } catch (error) {
        console.error('Error creating language session:', error);
        res.status(500).json({ error: 'Failed to create language session' });
    }
};

const getSessions = async (req, res) => {
    try {
        const moduleId = parseInt(req.params.id);
        const sessions = await prisma.moduleLanguageSession.findMany({
            where: { moduleId },
            include: {
                _count: { select: { videos: true, quizzes: true, documents: true } }
            },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch language sessions' });
    }
};

const deleteSession = async (req, res) => {
    try {
        const moduleId = parseInt(req.params.id);
        const sessionId = parseInt(req.params.sessionId);

        try {
            await assertModuleAccess(moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message });
        }

        const session = await prisma.moduleLanguageSession.findUnique({
            where: { id: sessionId },
            include: { videos: true, quizzes: true }
        });

        if (!session || session.moduleId !== moduleId) {
            return res.status(404).json({ error: 'Language session not found' });
        }

        // Documents belonging to this session will have languageSessionId set to null (onDelete: SetNull)
        // which moves them back to the base session. Videos and quizzes are explicitly deleted.
        await prisma.$transaction(async (tx) => {
            // Delete videos belonging to this session
            for (const video of session.videos) {
                await tx.moduleVideo.delete({ where: { id: video.id } });
            }

            // Delete quizzes belonging to this session
            for (const quiz of session.quizzes) {
                await tx.quiz.delete({ where: { id: quiz.id } });
            }

            // Delete the session itself
            await tx.moduleLanguageSession.delete({ where: { id: sessionId } });

            // If deleted session was default, promote another
            if (session.isDefault) {
                const nextSession = await tx.moduleLanguageSession.findFirst({
                    where: { moduleId },
                    orderBy: { createdAt: 'asc' }
                });
                if (nextSession) {
                    await tx.moduleLanguageSession.update({
                        where: { id: nextSession.id },
                        data: { isDefault: true }
                    });
                }
            }
        });

        res.json({ message: 'Language session deleted' });
    } catch (error) {
        console.error('Error deleting language session:', error);
        res.status(500).json({ error: 'Failed to delete language session' });
    }
};

// --- Helper: get source videos and quizzes (works for both session-based and base content) ---
async function getSourceContent(moduleId, sourceSessionId) {
    if (sourceSessionId === null || sourceSessionId === undefined || isNaN(sourceSessionId)) {
        // Base content (no languageSessionId)
        const videos = await prisma.moduleVideo.findMany({
            where: { moduleId, languageSessionId: null },
            orderBy: { order: 'asc' }
        });
        const quizzes = await prisma.quiz.findMany({
            where: { moduleId, languageSessionId: null },
            include: { questions: { include: { options: true }, orderBy: { order: 'asc' } } },
            orderBy: { order: 'asc' }
        });
        const documents = await prisma.moduleDocument.findMany({
            where: { moduleId, languageSessionId: null },
            orderBy: { order: 'asc' }
        });
        return { videos, quizzes, documents, locale: 'en-US' };
    } else {
        const session = await prisma.moduleLanguageSession.findUnique({
            where: { id: sourceSessionId },
            include: {
                videos: { orderBy: { order: 'asc' } },
                quizzes: { include: { questions: { include: { options: true }, orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
                documents: { orderBy: { order: 'asc' } }
            }
        });
        if (!session) return null;
        return { videos: session.videos, quizzes: session.quizzes, documents: session.documents, locale: session.locale, moduleId: session.moduleId };
    }
}

// Note: Quizzes are duplicated/copied as-is (no auto-translation).
// Users can translate individual quizzes manually via the "Translate Quiz" button.

// --- Helper: duplicate videos, quizzes, and documents into a target session ---
async function duplicateContentInto(tx, moduleId, targetSessionId, sourceVideos, sourceQuizzes, sourceDocuments = []) {
    // Duplicate video references (same URL, new record)
    for (const video of sourceVideos) {
        await tx.moduleVideo.create({
            data: {
                moduleId,
                languageSessionId: targetSessionId,
                title: video.title,
                url: video.url,
                order: video.order
            }
        });
    }

    // Duplicate document references (same Document ID, new ModuleDocument record)
    for (const doc of sourceDocuments) {
        await tx.moduleDocument.create({
            data: {
                moduleId,
                languageSessionId: targetSessionId,
                documentId: doc.documentId,
                title: doc.title,
                order: doc.order,
                isMandatory: doc.isMandatory
            }
        });
    }

    // Duplicate quizzes (full deep copy — same questions/options)
    for (const quiz of sourceQuizzes) {
        await tx.quiz.create({
            data: {
                moduleId,
                languageSessionId: targetSessionId,
                title: quiz.title,
                order: quiz.order,
                questions: {
                    create: (quiz.questions || []).map((q) => ({
                        text: q.text,
                        order: q.order,
                        options: {
                            create: (q.options || []).map((o) => ({
                                text: o.text,
                                isCorrect: o.isCorrect
                            }))
                        }
                    }))
                }
            }
        });
    }
}

// --- Helper: delete existing content from a session (for "replace" mode) ---
async function clearSessionContent(tx, moduleId, sessionId) {
    // Delete videos - just the record (the underlying document/URL stays)
    await tx.moduleVideo.deleteMany({
        where: { moduleId, languageSessionId: sessionId }
    });

    // Delete module document references
    await tx.moduleDocument.deleteMany({
        where: { moduleId, languageSessionId: sessionId }
    });

    // Delete quizzes (cascade will handle questions/options)
    const quizzes = await tx.quiz.findMany({
        where: { moduleId, languageSessionId: sessionId }
    });
    for (const quiz of quizzes) {
        await tx.quiz.delete({ where: { id: quiz.id } });
    }
}

// --- DUPLICATE TO: Duplicate content from ANY source (session or base) into a NEW language session ---
const duplicateTo = async (req, res) => {
    try {
        const moduleId = parseInt(req.params.id);
        const sourceSessionIdRaw = req.params.sessionId;
        const { targetLocale } = req.body;

        if (!targetLocale) {
            return res.status(400).json({ error: 'targetLocale is required' });
        }

        try {
            await assertModuleAccess(moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message });
        }

        // sourceSessionId can be 'base' (for base English content) or a numeric ID
        const isBase = sourceSessionIdRaw === 'base';
        const sourceSessionId = isBase ? null : parseInt(sourceSessionIdRaw);

        const sourceContent = await getSourceContent(moduleId, sourceSessionId);
        if (!sourceContent) {
            return res.status(404).json({ error: 'Source session not found' });
        }

        // Validate source belongs to this module (for session-based sources)
        if (!isBase && sourceContent.moduleId !== undefined && sourceContent.moduleId !== moduleId) {
            return res.status(404).json({ error: 'Source session not found for this module' });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Create target session
            const targetSession = await tx.moduleLanguageSession.create({
                data: { moduleId, locale: targetLocale.trim() }
            });

            // Duplicate videos, documents, and quizzes
            await duplicateContentInto(tx, moduleId, targetSession.id, sourceContent.videos, sourceContent.quizzes, sourceContent.documents);

            return targetSession;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error duplicating language session:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Target language session already exists' });
        }
        res.status(500).json({ error: 'Failed to duplicate language session' });
    }
};

// --- COPY FROM: Copy content from ANY source (session or base) into an EXISTING target session ---
// Supports mode: 'replace' (clear target first) or 'merge' (add alongside existing)
const copyFrom = async (req, res) => {
    try {
        const moduleId = parseInt(req.params.id);
        const targetSessionId = parseInt(req.params.sessionId);
        const sourceSessionIdRaw = req.params.sourceId;
        const mode = req.body?.mode || 'merge'; // 'replace' or 'merge'


        try {
            await assertModuleAccess(moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message });
        }

        // sourceId can be 'base' or a numeric session ID
        const isBase = sourceSessionIdRaw === 'base';
        const sourceSessionId = isBase ? null : parseInt(sourceSessionIdRaw);

        const [sourceContent, targetSession] = await Promise.all([
            getSourceContent(moduleId, sourceSessionId),
            prisma.moduleLanguageSession.findUnique({
                where: { id: targetSessionId },
                include: {
                    _count: { select: { videos: true, quizzes: true } }
                }
            })
        ]);

        if (!sourceContent) {
            return res.status(404).json({ error: 'Source session not found' });
        }
        if (!targetSession || targetSession.moduleId !== moduleId) {
            return res.status(404).json({ error: 'Target session not found' });
        }

        await prisma.$transaction(async (tx) => {
            // If replace mode, clear existing content first
            if (mode === 'replace') {
                await clearSessionContent(tx, moduleId, targetSessionId);
            }

            // Copy videos, documents, and quizzes
            await duplicateContentInto(tx, moduleId, targetSessionId, sourceContent.videos, sourceContent.quizzes, sourceContent.documents);
        });

        res.json({ message: `Content copied from source (mode: ${mode})` });
    } catch (error) {
        console.error('Error copying language session:', error);
        res.status(500).json({ error: 'Failed to copy from source session' });
    }
};

const swapLocale = async (req, res) => {
    try {
        const moduleId = parseInt(req.params.id);
        const sessionIdRaw = req.params.sessionId;
        const { targetLocale } = req.body;

        if (!targetLocale) {
            return res.status(400).json({ error: 'targetLocale is required' });
        }

        try {
            await assertModuleAccess(moduleId, req.user);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({ error: authErr.message });
        }

        // --- Handle 'base' session swap ---
        if (sessionIdRaw === 'base') {
            // The "base" tab shows content with languageSessionId = null.
            // The default session (isDefault=true) determines the FLAG shown on the base tab.
            // When swapping: just update which session is marked as default (no content moves).
            const defaultSession = await prisma.moduleLanguageSession.findFirst({
                where: { moduleId, isDefault: true }
            });

            if (defaultSession) {
                if (defaultSession.locale === targetLocale) {
                    return res.json({ message: 'Locale already matches' });
                }

                // Check if a session with the targetLocale already exists
                const existingSession = await prisma.moduleLanguageSession.findUnique({
                    where: { moduleId_locale: { moduleId, locale: targetLocale } }
                });

                await prisma.$transaction(async (tx) => {
                    if (existingSession) {
                        const tempLocale = `temp_${Date.now()}`;
                        await tx.moduleLanguageSession.update({
                            where: { id: defaultSession.id },
                            data: { locale: tempLocale }
                        });
                        await tx.moduleLanguageSession.update({
                            where: { id: existingSession.id },
                            data: { locale: defaultSession.locale }
                        });
                        await tx.moduleLanguageSession.update({
                            where: { id: defaultSession.id },
                            data: { locale: targetLocale }
                        });
                    } else {
                        await tx.moduleLanguageSession.update({
                            where: { id: defaultSession.id },
                            data: { locale: targetLocale }
                        });
                    }
                });
            } else {
                // No default session exists yet — create one with the target locale
                // Check if a session with the targetLocale already exists
                const existingSession = await prisma.moduleLanguageSession.findUnique({
                    where: { moduleId_locale: { moduleId, locale: targetLocale } }
                });
                if (existingSession) {
                    // Target locale already exists as a normal session.
                    // To swap base with it, we need to create the default session with the OLD base locale (en-US),
                    // and change the existing session to the new target locale?
                    // Wait, the existing session IS the target locale.
                    // So we change the existing session to en-US, and create default as target.
                    await prisma.$transaction(async (tx) => {
                        await tx.moduleLanguageSession.update({
                            where: { id: existingSession.id },
                            data: { locale: 'en-US' } // Fallback old base locale
                        });
                        await tx.moduleLanguageSession.create({
                            data: { moduleId, locale: targetLocale.trim(), isDefault: true }
                        });
                    });
                } else {
                    await prisma.moduleLanguageSession.create({
                        data: { moduleId, locale: targetLocale.trim(), isDefault: true }
                    });
                }
            }

            return res.json({ message: 'Base locale swapped successfully' });
        }

        // --- Normal session swap ---
        const sessionId = parseInt(sessionIdRaw);
        const currentSession = await prisma.moduleLanguageSession.findUnique({
            where: { id: sessionId }
        });

        if (!currentSession || currentSession.moduleId !== moduleId) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (currentSession.locale === targetLocale) {
            return res.json({ message: 'Locale already matches' });
        }

        // Check if a session with the targetLocale already exists for this module
        const existingSession = await prisma.moduleLanguageSession.findUnique({
            where: { moduleId_locale: { moduleId, locale: targetLocale } }
        });

        await prisma.$transaction(async (tx) => {
            if (existingSession) {
                // To avoid unique constraint violation, we use a temporary locale
                const tempLocale = `temp_${Date.now()}`;
                await tx.moduleLanguageSession.update({
                    where: { id: sessionId },
                    data: { locale: tempLocale }
                });
                await tx.moduleLanguageSession.update({
                    where: { id: existingSession.id },
                    data: { locale: currentSession.locale }
                });
                await tx.moduleLanguageSession.update({
                    where: { id: sessionId },
                    data: { locale: targetLocale }
                });
            } else {
                // Just update the locale
                await tx.moduleLanguageSession.update({
                    where: { id: sessionId },
                    data: { locale: targetLocale }
                });
            }
        });

        res.json({ message: 'Locale swapped successfully' });
    } catch (error) {
        console.error('Error swapping language session locale:', error);
        res.status(500).json({ error: 'Failed to swap language session locale' });
    }
};

module.exports = {
    createSession,
    getSessions,
    deleteSession,
    duplicateTo,
    copyFrom,
    swapLocale
};
