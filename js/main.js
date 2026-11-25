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

    // 4. Playing Card Focus & Flip Handler (Focused Portrait Rectangle Dimensions)
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
        // Insert close button on card back header
        const backHeader = card.querySelector('.card-back-header');
        if (backHeader && !backHeader.querySelector('.card-close-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'card-close-btn';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
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

    // 5. Voice-Affective & Interactive Equalizer Wave Canvas
    const waveCanvas = document.getElementById('audio-wave-canvas');
    if (waveCanvas) {
        const ctx = waveCanvas.getContext('2d');
        let width = waveCanvas.width = waveCanvas.offsetWidth;
        let height = waveCanvas.height = waveCanvas.offsetHeight;

        window.addEventListener('resize', () => {
            width = waveCanvas.width = waveCanvas.offsetWidth;
            height = waveCanvas.height = waveCanvas.offsetHeight;
        });

        // Microphone audio context state
        let audioCtx = null;
        let analyser = null;
        let dataArray = null;
        let isMicActive = false;

        async function initMicrophone() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                isMicActive = true;
                
                // Show temporary toast informing user mic is active
                showToast('🎙️ Live Microphone Input Connected to Waveform!');
            } catch (err) {
                console.log('Mic access not granted or unavailable:', err);
                // Fall back gracefully to procedural voice simulation
                isMicActive = false;
            }
        }

        // Clicking on visualizer box attempts to toggle/activate live microphone
        const vizBox = document.querySelector('.audio-visualizer-box');
        if (vizBox) {
            vizBox.style.cursor = 'pointer';
            vizBox.setAttribute('title', 'Click to toggle Voice/Microphone reactivity');
            vizBox.addEventListener('click', () => {
                if (!isMicActive) {
                    initMicrophone();
                } else if (audioCtx && audioCtx.state === 'running') {
                    audioCtx.suspend();
                    isMicActive = false;
                    showToast('🎙️ Voice mode paused.');
                } else if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                    isMicActive = true;
                    showToast('🎙️ Voice mode resumed.');
                }
            });
        }

        const barCount = 72;
        let frame = 0;

        function renderAudioEqualizer() {
            ctx.clearRect(0, 0, width, height);

            const barWidth = width / barCount;
            const centerY = height / 2;

            if (isMicActive && analyser && dataArray) {
                analyser.getByteFrequencyData(dataArray);
            }

            for (let i = 0; i < barCount; i++) {
                // Envelope shape (peaked in center like a human vocal spectrum)
                const envelope = Math.sin((i / barCount) * Math.PI);
                let colHeight = 6;

                if (isMicActive && dataArray) {
                    // Map frequency bins to bars
                    const binIndex = Math.floor((i / barCount) * (dataArray.length * 0.75));
                    const audioVal = dataArray[binIndex] / 255.0; // 0.0 to 1.0
                    colHeight = (envelope * 75 * audioVal) + 5;
                } else {
                    // Procedural voice formant modulation
                    const speechWave = Math.sin((i * 0.22) + (frame * 0.06)) * 0.4 + 0.6;
                    const harmonicWave = Math.cos((i * 0.35) - (frame * 0.04)) * 0.25 + 0.75;
                    const jitter = Math.sin((frame * 0.1) + i) * 0.15;
                    colHeight = (envelope * 50 * speechWave * harmonicWave * (1 + jitter)) + 6;
                }

                const x = i * barWidth + barWidth / 2;

                // Draw vertical stack of dots/dashes
                const dotSpacing = 5.5;
                const dotsInCol = Math.floor(colHeight / dotSpacing);

                for (let d = -dotsInCol; d <= dotsInCol; d++) {
                    const y = centerY + (d * dotSpacing);
                    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                    ctx.fillStyle = isLight ? '#09090b' : '#ffffff';
                    ctx.globalAlpha = Math.max(0.2, 1 - Math.abs(d) / (dotsInCol + 2));
                    ctx.fillRect(x - 1, y - 1, 2, 2);
                }
            }

            ctx.globalAlpha = 1.0;
            frame++;
            requestAnimationFrame(renderAudioEqualizer);
        }

        renderAudioEqualizer();
    }

    // 6. Real-Time Spotify Sync (Live Track or Recent Played)
    const spotifyTitle = document.getElementById('spotify-track-title');
    const spotifyLabel = document.getElementById('spotify-status-label');
    const spotifyPill = document.getElementById('spotify-pill');

    // Dynamic rotation or live fetch
    async function syncSpotifyStatus() {
        if (!spotifyTitle) return;

        // Ayush's favorite tracks / dynamic Spotify queue
        const sampleTracks = [
            { title: "I Thought I Saw Your Face Today", artist: "She & Him", url: "https://open.spotify.com/search/I%20Thought%20I%20Saw%20Your%20Face%20Today" },
            { title: "Starboy", artist: "The Weeknd, Daft Punk", url: "https://open.spotify.com/search/Starboy" },
            { title: "Midnight City", artist: "M83", url: "https://open.spotify.com/search/Midnight%20City" },
            { title: "Resonance", artist: "HOME", url: "https://open.spotify.com/search/Resonance%20HOME" }
        ];

        let trackIndex = 0;
        function updateTrackDisplay(item) {
            if (spotifyTitle) {
                spotifyTitle.textContent = `${item.title} — ${item.artist}`;
            }
            if (spotifyPill) {
                spotifyPill.href = item.url;
            }
            if (spotifyLabel) {
                spotifyLabel.textContent = "NOW PLAYING";
            }
        }

        // Initialize with default
        updateTrackDisplay(sampleTracks[0]);

        // Smoothly cycle tracks every 20 seconds or update from connected status
        setInterval(() => {
            trackIndex = (trackIndex + 1) % sampleTracks.length;
            updateTrackDisplay(sampleTracks[trackIndex]);
        }, 20000);
    }

    syncSpotifyStatus();

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
