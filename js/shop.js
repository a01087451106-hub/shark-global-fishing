/* =========================================================
   골드 · 상점 · 메달 (shop.js)
   - 잡은 물고기는 자동으로 팔려서 골드(G)가 쌓입니다.
     판매가 = 무게(kg) × 어종 kg당 가격 × 등급 배율 × 난이도 배율
   - 신기록(최고 무게 · 최장 길이)을 깨면 판매가만큼 보너스 (2배)
   - 어종별 메달(브론즈 → 실버 → 골드 → 레전드)을 처음 받을 때 보너스 골드
   - 낚시대 · 릴은 골드로 구매 (POWER 60 이하 낚시대와 VJ3 릴은 처음부터 무료)
   - 가격 · 보너스 숫자는 js/config.js 의 ECONOMY 에서 바꿀 수 있어요
   - 이 브라우저에만 저장됩니다 (게임용 골드 · 실제 돈과 무관)
   ========================================================= */
const Shop = {
    C() { return CONFIG.ECONOMY; },

    /* ---------------- 골드 ---------------- */
    gold() { return Math.max(0, Math.floor(Store.get(Store.KEYS.GOLD, 0) || 0)); },
    addGold(n) { Store.set(Store.KEYS.GOLD, this.gold() + Math.round(n)); },
    fmt(n) { return Math.round(n).toLocaleString("en-US") + " G"; },

    /* 처음 업데이트된 게임을 열면: 이미 잡아둔 기록만큼 골드 · 메달을 한 번 지급 */
    init() {
        if (Store.get(Store.KEYS.ECON_INIT, false)) return;
        const list = Records.all();
        let g = 0;
        list.forEach(r => { g += this.salePrice(r); });
        const medals = {};
        Game.D().fish.forEach(f => {
            const b = Records.bestOf(f.id, list);
            if (b) medals[f.id] = this.medalLevel(b);
        });
        Store.set(Store.KEYS.GOLD, Math.round(g));
        Store.set(Store.KEYS.MEDALS, medals);
        Store.set(Store.KEYS.ECON_INIT, true);
    },

    reset() {
        Store.remove(Store.KEYS.GOLD);
        Store.remove(Store.KEYS.OWNED);
        Store.remove(Store.KEYS.MEDALS);
    },

    /* ---------------- 물고기 판매 ---------------- */
    salePrice(c) {
        const C = this.C();
        const perKg = C.FISH_PRICE_PER_KG[c.fishId] || C.DEFAULT_PRICE_PER_KG;
        const diff = C.DIFFICULTY_MULT[c.difficulty] || 1;
        const p = c.weight * perKg * (C.GRADE_MULT[c.grade] || 1) * diff;
        return Math.max(C.MIN_PRICE, Math.round(p / 10) * 10);
    },

    /* ---------------- 메달 (어종별 · 최대어 크기 기준) ----------------
       0 = 없음, 1 브론즈, 2 실버, 3 골드, 4 레전드 */
    MEDALS: [
        null,
        { icon: "🥉", ko: "브론즈", en: "BRONZE" },
        { icon: "🥈", ko: "실버", en: "SILVER" },
        { icon: "🥇", ko: "골드", en: "GOLD" },
        { icon: "👑", ko: "레전드", en: "LEGEND" }
    ],
    medalLevel(c) {
        const f = Game.fishById(c.fishId);
        if (!f) return 0;
        const t = (c.length - f.sizeRange.min) / (f.sizeRange.max - f.sizeRange.min);
        const th = this.C().MEDAL_SIZE;   // 크기 비율 (0=최소, 1=최대어)
        let lv = 1;
        for (let i = 1; i < th.length; i++) if (t >= th[i]) lv = i + 1;
        return lv;
    },
    medalOf(fishId) { return (Store.get(Store.KEYS.MEDALS, {}) || {})[fishId] || 0; },
    medalBadge(lv, withName) {
        const m = this.MEDALS[lv];
        if (!m) return "";
        return `<span class="medal medal-${lv}" title="${L(m.ko, m.en)}">${m.icon}${withName ? " " + L(m.ko, m.en) : ""}</span>`;
    },
    /* 다음 메달까지 필요한 길이(cm) */
    nextMedalLength(fishId) {
        const f = Game.fishById(fishId), lv = this.medalOf(fishId);
        const th = this.C().MEDAL_SIZE;
        if (!f || lv >= this.MEDALS.length - 1) return null;
        return Math.ceil(f.sizeRange.min + (f.sizeRange.max - f.sizeRange.min) * th[lv]);
    },

    /* 랜딩 후 정산: 판매 + 신기록 보너스 + 메달 보너스 */
    settle(c, result) {
        const C = this.C();
        const sale = this.salePrice(c);
        const lines = [{ label: L("물고기 판매", "Fish sold"), g: sale }];
        if (!result.prev) {
            lines.push({ label: L("🎉 첫 포획 보너스", "🎉 First catch bonus"), g: C.FIRST_CATCH_BONUS });
        } else if (result.isNew) {
            lines.push({ label: L("🏆 신기록 보너스 (판매가 ×2)", "🏆 New record bonus (sale ×2)"), g: sale * (C.RECORD_BONUS_MULT - 1) });
        }
        const medals = Store.get(Store.KEYS.MEDALS, {}) || {};
        const before = medals[c.fishId] || 0, lv = this.medalLevel(c);
        let medalUp = 0;
        if (lv > before) {
            for (let i = before + 1; i <= lv; i++) {
                const m = this.MEDALS[i];
                lines.push({ label: `${m.icon} ${L(m.ko + " 메달 획득!", m.en + " medal earned!")}`, g: C.MEDAL_BONUS[i] });
            }
            medals[c.fishId] = lv;
            Store.set(Store.KEYS.MEDALS, medals);
            medalUp = lv;
        }
        const total = lines.reduce((a, l) => a + l.g, 0);
        this.addGold(total);
        c.gold = total;
        return { lines, total, medalUp, record: !!(result.prev && result.isNew), wallet: this.gold() };
    },

    /* ---------------- 장비 구매 ---------------- */
    owned() { const o = Store.get(Store.KEYS.OWNED, []); return Array.isArray(o) ? o : []; },

    price(item) {
        const kind = item && item.category;
        if (kind !== "rod" && kind !== "reel") return 0;           // 루어는 무료
        if (item.gamePrice != null) return item.gamePrice;         // 데이터에 gamePrice 를 쓰면 그 가격
        const C = this.C();
        if (C.FREE_GEAR.includes(item.id)) return 0;
        const p = (item.gameStats || {}).power || 50;
        if (kind === "rod" && p <= C.FREE_ROD_POWER) return 0;
        const over = Math.max(5, p - C.PRICE_BASE_POWER);
        const k = kind === "reel" ? C.REEL_PRICE_K : C.ROD_PRICE_K;
        return Math.round(over * over * k / 1000) * 1000;
    },

    isOwned(item) { return this.price(item) === 0 || this.owned().includes(item.id); },
    canAfford(item) { return this.gold() >= this.price(item); },

    buy(item) {
        if (this.isOwned(item)) return true;
        const p = this.price(item);
        if (this.gold() < p) return false;
        Store.set(Store.KEYS.GOLD, this.gold() - p);
        Store.set(Store.KEYS.OWNED, this.owned().concat(item.id));
        return true;
    },

    /* 구매 확인 창 → 구매하면 onDone(item) */
    confirmBuy(item, onDone) {
        const p = this.price(item), have = this.gold(), ok = have >= p;
        const box = App.openModal(`
            <div class="detail center">
                ${U.gearImage(item)}
                <h3>${U.escape(I18N.name(item))}</h3>
                <p class="buy-price">${L("가격", "Price")} <b>💰 ${this.fmt(p)}</b></p>
                <p class="muted">${L("내 골드", "My gold")} ${this.fmt(have)} ${ok ? `→ ${this.fmt(have - p)}` : ""}</p>
                ${ok ? "" : `<p class="warn">${L(`골드가 ${this.fmt(p - have)} 부족해요. 물고기를 더 잡아서 팔아보세요!`, `You need ${this.fmt(p - have)} more. Catch and sell more fish!`)}</p>`}
                <div class="detail-actions">
                    ${ok ? `<button class="btn btn-gold" data-act="buy">${L("💰 구매하기", "💰 Buy")}</button>` : ""}
                    <button class="btn btn-mall" data-act="mall">${L("지깅몰에서 실제 제품 보기", "View the real product at Jigging Mall")}</button>
                    <button class="btn btn-ghost" data-act="no">${L("취소", "Cancel")}</button>
                </div>
            </div>`);
        box.onclick = e => {
            const b = e.target.closest("[data-act]");
            if (!b) return;
            Sound.click();
            if (b.dataset.act === "mall") return U.openExternal(Equip.purchaseUrl(item));
            if (b.dataset.act === "buy" && this.buy(item)) {
                App.closeModal(true);
                Sound.landing();
                Haptic.buzz([40, 40, 90]);
                App.toast(L(`✓ ${I18N.name(item)} 구매 완료!`, `✓ Bought ${I18N.name(item)}!`));
                Achieve.check().forEach(a => App.toast(`🎖 ${L(a.ko, a.en)} +${this.fmt(a.gold)}`));
                onDone && onDone(item);
                return;
            }
            App.closeModal(true);
        };
    }
};
