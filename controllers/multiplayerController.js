const fs = require('fs');
const path = require('path');

// State
const players = {};
const placedCubes = [];
const placedModels = [];
const placedModulePlacements = [];
const chatHistory = [];
const MAX_CHAT_LOGS = 50;

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

            players[socket.id] = {
                id: socket.id,
                name: 'Guest_' + Math.floor(Math.random() * 1000),
                color: '#3b82f6',
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                animation: 'idle',
                modelData: null,
                peerId: null
            };

            socket.emit('currentPlayers', players);
            socket.emit('initialCubes', placedCubes);
            socket.emit('initialModels', placedModels);
            socket.emit('initialModulePlacements', placedModulePlacements);
            socket.emit('initialChatHistory', chatHistory);

            socket.broadcast.emit('newPlayer', players[socket.id]);

            socket.on('setName', (data) => {
                if (players[socket.id]) {
                    if (typeof data === 'string') {
                        players[socket.id].name = data;
                    } else {
                        players[socket.id].name = data.name;
                        players[socket.id].color = data.color;
                        if (data.profilePicture) players[socket.id].profilePicture = data.profilePicture;
                    }
                    io.emit('playerUpdated', players[socket.id]);
                }
            });

            socket.on('setPeerId', (peerId) => {
                if (players[socket.id]) {
                    players[socket.id].peerId = peerId;
                    socket.broadcast.emit('playerPeerUpdated', { id: socket.id, peerId: peerId });
                }
            });

            socket.on('setStreamType', (data) => {
                if (players[socket.id]) {
                    players[socket.id].isScreenShare = data.isScreenShare;
                    socket.broadcast.emit('streamTypeChanged', { id: socket.id, isScreenShare: data.isScreenShare });
                }
            });

            let movementLogCounter = 0;
            socket.on('playerMovement', (movementData) => {
                if (players[socket.id]) {
                    if (movementData && movementData.position) {
                        players[socket.id].position = movementData.position;
                        players[socket.id].rotation = movementData.rotation;
                        players[socket.id].animation = movementData.animation || 'idle';
                        
                        socket.broadcast.emit('playerMoved', {
                            id: socket.id,
                            position: movementData.position,
                            rotation: movementData.rotation,
                            isJumping: movementData.isJumping,
                            jumpAlpha: movementData.jumpAlpha,
                            didInteract: movementData.didInteract,
                            interactionPoint: movementData.interactionPoint
                        });
                    }
                }
            });

            socket.on('modelUpdate', (modelData) => {
                if (players[socket.id]) {
                    players[socket.id].modelData = modelData;
                    socket.broadcast.emit('playerModelUpdated', {
                        id: socket.id,
                        modelData: modelData,
                        color: players[socket.id].color
                    });
                }
            });

            socket.on('chatMessage', (message) => {
                if (players[socket.id]) {
                    const chatData = {
                        id: socket.id,
                        name: players[socket.id].name,
                        message: message,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    
                    chatHistory.push(chatData);
                    if (chatHistory.length > MAX_CHAT_LOGS) chatHistory.shift();
                    io.emit('chatMessage', chatData);
                }
            });

            socket.on('placeCube', (cubeData) => {
                const newCube = {
                    id: 'cube_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    position: cubeData.position,
                    size: cubeData.size || { w: 1, h: 1, d: 1 },
                    color: cubeData.color || '#ef4444'
                };
                placedCubes.push(newCube);
                io.emit('cubeAdded', newCube);
            });

            socket.on('placeModel', (modelData) => {
                const newModel = {
                    id: 'model_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    position: modelData.position,
                    rotation: modelData.rotation || { x: 0, y: 0, z: 0 },
                    modelBuffer: modelData.modelBuffer || null,
                    modelPath: modelData.modelPath || null,
                    isStructure: modelData.isStructure || false
                };
                placedModels.push(newModel);
                io.emit('modelAdded', newModel);
            });

            socket.on('deleteObject', (id) => {
                if (id.startsWith('cube_')) {
                    const index = placedCubes.findIndex(c => c.id === id);
                    if (index !== -1) placedCubes.splice(index, 1);
                } else if (id.startsWith('model_')) {
                    const index = placedModels.findIndex(m => m.id === id);
                    if (index !== -1) placedModels.splice(index, 1);
                }
                io.emit('objectDeleted', id);
            });

            socket.on('updateObjectColor', (data) => {
                const cube = placedCubes.find(c => c.id === data.id);
                if (cube) {
                    cube.color = data.color;
                    io.emit('objectUpdated', { id: data.id, color: data.color });
                }
            });

            socket.on('updateObjectRotation', (data) => {
                const model = placedModels.find(m => m.id === data.id);
                if (model) {
                    model.rotation = data.rotation;
                    io.emit('objectUpdated', { id: data.id, rotation: data.rotation });
                }
            });

            socket.on('placeModulePlacement', (data) => {
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
                placedModulePlacements.push(newPlacement);
                io.emit('modulePlacementAdded', newPlacement);
            });

            socket.on('updateModuleAssignment', (data) => {
                const placement = placedModulePlacements.find(p => p.id === data.id);
                if (placement) {
                    placement.moduleId = data.moduleId;
                    placement.moduleTitle = data.moduleTitle || '';
                    placement.status = data.status || 'NONE';
                    io.emit('modulePlacementUpdated', { 
                        id: data.id, 
                        moduleId: data.moduleId, 
                        moduleTitle: data.moduleTitle, 
                        status: data.status 
                    });
                }
            });

            socket.on('deleteModulePlacement', (id) => {
                const index = placedModulePlacements.findIndex(p => p.id === id);
                if (index !== -1) {
                    placedModulePlacements.splice(index, 1);
                    io.emit('modulePlacementDeleted', id);
                }
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected from 3D World: ${socket.id}`);
                delete players[socket.id];
                io.emit('playerDisconnected', socket.id);
            });
        });
    }
};
