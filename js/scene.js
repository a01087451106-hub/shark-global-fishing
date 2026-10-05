/* =========================================================
   사실적인 장면 그리기 (scene.js)
   - 하늘 / 수평선 햇빛 반사 / 파도 / 물속 빛줄기 / 부유물 / 해저
   - 입체 낚싯배 + 낚시꾼 + 텐션에 따라 휘는 낚싯대
   - 등은 어둡고 배는 은빛인 사실적인 물고기 (꼬리 움직임)
   fishing.js 의 게임 로직은 그대로 두고, 그리는 부분만 담당합니다.
   ========================================================= */
const Scene = {
    bg: null, bgKey: "",
    vignette: null,
    snow: [],
    fishCache: {},

    /* ---------------- 공용: 색 섞기 ---------------- */
    mix(a, b, t) {
        const pa = this.rgb(a), pb = this.rgb(b);
        const r = Math.round(pa[0] + (pb[0] - pa[0]) * t), g = Math.round(pa[1] + (pb[1] - pa[1]) * t), bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
        return `rgb(${r},${g},${bl})`;
    },
    rgb(hex) {
        if (hex.startsWith("rgb")) return hex.match(/\d+/g).slice(0, 3).map(Number);
        const h = hex.replace("#", "");
        const n = parseInt(h.length === 3 ? h.split("").map(x => x + x).join("") : h, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    },

    /* ---------------- 파도 높이 ---------------- */
    waveY(F, x) {
        const t = F.t;
        return F.surfaceY + Math.sin(x * 0.021 + t * 1.5) * 2.8 + Math.sin(x * 0.053 - t * 2.2) * 1.2 + Math.sin(x * 0.008 + t * 0.6) * 2.2;
    },

    /* =====================================================
       메인 그리기
       ===================================================== */
    draw(F) {
        const c = F.ctx, W = F.W, H = F.H;
        this.ensureBg(F);
        c.drawImage(this.bg, 0, 0, W, H);

        this.drawGlitter(F);
        this.drawRays(F);
        if (F.method === "jigging") this.drawJigWorld(F);
        else this.drawBoils(F);
        this.drawSnow(F);

        /* 물고기/루어는 수면 아래 → 수면을 그 위에 덮어 자연스럽게 */
        this.drawLineAndCatch(F);
        this.drawSurface(F);
        this.drawBoat(F);
        this.drawRod(F);
        this.drawParticles(F);

        c.drawImage(this.vignette, 0, 0, W, H);
    },

    /* ---------------- 정적 배경 (크기가 바뀔 때만 다시 그림) ---------------- */
    ensureBg(F) {
        const key = [Math.round(F.W), Math.round(F.H), F.method, F.bottom].join("|");
        if (this.bg && this.bgKey === key) return;
        this.bgKey = key;
        const W = F.W, H = F.H, sy = F.surfaceY, dpr = F.dpr;
        const cv = document.createElement("canvas");
        cv.width = W * dpr; cv.height = H * dpr;
        const c = cv.getContext("2d");
        c.scale(dpr, dpr);

        /* 하늘: 위는 깊은 청색, 수평선 쪽은 따뜻한 빛 */
        let g = c.createLinearGradient(0, 0, 0, sy);
        g.addColorStop(0, "#14304f");
        g.addColorStop(0.55, "#3f6f96");
        g.addColorStop(0.85, "#a9b9c4");
        g.addColorStop(1, "#e8c9a0");
        c.fillStyle = g; c.fillRect(0, 0, W, sy);

        /* 태양과 대기 빛 */
        const sx = W * 0.8, sunY = sy * 0.62;
        g = c.createRadialGradient(sx, sunY, 0, sx, sunY, sy * 1.4);
        g.addColorStop(0, "rgba(255,244,214,0.95)");
        g.addColorStop(0.04, "rgba(255,226,170,0.85)");
        g.addColorStop(0.18, "rgba(255,200,140,0.30)");
        g.addColorStop(1, "rgba(255,190,130,0)");
        c.fillStyle = g; c.fillRect(0, 0, W, sy);

        /* 구름: 부드러운 덩어리 여러 개 */
        const rnd = this.seeded(7);
        for (let i = 0; i < 14; i++) {
            const cx = rnd() * W, cy = sy * (0.15 + rnd() * 0.55), r = 30 + rnd() * 70;
            const lit = cx > W * 0.55 ? 0.5 : 0.32;
            for (let j = 0; j < 5; j++) {
                const px = cx + (rnd() - 0.5) * r * 2, py = cy + (rnd() - 0.5) * r * 0.35, pr = r * (0.4 + rnd() * 0.6);
                g = c.createRadialGradient(px, py, 0, px, py, pr);
                g.addColorStop(0, `rgba(240,232,226,${lit * 0.55})`);
                g.addColorStop(1, "rgba(240,232,226,0)");
                c.fillStyle = g;
                c.beginPath(); c.ellipse(px, py, pr * 1.6, pr * 0.45, 0, 0, Math.PI * 2); c.fill();
            }
        }

        /* 먼바다 띠 (수평선) */
        const hz = sy - Math.max(10, sy * 0.1);
        g = c.createLinearGradient(0, hz, 0, sy);
        g.addColorStop(0, "#3b6a8a");
        g.addColorStop(1, "#1d4e70");
        c.fillStyle = g; c.fillRect(0, hz, W, sy - hz);
        c.fillStyle = "rgba(255,230,190,0.35)"; c.fillRect(0, hz, W, 1);

        /* 물속: 수면 근처는 청록, 깊어질수록 어두운 남색 */
        g = c.createLinearGradient(0, sy, 0, H);
        g.addColorStop(0, "#1f7a99");
        g.addColorStop(0.18, "#145d80");
        g.addColorStop(0.5, "#0b3a5c");
        g.addColorStop(1, "#030f1e");
        c.fillStyle = g; c.fillRect(0, sy, W, H - sy);

        /* 수면 바로 아래 밝은 산란광 */
        g = c.createRadialGradient(sx, sy, 0, sx, sy, W * 0.6);
        g.addColorStop(0, "rgba(160,225,240,0.35)");
        g.addColorStop(1, "rgba(160,225,240,0)");
        c.fillStyle = g; c.fillRect(0, sy, W, H - sy);

        /* 해저 (지깅) */
        if (F.method === "jigging") {
            const by = F.depthToY(F.bottom + 3);
            const rr = this.seeded(3);
            g = c.createLinearGradient(0, by - 20, 0, H);
            g.addColorStop(0, "#2a3a3a");
            g.addColorStop(0.3, "#1a2526");
            g.addColorStop(1, "#070c10");
            c.fillStyle = g;
            c.beginPath(); c.moveTo(0, H);
            for (let x = 0; x <= W; x += 12) c.lineTo(x, by + Math.sin(x * 0.045) * 4 + Math.sin(x * 0.013) * 8 + (rr() - 0.5) * 3);
            c.lineTo(W, H); c.fill();
            /* 바위 */
            for (let i = 0; i < 22; i++) {
                const x = rr() * W, w = 10 + rr() * 38, h = 6 + rr() * 22, y = by + 4 + rr() * 6;
                g = c.createLinearGradient(x, y - h, x, y + 4);
                g.addColorStop(0, `rgba(${70 + rr() * 30},${85 + rr() * 30},${85 + rr() * 25},0.95)`);
                g.addColorStop(1, "rgba(10,18,22,0.95)");
                c.fillStyle = g;
                c.beginPath();
                c.moveTo(x - w / 2, y + 4);
                c.quadraticCurveTo(x - w * 0.45, y - h, x, y - h);
                c.quadraticCurveTo(x + w * 0.5, y - h * 0.9, x + w / 2, y + 4);
                c.fill();
            }
            /* 바닥 쪽 어둠 */
            g = c.createLinearGradient(0, by - 60, 0, by + 10);
            g.addColorStop(0, "rgba(3,12,22,0)");
            g.addColorStop(1, "rgba(3,12,22,0.35)");
            c.fillStyle = g; c.fillRect(0, by - 60, W, 70);
        }
        this.bg = cv;

        /* 비네팅 */
        const vg = document.createElement("canvas");
        vg.width = W * dpr; vg.height = H * dpr;
        const v = vg.getContext("2d");
        v.scale(dpr, dpr);
        g = v.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.35, W / 2, H * 0.45, Math.max(W, H) * 0.8);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,6,14,0.55)");
        v.fillStyle = g; v.fillRect(0, 0, W, H);
        this.vignette = vg;

        /* 부유물 */
        this.snow = Array.from({ length: Math.round(W * H / 9000) }, () => ({
            x: Math.random() * W, y: sy + Math.random() * (H - sy), r: Math.random() * 1.3 + 0.3, v: Math.random() * 6 + 2, a: Math.random() * 0.3 + 0.1
        }));
    },

    seeded(seed) {
        let s = seed;
        return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    },

    /* ---------------- 수평선 햇빛 반짝임 ---------------- */
    drawGlitter(F) {
        const c = F.ctx, sy = F.surfaceY, sx = F.W * 0.8;
        const hz = sy - Math.max(10, sy * 0.1);
        for (let i = 0; i < 26; i++) {
            const ph = (F.t * 0.9 + i * 0.37) % 1;
            const x = sx + Math.sin(i * 12.9) * F.W * 0.16 * (0.4 + (i % 5) / 5);
            const y = hz + 2 + ((i * 7) % 10) / 10 * (sy - hz - 3);
            const a = Math.sin(ph * Math.PI) * 0.8;
            c.fillStyle = `rgba(255,240,210,${a})`;
            c.fillRect(x, y, 2 + (i % 3), 1);
        }
    },

    /* ---------------- 물속 빛줄기 ---------------- */
    drawRays(F) {
        const c = F.ctx, W = F.W, H = F.H, sy = F.surfaceY;
        c.save();
        c.globalCompositeOperation = "lighter";
        for (let i = 0; i < 7; i++) {
            const base = ((i / 7) + Math.sin(F.t * 0.07 + i) * 0.03) * W * 1.2 - W * 0.05;
            const w = 18 + (i % 3) * 16;
            const sway = Math.sin(F.t * 0.35 + i * 1.7) * 40;
            const len = (H - sy) * (0.55 + (i % 4) * 0.12);
            const g = c.createLinearGradient(0, sy, 0, sy + len);
            const a = 0.07 + 0.04 * Math.sin(F.t * 0.8 + i * 2);
            g.addColorStop(0, `rgba(170,230,255,${a})`);
            g.addColorStop(1, "rgba(170,230,255,0)");
            c.fillStyle = g;
            c.beginPath();
            c.moveTo(base, sy);
            c.lineTo(base + w, sy);
            c.lineTo(base + w * 2.2 + sway - 60, sy + len);
            c.lineTo(base + sway - 90, sy + len);
            c.closePath();
            c.fill();
        }
        /* 수면 아래 일렁이는 반사광 (코스틱) */
        c.strokeStyle = "rgba(200,245,255,0.07)";
        c.lineWidth = 1.2;
        for (let k = 0; k < 3; k++) {
            c.beginPath();
            const yy = sy + 10 + k * 9;
            for (let x = 0; x <= W; x += 10) c.lineTo(x, yy + Math.sin(x * 0.04 + F.t * (1.2 + k * 0.4) + k) * 3);
            c.stroke();
        }
        c.restore();
    },

    /* ---------------- 부유물 ---------------- */
    drawSnow(F) {
        const c = F.ctx, dt = 1 / 60;
        this.snow.forEach(p => {
            p.y -= p.v * dt * 0.3;
            p.x += Math.sin(F.t * 0.5 + p.y * 0.02) * 0.1;
            if (p.y < F.surfaceY + 4) { p.y = F.H - 4; p.x = Math.random() * F.W; }
            c.fillStyle = `rgba(200,225,235,${p.a})`;
            c.fillRect(p.x, p.y, p.r, p.r);
        });
    },

    /* ---------------- 지깅: 수심 표시 + 해초 + 어군 ---------------- */
    drawJigWorld(F) {
        const c = F.ctx, W = F.W;
        const by = F.depthToY(F.bottom + 3);
        /* 해초 */
        for (let i = 0; i < 9; i++) {
            const x = ((i * 137) % 100) / 100 * W, h = 22 + (i % 4) * 12;
            c.strokeStyle = i % 2 ? "rgba(44,86,58,0.85)" : "rgba(64,104,62,0.8)";
            c.lineWidth = 2.2;
            c.beginPath(); c.moveTo(x, by + 4);
            for (let s = 1; s <= 6; s++) {
                const yy = by + 4 - h * s / 6;
                c.lineTo(x + Math.sin(F.t * 1.2 + i + s * 0.6) * s * 1.6, yy);
            }
            c.stroke();
        }

        /* 수심 눈금: 20 / 30 / 40 / 50 / 60m (은은하게) */
        c.font = "11px sans-serif";
        c.setLineDash([3, 9]);
        c.strokeStyle = "rgba(190,220,255,0.12)";
        c.fillStyle = "rgba(190,220,255,0.5)";
        c.lineWidth = 1;
        CONFIG.JIG_DEPTHS.forEach(d => {
            const y = F.depthToY(d);
            c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
            c.fillText(d + "m", 6, y - 3);
        });
        c.setLineDash([]);

        /* 목표수심: 부드러운 빛 띠 */
        const zc = F.depthToY(F.target), zh = (F.depthToY(F.zone[1]) - F.depthToY(F.zone[0])) * 0.8;
        const inZone = F.phase !== "fight" && F.inZone();
        const g = c.createLinearGradient(0, zc - zh, 0, zc + zh);
        const col = inZone ? "255,210,90" : "120,200,255";
        g.addColorStop(0, `rgba(${col},0)`);
        g.addColorStop(0.5, `rgba(${col},${inZone ? 0.16 : 0.07})`);
        g.addColorStop(1, `rgba(${col},0)`);
        c.fillStyle = g; c.fillRect(0, zc - zh, W, zh * 2);
        c.fillStyle = inZone ? "rgba(255,220,120,0.95)" : "rgba(170,215,255,0.7)";
        c.font = "bold 12px sans-serif";
        c.textAlign = "right";
        c.fillText(inZone ? "★ DEPTH MATCH!" : `TARGET ${F.target}m`, W - 10, zc - zh * 0.55);
        c.textAlign = "start";

        /* 어군: 대상어가 무리지어 헤엄 */
        if (F.phase !== "fight" && F.phase !== "landing") {
            const fish = Game.state.fish;
            F.shadows.forEach((f, i) => {
                for (let k = 0; k < 2; k++) {
                    const x = f.x * W + k * 34 * (f.v > 0 ? -1 : 1), y = F.depthToY(f.d) + Math.sin(F.t * 0.9 + f.x * 10 + k) * 5 + k * 9;
                    this.drawFishAt(c, fish, x, y, 36 * f.s, f.v > 0 ? 0 : Math.PI, F.t * 7 + i + k, { murk: 0.55, alpha: 0.85 });
                }
            });
        }
    },

    /* ---------------- 캐스팅: 나부라 (물고기 떼가 수면을 깨는 장면) ---------------- */
    drawBoils(F) {
        const c = F.ctx, sy = F.surfaceY, fish = Game.state.fish;
        F.boils.forEach((b, bi) => {
            const x = F.distToX(b.dist);
            const life = U.clamp(Math.min(b.age, b.life - b.age) / 1.2, 0, 1);
            c.save();
            c.globalAlpha = life;
            /* 수면 아래 떼 */
            for (let i = 0; i < 6; i++) {
                const fx = x + Math.sin(F.t * 1.8 + i * 2.1) * 34, fy = sy + 16 + (i % 3) * 10 + Math.cos(F.t * 2.4 + i) * 4;
                this.drawFishAt(c, fish, fx, fy, 30, i % 2 ? 0 : Math.PI, F.t * 9 + i, { murk: 0.35, alpha: 0.9 });
            }
            /* 수면 거품과 물보라 */
            for (let i = 0; i < 10; i++) {
                const ph = (F.t * 1.9 + i * 0.29 + bi) % 1;
                const px = x + Math.sin(i * 4.1) * 30;
                c.fillStyle = `rgba(255,255,255,${0.75 * (1 - ph)})`;
                c.beginPath();
                c.arc(px + ph * Math.sin(i) * 12, sy - Math.sin(ph * Math.PI) * (10 + (i % 4) * 7), 1.5 + (1 - ph) * 2.2, 0, Math.PI * 2);
                c.fill();
            }
            c.fillStyle = "rgba(240,250,255,0.55)";
            c.beginPath(); c.ellipse(x, sy + 1, 38 + Math.sin(F.t * 3) * 4, 3, 0, 0, Math.PI * 2); c.fill();
            c.fillStyle = "rgba(255,255,255,0.95)";
            c.font = "bold 12px sans-serif";
            c.textAlign = "center";
            c.fillText("나부라!", x, sy - 34);
            c.textAlign = "start";
            c.restore();
        });
    },

    /* ---------------- 수면 (파도 + 반투명 경계) ---------------- */
    drawSurface(F) {
        const c = F.ctx, W = F.W, sy = F.surfaceY;
        /* 수면 아래 얇은 밝은 층 */
        c.beginPath();
        c.moveTo(0, sy + 14);
        for (let x = 0; x <= W; x += 6) c.lineTo(x, this.waveY(F, x));
        c.lineTo(W, sy + 14);
        c.closePath();
        const g = c.createLinearGradient(0, sy - 4, 0, sy + 14);
        g.addColorStop(0, "rgba(120,190,215,0.55)");
        g.addColorStop(1, "rgba(31,122,153,0)");
        c.fillStyle = g; c.fill();
        /* 수면 위쪽 (먼바다 색) 메우기 */
        c.beginPath();
        c.moveTo(0, sy - 6);
        for (let x = 0; x <= W; x += 6) c.lineTo(x, this.waveY(F, x));
        c.lineTo(W, sy - 6);
        c.closePath();
        c.fillStyle = "#1d4e70"; c.fill();
        /* 파도 마루 하이라이트 */
        c.beginPath();
        for (let x = 0; x <= W; x += 6) {
            const y = this.waveY(F, x);
            if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.strokeStyle = "rgba(225,242,250,0.75)"; c.lineWidth = 1.3; c.stroke();
        /* 흰 물결 조각 */
        for (let i = 0; i < 18; i++) {
            const x = ((i * 97 + F.t * 12 * (i % 2 ? 1 : -1)) % W + W) % W;
            const y = this.waveY(F, x);
            c.fillStyle = "rgba(255,255,255,0.35)";
            c.fillRect(x, y - 1, 6 + (i % 4) * 3, 1);
        }
    },

    /* ---------------- 낚싯배 ---------------- */
    drawBoat(F) {
        const c = F.ctx, bx = F.boatX, sy = F.surfaceY;
        const wy = this.waveY(F, bx);
        const tilt = (this.waveY(F, bx + 40) - this.waveY(F, bx - 40)) / 80 * 0.6;
        this.boatPose = { x: bx, y: wy - 2, tilt };
        c.save();
        c.translate(bx, wy - 2);
        c.rotate(tilt);

        /* 물속에 잠긴 선체 (흐릿하게) */
        c.save();
        c.globalAlpha = 0.45;
        c.fillStyle = "#5a2a22";
        c.beginPath(); c.moveTo(-74, 2); c.lineTo(58, 2); c.quadraticCurveTo(40, 16, 0, 17); c.lineTo(-66, 15); c.closePath(); c.fill();
        c.restore();

        /* 선체 */
        let g = c.createLinearGradient(0, -24, 0, 4);
        g.addColorStop(0, "#f4f7f9");
        g.addColorStop(0.6, "#d9e0e6");
        g.addColorStop(1, "#aab6c0");
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(-78, -20);
        c.lineTo(52, -20);
        c.quadraticCurveTo(70, -24, 82, -30);    // 뱃머리
        c.quadraticCurveTo(72, -6, 56, 3);
        c.lineTo(-74, 3);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(40,55,70,0.5)"; c.lineWidth = 1; c.stroke();
        /* 흘수선 줄무늬 */
        c.fillStyle = "#0e2a4a";
        c.beginPath(); c.moveTo(-76, -6); c.lineTo(64, -6); c.lineTo(61, -2); c.lineTo(-75, -2); c.closePath(); c.fill();
        c.fillStyle = "#b8202c";
        c.fillRect(-75, -1, 132, 2);
        /* 선체 글자 */
        c.fillStyle = "#123659";
        c.font = "bold 8px sans-serif";
        c.fillText("SHARK", 8, -10);

        /* 난간 */
        c.strokeStyle = "rgba(220,228,235,0.9)"; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-74, -30); c.lineTo(52, -30); c.stroke();
        for (let x = -70; x <= 50; x += 12) { c.beginPath(); c.moveTo(x, -30); c.lineTo(x, -20); c.stroke(); }

        /* 조타실 */
        g = c.createLinearGradient(0, -58, 0, -20);
        g.addColorStop(0, "#eef2f5"); g.addColorStop(1, "#c3ccd4");
        c.fillStyle = g;
        c.beginPath(); c.moveTo(-64, -20); c.lineTo(-64, -52); c.lineTo(-22, -52); c.lineTo(-14, -20); c.closePath(); c.fill();
        c.fillStyle = "#e9eef2"; c.fillRect(-68, -56, 52, 5);   // 지붕
        g = c.createLinearGradient(-60, -47, -20, -36);
        g.addColorStop(0, "#1c3550"); g.addColorStop(0.5, "#5e86a8"); g.addColorStop(1, "#1a3049");
        c.fillStyle = g;
        c.beginPath(); c.moveTo(-58, -46); c.lineTo(-26, -46); c.lineTo(-22, -34); c.lineTo(-58, -34); c.closePath(); c.fill();
        /* 안테나 / 마스트 */
        c.strokeStyle = "#cfd6dc"; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(-50, -56); c.lineTo(-50, -80); c.stroke();
        c.beginPath(); c.moveTo(-58, -72); c.lineTo(-42, -72); c.stroke();
        c.fillStyle = "#e0e5ea"; c.fillRect(-38, -63, 14, 4);   // 레이더

        /* 낚시꾼 (구명조끼) */
        const lean = F.phase === "fight" && Battle.s ? Battle.s.tension / 100 : 0;
        c.save();
        c.translate(24, -20);
        c.rotate(-0.15 - lean * 0.2);
        c.fillStyle = "#1f2a36";                       // 다리
        c.fillRect(-5, -16, 4, 16); c.fillRect(1, -16, 4, 16);
        g = c.createLinearGradient(-7, -36, 7, -16);   // 구명조끼
        g.addColorStop(0, "#ff8a1e"); g.addColorStop(1, "#c9530a");
        c.fillStyle = g;
        c.beginPath(); c.moveTo(-7, -16); c.lineTo(-6, -36); c.lineTo(7, -36); c.lineTo(8, -16); c.closePath(); c.fill();
        c.fillStyle = "#e9eef2"; c.fillRect(-6, -28, 13, 1.5);  // 반사띠
        c.fillStyle = "#d9a37e";                       // 얼굴
        c.beginPath(); c.arc(1, -41, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#15212d";                       // 모자
        c.beginPath(); c.arc(1, -43, 5.4, Math.PI, 0); c.fill();
        c.fillRect(1, -44, 9, 2);
        c.fillStyle = "#101820"; c.fillRect(2, -40, 6, 2);   // 선글라스
        c.restore();
        c.restore();
    },

    /* ---------------- 낚싯대 (텐션에 따라 휘어짐) ---------------- */
    drawRod(F) {
        const c = F.ctx, tip = F.tip, bp = this.boatPose || { x: F.boatX, y: F.surfaceY, tilt: 0 };
        const hx = bp.x + 30, hy = bp.y - 46;          // 손 위치
        const butt = { x: hx - 10, y: hy + 12 };
        let bend = 0.15;
        if (F.phase === "fight" && Battle.s) bend = 0.2 + Battle.s.tension / 110;
        if (F.phase === "hit") bend = 1;
        const cp = { x: butt.x + (tip.x - butt.x) * 0.45 + bend * 6, y: Math.min(butt.y, tip.y) - 30 + bend * 10 };
        /* 손에서 블랭크까지 가늘어지는 낚싯대 */
        const N = 14;
        let px = butt.x, py = butt.y;
        for (let i = 1; i <= N; i++) {
            const t = i / N;
            const x = (1 - t) * (1 - t) * butt.x + 2 * (1 - t) * t * cp.x + t * t * tip.x;
            const y = (1 - t) * (1 - t) * butt.y + 2 * (1 - t) * t * cp.y + t * t * tip.y;
            c.strokeStyle = t < 0.18 ? "#262a30" : (i % 2 ? "#1b2633" : "#22303f");
            c.lineWidth = U.lerp(5, 1.2, t);
            c.lineCap = "round";
            c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke();
            if (i === 3) { c.fillStyle = "#c9a227"; c.beginPath(); c.arc(x, y, 3.2, 0, Math.PI * 2); c.fill(); }   // 릴
            if (i > 4 && i % 3 === 0) { c.strokeStyle = "rgba(220,230,240,0.8)"; c.lineWidth = 0.8; c.beginPath(); c.arc(x, y + 1.5, 1.6, 0, Math.PI * 2); c.stroke(); }
            px = x; py = y;
        }
        /* 팔 */
        c.strokeStyle = "#1f2a36"; c.lineWidth = 3;
        c.beginPath(); c.moveTo(bp.x + 24, bp.y - 50); c.lineTo(hx, hy + 2); c.stroke();
    },

    /* ---------------- 낚싯줄 + 루어 / 물고기 ---------------- */
    drawLineAndCatch(F) {
        const c = F.ctx, tip = F.tip;
        const showFish = ["fight", "landing"].includes(F.phase);
        if (F.phase === "ready" || F.phase === "aim") {
            c.strokeStyle = "rgba(235,240,245,0.65)"; c.lineWidth = 0.9;
            c.beginPath(); c.moveTo(tip.x, tip.y); c.lineTo(tip.x, tip.y + 22); c.stroke();
            this.drawLure(F, tip.x, tip.y + 26, 1.4);
            return;
        }
        const p = showFish ? F.fishPos() : F.lurePos();
        const danger = F.phase === "fight" && Battle.s && Battle.s.tension > 88;
        const slack = F.phase === "fight" && Battle.s ? (1 - Battle.s.tension / 100) * 34 : 12;
        c.strokeStyle = danger ? "rgba(255,110,110,0.95)" : "rgba(235,242,248,0.7)";
        c.lineWidth = danger ? 1.4 : 0.9;
        c.beginPath(); c.moveTo(tip.x, tip.y);
        c.quadraticCurveTo((tip.x + p.x) / 2, (tip.y + p.y) / 2 + slack, p.x, p.y);
        c.stroke();
        if (showFish) this.drawCatch(F, p);
        else this.drawLure(F, p.x, p.y, F.method === "jigging" ? 1.45 - F.kick * 0.7 : F.dive * 0.4);
    },

    drawLure(F, x, y, rot) {
        const c = F.ctx, lure = Game.state.lure;
        const col = lure ? (lure.color || "#cfd8e2") : "#cfd8e2";
        const jig = lure && lure.fishingMethod === "jigging";
        c.save(); c.translate(x, y); c.rotate(rot);
        const L = jig ? 13 : 12, h = jig ? 2.6 : 3.2;
        const g = c.createLinearGradient(0, -h, 0, h);
        g.addColorStop(0, "#ffffff"); g.addColorStop(0.45, col); g.addColorStop(1, "#1a232e");
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(-L, 0); c.quadraticCurveTo(-L * 0.4, -h * 1.6, L * 0.4, -h * 0.8); c.lineTo(L, 0);
        c.lineTo(L * 0.4, h * 0.8); c.quadraticCurveTo(-L * 0.4, h * 1.6, -L, 0);
        c.fill();
        c.strokeStyle = "rgba(220,230,240,0.8)"; c.lineWidth = 0.7;    // 훅
        c.beginPath(); c.arc(L + 2, 2, 2, -1.5, 2); c.stroke();
        c.restore();
        /* 저크할 때 반짝임 */
        if (F.kick > 0.3 || F.dive > 0.3) {
            const a = Math.max(F.kick, F.dive);
            const g2 = c.createRadialGradient(x, y, 0, x, y, 16);
            g2.addColorStop(0, `rgba(255,255,255,${0.6 * a})`); g2.addColorStop(1, "rgba(255,255,255,0)");
            c.fillStyle = g2; c.beginPath(); c.arc(x, y, 16, 0, Math.PI * 2); c.fill();
        }
        if (["working", "retrieve"].includes(F.phase) && F.inZone()) {
            c.strokeStyle = `rgba(255,210,80,${0.35 + 0.25 * Math.sin(F.t * 6)})`;
            c.lineWidth = 1;
            c.beginPath(); c.arc(x, y, 15, 0, Math.PI * 2); c.stroke();
        }
    },

    /* 걸린 물고기 (파이팅 / 랜딩) */
    drawCatch(F, p) {
        const c = F.ctx, fish = Game.fishById(F.catchObj.fishId);
        const gi = Game.gradeIndex(F.catchObj.grade);
        const len = 84 + gi * 22;
        const tip = F.tip;
        const run = Battle.s && (Battle.running || Battle.s.mode === "shake");
        const ang = F.phase === "landing" ? Math.PI + 0.25 : Math.atan2(p.y - tip.y, p.x - tip.x) + Math.PI;  // 머리가 줄 쪽을 향함
        const flap = F.t * (run ? 22 : 11);
        /* 몸통이 바깥쪽으로 → 머리가 p */
        this.drawFishAt(c, fish, p.x, p.y, len, ang, flap, { headAnchor: true, alpha: 1, murk: p.y > F.surfaceY ? U.clamp((p.y - F.surfaceY) / (F.H - F.surfaceY), 0, 1) * 0.35 : 0 });
        /* 물보라 (수면 근처) */
        if (Math.abs(p.y - F.surfaceY) < 30 && Math.random() < 0.5) {
            F.particles.push({ x: p.x + U.rand(-10, 10), y: F.surfaceY, vx: U.rand(-50, 50), vy: U.rand(-120, -40), life: U.rand(0.3, 0.7), r: U.rand(1, 2.6), c: "rgba(240,250,255,0.9)" });
        }
    },

    /* ---------------- 파티클 (물보라 / 거품 / 물방울) ---------------- */
    drawParticles(F) {
        const c = F.ctx;
        F.particles.forEach(p => {
            const a = U.clamp(p.life * 2, 0, 1);
            if (p.ring) {
                c.strokeStyle = `rgba(240,250,255,${a * 0.6})`;
                c.lineWidth = 1;
                c.beginPath(); c.ellipse(p.x, p.y, p.r, p.r * 0.18, 0, 0, Math.PI * 2); c.stroke();
                return;
            }
            c.globalAlpha = a;
            c.fillStyle = p.c || "#fff";
            c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fill();
        });
        c.globalAlpha = 1;
    },

    /* =====================================================
       사실적인 물고기
       ===================================================== */
    /* 어종 모양 정보 */
    shapeInfo(fish) {
        const S = {
            tuna: { h: 0.15, nose: 0.06, tail: 1.25, finlets: true, pect: 0.24 },
            jack: { h: 0.115, nose: 0.05, tail: 1.05, stripe: true, pect: 0.12 },
            gt: { h: 0.2, nose: 0.03, tail: 1.05, blunt: true, pect: 0.16 },
            long: { h: 0.07, nose: 0.06, tail: 0.9, bars: true, pect: 0.08 },
            billfish: { h: 0.085, nose: 0.05, tail: 1.3, bill: 0.22, pect: 0.14 },
            sailfish: { h: 0.075, nose: 0.05, tail: 1.2, bill: 0.24, sail: true, pect: 0.12 },
            mahi: { h: 0.14, nose: 0.0, tail: 1.1, blunt: true, longDorsal: true, pect: 0.1 },
            rooster: { h: 0.17, nose: 0.04, tail: 1.0, comb: true, pect: 0.12 },
            flat: { h: 0.24, nose: 0.03, tail: 0.6, flat: true, pect: 0.08 },
            cod: { h: 0.17, nose: 0.04, tail: 0.55, spiny: true, pect: 0.1, square: true },
            snapper: { h: 0.21, nose: 0.04, tail: 0.75, spiny: true, pect: 0.12 },
            squid: { squid: true },
            octopus: { octopus: true }
        };
        return S[fish.shape] || S.jack;
    },

    /*
      fish 를 (x, y) 에 그림. ang = 머리가 향하는 방향(라디안).
      opts.headAnchor: true 면 (x,y)가 머리 끝, 아니면 몸통 중심
      opts.murk: 0~1 물속 깊이감 (푸르고 어둡게)
    */
    drawFishAt(c, fish, x, y, len, ang, flap, opts) {
        opts = opts || {};
        c.save();
        c.translate(x, y);
        c.rotate(ang);
        /* 머리가 +x 방향. 위아래가 뒤집히지 않게 */
        if (Math.cos(ang) < 0) c.scale(1, -1);
        if (opts.headAnchor) c.translate(-len * 0.0, 0);
        else c.translate(len * 0.5, 0);
        c.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
        this.fishBody(c, fish, len, flap, opts.murk || 0, opts.silhouette);
        c.restore();
    },

    /* 머리 끝 (0,0) 에서 -x 방향으로 몸통이 뻗음 */
    fishBody(c, fish, L, flap, murk, silhouette) {
        const info = this.shapeInfo(fish);
        const col = fish.colors || { back: "#2c5a7a", belly: "#e9eef2", accent: "#e8c547" };
        const deep = "#0a2a40";
        const back = silhouette ? "#0d2033" : this.mix(col.back, deep, murk);
        const mid = silhouette ? "#13293d" : this.mix(this.mix(col.back, "#c9d6df", 0.55), deep, murk);
        const belly = silhouette ? "#183049" : this.mix(col.belly, "#5d8aa5", murk * 0.8);
        const accent = silhouette ? "#163049" : this.mix(col.accent, deep, murk);

        if (info.squid) return this.squidBody(c, L, flap, back, belly, accent);
        if (info.octopus) return this.octopusBody(c, L, flap, back, belly);

        const h = L * info.h;                 // 등 높이
        const hb = h * (info.flat ? 1 : 0.95); // 배 깊이
        const tb = -L * 0.82;                 // 꼬리자루 위치
        const ped = h * 0.16;
        const sw = Math.sin(flap) * 0.18;     // 꼬리 흔들림 (각도)

        /* 꼬리 */
        c.save();
        c.translate(tb, 0);
        c.rotate(sw);
        const ts = h * info.tail;
        c.fillStyle = this.mix(back, "#000000", 0.15);
        c.beginPath();
        if (info.square) {
            c.moveTo(0, -ped); c.lineTo(-L * 0.15, -ts * 0.8); c.lineTo(-L * 0.17, ts * 0.8); c.lineTo(0, ped);
        } else {
            c.moveTo(0, -ped);
            c.quadraticCurveTo(-L * 0.08, -ts * 0.6, -L * 0.2, -ts * 1.05);
            c.quadraticCurveTo(-L * 0.14, -ts * 0.25, -L * 0.09, 0);
            c.quadraticCurveTo(-L * 0.14, ts * 0.25, -L * 0.2, ts * 1.05);
            c.quadraticCurveTo(-L * 0.08, ts * 0.6, 0, ped);
        }
        c.closePath(); c.fill();
        c.restore();

        /* 등지느러미 / 뒷지느러미 */
        c.fillStyle = this.mix(back, "#000000", 0.1);
        if (info.sail) {
            c.globalAlpha *= 0.92;
            c.beginPath(); c.moveTo(-L * 0.12, -h * 0.9);
            c.quadraticCurveTo(-L * 0.25, -h * 4.2, -L * 0.62, -h * 0.85); c.closePath();
            c.fill();
            c.strokeStyle = "rgba(120,170,230,0.5)"; c.lineWidth = 0.7;
            for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(-L * (0.12 + i * 0.08), -h * 0.9); c.lineTo(-L * (0.15 + i * 0.07), -h * (3.6 - i * 0.45)); c.stroke(); }
            c.globalAlpha /= 0.92;
        } else if (info.longDorsal) {
            c.beginPath(); c.moveTo(-L * 0.06, -h * 0.95);
            c.quadraticCurveTo(-L * 0.4, -h * 1.7, -L * 0.78, -h * 0.4); c.lineTo(-L * 0.72, -h * 0.3); c.closePath(); c.fill();
        } else if (info.comb) {
            c.strokeStyle = this.mix(back, "#000000", 0.2); c.lineWidth = Math.max(1, L * 0.012);
            for (let i = 0; i < 7; i++) {
                const bx = -L * (0.22 + i * 0.045);
                c.beginPath(); c.moveTo(bx, -h * 0.9); c.quadraticCurveTo(bx - L * 0.06, -h * 2.4, bx - L * 0.12, -h * (2.6 - i * 0.12)); c.stroke();
            }
        } else if (info.spiny) {
            c.beginPath(); c.moveTo(-L * 0.18, -h * 0.92);
            for (let i = 0; i <= 8; i++) c.lineTo(-L * (0.18 + i * 0.05), -h * (i % 2 ? 1.25 : 1.05));
            c.lineTo(-L * 0.62, -h * 0.75); c.closePath(); c.fill();
        } else if (!info.flat) {
            c.beginPath(); c.moveTo(-L * 0.3, -h * 0.92);
            c.quadraticCurveTo(-L * 0.36, -h * (info.finlets ? 1.9 : 1.55), -L * 0.46, -h * 0.85); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(-L * 0.52, -h * 0.72);
            c.quadraticCurveTo(-L * 0.56, -h * 1.3, -L * 0.62, -h * 0.6); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(-L * 0.52, hb * 0.7);
            c.quadraticCurveTo(-L * 0.56, hb * 1.3, -L * 0.62, hb * 0.6); c.closePath(); c.fill();
        }

        /* 몸통 */
        const nose = L * info.nose;
        c.beginPath();
        c.moveTo(0, info.blunt ? -h * 0.2 : 0);
        if (info.blunt) {
            c.bezierCurveTo(0, -h * 0.9, -L * 0.12, -h * 1.05, -L * 0.3, -h);
        } else {
            c.bezierCurveTo(-nose * 0.2, -h * 0.55, -L * 0.12, -h * 0.98, -L * 0.3, -h);
        }
        c.bezierCurveTo(-L * 0.52, -h * 0.98, -L * 0.7, -h * 0.55, tb, -ped);
        c.lineTo(tb, ped);
        c.bezierCurveTo(-L * 0.7, hb * 0.55, -L * 0.5, hb * 0.98, -L * 0.3, hb);
        c.bezierCurveTo(-L * 0.12, hb * 0.98, -nose * 0.2, hb * 0.5, 0, info.blunt ? h * 0.15 : h * 0.06);
        c.closePath();
        const g = c.createLinearGradient(0, -h, 0, hb);
        g.addColorStop(0, back);
        g.addColorStop(0.38, back);
        g.addColorStop(0.55, mid);
        g.addColorStop(0.72, belly);
        g.addColorStop(1, belly);
        c.fillStyle = g;
        c.fill();

        if (!silhouette) {
            c.save();
            c.clip();
            /* 줄무늬 / 무늬 */
            if (info.stripe) {
                c.strokeStyle = accent; c.globalAlpha *= 0.85; c.lineWidth = Math.max(1.2, h * 0.16);
                c.beginPath(); c.moveTo(-L * 0.05, -h * 0.05); c.quadraticCurveTo(-L * 0.45, -h * 0.2, tb, 0); c.stroke();
                c.globalAlpha /= 0.85;
            }
            if (info.bars) {
                c.strokeStyle = this.mix(back, "#000000", 0.25); c.lineWidth = Math.max(1, L * 0.012); c.globalAlpha *= 0.55;
                for (let i = 0; i < 12; i++) { const bx = -L * (0.12 + i * 0.055); c.beginPath(); c.moveTo(bx, -h); c.lineTo(bx - L * 0.02, h * 0.1); c.stroke(); }
                c.globalAlpha /= 0.55;
            }
            if (info.flat) {
                c.fillStyle = "rgba(20,15,10,0.18)";
                for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-L * (0.15 + (i * 0.37) % 0.55), h * ((i * 0.53) % 1.4 - 0.7), L * 0.02, 0, Math.PI * 2); c.fill(); }
            }
            /* 은빛 반사광 */
            const sh = c.createLinearGradient(0, -h * 0.5, 0, h * 0.2);
            sh.addColorStop(0, "rgba(255,255,255,0)");
            sh.addColorStop(0.5, "rgba(255,255,255,0.28)");
            sh.addColorStop(1, "rgba(255,255,255,0)");
            c.fillStyle = sh;
            c.fillRect(-L, -h * 0.5, L, h * 0.7);
            /* 아가미 */
            c.strokeStyle = "rgba(0,0,0,0.25)"; c.lineWidth = Math.max(0.8, L * 0.008);
            c.beginPath(); c.moveTo(-L * 0.17, -h * 0.75); c.quadraticCurveTo(-L * 0.21, 0, -L * 0.16, hb * 0.7); c.stroke();
            c.restore();
        }

        /* 토막지느러미 (참치) */
        if (info.finlets && !silhouette) {
            c.fillStyle = accent;
            for (let i = 0; i < 6; i++) {
                const fx = -L * (0.64 + i * 0.03);
                const yy = h * (0.55 - i * 0.07);
                c.beginPath(); c.moveTo(fx, -yy); c.lineTo(fx - L * 0.02, -yy - h * 0.12); c.lineTo(fx - L * 0.025, -yy); c.fill();
                c.beginPath(); c.moveTo(fx, yy); c.lineTo(fx - L * 0.02, yy + h * 0.12); c.lineTo(fx - L * 0.025, yy); c.fill();
            }
        }
        /* 가슴지느러미 */
        c.fillStyle = silhouette ? back : this.mix(back, "#9fb4c4", 0.25);
        c.globalAlpha *= 0.85;
        c.beginPath(); c.moveTo(-L * 0.2, h * 0.15);
        c.quadraticCurveTo(-L * (0.2 + info.pect * 0.6), h * 0.1 + Math.sin(sw * 3) * h * 0.1, -L * (0.2 + info.pect), h * 0.45);
        c.quadraticCurveTo(-L * 0.24, h * 0.4, -L * 0.2, h * 0.15);
        c.fill();
        c.globalAlpha /= 0.85;

        /* 주둥이 (빌피시) */
        if (info.bill) {
            c.fillStyle = back;
            c.beginPath(); c.moveTo(0, -h * 0.12); c.lineTo(L * info.bill, h * 0.02); c.lineTo(0, h * 0.12); c.closePath(); c.fill();
        }

        /* 눈 */
        if (!silhouette) {
            const er = Math.max(1.4, h * (info.blunt ? 0.2 : 0.17));
            const ex = -L * (info.blunt ? 0.075 : 0.085), ey = -h * (info.flat ? 0.35 : 0.22);
            c.fillStyle = "#d9c79a"; c.beginPath(); c.arc(ex, ey, er, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#05090d"; c.beginPath(); c.arc(ex, ey, er * 0.66, 0, Math.PI * 2); c.fill();
            c.fillStyle = "rgba(255,255,255,0.85)"; c.beginPath(); c.arc(ex + er * 0.25, ey - er * 0.3, er * 0.22, 0, Math.PI * 2); c.fill();
        }
    },

    squidBody(c, L, flap, back, belly, accent) {
        const h = L * 0.16;
        /* 다리 (앞쪽 = +x 가 다리 방향) */
        c.strokeStyle = back; c.lineCap = "round";
        for (let i = 0; i < 8; i++) {
            c.lineWidth = Math.max(1, L * 0.022);
            const yy = (i - 3.5) * h * 0.14;
            c.beginPath(); c.moveTo(0, yy);
            c.quadraticCurveTo(L * 0.15, yy + Math.sin(flap + i) * h * 0.4, L * 0.32, yy * 1.6 + Math.sin(flap * 1.3 + i) * h * 0.5);
            c.stroke();
        }
        /* 몸통 */
        const g = c.createLinearGradient(0, -h, 0, h);
        g.addColorStop(0, back); g.addColorStop(0.6, this.mix(back, belly, 0.6)); g.addColorStop(1, belly);
        c.fillStyle = g;
        c.beginPath(); c.ellipse(-L * 0.38, 0, L * 0.4, h * 0.8, 0, 0, Math.PI * 2); c.fill();
        /* 지느러미 (몸통 전체) */
        c.fillStyle = this.mix(back, belly, 0.3); c.globalAlpha *= 0.6;
        c.beginPath(); c.ellipse(-L * 0.4, 0, L * 0.42, h * (1.15 + Math.sin(flap) * 0.08), 0, 0, Math.PI * 2); c.fill();
        c.globalAlpha /= 0.6;
        c.fillStyle = g; c.beginPath(); c.ellipse(-L * 0.38, 0, L * 0.4, h * 0.78, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = "rgba(122,195,201,0.5)";
        for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-L * (0.15 + i * 0.09), -h * 0.2 + (i % 2) * h * 0.3, L * 0.012, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = "#05090d"; c.beginPath(); c.arc(-L * 0.02, -h * 0.25, Math.max(1.5, h * 0.18), 0, Math.PI * 2); c.fill();
    },

    octopusBody(c, L, flap, back, belly) {
        const h = L * 0.3;
        c.strokeStyle = back; c.lineCap = "round";
        for (let i = 0; i < 8; i++) {
            c.lineWidth = Math.max(1.2, L * 0.05);
            const a = (i - 3.5) * 0.28;
            c.beginPath(); c.moveTo(0, a * h * 0.4);
            c.bezierCurveTo(L * 0.2, a * h + Math.sin(flap + i) * h * 0.3, L * 0.35, a * h * 1.6, L * 0.55, a * h * 1.4 + Math.sin(flap * 1.2 + i) * h * 0.4);
            c.stroke();
        }
        const g = c.createRadialGradient(-L * 0.2, -h * 0.2, 0, -L * 0.15, 0, L * 0.3);
        g.addColorStop(0, this.mix(back, belly, 0.4)); g.addColorStop(1, back);
        c.fillStyle = g;
        c.beginPath(); c.ellipse(-L * 0.15, 0, L * 0.28, h * 0.7, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#e8d9a8";
        c.beginPath(); c.arc(0, -h * 0.25, Math.max(1.5, h * 0.12), 0, Math.PI * 2); c.fill();
        c.fillStyle = "#05090d"; c.fillRect(-h * 0.08, -h * 0.27, h * 0.16, h * 0.05);
    },

    /* =====================================================
       카드 / 도감 / 결과창용 물고기 이미지 (캐시)
       ===================================================== */
    fishDataURL(fish, silhouette) {
        const key = fish.id + (silhouette ? "_s" : "");
        if (this.fishCache[key]) return this.fishCache[key];
        const W = 400, H = 200;
        const cv = document.createElement("canvas");
        cv.width = W; cv.height = H;
        const c = cv.getContext("2d");
        const info = this.shapeInfo(fish);
        const L = info.bill ? 290 : info.octopus ? 230 : info.squid ? 300 : 330;
        c.save();
        /* 머리를 오른쪽으로 → 몸통이 왼쪽으로 뻗음 */
        const headX = info.squid ? W * 0.62 : info.octopus ? W * 0.55 : (info.bill ? W * 0.8 : W * 0.88);
        const yy = info.sail ? H * 0.62 : H * 0.52;
        c.translate(headX, yy);
        if (!silhouette) {
            c.shadowColor = "rgba(0,0,0,0.35)";
            c.shadowBlur = 14; c.shadowOffsetY = 6;
        }
        this.fishBody(c, fish, L, 0.6, 0, silhouette);
        c.restore();
        this.fishCache[key] = cv.toDataURL("image/png");
        return this.fishCache[key];
    },

    invalidate() { this.bg = null; }
};
