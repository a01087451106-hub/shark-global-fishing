/* =========================================================
   장비 (equipment.js)
   - 낚시대 / 릴 / 루어 3가지만 선택
   - 루어는 낚시법(fishingMethod)으로 자동 필터링
   - 라인·리더·훅·스플릿링은 자동 세팅 처리
   ========================================================= */
const Equip = {
    D() { return window.SHARK_DATA; },

    /* 지깅몰 링크: 상품 상세 → (낚시대) 카테고리 → 지깅몰 메인 */
    purchaseUrl(item) {
        if (item.purchaseUrl) return item.purchaseUrl;
        if (item.category === "rod") {
            return this.methodsOf(item).includes("casting") ? CONFIG.POPPING_ROD_CATEGORY_URL : CONFIG.JIGGING_ROD_CATEGORY_URL;
        }
        return CONFIG.JIGGING_MALL_URL;
    },

    /* fishingMethod 는 "jigging" 처럼 문자열 또는 배열 → 항상 배열로 */
    methodsOf(item) {
        const m = item.fishingMethod;
        return Array.isArray(m) ? m : (m ? [m] : []);
    },

    /* 게임 수치: gameStats(0~100) 또는 예전 gameStat(1~5) → 게임 내부 1~5 단위 */
    stat(item, key, def) {
        const g = (item && (item.gameStats || item.gameStat)) || {};
        const v = g[key];
        if (v == null) return def;
        return v > 5 ? v / 20 : v;
    },

    fishNames(ids) {
        return (ids || []).map(id => Game.fishById(id)).filter(Boolean).map(f => f.name);
    },

    /* 낚시법에 맞는 낚시대 (선택한 물고기 추천 장비가 앞으로) */
    rodsFor(method, fishId) {
        return this.sortByFit(this.D().rods.filter(r => this.methodsOf(r).includes(method)), fishId);
    },
    reelsFor(method, fishId) {
        return this.sortByFit(this.D().reels.filter(r => this.methodsOf(r).includes(method)), fishId);
    },
    /* CASTING → casting 루어만 / JIGGING → jigging 루어만 + 선택 어종 대상 루어 */
    luresFor(method, fishId) {
        return this.D().lures.filter(l => l.fishingMethod === method && (!fishId || l.targetFish.includes(fishId)));
    },

    sortByFit(list, fishId) {
        if (!fishId) return list;
        const fish = Game.fishById(fishId);
        const score = it => (it.targetFish.includes(fishId) ? 0 : 10) + Math.abs(this.stat(it, "power", 3) - fish.recommendedPower);
        return list.slice().sort((a, b) => score(a) - score(b));
    },

    isRecommended(item, fishId) { return !!fishId && item.targetFish.includes(fishId); },

    /* ⭐ 추천 장비로 시작 */
    recommend(method, fish) {
        const pick = list => {
            const scored = list.map(it => ({
                it,
                s: (it.targetFish.includes(fish.id) ? 0 : 5) +
                    Math.abs(this.stat(it, "power", 3) - fish.recommendedPower)
            }));
            scored.sort((a, b) => a.s - b.s);
            return scored.length ? scored[0].it : null;
        };
        const lures = this.luresFor(method, fish.id).slice().sort((a, b) => b.gamePower - a.gamePower);
        return {
            rod: pick(this.rodsFor(method, fish.id)),
            reel: pick(this.reelsFor(method, fish.id)),
            lure: lures[0] || null
        };
    },

    /* 장비가 물고기에 비해 약한지 */
    powerWarning(fish) {
        const p = Game.gearPower();
        if (p + 0.01 < fish.recommendedPower - 1) return "장비가 많이 약해요! 라인이 끊어지기 쉬워요.";
        if (p + 0.01 < fish.recommendedPower) return "장비가 조금 약해요. 파이팅을 조심하세요.";
        return "";
    },

    /* ---------------------------------------------------
       카드 렌더링 (초보자용: 사진 / 이름 / 추천 어종 / 낚시법만)
       --------------------------------------------------- */
    card(item, kind, opts) {
        opts = opts || {};
        /* 루어는 이미 대상어로 걸러져 있으므로 추천 표시는 낚시대/릴에만 */
        const recommended = kind !== "lure" && opts.fishId && this.isRecommended(item, opts.fishId);
        const selected = opts.selectedId === item.id;
        const methods = this.methodsOf(item);
        const target = this.fishNames(item.targetFish).slice(0, 3).join(" / ");
        let extra = "";
        if (kind === "reel") extra = `<div class="gear-meta">${U.escape(item.reelType || "릴")}</div>
            <div class="gear-power">게임용 POWER <span>${U.stars(this.stat(item, "power", 3))}</span></div>`;
        if (kind === "rod") extra = `<div class="gear-power">게임용 POWER <span>${U.stars(this.stat(item, "power", 3))}</span></div>
            <div class="gear-meta">난이도 <b>${U.escape(item.difficulty)}</b></div>`;
        if (kind === "lure") extra = `<div class="gear-meta">${U.escape(item.type)}${item.weight ? " · " + item.weight + "g" : ""}</div>`;
        return `
        <div class="gear-card ${selected ? "selected" : ""}" data-kind="${kind}" data-id="${item.id}">
            ${recommended ? `<span class="tag tag-rec">추천</span>` : ""}
            ${selected ? `<span class="tag tag-sel">✓ 선택됨</span>` : ""}
            ${U.gearImage(item)}
            <div class="gear-name">${U.escape(item.name)}</div>
            ${item.brand ? `<div class="gear-brand">${U.escape(item.brand)}</div>` : ""}
            <div class="gear-target">추천: ${U.escape(target || "-")}</div>
            <div class="gear-methods">${methods.map(m => `<span class="chip chip-${m}">${U.methodLabel(m)}</span>`).join("")}</div>
            ${extra}
            <div class="gear-actions">
                ${opts.selectable ? `<button class="btn btn-primary btn-sm" data-act="select">${this.selectLabel(item, kind)}</button>` : ""}
                <button class="btn btn-ghost btn-sm" data-act="detail">자세히</button>
                <button class="btn btn-mall btn-sm" data-act="mall">지깅몰에서 보기</button>
            </div>
        </div>`;
    },

    /* 자세히 보기: 실제 스펙과 GAME STAT 을 분리해서 표시 */
    detailHTML(item, kind, selectable) {
        const real = item.realSpec || {};
        const realRows = Object.keys(real).map(k => `<tr><th>${U.escape(k)}</th><td>${U.escape(real[k])}</td></tr>`).join("");
        let stats = [];
        if (kind === "lure") {
            stats = [["어필력", item.gamePower], ["대물 보너스", U.clamp(Math.round(1 + (item.rarityBonus || 0) / 0.3 * 4), 1, 5)]];
        } else {
            [["power", "POWER"], ["drag", "DRAG"], ["control", "CONTROL"], ["speed", "SPEED"]].forEach(([k, label]) => {
                const v = this.stat(item, k, null);
                if (v != null) stats.push([label, v, (item.gameStats || {})[k]]);
            });
        }
        const statRows = stats.map(([k, v, raw]) => `
            <div class="stat-row"><span>${k}</span><div class="stat-bar"><i style="width:${U.clamp(v / 5 * 100, 5, 100)}%"></i></div><b>${raw > 5 ? raw : U.stars(v)}</b></div>`).join("");
        const regions = (item.recommendedRegions || []).map(id => Game.regionById(id)).filter(Boolean).map(r => r.name);
        return `
        <div class="detail">
            ${U.gearImage(item)}
            <h3>${U.escape(item.name)}</h3>
            ${item.brand ? `<p class="muted">${U.escape(item.brand)}</p>` : ""}
            <div class="detail-grid">
                <div><span class="muted">추천 어종</span><b>${U.escape(this.fishNames(item.targetFish).join(", ") || "-")}</b></div>
                <div><span class="muted">낚시 방법</span><b>${this.methodsOf(item).map(U.methodLabel).join(" / ")}</b></div>
                ${kind === "lure" ? `<div><span class="muted">종류</span><b>${U.escape(item.type)}${item.weight ? " · " + item.weight + "g" : ""}</b></div>
                    <div><span class="muted">액션</span><b>${U.escape(item.gameAction)}</b></div>` : `<div><span class="muted">${kind === "reel" ? "종류" : "난이도"}</span><b>${U.escape(kind === "reel" ? (item.reelType || "릴") : item.difficulty)}</b></div>`}
                ${regions.length ? `<div class="span2"><span class="muted">추천 지역</span><b>${U.escape(regions.join(", "))}</b></div>` : ""}
            </div>
            <h4>실제 제품 스펙</h4>
            ${realRows ? `<table class="spec-table">${realRows}</table>` : `<p class="muted">지깅몰 상품 페이지를 확인하세요.</p>`}
            <h4>GAME STAT <small class="muted">(게임 전용 수치 · 실제 스펙과 무관)</small></h4>
            ${statRows}
            <div class="detail-actions">
                ${selectable ? `<button class="btn btn-primary" data-act="select">${this.selectLabel(item, kind)}</button>` : ""}
                <button class="btn btn-mall" data-act="mall">${kind === "reel" ? "지깅몰에서 실제 제품 보기" : "지깅몰에서 보기"}</button>
            </div>
        </div>`;
    },

    selectLabel(item, kind) {
        if (kind === "rod") return "이 낚시대 선택";
        if (kind === "reel") return item.id === "vj3" ? "VJ3 선택" : "이 릴 선택";
        return "이 루어 선택";
    },

    itemBy(kind, id) {
        if (kind === "rod") return Game.rodById(id);
        if (kind === "reel") return Game.reelById(id);
        return Game.lureById(id);
    },

    /* 카드 목록 안의 버튼 처리 (선택 / 자세히 / 지깅몰) */
    bindList(container, onSelect) {
        container.onclick = e => {
            const card = e.target.closest(".gear-card");
            if (!card) return;
            const kind = card.dataset.kind, id = card.dataset.id;
            const item = this.itemBy(kind, id);
            const btn = e.target.closest("[data-act]");
            const act = btn ? btn.dataset.act : (onSelect ? "select" : "detail");
            Sound.click();
            if (act === "mall") return U.openExternal(this.purchaseUrl(item));
            if (act === "detail") return this.openDetail(item, kind, onSelect);
            if (act === "select" && onSelect) onSelect(kind, item);
        };
    },

    openDetail(item, kind, onSelect) {
        const box = App.openModal(this.detailHTML(item, kind, !!onSelect));
        box.onclick = e => {
            const btn = e.target.closest("[data-act]");
            if (!btn) return;
            if (btn.dataset.act === "mall") U.openExternal(this.purchaseUrl(item));
            if (btn.dataset.act === "select" && onSelect) { App.closeModal(); onSelect(kind, item); }
        };
    }
};
