// Modern Interactive Portfolio Scripts (ad1tya.me minimalist architecture)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Current Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Simple, Real Dark / Light Theme Toggle (Default Pure Black #000000)
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    
    // Default to dark (true pure black)
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    applyTheme(savedTheme);

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);

        if (themeIcon) {
            if (theme === 'light') {
                themeIcon.className = 'far fa-sun';
            } else {
                themeIcon.className = 'far fa-moon';
            }
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const nextTheme = current === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
        });
    }

    // 3. Active Navigation Bar Scroll Spy
    const navLinks = document.querySelectorAll('.nav-item-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        sections.forEach(sec => {
            const sectionTop = sec.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // 4. Playing Card Focus & Flip Handler (Dedicated Fullscreen Modal Dialog)
    const cardModal = document.getElementById('playing-card-modal');
    const cardModalBody = document.getElementById('card-modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const flipCards = document.querySelectorAll('.project-card-container');

    function openCardModal(card) {
        const backContent = card.querySelector('.project-card-back');
        if (!backContent || !cardModalBody || !cardModal) return;

        // Clone the card back content into the modal dialog
        cardModalBody.innerHTML = backContent.innerHTML;
        cardModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCardModal() {
        if (!cardModal) return;
        cardModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeCardModal);
    }

    if (cardModal) {
        cardModal.addEventListener('click', (e) => {
            // Close when clicking outside the card inner container
            if (!e.target.closest('.card-modal-inner')) {
                closeCardModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCardModal();
    });

    flipCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Ignore if clicked on direct GitHub link
            if (e.target.closest('a')) return;
            openCardModal(card);
        });
    });

    // 5. Interactive Raindrop Puddle & Mouse Wave Matrix Canvas
    const waveCanvas = document.getElementById('audio-wave-canvas');
    if (waveCanvas) {
        const ctx = waveCanvas.getContext('2d');
        let width = waveCanvas.width = waveCanvas.offsetWidth;
        let height = waveCanvas.height = waveCanvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = waveCanvas.width = waveCanvas.offsetWidth;
            height = waveCanvas.height = waveCanvas.offsetHeight;
        });

        const barCount = 72;
        let frame = 0;
        let mouseX = -1000;
        let isHovered = false;

        // Ripples collection (drops hitting the puddle)
        const ripples = [];

        function addRaindrop(targetX) {
            ripples.push({
                x: targetX,
                radius: 0,
                maxRadius: 180,
                amplitude: 1.0,
                speed: 3.2
            });
        }

        const vizBox = document.querySelector('.audio-visualizer-box');
        if (vizBox) {
            vizBox.style.cursor = 'default';

            vizBox.addEventListener('mousemove', (e) => {
                const rect = waveCanvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                isHovered = true;
            });

            vizBox.addEventListener('mouseleave', () => {
                isHovered = false;
                mouseX = -1000;
            });

            // Click acts as a single drop of rain hitting the puddle
            vizBox.addEventListener('click', (e) => {
                const rect = waveCanvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                addRaindrop(clickX);
            });
        }

        // Ambient gentle raindrops falling intermittently
        let dropTimer = 0;

        function renderRipplePuddle() {
            ctx.clearRect(0, 0, width, height);

            const barWidth = width / barCount;
            const centerY = height / 2;

            // Update ripples
            for (let r = ripples.length - 1; r >= 0; r--) {
                const rip = ripples[r];
                rip.radius += rip.speed;
                rip.amplitude *= 0.965; // Dampen smoothly

                if (rip.amplitude < 0.02 || rip.radius > rip.maxRadius) {
                    ripples.splice(r, 1);
                }
            }

            // Ambient gentle drop every ~3.5 seconds if user is idle
            dropTimer++;
            if (dropTimer > 210 && ripples.length === 0) {
                addRaindrop(width * (0.3 + Math.random() * 0.4));
                dropTimer = 0;
            }

            for (let i = 0; i < barCount; i++) {
                const x = i * barWidth + barWidth / 2;
                
                // Natural curved profile
                const envelope = Math.sin((i / barCount) * Math.PI);
                
                // Idle gentle surface water tension oscillation
                let waterHeight = (envelope * 28) + 4;
                const waterSway = Math.sin((i * 0.16) + (frame * 0.035)) * 0.25 + 0.75;
                waterHeight *= waterSway;

                // Mouse proximity wave (interactive hover)
                if (isHovered && mouseX > 0) {
                    const distToMouse = Math.abs(x - mouseX);
                    if (distToMouse < 90) {
                        const mouseInfluence = Math.cos((distToMouse / 90) * (Math.PI / 2));
                        waterHeight += mouseInfluence * 26;
                    }
                }

                // Raindrop ripple propagation physics
                for (let r = 0; r < ripples.length; r++) {
                    const rip = ripples[r];
                    const distToDrop = Math.abs(x - rip.x);
                    const wavePhase = (distToDrop - rip.radius) * 0.12;

                    // Wave packet centered on wavefront
                    if (Math.abs(distToDrop - rip.radius) < 40) {
                        const rippleEnvelope = Math.cos(((distToDrop - rip.radius) / 40) * (Math.PI / 2));
                        const rippleWave = Math.sin(wavePhase);
                        const displacement = rippleEnvelope * rippleWave * (rip.amplitude * 42);
                        waterHeight += displacement;
                    }
                }

                waterHeight = Math.max(3, waterHeight);

                // Draw vertical ASCII dot stack
                const dotSpacing = 5.5;
                const dotsInCol = Math.floor(waterHeight / dotSpacing);

                for (let d = -dotsInCol; d <= dotsInCol; d++) {
                    const y = centerY + (d * dotSpacing);
                    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                    ctx.fillStyle = isLight ? '#09090b' : '#ffffff';
                    ctx.globalAlpha = Math.max(0.18, 1 - Math.abs(d) / (dotsInCol + 2));
                    ctx.fillRect(x - 1, y - 1, 2, 2);
                }
            }

            ctx.globalAlpha = 1.0;
            frame++;
            requestAnimationFrame(renderRipplePuddle);
        }

        renderRipplePuddle();
    }

    // 6. Contact Form Handler (Direct Silent Background Submission to Formspree / Email)
    const contactForm = document.getElementById('contact-form');
    const toast = document.getElementById('toast');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const message = document.getElementById('form-message').value.trim();
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            if (!name || !email || !message) {
                showToast('Please fill in all fields.');
                return;
            }

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            try {
                // Post in background to Formspree
                const response = await fetch('https://formspree.io/f/xovjqqkw', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        message: message,
                        _replyto: email,
                        _subject: `New Portfolio Inquiry from ${name}`
                    })
                });

                if (response.ok) {
                    showToast('✓ Message sent successfully! I will reply soon.');
                    contactForm.reset();
                } else {
                    // Fallback to mailto if endpoint is not activated yet
                    window.location.href = `mailto:aysharma1601@gmail.com?subject=Portfolio Inquiry from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}`;
                    showToast('Opening email client as backup...');
                    contactForm.reset();
                }
            } catch (err) {
                // Fallback directly to mail client
                window.location.href = `mailto:aysharma1601@gmail.com?subject=Portfolio Inquiry from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}`;
                showToast('Opening email client as backup...');
                contactForm.reset();
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
});
