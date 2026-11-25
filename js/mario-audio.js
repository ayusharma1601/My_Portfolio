/**
 * Super Mario Theme Sound Synthesizer & Web Audio Engine
 * Pure Web Audio API 8-bit sound effects - no external audio files required!
 */
class MarioAudioEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.initialized = true;
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playTone(freq, type, duration, startTime = 0, gainVal = 0.15) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    // Classic Coin Sound (B5 -> E6)
    playCoin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.playTone(987.77, 'square', 0.08, 0, 0.15);     // B5
        this.playTone(1318.51, 'square', 0.28, 0.08, 0.18); // E6
    }

    // Classic Mario Jump Sound (Ascending pitch)
    playJump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';

        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Block Hit / Bump Sound
    playBump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.playTone(260, 'triangle', 0.08, 0, 0.2);
        this.playTone(180, 'square', 0.12, 0.02, 0.2);
    }

    // Power-up Appear Sound (Staccato sweep)
    playPowerUp() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const notes = [330, 392, 659, 523, 587, 784];
        notes.forEach((freq, i) => {
            this.playTone(freq, 'triangle', 0.07, i * 0.05, 0.16);
        });
    }

    // Warp Pipe Down Sound
    playPipe() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const freqs = [350, 300, 260, 220, 180, 140];
        freqs.forEach((freq, idx) => {
            this.playTone(freq, 'triangle', 0.08, idx * 0.06, 0.18);
        });
    }

    // 1-UP Jingle / Stage Clear Jingle
    playStageClear() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const melody = [
            { f: 659.25, d: 0.1 }, // E5
            { f: 659.25, d: 0.1 }, // E5
            { f: 0, d: 0.08 },
            { f: 659.25, d: 0.1 }, // E5
            { f: 0, d: 0.08 },
            { f: 523.25, d: 0.1 }, // C5
            { f: 659.25, d: 0.14 }, // E5
            { f: 783.99, d: 0.22 }, // G5
            { f: 0, d: 0.15 },
            { f: 392.00, d: 0.25 }  // G4
        ];

        let timeOffset = 0;
        melody.forEach(item => {
            if (item.f > 0) {
                this.playTone(item.f, 'square', item.d, timeOffset, 0.14);
            }
            timeOffset += item.d;
        });
    }
}

// Global audio instance
window.marioAudio = new MarioAudioEngine();
