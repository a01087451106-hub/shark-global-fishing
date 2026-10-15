/* =========================================================
   업적 · 칭호 (achieve.js)
   - 조건을 달성하면 보너스 골드 + 칭호를 얻습니다.
   - 얻은 칭호 중 하나를 골라 메뉴와 인증샷 카드에 표시할 수 있어요.
   - 새 업적 추가: LIST 에 { id, icon, ko, en, desc, descEn, gold, goal, value(s) } 한 줄 추가
     value(s) 는 지금 진행 수치를 돌려주고, goal 이상이면 달성입니다.
   ========================================================= */
const Achieve = {
    LIST: [
        { id: "first_fish", icon: "🎣", ko: "첫 손맛", en: "First Bite", desc: "물고기 1마리 잡기", descEn: "Land your first fish", gold: 2000, goal: 1, value: s => s.count },
        { id: "catch_10", icon: "🐟", ko: "초보 앵글러", en: "Rookie Angler", desc: "물고기 10마리 잡기", descEn: "Land 10 fish", gold: 10000, goal: 10, value: s => s.count },
        { id: "catch_50", icon: "🎏", ko: "베테랑 앵글러", en: "Veteran Angler", desc: "물고기 50마리 잡기", descEn: "Land 50 fish", gold: 50000, goal: 50, value: s => s.count },
        { id: "catch_100", icon: "🚤", ko: "선장님", en: "The Captain", desc: "물고기 100마리 잡기", descEn: "Land 100 fish", gold: 120000, goal: 100, value: s => s.count },
        { id: "first_tuna", icon: "🐟", ko: "첫 참치", en: "First Tuna", desc: "참치류 1마리 잡기", descEn: "Land your first tuna", gold: 20000, goal: 1, value: s => s.tuna },
        { id: "tuna_10", icon: "🍣", ko: "참치 헌터", en: "Tuna Hunter", desc: "참치류 10마리 잡기", descEn: "Land 10 tuna", gold: 80000, goal: 10, value: s => s.tuna },
        { id: "club_30", icon: "💪", ko: "30kg 클럽", en: "30kg Club", desc: "30kg 이상 물고기 잡기", descEn: "Land a fish of 30kg+", gold: 30000, goal: 30, value: s => s.maxW, unit: "kg" },
        { id: "club_100", icon: "🦾", ko: "100kg 클럽", en: "100kg Club", desc: "100kg 이상 물고기 잡기", descEn: "Land a fish of 100kg+", gold: 100000, goal: 100, value: s => s.maxW, unit: "kg" },
        { id: "club_300", icon: "🐋", ko: "괴물 사냥꾼", en: "Beast Slayer", desc: "300kg 이상 물고기 잡기", descEn: "Land a fish of 300kg+", gold: 300000, goal: 300, value: s => s.maxW, unit: "kg" },
        { id: "trophy", icon: "🏆", ko: "트로피 헌터", en: "Trophy Hunter", desc: "TROPHY 등급 이상 잡기", descEn: "Land a TROPHY grade or better", gold: 40000, goal: 1, value: s => s.trophy },
        { id: "monster", icon: "👹", ko: "몬스터 헌터", en: "Monster Hunter", desc: "MONSTER 등급 잡기", descEn: "Land a MONSTER grade fish", gold: 150000, goal: 1, value: s => s.monster },
        { id: "hard_trophy", icon: "🔥", ko: "고수", en: "The Master", desc: "난이도 상에서 TROPHY 이상 잡기", descEn: "Land a TROPHY+ on HARD", gold: 100000, goal: 1, value: s => s.hardTrophy },
        { id: "species_5", icon: "📘", ko: "어종 수집가", en: "Collector", desc: "어종 5종 잡기", descEn: "Catch 5 species", gold: 30000, goal: 5, value: s => s.species },
        { id: "species_all", icon: "📚", ko: "도감 마스터", en: "Fish Guide Master", desc: "모든 어종 잡기 (도감 완성)", descEn: "Catch every species", gold: 500000, goal: () => Game.D().fish.length, value: s => s.species },
        { id: "regions_5", icon: "🧭", ko: "여행하는 낚시꾼", en: "Traveling Angler", desc: "지역 5곳에서 잡기", descEn: "Catch fish in 5 regions", gold: 40000, goal: 5, value: s => s.regions },
        { id: "regions_15", icon: "🌏", ko: "세계 정복자", en: "World Conqueror", desc: "지역 15곳에서 잡기", descEn: "Catch fish in 15 regions", gold: 200000, goal: 15, value: s => s.regions },
        { id: "gold_medal", icon: "🥇", ko: "금메달리스트", en: "Gold Medalist", desc: "골드 메달 1개 얻기", descEn: "Earn a GOLD medal", gold: 30000, goal: 1, value: s => s.goldMedals },
        { id: "legend", icon: "👑", ko: "레전드", en: "Legend", desc: "레전드 메달 1개 얻기", descEn: "Earn a LEGEND medal", gold: 150000, goal: 1, value: s => s.legends },
        { id: "attend_7", icon: "📅", ko: "개근상", en: "Perfect Attendance", desc: "출석체크 7번 하기", descEn: "Check in on 7 days", gold: 30000, goal: 7, value: s => s.attend },
        { id: "gear_3", icon: "🎒", ko: "장비 마니아", en: "Gear Fanatic", desc: "장비 3개 구매", descEn: "Buy 3 pieces of gear", gold: 30000, goal: 3, value: s => s.bought },
        { id: "rich", icon: "💰", ko: "백만장자", en: "Millionaire", desc: "총 1,000,000 G 벌기", descEn: "Earn 1,000,000 G in total", gold: 100000, goal: 1000000, value: s => s.earned, unit: "G" }
    ],

    goalOf(a) { return typeof a.goal === "function" ? a.goal() : a.goal; },
    unlocked() { return Store.get(Store.KEYS.ACHIEVE, {}) || {}; },
    isUnlocked(id) { return !!this.unlocked()[id]; },

    stats() {
        const list = Records.all();
        const medals = Store.get(Store.KEYS.MEDALS, {}) || {};
        const D = Game.D();
        const gi = r => D.gradeOrder.indexOf(r.grade);
        return {
            count: list.length,
            tuna: list.filter(r => r.isTuna).length,
            maxW: list.reduce((m, r) => Math.max(m, r.weight), 0),
            trophy: list.filter(r => gi(r) >= 3).length,
            monster: list.filter(r => gi(r) >= 4).length,
            hardTrophy: list.filter(r => r.difficulty === "hard" && gi(r) >= 3).length,
            species: new Set(list.map(r => r.fishId)).size,
            regions: new Set(list.map(r => r.regionId)).size,
            goldMedals: Object.values(medals).filter(v => v >= 3).length,
            legends: Object.values(medals).filter(v => v >= 4).length,
            bought: Shop.owned().length,
            attend: Daily.state().total || 0,
            earned: list.reduce((a, r) => a + (r.gold || Shop.salePrice(r)), 0)
        };
    },

    /* 처음 열 때: 이미 달성한 업적은 보상 없이 조용히 표시만 */
    init() {
        if (Store.get(Store.KEYS.ACHIEVE, null)) return;
        const s = this.stats(), done = {};
        this.LIST.forEach(a => { if (a.value(s) >= this.goalOf(a)) done[a.id] = Date.now(); });
        Store.set(Store.KEYS.ACHIEVE, done);
    },

    /* 새로 달성한 업적 → 보상 지급 후 목록 반환 */
    check() {
        const s = this.stats(), done = this.unlocked(), fresh = [];
        this.LIST.forEach(a => {
            if (!done[a.id] && a.value(s) >= this.goalOf(a)) {
                done[a.id] = Date.now();
                fresh.push(a);
                Shop.addGold(a.gold);
            }
        });
        if (fresh.length) Store.set(Store.KEYS.ACHIEVE, done);
        return fresh;
    },

    reset() { Store.remove(Store.KEYS.ACHIEVE); Store.remove(Store.KEYS.TITLE); },

    /* ---------------- 칭호 / 이름 ---------------- */
    titleId() {
        const done = this.unlocked();
        const sel = Store.get(Store.KEYS.TITLE, null);
        if (sel && done[sel]) return sel;
        /* 고르지 않았으면 가장 보상이 큰(어려운) 업적의 칭호 */
        const best = this.LIST.filter(a => done[a.id]).sort((a, b) => b.gold - a.gold)[0];
        return best ? best.id : null;
    },
    title() {
        const a = this.LIST.find(x => x.id === this.titleId());
        return a ? `${a.icon} ${L(a.ko, a.en)}` : "";
    },
    setTitle(id) { Store.set(Store.KEYS.TITLE, id); },
    playerName() { return (Store.get(Store.KEYS.NAME, "") || "").slice(0, 16); },
    setPlayerName(n) { Store.set(Store.KEYS.NAME, String(n || "").trim().slice(0, 16)); },

    /* ---------------- 🎖 업적 · 칭호 화면 ---------------- */
    render(container) {
        const s = this.stats(), done = this.unlocked(), cur = this.titleId();
        const n = Object.keys(done).length;
        container.innerHTML = `
            <div class="ach-head">
                <label class="ach-name">${L("낚시꾼 이름", "Angler name")}
                    <input id="ach-name" maxlength="16" placeholder="${L("인증샷 카드에 표시돼요", "Shown on your trophy card")}" value="${U.escape(this.playerName())}"></label>
                <div class="ach-title">${L("현재 칭호", "Current title")} <b>${U.escape(this.title() || L("없음", "None"))}</b></div>
                <div class="muted small">${L(`달성 ${n} / ${this.LIST.length} · 칭호를 눌러서 바꿀 수 있어요`, `${n} / ${this.LIST.length} unlocked · tap a title to wear it`)}</div>
            </div>
            <div class="ach-grid">
                ${this.LIST.map(a => {
                    const goal = this.goalOf(a), v = a.value(s), ok = !!done[a.id];
                    const pct = U.clamp(v / goal * 100, 0, 100);
                    const fmt = x => a.unit === "G" ? Shop.fmt(x) : a.unit === "kg" ? U.formatWeight(x) : Math.floor(x);
                    return `<div class="ach-card ${ok ? "done" : ""} ${cur === a.id ? "worn" : ""}" data-id="${a.id}">
                        <div class="ach-icon">${ok ? a.icon : "🔒"}</div>
                        <div class="ach-body">
                            <b>${U.escape(L(a.ko, a.en))}</b>
                            <div class="muted small">${U.escape(L(a.desc, a.descEn))}</div>
                            <div class="ach-bar"><i style="width:${pct}%"></i></div>
                            <div class="small">${ok ? (cur === a.id ? L("✓ 착용 중", "✓ Wearing") : L("✓ 달성 · 눌러서 칭호 착용", "✓ Done · tap to wear")) : `${fmt(Math.min(v, goal))} / ${fmt(goal)}`}
                                <span class="gold-txt">+${Shop.fmt(a.gold)}</span></div>
                        </div>
                    </div>`;
                }).join("")}
            </div>`;
        const input = container.querySelector("#ach-name");
        input.onchange = () => { this.setPlayerName(input.value); };
        container.querySelector(".ach-grid").onclick = e => {
            const c = e.target.closest(".ach-card.done");
            if (!c) return;
            Sound.click();
            this.setTitle(c.dataset.id);
            this.render(container);
        };
    }
};
