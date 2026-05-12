
        function toggleNotifications(event) {
            if(event) event.stopPropagation();
            const popup = document.getElementById('notification-popup');
            if(popup) popup.style.display = (popup.style.display === 'none') ? 'block' : 'none';
        }

        document.addEventListener('click', function(event) {
            const popup = document.getElementById('notification-popup');
            if (popup && popup.style.display === 'block' && !popup.contains(event.target)) {
                // Ignore, handled by global_notifications.js
            }
        });

        function switchProfilePane(paneName) {
            const panes = ['profile', 'creations', 'subscriptions', 'portfolio', 'settings'];
            panes.forEach(p => {
                const paneEl = document.getElementById('pane-' + p);
                const navEl = document.getElementById('nav-' + p);
                if (paneEl) paneEl.style.display = 'none';
                if (navEl) navEl.classList.remove('active');
            });
            const targetPane = document.getElementById('pane-' + paneName);
            const targetNav = document.getElementById('nav-' + paneName);
            if (targetPane) targetPane.style.display = 'block';
            if (targetNav) targetNav.classList.add('active');

            if (paneName === 'subscriptions') {
                if (typeof window.loadSubscriptions === 'function') {
                    window.loadSubscriptions();
                }
            }
        }

        function switchCreationTab(tab) {
            document.getElementById('subpane-courses').style.display = 'none';
            document.getElementById('subpane-channels').style.display = 'none';
            document.getElementById('subpane-' + tab).style.display = 'block';

            const btnCourses = document.getElementById('tab-creations-courses');
            const btnChannels = document.getElementById('tab-creations-channels');
            
            if (tab === 'courses') {
                btnCourses.style.background = '#1e293b';
                btnCourses.style.color = 'white';
                btnCourses.style.border = 'none';
                
                btnChannels.style.background = 'transparent';
                btnChannels.style.color = '#64748b';
                btnChannels.style.border = '1px solid #cbd5e1';
            } else {
                btnChannels.style.background = '#1e293b';
                btnChannels.style.color = 'white';
                btnChannels.style.border = 'none';
                
                btnCourses.style.background = 'transparent';
                btnCourses.style.color = '#64748b';
                btnCourses.style.border = '1px solid #cbd5e1';
            }
        }

        function openChannelModal() { document.getElementById('channel-modal').style.display = 'flex'; }
        function closeChannelModal() { document.getElementById('channel-modal').style.display = 'none'; }
        function openTagSelector() { document.getElementById('tag-selector-modal').style.display = 'flex'; }
        function closeTagSelector() { document.getElementById('tag-selector-modal').style.display = 'none'; }
        
        window.userTags = [];

        function toggleTag(tagName, bgColor, textColor) {
            const index = window.userTags.findIndex(t => t.name === tagName);
            if(index !== -1) {
                window.userTags.splice(index, 1);
            } else {
                window.userTags.push({ name: tagName, bg: bgColor, text: textColor });
            }
            renderSelectedTags();
        }

        function removeTag(tagName) {
            window.userTags = window.userTags.filter(t => t.name !== tagName);
            renderSelectedTags();
        }

        function renderSelectedTags() {
            const container = document.getElementById('selected-tags-container');
            if(window.userTags.length === 0) {
                container.innerHTML = '<span style="color:#94a3b8; font-size:0.9rem; margin:auto;" id="empty-tags-msg">No skills added yet. Click + Add.</span>';
                return;
            }
            container.innerHTML = window.userTags.map(t => `
                <span style="background:${t.bg}; color:${t.text}; padding:6px 15px; border-radius:20px; font-size:0.85rem; font-weight:bold; display:flex; align-items:center; gap:8px;">
                    ${t.name}
                    <i class="fas fa-times" style="cursor:pointer; opacity:0.7;" onclick="removeTag('${t.name}')"></i>
                </span>
            `).join('');
        }


        function handleProfilePhotoUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const MAX_WIDTH = 400;
                        
                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        window.profileCustomPhoto = dataUrl;
                        document.getElementById('settings-profile-img-preview').src = dataUrl;
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }


        function handleChannelThumbUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const MAX_WIDTH = 800;
                        
                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        window.channelCustomThumb = dataUrl;
                        
                        document.getElementById('channel-cover-preview').style.backgroundImage = `url(${dataUrl})`;
                        document.getElementById('channel-cover-preview').style.backgroundSize = 'cover';
                        document.getElementById('channel-cover-preview').style.backgroundPosition = 'center';
                        document.getElementById('channel-cover-preview').querySelector('.fa-image').style.display = 'none';
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        async function saveChannel() {
            const name = document.getElementById('channel-name').value;
            if(!name) return alert('Give the channel a name');
            const desc = document.getElementById('channel-desc').value;
            const thumb = window.channelCustomThumb || '';
            
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/channels', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ name, description: desc, thumb })
                });
                if(!res.ok) throw new Error('Falha ao criar canal');
                location.reload();
            } catch (err) {
                alert(err.message);
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const tab = urlParams.get('tab');
            if(tab) switchProfilePane(tab);

            // Renderiza Canais via API
            const token = localStorage.getItem('token');
            fetch('/channels/my', { headers: { 'Authorization': `Bearer ${token}` }})
                .then(r => r.json())
                .then(res => {
                    const savedChannels = res.data || [];
                    if (savedChannels.length > 0) {
                        document.getElementById('empty-channels').style.display = 'none';
                        const clist = document.getElementById('channels-list');
                        clist.style.display = 'grid';
                        clist.innerHTML = savedChannels.map(ch => {
                            const thumbBg = ch.thumb ? `url(${ch.thumb})` : `url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80')`;
                            return `
                            <div class="course-card" style="display:flex; flex-direction:column;">
                                <div class="course-thumb" style="background-image: ${thumbBg}; background-size: cover; background-position: center; height:140px; display:flex; align-items:center; justify-content:center;">
                                    <div style="width:60px; height:60px; border-radius:50%; background:white; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.2);">
                                        <i class="fas fa-tv" style="color:#cf982e; font-size:24px;"></i>
                                    </div>
                                </div>
                                <div class="course-info" style="flex:1; display:flex; flex-direction:column; padding: 15px;">
                                    <h3 class="course-title" style="margin:0 0 5px 0;">${ch.name}</h3>
                                    <p class="course-meta" style="flex:1; margin:0 0 15px 0;">${ch.description || 'No description'}</p>
                                    <div class="course-actions" style="margin-top:auto;">
                                        <button onclick="window.location.href='channel_view.html?id=${ch.id}'" style="width:100%; padding:8px 20px; border-radius:30px; font-weight:600; cursor:pointer; background:white; color:#1e293b; border:1px solid #cbd5e1; transition:all 0.2s;">Manage Channel</button>
                                    </div>
                                </div>
                            </div>
                        `}).join('');
                    }
                }).catch(err => console.error('Erro ao buscar canais', err));
        });
    


