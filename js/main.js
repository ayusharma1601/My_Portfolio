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

    // 5. Studio Music Spectrum Analyzer (Hardware Audio EQ Bars + Floating Peak Meters)
    const waveCanvas = document.getElementById('audio-wave-canvas');
    if (waveCanvas) {
        const ctx = waveCanvas.getContext('2d');
        let width = waveCanvas.width = waveCanvas.offsetWidth;
        let height = waveCanvas.height = waveCanvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = waveCanvas.width = waveCanvas.offsetWidth;
            height = waveCanvas.height = waveCanvas.offsetHeight;
        });

        // 48 studio equalizer frequency channels
        const numBands = 48;
        const peakCaps = new Array(numBands).fill(0);
        const currentLevels = new Array(numBands).fill(0);

        let frame = 0;
        let mouseX = -1000;
        let isHovered = false;

        // Interactive shock pulses
        const shockwaves = [];

        function triggerEQBurst(xPos) {
            shockwaves.push({
                x: xPos,
                radius: 0,
                maxRadius: 280,
                force: 1.0,
                speed: 5.5
            });
        }

        const vizBox = document.querySelector('.audio-visualizer-box');
        if (vizBox) {
            vizBox.style.cursor = 'pointer';
            vizBox.setAttribute('title', 'Click to strike audio beat burst / Hover to EQ sculpt');

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
                triggerEQBurst(clickX);
            });
        }

        function drawStudioSpectrum() {
            ctx.clearRect(0, 0, width, height);

            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            const paddingX = 24;
            const availableWidth = width - (paddingX * 2);
            const bandTotalWidth = availableWidth / numBands;
            const barWidth = Math.max(3, bandTotalWidth - 3);
            const baselineY = height - 16;
            const maxBarHeight = height - 36;

            // Rhythmic musical clock pulses (Bass, Snare, Hi-hat, Melodic Arpeggio)
            const kickBeat = Math.pow(Math.max(0, Math.sin(frame * 0.05)), 10) * 1.0;
            const snareAccent = Math.pow(Math.max(0, Math.cos(frame * 0.05 + 0.4)), 12) * 0.85;
            const hatRoll = (Math.sin(frame * 0.2) * 0.5 + 0.5) * 0.4;
            const melodySway = Math.sin(frame * 0.035) * 0.25 + 0.75;

            // Update shockwaves
            for (let s = shockwaves.length - 1; s >= 0; s--) {
                const sw = shockwaves[s];
                sw.radius += sw.speed;
                sw.force *= 0.95;
                if (sw.force < 0.02 || sw.radius > sw.maxRadius) {
                    shockwaves.splice(s, 1);
                }
            }

            for (let i = 0; i < numBands; i++) {
                const normI = i / numBands;
                const barCenterX = paddingX + i * bandTotalWidth + barWidth / 2;

                // Frequency response profile (Bass 20Hz-250Hz on left, Mids in center, Treble up to 20kHz on right)
                let targetEnergy = 0.12;

                // 1. Heavy sub-bass & kick drum in first 10 bands
                if (i < 10) {
                    const bassCurve = Math.cos((i / 10) * (Math.PI / 2));
                    const wobble = Math.sin((frame * 0.09) + i * 0.4) * 0.2 + 0.3;
                    targetEnergy = (bassCurve * kickBeat * 0.85) + wobble * 0.3;
                } 
                // 2. Vocal / Synth mids in bands 10 - 32
                else if (i < 32) {
                    const midIndex = (i - 10) / 22;
                    const midCurve = Math.sin(midIndex * Math.PI);
                    const synthHarmony = Math.sin((frame * 0.07) + (i * 0.28)) * 0.3 + 0.4;
                    const snareHit = midCurve * snareAccent;
                    targetEnergy = (midCurve * synthHarmony * melodySway) + (snareHit * 0.6) + 0.15;
                } 
                // 3. Crisp percussion & high-hats in bands 32 - 48
                else {
                    const highRatio = (i - 32) / 16;
                    const flutter = Math.sin((frame * 0.25) + i * 1.2) * 0.25 + 0.25;
                    targetEnergy = (flutter * hatRoll * (1 - highRatio * 0.3)) + 0.1;
                }

                // Interactive mouse frequency boost
                if (isHovered && mouseX > 0) {
                    const dist = Math.abs(barCenterX - mouseX);
                    if (dist < 80) {
                        const hoverFactor = Math.cos((dist / 80) * (Math.PI / 2));
                        targetEnergy += hoverFactor * (0.6 + Math.sin(frame * 0.2 + i) * 0.15);
                    }
                }

                // Interactive click burst
                for (let s = 0; s < shockwaves.length; s++) {
                    const sw = shockwaves[s];
                    const distToWave = Math.abs(barCenterX - sw.x);
                    if (Math.abs(distToWave - sw.radius) < 35) {
                        const burstIntensity = Math.cos(((distToWave - sw.radius) / 35) * (Math.PI / 2));
                        targetEnergy += burstIntensity * (sw.force * 0.9);
                    }
                }

                targetEnergy = Math.min(1.0, Math.max(0.04, targetEnergy));

                // Smooth attack and release dynamics (Fast attack, natural gravity decay)
                if (targetEnergy > currentLevels[i]) {
                    currentLevels[i] = currentLevels[i] * 0.4 + targetEnergy * 0.6; // Instant hit
                } else {
                    currentLevels[i] *= 0.88; // Natural musical release
                }

                const barH = currentLevels[i] * maxBarHeight;
                const barTopY = baselineY - barH;
                const barX = paddingX + i * bandTotalWidth;

                // --- 1. Draw Hardware Segmented EQ Bar ---
                // Segment heights (blocks) resembling mixing consoles
                const segHeight = 4;
                const segGap = 2;
                const numSegments = Math.floor(barH / (segHeight + segGap));

                for (let seg = 0; seg < numSegments; seg++) {
                    const segY = baselineY - (seg + 1) * (segHeight + segGap);
                    const segRatio = (baselineY - segY) / maxBarHeight;

                    // Studio LED color palette:
                    // Green for normal, Yellow for warm, Red for +3dB clipping peak
                    if (isLight) {
                        if (segRatio > 0.82) {
                            ctx.fillStyle = '#ef4444'; // Red peak
                        } else if (segRatio > 0.65) {
                            ctx.fillStyle = '#f59e0b'; // Amber warn
                        } else {
                            ctx.fillStyle = '#18181b'; // Deep dark
                        }
                    } else {
                        if (segRatio > 0.82) {
                            ctx.fillStyle = '#ff4d4d'; // Red peak
                        } else if (segRatio > 0.65) {
                            ctx.fillStyle = '#ffb84d'; // Warm amber
                        } else {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'; // Crisp white LED
                        }
                    }

                    ctx.fillRect(barX, segY, barWidth, segHeight);
                }

                // --- 2. Floating Peak Hold Cap (Essential Studio Gear Indicator) ---
                if (barTopY < peakCaps[i]) {
                    peakCaps[i] = barTopY; // Snap to peak
                } else {
                    peakCaps[i] += 0.85; // Gravity drop
                }

                if (peakCaps[i] > baselineY) peakCaps[i] = baselineY;

                // Draw floating cap
                ctx.fillStyle = isLight ? '#000000' : '#ffffff';
                ctx.fillRect(barX, peakCaps[i] - 2, barWidth, 2);
            }

            // --- 3. Studio Baseline Axis & Frequency Markings ---
            ctx.fillStyle = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)';
            ctx.fillRect(paddingX, baselineY + 2, availableWidth, 1);

            // Frequency Labels (Sub, Low, Mid, High, Air)
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillStyle = isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.4)';
            ctx.textAlign = 'left';
            ctx.fillText('20Hz [BASS]', paddingX, height - 5);
            ctx.textAlign = 'center';
            ctx.fillText('1kHz [MID]', width / 2, height - 5);
            ctx.textAlign = 'right';
            ctx.fillText('20kHz [TREBLE]', width - paddingX, height - 5);

            frame++;
            requestAnimationFrame(drawStudioSpectrum);
        }

        drawStudioSpectrum();
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
