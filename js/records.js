/* =========================================================
   기록 (records.js)
   - 랜딩 성공한 물고기를 localStorage 에 저장
   - 나의 최대어 / 물고기 도감 화면
   ========================================================= */
const Records = {
    MAX_HISTORY: 300,

    all() { return Store.getRecords(); },
    totalCount() { return this.all().length; },

    /* 저장 후 신기록 여부 반환 */
    add(rec) {
        const list = this.all();
        const prev = this.bestOf(rec.fishId, list);
        rec.id = "r" + rec.date + Math.floor(Math.random() * 1000);
        list.push(rec);
        if (list.length > this.MAX_HISTORY) {
            /* 오래된 기록부터 지우되 어종별 최대어는 유지 */
            const keep = new Set(Game.D().fish.map(f => (this.bestOf(f.id, list) || {}).id));
            const idx = list.findIndex(r => !keep.has(r.id));
            if (idx >= 0) list.splice(idx, 1);
        }
        const res = { isNew: !prev || rec.weight > prev.weight, prev };
        res.shop = Shop.settle(rec, res);                 // 판매 · 보너스 골드 (rec.gold 기록)
        Store.saveRecords(list);
        res.achieved = Achieve.check();                   // 새로 달성한 업적 (보너스 골드 지급)
        Online.reportCatch(rec);                          // 로그인 중이면 랭킹 · 대물 소식에 등록
        return res;
    },

    bestOf(fishId, list) {
        return (list || this.all()).filter(r => r.fishId === fishId)
            .reduce((b, r) => (!b || r.weight > b.weight ? r : b), null);
    },

    countOf(fishId) { return this.all().filter(r => r.fishId === fishId).length; },

    gradeClass(grade) { return "grade-" + String(grade).toLowerCase(); },

    /* 기록에 저장된 이름 대신 현재 언어의 이름을 보여줌 (데이터에서 못 찾으면 저장된 이름) */
    fishNameOf(r) { const f = Game.fishById(r.fishId); return f ? I18N.name(f) : r.fishName; },
    regionNameOf(r) { const g = Game.regionById(r.regionId); return g ? I18N.name(g) : r.regionName; },
    countryOf(r) { const g = Game.regionById(r.regionId); return g ? I18N.f(g, "country") : r.country; },
    lureNameOf(r) { const l = Game.lureById(r.lureId); return l ? I18N.name(l) : r.lureName; },
    gearNameOf(r, kind) {
        const item = kind === "rod" ? Game.rodById(r.rodId) : Game.reelById(r.reelId);
        return item ? I18N.name(item) : r[kind + "Name"];
    },

    /* 🏆 나의 최대어 */
    renderBest(container) {
        const list = this.all();
        const fishList = Game.D().fish;
        const bests = fishList.map(f => ({ f, b: this.bestOf(f.id, list) })).filter(x => x.b)
            .sort((a, b) => b.b.weight - a.b.weight);
        const recent = list.slice().sort((a, b) => b.date - a.date).slice(0, 15);
        const longest = list.reduce((b, r) => (!b || r.length > b.length ? r : b), null);
        container.innerHTML = `
            <div class="stat-tiles">
                <div class="tile"><b>${list.length}</b><span>${L("총 조과", "Total catch")}</span></div>
                <div class="tile"><b>${bests.length} / ${fishList.length}</b><span>${L("잡은 어종", "Species caught")}</span></div>
                <div class="tile"><b>${bests.length ? U.formatWeight(bests[0].b.weight) : "-"}</b><span>${L("최고 무게", "Heaviest")}</span></div>
                <div class="tile"><b>${longest ? longest.length + "cm" : "-"}</b><span>${L("최장 길이", "Longest")}</span></div>
                <div class="tile tile-gold"><b>${Shop.fmt(Shop.gold())}</b><span>${L("내 골드", "My gold")}</span></div>
            </div>
            ${bests.length === 0 ? `<div class="empty">${L("아직 기록이 없어요.<br>🎣 낚시를 시작해서 첫 번째 물고기를 잡아보세요!", "No records yet.<br>🎣 Start fishing and land your first fish!")}</div>` : ""}
            <div class="card-grid best-grid">
                ${bests.map(({ f, b }) => `
                <div class="best-card">
                    <div class="fish-pic">${U.fishSVG(f)}</div>
                    <div class="best-body">
                        <div class="best-name">${Shop.medalBadge(Shop.medalOf(f.id))} ${U.escape(I18N.name(f))} <span class="grade ${this.gradeClass(b.grade)}">${U.escape(b.gradeLabel)}</span></div>
                        <div class="best-size"><b>${b.length}cm</b> · <b>${U.formatWeight(b.weight)}</b></div>
                        <div class="muted small">${U.escape(this.regionNameOf(b))} · ${U.methodLabel(b.method)} · ${U.escape(this.lureNameOf(b))}</div>
                        <div class="muted small">${U.formatDate(b.date)} · ${I18N.count(this.countOf(f.id))}</div>
                        ${this.nextMedalHTML(f.id)}
                        <button class="btn btn-ghost btn-sm card-btn" data-card="${b.id}">${L("📸 인증샷 카드", "📸 Trophy Card")}</button>
                    </div>
                </div>`).join("")}
            </div>
            ${recent.length ? `<h3 class="section-title">${L("최근 조과", "Recent Catches")}</h3>
            <div class="history">
                ${recent.map(r => `<div class="hist-row">
                    <span class="grade ${this.gradeClass(r.grade)}">${U.escape(r.gradeLabel)}</span>
                    <b>${U.escape(this.fishNameOf(r))}</b>
                    <span>${r.length}cm · ${U.formatWeight(r.weight)}</span>
                    ${r.gold ? `<span class="gold-txt">+${Shop.fmt(r.gold)}</span>` : ""}
                    <span class="muted">${U.escape(this.regionNameOf(r))}</span>
                    <span class="muted small">${U.formatDate(r.date)}</span>
                </div>`).join("")}
            </div>` : ""}`;
        container.onclick = e => {
            const b = e.target.closest("[data-card]");
            if (!b) return;
            Sound.click();
            const rec = this.all().find(r => r.id === b.dataset.card);
            if (rec) TrophyCard.open(rec);
        };
    },

    /* 🐟 물고기 도감 */
    renderDex(container) {
        const list = this.all();
        const fishList = Game.D().fish;
        container.innerHTML = `
            <p class="muted center">${L("잡은 물고기는 컬러로, 아직 못 잡은 물고기는 그림자로 보여요. 카드를 눌러 자세히 보세요.", "Caught fish appear in color, uncaught fish as shadows. Tap a card for details.")}</p>
            <div class="card-grid dex-grid">
                ${fishList.map(f => {
            const b = this.bestOf(f.id, list);
            return `<div class="dex-card ${b ? "caught" : ""}" data-id="${f.id}">
                        <div class="fish-pic">${U.fishSVG(f, { silhouette: !b })}</div>
                        <div class="dex-name">${b ? Shop.medalBadge(Shop.medalOf(f.id)) + " " : ""}${U.escape(I18N.name(f))}</div>
                        ${I18N.en ? "" : `<div class="muted small">${U.escape(f.nameEn)}</div>`}
                        <div class="dex-rec">${b ? `${L("최대", "Best")} ${b.length}cm · ${U.formatWeight(b.weight)}` : L("미포획", "Not caught")}</div>
                    </div>`;
        }).join("")}
            </div>`;
        container.querySelector(".dex-grid").onclick = e => {
            const c = e.target.closest(".dex-card");
            if (!c) return;
            Sound.click();
            this.openFish(Game.fishById(c.dataset.id));
        };
    },

    /* 다음 메달까지 남은 길이 */
    nextMedalHTML(fishId) {
        const need = Shop.nextMedalLength(fishId);
        if (need == null) return `<div class="small gold-txt">${L("👑 최고 메달 달성!", "👑 Top medal achieved!")}</div>`;
        const m = Shop.MEDALS[Shop.medalOf(fishId) + 1];
        return `<div class="small muted">${L(`다음 ${m.icon} ${m.ko}: ${need}cm 이상`, `Next ${m.icon} ${m.en}: ${need}cm+`)}</div>`;
    },

    openFish(f) {
        const b = this.bestOf(f.id);
        const regions = Game.D().regions.filter(r => r.mainFish.includes(f.id));
        const maxW = f.weightK * Math.pow(f.sizeRange.max, 3);
        const months = (f.seasons || []).slice().sort((a, b) => a - b);
        App.openModal(`
            <div class="detail">
                <div class="fish-pic big">${U.fishSVG(f, { silhouette: !b })}</div>
                <h3>${U.escape(I18N.name(f))} ${I18N.en ? "" : `<small class="muted">${U.escape(f.nameEn)}</small>`}</h3>
                ${f.isTuna ? `<span class="badge badge-tuna">TUNA</span>` : ""}
                ${Game.isFishInSeason(f) ? `<span class="badge badge-season">${L("지금 시즌!", "In season now!")}</span>` : ""}
                <p>${U.escape(I18N.f(f, "description"))}</p>
                <div class="detail-grid">
                    <div><span class="muted">${L("낚시 방법", "Method")}</span><b>${f.methods.map(U.methodLabel).join(" / ")}</b></div>
                    <div><span class="muted">${L("파이팅 힘", "Fight power")}</span><b>${U.stars(f.fightPower)}</b></div>
                    <div><span class="muted">${L("시즌", "Season")}</span><b>${I18N.months(months)}</b></div>
                    <div><span class="muted">${L("최대어", "Max size")}</span><b>${f.sizeRange.max}cm · ${U.formatWeight(maxW)}</b></div>
                    <div class="span2"><span class="muted">${L("나의 최대어", "My best")}</span><b>${b ? `${Shop.medalBadge(Shop.medalOf(f.id), true)} ${b.length}cm · ${U.formatWeight(b.weight)} (${U.escape(b.gradeLabel)})` : L("아직 없음", "None yet")}</b></div>
                    <div class="span2"><span class="muted">${L("판매가", "Sale price")}</span><b>💰 ${Shop.fmt(CONFIG.ECONOMY.FISH_PRICE_PER_KG[f.id] || CONFIG.ECONOMY.DEFAULT_PRICE_PER_KG)} / kg</b></div>
                    <div class="span2"><span class="muted">${L("잡을 수 있는 곳", "Where to catch")}</span><b>${U.escape(regions.map(r => I18N.name(r)).join(", ") || "-")}</b></div>
                </div>
            </div>`);
    }
};
