const fs = require('fs');
const path = require('path');

// State — organized by rooms (one room per course, or course+room combos)
const rooms = {};
const MAX_CHAT_LOGS = 50;

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

            socket.on('setPeerId', (peerId) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room || !room.players[socket.id]) return;

                room.players[socket.id].peerId = peerId;
                socket.broadcast.to(roomId).emit('playerPeerUpdated', { id: socket.id, peerId: peerId });
            });

            socket.on('setStreamType', (data) => {
                const roomId = getSocketRoom(socket);
                const room = rooms[roomId];
                if (!room || !room.players[socket.id]) return;

                room.players[socket.id].isScreenShare = data.isScreenShare;
                socket.broadcast.to(roomId).emit('streamTypeChanged', { id: socket.id, isScreenShare: data.isScreenShare });
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
                if (room) {
                    console.log(`User ${socket.id} disconnected from room: ${roomId}`);
                    delete room.players[socket.id];
                    io.to(roomId).emit('playerDisconnected', socket.id);

                    // Cleanup: destroy room if empty to free memory
                    if (Object.keys(room.players).length === 0) {
                        delete rooms[roomId];
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
