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

    // 5. Musical Audio Spectrum Equalizer with Interactive Harmonic Ripples
    const waveCanvas = document.getElementById('audio-wave-canvas');
    if (waveCanvas) {
        const ctx = waveCanvas.getContext('2d');
        let width = waveCanvas.width = waveCanvas.offsetWidth;
        let height = waveCanvas.height = waveCanvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = waveCanvas.width = waveCanvas.offsetWidth;
            height = waveCanvas.height = waveCanvas.offsetHeight;
        });

        const barCount = 76;
        let frame = 0;
        let mouseX = -1000;
        let isHovered = false;

        // Interactive musical ripples / frequency bursts on click
        const pulses = [];

        function addMusicalPulse(targetX) {
            pulses.push({
                x: targetX,
                radius: 0,
                maxRadius: 240,
                amplitude: 1.0,
                freqMultiplier: 0.18 + Math.random() * 0.12,
                speed: 4.0
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
                const clickX = e.clientX - rect.left;
                addMusicalPulse(clickX);
            });
        }

        // Procedural rhythm & frequency spectrum simulation
        // (Bass on left, Mid vocal frequencies in center, High hats/treble on right)
        function renderMusicVisualizer() {
            ctx.clearRect(0, 0, width, height);

            const barWidth = width / barCount;
            const centerY = height / 2;

            // Musical tempo: 124 BPM rhythm cycles
            const beatPulse = Math.pow(Math.sin(frame * 0.05), 4) * 0.4 + 0.6;
            const subBassBeat = Math.pow(Math.max(0, Math.sin(frame * 0.025)), 6) * 18;
            const snareAccent = Math.pow(Math.max(0, Math.cos(frame * 0.05)), 8) * 14;

            // Update ripples
            for (let p = pulses.length - 1; p >= 0; p--) {
                const pulse = pulses[p];
                pulse.radius += pulse.speed;
                pulse.amplitude *= 0.96;

                if (pulse.amplitude < 0.015 || pulse.radius > pulse.maxRadius) {
                    pulses.splice(p, 1);
                }
            }

            for (let i = 0; i < barCount; i++) {
                const x = i * barWidth + barWidth / 2;
                const normI = i / barCount;

                // Center-heavy envelope like the reference audio wave image
                const envelope = Math.sin(normI * Math.PI);

                // Multi-harmonic musical bands:
                // 1. Low frequency bass oscillations (prominent on 1st third)
                const bassBand = Math.sin((i * 0.12) - (frame * 0.06)) * (1 - normI * 0.6);
                // 2. Mid melody / synth lead waves
                const midSynth = Math.sin((i * 0.28) + (frame * 0.08)) * Math.cos((i * 0.18) - (frame * 0.04));
                // 3. High-frequency percussion / jitter shimmer (hats)
                const trebleJitter = Math.sin((frame * 0.18) + (i * 0.8)) * 0.35;

                // Combine into dynamic music wave amplitude
                let barHeight = envelope * (28 + (midSynth * 22 * beatPulse) + (bassBand * subBassBeat) + (trebleJitter * snareAccent)) + 4;

                // Mouse hover distortion: behaves like touching an audio scrubber / vinyl
                if (isHovered && mouseX > 0) {
                    const distToMouse = Math.abs(x - mouseX);
                    if (distToMouse < 90) {
                        const hoverInfluence = Math.cos((distToMouse / 90) * (Math.PI / 2));
                        // High-energy resonance peak under cursor
                        const resonance = Math.sin(frame * 0.2 + (i * 0.4)) * 12;
                        barHeight += hoverInfluence * (24 + resonance);
                    }
                }

                // Propagate musical click ripple bursts
                for (let p = 0; p < pulses.length; p++) {
                    const pulse = pulses[p];
                    const distToPulse = Math.abs(x - pulse.x);
                    const wavePhase = (distToPulse - pulse.radius) * pulse.freqMultiplier;

                    if (Math.abs(distToPulse - pulse.radius) < 50) {
                        const pulseEnvelope = Math.cos(((distToPulse - pulse.radius) / 50) * (Math.PI / 2));
                        const rippleWave = Math.sin(wavePhase);
                        const displacement = pulseEnvelope * rippleWave * (pulse.amplitude * 48);
                        barHeight += displacement;
                    }
                }

                barHeight = Math.max(3, barHeight);

                // Render discrete equalizer dots/dashes
                const dotSpacing = 5.2;
                const dotsInCol = Math.floor(barHeight / dotSpacing);

                for (let d = -dotsInCol; d <= dotsInCol; d++) {
                    const y = centerY + (d * dotSpacing);
                    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                    ctx.fillStyle = isLight ? '#09090b' : '#ffffff';
                    
                    // Dim dots as they approach peak edges, highlight center rhythm core
                    const alphaDropoff = 1 - Math.abs(d) / (dotsInCol + 2);
                    ctx.globalAlpha = Math.max(0.18, alphaDropoff);
                    ctx.fillRect(x - 1, y - 1, 2, 2);
                }
            }

            ctx.globalAlpha = 1.0;
            frame++;
            requestAnimationFrame(renderMusicVisualizer);
        }

        renderMusicVisualizer();
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
