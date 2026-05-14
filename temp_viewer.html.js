
        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const pageId = urlParams.get('id');

            if (!pageId) {
                document.getElementById('page-content').innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100vh; color:white;"><h2>Page not found (No ID provided).</h2></div>';
                return;
            }

            function loadFromLocalStorage() {
                const courses = JSON.parse(localStorage.getItem('published_courses') || '[]');
                const pages = JSON.parse(localStorage.getItem('published_pages') || '[]');
                
                let page = courses.find(c => c.id === pageId) || pages.find(p => p.id === pageId);

                if (page) {
                    document.title = page.title || 'Course';
                    const contentHtml = page.compiled_content || page.modular_content || page.content;
                    
                    if (contentHtml) {
                        document.getElementById('page-content').innerHTML = contentHtml;
                        initializeAnimations();
                    } else {
                        window.location.href = 'course_content.html?id=' + pageId;
                    }
                } else {
                    window.location.href = 'course_content.html?id=' + pageId;
                }
            }

            function showNoLandingPage() {
                window.location.href = 'course_content.html?id=' + pageId;
            }

            function initializeAnimations() {
                const animObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if(entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                        } else {
                            entry.target.classList.remove('is-visible');
                        }
                    });
                }, { threshold: 0.1 });
                
                document.querySelectorAll('.anim-fade-in, .anim-slide-up').forEach(el => {
                    animObserver.observe(el);
                });
                
                document.querySelectorAll('[data-is-view-modules-btn="true"]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        window.location.href = 'course_content.html?id=' + pageId;
                    });
                });

                document.querySelectorAll('.btn-subscribe, [data-is-subscribe-btn="true"]').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const originalText = btn.innerText;
                        btn.innerText = 'Subscribing...';
                        btn.style.opacity = '0.7';
                        btn.style.pointerEvents = 'none';
                        try {
                            const res = await fetch(`/api/courses/${pageId}/subscribe`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                                }
                            });
                            if(!res.ok) {
                                throw new Error('Failed to subscribe');
                            }
                            window.location.href = 'course_content.html?id=' + pageId;
                        } catch(err) {
                            console.error(err);
                            alert('Erro ao se inscrever. Tente novamente mais tarde.');
                            btn.innerText = originalText;
                            btn.style.opacity = '1';
                            btn.style.pointerEvents = 'auto';
                        }
                    });
                });
            }

            fetch(`/api/landing-pages/course/${pageId}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error('API_ERROR');
                    }
                    return res.json();
                })
                .then(page => {
                    document.title = page.title || 'Course';
                    
                    if (page.compiledCss) {
                        const style = document.createElement('style');
                        style.textContent = page.compiledCss;
                        document.head.appendChild(style);
                    }
                    
                    const contentHtml = page.compiledHtml;
                    
                    if (contentHtml) {
                        document.getElementById('page-content').innerHTML = contentHtml;
                        initializeAnimations();
                    } else {
                        loadFromLocalStorage();
                    }
                })
                .catch(err => {
                    // Fallback to localStorage if API fails or 404
                    loadFromLocalStorage();
                });
        });
    
