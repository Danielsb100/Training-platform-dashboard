const prisma = require('../config/db');

exports.createChannel = async (req, res) => {
    try {
        const { name, description, thumb } = req.body;
        const channel = await prisma.channel.create({
            data: {
                name,
                description,
                thumb,
                ownerMasterId: req.user.id,
                status: 'PUBLISHED'
            }
        });
        res.status(201).json({ message: 'Canal criado com sucesso', data: channel });
    } catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({ error: 'Falha ao criar canal' });
    }
};

exports.getMyChannels = async (req, res) => {
    try {
        const channels = await prisma.channel.findMany({
            where: { ownerMasterId: req.user.id },
            include: { courses: { include: { course: true } } },
            orderBy: { createdAt: 'desc' }
        });
        // Formatar para manter compatibilidade com o frontend antigo onde channels[].courses é um array de IDs ou objetos
        const formatted = channels.map(c => ({
            ...c,
            courses: c.courses.map(cc => cc.courseId)
        }));
        res.json({ data: formatted });
    } catch (error) {
        console.error('Error fetching my channels:', error);
        res.status(500).json({ error: 'Falha ao buscar canais' });
    }
};

exports.getPublicChannels = async (req, res) => {
    try {
        const channels = await prisma.channel.findMany({
            where: { status: 'PUBLISHED' },
            include: { courses: { include: { course: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const formatted = channels.map(c => ({
            ...c,
            courses: c.courses.map(cc => cc.courseId)
        }));
        res.json({ data: formatted });
    } catch (error) {
        console.error('Error fetching public channels:', error);
        res.status(500).json({ error: 'Falha ao buscar canais' });
    }
};

exports.getChannelDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const channel = await prisma.channel.findUnique({
            where: { id },
            include: { courses: { include: { course: true } } }
        });
        if (!channel) return res.status(404).json({ error: 'Canal não encontrado' });
        
        // Mapear para o frontend
        const result = {
            ...channel,
            courses: channel.courses.map(cc => cc.courseId)
        };
        res.json({ data: result });
    } catch (error) {
        console.error('Error fetching channel details:', error);
        res.status(500).json({ error: 'Falha ao buscar detalhes do canal' });
    }
};

exports.updateChannel = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, thumb, modular_content, compiled_content, status } = req.body;
        
        // Verificar permissão
        const channel = await prisma.channel.findUnique({ where: { id } });
        if (!channel) return res.status(404).json({ error: 'Canal não encontrado' });
        if (channel.ownerMasterId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (thumb !== undefined) updateData.thumb = thumb;
        if (modular_content !== undefined) updateData.modular_content = modular_content;
        if (compiled_content !== undefined) updateData.compiled_content = compiled_content;
        if (status !== undefined) updateData.status = status;

        const updated = await prisma.channel.update({
            where: { id },
            data: updateData
        });
        
        res.json({ message: 'Canal atualizado com sucesso', data: updated });
    } catch (error) {
        console.error('Error updating channel:', error);
        res.status(500).json({ error: 'Falha ao atualizar canal' });
    }
};

exports.deleteChannel = async (req, res) => {
    try {
        const { id } = req.params;
        const channel = await prisma.channel.findUnique({ where: { id } });
        if (!channel) return res.status(404).json({ error: 'Canal não encontrado' });
        if (channel.ownerMasterId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await prisma.channel.delete({ where: { id } });
        res.json({ message: 'Canal removido com sucesso' });
    } catch (error) {
        console.error('Error deleting channel:', error);
        res.status(500).json({ error: 'Falha ao remover canal' });
    }
};

exports.addCourseToChannel = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseId } = req.body;
        if (!courseId) return res.status(400).json({ error: 'CourseId é necessário' });

        const channel = await prisma.channel.findUnique({ where: { id } });
        if (!channel) return res.status(404).json({ error: 'Canal não encontrado' });
        if (channel.ownerMasterId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await prisma.channelCourse.create({
            data: { channelId: id, courseId: parseInt(courseId) }
        });
        
        res.json({ message: 'Curso adicionado ao canal com sucesso' });
    } catch (error) {
        console.error('Error adding course to channel:', error);
        if (error.code === 'P2002') return res.status(400).json({ error: 'Curso já está no canal' });
        res.status(500).json({ error: 'Falha ao adicionar curso' });
    }
};

exports.removeCourseFromChannel = async (req, res) => {
    try {
        const { id, courseId } = req.params;

        const channel = await prisma.channel.findUnique({ where: { id } });
        if (!channel) return res.status(404).json({ error: 'Canal não encontrado' });
        if (channel.ownerMasterId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await prisma.channelCourse.deleteMany({
            where: { channelId: id, courseId: parseInt(courseId) }
        });
        
        res.json({ message: 'Curso removido do canal com sucesso' });
    } catch (error) {
        console.error('Error removing course from channel:', error);
        res.status(500).json({ error: 'Falha ao remover curso' });
    }
};
