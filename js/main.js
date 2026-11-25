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

    // 4. Playing Card 3D Flip Handler for Projects
    const flipCards = document.querySelectorAll('.project-card-container');
    flipCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Ignore if clicked directly on an external repository link
            if (e.target.closest('a')) return;
            card.classList.toggle('is-flipped');
        });
    });

    // 5. Contact Form Handler (Direct Silent Background Submission to Formspree / Email)
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
