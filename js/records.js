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

    /* 🏆 나의 최대어 */
    renderBest(container) {
        const list = this.all();
        const fishList = Game.D().fish;
        const bests = fishList.map(f => ({ f, b: this.bestOf(f.id, list) })).filter(x => x.b)
            .sort((a, b) => b.b.weight - a.b.weight);
        const recent = list.slice().sort((a, b) => b.date - a.date).slice(0, 15);
        container.innerHTML = `
            <div class="stat-tiles">
                <div class="tile"><b>${list.length}</b><span>총 조과</span></div>
                <div class="tile"><b>${bests.length} / ${fishList.length}</b><span>잡은 어종</span></div>
                <div class="tile"><b>${bests.length ? U.formatWeight(bests[0].b.weight) : "-"}</b><span>최고 무게</span></div>
            </div>
            ${bests.length === 0 ? `<div class="empty">아직 기록이 없어요.<br>🎣 낚시를 시작해서 첫 번째 물고기를 잡아보세요!</div>` : ""}
            <div class="card-grid best-grid">
                ${bests.map(({ f, b }) => `
                <div class="best-card">
                    <div class="fish-pic">${U.fishSVG(f)}</div>
                    <div class="best-body">
                        <div class="best-name">${U.escape(f.name)} <span class="grade ${this.gradeClass(b.grade)}">${U.escape(b.gradeLabel)}</span></div>
                        <div class="best-size"><b>${b.length}cm</b> · <b>${U.formatWeight(b.weight)}</b></div>
                        <div class="muted small">${U.escape(b.regionName)} · ${U.methodLabel(b.method)} · ${U.escape(b.lureName)}</div>
                        <div class="muted small">${U.formatDate(b.date)} · ${this.countOf(f.id)}마리</div>
                    </div>
                </div>`).join("")}
            </div>
            ${recent.length ? `<h3 class="section-title">최근 조과</h3>
            <div class="history">
                ${recent.map(r => `<div class="hist-row">
                    <span class="grade ${this.gradeClass(r.grade)}">${U.escape(r.gradeLabel)}</span>
                    <b>${U.escape(r.fishName)}</b>
                    <span>${r.length}cm · ${U.formatWeight(r.weight)}</span>
                    <span class="muted">${U.escape(r.regionName)}</span>
                    <span class="muted small">${U.formatDate(r.date)}</span>
                </div>`).join("")}
            </div>` : ""}`;
    },

    /* 🐟 물고기 도감 */
    renderDex(container) {
        const list = this.all();
        const fishList = Game.D().fish;
        container.innerHTML = `
            <p class="muted center">잡은 물고기는 컬러로, 아직 못 잡은 물고기는 그림자로 보여요. 카드를 눌러 자세히 보세요.</p>
            <div class="card-grid dex-grid">
                ${fishList.map(f => {
            const b = this.bestOf(f.id, list);
            return `<div class="dex-card ${b ? "caught" : ""}" data-id="${f.id}">
                        <div class="fish-pic">${U.fishSVG(f, { silhouette: !b })}</div>
                        <div class="dex-name">${U.escape(f.name)}</div>
                        <div class="muted small">${U.escape(f.nameEn)}</div>
                        <div class="dex-rec">${b ? `최대 ${b.length}cm · ${U.formatWeight(b.weight)}` : "미포획"}</div>
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
                <h3>${U.escape(f.name)} <small class="muted">${U.escape(f.nameEn)}</small></h3>
                ${f.isTuna ? `<span class="badge badge-tuna">TUNA</span>` : ""}
                ${Game.isFishInSeason(f) ? `<span class="badge badge-season">지금 시즌!</span>` : ""}
                <p>${U.escape(f.description)}</p>
                <div class="detail-grid">
                    <div><span class="muted">낚시 방법</span><b>${f.methods.map(U.methodLabel).join(" / ")}</b></div>
                    <div><span class="muted">파이팅 힘</span><b>${U.stars(f.fightPower)}</b></div>
                    <div><span class="muted">시즌</span><b>${months.join(", ")}월</b></div>
                    <div><span class="muted">최대어</span><b>${f.sizeRange.max}cm · ${U.formatWeight(maxW)}</b></div>
                    <div class="span2"><span class="muted">나의 최대어</span><b>${b ? `${b.length}cm · ${U.formatWeight(b.weight)} (${U.escape(b.gradeLabel)})` : "아직 없음"}</b></div>
                    <div class="span2"><span class="muted">잡을 수 있는 곳</span><b>${U.escape(regions.map(r => r.name).join(", ") || "-")}</b></div>
                </div>
            </div>`);
    }
};
