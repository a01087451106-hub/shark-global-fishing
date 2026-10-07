/* =========================================================
   낚시 화면 (fishing.js)
   JIGGING : DROP(20→30→40→50→60m 한 단계씩) → 목표수심에서 JERK → HIT → 파이팅 → 랜딩
   CASTING : CAST(파워 게이지) → ACTION / REEL → HIT → 파이팅 → 랜딩
   ========================================================= */
const Fishing = {
    canvas: null, ctx: null, W: 0, H: 0, dpr: 1,
    active: false, raf: 0, last: 0, t: 0,
    phase: "ready",
    reeling: false,
    fishImgCache: {},

    init() {
        this.canvas = document.getElementById("sea-canvas");
        this.ctx = this.canvas.getContext("2d");
        window.addEventListener("resize", () => this.active && this.resize());
        document.addEventListener("keydown", e => this.onKey(e, true));
        document.addEventListener("keyup", e => this.onKey(e, false));
        window.addEventListener("blur", () => { this.reeling = false; });
        U.$("#controls").addEventListener("contextmenu", e => e.preventDefault());
    },

    /* ---------------- 화면 진입 / 종료 ---------------- */
    enter() {
        const st = Game.state;
        this.method = st.method;
        this.active = true;
        this.resize();
        this.hudInfo();
        this.newRound(true);
        Sound.seaStart();
        const warn = Equip.powerWarning(st.fish);
        if (warn) this.toast("⚠ " + warn, "warn", 3500);
        cancelAnimationFrame(this.raf);
        this.last = performance.now();
        this.raf = requestAnimationFrame(ts => this.loop(ts));
    },

    leave() {
        this.active = false;
        cancelAnimationFrame(this.raf);
        Battle.stop();
        Sound.seaStop();
        Sound.stopAll();
        Haptic.stop();
        this.reeling = false;
    },

    resize() {
        const stage = U.$("#stage");
        const r = stage.getBoundingClientRect();
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.W = Math.max(300, r.width);
        this.H = Math.max(260, r.height);
        this.canvas.width = this.W * this.dpr;
        this.canvas.height = this.H * this.dpr;
        this.canvas.style.width = this.W + "px";
        this.canvas.style.height = this.H + "px";
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        Scene.invalidate();
    },

    hudInfo() {
        const { region, fish, lure, method } = Game.state;
        U.$("#hud-region").textContent = I18N.name(region);
        U.$("#hud-fish").textContent = I18N.name(fish);
        U.$("#hud-method").textContent = U.methodIcon(method) + " " + U.methodLabel(method);
        U.$("#hud-lure").textContent = I18N.name(lure);
        let badge = "";
        if (fish.isTuna && Game.isTunaSeason(region)) badge = `<span class="badge badge-tuna">TUNA SEASON</span>`;
        else if (Game.isFishInSeason(fish)) badge = `<span class="badge badge-season">${L("시즌", "In season")}</span>`;
        badge += ` <span class="badge badge-diff diff-${Game.difficultyId()}">${L("난이도", "Level")} ${Game.difficultyLabel()}</span>`;
        U.$("#hud-badge").innerHTML = badge;
    },

    /* 새 라운드 (지그/루어 회수 후 다시 시작) */
    newRound(first) {
        const { region, fish } = Game.state;
        this.phase = "ready";
        this.reeling = false;
        this.depth = 0;
        this.dist = 0;
        this.kick = 0;
        this.dive = 0;
        this.combo = 0;
        this.rhythm = 0;
        this.lastAction = 0;
        this.castScore = 0;
        this.particles = [];
        if (first) {
            this.sinceHit = 0;
            this.boils = [];
            this.shadows = [];
        }
        if (this.method === "jigging") {
            /* 지깅 수심은 CONFIG.JIG_DEPTHS (20/30/40/50/60m) 다섯 단계만 사용 */
            const depths = CONFIG.JIG_DEPTHS;
            this.bottom = depths[depths.length - 1];
            const [a, b] = fish.depthPref;
            let cand = depths.filter(d => d >= a - 5 && d <= b + 5);
            if (!cand.length) {
                const mid = (a + b) / 2;
                cand = [depths.reduce((best, d) => Math.abs(d - mid) < Math.abs(best - mid) ? d : best)];
            }
            this.target = U.choice(cand);      // 어군 수심 (TARGET DEPTH)
            this.stepIdx = -1;
            this.jigTo = 0;
            this.matched = false;
            this.zone = [this.target - 4, this.target + 4];
            this.shadows = Array.from({ length: 5 }, () => ({
                d: this.target + U.rand(-3, 3), x: U.rand(0.35, 0.95), v: U.rand(-0.03, 0.03), s: U.rand(0.7, 1.2)
            }));
            this.setControls([{ id: "drop", label: "⬇ DROP", sub: L("지그 내리기", "Drop the jig"), cls: "btn-primary", key: "Space" }]);
            this.msg(L(`목표수심 ${this.target}m · ⬇ 지그 내리기`, `Target depth ${this.target}m · ⬇ Drop the jig`));
        } else {
            this.setControls([{ id: "cast", label: "🎯 CAST", sub: L("던지기", "Throw"), cls: "btn-primary", key: "Space" }]);
            this.msg(first ? L("물고기가 뛰는 '나부라'(물보라)를 찾아 CAST!", "Find the boiling fish (surface splashes) and CAST!") : L("다시 CAST! 나부라 근처로 던지세요.", "CAST again! Throw near the boiling fish."));
        }
        this.updateDepthMeter();
        U.$("#fight-hud").classList.remove("show");
        U.$("#cast-gauge").classList.remove("show");
    },

    /* ---------------- 버튼 ---------------- */
    setControls(list) {
        const box = U.$("#controls");
        box.innerHTML = list.map(b => `
            <button class="ctrl-btn ${b.cls || ""} ${b.hold ? "hold" : ""}" data-id="${b.id}">
                <span class="cb-label">${b.label}</span>
                ${b.sub ? `<span class="cb-sub">${b.sub}</span>` : ""}
                ${b.key ? `<span class="cb-key">${b.key}</span>` : ""}
            </button>`).join("");
        list.forEach(b => {
            const el = box.querySelector(`[data-id="${b.id}"]`);
            if (b.hold) {
                const on = e => { e.preventDefault(); Sound.unlock(); this.reeling = true; el.classList.add("pressed"); };
                const off = () => { this.reeling = false; el.classList.remove("pressed"); };
                el.addEventListener("pointerdown", on);
                el.addEventListener("pointerup", off);
                el.addEventListener("pointerleave", off);
                el.addEventListener("pointercancel", off);
            } else {
                el.addEventListener("pointerdown", e => {
                    e.preventDefault();
                    Sound.unlock();
                    el.classList.add("pressed");
                    setTimeout(() => el.classList.remove("pressed"), 120);
                    this.action(b.id);
                });
            }
        });
    },

    onKey(e, down) {
        if (!this.active || App.modalOpen()) return;
        const k = e.code;
        if (!["Space", "KeyJ", "KeyR", "ArrowUp", "ArrowDown", "KeyF"].includes(k)) return;
        e.preventDefault();
        /* 지깅: Space/↓ = DROP(한 단계 아래), J = JERK, R/↑ = REEL(한 단계 위) */
        if (this.method === "jigging" && ["ready", "working"].includes(this.phase)) {
            if (!down || e.repeat) return;
            if (k === "Space" || k === "ArrowDown") this.action("drop");
            else if (k === "KeyJ" || k === "KeyF") this.action("jerk");
            else this.action("reelup");
            return;
        }
        const holdPhase = ["working", "retrieve", "fight"].includes(this.phase);
        if (k === "Space" || k === "KeyR" || k === "ArrowDown") {
            if (holdPhase) { this.reeling = down; this.markHold(down); return; }
            if (down && !e.repeat && k === "Space") {
                if (this.phase === "ready") this.action(this.method === "jigging" ? "drop" : "cast");
                else if (this.phase === "aim") this.action("release");
                else if (this.phase === "dropping") this.action("jerk");
            }
            return;
        }
        if (down && !e.repeat && (k === "KeyJ" || k === "ArrowUp" || k === "KeyF")) {
            if (this.phase === "working" || this.phase === "dropping") this.action("jerk");
            if (this.phase === "retrieve") this.action("twitch");
        }
    },

    markHold(on) {
        const el = U.$('#controls .hold');
        if (el) el.classList.toggle("pressed", on);
    },

    action(id) {
        switch (id) {
            case "drop": return this.startDrop();
            case "reelup": return this.reelUp();
            case "jerk": return this.doJerk();
            case "cast": return this.startAim();
            case "release": return this.releaseCast();
            case "twitch": return this.doTwitch();
        }
    },

    workControls() {
        if (this.method === "jigging") {
            this.setControls([
                { id: "drop", label: "⬇ DROP", sub: L("한 단계 아래", "One step down"), cls: "btn-primary", key: "↓" },
                { id: "jerk", label: "⤴ JERK", sub: L("톡! 톡!", "Tap! Tap!"), cls: "btn-accent", key: "J" },
                { id: "reelup", label: "⟳ REEL", sub: L("한 단계 위", "One step up"), cls: "btn-primary", key: "R" }
            ]);
        } else {
            this.setControls([
                { id: "twitch", label: "〰 ACTION", sub: L("톡! 톡! 리듬있게", "Tap! Tap! In rhythm"), cls: "btn-accent", key: "J" },
                { id: "reel", label: "⟳ REEL", sub: L("누르고 있기", "Hold"), cls: "btn-primary", hold: true, key: "Space" }
            ]);
        }
    },

    /* ---------------- JIGGING ---------------- */
    /* DROP: 0 → 20 → 30 → 40 → 50 → 60m 한 단계씩 (60m 아래로는 내려가지 않음) */
    startDrop() {
        const depths = CONFIG.JIG_DEPTHS;
        if (this.phase === "ready") {
            this.phase = "working";
            this.depth = 0;
            this.combo = 0;
            Sound.splash();
            this.splash(this.lurePos().x, this.surfaceY, 10);
            this.workControls();
        }
        if (this.phase !== "working") return;
        if (this.stepIdx >= depths.length - 1) {
            this.toast(L(`최대 수심 ${depths[depths.length - 1]}m!`, `Max depth ${depths[depths.length - 1]}m!`), "warn");
            return;
        }
        this.stepIdx++;
        this.jigTo = depths[this.stepIdx];
        this.matched = false;
        this.updateDepthMeter();
    },

    /* REEL: 한 단계 위로. 20m 에서 REEL 하면 지그 회수 */
    reelUp() {
        if (this.phase !== "working") return;
        this.stepIdx--;
        this.jigTo = this.stepIdx < 0 ? 0 : CONFIG.JIG_DEPTHS[this.stepIdx];
        this.matched = false;
        Sound.reel();
        this.updateDepthMeter();
    },

    jigArrived() { return Math.abs(this.depth - this.jigTo) < 0.3; },

    onJigArrive() {
        if (this.jigTo === 0) return;
        if (this.jigTo === this.target) {
            if (!this.matched) {
                this.matched = true;
                this.toast(L("DEPTH MATCH! 수심 적중!", "DEPTH MATCH!"), "good");
                Sound.tone(880, 0.15, "triangle", 0.15);
                this.tryHit(0.3);                       // 폴링 입질
            }
            if (this.phase === "working") this.msg(L(`수심 적중! ${this.target}m · JERK! JERK!`, `Depth matched! ${this.target}m · JERK! JERK!`), "good");
        } else if (this.jigTo < this.target) {
            this.msg(L(`목표수심 ${this.target}m · ⬇ 지그 내리기`, `Target depth ${this.target}m · ⬇ Drop the jig`));
        } else {
            this.msg(L(`목표수심 ${this.target}m · ⟳ REEL로 올리기`, `Target depth ${this.target}m · ⟳ REEL it up`));
        }
    },

    doJerk() {
        if (this.phase !== "working" || this.jigTo === 0) return;
        this.kick = 1;
        Sound.jerk();
        this.rhythmTick();
        this.tryHit(1);
    },

    /* ---------------- CASTING ---------------- */
    startAim() {
        if (this.phase !== "ready") return;
        this.phase = "aim";
        this.gaugeT = 0;
        U.$("#cast-gauge").classList.add("show");
        this.setControls([{ id: "release", label: "🎯 STOP!", sub: L("지금 던지기", "Throw now"), cls: "btn-primary", key: "Space" }]);
        this.msg(L("게이지가 원하는 거리에 왔을 때 STOP! (초록 표시 = 나부라 위치)", "STOP! when the gauge reaches your distance (green mark = boiling fish)"));
    },

    releaseCast() {
        if (this.phase !== "aim") return;
        const power = this.gaugeValue();
        U.$("#cast-gauge").classList.remove("show");
        this.castTo = 10 + power * 85;
        this.phase = "flying";
        this.flyT = 0;
        this.setControls([]);
        this.msg(L("휘익~!", "Whoosh~!"));
        Sound.tone(600, 0.4, "sine", 0.1, 1200);
    },

    landCast() {
        this.dist = this.castTo;
        this.phase = "retrieve";
        Sound.splash();
        const p = this.lurePos();
        this.splash(p.x, this.surfaceY, 14);
        const near = this.nearestBoil();
        const d = near ? Math.abs(near.dist - this.dist) : 99;
        this.castScore = U.clamp(1 - d / 30, 0, 1);
        if (d < 8) this.toast(L("NICE CAST! 나부라 정면!", "NICE CAST! Right on the boil!"), "good");
        else if (d < 18) this.toast("GOOD CAST!", "good");
        this.workControls();
        this.msg(L("ACTION으로 펜슬을 움직이고, REEL로 감으세요!", "Work the pencil with ACTION and wind with REEL!"));
    },

    doTwitch() {
        if (this.phase !== "retrieve") return;
        this.dist = Math.max(0, this.dist - 0.9);
        this.dive = 1;
        Sound.splash();
        const p = this.lurePos();
        this.splash(p.x, this.surfaceY, 6);
        this.rhythmTick();
        this.tryHit(1);
    },

    gaugeValue() { return (Math.sin(this.gaugeT * 2.6 - Math.PI / 2) + 1) / 2; },

    nearestBoil() {
        let best = null;
        this.boils.forEach(b => { if (!best || Math.abs(b.dist - this.dist) < Math.abs(best.dist - this.dist)) best = b; });
        return best;
    },

    /* ---------------- 액션 리듬 / 히트 판정 ---------------- */
    rhythmTick() {
        const now = performance.now() / 1000;
        const gap = now - this.lastAction;
        if (this.lastAction && gap > 0.3 && gap < 1.15) this.combo++;
        else if (this.lastAction && gap <= 0.3) this.combo = Math.max(0, this.combo - 2);
        else this.combo = Math.max(0, this.combo - 1);
        this.lastAction = now;
        this.rhythm = U.clamp(this.combo / 6, 0, 1);
        this.sinceHit++;
        const el = U.$("#combo");
        if (this.combo >= 2) {
            el.textContent = (this.combo >= 6 ? "PERFECT ACTION " : "GOOD ACTION ") + "x" + this.combo;
            el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
        }
    },

    inZone() {
        if (this.method === "jigging") return this.jigTo === this.target && this.jigArrived();
        const b = this.nearestBoil();
        return !!b && Math.abs(b.dist - this.dist) < 10;
    },

    playScore() {
        if (this.method === "jigging") return this.rhythm * 0.7 + (this.inZone() ? 0.3 : 0);
        return this.castScore * 0.5 + this.rhythm * 0.5;
    },

    tryHit(weight) {
        const base = this.method === "jigging" ? 0.045 : 0.05;
        const zone = this.inZone() ? (this.method === "jigging" ? 1 : 2.5) : (this.method === "jigging" ? 0.25 : 0.35);
        const pity = Math.min(3, 1 + this.sinceHit * 0.03);
        const p = base * zone * (0.7 + 0.7 * this.rhythm) * Game.hitFactor() * pity * weight;
        if (Math.random() < p) this.hit();
    },

    hit() {
        const st = Game.state;
        const jig = this.method === "jigging";
        const c = Game.rollCatch({ depth: jig ? this.jigTo : null, depthMatch: jig ? this.inZone() : null, playScore: this.playScore() });
        this.catchObj = c;
        this.sinceHit = 0;
        this.phase = "hit";
        this.reeling = false;
        this.setControls([]);
        const gi = Game.gradeIndex(c.grade);
        let text = "HIT!";
        if (c.isTuna && gi >= 3) text = "MONSTER TUNA HIT!";
        else if (c.isTuna && gi >= 2) text = "BIG TUNA HIT!";
        else if (gi >= 4) text = "MONSTER HIT!";
        else if (gi >= 3) text = "TROPHY HIT!";
        this.bigText(text, gi >= 3 ? "huge" : "");
        this.shake(gi >= 3 ? "shake-strong" : "shake");
        Sound.hit(gi >= 2);
        Haptic.hit(gi);
        if (gi >= 3) Sound.dragOn(1);
        const p = this.lurePos();
        this.splash(p.x, Math.min(p.y, this.H - 20), 24);
        this.msg(L(st.fish.name + " 히트! 파이팅 준비!", I18N.name(st.fish) + " on! Get ready to fight!"));
        setTimeout(() => {
            if (!this.active || this.phase !== "hit") return;
            this.startFight();
        }, 1200);
    },

    /* ---------------- 파이팅 ---------------- */
    startFight() {
        const d = this.method === "jigging" ? this.depth : this.dist;
        Battle.start(this.catchObj, d);
        this.phase = "fight";
        U.$("#fight-hud").classList.add("show");
        this.setControls([{ id: "reel", label: "⟳ REEL", sub: L("누르고 있기 · RUN! 때는 손 떼기", "Hold · let go on RUN!"), cls: "btn-primary btn-wide", hold: true, key: "Space" }]);
    },

    updateFight(dt) {
        const res = Battle.update(dt, this.reeling);
        const s = Battle.s;
        Haptic.fight(dt, s, this.reeling);                      // 손맛 (진동)
        U.$("#fh-tension").style.width = U.clamp(s.tension, 0, 100) + "%";
        U.$("#fh-tension").className = s.tension > 88 ? "danger" : s.tension > 65 ? "warn" : "";
        U.$("#fh-stamina").style.width = s.stamina + "%";
        U.$("#fh-dist").textContent = Math.max(0, Math.round(s.dist));
        U.$("#depth-meter").innerHTML = `${L("라인", "Line")} <b>${Math.max(0, Math.round(s.dist))}</b>m <small>/ ${s.lineCap}m</small>`;
        U.$("#depth-meter").classList.remove("is-sonar");
        this._sonarHTML = "";
        const h = Battle.hint(this.reeling);
        this.msg(h.text, h.cls);
        if (Battle.running && Math.random() < dt * 8) {
            const p = this.fishPos();
            this.particles.push({ x: p.x, y: p.y, vx: U.rand(-30, 30), vy: U.rand(-40, -10), life: 0.6, r: 2, c: "rgba(255,255,255,0.7)" });
        }
        if (res === "landed") this.startLanding();
        else if (res !== "fight") this.fail(res);
    },

    startLanding() {
        this.phase = "landing";
        this.landT = 0;
        Battle.stop();
        this.reeling = false;
        this.setControls([]);
        U.$("#fight-hud").classList.remove("show");
        this.bigText("LANDING!", "");
        Sound.landing();
        Haptic.landing();
        this.msg(L("랜딩 성공!", "Landed!"), "good");
    },

    fail(reason) {
        this.phase = "fail";
        Battle.stop();
        this.reeling = false;
        this.setControls([]);
        U.$("#fight-hud").classList.remove("show");
        Sound.fail();
        Haptic.fail(reason);
        const info = {
            break: [L("라인 브레이크!", "LINE BREAK!"), L("물고기가 달릴 때(RUN!)는 손을 떼서 드랙이 풀리게 하세요. 텐션 바가 빨간색이 되면 위험!", "When the fish runs (RUN!), let go so the drag can slip. A red tension bar means danger!")],
            hookout: [L("바늘이 빠졌어요 (바레)", "The hook pulled out!"), L("물고기가 쉴 때는 REEL을 계속 누르고 있어야 라인이 느슨해지지 않아요.", "Keep holding REEL while the fish rests so the line doesn't go slack.")],
            lineout: [L("라인이 모두 풀렸어요!", "Spooled! All the line is gone!"), L("더 강한 릴(POWER ★)을 쓰거나, 물고기가 쉴 때 부지런히 감아주세요.", "Use a stronger reel (POWER ★), or reel hard whenever the fish rests.")]
        }[reason];
        this.bigText(info[0], "fail");
        setTimeout(() => App.showFail(info[0], info[1], this.catchObj), 1400);
    },

    finishLanding() {
        const c = this.catchObj;
        const result = Records.add(c);
        this.phase = "result";
        App.showResult(c, result.isNew);
    },

    /* ---------------- 메인 루프 ---------------- */
    loop(ts) {
        if (!this.active) return;
        const dt = Math.min(0.05, (ts - this.last) / 1000);
        this.last = ts;
        this.t += dt;
        this.update(dt);
        this.draw();
        this.raf = requestAnimationFrame(t2 => this.loop(t2));
    },

    update(dt) {
        const st = Game.state;
        this.kick = Math.max(0, this.kick - dt * 4);
        this.dive = Math.max(0, this.dive - dt * 3);

        /* 나부라 (캐스팅) */
        if (this.method === "casting") {
            this.boils.forEach(b => { b.age += dt; });
            this.boils = this.boils.filter(b => b.age < b.life);
            if (this.boils.length === 0 || (this.boils.length < 2 && Math.random() < dt * 0.12)) {
                this.boils.push({ dist: U.rand(25, 88), life: U.rand(7, 11), age: 0 });
            }
        } else {
            this.shadows.forEach(f => {
                f.x += f.v * dt;
                if (f.x < 0.3 || f.x > 0.97) f.v *= -1;
            });
        }

        switch (this.phase) {
            case "working": {
                /* 지그가 목표 단계(jigTo)까지 내려가거나 올라옴 */
                const w = st.lure.weight || 160;
                const speed = this.depth < this.jigTo ? 14 + w / 40 : 16;
                const prev = this.depth;
                if (this.depth < this.jigTo) this.depth = Math.min(this.jigTo, this.depth + speed * dt);
                else if (this.depth > this.jigTo) this.depth = Math.max(this.jigTo, this.depth - speed * dt);
                if (this.depth < prev) Sound.reel();
                if (prev !== this.depth && this.jigArrived()) this.onJigArrive();
                if (this.phase === "working" && this.jigTo === 0 && this.depth <= 0.3) {
                    this.toast(L("지그 회수!", "Jig retrieved!"), "");
                    this.newRound(false);
                    break;
                }
                this.updateDepthMeter();
                break;
            }
            case "aim":
                this.gaugeT += dt * Game.difficulty().gaugeSpeed;   // 난이도: 상일수록 게이지가 빠름
                this.drawGauge();
                break;
            case "flying":
                this.flyT += dt / 0.9;
                if (this.flyT >= 1) this.landCast();
                break;
            case "retrieve":
                if (this.reeling) {
                    this.dist = Math.max(0, this.dist - (3 + Equip.stat(st.reel, "speed", 4) * 0.8) * dt);
                    Sound.reel();
                    this.reelHitT = (this.reelHitT || 0) + dt;
                    if (this.reelHitT > 0.5) { this.reelHitT = 0; this.tryHit(0.18); }
                }
                this.updateDepthMeter();
                if (this.phase === "retrieve" && this.dist <= 5) {
                    this.toast(L("루어 회수!", "Lure retrieved!"), "", 1000);
                    this.newRound(false);
                }
                break;
            case "fight":
                this.updateFight(dt);
                break;
            case "landing":
                this.landT += dt;
                if (Math.random() < dt * 20) {
                    const p = this.fishPos();
                    this.splash(p.x, this.surfaceY, 2);
                }
                if (this.landT > 1.8) this.finishLanding();
                break;
        }

        this.particles.forEach(p => {
            if (p.ring) { p.r += p.grow * dt; p.life -= dt; return; }
            p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.life -= dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    },

    updateDepthMeter() {
        const el = U.$("#depth-meter");
        if (this.method === "jigging") {
            /* SONAR: TARGET DEPTH / JIG DEPTH (20·30·40·50·60m) */
            const moving = !this.jigArrived();
            const jigLabel = (moving ? "→ " : "") + this.jigTo;
            const rows = CONFIG.JIG_DEPTHS.map(d => {
                const isT = d === this.target, isJ = d === this.jigTo;
                return `<div class="sn-row ${isT ? "t" : ""} ${isJ ? "j" : ""} ${isT && isJ && !moving ? "hit" : ""}">
                    <span>${d}m</span><i>${isT ? "🐟🐟" : ""}</i><em>${isJ ? (moving ? "▼" : "◀ JIG") : ""}</em></div>`;
            }).join("");
            const html = `<div class="sonar"><div class="sn-title">SONAR</div>
                <div class="sn-target">TARGET DEPTH <b>${this.target}m</b></div>
                <div class="sn-rows">${rows}</div>
                <div class="sn-jig">JIG DEPTH <b>${jigLabel}m</b></div></div>`;
            if (this._sonarHTML !== html) { el.innerHTML = html; this._sonarHTML = html; }
            el.classList.add("is-sonar");
        } else {
            el.innerHTML = `${L("거리", "Distance")} <b>${Math.round(this.dist)}</b>m`;
            el.classList.remove("is-sonar");
        }
    },

    drawGauge() {
        const v = this.gaugeValue();
        U.$("#cast-gauge i").style.width = (v * 100) + "%";
        const near = this.boils[0];
        const mark = U.$("#cast-gauge em");
        if (near) {
            mark.style.display = "block";
            mark.style.left = U.clamp((near.dist - 10) / 85 * 100, 0, 100) + "%";
        } else mark.style.display = "none";
        U.$("#cast-gauge span").textContent = Math.round(10 + v * 85) + "m";
    },

    /* ---------------- 좌표 ---------------- */
    get surfaceY() { return this.H * 0.26; },
    get boatX() { return Math.max(70, this.W * 0.13); },
    get tip() {
        let bend = 0, jit = 0;
        const s = Battle.s;
        if (this.phase === "fight" && s) {
            bend = s.tension / 100;
            /* 손맛: 질주할 때는 잘게, 헤드쉐이크 때는 크게 낚싯대 끝이 떨림 */
            if (s.mode === "run" || s.mode === "final") jit = 1 + (s.ratio || 0.5) * 1.6;
            else if (s.mode === "shake") jit = s.shakePulse * 5;
            else jit = s.tension / 80;
        }
        if (this.phase === "hit") { bend = 0.8; jit = 3; }
        const bx = this.boatX;
        return {
            x: bx + 70 - bend * 18 + Math.sin(this.t * 53) * jit,
            y: this.surfaceY - 78 + bend * 40 + Math.cos(this.t * 61) * jit * 1.3
        };
    },

    depthToY(d) {
        const view = (this.bottom || 100) * 1.06;
        return this.surfaceY + d / view * (this.H - this.surfaceY - 18);
    },
    distToX(d) { return this.tip.x + d / 100 * (this.W - this.tip.x - 26); },

    lurePos() {
        if (this.method === "jigging") {
            return { x: this.tip.x + 26 + Math.sin(this.t * 1.3) * 3 + this.kick * 8, y: this.depthToY(this.depth) - this.kick * 6 };
        }
        if (this.phase === "flying") {
            const t = U.clamp(this.flyT, 0, 1);
            const x = U.lerp(this.tip.x, this.distToX(this.castTo), t);
            const y = U.lerp(this.tip.y, this.surfaceY, t) - Math.sin(t * Math.PI) * this.H * 0.18;
            return { x, y };
        }
        return { x: this.distToX(this.dist), y: this.surfaceY + 3 + this.dive * 10 + Math.sin(this.t * 3) * 1.5 };
    },

    fishPos() {
        const tip = this.tip;
        if (this.phase === "landing") {
            const k = U.clamp(this.landT / 1.4, 0, 1);
            return { x: this.boatX + 90, y: U.lerp(this.surfaceY + 30, this.surfaceY - 20, k) };
        }
        const s = Battle.s;
        if (!s) return this.lurePos();
        /* 지깅은 수심 눈금, 캐스팅은 거리 눈금과 같은 비율로 물고기 위치 표시 */
        const jig = this.method === "jigging";
        const a = (jig ? 1.25 : 0.3) + s.angle * (jig ? 0.3 : 0.2);
        const pxPerM = jig ? (this.depthToY(10) - this.depthToY(0)) / 10 : (this.distToX(10) - this.distToX(0)) / 10;
        const L = s.dist * pxPerM;
        let x = tip.x + 20 + Math.cos(a) * L;
        let y = this.surfaceY + Math.sin(a) * L;
        if (jig) y = Math.min(y, this.depthToY(this.bottom) - 12);   // 바닥 아래로는 내려가지 않음
        if (s.jump > 0 && (!jig || y < this.surfaceY + 60)) y = this.surfaceY - Math.sin(s.jump * Math.PI) * 70;
        x = U.clamp(x, tip.x + 20, this.W - (jig ? 30 : 110));   // 물고기 몸통이 화면 밖으로 나가지 않게
        y = U.clamp(y, this.surfaceY - 80, this.H - 16);
        return { x, y };
    },

    /* ---------------- 그리기 (사실적인 렌더링은 js/scene.js) ---------------- */
    draw() { Scene.draw(this); },

    /* 물보라 + 수면 거품 고리 */
    splash(x, y, n) {
        for (let i = 0; i < n; i++) {
            this.particles.push({ x: x + U.rand(-4, 4), y, vx: U.rand(-70, 70), vy: U.rand(-170, -50), life: U.rand(0.4, 1.0), r: U.rand(1, 3.2), c: "rgba(240,250,255,0.92)" });
        }
        if (n >= 6) this.particles.push({ ring: true, x, y: this.surfaceY + 1, vx: 0, vy: 0, r: 6, grow: 40, life: 0.9 });
    },

    /* ---------------- 화면 텍스트 ---------------- */
    msg(text, cls) {
        const el = U.$("#fishing-msg");
        if (el.textContent !== text) el.textContent = text;
        el.className = "banner " + (cls || "");
    },

    toast(text, cls) {
        const el = U.$("#combo");
        el.textContent = text;
        el.className = "combo " + (cls || "");
        void el.offsetWidth;
        el.classList.add("pop");
    },

    bigText(text, cls) {
        const el = U.$("#big-text");
        el.textContent = text;
        el.className = "big-text " + (cls || "");
        void el.offsetWidth;
        el.classList.add("show");
    },

    shake(cls) {
        const el = U.$("#stage");
        el.classList.remove("shake", "shake-strong");
        void el.offsetWidth;
        el.classList.add(cls);
        setTimeout(() => el.classList.remove(cls), 900);
    }
};
