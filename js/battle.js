/* =========================================================
   파이팅 (battle.js)
   조작은 단 하나: [REEL] 누르고 있기 (PC: 스페이스바 누르고 있기)

   물고기는 아래 행동을 반복합니다 → 감았다 / 풀었다를 계속 반복해야 랜딩!
   - REST   : 잠깐 쉼          → 지금 빨리 감기!
   - RUN    : 길게 질주         → 손 떼기 (드랙이 풀리며 라인이 나감)
   - SHAKE  : 머리 흔들기       → 잠깐 손 떼기 (짧고 강한 충격)
   - FINAL  : 배 근처 마지막 저항 → 다시 처박는 강한 질주

   - 텐션 100% 이상이 이어지면 → 라인 브레이크
   - 너무 오래 안 감으면(라인이 느슨) → 바늘 빠짐(바레)
   ========================================================= */
const Battle = {
    s: null,

    /* 밸런스 값 (여기 숫자를 바꾸면 난이도 조절) */
    TUNE: {
        gearBase: 2.4,        // 장비 효과 = gearBase + 장비파워 × gearScale (장비가 좋아도 너무 쉬워지지 않게)
        gearScale: 0.3,
        runOut: 1.25,         // 질주 때 라인이 풀리는 속도 배율
        reelSpeed: 1.3,       // 감는 속도 배율
        drainRest: 2.9,       // 감을 때 물고기 체력 감소
        drainRun: 3.3,        // 질주할 때 물고기 체력 감소
        recover: 2.5,         // 안 감고 쉬면 물고기 체력 회복
        breakGrace: 0.3       // 텐션 100% 이상 버틸 수 있는 기본 시간(초)
    },

    start(catchObj, distance) {
        const st = Game.state;
        const T = this.TUNE;
        const gear = Game.gearPower();
        this.s = {
            c: catchObj,
            dist: Math.max(distance, 15),
            startDist: Math.max(distance, 15),
            tension: 35,
            stamina: 100,
            mode: "run",                        // 히트 직후 첫 질주
            modeT: U.rand(2.2, 3.2) + catchObj.power * 0.35,
            runPower: 1.25,
            finalDone: false,
            breakT: 0,
            slackT: 0,
            gearEff: T.gearBase + gear * T.gearScale,
            control: Equip.stat(st.rod, "control", 3),
            speed: Equip.stat(st.reel, "speed", 4),
            lineCap: ((st.reel.gameStats || st.reel.gameStat || {}).line) || 400,   // 게임용 라인 용량(m)
            angle: 0,
            angleTarget: U.rand(-0.8, 0.8),
            time: 0,
            jump: 0,
            shakePulse: 0,
            cycles: 0
        };
        return this.s;
    },

    get running() { return !!this.s && (this.s.mode === "run" || this.s.mode === "final"); },

    /* 다음 행동 고르기 */
    nextMode(s) {
        const st = s.stamina / 100;
        if (s.mode === "rest") {
            /* 쉬고 나면 질주 또는 헤드쉐이크 */
            if (Math.random() < 0.38 + 0.25 * (1 - st)) {
                s.mode = "shake";
                s.modeT = U.rand(0.6, 1.1);
            } else {
                s.mode = "run";
                s.runPower = U.rand(0.85, 1.3) * (0.7 + 0.3 * st);
                s.modeT = (U.rand(1.2, 2.8) + s.c.power * 0.25) * (0.55 + 0.45 * st);
                s.angleTarget = U.rand(-1, 1);
                if (Math.random() < 0.3) s.jump = 1;   // 점프 연출
            }
            s.cycles++;
        } else {
            s.mode = "rest";
            /* 쉬는 시간: 짧게. 지칠수록 조금 길어짐 */
            s.modeT = U.rand(1.0, 2.2) * (0.8 + 0.6 * (1 - st));
        }
    },

    /* 매 프레임 호출. 반환값: "fight" | "landed" | "break" | "hookout" | "lineout" */
    update(dt, reeling) {
        const s = this.s;
        if (!s) return "fight";
        const T = this.TUNE;
        s.time += dt;
        const staminaK = 0.4 + 0.6 * (s.stamina / 100);

        /* 배 근처 마지막 저항 (한 번) */
        if (!s.finalDone && s.dist < 14 && s.stamina > 8 && s.mode !== "run") {
            s.finalDone = true;
            s.mode = "final";
            s.runPower = 1.2;
            s.modeT = U.rand(1.6, 2.6);
            s.angleTarget = 1;
        }

        s.modeT -= dt;
        if (s.modeT <= 0) this.nextMode(s);

        const running = s.mode === "run" || s.mode === "final";
        const shaking = s.mode === "shake";

        /* 헤드쉐이크: 짧은 충격이 반복 */
        s.shakePulse = shaking ? Math.max(0, Math.sin(s.time * 15)) : 0;

        let pull;
        if (running) pull = s.c.power * 1.6 * s.runPower * staminaK;
        else if (shaking) pull = s.c.power * (0.7 + 1.1 * s.shakePulse) * staminaK;
        else pull = s.c.power * 0.45 * staminaK;
        const ratio = pull / s.gearEff;

        /* 목표 텐션 */
        let target;
        if (reeling) target = 30 + 42 * ratio;
        else if (running) target = 14 + 58 * (1 - Math.exp(-ratio / 1.4));   // 손을 떼면 드랙이 미끄러지며 라인 보호
        else if (shaking) target = 12 + 26 * s.shakePulse;
        else target = 3 + 6 * ratio;
        s.tension += (target - s.tension) * Math.min(1, dt * 5) + U.rand(-1.5, 1.5);
        s.tension = U.clamp(s.tension, 0, 135);

        /* 거리 / 체력 */
        const k = Math.sqrt(s.gearEff / Math.max(1, s.c.power));
        if (running) {
            s.dist += pull * T.runOut * (reeling ? 0.5 : 1) * dt;          // 드랙으로 라인 풀림
            s.stamina -= dt * T.drainRun * k * (reeling ? 1.5 : 1);
        } else if (shaking) {
            if (reeling) s.dist -= 0.8 * dt;
            s.stamina -= dt * 1.2 * k;
        } else if (reeling) {
            s.dist -= (2.2 + s.speed * 0.9) * T.reelSpeed * dt * (1.1 - s.stamina / 400);
            s.stamina -= dt * T.drainRest * k;
        } else {
            s.stamina = Math.min(100, s.stamina + dt * T.recover);       // 감지 않으면 물고기도 회복
        }
        s.stamina = U.clamp(s.stamina, 0, 100);

        /* 방향 / 점프 */
        s.angle += (s.angleTarget - s.angle) * Math.min(1, dt * 1.5);
        if (!running && Math.random() < dt * 0.6) s.angleTarget = U.rand(-0.6, 0.6);
        if (s.jump > 0) s.jump = Math.max(0, s.jump - dt * 0.9);

        /* 소리 */
        if (running) Sound.dragOn(U.clamp(ratio / 1.6, 0.2, 1));
        else if (shaking && s.shakePulse > 0.7 && !reeling) Sound.dragOn(0.3);
        else Sound.dragOff();
        if (reeling && !running) Sound.reel();

        /* 실패 조건 */
        if (s.tension >= 100) s.breakT += dt; else s.breakT = Math.max(0, s.breakT - dt * 1.5);
        if (s.breakT > T.breakGrace + s.control * 0.08) return "break";

        if (s.tension < 9 && s.mode === "rest") s.slackT += dt; else s.slackT = Math.max(0, s.slackT - dt * 2);
        if (s.slackT > 2.6) return "hookout";

        if (s.dist >= s.lineCap) return "lineout";

        if (s.dist <= 2) return "landed";
        return "fight";
    },

    /* 화면 안내 문구 */
    hint(reeling) {
        const s = this.s;
        if (!s) return "";
        if (s.tension > 88) return { text: L("⚠ 텐션 위험! 손을 떼세요!", "⚠ Tension danger! Let go!"), cls: "danger" };
        if (s.mode === "final") return { text: L("마지막 저항!! 손 떼고 버티기!", "Last stand!! Let go and hold on!"), cls: "danger" };
        if (s.mode === "run") return reeling ? { text: L("RUN!! 물고기가 달려요 → 손 떼기!", "RUN!! The fish is running → let go!"), cls: "danger" } : { text: L("드랙 지이이익~ 라인이 풀려요! 기다리세요", "Zzzzz~ drag screaming, line peeling off! Wait..."), cls: "warn" };
        if (s.mode === "shake") return reeling ? { text: L("헤드쉐이크! 잠깐 손 떼기!", "Head shake! Let go for a moment!"), cls: "danger" } : { text: L("머리를 흔들어요... 잠깐만!", "It's shaking its head... hold on!"), cls: "warn" };
        if (s.slackT > 1.2) return { text: L("라인이 느슨해요! 빨리 감아요!", "Slack line! Reel in fast!"), cls: "warn" };
        return { text: reeling ? L("좋아요! 감아요! 감아요!", "Nice! Reel! Reel!") : L("지금이에요! REEL 누르고 있기!", "Now! Hold REEL!"), cls: "good" };
    },

    stop() {
        Sound.dragOff();
        this.s = null;
    }
};
