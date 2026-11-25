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

    // 5. Interactive Aesthetic Vinyl Turntable with Live Grooves, Scratching & Tone Arm
    const canvas = document.getElementById('audio-wave-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        });

        // Turntable State
        let rotation = 0;
        let rpmSpeed = 0.022; // 33 1/3 RPM aesthetic cruise
        let isDragging = false;
        let lastMouseAngle = 0;
        let scratchVelocity = 0;
        let isPowerOn = true;

        // Sound Synthesis (Web Audio API vinyl scratch / white noise & retro bass drone)
        let audioCtx = null;
        let scratchOsc = null;
        let scratchGain = null;

        function initTurntableAudio() {
            if (audioCtx) return;
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                
                // Noise buffer for authentic vinyl surface crackle & scratch
                const bufferSize = audioCtx.sampleRate * 2;
                const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = (Math.random() * 2 - 1) * 0.04;
                }

                const whiteNoise = audioCtx.createBufferSource();
                whiteNoise.buffer = noiseBuffer;
                whiteNoise.loop = true;

                // Bandpass filter for vinyl texture
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 850;
                filter.Q.value = 1.2;

                scratchGain = audioCtx.createGain();
                scratchGain.gain.value = 0.035;

                whiteNoise.connect(filter);
                filter.connect(scratchGain);
                scratchGain.connect(audioCtx.destination);
                whiteNoise.start(0);
            } catch (e) {
                console.log('Audio init skipped:', e);
            }
        }

        const deck = document.getElementById('turntable-deck');

        function getAngleFromCenter(e) {
            const rect = canvas.getBoundingClientRect();
            // Vinyl center is around 32% from left
            const centerX = rect.left + rect.width * 0.32;
            const centerY = rect.top + rect.height * 0.5;
            return Math.atan2(e.clientY - centerY, e.clientX - centerX);
        }

        if (deck) {
            deck.addEventListener('mousedown', (e) => {
                initTurntableAudio();
                if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
                isDragging = true;
                lastMouseAngle = getAngleFromCenter(e);
            });

            window.addEventListener('mouseup', () => {
                isDragging = false;
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const currentAngle = getAngleFromCenter(e);
                let delta = currentAngle - lastMouseAngle;

                // Handle angular wrap-around (-PI to PI)
                if (delta > Math.PI) delta -= Math.PI * 2;
                if (delta < -Math.PI) delta += Math.PI * 2;

                rotation += delta;
                scratchVelocity = delta * 1.5;
                lastMouseAngle = currentAngle;

                // Modulate vinyl texture filter on scratch
                if (scratchGain && audioCtx) {
                    scratchGain.gain.setTargetAtTime(Math.min(0.25, Math.abs(delta) * 1.8), audioCtx.currentTime, 0.02);
                }
            });

            // Toggle play/pause power switch on double click
            deck.addEventListener('dblclick', () => {
                isPowerOn = !isPowerOn;
            });
        }

        // Animated soundwave spectrum bars displayed on right side LCD display
        const spectrumCount = 28;
        const spectrumLevels = new Array(spectrumCount).fill(0.1);
        let frame = 0;

        function renderTurntable() {
            ctx.clearRect(0, 0, width, height);

            const isLight = document.documentElement.getAttribute('data-theme') === 'light';

            // Vinyl center and radius
            const platterX = width * 0.28;
            const platterY = height * 0.5;
            const platterRadius = Math.min(height * 0.44, 68);

            // Update rotation
            if (isDragging) {
                // Controlled by mouse drag
            } else if (isPowerOn) {
                // Smooth deceleration back to normal RPM speed
                scratchVelocity *= 0.92;
                rotation += rpmSpeed + scratchVelocity;
                if (scratchGain && audioCtx) {
                    scratchGain.gain.setTargetAtTime(0.02, audioCtx.currentTime, 0.1);
                }
            } else {
                scratchVelocity *= 0.94;
                rotation += scratchVelocity;
                if (scratchGain && audioCtx) {
                    scratchGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.1);
                }
            }

            // ==========================================
            // 1. TURNTABLE PLATTER & VINYL DISC
            // ==========================================
            // Outer Platter Rim (Metallic Silver)
            ctx.beginPath();
            ctx.arc(platterX, platterY, platterRadius + 3, 0, Math.PI * 2);
            ctx.fillStyle = isLight ? '#d4d4d8' : '#27272a';
            ctx.fill();

            // Vinyl Black Disc Body
            ctx.beginPath();
            ctx.arc(platterX, platterY, platterRadius, 0, Math.PI * 2);
            ctx.fillStyle = isLight ? '#18181b' : '#0a0a0c';
            ctx.fill();
            ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Concentric Micro-Grooves with Dynamic Light Sheen
            ctx.save();
            ctx.translate(platterX, platterY);
            ctx.rotate(rotation);

            const grooveRadii = [0.88, 0.78, 0.68, 0.58, 0.48];
            grooveRadii.forEach(factor => {
                ctx.beginPath();
                ctx.arc(0, 0, platterRadius * factor, 0, Math.PI * 2);
                ctx.strokeStyle = isLight ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Realistic Anisotropic Vinyl Light Reflection Sheen (Dual cone reflection)
            const sheenGradient = ctx.createLinearGradient(-platterRadius, -platterRadius, platterRadius, platterRadius);
            sheenGradient.addColorStop(0, 'rgba(255,255,255,0.0)');
            sheenGradient.addColorStop(0.48, 'rgba(255,255,255,0.08)');
            sheenGradient.addColorStop(0.52, 'rgba(255,255,255,0.0)');
            sheenGradient.addColorStop(1, 'rgba(255,255,255,0.0)');
            ctx.fillStyle = sheenGradient;
            ctx.beginPath();
            ctx.arc(0, 0, platterRadius, 0, Math.PI * 2);
            ctx.fill();

            // Center Label (Retro Minimalist Record Sticker)
            const labelRadius = platterRadius * 0.35;
            ctx.beginPath();
            ctx.arc(0, 0, labelRadius, 0, Math.PI * 2);
            ctx.fillStyle = isLight ? '#ffffff' : '#141416';
            ctx.fill();
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Spindle Center Hole
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#71717a';
            ctx.fill();

            // Label Graphic (Tiny revolving marker)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(4, -1, labelRadius - 8, 2);

            ctx.restore();

            // ==========================================
            // 2. TONEARM & CARTRIDGE NEEDLE
            // ==========================================
            const armPivotX = platterX + platterRadius + 28;
            const armPivotY = platterY - platterRadius * 0.65;
            const needleX = platterX + platterRadius * 0.58;
            const needleY = platterY + platterRadius * 0.22;

            // Pivot Base
            ctx.beginPath();
            ctx.arc(armPivotX, armPivotY, 8, 0, Math.PI * 2);
            ctx.fillStyle = isLight ? '#71717a' : '#3f3f46';
            ctx.fill();
            ctx.strokeStyle = isLight ? '#27272a' : '#71717a';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Metallic Tonearm Rod
            ctx.beginPath();
            ctx.moveTo(armPivotX, armPivotY);
            // Curved modern S-shape tonearm
            const midArmX = (armPivotX + needleX) / 2 + 6;
            const midArmY = (armPivotY + needleY) / 2 - 4;
            ctx.quadraticCurveTo(midArmX, midArmY, needleX, needleY);
            ctx.strokeStyle = isLight ? '#18181b' : '#e4e4e7';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Cartridge Head & Stylus Needle Head
            ctx.save();
            ctx.translate(needleX, needleY);
            ctx.rotate(0.35);
            ctx.fillStyle = '#ef4444'; // Red Hi-Fi cartridge
            ctx.fillRect(-3, -2, 9, 5);
            ctx.restore();

            // ==========================================
            // 3. RIGHT SIDE: HIGH-FI LCD AUDIO SPECTRUM & DECK CONTROLS
            // ==========================================
            const lcdLeft = Math.max(platterX + platterRadius + 56, width * 0.52);
            const lcdRight = width - 28;
            const lcdWidth = lcdRight - lcdLeft;
            const lcdY = height * 0.5;

            if (lcdWidth > 80) {
                // Technical Display Label Header
                ctx.font = '10px "JetBrains Mono", monospace';
                ctx.fillStyle = isLight ? '#71717a' : '#a1a1aa';
                ctx.textAlign = 'left';
                ctx.fillText('ANALOG HI-FI // 33 RPM', lcdLeft, lcdY - 32);

                // Live Status Pill
                ctx.textAlign = 'right';
                ctx.fillStyle = isPowerOn ? '#10b981' : '#f59e0b';
                ctx.fillText(isPowerOn ? '● SPINNING' : '■ STOPPED', lcdRight, lcdY - 32);

                // Multi-Frequency Visualizer Bars
                const barSlotW = lcdWidth / spectrumCount;
                const barActualW = Math.max(2, barSlotW - 2.5);

                for (let b = 0; b < spectrumCount; b++) {
                    const normB = b / spectrumCount;
                    const barX = lcdLeft + b * barSlotW;

                    // Calculate live musical frequency response
                    const envelope = Math.sin(normB * Math.PI);
                    const rhythmBeat = isPowerOn ? Math.sin((frame * 0.08) + b * 0.4) * 0.35 + 0.65 : 0.05;
                    const scratchBounce = Math.abs(scratchVelocity) * 12;
                    let targetH = envelope * (24 * rhythmBeat + scratchBounce) + 4;

                    spectrumLevels[b] += (targetH - spectrumLevels[b]) * 0.2;
                    const h = Math.max(3, Math.min(36, spectrumLevels[b]));

                    // Draw pill bar
                    const topBarY = lcdY - h / 2 + 6;
                    ctx.fillStyle = isLight 
                        ? (b % 4 === 0 ? '#3b82f6' : '#18181b')
                        : (b % 4 === 0 ? '#38bdf8' : 'rgba(255, 255, 255, 0.85)');
                    
                    ctx.beginPath();
                    ctx.roundRect(barX, topBarY, barActualW, h, barActualW / 2);
                    ctx.fill();
                }

                // Interactive Hint Subtext
                ctx.font = '9px "JetBrains Mono", monospace';
                ctx.fillStyle = isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
                ctx.textAlign = 'left';
                ctx.fillText('DRAG VINYL TO SCRATCH • DBL CLICK POWER', lcdLeft, lcdY + 36);
            }

            frame++;
            requestAnimationFrame(renderTurntable);
        }

        renderTurntable();
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
