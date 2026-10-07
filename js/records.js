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
        Store.saveRecords(list);
        return { isNew: !prev || rec.weight > prev.weight, prev };
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
        container.innerHTML = `
            <div class="stat-tiles">
                <div class="tile"><b>${list.length}</b><span>${L("총 조과", "Total catch")}</span></div>
                <div class="tile"><b>${bests.length} / ${fishList.length}</b><span>${L("잡은 어종", "Species caught")}</span></div>
                <div class="tile"><b>${bests.length ? U.formatWeight(bests[0].b.weight) : "-"}</b><span>${L("최고 무게", "Heaviest")}</span></div>
            </div>
            ${bests.length === 0 ? `<div class="empty">${L("아직 기록이 없어요.<br>🎣 낚시를 시작해서 첫 번째 물고기를 잡아보세요!", "No records yet.<br>🎣 Start fishing and land your first fish!")}</div>` : ""}
            <div class="card-grid best-grid">
                ${bests.map(({ f, b }) => `
                <div class="best-card">
                    <div class="fish-pic">${U.fishSVG(f)}</div>
                    <div class="best-body">
                        <div class="best-name">${U.escape(I18N.name(f))} <span class="grade ${this.gradeClass(b.grade)}">${U.escape(b.gradeLabel)}</span></div>
                        <div class="best-size"><b>${b.length}cm</b> · <b>${U.formatWeight(b.weight)}</b></div>
                        <div class="muted small">${U.escape(this.regionNameOf(b))} · ${U.methodLabel(b.method)} · ${U.escape(this.lureNameOf(b))}</div>
                        <div class="muted small">${U.formatDate(b.date)} · ${I18N.count(this.countOf(f.id))}</div>
                    </div>
                </div>`).join("")}
            </div>
            ${recent.length ? `<h3 class="section-title">${L("최근 조과", "Recent Catches")}</h3>
            <div class="history">
                ${recent.map(r => `<div class="hist-row">
                    <span class="grade ${this.gradeClass(r.grade)}">${U.escape(r.gradeLabel)}</span>
                    <b>${U.escape(this.fishNameOf(r))}</b>
                    <span>${r.length}cm · ${U.formatWeight(r.weight)}</span>
                    <span class="muted">${U.escape(this.regionNameOf(r))}</span>
                    <span class="muted small">${U.formatDate(r.date)}</span>
                </div>`).join("")}
            </div>` : ""}`;
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
                        <div class="dex-name">${U.escape(I18N.name(f))}</div>
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
                    <div class="span2"><span class="muted">${L("나의 최대어", "My best")}</span><b>${b ? `${b.length}cm · ${U.formatWeight(b.weight)} (${U.escape(b.gradeLabel)})` : L("아직 없음", "None yet")}</b></div>
                    <div class="span2"><span class="muted">${L("잡을 수 있는 곳", "Where to catch")}</span><b>${U.escape(regions.map(r => I18N.name(r)).join(", ") || "-")}</b></div>
                </div>
            </div>`);
    }
};
