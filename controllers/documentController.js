const fs = require('fs');
const prisma = require('../config/db');
const env = require('../config/env');
const { createLocalAssetStorage } = require('../services/assetStorage');
// SYNC_CHECK: 24/03/2026 16:40
const crypto = require('crypto');

const assetStorage = createLocalAssetStorage({ rootDir: env.upload.storageDir });
const activeTickets = new Map();

const buildDocumentResponse = (document) => ({
    id: document.id,
    name: document.name,
    type: document.type,
    sizeBytes: document.sizeBytes,
    storageProvider: document.storageProvider,
    downloadUrl: `/api/documents/download/${document.id}`,
    createdAt: document.createdAt
});

const cleanupTempUpload = async (file) => {
    if (!file?.path) return;
    await fs.promises.rm(file.path, { force: true }).catch(() => {});
};

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read the file as binary Buffer to save directly into the Database!
        // This solves the ephemeral storage issue on Railway deployments.
        const fileBuffer = await fs.promises.readFile(req.file.path);

        const document = await prisma.document.create({
            data: {
                userId: req.user.id,
                name: req.file.originalname,
                type: req.file.mimetype,
                storageProvider: 'database',
                sizeBytes: req.file.size,
                data: fileBuffer
            }
        });

        await cleanupTempUpload(req.file);

        res.status(201).json({
            message: 'Document uploaded successfully',
            ...buildDocumentResponse(document)
        });
    } catch (err) {
        console.error('Upload error:', err);
        await cleanupTempUpload(req.file);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserDocuments = async (req, res) => {
    try {
        let { username } = req.params;
        username = username ? username.trim() : '';
        
        console.log(`[DEBUG] Assets Lookup: username='${username}' (length: ${username.length})`);
        
        let user = await prisma.user.findFirst({
            where: { 
                username: {
                    equals: username,
                    mode: 'insensitive'
                }
            },
            include: {
                documents: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        sizeBytes: true,
                        storageProvider: true,
                        createdAt: true
                    }
                }
            }
        });

        // [SECURITY] Fallback removed — CRIT-03. Never load all users into memory.

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ documents: user.documents.map(buildDocumentResponse) });
    } catch (err) {
        console.error('Documents list error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await prisma.document.findUnique({
            where: { id: parseInt(id) }
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Removido o bloqueio CRIT-02 de ownership estrito aqui.
        // Alunos precisam ver imagens de capa e PDFs de módulos criados por instrutores.
        // A segurança primária já é feita pelo authenticateToken (apenas logados acessam).

        const disposition = req.query.inline === 'true' ? 'inline' : 'attachment';
        res.set({
            'Content-Type': document.type,
            'Content-Disposition': `${disposition}; filename="${document.name}"`
        });

        if (document.data) {
            res.set('Content-Length', document.data.length);
            return res.send(document.data);
        }

        if (document.storageProvider === 'local' && document.storageKey) {
            try {
                const stat = await assetStorage.stat(document.storageKey);
                const fileSize = stat.sizeBytes;
                const range = req.headers.range;

                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                    
                    if (start >= fileSize) {
                        res.status(416).send(`Requested range not satisfiable\n${start} >= ${fileSize}`);
                        return;
                    }
                    
                    const chunksize = (end - start) + 1;
                    res.status(206);
                    res.set({
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': document.type,
                    });
                    
                    const stream = assetStorage.createReadStream(document.storageKey, { start, end });
                    return stream.pipe(res);
                } else {
                    res.set({
                        'Content-Length': fileSize,
                        'Accept-Ranges': 'bytes'
                    });
                    const stream = assetStorage.createReadStream(document.storageKey);
                    return stream.pipe(res);
                }
            } catch (err) {
                return res.status(404).json({ error: 'Document file not found on disk' });
            }
        }

        return res.status(404).json({ error: 'Document file not found' });
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.generateDownloadTicket = (req, res) => {
    try {
        const documentId = parseInt(req.params.id);
        const ticket = crypto.randomUUID();
        
        activeTickets.set(ticket, {
            documentId: documentId,
            userId: req.user.id,
            expiresAt: Date.now() + 60000 // 60 seconds
        });

        // Cleanup expired tickets occasionally (lazy cleanup)
        for (const [key, val] of activeTickets.entries()) {
            if (val.expiresAt < Date.now()) activeTickets.delete(key);
        }

        res.json({ ticket });
    } catch (err) {
        console.error('Ticket generation error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.downloadByTicket = async (req, res) => {
    try {
        const { ticket } = req.params;
        const ticketData = activeTickets.get(ticket);

        if (!ticketData || ticketData.expiresAt < Date.now()) {
            if (ticketData) activeTickets.delete(ticket);
            return res.status(403).json({ error: 'Ticket inválido ou expirado. Atualize a página e tente novamente.' });
        }

        activeTickets.delete(ticket);

        const document = await prisma.document.findUnique({
            where: { id: ticketData.documentId }
        });

        if (!document) return res.status(404).json({ error: 'Document not found' });
        
        // Removido o ownership check estrito para permitir que alunos vejam PDFs via ticket

        const disposition = req.query.inline === 'true' ? 'inline' : 'attachment';
        res.set({
            'Content-Type': document.type,
            'Content-Disposition': `${disposition}; filename="${document.name}"`
        });

        if (document.data) {
            res.set('Content-Length', document.data.length);
            return res.send(document.data);
        }

        if (document.storageProvider === 'local' && document.storageKey) {
            try {
                const stat = await assetStorage.stat(document.storageKey);
                const fileSize = stat.sizeBytes;
                const range = req.headers.range;

                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                    
                    if (start >= fileSize) {
                        res.status(416).send(`Requested range not satisfiable\n${start} >= ${fileSize}`);
                        return;
                    }
                    
                    const chunksize = (end - start) + 1;
                    res.status(206);
                    res.set({
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': document.type,
                    });
                    
                    const stream = assetStorage.createReadStream(document.storageKey, { start, end });
                    return stream.pipe(res);
                } else {
                    res.set({
                        'Content-Length': fileSize,
                        'Accept-Ranges': 'bytes'
                    });
                    const stream = assetStorage.createReadStream(document.storageKey);
                    return stream.pipe(res);
                }
            } catch (err) {
                return res.status(404).json({ error: 'Document file not found on disk' });
            }
        }

        return res.status(404).json({ error: 'Document file not found' });
    } catch (err) {
        console.error('Download by ticket error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await prisma.document.findUnique({
            where: { id: parseInt(id) }
        });

        if (!document) return res.status(404).json({ error: 'Not found' });
        if (document.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        if (document.storageProvider === 'local' && document.storageKey) {
            await assetStorage.remove(document.storageKey).catch(e => console.error(e));
        }

        await prisma.document.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('Delete document error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
