const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/http');

// Reference to the multiplayer rooms state — injected via setRoomsRef()
let roomsRef = null;

module.exports = {
    /**
     * Allow the server to inject the multiplayer rooms object so we can read online counts.
     */
    setRoomsRef(ref) {
        roomsRef = ref;
    },

    // ==========================================
    // ROOM CRUD (Professor)
    // ==========================================

    /**
     * POST /api/courses/:id/rooms
     * Create a new room for a course.
     */
    async createRoom(req, res) {
        try {
            const courseId = parseInt(req.params.id);
            const { title, description, thumbnail, maxMembers, startsAt, endsAt } = req.body;

            if (!title || !title.trim()) {
                return sendError(res, { status: 400, code: 'MISSING_TITLE', message: 'Room title is required.' });
            }

            // Verify course ownership or editor
            const course = await prisma.course.findUnique({ where: { id: courseId } });
            if (!course) {
                return sendError(res, { status: 404, code: 'COURSE_NOT_FOUND', message: 'Course not found.' });
            }

            const room = await prisma.courseRoom.create({
                data: {
                    courseId,
                    title: title.trim(),
                    description: description || null,
                    thumbnail: thumbnail || null,
                    maxMembers: maxMembers ? parseInt(maxMembers) : null,
                    startsAt: startsAt ? new Date(startsAt) : null,
                    endsAt: endsAt ? new Date(endsAt) : null,
                    isActive: true,
                },
                include: {
                    members: { include: { user: { select: { id: true, username: true, email: true, profilePicture: true } } } },
                    _count: { select: { members: true } }
                }
            });

            return sendSuccess(res, { data: room, status: 201 });
        } catch (err) {
            console.error('Error creating room:', err);
            return sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: err.message });
        }
    },

    /**
     * GET /api/courses/:id/rooms
     * List all rooms for a course (professor view).
     */
    async getRooms(req, res) {
        try {
            const courseId = parseInt(req.params.id);

            const rooms = await prisma.courseRoom.findMany({
                where: { courseId },
                include: {
                    members: {
                        include: {
                            user: { select: { id: true, username: true, email: true, profilePicture: true } }
                        }
                    },
                    _count: { select: { members: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Attach online count from socket.io state
            const enriched = rooms.map(room => {
                const socketRoomId = `course-${courseId}-room-${room.id}`;
                const onlineCount = roomsRef && roomsRef[socketRoomId]
                    ? Object.keys(roomsRef[socketRoomId].players).length
                    : 0;
                return { ...room, onlineCount };
            });

            return sendSuccess(res, { data: enriched });
        } catch (err) {
            console.error('Error listing rooms:', err);
            return sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: err.message });
        }
    },

    /**
     * GET /api/courses/:id/rooms/my
     * List rooms the current user is a member of (student view).
     * Always includes a "Global Room" entry if the course exists.
     */
    async getMyRooms(req, res) {
        try {
            const courseId = parseInt(req.params.id);
            const userId = req.user.id;

            // Verify enrollment
            const enrollment = await prisma.enrollment.findUnique({
                where: { courseId_userId: { courseId, userId } }
            });

            // Also allow course owner / editors
            const course = await prisma.course.findUnique({ where: { id: courseId } });
            if (!course) {
                return sendError(res, { status: 404, code: 'COURSE_NOT_FOUND', message: 'Course not found.' });
            }

            const isOwnerOrEditor = course.ownerMasterId === userId ||
                await prisma.courseEditor.findFirst({ where: { courseId, userId } });

            if (!enrollment && !isOwnerOrEditor) {
                return sendError(res, { status: 403, code: 'NOT_ENROLLED', message: 'You are not enrolled in this course.' });
            }

            // Get rooms where user is a member
            const userRooms = await prisma.courseRoom.findMany({
                where: {
                    courseId,
                    isActive: true,
                    members: { some: { userId } }
                },
                include: {
                    _count: { select: { members: true } }
                },
                orderBy: { createdAt: 'asc' }
            });

            // Build the global room entry
            const globalSocketRoomId = `course-${courseId}`;
            const globalOnline = roomsRef && roomsRef[globalSocketRoomId]
                ? Object.keys(roomsRef[globalSocketRoomId].players).length
                : 0;

            const globalRoom = {
                id: null,
                courseId,
                title: 'Global Room',
                description: 'Default room for all course students.',
                thumbnail: course.coverImage || null,
                isGlobal: true,
                onlineCount: globalOnline,
                _count: { members: 0 }
            };

            // Enrich user rooms with online counts
            const enrichedRooms = userRooms.map(room => {
                const socketRoomId = `course-${courseId}-room-${room.id}`;
                const onlineCount = roomsRef && roomsRef[socketRoomId]
                    ? Object.keys(roomsRef[socketRoomId].players).length
                    : 0;
                return { ...room, isGlobal: false, onlineCount };
            });

            return sendSuccess(res, { data: [globalRoom, ...enrichedRooms] });
        } catch (err) {
            console.error('Error listing user rooms:', err);
            return sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: err.message });
        }
    },

    /**
     * PUT /api/courses/:id/rooms/:roomId
     * Update a room.
     */
    async updateRoom(req, res) {
        try {
            const roomId = parseInt(req.params.roomId);
            const { title, description, thumbnail, maxMembers, startsAt, endsAt, isActive } = req.body;

            const data = {};
            if (title !== undefined) data.title = title.trim();
            if (description !== undefined) data.description = description;
            if (thumbnail !== undefined) data.thumbnail = thumbnail;
            if (maxMembers !== undefined) data.maxMembers = maxMembers ? parseInt(maxMembers) : null;
            if (startsAt !== undefined) data.startsAt = startsAt ? new Date(startsAt) : null;
            if (endsAt !== undefined) data.endsAt = endsAt ? new Date(endsAt) : null;
            if (isActive !== undefined) data.isActive = isActive;

            const room = await prisma.courseRoom.update({
                where: { id: roomId },
                data,
                include: {
                    members: {
                        include: {
                            user: { select: { id: true, username: true, email: true, profilePicture: true } }
                        }
                    },
                    _count: { select: { members: true } }
                }
            });

            return sendSuccess(res, { data: room });
        } catch (err) {
            console.error('Error updating room:', err);
            return sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: err.message });
        }
    },

    /**
     * DELETE /api/courses/:id/rooms/:roomId
     * Delete a room.
     */
    async deleteRoom(req, res) {
        try {
            const roomId = parseInt(req.params.roomId);
            await prisma.courseRoom.delete({ where: { id: roomId } });
            return sendSuccess(res, { message: 'Room deleted.' });
        } catch (err) {
            console.error('Error deleting room:', err);
            return sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: err.message });
        }
    },

    // ==========================================
    // MEMBER MANAGEMENT
    // ==========================================

    /**
     * POST /api/courses/:id/rooms/:roomId/members
     * Add one or more members to a room.
     * Body: { userIds: [1, 2, 3] }
     */
    async addMembers(req, res) {
        try {
            const roomId = parseInt(req.params.roomId);
            const { userIds } = req.body;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return sendError(res, { status: 400, code: 'MISSING_USER_IDS', message: 'userIds array is required.' });
            }

            // Check member limit
            const room = await prisma.courseRoom.findUnique({
                where: { id: roomId },
                include: { _count: { select: { members: true } } }
            });

            if (!room) {
                return sendError(res, { status: 404, code: 'ROOM_NOT_FOUND', message: 'Room not found.' });
            }

            if (room.maxMembers && (room._count.members + userIds.length > room.maxMembers)) {
                return sendError(res, {
                    status: 400,
                    code: 'MEMBER_LIMIT_EXCEEDED',
                    message: `Room has a maximum of ${room.maxMembers} members. Currently ${room._count.members}, trying to add ${userIds.length}.`
                });
            }

            // Create memberships (skip duplicates)
            const results = [];
            for (const userId of userIds) {
                try {
                    const member = await prisma.courseRoomMember.create({
                        data: { courseRoomId: roomId, userId: parseInt(userId) },
                        include: {
                            user: { select: { id: true, username: true, email: true, profilePicture: true } }
                        }
                    });
                    results.push(member);
                } catch (e) {
                    // Skip unique constraint violations (user already in room)
                    if (e.code !== 'P2002') throw e;
                }
            }

            return sendSuccess(res, { data: results, status: 201 });
        } catch (err) {
            console.error('Error adding members:', err);
            return sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: err.message });
        }
    },

    /**
     * DELETE /api/courses/:id/rooms/:roomId/members/:userId
     * Remove a member from a room.
     */
    async removeMember(req, res) {
        try {
            const roomId = parseInt(req.params.roomId);
            const userId = parseInt(req.params.userId);

            await prisma.courseRoomMember.deleteMany({
                where: { courseRoomId: roomId, userId }
            });

            return sendSuccess(res, { message: 'Member removed.' });
        } catch (err) {
            console.error('Error removing member:', err);
            return sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: err.message });
        }
    },

    /**
     * GET /api/courses/:id/rooms/:roomId/members
     * List members of a room.
     */
    async getMembers(req, res) {
        try {
            const roomId = parseInt(req.params.roomId);

            const members = await prisma.courseRoomMember.findMany({
                where: { courseRoomId: roomId },
                include: {
                    user: { select: { id: true, username: true, email: true, profilePicture: true } }
                },
                orderBy: { createdAt: 'asc' }
            });

            return sendSuccess(res, { data: members });
        } catch (err) {
            console.error('Error listing members:', err);
            return sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: err.message });
        }
    },

    /**
     * GET /api/courses/:id/rooms/:roomId/online-count
     * Get the current number of online players in a room's socket.io room.
     */
    async getOnlineCount(req, res) {
        try {
            const courseId = parseInt(req.params.id);
            const roomId = req.params.roomId;

            let socketRoomId;
            if (roomId === 'global') {
                socketRoomId = `course-${courseId}`;
            } else {
                socketRoomId = `course-${courseId}-room-${roomId}`;
            }

            const count = roomsRef && roomsRef[socketRoomId]
                ? Object.keys(roomsRef[socketRoomId].players).length
                : 0;

            return sendSuccess(res, { data: { roomId: socketRoomId, onlineCount: count } });
        } catch (err) {
            console.error('Error getting online count:', err);
            return sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: err.message });
        }
    },

    /**
     * POST /api/courses/:id/rooms/:roomId/thumbnail
     * Upload a thumbnail image for a room.
     */
    async uploadThumbnail(req, res) {
        try {
            const roomId = parseInt(req.params.roomId);

            if (!req.file) {
                return sendError(res, { status: 400, code: 'NO_FILE', message: 'No image file provided.' });
            }

            // Convert to base64 data URL (same pattern as course thumbnail uploads)
            const mimeType = req.file.mimetype;
            const base64 = req.file.buffer.toString('base64');
            const dataUrl = `data:${mimeType};base64,${base64}`;

            const room = await prisma.courseRoom.update({
                where: { id: roomId },
                data: { thumbnail: dataUrl }
            });

            // Clean up temp file if written to disk
            const fs = require('fs');
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return sendSuccess(res, { data: { thumbnail: dataUrl } });
        } catch (err) {
            console.error('Error uploading thumbnail:', err);
            return sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: err.message });
        }
    }
};
