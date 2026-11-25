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

    // 5. Aesthetic Minimalist Audio Spectrum (Sleek Glassmorphic Soundwave Bars)
    const waveCanvas = document.getElementById('audio-wave-canvas');
    if (waveCanvas) {
        const ctx = waveCanvas.getContext('2d');
        let width = waveCanvas.width = waveCanvas.offsetWidth;
        let height = waveCanvas.height = waveCanvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = waveCanvas.width = waveCanvas.offsetWidth;
            height = waveCanvas.height = waveCanvas.offsetHeight;
        });

        // 56 slender aesthetic vertical bars
        const numBars = 56;
        const currentLevels = new Array(numBars).fill(0.1);
        const peakLevels = new Array(numBars).fill(0.1);

        let frame = 0;
        let mouseX = -1000;
        let isHovered = false;

        const shockwaves = [];

        function triggerEQBurst(xPos) {
            shockwaves.push({
                x: xPos,
                radius: 0,
                maxRadius: 320,
                force: 1.0,
                speed: 6.0
            });
        }

        const vizBox = document.querySelector('.audio-visualizer-box');
        if (vizBox) {
            vizBox.style.cursor = 'pointer';
            vizBox.setAttribute('title', 'Click to pulse audio waveform / Hover to interact');

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
                triggerEQBurst(e.clientX - rect.left);
            });
        }

        function drawAestheticSpectrum() {
            ctx.clearRect(0, 0, width, height);

            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            const paddingX = 32;
            const availableWidth = width - (paddingX * 2);
            const slotWidth = availableWidth / numBars;
            const barW = Math.max(2.5, slotWidth * 0.42); // Sleek slender bar ratio
            const centerY = height / 2;
            const maxAmplitude = height * 0.38;

            // Smooth rhythmic musical clock
            const beatPulse = Math.pow(Math.sin(frame * 0.045), 6) * 0.35 + 0.65;
            const bassKick = Math.pow(Math.max(0, Math.sin(frame * 0.0225)), 8) * 0.4;
            const synthArp = Math.sin(frame * 0.06);

            // Update ripples
            for (let s = shockwaves.length - 1; s >= 0; s--) {
                const sw = shockwaves[s];
                sw.radius += sw.speed;
                sw.force *= 0.94;
                if (sw.force < 0.02 || sw.radius > sw.maxRadius) {
                    shockwaves.splice(s, 1);
                }
            }

            for (let i = 0; i < numBars; i++) {
                const barCenterX = paddingX + i * slotWidth + slotWidth / 2;
                const normI = i / numBars;

                // Natural parabolic curve peaked gracefully around the center-left
                const envelope = Math.sin(normI * Math.PI);
                const harmonic1 = Math.sin((i * 0.22) + (frame * 0.04)) * 0.3 + 0.7;
                const harmonic2 = Math.cos((i * 0.14) - (frame * 0.03)) * 0.25 + 0.75;
                const microFluctuation = Math.sin((frame * 0.12) + i * 1.5) * 0.1;

                let target = envelope * (0.35 + (harmonic1 * harmonic2 * beatPulse * 0.45) + (microFluctuation * 0.2));

                // Left bass resonance
                if (i < 12) {
                    target += (1 - i / 12) * bassKick;
                }
                // Center melody resonance
                if (i > 15 && i < 40) {
                    const midFactor = Math.sin(((i - 15) / 25) * Math.PI);
                    target += midFactor * synthArp * 0.15;
                }

                // Interactive cursor proximity (smooth magnetic swell)
                if (isHovered && mouseX > 0) {
                    const dist = Math.abs(barCenterX - mouseX);
                    if (dist < 85) {
                        const swell = Math.cos((dist / 85) * (Math.PI / 2));
                        target += swell * 0.55;
                    }
                }

                // Click ripples
                for (let s = 0; s < shockwaves.length; s++) {
                    const sw = shockwaves[s];
                    const distToWave = Math.abs(barCenterX - sw.x);
                    if (Math.abs(distToWave - sw.radius) < 40) {
                        const waveFactor = Math.cos(((distToWave - sw.radius) / 40) * (Math.PI / 2));
                        target += waveFactor * sw.force * 0.6;
                    }
                }

                target = Math.max(0.06, Math.min(1.0, target));

                // Interpolate for buttery fluid motion
                currentLevels[i] += (target - currentLevels[i]) * 0.14;

                // Peak tracking for subtle glowing crest line
                if (currentLevels[i] > peakLevels[i]) {
                    peakLevels[i] = currentLevels[i];
                } else {
                    peakLevels[i] *= 0.985;
                }

                const currentH = Math.max(4, currentLevels[i] * maxAmplitude);
                const barX = barCenterX - barW / 2;

                // --- Symmetrical Vertical Soundwave with Pill Rounded Ends ---
                const topY = centerY - currentH;
                const botY = centerY + currentH;
                const barTotalH = currentH * 2;
                const radius = barW / 2;

                // Create sleek vertical gradient
                const gradient = ctx.createLinearGradient(0, topY, 0, botY);
                if (isLight) {
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
                    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.9)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
                } else {
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
                    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
                }

                ctx.fillStyle = gradient;

                // Draw sleek capsule pill
                ctx.beginPath();
                ctx.roundRect(barX, topY, barW, barTotalH, radius);
                ctx.fill();

                // Subtle top & bottom luminous micro-dots
                const peakH = peakLevels[i] * maxAmplitude;
                const peakAlpha = Math.max(0.2, (peakLevels[i] - 0.1) * 0.8);

                ctx.fillStyle = isLight ? `rgba(0, 0, 0, ${peakAlpha})` : `rgba(255, 255, 255, ${peakAlpha})`;
                // Top floating pip
                ctx.fillRect(barX, centerY - peakH - 3, barW, 1.5);
                // Bottom mirror pip
                ctx.fillRect(barX, centerY + peakH + 2, barW, 1.5);
            }

            // Subtle center guide horizon
            ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)';
            ctx.fillRect(paddingX, centerY, availableWidth, 1);

            frame++;
            requestAnimationFrame(drawAestheticSpectrum);
        }

        drawAestheticSpectrum();
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
