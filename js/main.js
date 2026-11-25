// Modern Interactive Portfolio Scripts (ad1tya.me architecture)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Current Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Multi-Theme Switching (with localStorage persistence)
    const themeSelector = document.getElementById('theme-selector');
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeSelector) {
        themeSelector.value = savedTheme;
        themeSelector.addEventListener('change', (e) => {
            const chosen = e.target.value;
            document.documentElement.setAttribute('data-theme', chosen);
            localStorage.setItem('portfolio-theme', chosen);
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

    // 4. Interactive Terminal Banner Canvas (Digital Signal & Grid Waves)
    const canvas = document.getElementById('terminal-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        });

        let frame = 0;
        const columns = Math.floor(width / 24);
        const chars = '01AYUSH_SYSTEMS_GODOT_FASTAPI_PYTHON_WASM_DSA';

        function drawTerminalBanner() {
            ctx.fillStyle = 'rgba(9, 10, 15, 0.2)';
            ctx.fillRect(0, 0, width, height);

            // Digital Grid Lines
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 30) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            // Animated wave line
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
            ctx.lineWidth = 1.5;
            for (let x = 0; x < width; x += 5) {
                const y = height / 2 + Math.sin((x * 0.015) + (frame * 0.04)) * 22;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Digital telemetry particle dots
            ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
            for (let i = 0; i < 6; i++) {
                const px = (Math.sin(frame * 0.02 + i) * 0.5 + 0.5) * width;
                const py = (Math.cos(frame * 0.03 + i) * 0.5 + 0.5) * height;
                ctx.fillRect(px, py, 2, 2);
            }

            frame++;
            requestAnimationFrame(drawTerminalBanner);
        }

        drawTerminalBanner();
    }

    // 5. Contact Form Handler (Direct transmission to aysharma1601@gmail.com)
    const contactForm = document.getElementById('contact-form');
    const toast = document.getElementById('toast');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const message = document.getElementById('form-message').value.trim();

            if (!name || !email || !message) {
                showToast('Please fill in all fields.');
                return;
            }

            const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
            const body = encodeURIComponent(`Sender: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            
            window.location.href = `mailto:aysharma1601@gmail.com?subject=${subject}&body=${body}`;

            showToast('Opening your email client to send message...');
            contactForm.reset();
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
