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

    // 4. Playing Card Focus & Flip Handler (Smooth 3D Flip & Expand to Center)
    const flipCards = document.querySelectorAll('.project-card-container');
    
    // Create backdrop element if not already present
    let backdrop = document.querySelector('.card-focus-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'card-focus-backdrop';
        document.body.appendChild(backdrop);
    }

    function unfocusAllCards() {
        flipCards.forEach(c => c.classList.remove('is-focused'));
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    backdrop.addEventListener('click', unfocusAllCards);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') unfocusAllCards();
    });

    flipCards.forEach(card => {
        // Insert close button on card back header if missing
        const backHeader = card.querySelector('.card-back-header');
        if (backHeader && !backHeader.querySelector('.card-close-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'card-close-btn';
            closeBtn.innerHTML = '&times;';
            closeBtn.title = 'Close Card';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                unfocusAllCards();
            });
            backHeader.appendChild(closeBtn);
        }

        card.addEventListener('click', (e) => {
            // Ignore if clicked directly on an external repository link
            if (e.target.closest('a') || e.target.closest('.card-close-btn')) return;

            const isAlreadyFocused = card.classList.contains('is-focused');
            if (isAlreadyFocused) {
                unfocusAllCards();
            } else {
                unfocusAllCards();
                card.classList.add('is-focused');
                backdrop.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // 5. Authentic Audio Equalizer Wave Canvas (Exact ad1tya.me aesthetic with mouse wave modulation)
    const waveCanvas = document.getElementById('audio-wave-canvas');
    if (waveCanvas) {
        const ctx = waveCanvas.getContext('2d');
        let width = waveCanvas.width = waveCanvas.offsetWidth;
        let height = waveCanvas.height = waveCanvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = waveCanvas.width = waveCanvas.offsetWidth;
            height = waveCanvas.height = waveCanvas.offsetHeight;
        });

        // 72 columns exactly matching the reference waveform density
        const barCount = 72;
        let frame = 0;
        let mouseX = -1000;
        let isHovered = false;

        // Ripples / musical drop pulses
        const ripples = [];

        function triggerWavePulse(xPos) {
            ripples.push({
                x: xPos,
                radius: 0,
                maxRadius: 260,
                amplitude: 1.0,
                speed: 4.5
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

            vizBox.addEventListener('click', (e) => {
                const rect = waveCanvas.getBoundingClientRect();
                triggerWavePulse(e.clientX - rect.left);
            });
        }

        function renderAudioWave() {
            ctx.clearRect(0, 0, width, height);

            const barWidth = width / barCount;
            const centerY = height / 2;
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';

            // Update pulse ripples
            for (let r = ripples.length - 1; r >= 0; r--) {
                const rip = ripples[r];
                rip.radius += rip.speed;
                rip.amplitude *= 0.96;
                if (rip.amplitude < 0.02 || rip.radius > rip.maxRadius) {
                    ripples.splice(r, 1);
                }
            }

            for (let i = 0; i < barCount; i++) {
                const x = i * barWidth + barWidth / 2;
                const normI = i / barCount;

                // Envelope mimicking the authentic waveform in user's image:
                // Low at left/right edges, dense organic bulge in center
                const envelope = Math.sin(normI * Math.PI);
                const wave1 = Math.sin((i * 0.18) + (frame * 0.04)) * 0.35 + 0.65;
                const wave2 = Math.cos((i * 0.28) - (frame * 0.025)) * 0.2 + 0.8;

                let colHeight = (envelope * 48 * wave1 * wave2) + 5;

                // Interactive mouse proximity wave modulation
                if (isHovered && mouseX > 0) {
                    const distToMouse = Math.abs(x - mouseX);
                    if (distToMouse < 90) {
                        const influence = Math.cos((distToMouse / 90) * (Math.PI / 2));
                        colHeight += influence * 22;
                    }
                }

                // Interactive click ripples (harmonic wave propagation)
                for (let r = 0; r < ripples.length; r++) {
                    const rip = ripples[r];
                    const distToDrop = Math.abs(x - rip.x);
                    if (Math.abs(distToDrop - rip.radius) < 45) {
                        const rippleEnvelope = Math.cos(((distToDrop - rip.radius) / 45) * (Math.PI / 2));
                        const rippleWave = Math.sin((distToDrop - rip.radius) * 0.15);
                        colHeight += rippleEnvelope * rippleWave * (rip.amplitude * 32);
                    }
                }

                colHeight = Math.max(3, colHeight);

                // Draw vertical stack of discrete dashes/dots
                const dotSpacing = 5.5;
                const dotsInCol = Math.floor(colHeight / dotSpacing);

                for (let d = -dotsInCol; d <= dotsInCol; d++) {
                    const y = centerY + (d * dotSpacing);
                    ctx.fillStyle = isLight ? '#09090b' : '#ffffff';
                    // Fades naturally toward the extremities of each vertical bar
                    ctx.globalAlpha = Math.max(0.18, 1 - Math.abs(d) / (dotsInCol + 2));
                    ctx.fillRect(x - 1, y - 1, 2, 2);
                }
            }

            ctx.globalAlpha = 1.0;
            frame++;
            requestAnimationFrame(renderAudioWave);
        }

        renderAudioWave();
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
