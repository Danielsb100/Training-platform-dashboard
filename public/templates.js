window.templatePresets = [
        {
        id: 'advanced-academy',
        name: 'AGENFOR Advanced Virtual Academy',
        thumb: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80',
        html: `
            <!-- Nav -->
            <section class="module-section" style="background-color: #cf9c33; padding: 15px 40px; display: flex; align-items: center; justify-content: space-between;">
                <div class="bg-overlay"></div>
                <div class="module-content" style="width: 100%; display: flex; justify-content: space-between;">
                    <div style="display:flex; align-items:center; gap:15px; color:white; font-weight:bold; font-size:1.2rem;">
                        <div class="editable-image-wrapper" onclick="triggerImageUpload('main-logo', 'src')" style="display: flex; align-items: center;">
                            <img src="https://placehold.co/40x40/ffffff/1e293b?text=Logo" id="main-logo" style="height: 25px; width: auto; object-fit: contain; border-radius: 4px; background: rgba(255,255,255,0.2); padding: 2px;">
                        </div>
                        <span class="editable-text">My Company</span>
                    </div>
                </div>
            </section>
            
            <!-- Header -->
            <section class="module-section" id="header-section" style="background: white; padding: 60px 40px; border-bottom: 1px solid #e2e8f0;">
                <div class="bg-overlay"></div>
                <button class="bg-edit-btn" onclick="triggerImageUpload('header-section', 'bg')">
                    <i class="fas fa-image"></i> Change BG
                </button>
                <div class="module-content" style="max-width: 1200px; margin: 0 auto; display: block;">
                    <h1 class="editable-text" style="color: #1e293b; font-size: 2.8rem; margin: 0; font-weight: 800;">My Main Title</h1>
                    <h2 class="editable-text" style="color: #cf9c33; font-size: 1.5rem; margin: 10px 0;">My Subtitle</h2>
                    <p class="editable-text" style="color: #64748b; font-size: 1.1rem; max-width: 800px; line-height: 1.6; font-weight: 600;">My detailed description of the platform or course objectives goes here. You can edit this text to suit your needs and provide an overview of your training.</p>
                </div>
            </section>

            <!-- Main Content & Methodology -->
            <section class="module-section" style="background-color: #f8fafc; padding: 40px;">
                <div class="bg-overlay"></div>
                <div class="module-content" style="max-width: 1200px; margin: 0 auto; display: flex; gap: 40px; flex-wrap: wrap;">
                    
                    <!-- Courses/Modules Grid -->
                    <div style="flex: 3; min-width: 300px;">
                        <h2 style="color: #1e293b; display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                            <i class="fas fa-layer-group" style="color: #cf9c33;"></i> <span class="editable-text">Cursos no Canal</span>
                        </h2>
                        <div id="courses-placeholder" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px;">
                            <div style="padding: 60px 20px; border: 2px dashed #cbd5e1; border-radius: 12px; text-align: center; color: #64748b; background: white;">
                                <i class="fas fa-layer-group" style="font-size: 3rem; margin-bottom: 15px; display: block; color: #e2e8f0;"></i>
                                <p>A grade de cursos aparecerá aqui na página final.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Methodology Sidebar -->
                    <div style="flex: 1; min-width: 300px;">
                        <div style="border: 2px solid #cf9c33; border-radius: 12px; padding: 25px; background: white;">
                            <h3 class="editable-text" style="color: #cf9c33; margin-top: 0; font-size: 1.2rem; font-weight: bold; margin-bottom: 20px;">OUR METHODOLOGY</h3>
                            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; color: #1e293b; font-size: 0.9rem; font-weight: 600;">
                                <li style="display:flex; gap:10px;"><span class="editable-text">Methodology point 1: Introduction to the core concepts.</span></li>
                                <li style="display:flex; gap:10px;"><span class="editable-text">Methodology point 2: Describe your approach.</span></li>
                                <li style="display:flex; gap:10px;"><span class="editable-text">Methodology point 3: Key objectives.</span></li>
                                <li style="display:flex; gap:10px;"><span class="editable-text">Methodology point 4: Strategic planning.</span></li>
                                <li style="display:flex; gap:10px;"><span class="editable-text">Methodology point 5: Implementation steps.</span></li>
                                <li style="display:flex; gap:10px;"><span class="editable-text">Methodology point 6: Practical applications.</span></li>
                                <li style="display:flex; gap:10px;"><span class="editable-text">Methodology point 7: Resources and tools.</span></li>
                                <li style="display:flex; gap:10px;"><span class="editable-text">Methodology point 8: Evaluation and feedback.</span></li>
                                <li style="display:flex; gap:10px;"><span class="editable-text">Methodology point 9: Final presentation and metrics.</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Dashboard -->
            <section class="module-section" style="background-color: #f8fafc; padding: 40px; border-top: 1px solid #e2e8f0;">
                <div class="bg-overlay"></div>
                <div class="module-content" style="max-width: 1200px; margin: 0 auto; display: flex; gap: 20px; flex-wrap: wrap;">
                    
                    <div class="stat-block" style="flex: 1; min-width: 250px; background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h4 class="editable-text" style="margin:0; font-size:1.1rem; color:#1e293b; font-weight:bold;">Performance Dashboard</h4>
                            <i class="fas fa-chart-line" style="color:#cf9c33;"></i>
                        </div>
                        <h3 class="editable-text" style="margin:0; font-size:1.8rem; color:#1e293b;">1,250</h3>
                        <p class="editable-text" style="margin:5px 0 0 0; font-size:0.9rem; color:#64748b;">Active Learners</p>
                    </div>

                    <div class="stat-block" style="flex: 1; min-width: 250px; background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h4 class="editable-text" style="margin:0; font-size:1.1rem; color:#1e293b; font-weight:bold;">Course Reminders</h4>
                            <i class="fas fa-bell" style="color:#cf9c33;"></i>
                        </div>
                        <ul style="list-style:none; padding:0; margin:0; font-size:0.9rem; color:#64748b; display:flex; flex-direction:column; gap:8px;">
                            <li><i class="far fa-square"></i> <span class="editable-text">Review assignments (12 pending)</span></li>
                            <li><i class="far fa-square"></i> <span class="editable-text">Upcoming live session (June 15th)</span></li>
                        </ul>
                    </div>

                    <div class="stat-block" style="flex: 1; min-width: 250px; background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h4 class="editable-text" style="margin:0; font-size:1.1rem; color:#1e293b; font-weight:bold;">Latest News</h4>
                            <i class="fas fa-newspaper" style="color:#cf9c33;"></i>
                        </div>
                        <ul style="list-style:none; padding:0; margin:0; font-size:0.9rem; color:#64748b; display:flex; flex-direction:column; gap:8px;">
                            <li><strong><span class="editable-text">New Module Added!</span></strong><br><small>15 Aug 2026</small></li>
                        </ul>
                    </div>

                </div>
            </section>

            <!-- Footer -->
            <section class="module-section" style="background: linear-gradient(to right, #1e293b 0%, #cf9c33 100%); padding: 40px; color: white;">
                <div class="bg-overlay"></div>
                <div class="module-content" style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px;">
                    <div style="flex: 1; min-width: 250px;">
                        <h3 class="editable-text" style="color: white; margin-top: 0; font-size:1.2rem;">Sobre Nós</h3>
                        <p class="editable-text" style="font-size: 0.9rem; opacity: 0.9; line-height:1.6;">Somos uma instituição dedicada a entregar o melhor conteúdo educacional. Nosso foco é democratizar o conhecimento através da tecnologia aberta.</p>
                    </div>
                    <div style="flex: 1; min-width: 250px;">
                        <h3 class="editable-text" style="color: white; margin-top: 0; font-size:1.2rem;">Contato</h3>
                        <p class="editable-text" style="font-size: 0.9rem; opacity: 0.9; line-height:1.6;">Email: contato@exemplo.com<br>Telefone: (11) 9999-9999<br>Endereço: Avenida Principal, 1000 - Centro</p>
                    </div>
                    <div style="flex: 1; min-width: 250px;">
                        <h3 class="editable-text" style="color: white; margin-top: 0; font-size:1.2rem;">Parceiros</h3>
                        <div style="display: flex; gap: 10px;">
                            <div class="editable-image-wrapper" onclick="triggerImageUpload('logo-footer-1', 'src')">
                                <img src="https://placehold.co/120x60/ffffff/1e293b?text=Logo+1" id="logo-footer-1" style="height: 50px; width: auto; object-fit: contain; background: white; padding: 5px; border-radius: 6px;">
                            </div>
                            <div class="editable-image-wrapper" onclick="triggerImageUpload('logo-footer-2', 'src')">
                                <img src="https://placehold.co/120x60/ffffff/1e293b?text=Logo+2" id="logo-footer-2" style="height: 50px; width: auto; object-fit: contain; background: white; padding: 5px; border-radius: 6px;">
                            </div>
                            <div class="editable-image-wrapper" onclick="triggerImageUpload('logo-footer-3', 'src')">
                                <img src="https://placehold.co/120x60/ffffff/1e293b?text=Logo+3" id="logo-footer-3" style="height: 50px; width: auto; object-fit: contain; background: white; padding: 5px; border-radius: 6px;">
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `
    },
    {
        id: "corporate",
        name: "Corporate PRO",
        thumb: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&q=80",
        html: `
            <style>html { scroll-behavior: smooth; }</style>
            <!-- HEADER -->
            <section class="module-section" style="background-color:#ffffff; padding:20px; align-items:center;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; width:100%;">
                    <div class="editable-image-wrapper" style="width:180px;"><img src="https://placehold.co/400x150/ffffff/0ea5e9?text=Corp+PRO" class="logo-img" style="border-radius:4px;"></div>
                    <div style="display:flex; gap:20px;">
                        <a href="#corp-hero" class="editable-text" style="font-weight:600; display:inline-block; color:inherit; text-decoration:none;">Home</a>
                        <a href="#corp-features" class="editable-text" style="font-weight:600; display:inline-block; color:inherit; text-decoration:none;">Services</a>
                        <a href="#corp-contact" class="editable-text" style="font-weight:600; display:inline-block; color:inherit; text-decoration:none;">Contact</a>
                    </div>
                </div>
            </section>

            <!-- HERO -->
            <section id="corp-hero" class="module-section" style="background-color:#f8fafc; min-height:80vh;">
                <div class="bg-overlay"></div>
                <div class="module-content" style="flex-direction:row; align-items:center;">
                    <div class="text-block" style="flex:1;">
                        <h1 class="editable-text" style="font-size:3.5rem; font-weight:800; color:#0f172a; line-height:1.1;">Transform your business with intelligence.</h1>
                        <p class="editable-text" style="font-size:1.2rem; color:#475569; margin:30px 0;">We offer innovative corporate solutions that multiply results and reduce operational costs.</p>
                        <div class="editable-text" style="display:inline-block; padding:15px 30px; background:#0ea5e9; color:#fff; font-weight:bold; border-radius:30px;">Talk to an Expert</div>
                        <div class="editable-text btn-subscribe" style="display:inline-block; padding:15px 30px; background:#cf982e; color:#fff; font-weight:bold; border-radius:30px; margin-left:15px; cursor:pointer;" onclick="alert('Inscrito com sucesso no curso!')">Inscrever-se no Curso</div>
                    </div>
                    <div class="editable-image-wrapper" style="flex:1;"><img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800" class="body-img" style="border-radius:20px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);"></div>
                </div>
            </section>

            <!-- LOGOS -->
            <section class="module-section" style="background-color:#ffffff; padding:40px 0; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; min-height:0;">
                <div class="module-content" style="flex-direction:column; align-items:center;">
                    <p class="editable-text" style="color:#94a3b8; font-weight:bold; letter-spacing:1px;">TRUSTED BY GLOBAL ENTERPRISES</p>
                    <div style="display:flex; gap:40px; margin-top:20px; flex-wrap:wrap; justify-content:center; opacity:0.6;">
                        <div class="editable-image-wrapper"><img src="https://placehold.co/200x80/ffffff/334155?text=Brand+A" style="height:60px;"></div>
                        <div class="editable-image-wrapper"><img src="https://placehold.co/200x80/ffffff/334155?text=Brand+B" style="height:60px;"></div>
                        <div class="editable-image-wrapper"><img src="https://placehold.co/200x80/ffffff/334155?text=Brand+C" style="height:60px;"></div>
                        <div class="editable-image-wrapper"><img src="https://placehold.co/200x80/ffffff/334155?text=Brand+D" style="height:60px;"></div>
                    </div>
                </div>
            </section>

            <!-- FEATURES -->
            <section id="corp-features" class="module-section" style="background-color:#f1f5f9; padding:80px 0;">
                <div class="module-content" style="flex-direction:column;">
                    <div class="text-block" style="text-align:center; max-width:600px; margin:0 auto 60px;">
                        <h1 class="editable-text" style="color:#0f172a;">What we deliver</h1>
                        <p class="editable-text" style="color:#64748b;">Our platform offers essential tools for your company to dominate the market.</p>
                    </div>
                    <div style="display:flex; gap:30px; flex-wrap:wrap;">
                        <!-- Feature 1 -->
                        <div style="flex:1; background:#ffffff; padding:40px; border-radius:12px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                            <div class="editable-text" style="font-size:2rem; color:#0ea5e9; margin-bottom:20px;">🛡️</div>
                            <h3 class="editable-text" style="font-size:1.5rem; margin-bottom:15px; color:#1e293b;">Maximum Security</h3>
                            <p class="editable-text" style="color:#475569;">Data protection with end-to-end encryption and full compliance.</p>
                        </div>
                        <!-- Feature 2 -->
                        <div style="flex:1; background:#ffffff; padding:40px; border-radius:12px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                            <div class="editable-text" style="font-size:2rem; color:#0ea5e9; margin-bottom:20px;">⚡</div>
                            <h3 class="editable-text" style="font-size:1.5rem; margin-bottom:15px; color:#1e293b;">High Performance</h3>
                            <p class="editable-text" style="color:#475569;">Fast and optimized systems ensuring zero slowdowns in your workflows.</p>
                        </div>
                        <!-- Feature 3 -->
                        <div style="flex:1; background:#ffffff; padding:40px; border-radius:12px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                            <div class="editable-text" style="font-size:2rem; color:#0ea5e9; margin-bottom:20px;">📈</div>
                            <h3 class="editable-text" style="font-size:1.5rem; margin-bottom:15px; color:#1e293b;">Scalability</h3>
                            <p class="editable-text" style="color:#475569;">Architecture ready to scale as your enterprise expands globally.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- STATS -->
            <section class="module-section" style="background-image:linear-gradient(135deg, #0ea5e9, #2563eb); color:white;">
                <div class="module-content" style="display:flex; justify-content:space-around; align-items:center; text-align:center;">
                    <div>
                        <h1 class="editable-text" style="font-size:4rem; margin-bottom:0;">500+</h1>
                        <p class="editable-text">Projects Delivered</p>
                    </div>
                    <div>
                        <h1 class="editable-text" style="font-size:4rem; margin-bottom:0;">98%</h1>
                        <p class="editable-text">Client Satisfaction</p>
                    </div>
                    <div>
                        <h1 class="editable-text" style="font-size:4rem; margin-bottom:0;">2M+</h1>
                        <p class="editable-text">Revenue Generated</p>
                    </div>
                </div>
            </section>

            <!-- FOOTER -->
            <footer id="corp-contact" class="module-section" style="background-color:#0f172a; color:#cbd5e1; margin-bottom:0;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:2;">
                        <h3 class="editable-text" style="color:white; margin-bottom:20px;">Corp PRO</h3>
                        <p class="editable-text" style="max-width:300px;">Transforming enterprises through digital innovation. Headquartered globally.</p>
                    </div>
                    <div style="flex:1;">
                        <h4 class="editable-text" style="color:white; margin-bottom:20px;">Useful Links</h4>
                        <p class="editable-text" style="margin-bottom:10px;">About Us</p>
                        <p class="editable-text" style="margin-bottom:10px;">Careers</p>
                        <p class="editable-text" style="margin-bottom:10px;">Terms of Use</p>
                    </div>
                    <div style="flex:1;">
                        <h4 class="editable-text" style="color:white; margin-bottom:20px;">Contact</h4>
                        <p class="editable-text" style="margin-bottom:10px;">contact@corppro.com</p>
                        <p class="editable-text" style="margin-bottom:10px;">1-800-123-4567</p>
                    </div>
                </div>
            </footer>
        `
    },
    {
        id: "global-commission",
        name: "Institution: Global Commission",
        thumb: "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=500&q=80",
        html: `
            <style>html { scroll-behavior: smooth; }</style>\n            <!-- TOP BAR -->
            <section class="module-section" style="background-color:#003399; padding:5px 20px; min-height:0;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; align-items:center;">
                    <div style="display:flex; gap:15px; font-size:0.75rem; color:#cbd5e1;">
                        <span class="editable-text">Official site of the Global Executive Commission</span>
                        <span class="editable-text">How do you know you're on a secure site?</span>
                    </div>
                    <div style="display:flex; gap:15px; font-size:0.8rem; color:white;">
                        <span class="editable-text">EN - English</span>
                        <span class="editable-text">Accessibility</span>
                    </div>
                </div>
            </section>

            <!-- MAIN HEADER -->
            <section class="module-section" style="background-color:#ffffff; padding:20px; border-bottom:1px solid #e2e8f0; align-items:center;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; width:100%;">
                    <div style="display:flex; align-items:center; gap:20px;">
                        <span class="editable-text" style="font-size:3rem; color:#003399;">🏛️</span>
                        <div>
                            <h2 class="editable-text" style="color:#003399; margin:0; font-family:'Arial', sans-serif; font-weight:900; letter-spacing:0.5px;">Executive Commission</h2>
                            <p class="editable-text" style="color:#64748b; font-size:0.9rem; margin:0;">Central Office for Transnational Policies</p>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:15px;">
                        <div style="display:flex; gap:20px; font-weight:600; font-size:0.95rem; color:#334155;">
                            <a href="#gc-strategy" class="editable-text" style="text-decoration:none; color:inherit;">Strategy and Policies</a>
                            <a href="#gc-work" class="editable-text" style="text-decoration:none; color:inherit;">The Commission at Work</a>
                            <a href="#gc-funding" class="editable-text" style="text-decoration:none; color:inherit;">Funding</a>
                            <a href="#gc-news" class="editable-text" style="text-decoration:none; color:inherit;">News and Documents</a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SUB NAVIGATION TABS -->
            <section id="gc-funding" class="module-section" style="background-color:#f8fafc; padding:0; border-bottom:3px solid #ffcc00; min-height:0;">
                <div class="module-content" style="flex-direction:row; gap:0;">
                    <div class="editable-text" style="padding:15px 30px; background:#ffffff; color:#003399; font-weight:bold; border-right:1px solid #e2e8f0; cursor:pointer;">Priorities for 2025-2029</div>
                    <div class="editable-text" style="padding:15px 30px; color:#475569; font-weight:600; border-right:1px solid #e2e8f0; cursor:pointer;">Global Green Deal</div>
                    <div class="editable-text" style="padding:15px 30px; color:#475569; font-weight:600; border-right:1px solid #e2e8f0; cursor:pointer;">Technology Regulation (AI Act)</div>
                </div>
            </section>

            <!-- COMPLEX HERO -->
            <section id="gc-strategy" class="module-section" style="background-color:#ffffff; padding:50px 0;">
                <div class="module-content" style="flex-direction:row; gap:40px; align-items:flex-start;">
                    <!-- Main News Story -->
                    <div style="flex:2;">
                        <span class="editable-text" style="color:#003399; font-weight:bold; font-size:0.85rem; text-transform:uppercase;">President's Highlight · April 24</span>
                        <h1 class="editable-text" style="font-size:2.5rem; font-weight:800; color:#1e293b; line-height:1.2; margin:15px 0;">Historic Agreement on the New Digital Market Law Finalized by Parliament</h1>
                        <p class="editable-text" style="font-size:1.1rem; color:#475569; line-height:1.6; margin-bottom:20px;">The Council adopted a common position to regulate internet gatekeepers, aiming to ensure fairer, more open digital markets with strict protection for free competition across Member States.</p>
                        
                        <div style="display:flex; gap:20px; margin-bottom:30px;">
                            <div class="editable-text" style="padding:10px 20px; background:#003399; color:white; font-weight:bold; border-radius:4px; font-size:0.9rem;">Read Press Release</div>
                            <div class="editable-text" style="padding:10px 20px; background:#f1f5f9; color:#0f172a; font-weight:bold; border-radius:4px; font-size:0.9rem;">View Official Document (PDF)</div>
                        </div>
                        
                        <div class="editable-image-wrapper"><img src="https://images.unsplash.com/photo-1541882198-46ba08061e38?w=900" class="body-img" style="border-radius:4px; height:350px;"></div>
                    </div>
                    
                    <!-- Sidebar Links & Quick Actions -->
                    <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:25px;">
                        <h3 class="editable-text" style="font-size:1.2rem; color:#003399; margin-bottom:20px; border-bottom:2px solid #e2e8f0; padding-bottom:10px;">Services by Topic</h3>
                        
                        <ul style="list-style:none; padding:0; margin:0;">
                            <li style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px dashed #cbd5e1;">
                                <h4 class="editable-text" style="font-size:1rem; color:#0f172a; margin-bottom:5px;">Taxes and Customs</h4>
                                <p class="editable-text" style="font-size:0.85rem; color:#64748b; margin:0;">VAT rules, intra-community trade, customs tariffs.</p>
                            </li>
                            <li style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px dashed #cbd5e1;">
                                <h4 class="editable-text" style="font-size:1rem; color:#0f172a; margin-bottom:5px;">Justice and Fundamental Rights</h4>
                                <p class="editable-text" style="font-size:0.85rem; color:#64748b; margin:0;">Common asylum system, rule of law, GDPR.</p>
                            </li>
                            <li style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px dashed #cbd5e1;">
                                <h4 class="editable-text" style="font-size:1rem; color:#0f172a; margin-bottom:5px;">Public Health</h4>
                                <p class="editable-text" style="font-size:0.85rem; color:#64748b; margin:0;">Medicines Agency, Health Data Space.</p>
                            </li>
                            <li>
                                <h4 class="editable-text" style="font-size:1rem; color:#0f172a; margin-bottom:5px;">Funding and Tenders</h4>
                                <p class="editable-text" style="font-size:0.85rem; color:#64748b; margin:0;">Opportunities and cohesion funds for enterprises.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- PUBLICATION DIRECTORY -->
            <section id="gc-news" class="module-section" style="background-color:#f1f5f9; padding:60px 0;">
                <div class="module-content" style="flex-direction:column;">
                    <h2 class="editable-text" style="font-size:1.8rem; color:#1e293b; margin-bottom:30px;">Guidelines and Legal Repository (Last 48h)</h2>
                    
                    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
                        <!-- Table Header -->
                        <div style="display:flex; background:#0f172a; color:white; padding:15px 20px; font-weight:bold; font-size:0.9rem;">
                            <div class="editable-text" style="flex:1;">DOC Reference</div>
                            <div class="editable-text" style="flex:3;">Title / Document Syllabus</div>
                            <div class="editable-text" style="flex:1;">Council</div>
                            <div class="editable-text" style="flex:1;">Adopted Date</div>
                            <div class="editable-text" style="width:80px; text-align:center;">Action</div>
                        </div>
                        
                        <!-- Row 1 -->
                        <div style="display:flex; padding:15px 20px; border-bottom:1px solid #e2e8f0; align-items:center;">
                            <div class="editable-text" style="flex:1; color:#003399; font-family:monospace; font-weight:bold;">COM(2026) 112</div>
                            <div class="editable-text" style="flex:3; color:#334155; padding-right:20px;">Directive on environmental impact assessments in rare earth mining complexes.</div>
                            <div class="editable-text" style="flex:1; color:#64748b; font-size:0.85rem;">Environment</div>
                            <div class="editable-text" style="flex:1; color:#64748b; font-size:0.85rem;">APR 24, 2026</div>
                            <div class="editable-text" style="width:80px; text-align:center; color:#0ea5e9; font-weight:bold; cursor:pointer;">[PDF]</div>
                        </div>
                        
                        <!-- Row 2 -->
                        <div style="display:flex; padding:15px 20px; border-bottom:1px solid #e2e8f0; background:#f8fafc; align-items:center;">
                            <div class="editable-text" style="flex:1; color:#003399; font-family:monospace; font-weight:bold;">REG/2026/089</div>
                            <div class="editable-text" style="flex:3; color:#334155; padding-right:20px;">Regulation for cross-border coordination of AI systems in health sectors.</div>
                            <div class="editable-text" style="flex:1; color:#64748b; font-size:0.85rem;">Technology</div>
                            <div class="editable-text" style="flex:1; color:#64748b; font-size:0.85rem;">APR 23, 2026</div>
                            <div class="editable-text" style="width:80px; text-align:center; color:#0ea5e9; font-weight:bold; cursor:pointer;">[PDF]</div>
                        </div>

                        <!-- Row 3 -->
                        <div style="display:flex; padding:15px 20px; align-items:center;">
                            <div class="editable-text" style="flex:1; color:#003399; font-family:monospace; font-weight:bold;">DEC/2026/401</div>
                            <div class="editable-text" style="flex:3; color:#334155; padding-right:20px;">Decision on the adequate level of personal data protection granted by regional laws.</div>
                            <div class="editable-text" style="flex:1; color:#64748b; font-size:0.85rem;">Justice</div>
                            <div class="editable-text" style="flex:1; color:#64748b; font-size:0.85rem;">APR 22, 2026</div>
                            <div class="editable-text" style="width:80px; text-align:center; color:#0ea5e9; font-weight:bold; cursor:pointer;">[PDF]</div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- COMMISSIONERS PROFILES -->
            <section id="gc-work" class="module-section" style="background-color:#ffffff; padding:60px 0; border-top:1px solid #e2e8f0;">
                <div class="module-content" style="flex-direction:column;">
                    <h2 class="editable-text" style="font-size:1.8rem; color:#1e293b; margin-bottom:30px; text-align:center;">Members of the College (2025-2029)</h2>
                    <div style="display:flex; gap:30px; justify-content:center;">
                        <div style="text-align:center; max-width:250px;">
                            <div class="editable-image-wrapper"><img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400" class="body-img" style="border-radius:50%; width:150px; height:150px; object-fit:cover; margin:0 auto 15px; border:3px solid #ffcc00; padding:3px;"></div>
                            <h4 class="editable-text" style="font-size:1.1rem; color:#0f172a; margin-bottom:5px;">Ursula von der L.</h4>
                            <p class="editable-text" style="font-size:0.9rem; color:#003399; font-weight:bold;">President</p>
                            <p class="editable-text" style="font-size:0.85rem; color:#64748b; margin-top:10px;">General Political Guidelines and Appointments.</p>
                        </div>
                        <div style="text-align:center; max-width:250px;">
                            <div class="editable-image-wrapper"><img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400" class="body-img" style="border-radius:50%; width:150px; height:150px; object-fit:cover; margin:0 auto 15px; border:3px solid #e2e8f0; padding:3px;"></div>
                            <h4 class="editable-text" style="font-size:1.1rem; color:#0f172a; margin-bottom:5px;">Josep B. Fontelles</h4>
                            <p class="editable-text" style="font-size:0.9rem; color:#003399; font-weight:bold;">High Representative</p>
                            <p class="editable-text" style="font-size:0.85rem; color:#64748b; margin-top:10px;">Foreign Policy and Collective Security.</p>
                        </div>
                        <div style="text-align:center; max-width:250px;">
                            <div class="editable-image-wrapper"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400" class="body-img" style="border-radius:50%; width:150px; height:150px; object-fit:cover; margin:0 auto 15px; border:3px solid #e2e8f0; padding:3px;"></div>
                            <h4 class="editable-text" style="font-size:1.1rem; color:#0f172a; margin-bottom:5px;">Margrethe Vestager</h4>
                            <p class="editable-text" style="font-size:0.9rem; color:#003399; font-weight:bold;">Vice-President</p>
                            <p class="editable-text" style="font-size:0.85rem; color:#64748b; margin-top:10px;">Fair Competition and Digital Transition.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- FOOTER -->
            <section class="module-section" style="background-color:#f8fafc; padding:40px 0; border-top:1px solid #cbd5e1;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; font-size:0.85rem; color:#475569;">
                    <div style="flex:1;">
                        <span class="editable-text" style="font-size:2rem; color:#003399;">🏛️ Global Commission</span>
                        <p class="editable-text" style="margin-top:15px; max-width:250px;">This site is the central inter-institutional platform serving as the direct link for public communication.</p>
                    </div>
                    <div style="flex:1;">
                        <h4 class="editable-text" style="color:#1e293b; margin-bottom:15px; font-weight:bold;">Discoveries</h4>
                        <p class="editable-text" style="margin-bottom:8px; cursor:pointer;">How Institutions work</p>
                        <p class="editable-text" style="margin-bottom:8px; cursor:pointer;">Priorities and Achievements</p>
                        <p class="editable-text" style="margin-bottom:8px; cursor:pointer;">The Legislative Process</p>
                    </div>
                    <div style="flex:1;">
                        <h4 class="editable-text" style="color:#1e293b; margin-bottom:15px; font-weight:bold;">Contact Us</h4>
                        <p class="editable-text" style="margin-bottom:8px; cursor:pointer;">Local Service Offices</p>
                        <p class="editable-text" style="margin-bottom:8px; cursor:pointer;">Toll-Free: 1-800 67 89</p>
                        <p class="editable-text" style="margin-bottom:8px; cursor:pointer;">Press Inquiry Forms</p>
                    </div>
                </div>
            </section>
        `
    },
    {
        id: "international-court",
        name: "Institution: International Court",
        thumb: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80",
        html: `
            <style>html { scroll-behavior: smooth; }</style>\n            <!-- HEADER -->
            <section class="module-section" style="background-color:#1c1917; padding:15px 30px; border-bottom:4px solid #78350f;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; align-items:center;">
                    <div style="display:flex; flex-direction:column;">
                        <h2 class="editable-text" style="margin:0; font-family:'Georgia', serif; font-size:2.5rem; color:#facc15; font-weight:normal; letter-spacing:1px;">SUPREME INTERNATIONAL COURT</h2>
                        <span class="editable-text" style="color:#a8a29e; font-size:0.9rem; font-family:'Georgia', serif; font-style:italic;">The Permanent Court of International Arbitration - The Hague</span>
                    </div>
                    <div style="display:flex; gap:30px; color:#f5f5f4; font-family:'Arial', sans-serif; font-size:0.95rem; font-weight:bold;">
                        <a href="#ic-court" class="editable-text" style="text-decoration:none; color:#facc15; text-transform:uppercase; border-bottom:2px solid #facc15; padding-bottom:5px;">The Court</a>
                        <a href="#ic-cases" class="editable-text" style="text-decoration:none; color:inherit; text-transform:uppercase;">Pending Cases</a>
                        <a href="#ic-jurisprudence" class="editable-text" style="text-decoration:none; color:inherit; text-transform:uppercase;">Jurisprudence</a>
                        <a href="#ic-publications" class="editable-text" style="text-decoration:none; color:inherit; text-transform:uppercase;">Publications</a>
                    </div>
                </div>
            </section>

            <!-- SUB HEADER DATA BAR -->
            <section class="module-section" style="background-color:#292524; padding:10px 30px; min-height:0;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; font-family:monospace; font-size:0.8rem; color:#d6d3d1;">
                    <span class="editable-text">Next Plenary Session: May 12, 2026</span>
                    <div style="display:flex; gap:20px;">
                        <span class="editable-text">Official Language: EN / FR</span>
                        <span class="editable-text">Case no. 402 ongoing</span>
                    </div>
                </div>
            </section>

            <!-- HERO -> LATEST RULING -->
            <section id="ic-jurisprudence" class="module-section" style="background-color:#fafaf9; padding:60px 0; border-bottom:1px solid #d6d3d1;">
                <div class="module-content" style="flex-direction:row; gap:50px;">
                    <div style="flex:3;">
                        <span class="editable-text" style="background:#78350f; color:white; padding:5px 10px; font-family:'Arial', sans-serif; font-size:0.8rem; font-weight:bold; letter-spacing:1px;">HISTORIC RULING HIGHLIGHT</span>
                        <h1 class="editable-text" style="font-family:'Georgia', serif; font-size:3rem; color:#1c1917; margin:20px 0; line-height:1.2;">Delimitation of the Continental Shelf and Joint Exploitation Agreements</h1>
                        <p class="editable-text" style="font-family:'Georgia', serif; font-size:1.2rem; color:#57534e; line-height:1.8; margin-bottom:30px;">The Court concluded that the equidistance principle must be mitigated in cases of severe coastal indentations, applying the principles of equity and proportionality established by the International Convention.</p>
                        <div style="display:flex; gap:20px; font-family:'Arial', sans-serif;">
                            <div class="editable-text" style="background:#1c1917; color:white; padding:12px 25px; font-weight:bold; cursor:pointer; font-size:0.9rem;">Download Full Judgment (PDF)</div>
                            <div class="editable-text" style="border:1px solid #1c1917; color:#1c1917; padding:12px 25px; font-weight:bold; cursor:pointer; font-size:0.9rem;">View Press Summary</div>
                        </div>
                    </div>
                    <div class="editable-image-wrapper" style="flex:2;">
                        <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800" class="body-img" style="border-radius:2px; filter:grayscale(30%); box-shadow:0 10px 30px rgba(0,0,0,0.1);">
                    </div>
                </div>
            </section>

            <!-- COURT CALENDAR / DOCKET -->
            <section id="ic-cases" class="module-section" style="background-color:#ffffff; padding:70px 0;">
                <div class="module-content" style="flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:40px; border-bottom:2px solid #1c1917; padding-bottom:15px;">
                        <h2 class="editable-text" style="font-family:'Georgia', serif; font-size:2rem; color:#1c1917; margin:0;">Hearing Docket (Public Document)</h2>
                        <span class="editable-text" style="font-family:'Arial', sans-serif; color:#78350f; font-weight:bold; text-decoration:underline;">View Complete File</span>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0;">
                        <!-- Docket Row 1 -->
                        <div style="display:flex; padding:25px; border:1px solid #e7e5e4; border-bottom:none; background:#fafaf9; transition:0.2s;">
                            <div style="flex:1;">
                                <p class="editable-text" style="font-family:monospace; color:#b45309; font-weight:bold; font-size:1rem; margin:0;">CASE 2026-11</p>
                                <p class="editable-text" style="font-family:'Arial', sans-serif; font-size:0.9rem; color:#57534e; margin-top:5px;">Started: Oct 02 2025</p>
                            </div>
                            <div style="flex:3; padding:0 20px;">
                                <h3 class="editable-text" style="font-family:'Georgia', serif; font-size:1.3rem; color:#1c1917; margin:0 0 10px 0;">Application of Incidental Provisional Measures: Commercial Dispute</h3>
                                <p class="editable-text" style="font-family:'Arial', sans-serif; font-size:1rem; color:#444; line-height:1.6; margin:0;">Oral hearing of the requesting Republic in response to the objections filed in memorandum by the other party concerning navigation rights.</p>
                            </div>
                            <div style="flex:1; text-align:right;">
                                <span class="editable-text" style="display:inline-block; padding:5px 10px; border:1px solid #78350f; color:#78350f; font-family:'Arial', sans-serif; font-size:0.8rem; font-weight:bold;">MAY 15 2026 - HEARINGS</span>
                            </div>
                        </div>

                        <!-- Docket Row 2 -->
                        <div style="display:flex; padding:25px; border:1px solid #e7e5e4; transition:0.2s;">
                            <div style="flex:1;">
                                <p class="editable-text" style="font-family:monospace; color:#b45309; font-weight:bold; font-size:1rem; margin:0;">CASE 2026-04</p>
                                <p class="editable-text" style="font-family:'Arial', sans-serif; font-size:0.9rem; color:#57534e; margin-top:5px;">Started: Jan 18 2026</p>
                            </div>
                            <div style="flex:3; padding:0 20px;">
                                <h3 class="editable-text" style="font-family:'Georgia', serif; font-size:1.3rem; color:#1c1917; margin:0 0 10px 0;">Administrative Issues Regarding Biosecurity Treaties</h3>
                                <p class="editable-text" style="font-family:'Arial', sans-serif; font-size:1rem; color:#444; line-height:1.6; margin:0;">Public reading of the summary of the advisory opinions requested and voted by the special committee of the chamber.</p>
                            </div>
                            <div style="flex:1; text-align:right;">
                                <span class="editable-text" style="display:inline-block; padding:5px 10px; background:#1c1917; color:white; font-family:'Arial', sans-serif; font-size:0.8rem; font-weight:bold;">MAY 22 2026 - RULING</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- JUDGES & ADMINISTRATION -->
            <section id="ic-court" class="module-section" style="background-color:#f5f5f4; padding:80px 0;">
                <div class="module-content" style="flex-direction:row; gap:40px;">
                    <div style="flex:1;">
                        <h2 class="editable-text" style="font-family:'Georgia', serif; font-size:1.8rem; color:#1c1917; margin-bottom:20px;">Composition of the Court</h2>
                        <p class="editable-text" style="font-family:'Arial', sans-serif; font-size:1rem; color:#57534e; line-height:1.6; margin-bottom:30px;">The Court is composed of 15 judges, elected for nine-year terms by the General Assembly and the United Nations Security Council.</p>
                        
                        <div style="display:flex; flex-direction:column; gap:15px;">
                            <!-- Judge Profile -->
                            <div style="display:flex; align-items:center; gap:20px; background:white; padding:15px; border:1px solid #e7e5e4;">
                                <div class="editable-image-wrapper" style="width:60px; height:60px;"><img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200" class="body-img" style="border-radius:50%; width:100%; height:100%; object-fit:cover; border:2px solid #d6d3d1;"></div>
                                <div>
                                    <h4 class="editable-text" style="font-family:'Arial', sans-serif; margin:0; font-size:1.1rem; color:#1c1917;">H.E. Judge Nawaf Salam</h4>
                                    <span class="editable-text" style="font-family:'Georgia', serif; font-size:0.9rem; color:#78350f; font-style:italic;">President of the Court</span>
                                </div>
                            </div>
                            <!-- Judge Profile -->
                            <div style="display:flex; align-items:center; gap:20px; background:white; padding:15px; border:1px solid #e7e5e4;">
                                <div class="editable-image-wrapper" style="width:60px; height:60px;"><img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200" class="body-img" style="border-radius:50%; width:100%; height:100%; object-fit:cover; border:2px solid #d6d3d1;"></div>
                                <div>
                                    <h4 class="editable-text" style="font-family:'Arial', sans-serif; margin:0; font-size:1.1rem; color:#1c1917;">H.E. Judge Julia Sebutinde</h4>
                                    <span class="editable-text" style="font-family:'Georgia', serif; font-size:0.9rem; color:#78350f; font-style:italic;">Vice-President of the Court</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="flex:1; border-left:1px solid #d6d3d1; padding-left:40px;">
                        <h2 class="editable-text" style="font-family:'Georgia', serif; font-size:1.8rem; color:#1c1917; margin-bottom:20px;">Basic Resources</h2>
                        <ul style="list-style-type:square; font-family:'Arial', sans-serif; color:#78350f; padding-left:20px; font-size:1.1rem;">
                            <li style="margin-bottom:15px;"><span class="editable-text" style="color:#292524;">Official Court Statute and Declarations</span></li>
                            <li style="margin-bottom:15px;"><span class="editable-text" style="color:#292524;">Rules of Court and Practice Directions</span></li>
                            <li style="margin-bottom:15px;"><span class="editable-text" style="color:#292524;">Manual Guides for Agents and States</span></li>
                            <li style="margin-bottom:15px;"><span class="editable-text" style="color:#292524;">Assembly Resolutions for Moot Cases</span></li>
                            <li style="margin-bottom:15px;"><span class="editable-text" style="color:#292524;">Employability Directory and Legal Internships</span></li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- FOOTER -->
            <section class="module-section" style="background-color:#1c1917; padding:40px 0; color:#a8a29e; font-family:'Arial', sans-serif; font-size:0.85rem;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between;">
                    <div style="flex:1;">
                        <h4 class="editable-text" style="color:white; margin-bottom:15px; font-family:'Georgia', serif;">Palais de la Paix</h4>
                        <p class="editable-text" style="margin-bottom:5px;">Carnegieplein 2</p>
                        <p class="editable-text" style="margin-bottom:5px;">2517 KJ The Hague</p>
                        <p class="editable-text" style="margin-bottom:5px;">The Netherlands</p>
                    </div>
                    <div style="flex:1;">
                        <h4 class="editable-text" style="color:white; margin-bottom:15px; font-family:'Georgia', serif;">Contact</h4>
                        <p class="editable-text" style="margin-bottom:5px;">+31 (0)70 302 23 23</p>
                        <p class="editable-text" style="margin-bottom:5px;">information@icj-cij.org</p>
                    </div>
                    <div style="flex:1; text-align:right;">
                        <p class="editable-text" style="display:inline-block; border:1px solid #78350f; color:#facc15; padding:10px 20px; font-weight:bold;">PUBLIC INFORMATION REGISTRY</p>
                        <p class="editable-text" style="margin-top:10px;">@ 2026 Permanent Court</p>
                    </div>
                </div>
            </section>
        `
    },
    {
        id: "human-rights-observatory",
        name: "NGO: Crisis Observatory",
        thumb: "ngo_crisis_thumb.png",
        html: `
            <style>html { scroll-behavior: smooth; }</style>\n            <!-- SENSITIVE ALERT TOP HEADER -->
            <section class="module-section" style="background-color:#991b1b; padding:10px; min-height:0;">
                <div class="module-content" style="flex-direction:row; justify-content:center;">
                    <p class="editable-text" style="color:white; font-family:'Arial', sans-serif; font-weight:bold; font-size:0.85rem; letter-spacing:0.5px; margin:0; text-align:center;">⚠ CONTENT WARNING: Reports on this platform describe severe fundamental rights violations, humanitarian crises, and armed conflict victims.</p>
                    <span class="editable-text" style="color:#fca5a5; font-size:0.85rem; cursor:pointer; text-decoration:underline; font-weight:bold;">[ Hide Alert ]</span>
                </div>
            </section>

            <!-- MAIN HEADER -->
            <section class="module-section" style="background-color:#171717; padding:25px; border-bottom:1px solid #404040;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; align-items:center;">
                    <div style="display:flex; flex-direction:column;">
                        <h2 class="editable-text" style="margin:0; font-family:'Arial', sans-serif; font-size:2rem; color:#f5f5f5; font-weight:900; text-transform:uppercase; letter-spacing:-0.5px;">Crisis Observatory</h2>
                        <span class="editable-text" style="color:#a3a3a3; font-size:0.85rem; font-family:'Arial', sans-serif;">Independent Monitoring of Immigration and Systemic Aggressions</span>
                    </div>
                    <div style="display:flex; gap:25px; color:#d4d4d4; font-family:'Arial', sans-serif; font-size:0.95rem; font-weight:bold;">
                        <a href="#ngo-research" class="editable-text" style="text-decoration:none; color:inherit;">Field Research</a>
                        <a href="#ngo-advocacy" class="editable-text" style="text-decoration:none; color:inherit;">Advocacy</a>
                        <a href="#ngo-zones" class="editable-text" style="text-decoration:none; color:inherit;">Monitored Zones</a>
                        <a href="#ngo-donate" class="editable-text" style="text-decoration:none; border:2px solid #ef4444; padding:5px 15px; color:#ef4444;">Donate Now</a>
                    </div>
                </div>
            </section>

            <!-- DASHBOARD HERO SENSITIVE DATA -->
            <section id="ngo-advocacy" class="module-section" style="background-color:#0a0a0a; padding:60px 0; color:white;">
                <div class="module-content" style="flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:40px; border-bottom:1px solid #262626; padding-bottom:20px;">
                        <div style="max-width:700px;">
                            <span class="editable-text" style="color:#ef4444; font-weight:bold; font-size:0.9rem; font-family:monospace; margin-bottom:10px; display:inline-block;">GLOBAL REPORT - Q2 2026</span>
                            <h1 class="editable-text" style="font-family:'Arial', sans-serif; font-size:3.5rem; font-weight:900; line-height:1; margin:0 0 20px 0;">The Invisible Tragedy on Maritime Routes</h1>
                            <p class="editable-text" style="font-size:1.1rem; color:#a3a3a3; line-height:1.7;">The current convergence of political crises in the east has caused an unprecedented migration shock. We analyze hundreds of testimonies from refugees facing illegal push-back policies in border seas.</p>
                        </div>
                        <div style="text-align:right;">
                            <p class="editable-text" style="color:#737373; font-family:monospace; margin-bottom:10px; font-size:0.85rem;">Current Reception Status in EU Zones:</p>
                            <h2 class="editable-text" style="color:#ef4444; font-size:4rem; font-weight:900; line-height:0.8; margin:0;">CRITICAL</h2>
                            <div class="editable-text" style="margin-top:20px; display:inline-block; border:1px solid #ef4444; color:#ef4444; padding:10px 20px; font-family:'Arial', sans-serif; font-weight:bold; font-size:0.9rem; cursor:pointer;">DOWNLOAD FULL DOSSIER</div>
                        </div>
                    </div>

                    <!-- STATISTICS DATA CARDS -->
                    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:20px; width:100%;">
                        <div style="background:#171717; padding:25px; border-left:3px solid #ef4444;">
                            <p class="editable-text" style="color:#a3a3a3; font-family:monospace; font-size:0.8rem; margin-bottom:5px;">REJECTION CASES</p>
                            <h3 class="editable-text" style="font-size:2rem; font-weight:900; margin:0; color:#f5f5f5;">14,502</h3>
                            <p class="editable-text" style="color:#ef4444; font-size:0.8rem; font-family:monospace; margin-top:10px;">▲ +12% vs. 2025</p>
                        </div>
                        <div style="background:#171717; padding:25px; border-left:3px solid #facc15;">
                            <p class="editable-text" style="color:#a3a3a3; font-family:monospace; font-size:0.8rem; margin-bottom:5px;">OVERCROWDED CAMPS</p>
                            <h3 class="editable-text" style="font-size:2rem; font-weight:900; margin:0; color:#f5f5f5;">38</h3>
                            <p class="editable-text" style="color:#a3a3a3; font-size:0.8rem; font-family:monospace; margin-top:10px;">Mediterranean Shores</p>
                        </div>
                        <div style="background:#171717; padding:25px; border-left:3px solid #ef4444;">
                            <p class="editable-text" style="color:#a3a3a3; font-family:monospace; font-size:0.8rem; margin-bottom:5px;">MINOR VICTIMS</p>
                            <h3 class="editable-text" style="font-size:2rem; font-weight:900; margin:0; color:#f5f5f5;">> 32%</h3>
                            <p class="editable-text" style="color:#a3a3a3; font-size:0.8rem; font-family:monospace; margin-top:10px;">Maximum Vulnerability</p>
                        </div>
                        <div style="background:#171717; padding:25px; border-left:3px solid #3b82f6;">
                            <p class="editable-text" style="color:#a3a3a3; font-family:monospace; font-size:0.8rem; margin-bottom:5px;">REQUIRED FUNDS</p>
                            <h3 class="editable-text" style="font-size:2rem; font-weight:900; margin:0; color:#f5f5f5;">€1.2B</h3>
                            <p class="editable-text" style="color:#a3a3a3; font-size:0.8rem; font-family:monospace; margin-top:10px;">Budget under EU debate</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- EXPOSE INVESTIGATION REPORT -->
            <section id="ngo-research" class="module-section" style="background-color:#171717; padding:80px 0; border-top:1px solid #262626;">
                <div class="module-content" style="flex-direction:row; gap:60px; align-items:center;">
                    <div class="editable-image-wrapper" style="flex:1;">
                        <img src="https://images.unsplash.com/photo-1542157585-ef20bfcce579?w=800" class="body-img" style="filter:grayscale(100%) contrast(1.2); border:1px solid #404040; border-radius:4px;">
                    </div>
                    <div style="flex:1;">
                        <h2 class="editable-text" style="font-family:'Arial', sans-serif; font-size:2rem; color:#f5f5f5; font-weight:bold; margin-bottom:20px;">The Structural Abandonment by the Migration Pact</h2>
                        <p class="editable-text" style="font-size:1.1rem; color:#d4d4d4; line-height:1.7; margin-bottom:20px; font-family:'Georgia', serif;">Laws passed under the veil of "national security" have practically generated a drastic erosion of the right to asylum. Our field investigators' analysis points to flagrant violations at borders where guidelines are intentionally misinterpreted.</p>
                        <p class="editable-text" style="font-size:1.1rem; color:#d4d4d4; line-height:1.7; margin-bottom:20px; font-family:'Georgia', serif;">Reports confiscated at the Hungarian border last Wednesday indicate that private militias are being outsourced to deal with groups of defectors, escaping the jurisdiction of the international court.</p>
                        <p class="editable-text" style="font-size:1rem; color:#a3a3a3; line-height:1.7; font-family:'Arial', sans-serif; border-left:3px solid #ef4444; padding-left:15px; background:#0a0a0a; padding:15px;">"The legislative and court infrastructure does not match what happens on the ground. Border agencies must not act as summary courts, sentencing refugees to the sea under secret emergency decrees." <br><br>— Chief Investigator, Report 14b</p>
                    </div>
                </div>
            </section>

            <!-- CRISIS MAP AND REGIONS -->
            <section id="ngo-zones" class="module-section" style="background-color:#0a0a0a; padding:80px 0; border-top:1px solid #262626;">
                <div class="module-content" style="flex-direction:row; gap:40px;">
                    <div style="flex:1; display:flex; flex-direction:column;">
                        <h2 class="editable-text" style="font-family:'Arial', sans-serif; font-size:1.8rem; color:#f5f5f5; margin-bottom:15px;">Active High-Risk Zones</h2>
                        <ul style="list-style:none; padding:0; margin:0; color:#d4d4d4;">
                            <li style="padding:15px; border-bottom:1px solid #262626; display:flex; justify-content:space-between;">
                                <span class="editable-text" style="font-weight:bold; color:#ef4444;">Balkan Corridor (Level 5)</span>
                                <span class="editable-text" style="font-family:monospace; color:#a3a3a3;">Closed</span>
                            </li>
                            <li style="padding:15px; border-bottom:1px solid #262626; display:flex; justify-content:space-between; background:#171717;">
                                <span class="editable-text" style="font-weight:bold; color:#facc15;">Central Med. (Level 4)</span>
                                <span class="editable-text" style="font-family:monospace; color:#a3a3a3;">Naval Patrol</span>
                            </li>
                            <li style="padding:15px; border-bottom:1px solid #262626; display:flex; justify-content:space-between;">
                                <span class="editable-text" style="font-weight:bold; color:#3b82f6;">Calais Border (Level 3)</span>
                                <span class="editable-text" style="font-family:monospace; color:#a3a3a3;">High Tension</span>
                            </li>
                        </ul>
                    </div>
                    <div style="flex:2; background:#171717; border:1px solid #404040; padding:30px; text-align:center;">
                        <div class="editable-image-wrapper"><img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800" class="body-img" style="filter:grayscale(100%) opacity(0.5); object-fit:cover; height:200px; width:100%;"></div>
                        <p class="editable-text" style="color:#737373; font-family:monospace; margin-top:20px;">[ Off-line Geo-Spatial Mapping System. Restricted to Tier-2 Donors ]</p>
                    </div>
                </div>
            </section>

            <!-- FOOTER -->
            <section id="ngo-donate" class="module-section" style="background-color:#000000; padding:40px 0; border-top:2px solid #991b1b;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; font-family:'Arial', sans-serif;">
                    <div style="flex:1;">
                        <h4 class="editable-text" style="color:#ef4444; margin-bottom:10px; font-weight:900;">CRISIS OBSERVATORY</h4>
                        <p class="editable-text" style="color:#737373; font-size:0.85rem; max-width:250px;">An international NGO of field investigators documenting structural aggressions for global justice.</p>
                    </div>
                    <div style="flex:1; color:#737373; font-size:0.85rem;">
                        <p class="editable-text" style="margin-bottom:5px;">Headquarters: Geneva, Switzerland</p>
                        <p class="editable-text" style="margin-bottom:5px;">Encrypted Comm Protocols: Available</p>
                    </div>
                    <div style="flex:1; text-align:right;">
                        <div class="editable-text" style="background:#ef4444; color:white; padding:10px 20px; display:inline-block; font-weight:bold; cursor:pointer;">SUBMIT ANONYMOUS TIP</div>
                    </div>
                </div>
            </section>
        `
    },
    {
        id: "saas-dark",
        name: "SaaS Dark Tech",
        thumb: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&q=80",
        html: `
            <style>html { scroll-behavior: smooth; }</style>\n            <!-- NAVBAR -->
            <section class="module-section" style="background-color:rgba(15,23,42,0.8); backdrop-filter:blur(10px); position:sticky; top:0; z-index:500; min-height:70px;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; align-items:center;">
                    <h2 class="editable-text text-white" style="margin:0; font-weight:800; font-size:1.5rem; letter-spacing:1px; color:#c084fc;">NEXUS<span style="color:white;">.API</span></h2>
                    <div style="display:flex; gap:30px; color:#cbd5e1;">
                        <a href="#saas-docs" class="editable-text" style="text-decoration:none; color:inherit;">Documentation</a>
                        <a href="#saas-pricing" class="editable-text" style="text-decoration:none; color:inherit;">Pricing</a>
                        <a href="#saas-changelog" class="editable-text" style="text-decoration:none; color:inherit;">Changelog</a>
                    </div>
                    <a href="#saas-dashboard" class="editable-text" style="text-decoration:none; background:#a855f7; color:white; padding:8px 20px; border-radius:6px; font-weight:bold;">Dashboard</a>
                </div>
            </section>

            <!-- HERO DARK -->
            <section id="saas-dashboard" class="module-section" style="background-color:#020617; overflow:hidden; position:relative; min-height:85vh;">
                <div class="bg-overlay" style="background:radial-gradient(circle at 50% -20%, #4c1d95 0%, transparent 70%);"></div>
                <div class="module-content" style="flex-direction:column; text-align:center; justify-content:center; padding-top:80px;">
                    <div class="editable-text" style="border:1px solid #334155; color:#94a3b8; padding:5px 15px; border-radius:30px; font-size:0.9rem; margin-bottom:30px; background:rgba(255,255,255,0.05);">✨ Nexus v3.5 Released! Multi-Region Support.</div>
                    <h1 class="editable-text text-white" style="font-size:5rem; font-weight:900; background:linear-gradient(to right, #e879f9, #a855f7, #6366f1); -webkit-background-clip:text; color:transparent; text-shadow:none; line-height:1.1;">The Backend of the Future,<br>Ready Today.</h1>
                    <p class="editable-text" style="font-size:1.5rem; color:#94a3b8; max-width:700px; margin:30px auto;">The definitive serverless infrastructure for exceptional products. Integrated, resilient, insanely scalable.</p>
                    
                    <div style="display:flex; gap:20px; justify-content:center; margin-top:20px; z-index:10;">
                        <div class="editable-text" style="padding:15px 40px; background:#8b5cf6; color:white; border-radius:8px; font-weight:bold; font-size:1.1rem; box-shadow:0 0 25px rgba(139,92,246,0.5);">Start Building Free</div>
                        <div class="editable-text" style="padding:15px 40px; background:transparent; color:#e2e8f0; border-radius:8px; font-weight:bold; font-size:1.1rem; border:1px solid #334155;">View Demo</div>
                    </div>
                </div>
            </section>

            <!-- METRIC AND CODE DISPLAY -->
            <section id="saas-changelog" class="module-section" style="background-color:#0f172a; border-top:1px solid #1e293b; padding:80px 0;">
                <div class="module-content" style="display:flex; justify-content:center; align-items:center;">
                    <div style="background:#020617; border:1px solid #334155; border-radius:12px; padding:25px; width:800px; box-shadow:0 25px 50px rgba(0,0,0,0.5); font-family:monospace; color:#38bdf8; font-size:1.1rem; text-align:left;">
                        <p style="color:#64748b; margin-bottom:15px;">// Initialize Nexus Client</p>
                        <p><span style="color:#f472b6;">import</span> { Nexus } <span style="color:#f472b6;">from</span> '@nexus/core';</p>
                        <br>
                        <p><span style="color:#f472b6;">const</span> client = <span style="color:#f472b6;">new</span> Nexus(process.env.NEXUS_KEY);</p>
                        <br>
                        <p style="color:#64748b;">// Insanely fast real-time sync</p>
                        <p><span style="color:#f472b6;">await</span> client.sync().watch('users', (data) => {</p>
                        <p>&nbsp;&nbsp;console.log("New User Connected:", data);</p>
                        <p>});</p>
                    </div>
                </div>
            </section>

            <!-- INFRASTRUCTURE GRAPHICS -->
            <section class="module-section" style="background-color:#020617; padding:90px 0;">
                <div class="module-content" style="flex-direction:row; align-items:center; gap:50px;">
                    <div style="flex:1;">
                        <h2 class="editable-text text-white" style="font-size:2.5rem; margin-bottom:20px;">Global Network. <br>Distributed Edge.</h2>
                        <p class="editable-text" style="color:#94a3b8; line-height:1.7; font-size:1.1rem; margin-bottom:30px;">We have POPs distributed in over 35 global locations. Your code and data will run adjacent to your users, reducing ping aggressively and improving throughput.</p>
                        <div class="editable-text" style="display:inline-block; font-weight:bold; color:#a855f7; border-bottom:1px solid #a855f7;">View Region Map -></div>
                    </div>
                    <div style="flex:1; background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:40px; display:flex; flex-direction:column; gap:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:10px;">
                            <span class="editable-text text-white">US-East (N. Virginia)</span>
                            <span class="editable-text" style="color:#10b981; font-family:monospace;">8ms</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:10px;">
                            <span class="editable-text text-white">EU-Central (Frankfurt)</span>
                            <span class="editable-text" style="color:#10b981; font-family:monospace;">12ms</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:10px;">
                            <span class="editable-text text-white">SA-East (São Paulo)</span>
                            <span class="editable-text" style="color:#10b981; font-family:monospace;">15ms</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="editable-text text-white">AP-Northeast (Tokyo)</span>
                            <span class="editable-text" style="color:#10b981; font-family:monospace;">22ms</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- FEATURES CARDS -->
            <section id="saas-docs" class="module-section" style="background-color:#0f172a; padding:100px 0;">
                <div class="module-content" style="flex-direction:column;">
                    <h2 class="editable-text text-white" style="font-size:3rem; text-align:center; margin-bottom:60px;">Everything you need in one API.</h2>
                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:30px; width:100%;">
                        <div style="background:#020617; border:1px solid #1e293b; padding:35px; border-radius:12px; transition:0.3s; box-shadow:inset 0 2px 0 #8b5cf6;">
                            <h3 class="editable-text text-white" style="font-size:1.5rem; margin-bottom:15px;">RT Database</h3>
                            <p class="editable-text" style="color:#94a3b8; line-height:1.6;">Managed real-time SQL and NoSQL databases. Less than 10ms latency guaranteed across Europe and the Americas.</p>
                        </div>
                        <div style="background:#020617; border:1px solid #1e293b; padding:35px; border-radius:12px; box-shadow:inset 0 2px 0 #ec4899;">
                            <h3 class="editable-text text-white" style="font-size:1.5rem; margin-bottom:15px;">Magic Auth</h3>
                            <p class="editable-text" style="color:#94a3b8; line-height:1.6;">OAuth 2.0, Passkeys and biometrics perfectly abstracted inside a 2 kilobyte SDK.</p>
                        </div>
                        <div style="background:#020617; border:1px solid #1e293b; padding:35px; border-radius:12px; box-shadow:inset 0 2px 0 #06b6d4;">
                            <h3 class="editable-text text-white" style="font-size:1.5rem; margin-bottom:15px;">Edge Functions</h3>
                            <p class="editable-text" style="color:#94a3b8; line-height:1.6;">Run your code firmly attached to your end users. Full support for Node.js, Python and Go.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- PRICING -->
            <section id="saas-pricing" class="module-section" style="background-color:#020617; padding:100px 0;">
                <div class="module-content" style="flex-direction:column; align-items:center;">
                    <h2 class="editable-text text-white" style="font-size:3rem; margin-bottom:50px; text-align:center;">Transparent Pricing, by Devs for Devs.</h2>
                    <div style="display:flex; gap:30px; max-width:900px; width:100%;">
                        <div style="flex:1; background:#0f172a; padding:40px; border-radius:16px; border:1px solid #334155; text-align:center;">
                            <h3 class="editable-text text-white" style="font-size:1.5rem; margin-bottom:10px;">Hobby</h3>
                            <p class="editable-text" style="font-size:3rem; font-weight:800; color:#fff;">Free</p>
                            <p class="editable-text" style="color:#94a3b8; margin:20px 0;">1 GB Database<br>10k Edge Invocations<br>Community Support</p>
                            <div class="editable-text" style="background:#334155; color:white; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:30px;">Deploy Now</div>
                        </div>
                        <div style="flex:1; background:linear-gradient(180deg, #2e1065, #1e1b4b); padding:40px; border-radius:16px; border:1px solid #a855f7; text-align:center; transform:scale(1.05); box-shadow:0 20px 40px rgba(0,0,0,0.5);">
                            <div class="editable-text" style="background:#a855f7; color:white; font-size:0.8rem; font-weight:bold; padding:4px 10px; border-radius:20px; display:inline-block; margin-bottom:15px;">MOST POPULAR</div>
                            <h3 class="editable-text text-white" style="font-size:1.5rem; margin-bottom:10px;">Pro</h3>
                            <p class="editable-text" style="font-size:3rem; font-weight:800; color:#a855f7;">$29<span style="font-size:1rem; color:#94a3b8;">/mo</span></p>
                            <p class="editable-text" style="color:#cbd5e1; margin:20px 0;">No API limits<br>Scalable Databases<br>Priority Ticket queue<br>Daily backups</p>
                            <div class="editable-text" style="background:#8b5cf6; color:white; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:20px;">Subscribe Pro</div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- FOOTER -->
            <section class="module-section" style="background-color:#0f172a; padding:50px 0; border-top:1px solid #1e293b;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:2;">
                        <h2 class="editable-text text-white" style="margin:0; font-weight:800; font-size:1.5rem; letter-spacing:1px; color:#c084fc;">NEXUS<span style="color:white;">.API</span></h2>
                        <p class="editable-text" style="color:#64748b; margin-top:10px; max-width:300px;">The tooling you need to conquer the web. Nexus delivers the best APIs tightly coupled with Vercel, Netlify and AWS.</p>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; gap:10px;">
                        <h4 class="editable-text text-white">Resources</h4>
                        <span class="editable-text" style="color:#94a3b8;">Documentation</span>
                        <span class="editable-text" style="color:#94a3b8;">CLI and SDKs</span>
                        <span class="editable-text" style="color:#94a3b8;">Open Source Examples</span>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; gap:10px;">
                        <h4 class="editable-text text-white">Company</h4>
                        <span class="editable-text" style="color:#94a3b8;">About Us</span>
                        <span class="editable-text" style="color:#94a3b8;">Careers</span>
                        <span class="editable-text" style="color:#94a3b8;">Blog</span>
                    </div>
                </div>
            </section>
        `
    },
    {
        id: "global-justice-legislation",
        name: "Institution: Global Justice & Legislation",
        thumb: "institution_justice_thumb.png",
        html: `
            <style>html { scroll-behavior: smooth; }</style>\n            <!-- TOP NOTIFIER BAR -->
            <section class="module-section" style="background-color:#0f172a; padding:8px 30px; min-height:0;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; color:#94a3b8; font-size:0.75rem; font-family:'Arial', sans-serif;">
                    <span class="editable-text">Official Global Legislative & Judiciary Public Record</span>
                    <span class="editable-text">English (UK) | Advanced Search | Contact Authority</span>
                </div>
            </section>

            <!-- MAIN HEADER -->
            <section class="module-section" style="background-color:#ffffff; padding:25px 30px; border-bottom:3px solid #b45309;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:20px;">
                        <span class="editable-text" style="font-size:3.5rem; color:#0f172a;">⚖️</span>
                        <div style="display:flex; flex-direction:column;">
                            <h2 class="editable-text" style="margin:0; font-family:'Georgia', serif; font-size:2.2rem; color:#0f172a; line-height:1.1;">Global Justice & Legislation</h2>
                            <span class="editable-text" style="color:#64748b; font-size:0.95rem; font-family:'Arial', sans-serif; letter-spacing:0.5px;">The Supreme Judiciary and Legislative Council combined records</span>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:15px; text-align:right;">
                        <div style="display:flex; gap:20px; font-weight:bold; font-family:'Arial', sans-serif; font-size:0.9rem; justify-content:flex-end;">
                            <a href="#gjl-court" class="editable-text" style="text-decoration:none; color:#0f172a;">Court Rulings</a>
                            <a href="#gjl-laws" class="editable-text" style="text-decoration:none; color:#0f172a;">Ratified Laws</a>
                            <a href="#gjl-debates" class="editable-text" style="text-decoration:none; color:#0f172a;">Plenary Debates</a>
                            <a href="#gjl-committees" class="editable-text" style="text-decoration:none; color:#0f172a;">Committees</a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- TABS MODULE -->
            <section id="gjl-debates" class="module-section" style="background-color:#f8fafc; padding:0; border-bottom:1px solid #e2e8f0; min-height:0;">
                <div class="module-content" style="flex-direction:row; gap:0;">
                    <div class="editable-text" style="padding:15px 30px; background:#b45309; color:white; font-weight:bold; border-right:1px solid #e2e8f0; cursor:pointer;">Latest Ratified Acts</div>
                    <div class="editable-text" style="padding:15px 30px; color:#475569; font-weight:600; border-right:1px solid #e2e8f0; cursor:pointer;">Scheduled Public Hearings</div>
                    <div class="editable-text" style="padding:15px 30px; color:#475569; font-weight:600; border-right:1px solid #e2e8f0; cursor:pointer;">Active Judiciary Cases</div>
                </div>
            </section>

            <!-- SPLIT BOARD HERO -->
            <section id="gjl-court" class="module-section" style="background-color:#ffffff; padding:50px 0;">
                <div class="module-content" style="flex-direction:row; gap:40px;">
                    <!-- Highlight Legal Event -->
                    <div style="flex:2;">
                        <span class="editable-text" style="color:#b45309; font-weight:bold; font-family:monospace; font-size:0.9rem;">ENACTMENT HIGHLIGHT // MAY 2026</span>
                        <h1 class="editable-text" style="font-family:'Georgia', serif; font-size:2.8rem; color:#0f172a; margin:15px 0; line-height:1.2;">Legislative Act 2026-X on Global Data Securities and AI Governance</h1>
                        <p class="editable-text" style="font-family:'Georgia', serif; font-size:1.15rem; color:#475569; line-height:1.7; margin-bottom:25px;">The general council has successfully passed the unified code for AI and distributed securities, heavily reforming the international civil framework and establishing the new Data Supreme Authority to handle upcoming juridical conflicts across all member nations.</p>
                        
                        <div style="display:flex; gap:15px;">
                            <div class="editable-text" style="background:#0f172a; color:white; padding:12px 25px; font-weight:bold; font-family:'Arial', sans-serif; font-size:0.9rem; cursor:pointer;">Download Ratified Bill (PDF)</div>
                            <div class="editable-text" style="border:1px solid #cbd5e1; color:#0f172a; padding:12px 25px; font-weight:bold; font-family:'Arial', sans-serif; font-size:0.9rem; cursor:pointer;">View Plenary Vote Tally</div>
                        </div>

                        <div style="margin-top:40px; display:flex; gap:20px;">
                            <div style="flex:1; border-top:2px solid #b45309; padding-top:15px;">
                                <h4 class="editable-text" style="font-family:'Georgia', serif; color:#0f172a; margin:0 0 10px 0;">Passed: 412 Yea, 10 Nay</h4>
                                <span class="editable-text" style="font-size:0.85rem; color:#64748b; font-family:'Arial', sans-serif;">Absolute Majority Reached</span>
                            </div>
                            <div style="flex:1; border-top:2px solid #0f172a; padding-top:15px;">
                                <h4 class="editable-text" style="font-family:'Georgia', serif; color:#0f172a; margin:0 0 10px 0;">Effective: Sep 01, 2026</h4>
                                <span class="editable-text" style="font-size:0.85rem; color:#64748b; font-family:'Arial', sans-serif;">Enforcement Date Confirmed</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar Judiciary Notice -->
                    <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; padding:30px;">
                        <h3 class="editable-text" style="font-family:'Georgia', serif; font-size:1.4rem; color:#b45309; margin-top:0; border-bottom:2px solid #e2e8f0; padding-bottom:15px;">Pending Supreme Sentences</h3>
                        
                        <div style="margin-top:20px; padding-bottom:15px; border-bottom:1px dashed #cbd5e1;">
                            <span class="editable-text" style="font-family:monospace; color:#0f172a; font-weight:bold; font-size:0.85rem;">DOCKET #994 - ANTI-TRUST</span>
                            <h4 class="editable-text" style="font-family:'Arial', sans-serif; font-size:1rem; color:#334155; margin:10px 0;">MegaSystems Inc. vs Regional Labor Commission</h4>
                            <span class="editable-text" style="font-size:0.85rem; color:#64748b;">Scheduled Ruling: June 5</span>
                        </div>
                        
                        <div style="margin-top:15px; padding-bottom:15px; border-bottom:1px dashed #cbd5e1;">
                            <span class="editable-text" style="font-family:monospace; color:#0f172a; font-weight:bold; font-size:0.85rem;">DOCKET #1022 - BORDER LAW</span>
                            <h4 class="editable-text" style="font-family:'Arial', sans-serif; font-size:1rem; color:#334155; margin:10px 0;">Republic of Genovia Maritime Extent Disputes</h4>
                            <span class="editable-text" style="font-size:0.85rem; color:#64748b;">Scheduled Ruling: June 12</span>
                        </div>

                        <div class="editable-text" style="margin-top:20px; text-align:center; color:#b45309; font-weight:bold; cursor:pointer; font-size:0.9rem;">View Full Calendar →</div>
                    </div>
                </div>
            </section>

            <!-- ULTRA DENSE DOCKET TABLE -->
            <section id="gjl-laws" class="module-section" style="background-color:#f1f5f9; padding:60px 0; border-top:1px solid #e2e8f0;">
                <div class="module-content" style="flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h2 class="editable-text" style="font-family:'Georgia', serif; font-size:1.8rem; color:#0f172a; margin:0;">Active Legislative Bills Registry</h2>
                        <div style="display:flex; gap:10px;">
                            <span class="editable-text" style="background:white; border:1px solid #cbd5e1; padding:5px 10px; font-size:0.8rem; font-weight:bold;">Filter by Topic</span>
                            <span class="editable-text" style="background:white; border:1px solid #cbd5e1; padding:5px 10px; font-size:0.8rem; font-weight:bold;">Filter by Status</span>
                        </div>
                    </div>

                    <div style="background:white; border:1px solid #cbd5e1; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">
                        <!-- Table Headers -->
                        <div style="display:flex; background:#0f172a; color:white; padding:15px 20px; font-family:'Arial', sans-serif; font-size:0.85rem; font-weight:bold;">
                            <div class="editable-text" style="flex:1;">ID / BILL REF</div>
                            <div class="editable-text" style="flex:4;">TITLE & LEGISLATIVE SUMMARY</div>
                            <div class="editable-text" style="flex:2;">COMMITTEE</div>
                            <div class="editable-text" style="flex:1;">STATUS</div>
                            <div class="editable-text" style="width:100px; text-align:center;">ACTIONS</div>
                        </div>

                        <!-- Table Row 1 -->
                        <div style="display:flex; padding:20px; border-bottom:1px solid #e2e8f0; align-items:center;">
                            <div class="editable-text" style="flex:1; font-family:monospace; color:#b45309; font-weight:bold; font-size:0.9rem;">HR-4052</div>
                            <div style="flex:4; padding-right:20px;">
                                <h4 class="editable-text" style="margin:0 0 5px 0; font-family:'Georgia', serif; font-size:1.1rem; color:#0f172a;">Energy grid sovereign interlink amendment</h4>
                                <p class="editable-text" style="margin:0; font-size:0.9rem; color:#64748b; line-height:1.4;">Proposition to standardize grid voltages and cross-border power sharing capabilities between members.</p>
                            </div>
                            <div class="editable-text" style="flex:2; font-size:0.9rem; color:#334155; font-weight:bold;">Infrastructure & Energy</div>
                            <div class="editable-text" style="flex:1;"><span style="background:#fef08a; color:#854d0e; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold;">IN REVIEW</span></div>
                            <div class="editable-text" style="width:100px; text-align:center; color:#0ea5e9; font-weight:bold; font-size:0.85rem; cursor:pointer;">[ READ ]</div>
                        </div>

                        <!-- Table Row 2 -->
                        <div style="display:flex; padding:20px; border-bottom:1px solid #e2e8f0; align-items:center; background:#f8fafc;">
                            <div class="editable-text" style="flex:1; font-family:monospace; color:#b45309; font-weight:bold; font-size:0.9rem;">SB-0991</div>
                            <div style="flex:4; padding-right:20px;">
                                <h4 class="editable-text" style="margin:0 0 5px 0; font-family:'Georgia', serif; font-size:1.1rem; color:#0f172a;">Fiscal Transparency and Anti-Evasion Acts</h4>
                                <p class="editable-text" style="margin:0; font-size:0.9rem; color:#64748b; line-height:1.4;">Mandates global reporting standards for offshore corporate entities exceeding 50M in gross annual revenue.</p>
                            </div>
                            <div class="editable-text" style="flex:2; font-size:0.9rem; color:#334155; font-weight:bold;">Finance & Economy</div>
                            <div class="editable-text" style="flex:1;"><span style="background:#bbf7d0; color:#166534; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold;">VOTING STAGE</span></div>
                            <div class="editable-text" style="width:100px; text-align:center; color:#0ea5e9; font-weight:bold; font-size:0.85rem; cursor:pointer;">[ READ ]</div>
                        </div>

                        <div style="padding:15px; text-align:center; cursor:pointer; background:#f1f5f9; color:#64748b; font-size:0.9rem; font-weight:bold;">
                            <span class="editable-text">Load Additional Records...</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- MEMBERS AND JURISDICTION -->
            <section id="gjl-committees" class="module-section" style="background-color:#ffffff; padding:80px 0;">
                <div class="module-content" style="flex-direction:row; gap:50px;">
                    <div style="flex:1;">
                        <h2 class="editable-text" style="font-family:'Georgia', serif; font-size:1.8rem; color:#0f172a; margin-bottom:25px;">Judiciary Leadership Profiles</h2>
                        <div style="display:flex; flex-direction:column; gap:20px;">
                            <div style="display:flex; gap:20px; align-items:center;">
                                <div class="editable-image-wrapper"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400" class="body-img" style="border-radius:50%; width:80px; height:80px; object-fit:cover; border:2px solid #cbd5e1;"></div>
                                <div>
                                    <h4 class="editable-text" style="margin:0 0 5px 0; font-size:1.1rem; color:#0f172a;">Hon. Arthur Kingsley</h4>
                                    <span class="editable-text" style="color:#b45309; font-size:0.9rem; font-family:'Georgia', serif;">Chief Justice of the Supreme Court</span>
                                </div>
                            </div>
                            <div style="display:flex; gap:20px; align-items:center;">
                                <div class="editable-image-wrapper"><img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400" class="body-img" style="border-radius:50%; width:80px; height:80px; object-fit:cover; border:2px solid #cbd5e1;"></div>
                                <div>
                                    <h4 class="editable-text" style="margin:0 0 5px 0; font-size:1.1rem; color:#0f172a;">Hon. Elena Rostova</h4>
                                    <span class="editable-text" style="color:#b45309; font-size:0.9rem; font-family:'Georgia', serif;">Head of the Economic Chambers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="flex:1; border-left:1px solid #e2e8f0; padding-left:50px;">
                        <h2 class="editable-text" style="font-family:'Georgia', serif; font-size:1.8rem; color:#0f172a; margin-bottom:25px;">Statutory Code Resources</h2>
                        <p class="editable-text" style="font-family:'Arial', sans-serif; font-size:1rem; color:#475569; line-height:1.6; margin-bottom:20px;">Quick access to procedural rules, ethical frameworks, and the constitution guidelines applied to state parties during open hearings.</p>
                        <ul style="list-style-type:none; padding:0; margin:0; font-family:'Arial', sans-serif; color:#0ea5e9;">
                            <li style="margin-bottom:10px; cursor:pointer;" class="editable-text">→ Official Procedural Guidelines</li>
                            <li style="margin-bottom:10px; cursor:pointer;" class="editable-text">→ Anti-Corruption Ethics Charter</li>
                            <li style="margin-bottom:10px; cursor:pointer;" class="editable-text">→ Archive of Public Transcripts</li>
                            <li style="cursor:pointer;" class="editable-text">→ Registry of Elected Representatives</li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- FOOTER -->
            <section class="module-section" style="background-color:#0f172a; padding:50px 0; border-top:5px solid #b45309;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; font-family:'Arial', sans-serif; color:#94a3b8; font-size:0.85rem;">
                    <div style="flex:1;">
                        <h3 class="editable-text" style="color:white; margin-bottom:15px; font-family:'Georgia', serif; font-size:1.3rem;">GLOBAL JUSTICE & LEGISLATION</h3>
                        <p class="editable-text" style="max-width:300px; line-height:1.6;">The integrated portal for transparency, democracy, and public hearings representation for the global state network.</p>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
                        <span class="editable-text" style="color:white; font-weight:bold; margin-bottom:5px;">Main Offices</span>
                        <span class="editable-text">International Legislation Hall, BLDG 4</span>
                        <span class="editable-text">700 Judicial Boulevard</span>
                        <span class="editable-text">Capital District, CD 10001</span>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; gap:8px; text-align:right;">
                        <span class="editable-text" style="color:white; font-weight:bold; margin-bottom:5px;">Contact Info</span>
                        <span class="editable-text">Phone: +1 (800) 555-0199</span>
                        <span class="editable-text">Clerk: clerk@globaljustice.gov</span>
                        <span class="editable-text" style="margin-top:15px;">© 2026 Council. All Rights Reserved.</span>
                    </div>
                </div>
            </section>
        `
    },
    {
        id: "agenfor-security",
        name: "Institution: AGENFOR Security",
        thumb: "agency_template_thumb_1777569867995.png",
        html: `
            <style>html { scroll-behavior: smooth; }</style>\n            <!-- TOP NOTIFIER BAR -->
            <section class="module-section" style="background-color:#334155; padding:8px 30px; min-height:0;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; color:#94a3b8; font-size:0.75rem; font-family:'Arial', sans-serif;">
                    <span class="editable-text">Official Global Legislative & Judiciary Public Record</span>
                    <span class="editable-text">English (UK) | Advanced Search | Contact Authority</span>
                </div>
            </section>

            <!-- MAIN HEADER -->
            <section class="module-section" style="background:linear-gradient(to right, #cf982e, #898d8d, #497aa7); padding:25px 30px; border-bottom:3px solid #d4af37;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:20px;">
                        <span class="editable-text" style="font-size:3.5rem; color:white;">🛡️</span>
                        <div style="display:flex; flex-direction:column;">
                            <h2 class="editable-text" style="margin:0; font-family:'Helvetica', 'Arial', sans-serif; font-size:2.2rem; color:white; line-height:1.1;">AGENFOR International</h2>
                            <span class="editable-text" style="color:#e2e8f0; font-size:0.95rem; font-family:'Arial', sans-serif; letter-spacing:0.5px;">Building Security Through Justice and Inclusion</span>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:15px; text-align:right;">
                        <div style="display:flex; gap:20px; font-weight:bold; font-family:'Arial', sans-serif; font-size:0.9rem; justify-content:flex-end;">
                            <a href="#gjl-court" class="editable-text" style="text-decoration:none; color:white;">About</a>
                            <a href="#gjl-laws" class="editable-text" style="text-decoration:none; color:white;">Services</a>
                            <a href="#gjl-debates" class="editable-text" style="text-decoration:none; color:white;">Database</a>
                            <a href="#gjl-committees" class="editable-text" style="text-decoration:none; color:white;">News</a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- TABS MODULE -->
            <section id="gjl-debates" class="module-section" style="background:linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0)); padding:0; border-bottom:1px solid #e2e8f0; min-height:0;">
                <div class="module-content" style="flex-direction:row; gap:0;">
                    <div class="editable-text" style="padding:15px 30px; background:#d4af37; color:white; font-weight:bold; border-right:1px solid #e2e8f0; cursor:pointer;">Latest Ratified Acts</div>
                    <div class="editable-text" style="padding:15px 30px; color:#475569; font-weight:600; border-right:1px solid #e2e8f0; cursor:pointer;">Scheduled Public Hearings</div>
                    <div class="editable-text" style="padding:15px 30px; color:#475569; font-weight:600; border-right:1px solid #e2e8f0; cursor:pointer;">Active Judiciary Cases</div>
                </div>
            </section>

            <!-- SPLIT BOARD HERO -->
            <section id="gjl-court" class="module-section" style="background-image:url(abstract_blue_bg_1777569899630.png); background-size:cover; padding:50px 0;">
                <div class="module-content" style="flex-direction:row; gap:40px;">
                    <!-- Highlight Legal Event -->
                    <div style="flex:2;">
                        <span class="editable-text" style="color:#d4af37; font-weight:bold; font-family:monospace; font-size:0.9rem;">ENACTMENT HIGHLIGHT // MAY 2026</span>
                        <h1 class="editable-text" style="font-family:'Helvetica', 'Arial', sans-serif; font-size:2.8rem; color:#334155; margin:15px 0; line-height:1.2;">Legislative Act 2026-X on Global Data Securities and AI Governance</h1>
                        <p class="editable-text" style="font-family:'Helvetica', 'Arial', sans-serif; font-size:1.15rem; color:#475569; line-height:1.7; margin-bottom:25px;">The general council has successfully passed the unified code for AI and distributed securities, heavily reforming the international civil framework and establishing the new Data Supreme Authority to handle upcoming juridical conflicts across all member nations.</p>
                        
                        <div style="display:flex; gap:15px;">
                            <div class="editable-text" style="background:#0f172a; color:white; padding:12px 25px; font-weight:bold; font-family:'Arial', sans-serif; font-size:0.9rem; cursor:pointer;">Download Ratified Bill (PDF)</div>
                            <div class="editable-text" style="border:1px solid #cbd5e1; color:#334155; padding:12px 25px; font-weight:bold; font-family:'Arial', sans-serif; font-size:0.9rem; cursor:pointer;">View Plenary Vote Tally</div>
                        </div>

                        <div style="margin-top:40px; display:flex; gap:20px;">
                            <div style="flex:1; border-top:2px solid #d4af37; padding-top:15px;">
                                <h4 class="editable-text" style="font-family:'Helvetica', 'Arial', sans-serif; color:#334155; margin:0 0 10px 0;">Passed: 412 Yea, 10 Nay</h4>
                                <span class="editable-text" style="font-size:0.85rem; color:#64748b; font-family:'Arial', sans-serif;">Absolute Majority Reached</span>
                            </div>
                            <div style="flex:1; border-top:2px solid #0f172a; padding-top:15px;">
                                <h4 class="editable-text" style="font-family:'Helvetica', 'Arial', sans-serif; color:#334155; margin:0 0 10px 0;">Effective: Sep 01, 2026</h4>
                                <span class="editable-text" style="font-size:0.85rem; color:#64748b; font-family:'Arial', sans-serif;">Enforcement Date Confirmed</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar Judiciary Notice -->
                    <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; padding:30px;">
                        <h3 class="editable-text" style="font-family:'Helvetica', 'Arial', sans-serif; font-size:1.4rem; color:#d4af37; margin-top:0; border-bottom:2px solid #e2e8f0; padding-bottom:15px;">Pending Supreme Sentences</h3>
                        
                        <div style="margin-top:20px; padding-bottom:15px; border-bottom:1px dashed #cbd5e1;">
                            <span class="editable-text" style="font-family:monospace; color:#334155; font-weight:bold; font-size:0.85rem;">DOCKET #994 - ANTI-TRUST</span>
                            <h4 class="editable-text" style="font-family:'Arial', sans-serif; font-size:1rem; color:#334155; margin:10px 0;">MegaSystems Inc. vs Regional Labor Commission</h4>
                            <span class="editable-text" style="font-size:0.85rem; color:#64748b;">Scheduled Ruling: June 5</span>
                        </div>
                        
                        <div style="margin-top:15px; padding-bottom:15px; border-bottom:1px dashed #cbd5e1;">
                            <span class="editable-text" style="font-family:monospace; color:#334155; font-weight:bold; font-size:0.85rem;">DOCKET #1022 - BORDER LAW</span>
                            <h4 class="editable-text" style="font-family:'Arial', sans-serif; font-size:1rem; color:#334155; margin:10px 0;">Republic of Genovia Maritime Extent Disputes</h4>
                            <span class="editable-text" style="font-size:0.85rem; color:#64748b;">Scheduled Ruling: June 12</span>
                        </div>

                        <div class="editable-text" style="margin-top:20px; text-align:center; color:#d4af37; font-weight:bold; cursor:pointer; font-size:0.9rem;">View Full Calendar →</div>
                    </div>
                </div>
            </section>

            <!-- ULTRA DENSE DOCKET TABLE -->
            <section id="gjl-laws" class="module-section" style="background-color:#f1f5f9; padding:60px 0; border-top:1px solid #e2e8f0;">
                <div class="module-content" style="flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h2 class="editable-text" style="font-family:'Helvetica', 'Arial', sans-serif; font-size:1.8rem; color:#334155; margin:0;">Active Legislative Bills Registry</h2>
                        <div style="display:flex; gap:10px;">
                            <span class="editable-text" style="background:white; border:1px solid #cbd5e1; padding:5px 10px; font-size:0.8rem; font-weight:bold;">Filter by Topic</span>
                            <span class="editable-text" style="background:white; border:1px solid #cbd5e1; padding:5px 10px; font-size:0.8rem; font-weight:bold;">Filter by Status</span>
                        </div>
                    </div>

                    <div style="background:white; border:1px solid #cbd5e1; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">
                        <!-- Table Headers -->
                        <div style="display:flex; background:#0f172a; color:white; padding:15px 20px; font-family:'Arial', sans-serif; font-size:0.85rem; font-weight:bold;">
                            <div class="editable-text" style="flex:1;">ID / BILL REF</div>
                            <div class="editable-text" style="flex:4;">TITLE & LEGISLATIVE SUMMARY</div>
                            <div class="editable-text" style="flex:2;">COMMITTEE</div>
                            <div class="editable-text" style="flex:1;">STATUS</div>
                            <div class="editable-text" style="width:100px; text-align:center;">ACTIONS</div>
                        </div>

                        <!-- Table Row 1 -->
                        <div style="display:flex; padding:20px; border-bottom:1px solid #e2e8f0; align-items:center;">
                            <div class="editable-text" style="flex:1; font-family:monospace; color:#d4af37; font-weight:bold; font-size:0.9rem;">HR-4052</div>
                            <div style="flex:4; padding-right:20px;">
                                <h4 class="editable-text" style="margin:0 0 5px 0; font-family:'Helvetica', 'Arial', sans-serif; font-size:1.1rem; color:#334155;">Energy grid sovereign interlink amendment</h4>
                                <p class="editable-text" style="margin:0; font-size:0.9rem; color:#64748b; line-height:1.4;">Proposition to standardize grid voltages and cross-border power sharing capabilities between members.</p>
                            </div>
                            <div class="editable-text" style="flex:2; font-size:0.9rem; color:#334155; font-weight:bold;">Infrastructure & Energy</div>
                            <div class="editable-text" style="flex:1;"><span style="background:#fef08a; color:#854d0e; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold;">IN REVIEW</span></div>
                            <div class="editable-text" style="width:100px; text-align:center; color:#0ea5e9; font-weight:bold; font-size:0.85rem; cursor:pointer;">[ READ ]</div>
                        </div>

                        <!-- Table Row 2 -->
                        <div style="display:flex; padding:20px; border-bottom:1px solid #e2e8f0; align-items:center; background:#f8fafc;">
                            <div class="editable-text" style="flex:1; font-family:monospace; color:#d4af37; font-weight:bold; font-size:0.9rem;">SB-0991</div>
                            <div style="flex:4; padding-right:20px;">
                                <h4 class="editable-text" style="margin:0 0 5px 0; font-family:'Helvetica', 'Arial', sans-serif; font-size:1.1rem; color:#334155;">Fiscal Transparency and Anti-Evasion Acts</h4>
                                <p class="editable-text" style="margin:0; font-size:0.9rem; color:#64748b; line-height:1.4;">Mandates global reporting standards for offshore corporate entities exceeding 50M in gross annual revenue.</p>
                            </div>
                            <div class="editable-text" style="flex:2; font-size:0.9rem; color:#334155; font-weight:bold;">Finance & Economy</div>
                            <div class="editable-text" style="flex:1;"><span style="background:#bbf7d0; color:#166534; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold;">VOTING STAGE</span></div>
                            <div class="editable-text" style="width:100px; text-align:center; color:#0ea5e9; font-weight:bold; font-size:0.85rem; cursor:pointer;">[ READ ]</div>
                        </div>

                        <div style="padding:15px; text-align:center; cursor:pointer; background:#f1f5f9; color:#64748b; font-size:0.9rem; font-weight:bold;">
                            <span class="editable-text">Load Additional Records...</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- MEMBERS AND JURISDICTION -->
            <section id="gjl-committees" class="module-section" style="background-color:#ffffff; padding:80px 0;">
                <div class="module-content" style="flex-direction:row; gap:50px;">
                    <div style="flex:1;">
                        <h2 class="editable-text" style="font-family:'Helvetica', 'Arial', sans-serif; font-size:1.8rem; color:#334155; margin-bottom:25px;">Judiciary Leadership Profiles</h2>
                        <div style="display:flex; flex-direction:column; gap:20px;">
                            <div style="display:flex; gap:20px; align-items:center;">
                                <div class="editable-image-wrapper"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400" class="body-img" style="border-radius:50%; width:80px; height:80px; object-fit:cover; border:2px solid #cbd5e1;"></div>
                                <div>
                                    <h4 class="editable-text" style="margin:0 0 5px 0; font-size:1.1rem; color:#334155;">Hon. Arthur Kingsley</h4>
                                    <span class="editable-text" style="color:#d4af37; font-size:0.9rem; font-family:'Helvetica', 'Arial', sans-serif;">Chief Justice of the Supreme Court</span>
                                </div>
                            </div>
                            <div style="display:flex; gap:20px; align-items:center;">
                                <div class="editable-image-wrapper"><img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400" class="body-img" style="border-radius:50%; width:80px; height:80px; object-fit:cover; border:2px solid #cbd5e1;"></div>
                                <div>
                                    <h4 class="editable-text" style="margin:0 0 5px 0; font-size:1.1rem; color:#334155;">Hon. Elena Rostova</h4>
                                    <span class="editable-text" style="color:#d4af37; font-size:0.9rem; font-family:'Helvetica', 'Arial', sans-serif;">Head of the Economic Chambers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="flex:1; border-left:1px solid #e2e8f0; padding-left:50px;">
                        <h2 class="editable-text" style="font-family:'Helvetica', 'Arial', sans-serif; font-size:1.8rem; color:#334155; margin-bottom:25px;">Statutory Code Resources</h2>
                        <p class="editable-text" style="font-family:'Arial', sans-serif; font-size:1rem; color:#475569; line-height:1.6; margin-bottom:20px;">Quick access to procedural rules, ethical frameworks, and the constitution guidelines applied to state parties during open hearings.</p>
                        <ul style="list-style-type:none; padding:0; margin:0; font-family:'Arial', sans-serif; color:#0ea5e9;">
                            <li style="margin-bottom:10px; cursor:pointer;" class="editable-text">→ Official Procedural Guidelines</li>
                            <li style="margin-bottom:10px; cursor:pointer;" class="editable-text">→ Anti-Corruption Ethics Charter</li>
                            <li style="margin-bottom:10px; cursor:pointer;" class="editable-text">→ Archive of Public Transcripts</li>
                            <li style="cursor:pointer;" class="editable-text">→ Registry of Elected Representatives</li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- FOOTER -->
            <section class="module-section" style="background-color:#334155; padding:50px 0; border-top:5px solid #d4af37;">
                <div class="module-content" style="flex-direction:row; justify-content:space-between; font-family:'Arial', sans-serif; color:#94a3b8; font-size:0.85rem;">
                    <div style="flex:1;">
                        <h3 class="editable-text" style="color:white; margin-bottom:15px; font-family:'Helvetica', 'Arial', sans-serif; font-size:1.3rem;">GLOBAL JUSTICE & LEGISLATION</h3>
                        <p class="editable-text" style="max-width:300px; line-height:1.6;">The integrated portal for transparency, democracy, and public hearings representation for the global state network.</p>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
                        <span class="editable-text" style="color:white; font-weight:bold; margin-bottom:5px;">Main Offices</span>
                        <span class="editable-text">International Legislation Hall, BLDG 4</span>
                        <span class="editable-text">700 Judicial Boulevard</span>
                        <span class="editable-text">Capital District, CD 10001</span>
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; gap:8px; text-align:right;">
                        <span class="editable-text" style="color:white; font-weight:bold; margin-bottom:5px;">Contact Info</span>
                        <span class="editable-text">Phone: +1 (800) 555-0199</span>
                        <span class="editable-text">Clerk: clerk@globaljustice.gov</span>
                        <span class="editable-text" style="margin-top:15px;">© 2026 Council. All Rights Reserved.</span>
                    </div>
                </div>
            </section>
        `
    },
    {
        id: "phygital-oc-new",
        name: "Project Phygital-OC",
        thumb: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
        html: `<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',sans-serif;background:#f0f4f8;color:#1e293b;}
.page{width:100%;margin:0 auto;background:#fff;}

/* HEADER */
.header{display:flex;align-items:center;justify-content:center;gap:18px;padding:12px 30px;background:#fff;border-bottom:1px solid #e2e8f0;flex-wrap:wrap;}
.header .logo-block{display:flex;align-items:center;gap:8px;}
.header .logo-block svg{width:28px;height:28px;}
.header .logo-block span{font-weight:900;font-size:0.7rem;color:#0f172a;text-transform:uppercase;line-height:1.1;}
.header img{height:28px;}
.header .partner-text{font-weight:700;font-size:0.65rem;color:#475569;text-transform:uppercase;letter-spacing:0.5px;}

/* HERO */
.hero{background:linear-gradient(135deg,#001a2e 0%,#003d5c 40%,#006b6b 100%);position:relative;padding:60px 50px 140px 50px;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80') center/cover;opacity:0.25;mix-blend-mode:screen;}
.hero-inner{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:40px;}
.hero-content{flex:1;}
.hero-logo{flex-shrink:0;max-width:350px;}
.hero-logo img{width:100%;height:auto;object-fit:contain;filter:drop-shadow(1px 1px 0px #fff) drop-shadow(-1px -1px 0px #fff) drop-shadow(1px -1px 0px #fff) drop-shadow(-1px 1px 0px #fff) drop-shadow(0px 0px 8px rgba(255,255,255,0.5));}
.hero h1{color:#fff;font-size:2.5rem;font-weight:900;letter-spacing:-1px;margin-bottom:4px;}
.hero h2{color:#22d3ee;font-size:1.6rem;font-weight:800;margin-bottom:18px;letter-spacing:-0.5px;}
.hero p{color:#cbd5e1;font-size:0.95rem;max-width:550px;line-height:1.6;margin-bottom:24px;border-left:3px solid #22d3ee;padding-left:14px;}
.hero-btn{display:inline-flex;align-items:center;gap:12px;background:#0f172a;color:#fff;padding:10px 28px;border-radius:50px;border:2px solid #06b6d4;font-weight:800;font-size:0.85rem;text-transform:uppercase;text-decoration:none;box-shadow:0 0 20px rgba(6,182,212,0.4);letter-spacing:0.5px;}

/* FEATURES */
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:0 30px;margin-top:-90px;position:relative;z-index:20;}
.f-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;display:flex;gap:12px;box-shadow:0 8px 25px rgba(0,0,0,0.08);border-top:3px solid #0891b2;}
.f-icon{width:44px;height:44px;background:#e0f2fe;border:2px solid #7dd3fc;display:flex;align-items:center;justify-content:center;font-size:1.3rem;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);flex-shrink:0;}
.f-card h3{font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;}
.f-card ul{font-size:0.78rem;color:#475569;padding-left:16px;margin:0;line-height:1.6;}

/* MISSION */
.mission{padding:50px 30px;text-align:center;}
.mission>h2{font-size:1.8rem;font-weight:900;color:#0f172a;margin-bottom:30px;text-transform:uppercase;}
.mission-grid{display:flex;gap:20px;align-items:center;}
.mission-col{flex:1;display:flex;flex-direction:column;gap:16px;text-align:left;}
.m-card{background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px;}
.m-card h4{font-weight:800;font-size:0.9rem;color:#0f172a;margin-bottom:6px;}
.m-card p{font-size:0.78rem;color:#475569;line-height:1.5;}
.mission-center{flex:1.1;display:flex;justify-content:center;}
.mission-center img{width:100%;max-width:320px;border-radius:10px;box-shadow:0 15px 30px rgba(0,0,0,0.12);}

/* JOURNEY */
.journey{padding:50px 30px 60px;background:#f1f5f9;position:relative;overflow:hidden;}
.journey-header{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:30px;}
.journey-header .j-ico{width:36px;height:36px;background:#0f172a;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1rem;}
.journey-header h2{font-size:1.8rem;font-weight:900;color:#0f172a;}
.journey-body{position:relative;min-height:750px;}

/* SVG Pipeline */
.journey-body svg.pipe{position:absolute;top:0;left:50%;transform:translateX(-50%);width:700px;height:750px;z-index:1;}

/* Downloads sidebar */
.dl-sidebar{position:absolute;left:0;top:60px;width:180px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,0.05);}
.dl-sidebar h4{font-size:0.8rem;font-weight:800;margin-bottom:8px;color:#0f172a;}
.dl-sidebar ul{list-style:none;font-size:0.68rem;color:#0284c7;line-height:2;}

/* Step nodes */
.step{position:absolute;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;width:280px;z-index:10;box-shadow:0 6px 18px rgba(0,0,0,0.06);}
.step h4{font-weight:800;font-size:0.95rem;color:#0f172a;margin-bottom:4px;}
.step p{font-size:0.75rem;color:#475569;line-height:1.45;}
.hex{position:absolute;width:40px;height:40px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:1rem;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);z-index:15;}

/* AI AVATAR */
.avatar-section{padding:50px 30px;background:#fff;}
.avatar-section>h2{text-align:center;font-size:1.8rem;font-weight:900;color:#0f172a;margin-bottom:35px;}
.avatar-grid{display:flex;align-items:center;gap:40px;justify-content:center;}
.avatar-img{position:relative;width:260px;flex-shrink:0;}
.avatar-img img{width:100%;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.1);position:relative;z-index:5;}
.avatar-img::before{content:'';position:absolute;inset:-8px;border:2px dashed #22d3ee;border-radius:16px;z-index:0;}
.avatar-feats{display:grid;grid-template-columns:1fr 1fr;gap:22px;flex:1;}
.av-f{display:flex;gap:10px;}
.av-f .ico{font-size:1.3rem;color:#06b6d4;flex-shrink:0;margin-top:2px;}
.av-f h4{font-weight:800;font-size:0.9rem;color:#0f172a;margin-bottom:3px;}
.av-f p{font-size:0.75rem;color:#475569;line-height:1.4;}
.mic{width:55px;height:55px;background:#fff;border:2px solid #22d3ee;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#06b6d4;box-shadow:0 0 20px rgba(6,182,212,0.3);flex-shrink:0;}

/* INTEL LIBRARY */
.intel{padding:50px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;}
.intel-grid{display:flex;gap:40px;}
.intel-left{flex:1;}
.intel-right{flex:1.2;}
.intel-left h3,.intel-right h3{font-size:1.2rem;font-weight:900;color:#0f172a;margin-bottom:16px;text-transform:uppercase;}
.cat-label{font-weight:700;font-size:0.7rem;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:12px 0 8px;}
.d-item{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;margin-bottom:8px;font-size:0.78rem;color:#475569;}
.d-item.active{background:#e0f2fe;border-color:#38bdf8;color:#0284c7;font-weight:700;justify-content:center;}
.d-tag{background:#f0f9ff;border:1px solid #bae6fd;color:#0284c7;padding:3px 8px;font-weight:800;font-size:0.7rem;border-radius:4px;min-width:40px;text-align:center;}
.bullet-list{list-style:none;margin:0 0 20px;padding:0;font-size:0.8rem;color:#475569;line-height:1.6;}
.bullet-list li{margin-bottom:10px;display:flex;gap:8px;}
.bullet-list li::before{content:'•';color:#06b6d4;font-weight:bold;font-size:1.1rem;}
.square-list{list-style:none;margin:0;padding:0;font-size:0.78rem;color:#334155;line-height:1.6;}
.square-list li{margin-bottom:8px;display:flex;gap:8px;}
.square-list li::before{content:'■';color:#334155;font-size:0.6rem;margin-top:3px;}

/* FOOTER */
.footer{padding:30px 30px 15px;border-top:1px solid #e2e8f0;background:#fff;}
.footer-top{display:flex;gap:30px;margin-bottom:20px;flex-wrap:wrap;}
.foot-col h4{font-weight:800;font-size:0.85rem;color:#0f172a;margin-bottom:10px;}
.foot-col ul{list-style:none;font-size:0.78rem;color:#475569;line-height:2;}
.partners-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;}
.partners-row div{background:#f1f5f9;padding:4px 8px;border-radius:3px;font-weight:700;font-size:0.65rem;color:#0f172a;}
.footer-bottom{border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;font-size:0.75rem;color:#94a3b8;}
</style>

<div class="page">

<section class="hero">
    <div class="hero-inner">
        <div class="hero-content">
            <h1>[PROJECT PHYGITAL-OC]</h1>
            <h2>DISMANTLING TRANSNATIONAL ORGANIZED CRIME</h2>
            <p>The core objective of PHYGITAL-OC is to strengthen international cooperation to help dismantle transnational criminal networks. The project utilizes advanced technologies to trace crimes in both the physical and digital worlds.</p>
            <a href="#features" class="hero-btn">INTERESTED? LEARN MORE BELOW <span style="font-size:1.2rem;">»</span></a>
        </div>
        <div class="hero-logo">
            <img src="phygital_logo_transparent.png" alt="Project Phygital-OC">
        </div>
    </div>
</section>

<div class="features" id="features">
    <div class="f-card"><div><h3>Core Curriculum</h3><ul><li>Evolution of OCCs, 9 OSINT</li><li>Trace Analysis, Trace Analysis</li><li>Digital Forensics</li></ul></div></div>
    <div class="f-card"><div><h3>Flexible Learning</h3><ul><li>Online and synchronous for Law Enforcement</li><li>Exlaining and manual for training material.</li></ul></div></div>
    <div class="f-card"><div><h3>Expert Knowledge</h3><ul><li>Developed by Specialist Trainers</li><li>Based on Europol, UNODC, NATO reports</li><li>High Level Institutional Reports</li></ul></div></div>
    <div class="f-card"><div><h3>Operational Readiness</h3><ul><li>Performance Analytics</li><li>Interactive Training</li></ul></div></div>
    <div class="f-card"><div><h3>AI Assistant Support</h3><ul><li>Content optional international</li><li>and assessed reports.</li></ul></div></div>
    <div class="f-card"><div><h3>AI Assistant Support</h3><ul><li>Transnational Law &</li><li>Case Law Guide</li></ul></div></div>
</div>

<section class="mission">
    <h2>MISSION ADVANTAGE CORE</h2>
    <div class="mission-grid">
        <div class="mission-col">
            <div class="m-card"><h4>Secure & Specialized Intelligence Environment</h4><p>Developed a closed ecosystem to facilitate international cooperation while protecting sensitive operational data and institutional assets.</p></div>
            <div class="m-card"><h4>Expert Knowledge</h4><p>Developed in closed groups with specialist lectures, integrating reports from Europol, UNODC, and NATO into practical institutional models.</p></div>
        </div>
        <div class="mission-center">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80" alt="Dashboard">
        </div>
        <div class="mission-col">
            <div class="m-card"><h4>Operational Readiness</h4><p>Detailed performance analytics from entry to critical skill tracking, preparing teams for successful international operations.</p></div>
            <div class="m-card"><h4>Practical & Evidence Based</h4><p>Detailed case studies and simulations rooted in real-world environments, accelerating training for successful operations.</p></div>
        </div>
    </div>
</section>

<section class="journey">
    <div class="journey-header">
        <div class="j-ico">👤</div>
        <h2>6-Step Learning Journey</h2>
    </div>
    <div class="journey-body">
        <!-- Colorful S-Curve Pipeline SVG -->
        <svg class="pipe" viewBox="0 0 700 750" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#0f172a"/>
                    <stop offset="15%" stop-color="#0284c7"/>
                    <stop offset="35%" stop-color="#6366f1"/>
                    <stop offset="55%" stop-color="#8b5cf6"/>
                    <stop offset="75%" stop-color="#d946ef"/>
                    <stop offset="100%" stop-color="#f43f5e"/>
                </linearGradient>
            </defs>
            <path d="M 350 0 C 350 80, 520 80, 520 160 C 520 240, 300 240, 300 320 C 300 400, 500 400, 500 480 C 500 560, 320 560, 320 640 C 320 700, 420 720, 420 750" fill="none" stroke="url(#grad)" stroke-width="28" stroke-linecap="round"/>
        </svg>



        <!-- Step 1 - Left of curve top -->
        <div class="step" style="top:30px;left:220px;width:240px;text-align:right;">
            <div class="hex" style="top:50%;right:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#0284c7,#0ea5e9);">1</div>
            <h4>Entry Test</h4>
            <p>A quick assessment to measure initial knowledge before starting.</p>
        </div>

        <!-- Step 2 - Right of curve -->
        <div class="step" style="top:130px;right:30px;width:260px;">
            <div class="hex" style="top:50%;left:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#3b82f6,#6366f1);">2</div>
            <h4>Video Lessons</h4>
            <p>Composed of 2 or 3 sessions led by specialists (30 mins each) that deepen technical subtopics.</p>
        </div>

        <!-- Step 3 - Left -->
        <div class="step" style="top:270px;left:180px;width:240px;text-align:right;">
            <div class="hex" style="top:50%;right:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#6366f1,#8b5cf6);">3</div>
            <h4>Training Material</h4>
            <p>Downloadable resources covering key aspects and essential data.</p>
        </div>

        <!-- Step 4 - Right -->
        <div class="step" style="top:380px;right:30px;width:260px;">
            <div class="hex" style="top:50%;left:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#8b5cf6,#d946ef);">4</div>
            <h4>Interactive Simulation</h4>
            <p>Application of skills in real case studies and operational scenarios.</p>
        </div>

        <!-- Step 5 - Left -->
        <div class="step" style="top:520px;left:150px;width:260px;text-align:right;">
            <div class="hex" style="top:50%;right:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#d946ef,#f43f5e);">5</div>
            <h4>AI Avatar Support</h4>
            <p>A closed-circuit avatar for instant clarifications on legislation and manuals.</p>
        </div>

        <!-- Step 6 - Right -->
        <div class="step" style="top:620px;right:30px;width:260px;">
            <div class="hex" style="top:50%;left:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#f43f5e,#fb7185);">6</div>
            <h4>Final Evaluation</h4>
            <p>Test of acquired skills to successfully complete the module.</p>
        </div>
    </div>
</section>

<section class="avatar-section">
    <h2>AI Avatar</h2>
    <div class="avatar-grid">
        <div class="avatar-img">
            <img src="ai_avatar_metahuman.png" alt="AI Avatar">
        </div>
        <div class="avatar-feats">
            <div class="av-f"><div><h4>Interactive Guide</h4><p>Explores national and EU jurisprudence on organized crime.</p></div></div>
            <div class="av-f"><div><h4>Multilingual Interaction</h4><p>Supports voice or text and communicates flawlessly in multiple languages.</p></div></div>
            <div class="av-f"><div><h4>Legal Disclaimer</h4><p>Due to legal complexity, the avatar may make errors or lack recent judgments.</p></div></div>
            <div class="av-f"><div><h4>Feedback Loop</h4><p>User feedback is highly encouraged to improve the AI's accuracy.</p></div></div>
        </div>

    </div>
</section>

<section class="intel">
    <div class="intel-grid">
        <div class="intel-left">
            <h3>Resource Center</h3>
            <div class="cat-label">Categories</div>
            <div class="d-item"><div class="d-tag">PCS</div>Download question, OSINT, Trace Analysis, Digital Forensics.</div>
            <div class="d-item"><div class="d-tag">SWD</div>Download automatics from the online and several languages.</div>
            <div class="d-item active">👁️ Quick preview</div>
            <div class="cat-label">Descriptions</div>
            <div class="d-item"><div class="d-tag">PPO</div>Download question for realisation directory.</div>
            <div class="d-item"><div class="d-tag">SMO</div>Download automatics from the multilingua and several languages.</div>
            <div class="d-item"><div class="d-tag">FILE</div>Download specific and notice to file documents.</div>
            <div class="d-item"><div class="d-tag">Y5L</div>Download category: technics and certifications.</div>
        </div>
        <div class="intel-right">
            <h3>INTEL LIBRARY & ASSET HUB</h3>
            <ul class="bullet-list">
                <li><b>Module Summary Documents:</b> Summaries and key takeaways for each training module.</li>
                <li><b>Technical Manuals:</b> Serve as a permanent reference for field operations.</li>
                <li><b>Exclusive Access:</b> Usage is strictly limited to participants.</li>
                <li><b>Copyright Restriction:</b> External distribution is prohibited by copyright laws.</li>
            </ul>
            <h4 style="font-weight:800;font-size:1rem;color:#0f172a;margin-bottom:12px;">General Resources</h4>
            <ul class="square-list">
                <li><b>Technical manuals:</b> Profesionar tendilline completing technical manuals.</li>
                <li><b>Legislation and manual clarifications:</b> indicates are.</li>
                <li><b>Legislation and manual</b> partitions and income old tentions.</li>
                <li><b>Legislation and manual clarifications:</b> several addresses of high-level institutional reports.</li>
            </ul>
        </div>
    </div>
</section>

<footer class="footer">
    <div class="footer-top">
        <div class="foot-col" style="flex:1;"><h4>About Us</h4><ul><li>Careers</li><li>Help Center</li><li>Company Service</li><li>Contact</li></ul></div>
        <div class="foot-col" style="flex:1;"><h4>Contact Us</h4><ul><li>Security</li><li>Customer Support</li><li>Privacy Policy</li></ul></div>
        <div class="foot-col" style="flex:2;">

            <p style="font-weight:700;font-size:0.78rem;color:#0f172a;margin:6px 0;">Grant Agreement 101188456</p>
            <p style="font-size:0.65rem;color:#94a3b8;line-height:1.5;">This project is co-funded by the ISF programme of the European Union. The content of this page represents the views of the authors only and is their sole responsibility. The European Commission is not responsible for any use that may be made of the information it contains.</p>
        </div>
    </div>
    <div style="padding:20px 0;text-align:center;">
        <img src="phygital-footer-logos.png" alt="Partner Logos" style="width:100%;max-width:1000px;object-fit:contain;">
    </div>
    <div class="footer-bottom">
        <span>Copyright © 2026 Belte Agency</span>
        <span>📷 🐦 📘 💼</span>
    </div>
</footer>

</div>
`
    },
    {
        id: "intercepted-new",
        name: "Project INTERCEPTED",
        thumb: "intercepted-hero-hand.png",
        html: `<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',sans-serif;background:#eef2f6;color:#1e293b;}
.page{width:100%;margin:0 auto;background:#fff;}

/* HEADER */
.header{display:flex;align-items:center;justify-content:center;gap:18px;padding:12px 30px;background:#fff;border-bottom:1px solid #e2e8f0;flex-wrap:wrap;}
.header .logo-block{display:flex;align-items:center;gap:8px;}
.header .logo-block svg{width:28px;height:28px;}
.header .logo-block span{font-weight:900;font-size:0.7rem;color:#0f172a;text-transform:uppercase;line-height:1.1;}
.header img{height:28px;}
.header .partner-text{font-weight:700;font-size:0.65rem;color:#475569;text-transform:uppercase;letter-spacing:0.5px;}

/* HERO — darker teal/slate tone */
.hero{background:linear-gradient(135deg,#0c2d3f 0%,#1a4a5a 40%,#245d6e 100%);position:relative;padding:60px 50px 60px 50px;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:url('intercepted-hero-hand.png') center/cover;opacity:0.4;mix-blend-mode:luminosity;}
.hero-inner{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:40px;}
.hero-content{flex:1;}
.hero-logo{flex-shrink:0;max-width:350px;}
.hero-logo img{width:100%;height:auto;object-fit:contain;filter:drop-shadow(1px 1px 0px #fff) drop-shadow(-1px -1px 0px #fff) drop-shadow(1px -1px 0px #fff) drop-shadow(-1px 1px 0px #fff) drop-shadow(0px 0px 8px rgba(255,255,255,0.5));}
.hero h1{color:#fff;font-size:2.5rem;font-weight:900;letter-spacing:-1px;margin-bottom:4px;}
.hero h2{color:#5eead4;font-size:1.3rem;font-weight:800;margin-bottom:18px;letter-spacing:-0.5px;}
.hero p{color:#cbd5e1;font-size:0.95rem;max-width:550px;line-height:1.6;margin-bottom:24px;border-left:3px solid #5eead4;padding-left:14px;}
.hero-btn{display:inline-flex;align-items:center;gap:12px;background:#0f172a;color:#fff;padding:10px 28px;border-radius:50px;border:2px solid #2dd4bf;font-weight:800;font-size:0.85rem;text-transform:uppercase;text-decoration:none;box-shadow:0 0 20px rgba(45,212,191,0.4);letter-spacing:0.5px;}

/* FEATURES */
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:30px 30px;position:relative;z-index:20;}
.f-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;display:flex;gap:12px;box-shadow:0 8px 25px rgba(0,0,0,0.08);border-top:3px solid #0d9488;}
.f-icon{width:44px;height:44px;background:#ccfbf1;border:2px solid #5eead4;display:flex;align-items:center;justify-content:center;font-size:1.3rem;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);flex-shrink:0;}
.f-card h3{font-size:0.95rem;font-weight:800;color:#0f172a;margin-bottom:6px;}
.f-card ul{font-size:0.78rem;color:#475569;padding-left:16px;margin:0;line-height:1.6;}

/* MISSION */
.mission{padding:50px 30px;text-align:center;}
.mission>h2{font-size:1.8rem;font-weight:900;color:#0f172a;margin-bottom:30px;text-transform:uppercase;}
.mission-grid{display:flex;gap:20px;align-items:center;}
.mission-col{flex:1;display:flex;flex-direction:column;gap:16px;text-align:left;}
.m-card{background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:16px;}
.m-card h4{font-weight:800;font-size:0.9rem;color:#0f172a;margin-bottom:6px;}
.m-card p{font-size:0.78rem;color:#475569;line-height:1.5;}
.mission-center{flex:1.1;display:flex;justify-content:center;}
.mission-center img{width:100%;max-width:320px;border-radius:10px;box-shadow:0 15px 30px rgba(0,0,0,0.12);}

/* JOURNEY */
.journey{padding:50px 30px 60px;background:#f1f5f9;position:relative;overflow:hidden;}
.journey-header{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:30px;}
.journey-header .j-ico{width:36px;height:36px;background:#134e4a;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1rem;}
.journey-header h2{font-size:1.8rem;font-weight:900;color:#0f172a;}
.journey-body{position:relative;min-height:750px;}

/* SVG Pipeline */
.journey-body svg.pipe{position:absolute;top:0;left:50%;transform:translateX(-50%);width:700px;height:750px;z-index:1;}

/* Downloads sidebar */
.dl-sidebar{position:absolute;left:0;top:60px;width:180px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,0.05);}
.dl-sidebar h4{font-size:0.8rem;font-weight:800;margin-bottom:8px;color:#0f172a;}
.dl-sidebar ul{list-style:none;font-size:0.68rem;color:#0d9488;line-height:2;}

/* Step nodes */
.step{position:absolute;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;width:280px;z-index:10;box-shadow:0 6px 18px rgba(0,0,0,0.06);}
.step h4{font-weight:800;font-size:0.95rem;color:#0f172a;margin-bottom:4px;}
.step p{font-size:0.75rem;color:#475569;line-height:1.45;}
.hex{position:absolute;width:40px;height:40px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:1rem;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);z-index:15;}

/* AI AVATAR */
.avatar-section{padding:50px 30px;background:#fff;}
.avatar-section>h2{text-align:center;font-size:1.8rem;font-weight:900;color:#0f172a;margin-bottom:35px;}
.avatar-grid{display:flex;align-items:center;gap:40px;justify-content:center;}
.avatar-img{position:relative;width:260px;flex-shrink:0;}
.avatar-img img{width:100%;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.1);position:relative;z-index:5;}
.avatar-img::before{content:'';position:absolute;inset:-8px;border:2px dashed #2dd4bf;border-radius:16px;z-index:0;}
.avatar-feats{display:grid;grid-template-columns:1fr 1fr;gap:22px;flex:1;}
.av-f{display:flex;gap:10px;}
.av-f .ico{font-size:1.3rem;color:#0d9488;flex-shrink:0;margin-top:2px;}
.av-f h4{font-weight:800;font-size:0.9rem;color:#0f172a;margin-bottom:3px;}
.av-f p{font-size:0.75rem;color:#475569;line-height:1.4;}
.mic{width:55px;height:55px;background:#fff;border:2px solid #2dd4bf;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#0d9488;box-shadow:0 0 20px rgba(45,212,191,0.3);flex-shrink:0;}

/* INTEL LIBRARY */
.intel{padding:50px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;}
.intel-grid{display:flex;gap:40px;}
.intel-left{flex:1;}
.intel-right{flex:1.2;}
.intel-left h3,.intel-right h3{font-size:1.2rem;font-weight:900;color:#0f172a;margin-bottom:16px;text-transform:uppercase;}
.cat-label{font-weight:700;font-size:0.7rem;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:12px 0 8px;}
.d-item{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;margin-bottom:8px;font-size:0.78rem;color:#475569;}
.d-item.active{background:#ccfbf1;border-color:#2dd4bf;color:#0d9488;font-weight:700;justify-content:center;}
.d-tag{background:#f0fdfa;border:1px solid #99f6e4;color:#0d9488;padding:3px 8px;font-weight:800;font-size:0.7rem;border-radius:4px;min-width:40px;text-align:center;}
.bullet-list{list-style:none;margin:0 0 20px;padding:0;font-size:0.8rem;color:#475569;line-height:1.6;}
.bullet-list li{margin-bottom:10px;display:flex;gap:8px;}
.bullet-list li::before{content:'•';color:#0d9488;font-weight:bold;font-size:1.1rem;}
.square-list{list-style:none;margin:0;padding:0;font-size:0.78rem;color:#334155;line-height:1.6;}
.square-list li{margin-bottom:8px;display:flex;gap:8px;}
.square-list li::before{content:'■';color:#334155;font-size:0.6rem;margin-top:3px;}

/* FOOTER */
.footer{padding:30px 30px 15px;border-top:1px solid #e2e8f0;background:#fff;}
.footer-top{display:flex;gap:30px;margin-bottom:20px;flex-wrap:wrap;}
.foot-col h4{font-weight:800;font-size:0.85rem;color:#0f172a;margin-bottom:10px;}
.foot-col ul{list-style:none;font-size:0.78rem;color:#475569;line-height:2;}
.partners-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;}
.partners-row div{background:#f1f5f9;padding:4px 8px;border-radius:3px;font-weight:700;font-size:0.65rem;color:#0f172a;}
.footer-bottom{border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;font-size:0.75rem;color:#94a3b8;}
</style>

<div class="page">

<section class="hero">
    <div class="hero-inner">
        <div class="hero-content">
            <h1>[PROJECT INTERCEPTED]</h1>
            <h2>INTERCEPT ONLINE RECRUITMENT AND ADVERTISEMENT TO DISRUPT THE THB MODEL</h2>
            <p>INTERCEPTED focuses on disrupting the digital business models of traffickers, considering how evidence and strategies identified in the cyberspace can be used in concrete investigative, prevention, and protective measures in the physical world.</p>
            <a href="#features" class="hero-btn">INTERESTED? LEARN MORE BELOW <span style="font-size:1.2rem;">»</span></a>
        </div>

    </div>
</section>

<!-- ========== NEW: PDF TRAINING SECTION (Patty Moore) ========== -->
<style>
.intercepted-pdf-training-section { font-family:'Inter',sans-serif; line-height:1.6; color:#1e293b; }
.intercepted-pdf-training-section *{ box-sizing:border-box; }
.intercepted-pdf-training-section .ipt-intro { background:#fff; padding:70px 30px 60px; }
.intercepted-pdf-training-section .ipt-intro-inner { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:50px; align-items:center; }
.intercepted-pdf-training-section .ipt-intro-text h2 { font-size:clamp(1.6rem,3.5vw,2.4rem); font-weight:900; color:#0f172a; line-height:1.15; margin:0 0 20px; }
.intercepted-pdf-training-section .ipt-intro-text p { font-size:0.95rem; color:#475569; line-height:1.7; margin:0; }
.intercepted-pdf-training-section .ipt-intro-media { display:flex; justify-content:center; align-items:center; }
.intercepted-pdf-training-section .ipt-video-slot { width:100%; max-width:480px; aspect-ratio:16/10; border-radius:12px; overflow:hidden; background:#f1f5f9; position:relative; }
.intercepted-pdf-training-section .ipt-video-slot video,
.intercepted-pdf-training-section .ipt-video-slot img { width:100%; height:100%; object-fit:contain; display:block; }
.intercepted-pdf-training-section .ipt-areas { background:#2d2d2d; padding:70px 30px; }
.intercepted-pdf-training-section .ipt-areas-inner { max-width:1100px; margin:0 auto; }
.intercepted-pdf-training-section .ipt-areas-title { text-align:center; margin-bottom:50px; }
.intercepted-pdf-training-section .ipt-areas-title h2 { font-size:clamp(1.4rem,3vw,2rem); font-weight:800; color:#fff; margin:0; }
.intercepted-pdf-training-section .ipt-areas-grid { display:grid; grid-template-columns:1fr 1px 1fr; gap:40px; align-items:start; }
.intercepted-pdf-training-section .ipt-areas-divider { background:rgba(255,255,255,0.15); width:1px; align-self:stretch; }
.intercepted-pdf-training-section .ipt-areas-left img { width:100%; border-radius:10px; margin-bottom:20px; box-shadow:0 10px 30px rgba(0,0,0,0.3); }
.intercepted-pdf-training-section .ipt-areas-left p,
.intercepted-pdf-training-section .ipt-areas-right p { font-size:0.92rem; color:#cbd5e1; line-height:1.7; }
.intercepted-pdf-training-section .ipt-combating { background:#f1f5f9; padding:70px 30px; }
.intercepted-pdf-training-section .ipt-combating-inner { max-width:1100px; margin:0 auto; }
.intercepted-pdf-training-section .ipt-combating-title { text-align:center; margin-bottom:50px; }
.intercepted-pdf-training-section .ipt-combating-title h2 { font-size:clamp(1.4rem,3vw,2rem); font-weight:800; color:#0f172a; margin:0; }
.intercepted-pdf-training-section .ipt-combating-grid { display:grid; grid-template-columns:1fr 1fr; gap:50px; }
.intercepted-pdf-training-section .ipt-combating-left p,
.intercepted-pdf-training-section .ipt-combating-right p { font-size:0.92rem; color:#475569; line-height:1.7; margin-bottom:24px; }
.intercepted-pdf-training-section .ipt-yt-placeholder { width:100%; aspect-ratio:16/9; background:#0f172a; border-radius:10px; overflow:hidden; position:relative; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,0.15); }
.intercepted-pdf-training-section .ipt-yt-placeholder img { width:100%; height:100%; object-fit:cover; display:block; opacity:0.85; }
.intercepted-pdf-training-section .ipt-yt-play { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:64px; height:64px; background:rgba(255,0,0,0.85); border-radius:50%; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer; transition:transform 0.2s; }
.intercepted-pdf-training-section .ipt-yt-play:hover { transform:translate(-50%,-50%) scale(1.1); }
.intercepted-pdf-training-section .ipt-yt-play::after { content:''; display:block; width:0; height:0; border-top:12px solid transparent; border-bottom:12px solid transparent; border-left:20px solid #fff; margin-left:4px; }
.intercepted-pdf-training-section .ipt-yt-caption { text-align:center; margin-top:10px; font-size:0.82rem; color:#94a3b8; font-style:italic; }
.intercepted-pdf-training-section .ipt-btn-dark { display:inline-flex; align-items:center; gap:10px; padding:14px 32px; background:#1e293b; color:#fff; border-radius:8px; font-weight:700; font-size:0.9rem; text-decoration:none; border:none; cursor:pointer; transition:background 0.2s, transform 0.15s; box-shadow:0 4px 14px rgba(0,0,0,0.12); }
.intercepted-pdf-training-section .ipt-btn-dark:hover { background:#334155; transform:translateY(-1px); }
.intercepted-pdf-training-section .ipt-btn-dark svg { width:18px; height:18px; fill:currentColor; flex-shrink:0; }
.intercepted-pdf-training-section .ipt-exercise { background:#2d2d2d; padding:70px 30px; }
.intercepted-pdf-training-section .ipt-exercise-inner { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1px 1fr; gap:40px; align-items:start; }
.intercepted-pdf-training-section .ipt-exercise-divider { background:rgba(255,255,255,0.15); width:1px; align-self:stretch; }
.intercepted-pdf-training-section .ipt-exercise-left h2 { font-size:clamp(1.4rem,3vw,2rem); font-weight:800; color:#fff; margin:0 0 24px; line-height:1.2; }
.intercepted-pdf-training-section .ipt-exercise-left p { font-size:0.92rem; color:#cbd5e1; line-height:1.7; margin-bottom:24px; }
.intercepted-pdf-training-section .ipt-exercise-subscribe-area { margin-top:16px; min-height:48px; }
.intercepted-pdf-training-section .ipt-exercise-right img { width:100%; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.3); }
.ipt-training-academy-heading { text-align: center; margin: 48px auto 28px; }
.ipt-training-academy-heading h3 { font-size: clamp(1.6rem, 2.4vw, 2.4rem); font-weight: 800; color: #0f172a; letter-spacing: 0.02em; }
.ipt-training-academy-heading::after { content: ""; display: block; width: 72px; height: 3px; margin: 14px auto 0; border-radius: 999px; background: #00a99d; }
.intercepted-pdf-training-section .ipt-risk { background:#f1f5f9; padding:70px 30px 80px; }
.intercepted-pdf-training-section .ipt-risk-inner { max-width:1100px; margin:0 auto; }
.intercepted-pdf-training-section .ipt-risk-title { text-align:center; margin-bottom:50px; }
.intercepted-pdf-training-section .ipt-risk-title h2 { font-size:clamp(1.4rem,3vw,2rem); font-weight:800; color:#0f172a; margin:0; }
.intercepted-pdf-training-section .ipt-risk-footer { display:flex; justify-content:flex-end; margin-top:30px; }
@media(max-width:768px){
    .intercepted-pdf-training-section .ipt-intro-inner { grid-template-columns:1fr; gap:30px; }
    .intercepted-pdf-training-section .ipt-areas-grid { grid-template-columns:1fr; }
    .intercepted-pdf-training-section .ipt-areas-divider { display:none; }
    .intercepted-pdf-training-section .ipt-combating-grid { grid-template-columns:1fr; }
    .intercepted-pdf-training-section .ipt-exercise-inner { grid-template-columns:1fr; }
    .intercepted-pdf-training-section .ipt-exercise-divider { display:none; }
    .intercepted-pdf-training-section .ipt-risk-footer { justify-content:center; }
}
</style>

<section id="intercepted-pdf-training-section" class="intercepted-pdf-training-section" data-page="intercepted">
    <div class="ipt-intro module-section" id="ipt-intro-section">
        <div class="bg-overlay"></div>
        <button class="bg-edit-btn" onclick="triggerImageUpload('ipt-intro-section', 'bg')">
            <i class="fas fa-image"></i> Change BG
        </button>
        <div class="ipt-intro-inner">
            <div class="ipt-intro-text">
                <h2 class="editable-text">The project Intercepted contributes to develop the European Virtual Judicial and Security Academy</h2>
                <p class="editable-text">a training place where the boundaries of geography and language disappear, where judges, prosecutors, lawyers, and legal professionals from across Europe—and beyond—can gather in a shared virtual space to learn, exchange, and grow together on how to prevent and combat trafficking on human beings and the related crimes.</p>
            </div>
            <div class="ipt-intro-media">
                <div class="editable-image-wrapper" style="width:100%;max-width:480px;">
                    <img class="body-img" src="intercepted_logo_transparent.png" alt="Project INTERCEPTED" loading="lazy" style="width:100%;height:auto;border-radius:12px;">
                </div>
            </div>
        </div>
    </div>
    <div class="ipt-areas module-section" id="ipt-areas-section">
        <div class="bg-overlay"></div>
        <button class="bg-edit-btn" onclick="triggerImageUpload('ipt-areas-section', 'bg')">
            <i class="fas fa-image"></i> Change BG
        </button>
        <div class="ipt-areas-inner">
            <div class="ipt-areas-title">
                <h2 class="editable-text">The Intercepted training course covers the following areas</h2>
            </div>
            <div class="ipt-areas-grid">
                <div class="ipt-areas-left">
                    <div class="editable-image-wrapper"><img src="assets/intercepted-training/academy-preview.png" alt="Virtual Academy — Immersive training environment" loading="lazy" width="753" height="753"></div>
                    <p class="editable-text">The technical training materials and solutions articulated in 8 modules can be used directly by learners in an asynchronous format, or by trainers in a synchronous format—either in a blended mode (i.e., a mix of classroom and online lessons) or as support tools for in-person training. Please contact our office responsible for combating Human Trafficking if you wish to organize customized courses.</p>
                </div>
                <div class="ipt-areas-divider" aria-hidden="true"></div>
                <div class="ipt-areas-right">
                    <p class="editable-text">The Academy is a dynamic, immersive virtual environment like no other, where LEAs, legal practitioners and vetted NGOs can navigate a richly detailed space designed not only for learning, but for meaningful interaction and, in the secure area, for operative analysis.</p>
                </div>
            </div>
        </div>
    </div>
    <div class="ipt-combating module-section" id="ipt-combating-section">
        <div class="bg-overlay"></div>
        <button class="bg-edit-btn" onclick="triggerImageUpload('ipt-combating-section', 'bg')">
            <i class="fas fa-image"></i> Change BG
        </button>
        <div class="ipt-combating-inner">
            <div class="ipt-combating-title">
                <h2 class="editable-text">Combating trafficking on human beings</h2>
            </div>
            <div class="ipt-combating-grid">
                <div class="ipt-combating-left">
                    <p class="editable-text">Our correspondent Fausto Biloslavo followed groups of migrants along the Balkan route. This video helps to understand some aspects of the illegal migration mechanism. We kindly ask you to watch it to gain a more accurate understanding of the reality of this phenomenon</p>
                    <div class="ipt-yt-container" data-yt-url="" style="width:100%;">
                        <div class="ipt-yt-placeholder" role="button" aria-label="Play YouTube video: The game of the Balkan Route" tabindex="0">
                            <img src="assets/intercepted-training/balkan-route-thumbnail.png" alt="The game of the Balkan Route video thumbnail" loading="lazy" width="356" height="200">
                            <button class="ipt-yt-play" type="button" aria-label="Play YouTube video"></button>
                        </div>
                        <div class="ipt-yt-iframe-wrap" style="display:none;width:100%;aspect-ratio:16/9;border-radius:10px;overflow:hidden;"></div>
                    </div>
                    <div class="ipt-yt-caption"><span class="editable-text">The game of the Balkan Route</span></div>
                </div>
                <div class="ipt-combating-right">
                    <p class="editable-text">The Intercepted project is the continuation of a previous EU-funded project called "BigOSint" which has analyzed numerous cases of human trafficking on an international scale. We invite you to read this document produced in "BigOsint" to gain a comprehensive understanding of the complexity of this phenomenon in its various facets</p>
                    <a class="ipt-btn-dark editable-text" href="#" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                        Case Study Analysis
                    </a>
                </div>
            </div>
        </div>
    </div>
    <div class="ipt-exercise module-section" id="ipt-exercise-section">
        <div class="bg-overlay"></div>
        <button class="bg-edit-btn" onclick="triggerImageUpload('ipt-exercise-section', 'bg')">
            <i class="fas fa-image"></i> Change BG
        </button>
        <div class="ipt-exercise-inner">
            <div class="ipt-exercise-left">
                <h2 class="editable-text">Guided Exercise of a transnational investigation on THB</h2>
                <p class="editable-text">This exercise is a training tool designed to explore various aspects of a transnational human trafficking investigation, based on a real but anonymized case. The core of the case focuses on the collection of digital evidence. The exercise can be carried out in groups or individually, but should always be guided by an experienced trainer who can highlight the elements of police cooperation and judicial cooperation involved in the acquisition of digital evidence, as well as the appropriate choice of forensic tools both for searches and for the investigation as a whole.</p>
                <div class="ipt-exercise-subscribe-area"></div>
            </div>
            <div class="ipt-exercise-divider" aria-hidden="true"></div>
            <div class="ipt-exercise-right">
                <div class="editable-image-wrapper"><img src="assets/intercepted-training/guided-exercise-room.png" alt="Guided exercise virtual environment" loading="lazy" width="1142" height="522"></div>
            </div>
        </div>
    </div>
    <div class="ipt-risk module-section" id="ipt-risk-section">
        <div class="bg-overlay"></div>
        <button class="bg-edit-btn" onclick="triggerImageUpload('ipt-risk-section', 'bg')">
            <i class="fas fa-image"></i> Change BG
        </button>
        <div class="ipt-risk-inner">
            <div class="ipt-risk-title">
                <h2 class="editable-text">Risk Indicators to prevent THB</h2>
            </div>
            <p class="editable-text" style="max-width:800px; margin:0 auto 30px; text-align:center; color:#475569; font-size:0.95rem; line-height:1.7;">During the Unchained project, also funded by the European Union under the ISF, Agenfor and the consortium members — in particular the Public Prosecutor’s Office of Padua — developed a table of risk indicators intended for those carrying out inspections in small and medium-sized enterprises and markets, as well as for those involved in labour protection, non-governmental organizations, and trade unions protecting workers’ interests.<br><br>This table is of great interest for strengthening cooperation and preventing the risks of human trafficking within our societies.</p>
            <div class="ipt-risk-footer">
                <a class="ipt-btn-dark editable-text" href="#" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                    Unchained Project
                </a>
            </div>
        </div>
    </div>
</section>
<!-- ========== END: PDF TRAINING SECTION ========== -->

<div class="ipt-training-academy-heading">
    <h3 class="editable-text">What will you find in the Training Academy?</h3>
</div>

<div class="features" id="features">
    <div class="f-card"><div><h3>Core Curriculum</h3><ul><li>Evolution of OCG modus operandi in THB</li><li>OSINT & Telecom Surveillance</li><li>Digital Forensics</li></ul></div></div>
    <div class="f-card"><div><h3>Flexible Learning</h3><ul><li>Online and asynchronous modules</li><li>Adapted for Law Enforcement schedules</li></ul></div></div>
    <div class="f-card"><div><h3>Expert Knowledge</h3><ul><li>Developed by Specialist Trainers</li><li>Based on Europol, UNODC, NATO reports</li><li>High Level Institutional Reports</li></ul></div></div>
    <div class="f-card"><div><h3>Operational Readiness</h3><ul><li>OSINT-HUMINT-SIGINT cycle</li><li>Public-Private cooperation</li></ul></div></div>
    <div class="f-card"><div><h3>AI Avatar Support</h3><ul><li>Closed-circuit assistant</li><li>Legislation & manual clarifications</li></ul></div></div>
    <div class="f-card"><div><h3>Legal & Judicial Cooperation</h3><ul><li>LEA & Judicial Authorities</li><li>Private Sector & Civil Society</li></ul></div></div>
</div>

<section class="mission">
    <h2>MISSION ADVANTAGE CORE</h2>
    <div class="mission-grid">
        <div class="mission-col">
            <div class="m-card"><h4>Practical & Intelligence-Based Approach</h4><p>Translates the analysis of online dynamics into concrete operational practices for disrupting trafficking networks.</p></div>
            <div class="m-card"><h4>Expert Knowledge</h4><p>Developed in closed groups with specialist lectures, integrating reports from Europol, UNODC, and NATO into practical institutional models.</p></div>
        </div>
        <div class="mission-center">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80" alt="Dashboard">
        </div>
        <div class="mission-col">
            <div class="m-card"><h4>Integrated Digital & Analytical Support</h4><p>Provides tools to interpret online signals and identify trafficking patterns in a secure environment.</p></div>
            <div class="m-card"><h4>Measured Competence & Operational Readiness</h4><p>Ensures harmonized skill development across different jurisdictions through structured assessments.</p></div>
        </div>
    </div>
</section>

<section class="journey">
    <div class="journey-header">
        <div class="j-ico">👤</div>
        <h2>6-Step Learning Journey</h2>
    </div>
    <div class="journey-body">
        <!-- Colorful S-Curve Pipeline SVG -->
        <svg class="pipe" viewBox="0 0 700 750" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#134e4a"/>
                    <stop offset="15%" stop-color="#0d9488"/>
                    <stop offset="35%" stop-color="#6366f1"/>
                    <stop offset="55%" stop-color="#8b5cf6"/>
                    <stop offset="75%" stop-color="#d946ef"/>
                    <stop offset="100%" stop-color="#f43f5e"/>
                </linearGradient>
            </defs>
            <path d="M 350 0 C 350 80, 520 80, 520 160 C 520 240, 300 240, 300 320 C 300 400, 500 400, 500 480 C 500 560, 320 560, 320 640 C 320 700, 420 720, 420 750" fill="none" stroke="url(#grad)" stroke-width="28" stroke-linecap="round"/>
        </svg>



        <!-- Step 1 -->
        <div class="step" style="top:30px;left:220px;width:240px;text-align:right;">
            <div class="hex" style="top:50%;right:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#0d9488,#14b8a6);">1</div>
            <h4>Entry Test</h4>
            <p>A quick assessment to measure initial knowledge before starting.</p>
        </div>

        <!-- Step 2 -->
        <div class="step" style="top:130px;right:30px;width:260px;">
            <div class="hex" style="top:50%;left:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#3b82f6,#6366f1);">2</div>
            <h4>Video Lessons</h4>
            <p>Sessions of 30 minutes with specialists on technical topics.</p>
        </div>

        <!-- Step 3 -->
        <div class="step" style="top:270px;left:180px;width:240px;text-align:right;">
            <div class="hex" style="top:50%;right:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#6366f1,#8b5cf6);">3</div>
            <h4>Training Material</h4>
            <p>Transferable resources with key aspects and essential data.</p>
        </div>

        <!-- Step 4 -->
        <div class="step" style="top:380px;right:30px;width:260px;">
            <div class="hex" style="top:50%;left:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#8b5cf6,#d946ef);">4</div>
            <h4>Interactive Simulation</h4>
            <p>Application of skills in real case studies and operational scenarios.</p>
        </div>

        <!-- Step 5 -->
        <div class="step" style="top:520px;left:150px;width:260px;text-align:right;">
            <div class="hex" style="top:50%;right:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#d946ef,#f43f5e);">5</div>
            <h4>AI Avatar Support</h4>
            <p>Closed-circuit AI assistant for instant clarifications on legislation and manuals.</p>
        </div>

        <!-- Step 6 -->
        <div class="step" style="top:620px;right:30px;width:260px;">
            <div class="hex" style="top:50%;left:-30px;transform:translateY(-50%);background:linear-gradient(135deg,#f43f5e,#fb7185);">6</div>
            <h4>Final Evaluation</h4>
            <p>Test to validate acquired competencies and complete the module.</p>
        </div>
    </div>
</section>

<section class="avatar-section">
    <h2>AI Avatar</h2>
    <div class="avatar-grid">
        <div class="avatar-img">
            <img src="ai_avatar_metahuman.png" alt="AI Avatar">
        </div>
        <div class="avatar-feats">
            <div class="av-f"><div><h4>Interactive Guide</h4><p>Explores national and EU jurisprudence on human trafficking and organized crime.</p></div></div>
            <div class="av-f"><div><h4>Multilingual Interaction</h4><p>Supports voice or text and communicates flawlessly in multiple languages.</p></div></div>
            <div class="av-f"><div><h4>Legal Disclaimer</h4><p>Due to legal complexity, the avatar may make errors or lack recent judgments.</p></div></div>
            <div class="av-f"><div><h4>Feedback Loop</h4><p>User feedback is highly encouraged to improve the AI's accuracy.</p></div></div>
        </div>
    </div>
</section>

<section class="intel">
    <div class="intel-grid">
        <div class="intel-left">
            <h3>Resource Center</h3>
            <div class="cat-label">Categories</div>
            <div class="d-item"><div class="d-tag">THB</div>Human Trafficking modus operandi and OSINT analysis.</div>
            <div class="d-item"><div class="d-tag">SIG</div>OSINT-HUMINT-SIGINT cycle documentation.</div>
            <div class="d-item active">👁️ Quick preview</div>
            <div class="cat-label">Descriptions</div>
            <div class="d-item"><div class="d-tag">DGF</div>Digital Forensics recovery and investigation guides.</div>
            <div class="d-item"><div class="d-tag">LEA</div>Law Enforcement & Judicial cooperation frameworks.</div>
            <div class="d-item"><div class="d-tag">TOT</div>Training of Trainers methodology documents.</div>
            <div class="d-item"><div class="d-tag">AIA</div>AI-driven analysis and investigation resources.</div>
        </div>
        <div class="intel-right">
            <h3>INTEL LIBRARY & ASSET HUB</h3>
            <ul class="bullet-list">
                <li><b>Module Summary Documents:</b> Summaries and key takeaways for each of the 9 training modules.</li>
                <li><b>Technical Manuals:</b> Serve as a permanent reference for field operations.</li>
                <li><b>Exclusive Access:</b> Usage is strictly limited to participants.</li>
                <li><b>Copyright Restriction:</b> External distribution is prohibited by copyright laws.</li>
            </ul>
            <h4 style="font-weight:800;font-size:1rem;color:#0f172a;margin-bottom:12px;">General Resources</h4>
            <ul class="square-list">
                <li><b>Technical manuals:</b> Professional guidelines for field operations.</li>
                <li><b>Legislation clarifications:</b> National and EU legal frameworks for THB.</li>
                <li><b>Institutional reports:</b> High-level reports from Europol, UNODC, and NATO.</li>
                <li><b>Feedback questionnaire:</b> Post-completion survey to improve programs.</li>
            </ul>
        </div>
    </div>
</section>

<footer class="footer">
    <div class="footer-top">
        <div class="foot-col" style="flex:1;"><h4>About Us</h4><ul><li>Careers</li><li>Help Center</li><li>Company Service</li><li>Contact</li></ul></div>
        <div class="foot-col" style="flex:1;"><h4>Contact Us</h4><ul><li>Security</li><li>Customer Support</li><li>Privacy Policy</li></ul></div>
        <div class="foot-col" style="flex:2;">
            <p style="font-weight:700;font-size:0.78rem;color:#0f172a;margin:6px 0;">Grant Agreement 101188456</p>
            <p style="font-size:0.65rem;color:#94a3b8;line-height:1.5;">This project is co-funded by the ISF programme of the European Union. The content of this page represents the views of the authors only and is their sole responsibility. The European Commission is not responsible for any use that may be made of the information it contains.</p>
        </div>
    </div>
    <div style="padding:20px 0;text-align:center;">
        <img src="intercepted-footer-logos.png" alt="Partner Logos" style="width:100%;max-width:1000px;object-fit:contain;">
    </div>
    <div class="footer-bottom">
        <span>Copyright © 2026 Belte Agency</span>
        <span>📷 🐦 📘 💼</span>
    </div>
</footer>

</div>
`
    }
];
