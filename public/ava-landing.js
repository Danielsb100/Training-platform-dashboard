/* AVA Landing Preview — Isolated JavaScript */
document.addEventListener('DOMContentLoaded', () => {

    /* ---- Mobile Menu ---- */
    const menuBtn = document.querySelector('.ava-mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (menuBtn && mobileNav) {
        menuBtn.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        });
    }

    /* ---- Smooth Scroll (with header offset) ---- */
    const HEADER_OFFSET = 70; // slightly more than header height

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;

            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
            window.scrollTo({ top, behavior: 'smooth' });

            // Close mobile nav if open
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                menuBtn.querySelector('i').className = 'fas fa-bars';
            }
        });
    });

    /* ---- Subtle Fade-in on Scroll ---- */
    const fadeTargets = document.querySelectorAll(
        '.pillar-card, .feature-item, .model-card, .training-card, .ai-card-glass, .gallery-thumb, .stat'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    fadeTargets.forEach(el => {
        el.classList.add('fade-target');
        observer.observe(el);
    });

    /* Inject minimal fade CSS (avoids needing to touch the stylesheet for animation) */
    const style = document.createElement('style');
    style.textContent = `
        .fade-target { opacity: 0; transform: translateY(14px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .fade-target.visible { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);

    /* ---- Project Catalogue Logic ---- */
    const filterTabs = document.querySelectorAll('.filter-tab');
    const catalogueGrid = document.getElementById('catalogue-grid');

    function renderProjects(family) {
        if (!catalogueGrid) return;
        
        catalogueGrid.innerHTML = ''; // Clear current
        
        const filteredProjects = typeof AVA_PROJECTS !== 'undefined' 
            ? AVA_PROJECTS.filter(p => p.family === family)
            : [];

        if (filteredProjects.length === 0) {
            catalogueGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>Projects and training programmes for this area will be added soon.</p>
                </div>
            `;
            return;
        }

        // Add Family Description if it exists
        let familyInfo = null;
        if (typeof AVA_FAMILIES !== 'undefined' && AVA_FAMILIES[family]) {
            familyInfo = AVA_FAMILIES[family];
        }

        if (familyInfo && familyInfo.description && familyInfo.description.trim() !== '') {
            const descHTML = `
                <div class="family-description fade-target" style="grid-column: 1 / -1;">
                    ${familyInfo.description}
                </div>
            `;
            catalogueGrid.insertAdjacentHTML('beforeend', descHTML);
        }

        filteredProjects.forEach(project => {
            let statusClass = 'status-soon';
            if (project.status === 'Active Project') statusClass = 'status-active';
            if (project.status === 'Past Project') statusClass = 'status-past';
            if (project.status === 'Training Available') statusClass = 'status-training';

            let primaryBtn = '';
            if (project.primary_cta_label) {
                const disabledAttr = project.link_type === 'placeholder' ? 'disabled style="pointer-events:none; opacity:0.6;"' : '';
                const targetAttr = project.link_type === 'external' ? 'target="_blank" rel="noopener noreferrer"' : '';
                primaryBtn = `<a href="${project.primary_cta_url}" class="ava-btn ava-btn-primary btn-sm" ${disabledAttr} ${targetAttr}>${project.primary_cta_label}</a>`;
            }

            let secondaryBtn = '';
            if (project.secondary_cta_label) {
                const disabledAttr = project.link_type === 'placeholder' ? 'disabled style="pointer-events:none; opacity:0.6;"' : '';
                const targetAttr = project.link_type === 'external' ? 'target="_blank" rel="noopener noreferrer"' : '';
                secondaryBtn = `<a href="${project.secondary_cta_url}" class="ava-btn ava-btn-outline btn-sm" ${disabledAttr} ${targetAttr}>${project.secondary_cta_label}</a>`;
            }
            
            let logoHTML = `<div class="project-logo-ph"><i class="fas fa-image"></i></div>`;
            if (project.logo_file && project.logo_file !== '' && project.logo_file !== 'placeholder-logo.png') {
                logoHTML = `<img src="${project.logo_file}" alt="${project.project_name} logo" class="project-logo-img" style="width: 60px; height: 60px; object-fit: contain; border-radius: 8px;" onerror="this.onerror=null; this.outerHTML='<div class=\\'project-logo-ph\\'><i class=\\'fas fa-image\\'></i></div>';">`;
            }

            const cardHTML = `
                <div class="project-card fade-target">
                    <div class="project-header">
                        ${logoHTML}
                        <div class="project-info">
                            <span class="project-status ${statusClass}">${project.status}</span>
                            <h4 class="project-title">${project.project_name}</h4>
                        </div>
                    </div>
                    <p class="project-desc">${project.short_description}</p>
                    <div class="project-actions">
                        ${primaryBtn}
                        ${secondaryBtn}
                    </div>
                </div>
            `;
            catalogueGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Re-trigger fade in for new elements
        catalogueGrid.querySelectorAll('.fade-target').forEach(el => {
            observer.observe(el);
            // small delay to ensure transition applies
            setTimeout(() => el.classList.add('visible'), 50);
        });
    }

    if (filterTabs.length > 0) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderProjects(tab.dataset.target);
            });
        });
        // Initial render
        renderProjects('security');
    }

    /* ---- Enhance Smooth Scroll for Training Area Cards ---- */
    document.querySelectorAll('a[href="#projects-catalogue"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const filter = this.getAttribute('data-filter');
            if (filter) {
                const targetTab = document.querySelector(`.filter-tab[data-target="${filter}"]`);
                if (targetTab) {
                    targetTab.click(); // Trigger the tab switch
                }
            }
        });
    });

});
