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

    // 5. Retro Game Dev Terminal / Micro-Arcade Blaster (Built directly in canvas)
    const canvas = document.getElementById('audio-wave-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        });

        // Game State
        let score = 0;
        let lives = 3;
        let frame = 0;
        let mouseX = width / 2;
        let mouseY = height / 2;
        let isHovered = false;

        // Player Ship (Minimalist wireframe vector fighter)
        const ship = {
            x: width * 0.15,
            y: height * 0.5,
            targetY: height * 0.5,
            size: 11,
            speed: 0.14
        };

        // Arrays for laser projectiles, asteroids, explosion particles, starfield
        const lasers = [];
        const asteroids = [];
        const particles = [];
        const stars = [];

        // Initialize background starfield
        for (let i = 0; i < 45; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speed: 0.5 + Math.random() * 1.5,
                size: Math.random() > 0.8 ? 1.5 : 1
            });
        }

        function spawnAsteroid() {
            if (asteroids.length < 5) {
                asteroids.push({
                    x: width + 20,
                    y: 18 + Math.random() * (height - 36),
                    vx: -(1.2 + Math.random() * 1.8),
                    vy: (Math.random() - 0.5) * 0.4,
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

        const vizBox = document.querySelector('.audio-visualizer-box');
        if (vizBox) {
            vizBox.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
                isHovered = true;
                ship.targetY = Math.max(16, Math.min(height - 16, mouseY));
            });

            vizBox.addEventListener('mouseleave', () => {
                isHovered = false;
            });

            // Click fires lasers
            vizBox.addEventListener('click', (e) => {
                const rect = canvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // Fire two twin lasers from ship
                lasers.push({ x: ship.x + 12, y: ship.y - 3, vx: 7 });
                lasers.push({ x: ship.x + 12, y: ship.y + 3, vx: 7 });
            });
        }

        // Auto-fire cadence if user hovers
        let fireCooldown = 0;

        function runGameLoop() {
            ctx.clearRect(0, 0, width, height);
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';

            // --- 1. Draw Starfield Background ---
            ctx.fillStyle = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.45)';
            stars.forEach(star => {
                star.x -= star.speed;
                if (star.x < 0) {
                    star.x = width;
                    star.y = Math.random() * height;
                }
                ctx.fillRect(star.x, star.y, star.size, star.size);
            });

            // Smooth ship tracking
            ship.y += (ship.targetY - ship.y) * ship.speed;

            // Spawn asteroids at intervals
            if (frame % 80 === 0) {
                spawnAsteroid();
            }

            // Auto-fire every 28 frames when active
            fireCooldown++;
            if (isHovered && fireCooldown > 26) {
                lasers.push({ x: ship.x + 12, y: ship.y - 3, vx: 7 });
                lasers.push({ x: ship.x + 12, y: ship.y + 3, vx: 7 });
                fireCooldown = 0;
            }

            // --- 2. Update & Draw Lasers ---
            ctx.fillStyle = '#38bdf8'; // Cyan laser energy
            for (let l = lasers.length - 1; l >= 0; l--) {
                const laser = lasers[l];
                laser.x += laser.vx;

                ctx.fillRect(laser.x, laser.y - 1, 8, 2);

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

                // Laser vs Asteroid Collision
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

                // Draw Polygon Asteroid (Vector Wireframe)
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

                // Remove off-screen
                if (ast.x < -ast.radius * 2) {
                    asteroids.splice(a, 1);
                }
            }

            // --- 4. Update & Draw Explosion Particles ---
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

            // --- 5. Draw Player Vector Ship ---
            ctx.save();
            ctx.translate(ship.x, ship.y);

            // Engine thrust glow
            const thrust = Math.random() * 6 + 4;
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(-10, -3);
            ctx.lineTo(-10 - thrust, 0);
            ctx.lineTo(-10, 3);
            ctx.closePath();
            ctx.fill();

            // Fighter Body (Sharp Vector Geometry)
            ctx.strokeStyle = isLight ? '#000000' : '#ffffff';
            ctx.fillStyle = isLight ? '#f4f4f5' : '#18181b';
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.moveTo(12, 0);       // Nose
            ctx.lineTo(-10, -7);     // Left wing
            ctx.lineTo(-5, 0);       // Core
            ctx.lineTo(-10, 7);      // Right wing
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cockpit canopy accent
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(0, -1.5, 4, 3);

            ctx.restore();

            // --- 6. Telemetry HUD (Retro Monospace Text) ---
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillStyle = isLight ? '#71717a' : '#a1a1aa';
            ctx.textAlign = 'left';
            ctx.fillText(`GODOT_DEV // SCORE: ${score}`, 16, 18);

            ctx.textAlign = 'right';
            ctx.fillText(isHovered ? 'STATUS: ENGAGED [CLICK FIRE]' : 'MOUSE OVER TO PILOT', width - 16, 18);

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
