/* =========================================================
   사운드 (audio.js)
   - 별도 음원 파일 없이 Web Audio API로 바다/릴/드랙/히트/랜딩 소리를 합성합니다.
   - assets/sounds/ 폴더는 나중에 실제 음원을 넣을 때를 위해 준비된 폴더입니다.
   ========================================================= */
const Sound = {
    ctx: null,
    master: null,
    enabled: true,
    noiseBuf: null,
    sea: null,
    drag: null,
    lastReel: 0,

    init() {
        this.enabled = Store.isSoundOn();
    },

    /* 브라우저 정책상 첫 터치/클릭 이후에만 오디오 시작 가능 */
    unlock() {
        if (this.ctx) {
            if (this.ctx.state === "suspended") this.ctx.resume();
            return;
        }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.enabled ? 0.8 : 0;
        this.master.connect(this.ctx.destination);
        const len = this.ctx.sampleRate * 2;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    },

    setEnabled(on) {
        this.enabled = on;
        Store.setSoundOn(on);
        if (this.master) this.master.gain.value = on ? 0.8 : 0;
    },

    noise() {
        const s = this.ctx.createBufferSource();
        s.buffer = this.noiseBuf;
        s.loop = true;
        return s;
    },

    tone(freq, dur, type, vol, slideTo, delay) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime + (delay || 0);
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type || "sine";
        o.frequency.setValueAtTime(freq, t);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(this.master);
        o.start(t); o.stop(t + dur + 0.05);
    },

    burst(dur, freq, q, vol) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const s = this.noise();
        const f = this.ctx.createBiquadFilter();
        f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q || 1;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol || 0.4, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(this.master);
        s.start(t, Math.random()); s.stop(t + dur + 0.05);
    },

    /* 바다 배경음 (파도) */
    seaStart() {
        if (!this.ctx || this.sea) return;
        const s = this.noise();
        const f = this.ctx.createBiquadFilter();
        f.type = "lowpass"; f.frequency.value = 500;
        const g = this.ctx.createGain();
        g.gain.value = 0.08;
        const lfo = this.ctx.createOscillator();
        const lfoG = this.ctx.createGain();
        lfo.frequency.value = 0.12; lfoG.gain.value = 0.06;
        lfo.connect(lfoG); lfoG.connect(g.gain);
        s.connect(f); f.connect(g); g.connect(this.master);
        s.start(); lfo.start();
        this.sea = { s, lfo, g };
    },
    seaStop() {
        if (!this.sea) return;
        try { this.sea.s.stop(); this.sea.lfo.stop(); } catch (e) { }
        this.sea = null;
    },

    /* 릴 감는 소리 (짧은 클릭 반복) */
    reel() {
        if (!this.ctx) return;
        const now = performance.now();
        if (now - this.lastReel < 70) return;
        this.lastReel = now;
        this.tone(1800 + Math.random() * 400, 0.03, "square", 0.05);
    },

    /* 드랙 소리 (라인이 풀릴 때) */
    dragOn(intensity) {
        if (!this.ctx) return;
        if (!this.drag) {
            const s = this.noise();
            const f = this.ctx.createBiquadFilter();
            f.type = "bandpass"; f.frequency.value = 3200; f.Q.value = 6;
            const g = this.ctx.createGain();
            g.gain.value = 0;
            const am = this.ctx.createOscillator();
            const amG = this.ctx.createGain();
            am.type = "square"; am.frequency.value = 38; amG.gain.value = 0.12;
            am.connect(amG); amG.connect(g.gain);
            s.connect(f); f.connect(g); g.connect(this.master);
            s.start(); am.start();
            this.drag = { s, f, g, am };
        }
        const k = U.clamp(intensity, 0, 1);
        this.drag.g.gain.setTargetAtTime(0.12 + 0.2 * k, this.ctx.currentTime, 0.03);
        this.drag.am.frequency.setTargetAtTime(25 + 40 * k, this.ctx.currentTime, 0.05);
    },
    dragOff() {
        if (!this.drag) return;
        const d = this.drag;
        this.drag = null;
        d.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
        setTimeout(() => { try { d.s.stop(); d.am.stop(); } catch (e) { } }, 200);
    },

    splash() { this.burst(0.35, 900, 0.8, 0.35); },
    jerk() { this.tone(300, 0.08, "triangle", 0.12, 180); this.burst(0.08, 2500, 2, 0.08); },
    click() { this.tone(900, 0.05, "sine", 0.12); },

    hit(big) {
        this.tone(big ? 70 : 110, 0.5, "sine", 0.6, 40);
        this.burst(0.4, 600, 0.7, 0.5);
        this.tone(big ? 330 : 440, 0.25, "sawtooth", 0.12, big ? 660 : 880, 0.05);
    },

    landing() {
        [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.35, "triangle", 0.22, null, i * 0.12));
        this.burst(0.6, 700, 0.6, 0.3);
    },

    fail() {
        this.tone(440, 0.6, "sawtooth", 0.15, 110);
        this.burst(0.15, 4000, 3, 0.3);
    },

    stopAll() {
        this.dragOff();
    }
};
