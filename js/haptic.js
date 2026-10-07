/* =========================================================
   손맛 / 진동 (haptic.js)
   - 휴대폰 진동(Vibration API)으로 파이팅 중 손맛을 표현합니다.
     · 질주(RUN)   : 드랙이 풀리는 "지이이익" - 빠르고 촘촘한 떨림 (물고기 힘이 셀수록 강하게)
     · 헤드쉐이크  : 머리를 흔들 때마다 "툭! 툭!"
     · 감을 때     : 릴을 감는 묵직한 "꾹꾹" (텐션이 높을수록 무겁게)
     · 텐션 위험   : 길게 "부르르"
     · 히트 / 랜딩 / 라인 브레이크 : 각각 다른 패턴
   - PC에서 게임패드(진동 지원)를 연결하면 패드가 진동합니다.
   - 아이폰(iOS Safari)은 웹 진동을 지원하지 않아 진동이 나오지 않습니다.
   - 세기는 js/config.js 의 HAPTIC_STRENGTH, 켜고 끄기는 메인 메뉴 버튼
   ========================================================= */
const Haptic = {
    enabled: true,
    wait: 0,

    get supported() { return typeof navigator !== "undefined" && "vibrate" in navigator; },

    init() { this.enabled = Store.isHapticOn(); },

    setEnabled(on) {
        this.enabled = on;
        Store.setHapticOn(on);
        if (!on) this.stop();
    },

    /* pattern: [진동ms, 쉼ms, 진동ms, ...] , strong: 게임패드 세기 0~1 */
    buzz(pattern, strong) {
        const k = CONFIG.HAPTIC_STRENGTH;
        if (!this.enabled || !k) return;
        const p = (Array.isArray(pattern) ? pattern : [pattern]).map((v, i) => i % 2 ? v : Math.round(v * k));
        try { if (this.supported) navigator.vibrate(p); } catch (e) { }
        this.rumble(p.reduce((a, b) => a + b, 0), U.clamp((strong == null ? 0.6 : strong) * k, 0, 1));
    },

    rumble(ms, strong) {
        try {
            const pads = navigator.getGamepads ? navigator.getGamepads() : [];
            for (const pad of pads) {
                const act = pad && pad.vibrationActuator;
                if (act && act.playEffect) act.playEffect("dual-rumble", { duration: ms, strongMagnitude: strong, weakMagnitude: Math.min(1, strong * 0.7 + 0.2) });
            }
        } catch (e) { }
    },

    stop() {
        this.wait = 0;
        try { if (this.supported) navigator.vibrate(0); } catch (e) { }
    },

    /* ---------------- 이벤트별 패턴 ---------------- */
    hit(gi) { this.buzz(gi >= 3 ? [160, 50, 90, 40, 260] : gi >= 2 ? [130, 50, 160] : [120], gi >= 3 ? 1 : 0.8); this.wait = 0.9; },
    landing() { this.buzz([30, 70, 30, 70, 30, 140, 220], 0.5); },
    fail(reason) {
        if (reason === "break") this.buzz([260, 60, 40], 1);   // 팅! 라인이 터지는 느낌
        else this.buzz([60, 120, 30], 0.4);                     // 툭 빠지는 허전함
    },

    /* 파이팅 중 매 프레임 호출 (s = Battle.s) */
    fight(dt, s, reeling) {
        if (!s || !this.enabled) return;
        this.wait -= dt;
        if (this.wait > 0) return;
        const ratio = U.clamp(s.ratio || 0.5, 0.2, 2);
        const running = s.mode === "run" || s.mode === "final";
        if (s.tension > 88) {
            this.buzz([170], 1);                                 // 텐션 위험: 끊어질 듯한 부르르
            this.wait = 0.17;
        } else if (running) {
            /* 드랙이 풀리는 지이이익: 힘이 셀수록 길고 촘촘하게 */
            const on = Math.round(14 + 16 * ratio), off = Math.round(Math.max(12, 34 - 12 * ratio));
            this.buzz([on, off, on, off, on], U.clamp(0.35 + ratio * 0.35, 0, 1));
            this.wait = (on * 3 + off * 2) / 1000;
        } else if (s.mode === "shake") {
            if (s.shakePulse > 0.75) {                          // 머리 흔들 때마다 툭!
                this.buzz([Math.round(35 + 20 * ratio)], 0.8);
                this.wait = 0.24;
            }
        } else if (reeling) {
            /* 릴을 감는 묵직한 꾹꾹: 텐션이 높을수록 무겁고 느리게 */
            this.buzz([Math.round(10 + s.tension * 0.3)], U.clamp(s.tension / 100, 0.2, 0.8));
            this.wait = 0.2 + s.tension / 400;
        } else {
            this.buzz([8], 0.15);                                // 쉬는 중: 살아있는 물고기의 미세한 떨림
            this.wait = U.rand(0.6, 1.1);
        }
    }
};
