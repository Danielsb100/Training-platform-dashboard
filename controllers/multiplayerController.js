const fs = require('fs');
const path = require('path');

// State — organized by rooms (one room per course, or course+room combos)
const rooms = {};
const MAX_CHAT_LOGS = 50;

// Group call state — keyed by roomId, value is Map of groupCallId -> groupCallData
const activeGroupCalls = {};

// Get or create room state for a given roomId
function getOrCreateRoom(roomId) {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            players: {},
            placedCubes: [],
            placedModels: [],
            placedModulePlacements: [],
            chatHistory: []
        };
        console.log(`[Rooms] Created room: ${roomId}`);
    }
    return rooms[roomId];
}

// Get the room a socket belongs to
function getSocketRoom(socket) {
    return socket._roomId || 'lobby';
}

/**
 * Expose the rooms reference so other modules (e.g. courseRoomController)
 * can read online counts.
 */
function getRoomsRef() {
    return rooms;
}

function getCatalogItems(subDir) {
    const dirPath = path.join(__dirname, '../public/world/assets', subDir);
    if (!fs.existsSync(dirPath)) return [];
    
    const items = [];
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory() && subDir === 'characters') {
            const name = file;
            const modelPath = `world/assets/${subDir}/${name}/${name}.glb`;
            const iconPath = `world/assets/${subDir}/${name}/${name}.png`;
            const fullModelPath = path.join(__dirname, '../public', modelPath);
            const fullIconPath = path.join(__dirname, '../public', iconPath);

            if (fs.existsSync(fullModelPath)) {
                const anims = ['idle', 'walk', 'jump', 'interact'];
                const animations = {};
                anims.forEach(anim => {
                    const animPath = `world/assets/${subDir}/${name}/${anim}.glb`;
                    if (fs.existsSync(path.join(__dirname, '../public', animPath))) {
                        animations[anim] = animPath;
                    }
                });

                items.push({
                    name: name,
                    model: modelPath,
                    icon: fs.existsSync(fullIconPath) ? iconPath : 'world/assets/default.png',
                    animations: animations,
                    type: 'complex'
                });
            }
        } else if (file.endsWith('.glb')) {
            const name = file.replace('.glb', '');
            const iconRelative = `world/assets/${subDir}/${name}.png`;
            const iconFull = path.join(__dirname, '../public', iconRelative);
            items.push({
                name: name,
                model: `world/assets/${subDir}/${file}`,
                icon: fs.existsSync(iconFull) ? iconRelative : 'world/assets/default.png',
                type: 'simple'
            });
        }
    });

    return items;
}

module.exports = {
    getCatalog: (req, res) => {
        res.json({
            characters: getCatalogItems('characters'),
            models: getCatalogItems('models'),
            structures: getCatalogItems('structures')
        });
    },
    
    initSocket: (io) => {
        const tokenCache = new Map();
        const CACHE_TTL = 10 * 60 * 1000;

        io.use(async (socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication required'));

            const cached = tokenCache.get(token);
            if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
                socket.decoded = cached.data;
                return next();
            }

            try {
                // To maintain independence we should verify using the standard API or just pass for now if testing locally
                const response = await fetch(`http://localhost:${process.env.PORT || 3000}/auth/verify`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    return next(new Error('Invalid token'));
                }

                const result = await response.json();
                const user = result.user;
                tokenCache.set(token, { data: user, timestamp: Date.now() });
                socket.decoded = user;
                next();
            } catch (err) {
                console.error('Auth verification error:', err);
                next(new Error('Authentication service unreachable'));
            }
        });

        io.on('connection', (socket) => {
            console.log(`User connected to 3D World: ${socket.id}`);

            // --- Room Join ---
            // Player is NOT created until they join a room.
            // The front-end emits 'joinRoom' with:
            //   - a courseId string (backward compatible, joins course-{id})
            //   - OR an object { courseId, roomId } to join a specific room
            socket.on('joinRoom', (data) => {
                let roomId;
                if (typeof data === 'object' && data !== null && data.courseId) {
                    // New format: { courseId, roomId }
                    if (data.roomId) {
                        roomId = `course-${data.courseId}-room-${data.roomId}`;
                    } else {
                        roomId = `course-${data.courseId}`;
                    }
                } else {
                    // Legacy format: just courseId string
                    const courseId = data;
                    roomId = courseId ? `course-${courseId}` : 'lobby';
                }
                socket._roomId = roomId;
                socket.join(roomId);

                const room = getOrCreateRoom(roomId);

                // Create the player in this room's state
                room.players[socket.id] = {
                    id: socket.id,
                    name: 'Guest_' + Math.floor(Math.random() * 1000),
                    color: '#3b82f6',
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    animation: 'idle',
                    modelData: null,
                    peerId: null,
                    ready: false
                };

                // Only send players that are ready (have called setName) to avoid Guest names
                const readyPlayers = {};
                for (const [id, p] of Object.entries(room.players)) {
                    if (p.ready || id === socket.id) readyPlayers[id] = p;
                }
                socket.emit('currentPlayers', readyPlayers);
                socket.emit('initialCubes', room.placedCubes);
                socket.emit('initialModels', room.placedModels);
                socket.emit('initialModulePlacements', room.placedModulePlacements);
                socket.emit('initialChatHistory', room.chatHistory);

                console.log(`[Rooms] Socket ${socket.id} joined room: ${roomId} (${Object.keys(room.players).length} players)`);
            });

            // --- Player Identity ---
            socket.on('setName', (data) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room || !room.players[socket.id]) return;

                const wasReady = room.players[socket.id].ready;
                if (typeof data === 'string') {
                    room.players[socket.id].name = data;
                } else {
                    room.players[socket.id].name = data.name;
                    room.players[socket.id].color = data.color;
                    if (data.profilePicture) room.players[socket.id].profilePicture = data.profilePicture;
                }
                room.players[socket.id].ready = true;

                if (!wasReady) {
                    // First time setting name — NOW broadcast newPlayer with real identity
                    socket.broadcast.to(roomId).emit('newPlayer', room.players[socket.id]);
                }
                io.to(roomId).emit('playerUpdated', room.players[socket.id]);
            });

            // ===== GROUP CALL SYSTEM =====

            socket.on('createGroupCall', () => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room || !room.players[socket.id]) return;

                if (!activeGroupCalls[roomId]) activeGroupCalls[roomId] = {};

                const groupId = 'gc_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
                const jitsiRoomName = `tp-${roomId}-${groupId}`.replace(/[^a-zA-Z0-9_-]/g, '');
                const creatorName = room.players[socket.id].name || 'Unknown';

                activeGroupCalls[roomId][groupId] = {
                    id: groupId,
                    creatorId: socket.id,
                    creatorName: creatorName,
                    members: [{ socketId: socket.id, name: creatorName }],
                    jitsiRoomName: jitsiRoomName
                };

                room.players[socket.id].inGroupCall = groupId;

                socket.emit('groupCallCreated', activeGroupCalls[roomId][groupId]);
                io.to(roomId).emit('groupCallList', Object.values(activeGroupCalls[roomId] || {}));
                io.to(roomId).emit('playerCallStatusChanged', { id: socket.id, inGroupCall: groupId });
            });

            socket.on('closeGroupCall', (groupId) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!activeGroupCalls[roomId] || !activeGroupCalls[roomId][groupId]) return;

                const group = activeGroupCalls[roomId][groupId];
                if (group.creatorId !== socket.id) return; // Only creator can close

                // Clear inGroupCall for all members
                group.members.forEach(m => {
                    if (room && room.players[m.socketId]) {
                        room.players[m.socketId].inGroupCall = null;
                        io.to(roomId).emit('playerCallStatusChanged', { id: m.socketId, inGroupCall: null });
                    }
                });

                delete activeGroupCalls[roomId][groupId];
                io.to(roomId).emit('groupCallClosed', { groupId });
                io.to(roomId).emit('groupCallList', Object.values(activeGroupCalls[roomId] || {}));
            });

            socket.on('leaveGroupCall', (groupId) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!activeGroupCalls[roomId] || !activeGroupCalls[roomId][groupId]) return;

                const group = activeGroupCalls[roomId][groupId];
                group.members = group.members.filter(m => m.socketId !== socket.id);

                if (room && room.players[socket.id]) {
                    room.players[socket.id].inGroupCall = null;
                    io.to(roomId).emit('playerCallStatusChanged', { id: socket.id, inGroupCall: null });
                }

                // If creator left or no members remain, close the group
                if (group.creatorId === socket.id || group.members.length === 0) {
                    group.members.forEach(m => {
                        if (room && room.players[m.socketId]) {
                            room.players[m.socketId].inGroupCall = null;
                            io.to(roomId).emit('playerCallStatusChanged', { id: m.socketId, inGroupCall: null });
                        }
                    });
                    delete activeGroupCalls[roomId][groupId];
                    io.to(roomId).emit('groupCallClosed', { groupId });
                } else {
                    io.to(roomId).emit('memberLeftGroup', { groupId, socketId: socket.id });
                }
                io.to(roomId).emit('groupCallList', Object.values(activeGroupCalls[roomId] || {}));
            });

            socket.on('requestJoinGroup', (groupId) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!activeGroupCalls[roomId] || !activeGroupCalls[roomId][groupId]) return;
                if (!room || !room.players[socket.id]) return;

                const group = activeGroupCalls[roomId][groupId];
                const requesterName = room.players[socket.id].name || 'Unknown';

                // Send join request to the creator
                io.to(group.creatorId).emit('joinRequest', {
                    groupId,
                    requesterId: socket.id,
                    requesterName: requesterName
                });
            });

            socket.on('respondJoinRequest', (data) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!activeGroupCalls[roomId] || !activeGroupCalls[roomId][data.groupId]) return;

                const group = activeGroupCalls[roomId][data.groupId];
                if (group.creatorId !== socket.id) return; // Only creator can respond

                if (data.accepted) {
                    const requesterName = (room && room.players[data.requesterId])
                        ? room.players[data.requesterId].name : 'Unknown';
                    group.members.push({ socketId: data.requesterId, name: requesterName });

                    if (room && room.players[data.requesterId]) {
                        room.players[data.requesterId].inGroupCall = data.groupId;
                        io.to(roomId).emit('playerCallStatusChanged', { id: data.requesterId, inGroupCall: data.groupId });
                    }

                    io.to(data.requesterId).emit('joinRequestResponse', {
                        accepted: true,
                        groupId: data.groupId,
                        jitsiRoomName: group.jitsiRoomName,
                        creatorName: group.creatorName
                    });
                    io.to(roomId).emit('memberJoinedGroup', { groupId: data.groupId, socketId: data.requesterId, name: requesterName });
                    io.to(roomId).emit('groupCallList', Object.values(activeGroupCalls[roomId] || {}));
                } else {
                    io.to(data.requesterId).emit('joinRequestResponse', {
                        accepted: false,
                        groupId: data.groupId
                    });
                }
            });

            socket.on('inviteToGroup', (data) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!activeGroupCalls[roomId] || !activeGroupCalls[roomId][data.groupId]) return;
                if (!room || !room.players[socket.id]) return;

                const inviterName = room.players[socket.id].name || 'Unknown';
                io.to(data.targetSocketId).emit('groupInvite', {
                    groupId: data.groupId,
                    inviterId: socket.id,
                    inviterName: inviterName,
                    jitsiRoomName: activeGroupCalls[roomId][data.groupId].jitsiRoomName
                });
            });

            socket.on('respondGroupInvite', (data) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!activeGroupCalls[roomId] || !activeGroupCalls[roomId][data.groupId]) return;

                const group = activeGroupCalls[roomId][data.groupId];
                const responderName = (room && room.players[socket.id]) ? room.players[socket.id].name : 'Unknown';

                if (data.accepted) {
                    group.members.push({ socketId: socket.id, name: responderName });
                    if (room && room.players[socket.id]) {
                        room.players[socket.id].inGroupCall = data.groupId;
                        io.to(roomId).emit('playerCallStatusChanged', { id: socket.id, inGroupCall: data.groupId });
                    }
                    io.to(roomId).emit('memberJoinedGroup', { groupId: data.groupId, socketId: socket.id, name: responderName });
                    io.to(roomId).emit('groupCallList', Object.values(activeGroupCalls[roomId] || {}));
                    socket.emit('joinRequestResponse', {
                        accepted: true,
                        groupId: data.groupId,
                        jitsiRoomName: group.jitsiRoomName,
                        creatorName: group.creatorName
                    });
                }
                io.to(data.inviterId).emit('inviteResponse', { accepted: data.accepted, responderName });
            });

            // --- Direct Call (1-on-1 via Jitsi) ---
            socket.on('directCallOffer', (data) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room || !room.players[socket.id]) return;

                // Block if caller is already in any call
                if (room.players[socket.id].inGroupCall) {
                    socket.emit('directCallBusy', { reason: 'You are already in a call.' });
                    return;
                }

                // Block if target is already in any call (group or direct)
                const targetPlayer = room.players[data.targetSocketId];
                if (!targetPlayer) return;
                if (targetPlayer.inGroupCall) {
                    socket.emit('directCallBusy', { reason: 'This player is currently in a call.' });
                    return;
                }

                const callerName = room.players[socket.id].name || 'Unknown';
                const jitsiRoomName = `tp-direct-${[socket.id, data.targetSocketId].sort().join('-')}`.replace(/[^a-zA-Z0-9_-]/g, '');

                // Track the direct call partner on the caller side immediately
                room.players[socket.id].directCallPartner = data.targetSocketId;

                io.to(data.targetSocketId).emit('directCallIncoming', {
                    callerId: socket.id,
                    callerName: callerName,
                    jitsiRoomName: jitsiRoomName
                });

                socket.emit('directCallStarted', { jitsiRoomName: jitsiRoomName });
            });

            socket.on('directCallResponse', (data) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];

                if (data.accepted) {
                    // Mark both parties as in a direct call
                    const directCallTag = 'direct_' + [socket.id, data.callerId].sort().join('_');
                    if (room && room.players[socket.id]) {
                        room.players[socket.id].inGroupCall = directCallTag;
                        room.players[socket.id].directCallPartner = data.callerId;
                        io.to(roomId).emit('playerCallStatusChanged', { id: socket.id, inGroupCall: directCallTag });
                    }
                    if (room && room.players[data.callerId]) {
                        room.players[data.callerId].inGroupCall = directCallTag;
                        room.players[data.callerId].directCallPartner = socket.id;
                        io.to(roomId).emit('playerCallStatusChanged', { id: data.callerId, inGroupCall: directCallTag });
                    }
                } else {
                    // Call rejected — clear the caller's pending partner
                    if (room && room.players[data.callerId]) {
                        room.players[data.callerId].directCallPartner = null;
                    }
                }

                io.to(data.callerId).emit('directCallAnswered', {
                    accepted: data.accepted,
                    responderId: socket.id
                });
            });

            // When one side hangs up a direct call, notify ONLY the partner (not broadcast)
            socket.on('directCallHangup', () => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room) return;

                const player = room.players[socket.id];
                const partnerId = player?.directCallPartner;

                // Clear caller's call state
                if (player) {
                    player.inGroupCall = null;
                    player.directCallPartner = null;
                    io.to(roomId).emit('playerCallStatusChanged', { id: socket.id, inGroupCall: null });
                }

                // Clear partner's call state and notify them
                if (partnerId && room.players[partnerId]) {
                    room.players[partnerId].inGroupCall = null;
                    room.players[partnerId].directCallPartner = null;
                    io.to(roomId).emit('playerCallStatusChanged', { id: partnerId, inGroupCall: null });
                    io.to(partnerId).emit('directCallHangup');
                }
            });

            socket.on('getGroupCallList', () => {
                const roomId = getSocketRoom(socket);
                socket.emit('groupCallList', Object.values(activeGroupCalls[roomId] || {}));
            });

            // --- Player Movement ---
            socket.on('playerMovement', (movementData) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room || !room.players[socket.id]) return;

                if (movementData && movementData.position) {
                    room.players[socket.id].position = movementData.position;
                    room.players[socket.id].rotation = movementData.rotation;
                    room.players[socket.id].animation = movementData.animation || 'idle';
                    
                    socket.broadcast.to(roomId).emit('playerMoved', {
                        id: socket.id,
                        position: movementData.position,
                        rotation: movementData.rotation,
                        isJumping: movementData.isJumping,
                        jumpAlpha: movementData.jumpAlpha,
                        didInteract: movementData.didInteract,
                        interactionPoint: movementData.interactionPoint
                    });
                }
            });

            socket.on('modelUpdate', (modelData) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room || !room.players[socket.id]) return;

                room.players[socket.id].modelData = modelData;
                socket.broadcast.to(roomId).emit('playerModelUpdated', {
                    id: socket.id,
                    modelData: modelData,
                    color: room.players[socket.id].color
                });
            });

            // --- Chat ---
            socket.on('chatMessage', (message) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room || !room.players[socket.id]) return;

                const chatData = {
                    id: socket.id,
                    name: room.players[socket.id].name,
                    message: message,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                
                room.chatHistory.push(chatData);
                if (room.chatHistory.length > MAX_CHAT_LOGS) room.chatHistory.shift();
                io.to(roomId).emit('chatMessage', chatData);
            });

            // --- World Objects ---
            socket.on('placeCube', (cubeData) => {
                const roomId = getSocketRoom(socket);
                const room = getOrCreateRoom(roomId);

                const newCube = {
                    id: 'cube_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    position: cubeData.position,
                    size: cubeData.size || { w: 1, h: 1, d: 1 },
                    color: cubeData.color || '#ef4444'
                };
                room.placedCubes.push(newCube);
                io.to(roomId).emit('cubeAdded', newCube);
            });

            socket.on('placeModel', (modelData) => {
                const roomId = getSocketRoom(socket);
                const room = getOrCreateRoom(roomId);

                const newModel = {
                    id: 'model_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    position: modelData.position,
                    rotation: modelData.rotation || { x: 0, y: 0, z: 0 },
                    modelBuffer: modelData.modelBuffer || null,
                    modelPath: modelData.modelPath || null,
                    isStructure: modelData.isStructure || false
                };
                room.placedModels.push(newModel);
                io.to(roomId).emit('modelAdded', newModel);
            });

            socket.on('deleteObject', (id) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room) return;

                if (id.startsWith('cube_')) {
                    const index = room.placedCubes.findIndex(c => c.id === id);
                    if (index !== -1) room.placedCubes.splice(index, 1);
                } else if (id.startsWith('model_')) {
                    const index = room.placedModels.findIndex(m => m.id === id);
                    if (index !== -1) room.placedModels.splice(index, 1);
                }
                io.to(roomId).emit('objectDeleted', id);
            });

            socket.on('updateObjectColor', (data) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room) return;

                const cube = room.placedCubes.find(c => c.id === data.id);
                if (cube) {
                    cube.color = data.color;
                    io.to(roomId).emit('objectUpdated', { id: data.id, color: data.color });
                }
            });

            socket.on('updateObjectRotation', (data) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room) return;

                const model = room.placedModels.find(m => m.id === data.id);
                if (model) {
                    model.rotation = data.rotation;
                    io.to(roomId).emit('objectUpdated', { id: data.id, rotation: data.rotation });
                }
            });

            // --- Module Placements ---
            socket.on('placeModulePlacement', (data) => {
                const roomId = getSocketRoom(socket);
                const room = getOrCreateRoom(roomId);

                const newPlacement = {
                    id: data.id,
                    moduleId: data.moduleId,
                    moduleTitle: data.moduleTitle || '',
                    status: data.status || 'NONE',
                    position: data.position,
                    rotation: data.rotation || { x: 0, y: 0, z: 0 },
                    ownerMasterId: socket.decoded?.id,
                    ownerUsername: socket.decoded?.username
                };
                room.placedModulePlacements.push(newPlacement);
                io.to(roomId).emit('modulePlacementAdded', newPlacement);
            });

            socket.on('updateModuleAssignment', (data) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room) return;

                const placement = room.placedModulePlacements.find(p => p.id === data.id);
                if (placement) {
                    placement.moduleId = data.moduleId;
                    placement.moduleTitle = data.moduleTitle || '';
                    placement.status = data.status || 'NONE';
                    io.to(roomId).emit('modulePlacementUpdated', { 
                        id: data.id, 
                        moduleId: data.moduleId, 
                        moduleTitle: data.moduleTitle, 
                        status: data.status 
                    });
                }
            });

            socket.on('deleteModulePlacement', (id) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room) return;

                const index = room.placedModulePlacements.findIndex(p => p.id === id);
                if (index !== -1) {
                    room.placedModulePlacements.splice(index, 1);
                    io.to(roomId).emit('modulePlacementDeleted', id);
                }
            });

            // --- Disconnect ---
            socket.on('disconnect', () => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];

                // Cleanup direct call partner on disconnect
                if (room && room.players[socket.id]) {
                    const partnerId = room.players[socket.id].directCallPartner;
                    if (partnerId && room.players[partnerId]) {
                        room.players[partnerId].inGroupCall = null;
                        room.players[partnerId].directCallPartner = null;
                        io.to(roomId).emit('playerCallStatusChanged', { id: partnerId, inGroupCall: null });
                        io.to(partnerId).emit('directCallHangup');
                    }
                }

                // Cleanup group calls on disconnect
                if (activeGroupCalls[roomId]) {
                    for (const groupId of Object.keys(activeGroupCalls[roomId])) {
                        const group = activeGroupCalls[roomId][groupId];
                        if (group.creatorId === socket.id) {
                            // Creator disconnected — close the group
                            group.members.forEach(m => {
                                if (room && room.players[m.socketId]) {
                                    room.players[m.socketId].inGroupCall = null;
                                    io.to(roomId).emit('playerCallStatusChanged', { id: m.socketId, inGroupCall: null });
                                }
                            });
                            delete activeGroupCalls[roomId][groupId];
                            io.to(roomId).emit('groupCallClosed', { groupId });
                        } else {
                            // Member disconnected — remove from group
                            group.members = group.members.filter(m => m.socketId !== socket.id);
                            io.to(roomId).emit('memberLeftGroup', { groupId, socketId: socket.id });
                        }
                    }
                    io.to(roomId).emit('groupCallList', Object.values(activeGroupCalls[roomId] || {}));
                }

                if (room) {
                    console.log(`User ${socket.id} disconnected from room: ${roomId}`);
                    delete room.players[socket.id];
                    io.to(roomId).emit('playerDisconnected', socket.id);

                    // Cleanup: destroy room if empty to free memory
                    if (Object.keys(room.players).length === 0) {
                        delete rooms[roomId];
                        if (activeGroupCalls[roomId]) delete activeGroupCalls[roomId];
                        console.log(`[Rooms] Room ${roomId} destroyed (empty)`);
                    }
                } else {
                    console.log(`User disconnected from 3D World: ${socket.id} (no room)`);
                }
            });
        });
    },
    getRoomsRef
};
