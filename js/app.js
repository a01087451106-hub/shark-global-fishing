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
        Haptic.init();
        Shop.init();
        Achieve.init();
        I18N.applyStatic();
        this.applyLinks();
        this.initTitle();
        this.initMenu();
        this.initModal();
        Fishing.init();
        Online.init();

        U.$$("[data-go]").forEach(b => b.addEventListener("click", () => {
            Sound.click();
            this.go(b.dataset.go);
        }));
        U.$("#brand-home").addEventListener("click", e => {
            e.preventDefault();
            if (this.isStarted()) this.go("menu"); else this.show("title");
        });
        document.addEventListener("pointerdown", () => Sound.unlock(), { once: true });
        U.$("#btn-lang").addEventListener("click", () => { Sound.click(); I18N.toggle(); });
        I18N.onChange(() => this.relocalize());
        I18N.detectCountry();
        this.show("title");
    },

    /* 언어가 바뀌면 지금 보고 있는 화면을 다시 그림 */
    relocalize() {
        this.updateSoundBtn();
        switch (this.current) {
            case "menu": this.renderMenu(); break;
            case "map": this.openMap(); break;
            case "fish": this.openFish(); break;
            case "method": this.openMethod(); break;
            case "gear": this.renderGear(); break;
            case "best": case "dex": case "equipment": case "achieve": case "rank": this.go(this.current); break;
            case "fishing": Fishing.hudInfo(); Fishing.updateDepthMeter(); break;
        }
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
            case "achieve": Achieve.render(U.$("#achieve-body")); break;
            case "rank": Online.renderRank(U.$("#rank-body")); break;
            case "fish": return this.openFish();
            case "method": return this.openMethod();
            case "gear": return this.openGear();
        }
        this.show(name);
    },

    /* ---------------- 첫 화면 ---------------- */
    initTitle() {
        U.$("#btn-start").addEventListener("click", () => {
            Sound.unlock();
            Sound.landing();
            Haptic.buzz([60, 40, 120], 0.8);            // 시작 버튼을 누르는 순간 진동 (손맛 진동 확인)
            this.started = true;
            this.go("menu");
            Daily.welcome(() => this.renderMenu());     // 출석체크 → 새 업데이트 소식
        });
    },

    /* ---------------- 메인 메뉴 ---------------- */
    initMenu() {
        U.$("#btn-help").addEventListener("click", () => { Sound.click(); this.openHelp(); });
        U.$("#btn-news").addEventListener("click", () => { Sound.click(); Daily.openNews(false, () => this.renderMenu()); });
        U.$("#btn-sound").addEventListener("click", () => {
            Sound.unlock();
            Sound.setEnabled(!Sound.enabled);
            this.updateSoundBtn();
            Sound.click();
        });
        U.$("#btn-reset").addEventListener("click", () => { Sound.click(); this.confirmReset(); });
        U.$("#diff-select").addEventListener("click", e => {
            const b = e.target.closest("[data-diff]");
            if (!b) return;
            Sound.click();
            Store.setDifficulty(b.dataset.diff);
            Haptic.buzz(b.dataset.diff === "hard" ? [80, 40, 80] : [40]);
            this.renderDifficulty();
        });
        this.updateSoundBtn();
    },

    /* 난이도 하 · 중 · 상 선택 (config.js 의 DIFFICULTY) */
    renderDifficulty() {
        const cur = Game.difficultyId();
        U.$("#diff-select").innerHTML = `<div class="diff-title">${L("난이도", "Difficulty")}</div>
            <div class="diff-btns">${Object.keys(CONFIG.DIFFICULTY).map(id => {
                const d = CONFIG.DIFFICULTY[id];
                return `<button class="diff-btn diff-${id} ${id === cur ? "active" : ""}" data-diff="${id}">
                    <b>${L(d.label, d.labelEn)}</b><small>${U.escape(L(d.desc, d.descEn))}</small></button>`;
            }).join("")}</div>`;
    },

    updateSoundBtn() {
        U.$("#btn-sound").textContent = Sound.enabled ? L("🔊 사운드 ON", "🔊 Sound ON") : L("🔇 사운드 OFF", "🔇 Sound OFF");
    },

    renderMenu() {
        const total = Records.totalCount();
        const need = CONFIG.EXPEDITION_UNLOCK_CATCHES;
        const m = Game.month();
        const tunaOn = Game.D().koreaTunaSeason.months.includes(m);
        const notes = [];
        const tunaMonths = I18N.months(Game.D().koreaTunaSeason.months, "·");
        notes.push(`<span>📅 ${I18N.month(m)}</span>`);
        notes.push(this.tideNote());
        notes.push(tunaOn
            ? `<span class="badge badge-tuna">TUNA SEASON</span> ${L("대한민국 동해 · 남해 · 제주 참치 출현 확률 UP!", "Tuna chance UP in Korea's East Sea · South Sea · Jeju!")}`
            : `<span>${L(`대한민국 SUMMER TUNA FIELD는 ${tunaMonths} 시즌`, `Korea SUMMER TUNA FIELD season: ${tunaMonths}`)}</span>`);
        notes.push(total >= need
            ? `<span class="badge badge-exp">TUNA EXPEDITION OPEN</span>`
            : `<span>${L(`🔒 TUNA EXPEDITION 오픈까지 ${need - total}마리`, `🔒 TUNA EXPEDITION opens in ${need - total} more fish`)}</span>`);
        U.$("#menu-notes").innerHTML = notes.map(n => `<div>${n}</div>`).join("");
        this.renderDifficulty();
        U.$("#menu-total").textContent = total;
        U.$("#menu-gold").textContent = Shop.fmt(Shop.gold());
        U.$("#btn-news").classList.toggle("has-new", Daily.hasNewNews());
        const at = Daily.state();
        U.$("#menu-attend").textContent = at.total ? L(`📅 ${at.streak}일 연속 출석`, `📅 ${at.streak}-day streak`) : "";
        const t = Achieve.title(), nm = Achieve.playerName();
        U.$("#menu-title").innerHTML = t || nm ? `${U.escape(t)} <b>${U.escape(nm || "ANGLER")}</b>` : "";
    },

    /* 화면 아래쪽에 잠깐 뜨는 알림 */
    toast(text) {
        let wrap = U.$("#app-toasts");
        if (!wrap) { wrap = document.createElement("div"); wrap.id = "app-toasts"; document.body.appendChild(wrap); }
        const el = document.createElement("div");
        el.className = "app-toast";
        el.textContent = text;
        wrap.appendChild(el);
        setTimeout(() => el.classList.add("out"), 2600);
        setTimeout(() => el.remove(), 3100);
    },

    /* 🌙 오늘 물때 (한국: 동해 · 남해 · 제주 8물때식 / 서해 7물때식) + 다음 사리 + 피딩타임 */
    tideNote() {
        const east = { id: "namhae", area: "korea" }, west = { id: "seohae", area: "korea" };
        const now = Date.now(), te = Weather.tide(east, now), tw = Weather.tide(west, now);
        let next = "";
        if (te.name !== "7물") {
            for (let d = 1; d <= 15; d++) {
                const t = Weather.tide(east, now + d * 86400000);
                if (t.name === "7물") { const dt = new Date(now + d * 86400000); next = L(` · 다음 사리 ${dt.getMonth() + 1}/${dt.getDate()}(${t.name})`, ` · next spring tide ${dt.getMonth() + 1}/${dt.getDate()}`); break; }
            }
        }
        const kst = (new Date().getUTCHours() + 9) % 24;
        const feeding = (kst >= 5 && kst < 8) || (kst >= 17 && kst < 20);
        return `<span class="tide-note">🌙 ${L("오늘 물때", "Today's tide")} · ${L("동해·남해·제주", "East·South·Jeju")} <b>${te.name}</b> (${te.kind}) · ${L("서해", "West")} <b>${tw.name}</b>${next}${feeding ? ` · <b class="feeding">🌅 ${L("지금 피딩타임!", "Feeding time now!")}</b>` : ""}</span>`;
    },

    confirmReset() {
        const box = this.openModal(`
            <div class="detail center">
                <h3>${L("기록 초기화", "Reset Records")}</h3>
                <p>${L("모든 낚시 기록(최대어·도감)과 골드·구매한 장비·메달을 지울까요?<br>되돌릴 수 없어요.", "Delete all fishing records (best catches · fish guide), gold, purchased gear and medals?<br>This cannot be undone.")}</p>
                <div class="detail-actions">
                    <button class="btn btn-danger" data-act="yes">${L("기록 지우기", "Delete Records")}</button>
                    <button class="btn btn-ghost" data-act="no">${L("취소", "Cancel")}</button>
                </div>
            </div>`);
        box.onclick = e => {
            const b = e.target.closest("[data-act]");
            if (!b) return;
            if (b.dataset.act === "yes") { Store.clearRecords(); Shop.reset(); Achieve.reset(); Achieve.init(); this.renderMenu(); }
            this.closeModal();
        };
    },

    openHelp() {
        this.openModal(I18N.en ? this.helpEn() : `
            <div class="detail help">
                <h3>게임 방법</h3>
                <ol class="steps">
                    <li><b>🌎 지역 선택</b> 세계지도에서 낚시할 바다를 고르세요.</li>
                    <li><b>🐟 물고기 선택</b> 잡고 싶은 물고기를 고르세요.</li>
                    <li><b>🎯 CASTING / ⚓ JIGGING</b> 낚시 방법을 고르세요.</li>
                    <li><b>🎒 장비 3개</b> 낚시대 → 릴 → 루어. 모르겠으면 <b>⭐ 추천 장비로 시작</b>!</li>
                </ol>
                <h4>💰 골드 · 장비 구매</h4>
                <p>잡은 물고기는 <b>무게 × 어종 가격</b>으로 자동 판매돼 골드가 쌓여요. 대물 등급일수록, 난이도가 높을수록 비싸게 팔려요.
                <b>신기록</b>을 깨면 판매가 <b>×2</b>, 어종별 <b>🥉브론즈 → 🥈실버 → 🥇골드 → 👑레전드</b> 메달을 처음 받으면 보너스 골드!
                모은 골드로 <b>🎒 장비</b> 메뉴에서 더 강한 낚시대 · 릴을 사세요. (게임 전용 골드 · 실제 돈과 무관)</p>
                <h4>🎖 업적 · 칭호 / 📸 인증샷</h4>
                <p>"첫 참치", "30kg 클럽" 같은 업적을 달성하면 보너스 골드와 <b>칭호</b>를 얻어요. 큰 고기를 잡으면 <b>📸 인증샷 카드</b>를 만들어 카톡 · 인스타로 자랑해보세요!</p>
                <h4>📡 오늘의 바다 (실시간)</h4>
                <p>지역을 고르면 그곳의 <b>지금 실제 날씨 · 바람 · 파고 · 수온 · 물때 · 현지 시각</b>이 나오고 입질에 반영돼요. 사리 무렵 · 아침저녁 피딩타임 · 비 오는 날은 입질 UP, 강풍 · 한밤중 · 조금은 DOWN.</p>
                <h4>🎚 난이도 하 · 중 · 상</h4>
                <p>메인 메뉴에서 고를 수 있어요. <b>상</b>은 텐션이 금방 차오르고, 물고기가 더 오래 버티고, 입질도 적지만 <b>대물 확률이 올라가요</b>.</p>
                <h4>📳 손맛</h4>
                <p>휴대폰으로 하면 파이팅 중에 진동으로 손맛이 느껴져요. 드랙이 풀릴 때 "지이익", 헤드쉐이크 "툭툭", 감을 때 "꾹꾹". (아이폰은 진동 미지원)</p>
                <h4>⚓ JIGGING</h4>
                <p>화면의 <b>TARGET DEPTH</b>(목표수심)를 확인하세요. <b>DROP</b>을 누를 때마다 지그가 20 → 30 → 40 → 50 → 60m로 한 단계씩 내려가요.
                <b>REEL</b>은 한 단계 위로 올려요. 목표수심에 맞으면 <b>DEPTH MATCH!</b> → <b>JERK</b>를 톡! 톡! 눌러 입질을 받으세요.</p>
                <h4>🎯 CASTING</h4>
                <p><b>CAST</b>를 누르면 거리 게이지가 움직여요. 초록 표시(보일링 위치)에 왔을 때 <b>STOP!</b>
                그다음 <b>ACTION</b>을 리듬있게 누르며 <b>REEL</b>로 감으세요.</p>
                <h4>💪 파이팅</h4>
                <p>물고기가 쉴 때는 <b>REEL을 누르고 있기</b>. 화면에 <b>RUN!</b>이나 <b>헤드쉐이크</b>가 나오면 <b>바로 손을 떼세요</b>. 계속 감으면 라인이 터져요! 난이도가 높을수록 더 빨리 반응해야 해요.
                텐션 바가 빨간색이 오래 가면 라인이 끊어지고, 너무 오래 안 감으면 바늘이 빠져요.</p>
                <h4>⌨ PC 단축키</h4>
                <p>지깅: <b>Space/↓</b> DROP · <b>J</b> JERK · <b>R/↑</b> REEL<br>캐스팅: <b>Space</b> CAST · STOP · REEL(누르고 있기) · <b>J</b> ACTION<br>파이팅: <b>Space</b> 누르고 있기</p>
                <p class="muted small">PE 라인 · 쇼크리더 · 훅 · 스플릿링은 게임이 자동으로 세팅해요.</p>
                <p>📖 규칙 · 점수 계산 · 대물 공략을 더 자세히 보고 싶다면 <a href="${CONFIG.GAME_GUIDE_URL}" target="_blank" rel="noopener noreferrer"><b>게임 가이드</b></a>를 읽어 보세요.</p>
            </div>`);
    },

    helpEn() {
        return `
            <div class="detail help">
                <h3>How to Play</h3>
                <ol class="steps">
                    <li><b>🌎 Choose a region</b> Pick a sea to fish on the world map.</li>
                    <li><b>🐟 Choose a fish</b> Pick the fish you want to catch.</li>
                    <li><b>🎯 CASTING / ⚓ JIGGING</b> Pick a fishing method.</li>
                    <li><b>🎒 3 pieces of gear</b> Rod → Reel → Lure. Not sure? Use <b>⭐ Start with Recommended Gear</b>!</li>
                </ol>
                <h4>💰 Gold · Buying Gear</h4>
                <p>Every fish you land is sold automatically for <b>weight × species price</b>. Bigger grades and harder difficulty pay more.
                Break a <b>personal record</b> for <b>×2</b>, and earn bonus gold the first time you get each species medal: <b>🥉Bronze → 🥈Silver → 🥇Gold → 👑Legend</b>.
                Spend gold on stronger rods and reels in the <b>🎒 Gear</b> menu. (Game-only gold · not real money)</p>
                <h4>🎖 Achievements · Titles / 📸 Trophy Card</h4>
                <p>Unlock achievements like "First Tuna" or "30kg Club" for bonus gold and a <b>title</b>. Land a big one and make a <b>📸 Trophy Card</b> to share!</p>
                <h4>📡 Today's Sea (live)</h4>
                <p>Each region shows its <b>real weather, wind, waves, water temperature, tide and local time</b>, and they affect bites. Spring tides, dawn/dusk and rain help; strong wind, late night and neap tides hurt.</p>
                <h4>🎚 Difficulty EASY · NORMAL · HARD</h4>
                <p>Choose it in the main menu. On <b>HARD</b> tension builds fast, fish fight longer and bite less, but <b>trophy chances go up</b>.</p>
                <h4>📳 Feel the fight</h4>
                <p>On a phone you feel the fight through vibration: drag screaming on runs, thumps on head shakes, heavy pulses as you reel. (Not supported on iPhone)</p>
                <h4>⚓ JIGGING</h4>
                <p>Check the <b>TARGET DEPTH</b> on screen. Each <b>DROP</b> lowers the jig one step: 20 → 30 → 40 → 50 → 60m.
                <b>REEL</b> raises it one step. When you reach the target depth you get <b>DEPTH MATCH!</b> → tap <b>JERK</b> to get a bite.</p>
                <h4>🎯 CASTING</h4>
                <p>Press <b>CAST</b> and the distance gauge starts moving. Hit <b>STOP!</b> on the green mark (the boiling fish).
                Then tap <b>ACTION</b> in rhythm and wind with <b>REEL</b>.</p>
                <h4>💪 Fighting</h4>
                <p>When the fish rests, <b>hold REEL</b>. When <b>RUN!</b> or a <b>head shake</b> appears, <b>let go right away</b> or the line will snap. Higher difficulty means less time to react.
                If the tension bar stays red too long the line breaks; if you don't reel for too long the hook pulls out.</p>
                <h4>⌨ PC Shortcuts</h4>
                <p>Jigging: <b>Space/↓</b> DROP · <b>J</b> JERK · <b>R/↑</b> REEL<br>Casting: <b>Space</b> CAST · STOP · REEL (hold) · <b>J</b> ACTION<br>Fighting: hold <b>Space</b></p>
                <p class="muted small">PE line · shock leader · hooks · split rings are set up automatically.</p>
            </div>`;
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
        U.$("#fish-region").innerHTML = `${U.escape(I18N.f(r, "country"))} · <b>${U.escape(I18N.name(r))}</b> ${World.badges(r)}`;
        this.renderSea("#fish-sea", r, null);
        const list = Game.regionFish(r);
        U.$("#fish-grid").innerHTML = list.map(f => {
            const best = Records.bestOf(f.id);
            const tunaField = f.isTuna && r.tunaSeason;
            let badge = "";
            if (tunaField && Game.isTunaSeason(r)) badge = `<span class="badge badge-tuna">TUNA SEASON</span>`;
            else if (tunaField) badge = `<span class="badge badge-off">${L("시즌 아님 · 출현 확률 낮음", "Off season · low chance")}</span>`;
            else if (Game.isFishInSeason(f)) badge = `<span class="badge badge-season">${L("시즌", "In season")}</span>`;
            const methods = Game.availableMethods(r, f);
            return `<div class="fish-card" data-id="${f.id}">
                <div class="fish-pic">${U.fishSVG(f)}</div>
                <div class="fc-name">${U.escape(I18N.name(f))}</div>
                ${I18N.en ? "" : `<div class="muted small">${U.escape(f.nameEn)}</div>`}
                <div class="fc-badges">${badge}${r.trophyFish && r.trophyFish.includes(f.id) ? `<span class="badge badge-trophy">${L("대물 포인트", "Trophy spot")}</span>` : ""}</div>
                <div class="gear-methods">${methods.map(m => `<span class="chip chip-${m}">${U.methodLabel(m)}</span>`).join("")}</div>
                <div class="fc-power">${L("파워", "Power")} ${U.stars(f.fightPower)}</div>
                <div class="muted small">${best ? `${L("내 최대어", "My best")} ${best.length}cm · ${U.formatWeight(best.weight)}` : L("아직 못 잡았어요", "Not caught yet")}</div>
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

    /* 📡 오늘의 바다 (실시간 날씨 · 물때) - 먼저 물때만 보여주고, 날씨를 받아오면 다시 그림 */
    renderSea(sel, region, fish) {
        const el = U.$(sel);
        if (!el) return;
        el.innerHTML = Weather.cardHTML(region, fish);
        if (!Weather.get(region)) Weather.load(region).then(d => { if (d && U.$(sel) === el) el.innerHTML = Weather.cardHTML(region, fish); });
    },

    /* ---------------- 낚시 방법 ---------------- */
    openMethod() {
        const { region, fish } = Game.state;
        if (!fish) return this.openFish();
        const avail = Game.availableMethods(region, fish);
        U.$("#method-info").innerHTML = `${U.escape(I18N.name(region))} · <b>${U.escape(I18N.name(fish))}</b>`;
        const card = (m, icon, title, desc) => {
            const on = avail.includes(m);
            return `<button class="method-card ${on ? "" : "disabled"} method-${m}" data-m="${m}" ${on ? "" : "disabled"}>
                <span class="mc-icon">${icon}</span>
                <span class="mc-title">${title}</span>
                <span class="mc-desc">${on ? desc : L("이 물고기는 이 방법으로 잡을 수 없어요", "This fish can't be caught with this method")}</span>
                ${on && fish.bestMethod === m ? `<span class="tag tag-rec">${L("추천", "Best")}</span>` : ""}
            </button>`;
        };
        U.$("#method-grid").innerHTML =
            card("casting", "🎯", "CASTING", L("펜슬 루어를 멀리 던져 수면의 물고기를 노려요", "Cast a pencil lure far out to target fish at the surface")) +
            card("jigging", "⚓", "JIGGING", L("메탈지그를 바닥까지 내려 톡톡 쳐 올려요", "Drop a metal jig deep and jerk it back up"));
        U.$("#method-grid").onclick = e => {
            const b = e.target.closest(".method-card");
            if (!b || b.disabled) return;
            Sound.click();
            Game.resetSelection("method");
            Game.state.method = b.dataset.m;
            Equip.shuffleCastingReels();
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
        this.renderSea("#gear-sea", st.region, fish);
        U.$("#gear-info").innerHTML = `${U.escape(I18N.name(st.region))} · <b>${U.escape(I18N.name(fish))}</b> · ${U.methodIcon(method)} ${U.methodLabel(method)} · <span class="badge badge-diff diff-${Game.difficultyId()}">${L("난이도", "Level")} ${Game.difficultyLabel()}</span> · <span class="gold-txt">💰 ${Shop.fmt(Shop.gold())}</span>`;
        const steps = [["rod", L("1. 낚시대", "1. Rod")], ["reel", L("2. 릴", "2. Reel")], ["lure", L("3. 루어", "3. Lure")]];
        U.$("#gear-steps").innerHTML = steps.map(([k, label]) => `
            <button class="step ${this.gearStep === k ? "active" : ""} ${st[k] ? "done" : ""}" data-step="${k}">
                <span>${label}</span><small>${st[k] ? "✓ " + U.escape(I18N.name(st[k])) : L("선택하세요", "Choose")}</small>
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
        /* 보유 중인 장비를 맨 위로 (그 안에서는 추천 순서 유지) */
        items = items.slice().sort((a, b) => (Shop.isOwned(b) ? 1 : 0) - (Shop.isOwned(a) ? 1 : 0));
        const lureNote = this.gearStep === "lure"
            ? `<p class="muted small center">${method === "casting" ? L("🎯 CASTING: 펜슬 계열 루어만 표시됩니다", "🎯 CASTING: only pencil-type lures are shown") : L("⚓ JIGGING: 메탈지그 계열 루어만 표시됩니다", "⚓ JIGGING: only metal jig-type lures are shown")} · ${L("오늘 유난히 잘 먹히는 루어가 있을지도...?", "Maybe one lure is especially hot today...?")}</p>` : "";
        const reelNote = this.gearStep === "reel" && items.length === 1
            ? `<div class="reel-solo"><span>${L("현재 사용 릴", "Current reel")}: <b>${U.escape(I18N.name(items[0]))}</b> ✓</span>
                <button class="btn btn-primary btn-lg" id="btn-reel-next">${L("다음 → 루어 선택", "Next → Choose Lure")}</button></div>` : "";
        U.$("#gear-note").innerHTML = lureNote + reelNote;
        const nextBtn = U.$("#btn-reel-next");
        if (nextBtn) nextBtn.onclick = () => { Sound.click(); this.pickGear("reel", items[0]); };
        const grid = U.$("#gear-grid");
        grid.innerHTML = items.map(it => Equip.card(it, this.gearStep, {
            selectable: true, fishId: fish.id, selectedId: st[this.gearStep] && st[this.gearStep].id
        })).join("") || `<div class="empty">${L("선택할 수 있는 장비가 없어요. 데이터 파일을 확인하세요.", "No gear available. Please check the data files.")}</div>`;
        Equip.bindList(grid, (kind, item) => this.pickGear(kind, item), item => this.pickGear(item.category, item));

        const ready = st.rod && st.reel && st.lure;
        U.$("#btn-go-fishing").disabled = !ready;
        const warn = ready ? Equip.powerWarning(fish) : "";
        U.$("#gear-summary").innerHTML = ready
            ? `<span class="ok">${L("✓ 기본 채비 자동세팅 완료", "✓ Basic rig set up automatically")}</span> <span class="muted small">${L("(PE 라인 · 쇼크리더 · 훅 · 스플릿링)", "(PE line · shock leader · hooks · split rings)")}</span>${warn ? `<div class="warn small">⚠ ${warn}</div>` : ""}`
            : `<span class="muted">${L("낚시대 · 릴 · 루어를 모두 고르면 낚시를 시작할 수 있어요", "Choose a rod, reel and lure to start fishing")}</span>`;
    },

    pickGear(kind, item) {
        Game.state[kind] = item;
        const order = ["rod", "reel", "lure"];
        let next = order.find(k => !Game.state[k]);
        if (kind === "rod" && !Game.state.lure) next = "reel";   // 낚시대 다음엔 릴 화면을 보여줌
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
        const tabs = [["rod-jigging", L("지깅 낚시대", "Jigging Rods")], ["rod-casting", L("파핑 낚시대", "Popping Rods")], ["reel", L("릴", "Reels")], ["lure-casting", L("루어 · CASTING", "Lures · CASTING")], ["lure-jigging", L("루어 · JIGGING", "Lures · JIGGING")]];
        U.$("#equip-wallet").innerHTML = `💰 ${L("내 골드", "My gold")} <b>${Shop.fmt(Shop.gold())}</b> <span class="muted small">${L("· 물고기를 잡으면 자동 판매돼 골드가 쌓여요", "· Fish you land are sold automatically")}</span>`;
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
        /* 보유 중인 장비를 맨 위로 */
        items = items.slice().sort((a, b) => (Shop.isOwned(b) ? 1 : 0) - (Shop.isOwned(a) ? 1 : 0));
        const grid = U.$("#equip-grid");
        grid.innerHTML = items.map(it => Equip.card(it, kind, {})).join("");
        Equip.bindList(grid, null, () => this.renderEquipment());
    },

    /* ---------------- 결과 ---------------- */
    showResult(c, isNew, shop, achieved) {
        const fish = Game.fishById(c.fishId);
        const ach = (achieved || []).map(a => `<div class="ach-up">🎖 ${L("업적 달성", "Achievement")}: <b>${a.icon} ${U.escape(L(a.ko, a.en))}</b> <span class="gold-txt">+${Shop.fmt(a.gold)}</span><small>${L("새 칭호를 얻었어요!", "New title unlocked!")}</small></div>`).join("");
        const money = shop ? `
                <div class="sale-box">
                    ${shop.lines.map(l => `<div class="sale-row"><span>${U.escape(l.label)}</span><b>+${Shop.fmt(l.g)}</b></div>`).join("")}
                    <div class="sale-row sale-total"><span>${L("합계", "Total")}</span><b>💰 +${Shop.fmt(shop.total)}</b></div>
                    <div class="muted small">${L("내 골드", "My gold")} ${Shop.fmt(shop.wallet)}</div>
                    ${this.nextGearHint()}
                </div>` : "";
        const gi = Game.gradeIndex(c.grade);
        const box = this.openModal(`
            <div class="result grade-bg-${c.grade.toLowerCase()}">
                ${isNew ? `<div class="new-record">🏆 NEW RECORD!${shop && shop.record ? `<small>${L("최고 무게 · 최장 길이 갱신", "Heaviest · longest updated")}</small>` : ""}</div>` : ""}
                ${shop && shop.medalUp ? `<div class="medal-up">${Shop.medalBadge(shop.medalUp, true)} ${L("메달 획득!", "medal!")}</div>` : ""}
                <div class="grade big ${Records.gradeClass(c.grade)}">${U.escape(c.gradeLabel)}</div>
                <div class="fish-pic big ${gi >= 3 ? "glow" : ""}">${U.fishSVG(fish)}</div>
                <h3>${U.escape(I18N.name(fish))} ${I18N.en ? "" : `<small class="muted">${U.escape(fish.nameEn)}</small>`}</h3>
                <div class="result-size"><b>${c.length}</b>cm <span>·</span> <b>${U.formatWeight(c.weight)}</b></div>
                <div class="muted small">${L("최대어", "Max size")} ${fish.sizeRange.max}cm</div>
                <div class="result-meta">
                    <div>📍 ${U.escape(Records.countryOf(c))} ${U.escape(Records.regionNameOf(c))}</div>
                    <div>${U.methodIcon(c.method)} ${U.methodLabel(c.method)} · ${U.escape(Records.lureNameOf(c))}</div>
                    <div class="muted small">${U.escape(Records.gearNameOf(c, "rod"))} / ${U.escape(Records.gearNameOf(c, "reel"))}</div>
                    ${c.difficulty ? `<div class="muted small">${L("난이도", "Level")} ${Game.difficultyLabel(c.difficulty)}</div>` : ""}
                </div>
                ${money}
                ${ach}
                <button class="btn ${gi >= 2 || isNew ? "btn-gold" : "btn-ghost"} btn-card" data-act="card">${L("📸 인증샷 카드 만들기", "📸 Make Trophy Card")}</button>
                <p class="ok small">${L("✓ 기록 저장 완료", "✓ Record saved")}</p>
                <div class="detail-actions">
                    <button class="btn btn-primary btn-lg" data-act="again">${L("🎣 다시 낚시", "🎣 Fish Again")}</button>
                    <button class="btn btn-ghost" data-act="gear">${L("🎒 장비 바꾸기", "🎒 Change Gear")}</button>
                    <button class="btn btn-ghost" data-act="map">${L("🌎 지역 바꾸기", "🌎 Change Region")}</button>
                    <button class="btn btn-ghost" data-act="best">${L("🏆 나의 최대어", "🏆 My Best Catches")}</button>
                    <button class="btn btn-gold" data-act="shop">${L("💰 장비 사러 가기", "💰 Shop Gear")}</button>
                    <button class="btn btn-cafe" data-act="brag">${L("📣 지깅클럽에 자랑하기", "📣 Brag on Jigging Club")}</button>
                </div>
            </div>`, () => Fishing.newRound(false));
        this.bindResultButtons(box, c);
    },

    showFail(title, tip) {
        const box = this.openModal(`
            <div class="result fail">
                <div class="fail-title">${U.escape(title)}</div>
                <p>${U.escape(tip)}</p>
                <div class="detail-actions">
                    <button class="btn btn-primary btn-lg" data-act="again">${L("💪 다시 도전", "💪 Try Again")}</button>
                    <button class="btn btn-ghost" data-act="gear">${L("🎒 장비 바꾸기", "🎒 Change Gear")}</button>
                    <button class="btn btn-ghost" data-act="map">${L("🌎 지역 바꾸기", "🌎 Change Region")}</button>
                </div>
            </div>`, () => Fishing.newRound(false));
        this.bindResultButtons(box);
    },

    bindResultButtons(box, rec) {
        box.onclick = e => {
            const b = e.target.closest("[data-act]");
            if (!b) return;
            Sound.click();
            const act = b.dataset.act;
            if (act === "card") return TrophyCard.open(rec, () => Fishing.newRound(false));
            if (act === "brag") return Daily.brag(rec);
            this.closeModal(true);
            if (act === "again") Fishing.newRound(false);
            if (act === "gear") { this.gearStep = "rod"; this.openGear(); }
            if (act === "map") this.go("map");
            if (act === "best") this.go("best");
            if (act === "shop") { this.gearStep = "rod"; this.openGear(); }
        };
    },

    /* 지금 낚시법에서 아직 못 산 가장 싼 낚시대/릴 → "OOO까지 얼마 남음" */
    nextGearHint() {
        const { method } = Game.state;
        if (!method) return "";
        const list = Game.D().rods.concat(Game.D().reels)
            .filter(it => Equip.methodsOf(it).includes(method) && !Shop.isOwned(it))
            .sort((a, b) => Shop.price(a) - Shop.price(b));
        const next = list[0];
        if (!next) return "";
        const gap = Shop.price(next) - Shop.gold();
        return `<div class="small next-gear">${gap <= 0
            ? L(`🛒 <b>${U.escape(I18N.name(next))}</b> 구매 가능!`, `🛒 You can buy <b>${U.escape(I18N.name(next))}</b>!`)
            : L(`🎯 <b>${U.escape(I18N.name(next))}</b>까지 ${Shop.fmt(gap)}`, `🎯 ${Shop.fmt(gap)} to <b>${U.escape(I18N.name(next))}</b>`)}</div>`;
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
