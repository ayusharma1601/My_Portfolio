// Modern Interactive Portfolio Scripts (ad1tya.me minimalist architecture)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Current Year & Real-time Live Age Counter (Precise floating decimal age ticker)
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const ageSpan = document.getElementById('live-age');
    if (ageSpan) {
        // Birthday around January 2005 (21.x in 2026)
        const birthDate = new Date('2005-01-16T00:00:00Z').getTime();

        function updateAgeTicker() {
            const now = Date.now();
            const ageInYears = (now - birthDate) / (1000 * 60 * 60 * 24 * 365.2425);
            ageSpan.textContent = ageInYears.toFixed(9);
            requestAnimationFrame(updateAgeTicker);
        }
        updateAgeTicker();
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

    // 5. Retro Game Dev Looped Cinematic (Autonomous Game Video Animation)
    const canvas = document.getElementById('audio-wave-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        });

        let frame = 0;
        let score = 2480;

        // Player Ship with AI autopilot
        const ship = {
            x: width * 0.16,
            y: height * 0.5,
            targetY: height * 0.5,
            speed: 0.08
        };

        const lasers = [];
        const asteroids = [];
        const particles = [];
        const stars = [];

        // Prepopulate starfield
        for (let i = 0; i < 50; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speed: 0.6 + Math.random() * 1.8,
                size: Math.random() > 0.8 ? 1.5 : 1
            });
        }

        function spawnAsteroid() {
            if (asteroids.length < 6) {
                const astY = 20 + Math.random() * (height - 40);
                asteroids.push({
                    x: width + 25,
                    y: astY,
                    vx: -(1.4 + Math.random() * 1.6),
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: 7 + Math.random() * 6,
                    hp: 2,
                    rotation: 0,
                    vRot: (Math.random() - 0.5) * 0.04
                });
            }
        }

        function createExplosion(x, y, count = 10) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.0 + Math.random() * 2.5;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1.0,
                    decay: 0.03 + Math.random() * 0.03
                });
            }
        }

        // Auto-pilot AI routine targeting the nearest incoming threat
        function updateAutopilotAI() {
            let closestAst = null;
            let minDist = Infinity;

            for (let i = 0; i < asteroids.length; i++) {
                const a = asteroids[i];
                if (a.x > ship.x && a.x < minDist) {
                    minDist = a.x;
                    closestAst = a;
                }
            }

            if (closestAst) {
                // Steer ship to align horizontally with the incoming target
                ship.targetY = closestAst.y + closestAst.vy * 10;
                
                // Autonomous weapon firing when locked on
                if (Math.abs(ship.y - closestAst.y) < 16 && frame % 18 === 0) {
                    lasers.push({ x: ship.x + 12, y: ship.y - 3, vx: 7.5 });
                    lasers.push({ x: ship.x + 12, y: ship.y + 3, vx: 7.5 });
                }
            } else {
                // Idle gentle sinus patrol wave
                ship.targetY = height * 0.5 + Math.sin(frame * 0.035) * (height * 0.28);
                if (frame % 28 === 0) {
                    lasers.push({ x: ship.x + 12, y: ship.y - 3, vx: 7.5 });
                    lasers.push({ x: ship.x + 12, y: ship.y + 3, vx: 7.5 });
                }
            }

            ship.y += (ship.targetY - ship.y) * ship.speed;
        }

        function runGameLoop() {
            ctx.clearRect(0, 0, width, height);
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';

            // --- 1. Starfield Parallax ---
            ctx.fillStyle = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.45)';
            stars.forEach(star => {
                star.x -= star.speed;
                if (star.x < 0) {
                    star.x = width;
                    star.y = Math.random() * height;
                }
                ctx.fillRect(star.x, star.y, star.size, star.size);
            });

            // Update autopilot and asteroid spawn
            updateAutopilotAI();
            if (frame % 70 === 0) {
                spawnAsteroid();
            }

            // --- 2. Update & Draw Lasers ---
            ctx.fillStyle = '#38bdf8';
            for (let l = lasers.length - 1; l >= 0; l--) {
                const laser = lasers[l];
                laser.x += laser.vx;

                ctx.fillRect(laser.x, laser.y - 1, 9, 2);

                if (laser.x > width + 10) {
                    lasers.splice(l, 1);
                }
            }

            // --- 3. Update & Draw Asteroids ---
            for (let a = asteroids.length - 1; a >= 0; a--) {
                const ast = asteroids[a];
                ast.x += ast.vx;
                ast.y += ast.vy;
                ast.rotation += ast.vRot;

                // Laser vs Asteroid Collisions
                for (let l = lasers.length - 1; l >= 0; l--) {
                    const laser = lasers[l];
                    const dist = Math.hypot(laser.x - ast.x, laser.y - ast.y);
                    if (dist < ast.radius + 3) {
                        createExplosion(laser.x, laser.y, 6);
                        lasers.splice(l, 1);
                        ast.hp--;
                        if (ast.hp <= 0) {
                            createExplosion(ast.x, ast.y, 14);
                            score += 100;
                            asteroids.splice(a, 1);
                            break;
                        }
                    }
                }

                if (!asteroids[a]) continue;

                // Wireframe Polygon Asteroid
                ctx.save();
                ctx.translate(ast.x, ast.y);
                ctx.rotate(ast.rotation);
                ctx.strokeStyle = isLight ? '#09090b' : '#ffffff';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                const sides = 6;
                for (let s = 0; s < sides; s++) {
                    const angle = (s / sides) * Math.PI * 2;
                    const r = ast.radius * (0.8 + (s % 2) * 0.35);
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    if (s === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.restore();

                if (ast.x < -ast.radius * 2) {
                    asteroids.splice(a, 1);
                }
            }

            // --- 4. Particles ---
            for (let p = particles.length - 1; p >= 0; p--) {
                const pt = particles[p];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.life -= pt.decay;

                if (pt.life <= 0) {
                    particles.splice(p, 1);
                    continue;
                }

                ctx.fillStyle = isLight 
                    ? `rgba(0, 0, 0, ${pt.life})` 
                    : `rgba(255, 255, 255, ${pt.life})`;
                ctx.fillRect(pt.x, pt.y, 2, 2);
            }

            // --- 5. Draw Player Vector Fighter ---
            ctx.save();
            ctx.translate(ship.x, ship.y);

            // Engine thrust flame
            const thrust = Math.random() * 7 + 4;
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(-10, -3);
            ctx.lineTo(-10 - thrust, 0);
            ctx.lineTo(-10, 3);
            ctx.closePath();
            ctx.fill();

            // Ship Body
            ctx.strokeStyle = isLight ? '#000000' : '#ffffff';
            ctx.fillStyle = isLight ? '#f4f4f5' : '#18181b';
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.moveTo(12, 0);       // Nose
            ctx.lineTo(-10, -7);     // Left wing
            ctx.lineTo(-5, 0);       // Thruster joint
            ctx.lineTo(-10, 7);      // Right wing
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cockpit Canopy
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(0, -1.5, 4, 3);

            ctx.restore();

            // --- 6. Telemetry Monospace HUD ---
            // Keep clean without top corner text overlays

            frame++;
            requestAnimationFrame(runGameLoop);
        }

        runGameLoop();
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
