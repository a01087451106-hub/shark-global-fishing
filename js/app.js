/* =========================================================
   앱 시작 / 화면 이동 (app.js)
   GAME START → 지역 → 물고기 → 낚시법 → 낚시대 → 릴 → 루어 → 낚시
   ========================================================= */
const App = {
    current: "title",
    gearStep: "rod",
    equipTab: "rod-jigging",
    modalClose: null,

    init() {
        Sound.init();
        this.applyLinks();
        this.initTitle();
        this.initMenu();
        this.initModal();
        Fishing.init();

        U.$$("[data-go]").forEach(b => b.addEventListener("click", () => {
            Sound.click();
            this.go(b.dataset.go);
        }));
        U.$("#brand-home").addEventListener("click", e => {
            e.preventDefault();
            if (this.isStarted()) this.go("menu"); else this.show("title");
        });
        document.addEventListener("pointerdown", () => Sound.unlock(), { once: true });
        this.show("title");
    },

    /* config.js 의 주소를 data-link 가 있는 모든 링크에 적용 */
    applyLinks() {
        U.$$("[data-link]").forEach(a => {
            const url = CONFIG[a.dataset.link];
            if (!url) return;
            a.href = url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
        });
    },

    isStarted() { return this.started === true; },

    /* ---------------- 화면 전환 ---------------- */
    show(name) {
        if (this.current === "fishing" && name !== "fishing") Fishing.leave();
        U.$$(".screen").forEach(s => s.classList.toggle("active", s.id === "screen-" + name));
        this.current = name;
        document.body.dataset.screen = name;
        window.scrollTo(0, 0);
        if (name === "fishing") requestAnimationFrame(() => Fishing.enter());
    },

    go(name) {
        switch (name) {
            case "menu": this.renderMenu(); break;
            case "start": Game.resetSelection("region"); return this.openMap();
            case "map": return this.openMap();
            case "best": Records.renderBest(U.$("#best-body")); break;
            case "dex": Records.renderDex(U.$("#dex-body")); break;
            case "equipment": this.renderEquipment(); break;
            case "fish": return this.openFish();
            case "method": return this.openMethod();
            case "gear": return this.openGear();
        }
        this.show(name);
    },

    /* ---------------- 첫 화면 + YouTube ---------------- */
    initTitle() {
        const yt = U.$("#btn-youtube");
        const start = U.$("#btn-start");
        const refresh = () => {
            const visited = Store.isYoutubeVisited();
            start.disabled = !visited;
            U.$("#yt-status").innerHTML = visited
                ? `<span class="ok">✓ YouTube 채널 방문 완료</span>`
                : `YouTube 채널을 방문하면 GAME START 버튼이 열려요.<br>채널에서 <b>구독</b> 버튼을 눌러주세요!`;
            start.classList.toggle("ready", visited);
        };
        yt.addEventListener("click", () => {
            /* 정적 사이트는 실제 구독 여부를 확인할 수 없으므로 '방문 완료'만 기록 */
            Store.setYoutubeVisited();
            Sound.unlock();
            setTimeout(refresh, 300);
        });
        start.addEventListener("click", () => {
            if (start.disabled) return;
            Sound.unlock();
            Sound.landing();
            this.started = true;
            this.go("menu");
        });
        refresh();
    },

    /* ---------------- 메인 메뉴 ---------------- */
    initMenu() {
        U.$("#btn-help").addEventListener("click", () => { Sound.click(); this.openHelp(); });
        U.$("#btn-sound").addEventListener("click", () => {
            Sound.unlock();
            Sound.setEnabled(!Sound.enabled);
            this.updateSoundBtn();
            Sound.click();
        });
        U.$("#btn-reset").addEventListener("click", () => { Sound.click(); this.confirmReset(); });
        this.updateSoundBtn();
    },

    updateSoundBtn() {
        U.$("#btn-sound").textContent = Sound.enabled ? "🔊 사운드 ON" : "🔇 사운드 OFF";
    },

    renderMenu() {
        const total = Records.totalCount();
        const need = CONFIG.EXPEDITION_UNLOCK_CATCHES;
        const m = Game.month();
        const tunaOn = Game.D().koreaTunaSeason.months.includes(m);
        const notes = [];
        notes.push(`<span>📅 ${m}월</span>`);
        notes.push(tunaOn
            ? `<span class="badge badge-tuna">TUNA SEASON</span> 대한민국 동해 · 남해 · 제주 참치 출현 확률 UP!`
            : `<span>대한민국 SUMMER TUNA FIELD는 ${Game.D().koreaTunaSeason.months.join("·")}월 시즌</span>`);
        notes.push(total >= need
            ? `<span class="badge badge-exp">TUNA EXPEDITION OPEN</span>`
            : `<span>🔒 TUNA EXPEDITION 오픈까지 ${need - total}마리</span>`);
        U.$("#menu-notes").innerHTML = notes.map(n => `<div>${n}</div>`).join("");
        U.$("#menu-total").textContent = total;
    },

    confirmReset() {
        const box = this.openModal(`
            <div class="detail center">
                <h3>기록 초기화</h3>
                <p>모든 낚시 기록(최대어·도감)을 지울까요?<br>되돌릴 수 없어요.</p>
                <div class="detail-actions">
                    <button class="btn btn-danger" data-act="yes">기록 지우기</button>
                    <button class="btn btn-ghost" data-act="no">취소</button>
                </div>
            </div>`);
        box.onclick = e => {
            const b = e.target.closest("[data-act]");
            if (!b) return;
            if (b.dataset.act === "yes") { Store.clearRecords(); this.renderMenu(); }
            this.closeModal();
        };
    },

    openHelp() {
        this.openModal(`
            <div class="detail help">
                <h3>게임 방법</h3>
                <ol class="steps">
                    <li><b>🌎 지역 선택</b> 세계지도에서 낚시할 바다를 고르세요.</li>
                    <li><b>🐟 물고기 선택</b> 잡고 싶은 물고기를 고르세요.</li>
                    <li><b>🎯 CASTING / ⚓ JIGGING</b> 낚시 방법을 고르세요.</li>
                    <li><b>🎒 장비 3개</b> 낚시대 → 릴 → 루어. 모르겠으면 <b>⭐ 추천 장비로 시작</b>!</li>
                </ol>
                <h4>⚓ JIGGING</h4>
                <p>화면의 <b>TARGET DEPTH</b>(목표수심)를 확인하세요. <b>DROP</b>을 누를 때마다 지그가 20 → 30 → 40 → 50 → 60m로 한 단계씩 내려가요.
                <b>REEL</b>은 한 단계 위로 올려요. 목표수심에 맞으면 <b>DEPTH MATCH!</b> → <b>JERK</b>를 톡! 톡! 눌러 입질을 받으세요.</p>
                <h4>🎯 CASTING</h4>
                <p><b>CAST</b>를 누르면 거리 게이지가 움직여요. 초록 표시(나부라 위치)에 왔을 때 <b>STOP!</b>
                그다음 <b>ACTION</b>을 리듬있게 누르며 <b>REEL</b>로 감으세요.</p>
                <h4>💪 파이팅</h4>
                <p>물고기가 쉴 때는 <b>REEL을 누르고 있기</b>. 화면에 <b>RUN!</b>이 나오면 <b>손을 떼세요</b> (라인 보호).
                텐션 바가 빨간색이 오래 가면 라인이 끊어지고, 너무 오래 안 감으면 바늘이 빠져요.</p>
                <h4>⌨ PC 단축키</h4>
                <p>지깅: <b>Space/↓</b> DROP · <b>J</b> JERK · <b>R/↑</b> REEL<br>캐스팅: <b>Space</b> CAST · STOP · REEL(누르고 있기) · <b>J</b> ACTION<br>파이팅: <b>Space</b> 누르고 있기</p>
                <p class="muted small">PE 라인 · 쇼크리더 · 훅 · 스플릿링은 게임이 자동으로 세팅해요.</p>
            </div>`);
    },

    /* ---------------- 지역 선택 ---------------- */
    openMap() {
        this.show("map");
        World.render(U.$("#map-body"), region => {
            Game.resetSelection("region");
            Game.state.region = region;
            this.openFish();
        });
    },

    /* ---------------- 물고기 선택 ---------------- */
    openFish() {
        const r = Game.state.region;
        if (!r) return this.openMap();
        U.$("#fish-region").innerHTML = `${U.escape(r.country)} · <b>${U.escape(r.name)}</b> ${World.badges(r)}`;
        const list = Game.regionFish(r);
        U.$("#fish-grid").innerHTML = list.map(f => {
            const best = Records.bestOf(f.id);
            const tunaField = f.isTuna && r.tunaSeason;
            let badge = "";
            if (tunaField && Game.isTunaSeason(r)) badge = `<span class="badge badge-tuna">TUNA SEASON</span>`;
            else if (tunaField) badge = `<span class="badge badge-off">시즌 아님 · 출현 확률 낮음</span>`;
            else if (Game.isFishInSeason(f)) badge = `<span class="badge badge-season">시즌</span>`;
            const methods = Game.availableMethods(r, f);
            return `<div class="fish-card" data-id="${f.id}">
                <div class="fish-pic">${U.fishSVG(f)}</div>
                <div class="fc-name">${U.escape(f.name)}</div>
                <div class="muted small">${U.escape(f.nameEn)}</div>
                <div class="fc-badges">${badge}${r.trophyFish && r.trophyFish.includes(f.id) ? `<span class="badge badge-trophy">대물 포인트</span>` : ""}</div>
                <div class="gear-methods">${methods.map(m => `<span class="chip chip-${m}">${U.methodLabel(m)}</span>`).join("")}</div>
                <div class="fc-power">파워 ${U.stars(f.fightPower)}</div>
                <div class="muted small">${best ? `내 최대어 ${best.length}cm · ${U.formatWeight(best.weight)}` : "아직 못 잡았어요"}</div>
            </div>`;
        }).join("");
        U.$("#fish-grid").onclick = e => {
            const c = e.target.closest(".fish-card");
            if (!c) return;
            Sound.click();
            Game.resetSelection("fish");
            Game.state.fish = Game.fishById(c.dataset.id);
            this.openMethod();
        };
        this.show("fish");
    },

    /* ---------------- 낚시 방법 ---------------- */
    openMethod() {
        const { region, fish } = Game.state;
        if (!fish) return this.openFish();
        const avail = Game.availableMethods(region, fish);
        U.$("#method-info").innerHTML = `${U.escape(region.name)} · <b>${U.escape(fish.name)}</b>`;
        const card = (m, icon, title, desc) => {
            const on = avail.includes(m);
            return `<button class="method-card ${on ? "" : "disabled"} method-${m}" data-m="${m}" ${on ? "" : "disabled"}>
                <span class="mc-icon">${icon}</span>
                <span class="mc-title">${title}</span>
                <span class="mc-desc">${on ? desc : "이 물고기는 이 방법으로 잡을 수 없어요"}</span>
                ${on && fish.bestMethod === m ? `<span class="tag tag-rec">추천</span>` : ""}
            </button>`;
        };
        U.$("#method-grid").innerHTML =
            card("casting", "🎯", "CASTING", "펜슬 루어를 멀리 던져 수면의 물고기를 노려요") +
            card("jigging", "⚓", "JIGGING", "메탈지그를 바닥까지 내려 톡톡 쳐 올려요");
        U.$("#method-grid").onclick = e => {
            const b = e.target.closest(".method-card");
            if (!b || b.disabled) return;
            Sound.click();
            Game.resetSelection("method");
            Game.state.method = b.dataset.m;
            this.gearStep = "rod";
            this.openGear();
        };
        this.show("method");
    },

    /* ---------------- 장비 선택 (낚시대 / 릴 / 루어) ---------------- */
    openGear() {
        if (!Game.state.method) return this.openMethod();
        this.renderGear();
        this.show("gear");
    },

    renderGear() {
        const st = Game.state;
        const { fish, method } = st;
        U.$("#gear-info").innerHTML = `${U.escape(st.region.name)} · <b>${U.escape(fish.name)}</b> · ${U.methodIcon(method)} ${U.methodLabel(method)}`;
        const steps = [["rod", "1. 낚시대"], ["reel", "2. 릴"], ["lure", "3. 루어"]];
        U.$("#gear-steps").innerHTML = steps.map(([k, label]) => `
            <button class="step ${this.gearStep === k ? "active" : ""} ${st[k] ? "done" : ""}" data-step="${k}">
                <span>${label}</span><small>${st[k] ? "✓ " + U.escape(st[k].name) : "선택하세요"}</small>
            </button>`).join("");
        U.$("#gear-steps").onclick = e => {
            const b = e.target.closest("[data-step]");
            if (!b) return;
            Sound.click();
            this.gearStep = b.dataset.step;
            this.renderGear();
        };

        let items = [];
        if (this.gearStep === "rod") items = Equip.rodsFor(method, fish.id);
        if (this.gearStep === "reel") {
            items = Equip.reelsFor(method, fish.id);
            if (items.length === 1 && !st.reel) { st.reel = items[0]; return this.renderGear(); }   // 릴이 하나뿐이면 자동 선택
        }
        if (this.gearStep === "lure") items = Equip.luresFor(method, fish.id);
        const lureNote = this.gearStep === "lure"
            ? `<p class="muted small center">${method === "casting" ? "🎯 CASTING: 펜슬 계열 루어만 표시됩니다" : "⚓ JIGGING: 메탈지그 계열 루어만 표시됩니다"} · 오늘 유난히 잘 먹히는 루어가 있을지도...?</p>` : "";
        const reelNote = this.gearStep === "reel" && items.length === 1
            ? `<div class="reel-solo"><span>현재 사용 릴: <b>${U.escape(items[0].name)}</b> ✓</span>
                <button class="btn btn-primary btn-lg" id="btn-reel-next">다음 → 루어 선택</button></div>` : "";
        U.$("#gear-note").innerHTML = lureNote + reelNote;
        const nextBtn = U.$("#btn-reel-next");
        if (nextBtn) nextBtn.onclick = () => { Sound.click(); this.pickGear("reel", items[0]); };
        const grid = U.$("#gear-grid");
        grid.innerHTML = items.map(it => Equip.card(it, this.gearStep, {
            selectable: true, fishId: fish.id, selectedId: st[this.gearStep] && st[this.gearStep].id
        })).join("") || `<div class="empty">선택할 수 있는 장비가 없어요. 데이터 파일을 확인하세요.</div>`;
        Equip.bindList(grid, (kind, item) => this.pickGear(kind, item));

        const ready = st.rod && st.reel && st.lure;
        U.$("#btn-go-fishing").disabled = !ready;
        const warn = ready ? Equip.powerWarning(fish) : "";
        U.$("#gear-summary").innerHTML = ready
            ? `<span class="ok">✓ 기본 채비 자동세팅 완료</span> <span class="muted small">(PE 라인 · 쇼크리더 · 훅 · 스플릿링)</span>${warn ? `<div class="warn small">⚠ ${warn}</div>` : ""}`
            : `<span class="muted">낚시대 · 릴 · 루어를 모두 고르면 낚시를 시작할 수 있어요</span>`;
    },

    pickGear(kind, item) {
        Game.state[kind] = item;
        const order = ["rod", "reel", "lure"];
        let next = order.find(k => !Game.state[k]);
        if (kind === "rod" && !Game.state.lure) next = "reel";   // 낚시대 다음엔 릴(VJ3) 화면을 보여줌
        this.gearStep = next || kind;
        this.renderGear();
        if (!next) U.$("#btn-go-fishing").scrollIntoView({ behavior: "smooth", block: "center" });
    },

    recommendGear() {
        const { fish, method } = Game.state;
        const rec = Equip.recommend(method, fish);
        Game.state.rod = rec.rod;
        Game.state.reel = rec.reel;
        Game.state.lure = rec.lure;
        this.gearStep = "lure";
        this.renderGear();
        Sound.click();
        U.$("#btn-go-fishing").scrollIntoView({ behavior: "smooth", block: "center" });
    },

    startFishing() {
        const st = Game.state;
        if (!(st.rod && st.reel && st.lure)) return;
        Sound.unlock();
        this.show("fishing");
    },

    /* ---------------- 장비 메뉴 (둘러보기) ---------------- */
    renderEquipment() {
        const tabs = [["rod-jigging", "지깅 낚시대"], ["rod-casting", "파핑 낚시대"], ["reel", "릴"], ["lure-casting", "루어 · CASTING"], ["lure-jigging", "루어 · JIGGING"]];
        U.$("#equip-tabs").innerHTML = tabs.map(([k, l]) => `<button class="chip-btn ${this.equipTab === k ? "active" : ""}" data-tab="${k}">${l}</button>`).join("");
        U.$("#equip-tabs").onclick = e => {
            const b = e.target.closest("[data-tab]");
            if (!b) return;
            Sound.click();
            this.equipTab = b.dataset.tab;
            this.renderEquipment();
        };
        const D = Game.D();
        let items, kind;
        if (this.equipTab.startsWith("rod-")) { kind = "rod"; items = Equip.rodsFor(this.equipTab.split("-")[1]); }
        else if (this.equipTab === "reel") { items = D.reels; kind = "reel"; }
        else { kind = "lure"; items = Equip.luresFor(this.equipTab.split("-")[1]); }
        const grid = U.$("#equip-grid");
        grid.innerHTML = items.map(it => Equip.card(it, kind, {})).join("");
        Equip.bindList(grid, null);
    },

    /* ---------------- 결과 ---------------- */
    showResult(c, isNew) {
        const fish = Game.fishById(c.fishId);
        const gi = Game.gradeIndex(c.grade);
        const box = this.openModal(`
            <div class="result grade-bg-${c.grade.toLowerCase()}">
                ${isNew ? `<div class="new-record">🏆 NEW RECORD!</div>` : ""}
                <div class="grade big ${Records.gradeClass(c.grade)}">${U.escape(c.gradeLabel)}</div>
                <div class="fish-pic big ${gi >= 3 ? "glow" : ""}">${U.fishSVG(fish)}</div>
                <h3>${U.escape(fish.name)} <small class="muted">${U.escape(fish.nameEn)}</small></h3>
                <div class="result-size"><b>${c.length}</b>cm <span>·</span> <b>${U.formatWeight(c.weight)}</b></div>
                <div class="muted small">최대어 ${fish.sizeRange.max}cm</div>
                <div class="result-meta">
                    <div>📍 ${U.escape(c.country)} ${U.escape(c.regionName)}</div>
                    <div>${U.methodIcon(c.method)} ${U.methodLabel(c.method)} · ${U.escape(c.lureName)}</div>
                    <div class="muted small">${U.escape(c.rodName)} / ${U.escape(c.reelName)}</div>
                </div>
                <p class="ok small">✓ 기록 저장 완료</p>
                <div class="detail-actions">
                    <button class="btn btn-primary btn-lg" data-act="again">🎣 다시 낚시</button>
                    <button class="btn btn-ghost" data-act="gear">🎒 장비 바꾸기</button>
                    <button class="btn btn-ghost" data-act="map">🌎 지역 바꾸기</button>
                    <button class="btn btn-ghost" data-act="best">🏆 나의 최대어</button>
                </div>
            </div>`, () => Fishing.newRound(false));
        this.bindResultButtons(box);
    },

    showFail(title, tip) {
        const box = this.openModal(`
            <div class="result fail">
                <div class="fail-title">${U.escape(title)}</div>
                <p>${U.escape(tip)}</p>
                <div class="detail-actions">
                    <button class="btn btn-primary btn-lg" data-act="again">💪 다시 도전</button>
                    <button class="btn btn-ghost" data-act="gear">🎒 장비 바꾸기</button>
                    <button class="btn btn-ghost" data-act="map">🌎 지역 바꾸기</button>
                </div>
            </div>`, () => Fishing.newRound(false));
        this.bindResultButtons(box);
    },

    bindResultButtons(box) {
        box.onclick = e => {
            const b = e.target.closest("[data-act]");
            if (!b) return;
            Sound.click();
            const act = b.dataset.act;
            this.closeModal(true);
            if (act === "again") Fishing.newRound(false);
            if (act === "gear") { this.gearStep = "rod"; this.openGear(); }
            if (act === "map") this.go("map");
            if (act === "best") this.go("best");
        };
    },

    /* ---------------- 모달 ---------------- */
    initModal() {
        const m = U.$("#modal");
        m.addEventListener("click", e => {
            if (e.target === m || e.target.closest(".modal-close")) this.closeModal();
        });
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && this.modalOpen()) this.closeModal();
        });
    },

    openModal(html, onClose) {
        const m = U.$("#modal");
        const body = U.$("#modal-body");
        body.innerHTML = html;
        body.onclick = null;
        body.scrollTop = 0;
        m.classList.add("show");
        this.modalClose = onClose || null;
        return body;
    },

    /* silent=true 이면 닫기 콜백을 실행하지 않음 */
    closeModal(silent) {
        U.$("#modal").classList.remove("show");
        const cb = this.modalClose;
        this.modalClose = null;
        if (cb && !silent) cb();
    },

    modalOpen() { return U.$("#modal").classList.contains("show"); }
};

document.addEventListener("DOMContentLoaded", () => {
    U.$("#btn-recommend").addEventListener("click", () => App.recommendGear());
    U.$("#btn-go-fishing").addEventListener("click", () => App.startFishing());
    App.init();
});
