document.addEventListener('DOMContentLoaded', async () => {
    const body = document.body;
    let editingPageId = null;
    let isSyncing = false;

    // Load existing page if ID is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const pageIdParam = urlParams.get('id');
    const courseIdParam = urlParams.get('courseId');
    const channelIdParam = urlParams.get('channelId');

    if (channelIdParam) {
        const addViewModulesBtn = document.getElementById('add-view-modules-btn');
        if (addViewModulesBtn) addViewModulesBtn.style.display = 'none';

        let channel = null;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/channels/' + channelIdParam, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                channel = data.data;
            }
        } catch (e) { console.error(e); }
        if (channel) {
            editingPageId = 'channel_lp';
            
            const navNameInput = document.getElementById('page-name-input');
            if(navNameInput) navNameInput.value = channel.name || 'Meu Canal';

            const container = document.getElementById('template-container');
            if (container) {
                const defaultCoursesAndFooter = `
                    <!-- COURSE GALLERY -->
                    <section class="module-section" id="channel-courses-section" style="background-color:#f8fafc; padding:60px 0; position:relative;">
                        <div class="bg-overlay" style="display:none;"></div>
                        <button class="bg-edit-btn" onclick="triggerImageUpload('channel-courses-section', 'bg')">
                            <i class="fas fa-image"></i> Change BG
                        </button>
                        <div class="module-content" style="max-width:1200px; margin:0 auto; padding:0 20px; position:relative; z-index:2;">
                            <div style="display:flex; align-items:center; gap:10px; margin-bottom:30px; border-bottom:2px solid #e2e8f0; padding-bottom:15px;">
                                <i class="fas fa-university" style="color:#cf9c33; font-size:1.5rem;"></i>
                                <h3 class="editable-text" style="font-size:1.6rem; color:#1e293b; margin:0; font-weight:bold;">Courses in Channel</h3>
                            </div>
                            <div id="courses-placeholder" style="min-height:300px; border:2px dashed #cbd5e1; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8; background:white;">
                                <i class="fas fa-layer-group" style="font-size:3rem; margin-bottom:15px; opacity:0.5;"></i>
                                <p style="margin:0;">Este canal ainda nÃ£o possui cursos vinculados.</p>
                            </div>
                        </div>
                    </section>

                    <!-- FOOTER -->
                    <footer class="module-section" id="channel-footer-section" style="background:linear-gradient(135deg, #1e293b 0%, #334155 100%); padding:40px 0; color:white; margin-bottom:0; position:relative;">
                        <div class="bg-overlay" style="display:none;"></div>
                        <button class="bg-edit-btn" onclick="triggerImageUpload('channel-footer-section', 'bg')">
                            <i class="fas fa-image"></i> Change Footer BG
                        </button>
                        <div class="module-content" style="max-width:1200px; margin:0 auto; padding:0 20px; display:flex; flex-wrap:wrap; gap:40px; position:relative; z-index:2;">
                            <div style="flex:1; min-width:250px;">
                                <h3 class="editable-text" style="color:#cf9c33; margin-top:0; font-size:1.1rem; margin-bottom:15px;">About Us</h3>
                                <p class="editable-text" style="opacity:0.8; font-size:0.85rem; line-height:1.6; margin:0;">We are an institution dedicated to delivering the best educational content. Our mission is to democratize knowledge through open technology.</p>
                            </div>
                            <div style="flex:1; min-width:250px;">
                                <h3 class="editable-text" style="color:#cf9c33; margin-top:0; font-size:1.1rem; margin-bottom:15px;">Contact</h3>
                                <p class="editable-text" style="opacity:0.8; font-size:0.85rem; line-height:1.6; margin:0;">Email: contact@example.com<br>Phone: (11) 9999-9999<br>Address: Main Avenue, 1000 - Center</p>
                            </div>
                            <div style="flex:1; min-width:250px;">
                                <h3 class="editable-text" style="color:#cf9c33; margin-top:0; font-size:1.1rem; margin-bottom:15px;">Partners</h3>
                                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                    <div class="editable-image-wrapper" style="background:white; padding:5px; border-radius:4px;"><img src="https://placehold.co/100x40/ffffff/1e293b?text=Logo+1" style="height:25px;"></div>
                                    <div class="editable-image-wrapper" style="background:white; padding:5px; border-radius:4px;"><img src="https://placehold.co/100x40/ffffff/1e293b?text=Logo+2" style="height:25px;"></div>
                                </div>
                            </div>
                        </div>
                    </footer>
                `;

                if (channel.modular_content) {
                    if (channel.modular_content.includes('courses-placeholder')) {
                        container.innerHTML = channel.modular_content;
                    } else {
                        // Migration: append the courses section and footer to the existing content
                        container.innerHTML = channel.modular_content + defaultCoursesAndFooter;
                    }
                    container.querySelectorAll('[data-events-bound]').forEach(el => el.removeAttribute('data-events-bound'));
                    container.querySelectorAll('[data-events-bound-bg-main]').forEach(el => el.removeAttribute('data-events-bound-bg-main'));
                } else {
                    container.innerHTML = `
                        <!-- Header -->
                        <section class="module-section" id="channel-header-section" style="background: white; padding: 60px 40px; border-bottom: 1px solid #e2e8f0; position:relative;">
                            <div class="bg-overlay" style="display:none;"></div>
                            <button class="bg-edit-btn" onclick="triggerImageUpload('channel-header-section', 'bg')">
                                <i class="fas fa-image"></i> Change BG
                            </button>
                            <div class="module-content" style="max-width: 1200px; margin: 0 auto; position:relative; z-index:2;">
                                <h1 class="editable-text" id="titulo-cabecalho" style="color: #1e293b; font-size: 2.8rem; margin: 0; font-weight: 800;">${channel.name || 'meu canal'}</h1>
                                <h2 class="editable-text" style="color: #cf9c33; font-size: 1.3rem; margin: 8px 0;">AVA</h2>
                                <p class="editable-text" id="desc-cabecalho" style="color: #475569; font-size: 1.1rem; max-width: 800px; line-height: 1.6; font-weight: 600;">To deliver trainings in a virtual ecosystem to empower public institutions, organisations and professionals with the skills and expertise needed to navigate today's complex challenges.</p>
                            </div>
                        </section>

                        <!-- Main Content with Courses and Methodology -->
                        <section class="module-section" id="channel-main-section" style="background-color: #f8fafc; padding: 40px 0; position:relative;">
                            <div class="bg-overlay" style="display:none;"></div>
                            <button class="bg-edit-btn" onclick="triggerImageUpload('channel-main-section', 'bg')">
                                <i class="fas fa-image"></i> Change BG
                            </button>
                            <div class="module-content" style="max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; gap: 40px; align-items: flex-start; flex-wrap: wrap; position:relative; z-index:2;">
                                <!-- Courses Placeholder -->
                                <div id="courses-placeholder" style="flex: 2; min-width: 300px; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; color: #94a3b8;">
                                    <i class="fas fa-layer-group" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                                    <p style="margin: 0 0 10px 0;">Este canal ainda não possui cursos vinculados.</p>
                                    <a href="#" style="color: #cf9c33; text-decoration: none; font-weight: bold; pointer-events:none;">Vincular um curso agora</a>
                                </div>
                                
                                <!-- Methodology Box -->
                                <div style="flex: 1; min-width: 300px; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 30px; border-left: 4px solid #cf9c33;">
                                    <h3 class="editable-text" style="color: #cf9c33; margin-top: 0; font-size: 1.2rem; text-transform: uppercase;">Nossa Metodologia</h3>
                                    <ul style="list-style-type: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 15px;">
                                        <li style="display: flex; gap: 10px; align-items: flex-start;">
                                            <span class="editable-text" style="font-size: 0.95rem; color: #1e293b; font-weight: 600; line-height: 1.4;">AVA is an advanced training platform that supports blended courses to enhance participants' knowledge retention.</span>
                                        </li>
                                        <li style="display: flex; gap: 10px; align-items: flex-start;">
                                            <span class="editable-text" style="font-size: 0.95rem; color: #1e293b; font-weight: 600; line-height: 1.4;">AVA is trained as legal.</span>
                                        </li>
                                        <li style="display: flex; gap: 10px; align-items: flex-start;">
                                            <span class="editable-text" style="font-size: 0.95rem; color: #1e293b; font-weight: 600; line-height: 1.4;">Assessment of trainees' expectations and needs.</span>
                                        </li>
                                        <li style="display: flex; gap: 10px; align-items: flex-start;">
                                            <span class="editable-text" style="font-size: 0.95rem; color: #1e293b; font-weight: 600; line-height: 1.4;">Design training plans and curricula.</span>
                                        </li>
                                        <li style="display: flex; gap: 10px; align-items: flex-start;">
                                            <span class="editable-text" style="font-size: 0.95rem; color: #1e293b; font-weight: 600; line-height: 1.4;">Design online training.</span>
                                        </li>
                                        <li style="display: flex; gap: 10px; align-items: flex-start;">
                                            <span class="editable-text" style="font-size: 0.95rem; color: #1e293b; font-weight: 600; line-height: 1.4;">Layout on-the-job training.</span>
                                        </li>
                                        <li style="display: flex; gap: 10px; align-items: flex-start;">
                                            <span class="editable-text" style="font-size: 0.95rem; color: #1e293b; font-weight: 600; line-height: 1.4;">Record video-based training.</span>
                                        </li>
                                        <li style="display: flex; gap: 10px; align-items: flex-start;">
                                            <span class="editable-text" style="font-size: 0.95rem; color: #1e293b; font-weight: 600; line-height: 1.4;">Support to Q&A through avatars.</span>
                                        </li>
                                        <li style="display: flex; gap: 10px; align-items: flex-start;">
                                            <span class="editable-text" style="font-size: 0.95rem; color: #1e293b; font-weight: 600; line-height: 1.4;">Build case studies, scenarios and simulation.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    `;
                }
            }
            const tModal = document.getElementById('template-modal');
            if (tModal) tModal.style.display = 'none';
            setTimeout(() => { if (typeof initDynamicEvents === 'function') initDynamicEvents(); }, 50);
        }
    } else if (courseIdParam) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/landing-pages/course/${courseIdParam}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const landingPage = await res.json();
                
                // Parse content if it's a string (e.g. from SQLite JSON field)
                let pageContent = landingPage.content;
                if (typeof pageContent === 'string') {
                    try { pageContent = JSON.parse(pageContent); } catch(e) {}
                }

                if (landingPage && pageContent && pageContent.html) {
                    editingPageId = 'course_lp';
                    
                    const navNameInput = document.getElementById('page-name-input');
                    if(navNameInput) navNameInput.value = landingPage.title || 'Curso sem tÃ­tulo';

                    const container = document.getElementById('template-container');
                    if (container) {
                        container.innerHTML = pageContent.html;
                        container.querySelectorAll('[data-events-bound]').forEach(el => el.removeAttribute('data-events-bound'));
                        container.querySelectorAll('[data-events-bound-bg-main]').forEach(el => el.removeAttribute('data-events-bound-bg-main'));
                    }
                    const tModal = document.getElementById('template-modal');
                    if (tModal) tModal.style.display = 'none';
                    setTimeout(() => { if (typeof initDynamicEvents === 'function') initDynamicEvents(); }, 50);
                }
            }
        } catch (err) {
            console.error('Failed to load existing landing page for course:', err);
        }
    } else if (pageIdParam) {
        const pages = JSON.parse(localStorage.getItem('published_pages') || '[]');
        const page = pages.find(p => p.id === pageIdParam);
            if (page) {
            editingPageId = page.id;
            
            const navNameInput = document.getElementById('page-name-input');
            if(navNameInput) navNameInput.value = page.title || 'Minha Landing Page';

            const container = document.getElementById('template-container');
            if (container) {
                container.innerHTML = page.modular_content || page.content;
                // Important: the saved HTML might have data-events-bound="true" attributes.
                // Since these are fresh DOM nodes, they don't actually have the event listeners attached.
                // We must remove these attributes so initDynamicEvents() can bind them properly.
                container.querySelectorAll('[data-events-bound]').forEach(el => el.removeAttribute('data-events-bound'));
                container.querySelectorAll('[data-events-bound-bg-main]').forEach(el => el.removeAttribute('data-events-bound-bg-main'));
            }
            
            // Hide the template modal since we are loading an existing layout
            const tModal = document.getElementById('template-modal');
            if (tModal) {
                tModal.style.display = 'none';
            }
            
            // We need to re-initialize events for the loaded content. 
            setTimeout(() => {
                if (typeof initDynamicEvents === 'function') {
                    initDynamicEvents();
                }
            }, 50);
        }
    }
    const publishBtn = document.getElementById('publish-btn');
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const editableTexts = document.querySelectorAll('.editable-text');
    const imageInput = document.getElementById('image-upload-input');

    // Sidebar elements
    const propertiesPanel = document.getElementById('properties-panel');
    const closePanelBtn = document.getElementById('close-panel-btn');

    const textOptions = document.getElementById('text-options');
    const imageOptions = document.getElementById('image-options');
    const bgOptions = document.getElementById('bg-options');
    const boxOptions = document.getElementById('box-options');
    const positionOptions = document.getElementById('position-options');

    // Controls
    const fontSelect = document.getElementById('font-family-select');
    const fontSizeInput = document.getElementById('font-size-input');
    const textColorInput = document.getElementById('text-color-input');
    const styleBtns = document.querySelectorAll('.style-btn');
    const alignBtns = document.querySelectorAll('.align-btn');

    const imageWidthRange = document.getElementById('image-width-range');
    const imageWidthInput = document.getElementById('image-width-input');
    const imageHeightRange = document.getElementById('image-height-range');
    const imageHeightInput = document.getElementById('image-height-input');
    const imageScaleRange = document.getElementById('image-scale-range');
    const imgAlignBtns = document.querySelectorAll('.img-align-btn');

    const bgTypeSelect = document.getElementById('bg-type-select');
    const uploadPanelBtn = document.getElementById('upload-panel-btn');
    const uploadImgPanelBtn = document.getElementById('upload-img-panel-btn');
    const bgColorInput = document.getElementById('bg-color-input');
    const bgSizeSelect = document.getElementById('bg-size-select');
    const bgRepeatSelect = document.getElementById('bg-repeat-select');
    const bgGrad1 = document.getElementById('bg-grad1');
    const bgGrad2 = document.getElementById('bg-grad2');
    const bgBlurRange = document.getElementById('bg-blur-range');
    const bgOpacityRange = document.getElementById('bg-opacity-range');

    // Box Constraints
    const marginInput = document.getElementById('margin-input');
    const paddingInput = document.getElementById('padding-input');
    const borderRadiusInput = document.getElementById('border-radius-input');
    const borderStyleSelect = document.getElementById('border-style-select');
    const borderWidthInput = document.getElementById('border-width-input');
    const borderColorType = document.getElementById('border-color-type');
    const borderColorInput = document.getElementById('border-color-input');
    const borderGrad1 = document.getElementById('border-grad1');
    const borderGrad2 = document.getElementById('border-grad2');

    const posXRange = document.getElementById('pos-x-range');
    const posYRange = document.getElementById('pos-y-range');
    const posXInput = document.getElementById('pos-x-input');
    const posYInput = document.getElementById('pos-y-input');

    let isEditMode = true;
    let activeElement = null;
    let activeElementType = null; // 'text', 'image', 'bg', 'video'

    // Video options
    const videoOptions = document.getElementById('video-options');
    const videoUrlInput = document.getElementById('video-url-input');
    const applyVideoUrlBtn = document.getElementById('apply-video-url-btn');
    const removeVideoUrlBtn = document.getElementById('remove-video-url-btn');
    const videoScaleRange = document.getElementById('video-scale-range');
    const videoScaleInput = document.getElementById('video-scale-input');
    const videoBorderRadiusInput = document.getElementById('video-border-radius-input');

    // --- TEMPLATE MODAL LOGIC ---
    const templateModal = document.getElementById('template-modal');
    const templateCardsContainer = document.getElementById('template-cards-container');
    const templateContainer = document.getElementById('template-container');

    if(window.templatePresets && templateModal && templateCardsContainer) {
        window.templatePresets.forEach(tpl => {
            const card = document.createElement('div');
            card.style.cssText = 'background:#1e293b; border-radius:12px; overflow:hidden; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column;';
            card.innerHTML = `<img src="${tpl.thumb}" style="width:100%; height:16vh; min-height:80px; object-fit:cover;">
                              <div style="padding:1vh 1vw;text-align:center;color:white;font-weight:bold;font-size:max(0.75rem, 1.5vh);">${tpl.name}</div>`;
            card.onmouseover = () => { card.style.transform = 'translateY(-5px)'; card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.5)'; };
            card.onmouseout = () => { card.style.transform = 'none'; card.style.boxShadow = 'none'; };
            card.onclick = () => {
                templateContainer.innerHTML = tpl.html;
                templateModal.style.display = 'none';
                initDynamicEvents();
            };
            templateCardsContainer.appendChild(card);
        });
    }

    // Text Link & Shadow & Fx inputs
    const textLinkInput = document.getElementById('text-link-input');
    const applyLinkBtn = document.getElementById('apply-link-btn');
    const removeLinkBtn = document.getElementById('remove-link-btn');
    const tsX = document.getElementById('ts-x');
    const tsY = document.getElementById('ts-y');
    const tsBlur = document.getElementById('ts-blur');
    const tsColor = document.getElementById('ts-color');
    const bsX = document.getElementById('bs-x');
    const bsY = document.getElementById('bs-y');
    const bsBlur = document.getElementById('bs-blur');
    const bsSpread = document.getElementById('bs-spread');
    const bsColor = document.getElementById('bs-color');
    const bsInset = document.getElementById('bs-inset');

    const imageScaleInput = document.getElementById('image-scale-input');
    const animSelect = document.getElementById('anim-select');
    const stickyCheckbox = document.getElementById('sticky-checkbox');
    const fxOptions = document.getElementById('fx-options');

    // --- DRAG HANDLE UI ---
    const dragHandle = document.createElement('div');
    dragHandle.innerHTML = '<i class="fas fa-arrows-alt"></i>';
    dragHandle.style.cssText = 'position:absolute; width: 30px; height: 30px; background: #0ea5e9; color: white; border-radius: 50%; display:none; justify-content:center; align-items:center; cursor:grab; z-index:10000; box-shadow: 0 4px 6px rgba(0,0,0,0.3);';
    document.body.appendChild(dragHandle);

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialPosX = 0;
    let initialPosY = 0;

    dragHandle.addEventListener('mousedown', e => {
        if (!activeElement) return;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initialPosX = parseInt(activeElement.dataset.posX) || 0;
        initialPosY = parseInt(activeElement.dataset.posY) || 0;
        dragHandle.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging || !activeElement) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        const newX = initialPosX + dx;
        const newY = initialPosY + dy;

        posXRange.value = newX;
        posYRange.value = newY;
        if (posXInput) posXInput.value = newX;
        if (posYInput) posYInput.value = newY;

        activeElement.dataset.posX = newX;
        activeElement.dataset.posY = newY;
        activeElement.style.transform = `translate(${newX}px, ${newY}px)`;

        updateDragHandlePos();
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        dragHandle.style.cursor = 'grab';
    });

    function updateDragHandlePos() {
        if (!activeElement || !isEditMode || activeElementType === 'bg') {
            dragHandle.style.display = 'none';
            return;
        }

        const rect = activeElement.getBoundingClientRect();
        dragHandle.style.top = `${rect.top + window.scrollY - 15}px`;
        dragHandle.style.left = `${rect.left + window.scrollX - 15}px`;
        dragHandle.style.display = 'flex';
    }

    document.addEventListener('scroll', updateDragHandlePos);
    window.addEventListener('resize', updateDragHandlePos);

    // Alternar VisualizaÃ§Ã£o
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', () => {
            isEditMode = !isEditMode;
            if (isEditMode) {
                body.className = 'edit-mode';
                openSidePanel(); 
                toggleViewBtn.innerHTML = '<i class="fas fa-eye"></i> Preview';
                toggleViewBtn.classList.remove('publish-mode');
                enableTextEditing(true);
                
                const floatBtn = document.getElementById('floating-back-btn');
                if (floatBtn) floatBtn.remove();
            } else {
                body.className = 'view-mode';
                deselectElement();
                hidePanelCompletely();
                toggleViewBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
                toggleViewBtn.classList.add('publish-mode');
                enableTextEditing(false);

                // Create floating back button
                const floatBtn = document.createElement('button');
                floatBtn.id = 'floating-back-btn';
                floatBtn.innerHTML = '<i class="fas fa-edit"></i> Back to Editing';
                floatBtn.style.cssText = 'position:fixed; top:20px; right:20px; background:#0ea5e9; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold; z-index:10000; box-shadow: 0 4px 15px rgba(0,0,0,0.3);';
                floatBtn.addEventListener('click', () => {
                    toggleViewBtn.click();
                });
                document.body.appendChild(floatBtn);
            }
        });
    }

    // LÃ³gica do Modal de PublicaÃ§Ã£o
    const publishModal = document.getElementById('publish-modal');
    const publishCancelBtn = document.getElementById('publish-cancel-btn');
    const publishConfirmBtn = document.getElementById('publish-confirm-btn');
    const publishTitleInput = document.getElementById('publish-title');
    const publishThumbUrlInput = document.getElementById('publish-thumb-url');
    const publishThumbUploadBtn = document.getElementById('publish-thumb-upload-btn');
    const publishThumbFile = document.getElementById('publish-thumb-file');
    const publishThumbImg = document.getElementById('publish-thumb-img');
    let customThumbBase64 = null;

    if (publishBtn) {
        // Change publish button text if we are editing a course
        if (courseIdParam) {
            publishBtn.innerHTML = '<i class="fas fa-save"></i> Save to Course';
        } else if (channelIdParam) {
            publishBtn.innerHTML = '<i class="fas fa-save"></i> Save to Channel';
        }

        publishBtn.addEventListener('click', () => {
            deselectElement();
            hidePanelCompletely();
            
            const titleEl = document.getElementById('titulo-cabecalho');
            publishTitleInput.value = titleEl ? titleEl.innerText : 'Minha Landing Page';
            
            if(courseIdParam) {
                const headerObj = document.querySelector('#publish-modal h2');
                const pObj = document.querySelector('#publish-modal p');
                if(headerObj) headerObj.innerText = 'Save Landing Page';
                if(pObj) pObj.innerText = 'Escolha uma capa para representar esta Landing Page.';
            } else if (channelIdParam) {
                const headerObj = document.querySelector('#publish-modal h2');
                const pObj = document.querySelector('#publish-modal p');
                if(headerObj) headerObj.innerText = 'Save Channel Design';
                if(pObj) pObj.innerText = 'Escolha uma capa (Thumbnail) para representar este canal.';
            }
            
            publishModal.classList.remove('hidden');
        });
    }

    function getCompiledHtml() {
        enableTextEditing(false);
        document.querySelectorAll('.editable-image-wrapper').forEach(w => w.style.outline = 'none');
        
        const container = document.getElementById('template-container');
        const cloneModular = container.cloneNode(true);
        cloneModular.querySelectorAll('[data-events-bound]').forEach(el => el.removeAttribute('data-events-bound'));
        const modularContent = cloneModular.innerHTML;
        
        const clone = container.cloneNode(true);
        clone.querySelectorAll('.bg-edit-btn').forEach(btn => btn.remove());
        clone.querySelectorAll('.drag-handle').forEach(handle => handle.remove());

        clone.querySelectorAll('.editable-text').forEach(el => {
            el.removeAttribute('contenteditable');
            el.classList.remove('editable-text');
            el.removeAttribute('data-events-bound');
            if (el.className === '') el.removeAttribute('class');
        });
        clone.querySelectorAll('.editable-image-wrapper').forEach(wrapper => {
            wrapper.classList.remove('editable-image-wrapper');
            wrapper.removeAttribute('onclick');
            wrapper.removeAttribute('data-events-bound');
            if (wrapper.className === '') wrapper.removeAttribute('class');
        });
        clone.querySelectorAll('.module-section').forEach(section => {
            section.removeAttribute('data-events-bound');
            section.removeAttribute('data-events-bound-bg-main');
        });
        
        return { modularContent, compiledContent: clone.innerHTML };
    }

    async function saveDirectToCourse(thumbUrl, modularContent, compiledContent) {
        publishModal.classList.add('hidden');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');

            // 1. Check if a landing page already exists for this course
            const getRes = await fetch(`/api/landing-pages/course/${courseIdParam}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let method = 'POST';
            let url = '/api/landing-pages';
            
            if (getRes.ok) {
                const existingPage = await getRes.json();
                if (existingPage && existingPage.id) {
                    method = 'PUT';
                    url = `/api/landing-pages/${existingPage.id}`;
                }
            }

            // 2. Save to database
            const payload = {
                title: 'Landing Page for Course ' + courseIdParam,
                content: { html: modularContent },
                compiledHtml: compiledContent,
                compiledCss: '',
                courseId: courseIdParam
            };

            const saveRes = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!saveRes.ok) {
                throw new Error('Failed to save landing page to database');
            }

            // 3. Update course cover image if needed
            if (thumbUrl) {
                await fetch(`/courses/${courseIdParam}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ coverImage: thumbUrl })
                });
            }

            alert('Design e Capa salvos no curso com sucesso (PostgreSQL)!');
            window.location.href = 'course_builder.html?id=' + courseIdParam;
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar Landing Page oficial: ' + error.message);
        }
    }

    async function saveDirectToChannel(thumbUrl, modularContent, compiledContent) {
        const updateData = {
            modular_content: modularContent,
            compiled_content: compiledContent
        };
        if (thumbUrl) updateData.thumb = thumbUrl;
        
        const titleEl = document.getElementById('titulo-cabecalho');
        const descEl = document.getElementById('desc-cabecalho');
        if (titleEl) updateData.name = titleEl.innerText;
        if (descEl) updateData.description = descEl.innerText;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/channels/' + channelIdParam, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updateData)
            });
            if(!res.ok) throw new Error('Falha ao salvar no servidor');
            
            publishModal.classList.add('hidden');
            alert('Design do Canal salvo com sucesso (PostgreSQL)!');
            window.location.href = 'channel_view.html?id=' + channelIdParam;
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar canal oficial: ' + error.message);
        }
    }

    if (publishCancelBtn) {
        publishCancelBtn.addEventListener('click', () => {
            publishModal.classList.add('hidden');
        });
    }

    if (publishThumbUploadBtn) {
        publishThumbUploadBtn.addEventListener('click', () => {
            publishThumbFile.click();
        });
    }

    if (publishThumbFile) {
        publishThumbFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
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
                        
                        customThumbBase64 = canvas.toDataURL('image/jpeg', 0.7);
                        publishThumbImg.src = customThumbBase64;
                        publishThumbImg.style.display = 'block';
                        publishThumbUrlInput.value = ''; // Limpa a URL se fez upload
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (publishThumbUrlInput) {
        publishThumbUrlInput.addEventListener('input', (e) => {
            if (e.target.value) {
                publishThumbImg.src = e.target.value;
                publishThumbImg.style.display = 'block';
                customThumbBase64 = null; // Prioriza URL
            } else if (!customThumbBase64) {
                publishThumbImg.style.display = 'none';
            }
        });
    }

    if (publishConfirmBtn) {
        publishConfirmBtn.addEventListener('click', () => {
            const { modularContent, compiledContent } = getCompiledHtml();

            // Sincroniza o input da navbar com o input do modal
            const navNameInput = document.getElementById('page-name-input');
            if (navNameInput && navNameInput.value) {
                if(!publishTitleInput.value) publishTitleInput.value = navNameInput.value;
            }

            const title = publishTitleInput.value || (navNameInput ? navNameInput.value : 'Minha Landing Page');
            const thumbUrl = customThumbBase64 || publishThumbUrlInput.value || '';
            
            if (courseIdParam) {
                saveDirectToCourse(thumbUrl, modularContent, compiledContent);
            } else if (channelIdParam) {
                saveDirectToChannel(thumbUrl, modularContent, compiledContent);
            } else {
                const finalPageId = editingPageId || ('page_' + Date.now());
                
                const newPage = {
                    id: finalPageId,
                    title: title,
                    content: modularContent,
                    modular_content: modularContent,
                    compiled_content: compiledContent,
                    thumb: thumbUrl,
                    date: new Date().toISOString()
                };

                let pages = JSON.parse(localStorage.getItem('published_pages') || '[]');
                
                if (editingPageId) {
                    const idx = pages.findIndex(p => p.id === editingPageId);
                    if (idx !== -1) pages[idx] = newPage;
                    else pages.push(newPage);
                } else {
                    pages.push(newPage);
                }
                
                localStorage.setItem('published_pages', JSON.stringify(pages));

                window.location.href = 'profile.html?tab=creations';
            }
        });
    }

    function enableTextEditing(enable) {
        document.querySelectorAll('.editable-text').forEach(el => {
            el.setAttribute('contenteditable', enable);
        });
    }

    function initDynamicEvents() {
        // --- 1. Textos EditÃ¡veis ---
        document.querySelectorAll('.editable-text').forEach(el => {
            el.setAttribute('contenteditable', isEditMode);
            if(el.dataset.eventsBound) return;
            el.dataset.eventsBound = 'true';
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                setActiveElement(el, 'text');
            });
            el.addEventListener('paste', e => {
                e.preventDefault();
                const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            });
        });

        // --- 2. Imagens EditÃ¡veis ---
        document.querySelectorAll('.editable-image-wrapper').forEach(wrapper => {
            if(wrapper.dataset.eventsBound) return;
            wrapper.dataset.eventsBound = 'true';
            wrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                const img = wrapper.querySelector('img') || wrapper.querySelector('video') || wrapper;
                setActiveElement(img, 'image');
            });
        });

        // Atualizar os observadores caso templates iniciais tragam animacoes novas
        if(typeof observeAnimations === 'function') observeAnimations();

        // --- YouTube Container selectable (Edit Mode) ---
        document.querySelectorAll('.ipt-yt-container').forEach(container => {
            if(container.dataset.eventsBound) return;
            container.dataset.eventsBound = 'true';
            container.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!isEditMode) return;
                setActiveElement(container, 'video');
            });
        });

        // --- 3. Fundo EditÃ¡vel (BotÃµes) ---
        document.querySelectorAll('.bg-edit-btn').forEach(btn => {
            if(btn.dataset.eventsBound) return;
            btn.dataset.eventsBound = 'true';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const section = btn.closest('.module-section');
                if(section) setActiveElement(section, 'bg');
            });
        });
        // --- 4. Clicar no corpo principal da Div para editar as bordas/fundo ---
        document.querySelectorAll('.module-section').forEach(section => {
            if(section.dataset.eventsBoundBgMain) return;
            section.dataset.eventsBoundBgMain = 'true';
            section.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede o #template-container de rodar deselectElement()
                setActiveElement(section, 'bg');
            });
        });
    }
    // --- CSS Animation Observer ---
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, { threshold: 0.1 });

    function observeAnimations() {
        animObserver.disconnect();
        document.querySelectorAll('.anim-fade-in, .anim-slide-up').forEach(el => {
            // Immediately toggle off if not intersecting to reset the animation properly
            animObserver.observe(el);
        });
    }

    // Primeira chamada para elementos que vieram default no index.html
    initDynamicEvents(); 
    observeAnimations();

    // ==========================================
    // SELECTION & SIDEBAR LOGIC (Intuitivo)
    // ==========================================

    function setActiveElement(element, type) {
        if (!isEditMode) return;

        // Remove destaque do anterior
        if (activeElement) activeElement.classList.remove('selected-element');

        activeElement = element;
        activeElementType = type;

        if (activeElement) {
            activeElement.classList.add('selected-element');
            openSidePanel();
            syncPanelWithElement();
        }
    }

    // Manter fallback legacy sÃ³ por precauÃ§Ã£o
    window.triggerImageUpload = function (targetId, type) {
        if (!isEditMode) return;
        if (window.event) window.event.stopPropagation();
        const targetElement = typeof targetId === 'string' ? document.getElementById(targetId) : targetId;
        if (!targetElement) return;
        
        if (type === 'src') setActiveElement(targetElement, 'image');
        else if (type === 'bg') setActiveElement(targetElement, 'bg');
    };

    function openSidePanel() {
        if (!isEditMode) return;
        propertiesPanel.classList.remove('hidden');
        body.classList.add('panel-open');

        const noSelectionMsg = document.getElementById('no-selection-msg');

        // Esconde todos
        textOptions.classList.add('hidden');
        imageOptions.classList.add('hidden');
        if (videoOptions) videoOptions.classList.add('hidden');
        bgOptions.classList.add('hidden');
        boxOptions.classList.add('hidden');
        positionOptions.classList.add('hidden');
        if (noSelectionMsg) noSelectionMsg.classList.remove('hidden');

        // Revela mediante seleÃ§Ã£o
        if (activeElement) {
            if (noSelectionMsg) noSelectionMsg.classList.add('hidden');
            boxOptions.classList.remove('hidden'); // Box Ã© global 
            fxOptions.classList.remove('hidden'); // AnimaÃ§Ãµes sÃ£o globais
            if (activeElementType !== 'bg') {
                positionOptions.classList.remove('hidden'); // Offset bloqueado no bg
            }

            if (activeElementType === 'text') {
                textOptions.classList.remove('hidden');
                bgOptions.classList.remove('hidden'); // Texto ganha background

                const optImage = document.getElementById('bg-type-select').querySelector('option[value="image"]');
                optImage.style.display = 'none';
                optImage.disabled = true;

                document.getElementById('blur-row').classList.add('hidden');
                document.getElementById('opacity-row').classList.remove('hidden');

                if (bgTypeSelect.value === 'image') bgTypeSelect.value = 'color';
            }
            else if (activeElementType === 'image') {
                imageOptions.classList.remove('hidden');
            }
            else if (activeElementType === 'video') {
                if (videoOptions) videoOptions.classList.remove('hidden');
            }
            else if (activeElementType === 'bg') {
                bgOptions.classList.remove('hidden');
                document.getElementById('blur-row').classList.remove('hidden');

                const optImage = document.getElementById('bg-type-select').querySelector('option[value="image"]');
                optImage.style.display = 'block';
                optImage.disabled = false;
                
                document.getElementById('opacity-row').classList.add('hidden');
            }

            // Apenas atualiza a UI do dropdown de tipos sem disparar "change" e quebrar a renderizaÃ§Ã£o!
            const type = bgTypeSelect.value;
            document.getElementById('bg-image-controls').classList.toggle('hidden', type !== 'image');
            document.getElementById('bg-color-controls').classList.toggle('hidden', type !== 'color');
            document.getElementById('bg-grad-controls').classList.toggle('hidden', type !== 'gradient' && type !== 'radial');
        }
    }

    function hidePanelCompletely() {
        propertiesPanel.classList.add('hidden');
        body.classList.remove('panel-open');
    }

    function deselectElement() {
        if (activeElement) {
            activeElement.classList.remove('selected-element');
            activeElement = null;
            activeElementType = null;
        }
        dragHandle.style.display = 'none';
        
        // Em vez de forÃ§ar a abertura do painel quando deseleciona, 
        // vamos mostrar a mensagem de fallback apenas SE o painel jÃ¡ estiver aberto.
        if (isEditMode && !propertiesPanel.classList.contains('hidden')) {
            openSidePanel(); 
        }
    }

    closePanelBtn.addEventListener('click', hidePanelCompletely);

    const deleteElementBtn = document.getElementById('delete-element-btn');
    if (deleteElementBtn) {
        deleteElementBtn.addEventListener('click', () => {
            if (activeElement) {
                if(confirm('Tem certeza que deseja deletar este elemento?')) {
                    activeElement.remove();
                    hidePanelCompletely();
                }
            }
        });
    }

    // Em vez de esconder, apenas tira o hook no elemento focado
    document.getElementById('template-container').addEventListener('click', deselectElement);

    // Inicializa abrindo a sidebar
    openSidePanel();

    // ==========================================
    // SINCROCINZAR UI DO PAINEL COM O ELEMENTO
    // ==========================================
    function syncPanelWithElement() {
        isSyncing = true;
        
        // Desativa transições temporariamente para ler o estilo real instantaneamente
        const oldTransition = activeElement.style.transition;
        activeElement.style.transition = 'none';
        
        const wasSelected = activeElement.classList.contains('selected-element');
        if (wasSelected) activeElement.classList.remove('selected-element');
        const wasEditMode = document.body.classList.contains('edit-mode');
        if (wasEditMode) document.body.classList.remove('edit-mode');

        // Força recálculo do estilo (evita otimização do browser que ignora o remove/add síncrono)
        void activeElement.offsetHeight; 
        const computed = window.getComputedStyle(activeElement);

        const px = activeElement.dataset.posX || 0;
        const py = activeElement.dataset.posY || 0;
        posXRange.value = px;
        posYRange.value = py;
        if (posXInput) posXInput.value = px;
        if (posYInput) posYInput.value = py;

        updateDragHandlePos();

        marginInput.value = parseInt(computed.margin) || 0;
        paddingInput.value = parseInt(computed.padding) || 0;
        borderRadiusInput.value = parseInt(computed.borderRadius) || 0;
        
        const bStyle = computed.borderStyle;
        const bWidth = parseInt(computed.borderWidth) || 0;
        
        if (bWidth === 0 || !bStyle || bStyle === 'none' || bStyle === '' || bStyle.includes('none')) {
            borderStyleSelect.value = 'none';
        } else {
            borderStyleSelect.value = bStyle.split(' ')[0];
        }
        
        borderWidthInput.value = bWidth;

        borderColorType.value = activeElement.dataset.borderType || 'solid-color';
        borderColorType.dispatchEvent(new Event('change'));

        if (activeElementType === 'bg') {
            const savedType = activeElement.dataset.bgType;
            if (savedType) {
                bgTypeSelect.value = savedType;
            } else {
                const bgImage = computed.backgroundImage;
                if (bgImage !== 'none' && !bgImage.includes('gradient')) bgTypeSelect.value = 'image';
                else if (bgImage.includes('radial-gradient')) bgTypeSelect.value = 'radial';
                else if (bgImage.includes('gradient')) bgTypeSelect.value = 'gradient';
                else bgTypeSelect.value = 'color';
            }
            
            // SeguranÃ§a: Apenas mostra o menu correto sem re-renderizar em cima da DIV
            document.getElementById('bg-image-controls').classList.toggle('hidden', bgTypeSelect.value !== 'image');
            document.getElementById('bg-color-controls').classList.toggle('hidden', bgTypeSelect.value !== 'color');
            document.getElementById('bg-grad-controls').classList.toggle('hidden', bgTypeSelect.value !== 'gradient' && bgTypeSelect.value !== 'radial');

            if (bgTypeSelect.value === 'image') {
                if (bgSizeSelect) {
                    let cSize = computed.backgroundSize || 'cover';
                    if (cSize !== 'cover' && cSize !== 'contain' && cSize !== 'auto' && cSize !== '100% 100%') {
                        bgSizeSelect.value = 'custom';
                        const scaleRow = document.getElementById('bg-scale-row');
                        if (scaleRow) scaleRow.style.display = 'flex';
                        const slider = document.getElementById('bg-scale-slider');
                        const valLabel = document.getElementById('bg-scale-val');
                        let parsedScale = parseInt(cSize);
                        if (!isNaN(parsedScale) && slider) {
                            slider.value = parsedScale;
                            if(valLabel) valLabel.innerText = `${parsedScale}%`;
                        }
                    } else {
                        bgSizeSelect.value = cSize;
                        const scaleRow = document.getElementById('bg-scale-row');
                        if (scaleRow) scaleRow.style.display = 'none';
                    }
                }
                if (bgRepeatSelect) bgRepeatSelect.value = computed.backgroundRepeat || 'no-repeat';
            }

            // Ignorando opacidade da div global, pois o slider esta escondido para BGs principais agora.
            bgOpacityRange.value = 100;
        }

        if (activeElementType === 'text') {
            fontSelect.value = computed.fontFamily.replace(/"/g, "'"); // normaliza aspa
            fontSizeInput.value = parseInt(computed.fontSize);
            textColorInput.value = rgbToHex(computed.color);

            // Sync Link se existir
            const firstA = activeElement.querySelector('a');
            if (activeElement.tagName.toLowerCase() === 'a') {
                if (textLinkInput) textLinkInput.value = activeElement.href;
            } else if (firstA) {
                if (textLinkInput) textLinkInput.value = firstA.href;
            } else {
                if (textLinkInput) textLinkInput.value = '';
            }

            // Sync Text Shadow
            if(computed.textShadow && computed.textShadow !== 'none') {
                const colorMatch = computed.textShadow.match(/rgba?\([^)]+\)|#[0-9a-fA-F]+/);
                if(colorMatch) tsColor.value = rgbToHex(colorMatch[0]);
                
                let shadowStr = computed.textShadow.replace(/rgba?\([^)]+\)|#[0-9a-fA-F]+/g, '').trim();
                const pxVals = shadowStr.match(/-?\d+/g);
                if(pxVals && pxVals.length >= 2){
                    tsX.value = parseInt(pxVals[0]);
                    tsY.value = parseInt(pxVals[1]);
                    tsBlur.value = pxVals[2] ? parseInt(pxVals[2]) : 0;
                }
            } else {
                tsX.value = 0; tsY.value = 0; tsBlur.value = 0;
            }

            const textBg = computed.backgroundColor;
            const matchBg = /rgba?\(.*,\s*.*,\s*.*,?\s*([\d.]+)?\)/.exec(textBg);
            let textAlpha = 0;
            if (matchBg && matchBg[1] !== undefined) textAlpha = parseFloat(matchBg[1]);
            else if (textBg.startsWith('rgb(') && textBg !== 'rgba(0, 0, 0, 0)') textAlpha = 1;
            else if (textBg === 'rgba(0, 0, 0, 0)') textAlpha = 0;
            bgOpacityRange.value = textAlpha * 100;

        } else if (activeElementType === 'image') {
            const width = activeElement.dataset.width || 100;
            const height = activeElement.dataset.height || 0;
            const scale = activeElement.dataset.uniformScale || 1;
            
            if(imageWidthRange) imageWidthRange.value = width;
            if(imageWidthInput) imageWidthInput.value = width;
            
            if(imageHeightRange) imageHeightRange.value = height;
            if(imageHeightInput) imageHeightInput.value = height;
            
            if(imageScaleRange) imageScaleRange.value = scale;
            if(imageScaleInput) imageScaleInput.value = scale;
        } else if (activeElementType === 'video') {
            if (videoUrlInput) videoUrlInput.value = activeElement.dataset.ytUrl || '';
            const vScale = activeElement.dataset.videoScale || 100;
            if (videoScaleRange) videoScaleRange.value = vScale;
            if (videoScaleInput) videoScaleInput.value = vScale;
            if (videoBorderRadiusInput) videoBorderRadiusInput.value = parseInt(activeElement.style.borderRadius) || 10;
        }

        // Sync Box Shadow Global
        if (computed.boxShadow && computed.boxShadow !== 'none') {
            const isInset = computed.boxShadow.toLowerCase().includes('inset');
            bsInset.checked = isInset;
            const colorMatch = computed.boxShadow.match(/rgba?\([^)]+\)|#[0-9a-fA-F]+/);
            if(colorMatch) bsColor.value = rgbToHex(colorMatch[0]);

            let shadowStr = computed.boxShadow.replace(/rgba?\([^)]+\)|#[0-9a-fA-F]+/g, '').replace(/inset/i, '').trim();
            const pxVals = shadowStr.match(/-?\d+/g);
            if(pxVals && pxVals.length >= 2){
                bsX.value = parseInt(pxVals[0]);
                bsY.value = parseInt(pxVals[1]);
                bsBlur.value = pxVals[2] ? parseInt(pxVals[2]) : 0;
                bsSpread.value = pxVals[3] ? parseInt(pxVals[3]) : 0;
            }
        } else {
            bsX.value=0; bsY.value=0; bsBlur.value=5; bsSpread.value=0; bsInset.checked=false; bsColor.value='#000000';
        }

        // Sync FX
        let animFound = "";
        activeElement.classList.forEach(c => { if(c.startsWith('anim-')) animFound = c; });
        animSelect.value = animFound;
        stickyCheckbox.checked = computed.position === 'sticky';

        const delBtn = document.getElementById('delete-element-btn');
        if (delBtn) delBtn.style.display = (activeElementType === 'bg') ? 'none' : 'flex';
        
        if (wasSelected) activeElement.classList.add('selected-element');
        if (wasEditMode) document.body.classList.add('edit-mode');
        
        // Restaura a transição
        void activeElement.offsetHeight; // Força aplicar as classes antes de restaurar a transição
        activeElement.style.transition = oldTransition;
        
        isSyncing = false;
    }

    // ==========================================
    // LIVE UPDATE LOGIC: PANEL -> DOM
    // ==========================================

    const applyStyle = (prop, val) => { if (activeElement) activeElement.style[prop] = val; };

    function hasSelectionInActiveElement() {
        const sel = window.getSelection();
        if(!sel.rangeCount || sel.isCollapsed) return false;
        let node = sel.anchorNode;
        while(node) {
            if(node === activeElement) return true;
            node = node.parentNode;
        }
        return false;
    }

    function applyInlineStyleOrGlobal(prop, globalValue, execCommandName, execValue) {
        if (!activeElement) return;
        if (hasSelectionInActiveElement() && execCommandName) {
            document.execCommand('styleWithCSS', false, true);
            if(execCommandName === 'spanWrap') {
                const span = document.createElement('span');
                span.style[prop] = globalValue;
                const sel = window.getSelection();
                const range = sel.getRangeAt(0);
                range.surroundContents(span);
            } else {
                document.execCommand(execCommandName, false, execValue);
            }
        } else {
            applyStyle(prop, globalValue);
        }
    }

    // --- Controladores de Texto ---
    fontSelect.addEventListener('change', e => {
        applyInlineStyleOrGlobal('fontFamily', e.target.value, 'fontName', e.target.value);
    });

    fontSizeInput.addEventListener('input', e => {
        let val = e.target.value;
        if (!isNaN(val) && val !== "") val += 'px';
        applyInlineStyleOrGlobal('fontSize', val, 'spanWrap', val);
    });

    textColorInput.addEventListener('input', e => {
        applyInlineStyleOrGlobal('color', e.target.value, 'foreColor', e.target.value);
    });

    styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if(hasSelectionInActiveElement()) {
                const cmd = btn.dataset.style === 'fontWeight' ? 'bold' : 'italic';
                document.execCommand('styleWithCSS', false, true);
                document.execCommand(cmd, false, null);
                return;
            }
            const prop = btn.dataset.style;
            const val = btn.dataset.value;
            const computed = window.getComputedStyle(activeElement)[prop];
            applyStyle(prop, (computed.includes(val) || computed > 400) ? 'normal' : val);
        });
    });

    alignBtns.forEach(btn => {
        btn.addEventListener('click', () => applyStyle('textAlign', btn.dataset.align));
    });

    if(applyLinkBtn) {
        applyLinkBtn.addEventListener('click', () => {
            const url = textLinkInput.value.trim();
            if (!url || !activeElement) return;
            
            if (hasSelectionInActiveElement()) {
                document.execCommand('createLink', false, url);
            } else {
                if (activeElement.tagName.toLowerCase() === 'a') {
                    activeElement.href = url;
                } else {
                    const range = document.createRange();
                    range.selectNodeContents(activeElement);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                    document.execCommand('createLink', false, url);
                }
            }
        });
    }

    if(removeLinkBtn) {
        removeLinkBtn.addEventListener('click', () => {
            if (!activeElement) return;
            if (hasSelectionInActiveElement()) {
                document.execCommand('unlink', false, null);
            } else {
                activeElement.querySelectorAll('a').forEach(a => {
                    const text = document.createTextNode(a.textContent);
                    a.parentNode.replaceChild(text, a);
                });
                textLinkInput.value = '';
            }
        });
    }

    // --- Controladores de Sombras ---
    const updateTextShadow = () => { applyStyle('textShadow', `${tsX.value}px ${tsY.value}px ${tsBlur.value}px ${tsColor.value}`); };
    tsX.addEventListener('input', updateTextShadow);
    tsY.addEventListener('input', updateTextShadow);
    tsBlur.addEventListener('input', updateTextShadow);
    tsColor.addEventListener('input', updateTextShadow);

    const updateBoxShadow = () => { 
        if (isSyncing) return;
        const inset = bsInset.checked ? 'inset ' : '';
        applyStyle('boxShadow', `${inset}${bsX.value}px ${bsY.value}px ${bsBlur.value}px ${bsSpread.value}px ${bsColor.value}`); 
    };
    bsX.addEventListener('input', updateBoxShadow);
    bsY.addEventListener('input', updateBoxShadow);
    bsBlur.addEventListener('input', updateBoxShadow);
    bsSpread.addEventListener('input', updateBoxShadow);
    bsColor.addEventListener('input', updateBoxShadow);
    bsInset.addEventListener('change', updateBoxShadow);

    // --- Fx & AnimaÃ§Ãµes ---
    animSelect.addEventListener('change', e => {
        if(!activeElement) return;
        ['anim-float', 'anim-pulse', 'anim-fade-in', 'anim-slide-up'].forEach(c => activeElement.classList.remove(c));
        if(e.target.value) activeElement.classList.add(e.target.value);
        if(typeof observeAnimations === 'function') observeAnimations();
    });
    
    stickyCheckbox.addEventListener('change', e => {
        if(!activeElement) return;
        if(e.target.checked) {
            applyStyle('position', 'sticky');
            applyStyle('top', '0');
            applyStyle('zIndex', '500');
        } else {
            applyStyle('position', 'relative');
            applyStyle('top', 'auto');
            applyStyle('zIndex', 'auto');
        }
    });

    // --- Controladores de Imagem ---
    const updateImgWidth = (val) => {
        if(imageWidthRange) imageWidthRange.value = val;
        if(imageWidthInput) imageWidthInput.value = val;
        if(activeElement){
            activeElement.dataset.width = val;
            applyStyle('width', `${val}%`);
        }
    };
    
    const updateImgHeight = (val) => {
        if(imageHeightRange) imageHeightRange.value = val;
        if(imageHeightInput) imageHeightInput.value = val;
        if(activeElement){
            activeElement.dataset.height = val;
            if (val == 0) {
                applyStyle('height', 'auto');
            } else {
                applyStyle('height', `${val}px`);
            }
        }
    };

    const updateImgUniformScale = (val) => {
        if(imageScaleRange) imageScaleRange.value = val;
        if(imageScaleInput) imageScaleInput.value = val;
        if(activeElement){
            activeElement.dataset.uniformScale = val;
            applyStyle('transform', `scale(${val})`);
        }
    };

    if(imageWidthRange) imageWidthRange.addEventListener('input', e => updateImgWidth(e.target.value));
    if(imageWidthInput) imageWidthInput.addEventListener('input', e => updateImgWidth(e.target.value));
    if(imageHeightRange) imageHeightRange.addEventListener('input', e => updateImgHeight(e.target.value));
    if(imageHeightInput) imageHeightInput.addEventListener('input', e => updateImgHeight(e.target.value));
    if(imageScaleRange) imageScaleRange.addEventListener('input', e => updateImgUniformScale(e.target.value));
    if(imageScaleInput) imageScaleInput.addEventListener('input', e => updateImgUniformScale(e.target.value));

    imgAlignBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Imagens e logos estao num container editable-image-wrapper
            const container = activeElement.closest('.editable-image-wrapper') || activeElement.parentElement;
            container.style.display = 'flex';
            container.style.justifyContent = btn.dataset.align;
        });
    });

    // --- Controladores de Fundo (Background Divs) ---
    bgTypeSelect.addEventListener('change', e => {
        let type = e.target.value;
        if (activeElementType === 'text' && type === 'image') {
            type = 'color';
            e.target.value = 'color';
        }

        if (activeElement) activeElement.dataset.bgType = type;

        document.getElementById('bg-image-controls').classList.toggle('hidden', type !== 'image');
        document.getElementById('bg-color-controls').classList.toggle('hidden', type !== 'color');
        document.getElementById('bg-grad-controls').classList.toggle('hidden', type !== 'gradient' && type !== 'radial');
        updateBgRender();
    });

    const updateBgRender = () => {
        if (!activeElement || (activeElementType !== 'bg' && activeElementType !== 'text')) return;

        const type = bgTypeSelect.value;
        const opacity = parseFloat(bgOpacityRange.value) / 100;

        const overlay = activeElement.querySelector('.bg-overlay');

        if (type === 'color') {
            activeElement.style.backgroundImage = 'none';
            activeElement.style.backgroundColor = hexToRgba(bgColorInput.value, activeElementType === 'text' ? opacity : 1);
            if (overlay) {
                overlay.style.backgroundColor = 'transparent';
                overlay.style.backdropFilter = 'none';
            }
        } else if (type === 'gradient') {
            let c1 = hexToRgba(bgGrad1.value, activeElementType === 'text' ? opacity : 1); // Gradiente puro
            let c2 = hexToRgba(bgGrad2.value, activeElementType === 'text' ? opacity : 1);
            activeElement.style.backgroundColor = 'transparent';
            activeElement.style.backgroundImage = `linear-gradient(135deg, ${c1}, ${c2})`;
            activeElement.style.opacity = 1; // Nunca some com a div base
            if (overlay) {
                overlay.style.backgroundColor = 'transparent';
                overlay.style.backdropFilter = 'none';
            }
        } else if (type === 'radial') {
            let c1 = hexToRgba(bgGrad1.value, activeElementType === 'text' ? opacity : 1);
            let c2 = hexToRgba(bgGrad2.value, activeElementType === 'text' ? opacity : 1);
            activeElement.style.backgroundColor = activeElementType === 'text' ? 'transparent' : '#1e293b'; 
            activeElement.style.backgroundImage = `radial-gradient(circle at 10% 20%, ${c1} 0%, transparent 60%), radial-gradient(circle at 90% 80%, ${c2} 0%, transparent 60%)`;
            activeElement.style.opacity = 1;
            if (overlay) {
                overlay.style.backgroundColor = 'transparent';
                overlay.style.backdropFilter = 'none';
            }
        } else if (type === 'image' && activeElementType === 'bg') {
            activeElement.style.opacity = 1;
            if (overlay) {
                overlay.style.backgroundColor = 'transparent'; // Ficticio - nÃ£o aplica escuridÃ£o global
                overlay.style.backdropFilter = `blur(${bgBlurRange.value}px)`;
            }
        }
    };

    bgColorInput.addEventListener('input', updateBgRender);

    if (bgSizeSelect) {
        bgSizeSelect.addEventListener('change', e => {
            if (!activeElement || activeElementType !== 'bg') return;
            const bgScaleRow = document.getElementById('bg-scale-row');
            if (e.target.value === 'custom') {
                if(bgScaleRow) bgScaleRow.style.display = 'flex';
                const slider = document.getElementById('bg-scale-slider');
                if(slider) activeElement.style.backgroundSize = `${slider.value}%`;
            } else {
                if(bgScaleRow) bgScaleRow.style.display = 'none';
                activeElement.style.backgroundSize = e.target.value;
            }
        });
    }

    const bgScaleSlider = document.getElementById('bg-scale-slider');
    const bgScaleVal = document.getElementById('bg-scale-val');
    if (bgScaleSlider) {
        bgScaleSlider.addEventListener('input', e => {
            if (bgScaleVal) bgScaleVal.innerText = `${e.target.value}%`;
            if (!activeElement || activeElementType !== 'bg') return;
            if (bgSizeSelect && bgSizeSelect.value === 'custom') {
                activeElement.style.backgroundSize = `${e.target.value}%`;
            }
        });
    }

    if (bgRepeatSelect) {
        bgRepeatSelect.addEventListener('change', e => {
            if (!activeElement || activeElementType !== 'bg') return;
            activeElement.style.backgroundRepeat = e.target.value;
        });
    }
    bgGrad1.addEventListener('input', updateBgRender);
    bgGrad2.addEventListener('input', updateBgRender);
    bgOpacityRange.addEventListener('input', updateBgRender);

    bgBlurRange.addEventListener('input', e => {
        if (!activeElement || activeElementType !== 'bg') return;
        // Blur manipulado no pseudo layer da div (.bg-overlay)
        const overlay = activeElement.querySelector('.bg-overlay');
        if (overlay) overlay.style.backdropFilter = `blur(${e.target.value}px)`;
    });

    // --- Controladores de RestriÃ§Ã£o do Bloco (Box Margin e Borders) ---
    marginInput.addEventListener('input', e => applyStyle('margin', `${e.target.value}px`));
    paddingInput.addEventListener('input', e => applyStyle('padding', `${e.target.value}px`));
    borderRadiusInput.addEventListener('input', e => applyStyle('borderRadius', `${e.target.value}px`));

    borderStyleSelect.addEventListener('change', e => {
        applyStyle('borderStyle', e.target.value);
        if (e.target.value !== 'none' && !activeElement.style.borderWidth) applyStyle('borderWidth', '2px');
    });
    borderWidthInput.addEventListener('input', e => applyStyle('borderWidth', `${e.target.value}px`));

    borderColorType.addEventListener('change', e => {
        const type = e.target.value;
        if (activeElement) activeElement.dataset.borderType = type;

        document.getElementById('border-solid-controls').classList.toggle('hidden', type !== 'solid-color');
        document.getElementById('border-grad-controls').classList.toggle('hidden', type !== 'gradient');

        // Desativar radius base se gradiente
        if (type === 'gradient') {
            borderRadiusInput.disabled = true;
            borderRadiusInput.style.opacity = '0.4';
            borderStyleSelect.disabled = true;
            borderStyleSelect.style.opacity = '0.4';
            if (!isSyncing) applyStyle('borderStyle', 'solid'); // ForÃ§ar fallback visual
        } else {
            borderRadiusInput.disabled = false;
            borderRadiusInput.style.opacity = '1';
            borderStyleSelect.disabled = false;
            borderStyleSelect.style.opacity = '1';
            if (!isSyncing) {
                applyStyle('borderImage', 'none');
                applyStyle('borderStyle', borderStyleSelect.value); // Retorna a config original
            }
        }
        if (!isSyncing) updateBorderRender();
    });

    const updateBorderRender = () => {
        if (!activeElement) return;
        const type = borderColorType.value;
        if (type === 'gradient') {
            activeElement.style.borderImage = `linear-gradient(135deg, ${borderGrad1.value}, ${borderGrad2.value}) 1`;
        } else {
            activeElement.style.borderImage = 'none';
            activeElement.style.borderColor = borderColorInput.value;
        }
    };

    borderColorInput.addEventListener('input', updateBorderRender);
    borderGrad1.addEventListener('input', updateBorderRender);
    borderGrad2.addEventListener('input', updateBorderRender);

    const updatePositionRender = (e) => {
        if (!activeElement) return;

        if (e && e.target) {
            if (e.target === posXInput) posXRange.value = posXInput.value || 0;
            if (e.target === posYInput) posYRange.value = posYInput.value || 0;
            if (e.target === posXRange) posXInput.value = posXRange.value;
            if (e.target === posYRange) posYInput.value = posYRange.value;
        }

        const x = posXRange.value;
        const y = posYRange.value;
        activeElement.dataset.posX = x;
        activeElement.dataset.posY = y;
        activeElement.style.transform = `translate(${x}px, ${y}px)`;
        updateDragHandlePos();
    };

    posXRange.addEventListener('input', updatePositionRender);
    posYRange.addEventListener('input', updatePositionRender);
    if (posXInput) posXInput.addEventListener('input', updatePositionRender);
    if (posYInput) posYInput.addEventListener('input', updatePositionRender);


    // --- Engine de Upload de Foto ---
    uploadPanelBtn.addEventListener('click', () => imageInput.click());
    if (uploadImgPanelBtn) uploadImgPanelBtn.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && activeElement) {
            const reader = new FileReader();
            reader.onload = function (e) {
                if (activeElementType === 'image') {
                    activeElement.src = e.target.result;
                } else if (activeElementType === 'bg') {
                    bgTypeSelect.value = 'image';
                    // Reverte se estivesse gradient
                    document.getElementById('bg-image-controls').classList.remove('hidden');
                    document.getElementById('bg-color-controls').classList.add('hidden');
                    document.getElementById('bg-grad-controls').classList.add('hidden');

                    activeElement.style.backgroundImage = `url(${e.target.result})`;
                }
            };
            reader.readAsDataURL(file);
        }
        imageInput.value = '';
    });

    // --- Ajudantes Ãšteis ---
    function hexToRgba(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16) || 0;
        let g = parseInt(hex.slice(3, 5), 16) || 0;
        let b = parseInt(hex.slice(5, 7), 16) || 0;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function rgbToHex(rgb) {
        if (!rgb || rgb.startsWith('#')) return rgb || "#000000";
        // Suporta tanto rgb(..) quanto rgba(...)
        const result = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb);
        return result ? "#" +
            (1 << 24 | parseInt(result[1]) << 16 | parseInt(result[2]) << 8 | parseInt(result[3])).toString(16).slice(1)
            : "#000000";
    }

    function showFloatingBackButton() {
        let btn = document.getElementById('floating-back-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'floating-back-btn';
            btn.innerHTML = '<i class="fas fa-edit"></i> Back to Editing (Panel)';
            btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;background:#0ea5e9;color:white;border:none;padding:15px 25px;border-radius:30px;font-weight:bold;cursor:pointer;box-shadow: 0 4px 15px rgba(0,0,0,0.3);';
            btn.onclick = () => { toggleBtn.click(); btn.remove(); };
            document.body.appendChild(btn);
        }
    }

    // Add a global function to inject a subscribe button
    // --- Helper: extract YouTube video ID from any URL format ---
    function extractYouTubeId(url) {
        if (!url) return '';
        try {
            const u = new URL(url.trim());
            if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
            if (u.searchParams.get('v')) return u.searchParams.get('v');
        } catch(e) {}
        return url.trim(); // fallback: treat as raw ID
    }

    function loadYouTubeIframe(container, videoId, autoplay) {
        const placeholder = container.querySelector('.ipt-yt-placeholder');
        const iframeWrap = container.querySelector('.ipt-yt-iframe-wrap');
        if (placeholder) placeholder.style.display = 'none';
        if (iframeWrap) {
            iframeWrap.style.display = 'block';
            iframeWrap.innerHTML = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + videoId + '?autoplay=' + (autoplay?1:0) + '&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border-radius:inherit;"></iframe>';
        }
    }

    function resetYouTubeContainer(container) {
        const placeholder = container.querySelector('.ipt-yt-placeholder');
        const iframeWrap = container.querySelector('.ipt-yt-iframe-wrap');
        if (placeholder) placeholder.style.display = '';
        if (iframeWrap) { iframeWrap.style.display = 'none'; iframeWrap.innerHTML = ''; }
        container.dataset.ytUrl = '';
    }

    // --- Video Panel Controls ---
    if (applyVideoUrlBtn) {
        applyVideoUrlBtn.addEventListener('click', () => {
            if (!activeElement || activeElementType !== 'video') return;
            const url = videoUrlInput.value.trim();
            activeElement.dataset.ytUrl = url;
            if (url) {
                const vid = extractYouTubeId(url);
                if (vid) loadYouTubeIframe(activeElement, vid, false);
            }
        });
    }
    if (removeVideoUrlBtn) {
        removeVideoUrlBtn.addEventListener('click', () => {
            if (!activeElement || activeElementType !== 'video') return;
            resetYouTubeContainer(activeElement);
            if (videoUrlInput) videoUrlInput.value = '';
        });
    }
    function onVideoScaleChange(val) {
        if (!activeElement || activeElementType !== 'video') return;
        const v = Math.max(20, Math.min(200, parseInt(val) || 100));
        activeElement.dataset.videoScale = v;
        activeElement.style.width = v + '%';
        if (videoScaleRange) videoScaleRange.value = v;
        if (videoScaleInput) videoScaleInput.value = v;
    }
    if (videoScaleRange) videoScaleRange.addEventListener('input', e => onVideoScaleChange(e.target.value));
    if (videoScaleInput) videoScaleInput.addEventListener('change', e => onVideoScaleChange(e.target.value));
    if (videoBorderRadiusInput) {
        videoBorderRadiusInput.addEventListener('input', e => {
            if (!activeElement || activeElementType !== 'video') return;
            activeElement.style.borderRadius = (parseInt(e.target.value) || 0) + 'px';
        });
    }

    // --- Button injection: uses CSS centering (left:50% + translateX) ---
    // This ensures position is always consistent regardless of panel state,
    // because CSS percentages resolve against the content box, not the viewport.
    window.injectSubscribeButton = function() {
        if (!isEditMode) return;
        const container = document.getElementById('template-container');
        if (!container) return;

        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const containerRect = container.getBoundingClientRect();
        const topInContainer = scrollY - containerRect.top - window.scrollY + (window.innerHeight / 2);

        const btnWrap = document.createElement('div');
        btnWrap.className = 'editable-text';
        btnWrap.style.cssText = `position:absolute; top:${topInContainer}px; left:50%; transform:translateX(-50%); z-index:1000; display:inline-block; padding:15px 30px; background:#10b981; color:white; font-weight:bold; border-radius:30px; cursor:pointer; text-align:center; font-size:1.1rem; box-shadow:0 4px 6px rgba(0,0,0,0.1); text-decoration:none;`;
        btnWrap.innerText = 'SUBSCRIBE';
        btnWrap.dataset.isSubscribeBtn = "true";

        container.appendChild(btnWrap);
        if(typeof initDynamicEvents === 'function') initDynamicEvents();
        btnWrap.click();
    };

    window.injectViewModulesButton = function() {
        if (!isEditMode) return;
        const container = document.getElementById('template-container');
        if (!container) return;

        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const containerRect = container.getBoundingClientRect();
        const topInContainer = scrollY - containerRect.top - window.scrollY + (window.innerHeight / 2);

        const btnWrap = document.createElement('div');
        btnWrap.className = 'editable-text';
        btnWrap.style.cssText = `position:absolute; top:${topInContainer}px; left:50%; transform:translateX(-50%); z-index:1000; display:inline-block; padding:15px 30px; background:#4f46e5; color:white; font-weight:bold; border-radius:30px; cursor:pointer; text-align:center; font-size:1.1rem; box-shadow:0 4px 6px rgba(0,0,0,0.1); text-decoration:none;`;
        btnWrap.innerText = 'Open course';
        btnWrap.dataset.isViewModulesBtn = "true";

        container.appendChild(btnWrap);
        if(typeof initDynamicEvents === 'function') initDynamicEvents();
        btnWrap.click();
    };

});
