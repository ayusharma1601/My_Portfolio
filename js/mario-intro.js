/**
 * Super Mario GSAP Intro & Interactive Portfolio Enhancement
 * High-performance, fully responsive, touch & desktop optimized
 */

(function () {
    // Mario State
    let coinCount = 0;
    let score = 0;
    let introFinished = false;

    // Responsive Mario SVG generator (retro 8-bit Mario sprite)
    function getMarioSVG(state = 'standing') {
        return `
        <svg viewBox="0 0 16 16" width="100%" height="100%" style="image-rendering: pixelated; shape-rendering: crispEdges;">
            <!-- Hat & Shirt (Red: #e52521) -->
            <rect x="3" y="1" width="5" height="1" fill="#e52521" />
            <rect x="2" y="2" width="9" height="1" fill="#e52521" />
            <rect x="2" y="7" width="7" height="1" fill="#e52521" />
            <rect x="1" y="8" width="9" height="1" fill="#e52521" />
            <rect x="1" y="9" width="9" height="1" fill="#e52521" />
            <rect x="4" y="10" width="3" height="1" fill="#e52521" />
            
            <!-- Hair & Mustache & Shoes (Dark Brown: #6b3310) -->
            <rect x="2" y="3" width="3" height="1" fill="#6b3310" />
            <rect x="2" y="4" width="1" height="2" fill="#6b3310" />
            <rect x="3" y="4" width="1" height="1" fill="#6b3310" />
            <rect x="1" y="5" width="2" height="1" fill="#6b3310" />
            <rect x="2" y="6" width="1" height="1" fill="#6b3310" />
            <rect x="7" y="5" width="1" height="2" fill="#6b3310" />
            <rect x="8" y="6" width="3" height="1" fill="#6b3310" />
            <!-- Shoes -->
            <rect x="2" y="14" width="3" height="2" fill="#6b3310" />
            <rect x="1" y="15" width="1" height="1" fill="#6b3310" />
            <rect x="7" y="14" width="3" height="2" fill="#6b3310" />
            <rect x="10" y="15" width="1" height="1" fill="#6b3310" />

            <!-- Face & Hands Skin Tone (#fcc082) -->
            <rect x="5" y="3" width="2" height="1" fill="#fcc082" />
            <rect x="4" y="4" width="7" height="1" fill="#fcc082" />
            <rect x="3" y="5" width="4" height="1" fill="#fcc082" />
            <rect x="8" y="5" width="2" height="1" fill="#fcc082" />
            <rect x="3" y="6" width="5" height="1" fill="#fcc082" />
            <rect x="0" y="8" width="1" height="2" fill="#fcc082" />
            <rect x="10" y="8" width="1" height="2" fill="#fcc082" />

            <!-- Overalls (Blue: #0022cc) -->
            <rect x="3" y="10" width="1" height="1" fill="#0022cc" />
            <rect x="7" y="10" width="1" height="1" fill="#0022cc" />
            <rect x="2" y="11" width="7" height="1" fill="#0022cc" />
            <rect x="2" y="12" width="7" height="1" fill="#0022cc" />
            <rect x="2" y="13" width="7" height="1" fill="#0022cc" />
            <rect x="2" y="14" width="1" height="1" fill="#0022cc" />
            <rect x="8" y="14" width="1" height="1" fill="#0022cc" />

            <!-- Overall Buttons (Yellow: #fce4a0) -->
            <rect x="3" y="11" width="1" height="1" fill="#fce4a0" />
            <rect x="7" y="11" width="1" height="1" fill="#fce4a0" />
        </svg>`;
    }

    // Initialize HUD bar
    function createHUD() {
        if (document.getElementById('mario-hud')) return;

        const hud = document.createElement('div');
        hud.id = 'mario-hud';
        hud.className = 'mario-hud';
        hud.innerHTML = `
            <div class="hud-group">
                <div class="hud-item">
                    <span class="hud-label">MARIO</span>
                    <span id="hud-score" class="hud-val">000000</span>
                </div>
                <div class="hud-item">
                    <span class="hud-coin-icon"></span>
                    <span class="hud-val">&#215;<span id="hud-coins">00</span></span>
                </div>
            </div>
            <div class="hud-group">
                <div class="hud-item hud-world">
                    <span class="hud-label">WORLD</span>
                    <span class="hud-val">1-1</span>
                </div>
                <div class="hud-item">
                    <button id="mario-replay-btn" class="hud-btn" title="Replay Intro">
                        <i class="fas fa-redo"></i> INTRO
                    </button>
                    <button id="mario-audio-btn" class="hud-btn audio-btn" title="Toggle Sound">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.prepend(hud);
        document.body.classList.add('has-mario-hud');

        // Audio toggle
        const audioBtn = document.getElementById('mario-audio-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isMuted = window.marioAudio.toggleMute();
                audioBtn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
            });
        }

        // Replay intro button
        const replayBtn = document.getElementById('mario-replay-btn');
        if (replayBtn) {
            replayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                launchMarioIntro(true);
            });
        }
    }

    // Update HUD counters
    function addCoin(points = 200, x = null, y = null) {
        coinCount++;
        score += points;

        const coinEl = document.getElementById('hud-coins');
        const scoreEl = document.getElementById('hud-score');
        if (coinEl) coinEl.textContent = String(coinCount).padStart(2, '0');
        if (scoreEl) scoreEl.textContent = String(score).padStart(6, '0');

        if (window.marioAudio) {
            window.marioAudio.playCoin();
        }

        // Spawn float score particle
        if (x !== null && y !== null) {
            spawnFloatingScore(`+${points}`, x, y);
        }
    }

    function spawnFloatingScore(text, x, y) {
        const floatEl = document.createElement('div');
        floatEl.className = 'coin-score-float';
        floatEl.textContent = text;
        floatEl.style.left = `${Math.min(window.innerWidth - 70, Math.max(10, x))}px`;
        floatEl.style.top = `${y}px`;
        document.body.appendChild(floatEl);

        gsap.to(floatEl, {
            y: -40,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => floatEl.remove()
        });
    }

    // Power-up toast notification
    function showPowerUpBanner(msg = "POWER UP! WORLD 1-1 UNLOCKED") {
        let banner = document.getElementById('mario-power-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'mario-power-banner';
            banner.className = 'powerup-banner';
            document.body.appendChild(banner);
        }
        banner.innerHTML = `<span style="font-size:1.1rem;">🍄</span> <span>${msg}</span>`;

        gsap.timeline()
            .to(banner, { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' })
            .to(banner, { y: 100, opacity: 0, duration: 0.35, delay: 2.2, ease: 'power2.in' });
    }

    // Full Responsive GSAP Mario Intro
    function launchMarioIntro(forced = false) {
        const existing = document.getElementById('mario-intro-stage');
        if (existing) existing.remove();

        const stage = document.createElement('div');
        stage.id = 'mario-intro-stage';
        stage.innerHTML = `
            <div class="intro-banner">
                <div class="world-title">WORLD 1-1</div>
                <div class="world-subtitle">AYUSH SHARMA &bull; PORTFOLIO ADVENTURE</div>
            </div>

            <!-- Clouds -->
            <div class="mario-cloud cloud-1"></div>
            <div class="mario-cloud cloud-2"></div>

            <!-- Hills -->
            <div class="mario-hill hill-1"></div>
            <div class="mario-hill hill-2"></div>

            <!-- Warp Pipe -->
            <div class="warp-pipe"></div>

            <!-- Question Mark Block -->
            <div class="mario-block-wrapper">
                <div class="mario-qblock" id="intro-qblock">?</div>
            </div>

            <!-- Pop Coin -->
            <div class="mario-pop-coin" id="intro-pop-coin"></div>

            <!-- Ground -->
            <div class="mario-ground"></div>

            <!-- Mario Character -->
            <div class="mario-character" id="intro-mario">
                ${getMarioSVG('running')}
            </div>

            <!-- Skip Controls -->
            <div class="intro-controls">
                <button class="intro-skip-btn" id="intro-skip-btn">START / SKIP [ESC]</button>
            </div>
        `;

        document.body.appendChild(stage);

        const finishIntro = () => {
            if (introFinished && !forced) return;
            introFinished = true;

            gsap.to(stage, {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.inOut',
                onComplete: () => {
                    stage.remove();
                    animatePortfolioElements();
                    showPowerUpBanner("LEVEL 1-1 CLEARED! WELCOME");
                    if (window.marioAudio) window.marioAudio.playStageClear();
                }
            });
        };

        const skipBtn = document.getElementById('intro-skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                finishIntro();
            });
        }

        stage.addEventListener('click', (e) => {
            // Clicking anywhere dismisses intro
            finishIntro();
        });

        // Keydown ESC or Space to skip
        const escListener = (e) => {
            if (e.key === 'Escape' || e.code === 'Space') {
                finishIntro();
                window.removeEventListener('keydown', escListener);
            }
        };
        window.addEventListener('keydown', escListener);

        // GSAP Timeline
        const mario = document.getElementById('intro-mario');
        const qblock = document.getElementById('intro-qblock');
        const popCoin = document.getElementById('intro-pop-coin');
        const clouds = stage.querySelectorAll('.mario-cloud');

        // Continuous lightweight cloud float
        gsap.to(clouds[0], { x: 30, repeat: -1, yoyo: true, duration: 6, ease: 'sine.inOut' });
        gsap.to(clouds[1], { x: -35, repeat: -1, yoyo: true, duration: 7, ease: 'sine.inOut' });

        const windowWidth = window.innerWidth;
        const middleX = windowWidth / 2 - 27;
        const pipeTargetX = windowWidth * 0.92 - (windowWidth < 768 ? 55 : 65);

        const tl = gsap.timeline({
            onComplete: () => {
                setTimeout(finishIntro, 400);
            }
        });

        // 1. Mario runs into center
        tl.to(mario, {
            left: middleX,
            duration: 1.6,
            ease: 'power1.inOut',
            onStart: () => {
                gsap.to(mario, { y: -6, repeat: 8, yoyo: true, duration: 0.1, ease: 'power1.inOut' });
            }
        })
        // 2. Mario crouches briefly
        .to(mario, {
            scaleY: 0.85,
            duration: 0.12,
            ease: 'power1.in'
        })
        // 3. Jump into block
        .to(mario, {
            scaleY: 1,
            y: -190,
            duration: 0.35,
            ease: 'power2.out',
            onStart: () => {
                if (window.marioAudio) window.marioAudio.playJump();
            }
        })
        // 4. Hit Block Reaction
        .add(() => {
            if (window.marioAudio) {
                window.marioAudio.playBump();
                window.marioAudio.playCoin();
            }
            qblock.classList.add('hit');
            addCoin(1000);
        })
        .to(qblock, {
            y: -16,
            duration: 0.08,
            yoyo: true,
            repeat: 1,
            ease: 'power1.out'
        }, '<')
        // Coin pops upward
        .to(popCoin, {
            opacity: 1,
            scale: 1,
            y: -95,
            duration: 0.35,
            ease: 'power2.out'
        }, '<')
        .to(popCoin, {
            y: -30,
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in'
        })
        // Mario falls back to ground
        .to(mario, {
            y: 0,
            duration: 0.32,
            ease: 'power2.in'
        }, '-=0.32')
        // Mario touches ground & quick bounce
        .to(mario, {
            y: -24,
            duration: 0.18,
            yoyo: true,
            repeat: 1,
            ease: 'power1.out'
        })
        // Mario runs towards the Warp Pipe
        .to(mario, {
            left: pipeTargetX,
            duration: 1.1,
            ease: 'power1.in',
            onStart: () => {
                gsap.to(mario, { y: -5, repeat: 6, yoyo: true, duration: 0.08, ease: 'power1.inOut' });
            }
        })
        // Mario warps down into pipe
        .add(() => {
            if (window.marioAudio) window.marioAudio.playPipe();
        })
        .to(mario, {
            y: 90,
            opacity: 0,
            duration: 0.5,
            ease: 'power1.in'
        });
    }

    // GSAP ScrollTrigger Entrance animations for portfolio
    function animatePortfolioElements() {
        if (typeof gsap === 'undefined') return;

        // Hero Section entrance
        gsap.from('.hero .section-label', {
            opacity: 0,
            y: -15,
            duration: 0.5,
            ease: 'back.out(1.5)'
        });

        gsap.from('.hero h1', {
            opacity: 0,
            scale: 0.94,
            duration: 0.6,
            delay: 0.1,
            ease: 'power2.out'
        });

        gsap.from('.hero .tagline', {
            opacity: 0,
            y: 15,
            duration: 0.5,
            delay: 0.2,
            ease: 'power2.out'
        });

        gsap.from('.hero-socials .social-pill', {
            opacity: 0,
            scale: 0.88,
            stagger: 0.08,
            duration: 0.4,
            delay: 0.3,
            ease: 'back.out(1.8)'
        });

        // Stagger cards on scroll
        if (gsap.plugins && gsap.plugins.ScrollTrigger) {
            gsap.from('.skill-card', {
                scrollTrigger: {
                    trigger: '.skills-grid',
                    start: 'top 85%'
                },
                opacity: 0,
                y: 20,
                scale: 0.9,
                stagger: 0.04,
                duration: 0.45,
                ease: 'power2.out'
            });

            gsap.from('.project-card', {
                scrollTrigger: {
                    trigger: '#projects',
                    start: 'top 85%'
                },
                opacity: 0,
                y: 25,
                stagger: 0.1,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    }

    // Interactive Mario Easter Eggs
    function injectInteractiveEasterEggs() {
        // Add Mario Coin Blocks next to section labels (desktop/tablet only)
        if (window.innerWidth > 640) {
            const sectionLabels = document.querySelectorAll('.section-label');
            sectionLabels.forEach((label) => {
                if (label.querySelector('.retro-easter-egg-btn')) return;

                const egg = document.createElement('button');
                egg.className = 'retro-easter-egg-btn';
                egg.innerHTML = `<span>?</span> BLOCK`;
                egg.title = "Hit the block for coins!";

                egg.addEventListener('click', (e) => {
                    e.preventDefault();
                    const rect = egg.getBoundingClientRect();

                    gsap.timeline()
                        .to(egg, { y: -6, scale: 1.12, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.out' });

                    addCoin(200, rect.left + rect.width / 2, rect.top);
                });

                label.appendChild(egg);
            });
        }

        // Interactive Skill Cards
        const skillCards = document.querySelectorAll('.skill-card');
        skillCards.forEach(card => {
            card.addEventListener('click', () => {
                const rect = card.getBoundingClientRect();
                gsap.to(card, {
                    y: -6,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.out'
                });
                addCoin(50, rect.left + rect.width / 2, rect.top);
            });
        });
    }

    // Initialize on DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        createHUD();
        injectInteractiveEasterEggs();

        // Launch Mario Intro Cutscene
        setTimeout(() => {
            launchMarioIntro();
        }, 200);
    });

})();
