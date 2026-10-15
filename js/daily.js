/* =========================================================
   출석체크 · 업데이트 소식 · 지깅클럽 자랑하기 (daily.js)
   - 출석 보상 금액은 js/config.js 의 ATTEND_REWARDS
   - 업데이트 소식 내용은 data/news-data.js
   ========================================================= */
const Daily = {
    /* 오늘 날짜 (이 기기 시간 기준) "2026-10-15" */
    today(offset) {
        const d = new Date();
        if (offset) d.setDate(d.getDate() + offset);
        const p = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    },

    state() { return Store.get(Store.KEYS.ATTEND, null) || { last: "", streak: 0, total: 0 }; },
    checkedToday() { return this.state().last === this.today(); },

    /* 오늘 첫 접속이면 출석 처리 → { day, reward, streak } */
    checkIn() {
        const st = this.state();
        if (st.last === this.today()) return null;
        st.streak = st.last === this.today(-1) ? st.streak + 1 : 1;
        st.total = (st.total || 0) + 1;
        st.last = this.today();
        Store.set(Store.KEYS.ATTEND, st);
        const list = CONFIG.ATTEND_REWARDS;
        const day = ((st.streak - 1) % list.length) + 1;
        const reward = list[day - 1];
        Shop.addGold(reward);
        return { day, reward, streak: st.streak };
    },

    attendHTML(res) {
        const list = CONFIG.ATTEND_REWARDS;
        return `
            <div class="detail center attend">
                <h3>📅 ${L("출석체크", "Daily Check-in")}</h3>
                <p>${L(`<b>${res.streak}일 연속</b> 출석!`, `<b>${res.streak}-day</b> streak!`)}</p>
                <div class="attend-days">
                    ${list.map((g, i) => `<div class="attend-day ${i + 1 < res.day ? "got" : ""} ${i + 1 === res.day ? "today" : ""}">
                        <small>${L(`${i + 1}일`, `Day ${i + 1}`)}</small><b>${i + 1 < res.day ? "✓" : i + 1 === list.length ? "🎁" : "💰"}</b><span>${(g / 1000).toLocaleString()}K</span></div>`).join("")}
                </div>
                <p class="attend-reward">💰 +${Shop.fmt(res.reward)}</p>
                <p class="muted small">${L("내일도 들어오면 보상이 커져요! 하루라도 빠지면 1일부터 다시 시작해요.", "Come back tomorrow for a bigger reward! Miss a day and it resets to Day 1.")}</p>
                <div class="detail-actions"><button class="btn btn-gold btn-lg" data-act="ok">${L("받기", "Collect")}</button></div>
            </div>`;
    },

    /* ---------------- 🆕 업데이트 소식 ---------------- */
    news() { return (Game.D().news || []).slice().sort((a, b) => b.id - a.id); },
    hasNewNews() {
        const n = this.news()[0];
        return !!n && (Store.get(Store.KEYS.NEWS_SEEN, 0) || 0) < n.id;
    },
    markNewsSeen() { const n = this.news()[0]; if (n) Store.set(Store.KEYS.NEWS_SEEN, n.id); },

    newsHTML(onlyNew) {
        const seen = Store.get(Store.KEYS.NEWS_SEEN, 0) || 0;
        let list = this.news();
        if (onlyNew) list = list.filter(n => n.id > seen);
        return `
            <div class="detail news">
                <h3>🆕 ${L("업데이트 소식", "What's New")}</h3>
                ${list.map(n => `<div class="news-block">
                    <div class="news-date">${U.escape(n.date)}</div>
                    ${n.items.map(it => `<div class="news-item"><span class="news-ic">${it[0]}</span><div><b>${U.escape(L(it[1], it[3] || it[1]))}</b><p>${U.escape(L(it[2], it[4] || it[2]))}</p></div></div>`).join("")}
                </div>`).join("")}
                <div class="news-links">
                    <a class="btn btn-ghost btn-sm" data-link-cafe>${L("💬 지깅클럽 카페 가기", "💬 Jigging Club")}</a>
                    <a class="btn btn-ghost btn-sm" data-link-yt>▶ YouTube</a>
                </div>
                <div class="detail-actions"><button class="btn btn-primary" data-act="ok">${L("확인", "OK")}</button></div>
            </div>`;
    },

    openNews(onlyNew, onClose) {
        const box = App.openModal(this.newsHTML(onlyNew), onClose);
        this.markNewsSeen();
        box.onclick = e => {
            if (e.target.closest("[data-link-cafe]")) return U.openExternal(CONFIG.NAVER_CAFE_URL);
            if (e.target.closest("[data-link-yt]")) return U.openExternal(CONFIG.YOUTUBE_URL);
            if (e.target.closest("[data-act=ok]")) { Sound.click(); App.closeModal(); }
        };
    },

    /* 메뉴에 처음 들어올 때: 출석 → 새 소식 순서로 보여줌 */
    welcome(done) {
        const showNews = () => {
            if (this.hasNewNews()) this.openNews(true, done);
            else if (done) done();
        };
        const res = this.checkIn();
        if (!res) return showNews();
        const box = App.openModal(this.attendHTML(res), showNews);
        Sound.landing();
        Haptic.buzz([40, 40, 90]);
        box.onclick = e => { if (e.target.closest("[data-act=ok]")) { Sound.click(); App.closeModal(); } };
        const fresh = Achieve.check();
        fresh.forEach(a => App.toast(`🎖 ${L(a.ko, a.en)} +${Shop.fmt(a.gold)}`));
    },

    /* ---------------- 📣 지깅클럽에 자랑하기 ---------------- */
    async brag(rec) {
        const text = rec ? TrophyCard.shareText(rec) + " " + TrophyCard.url() : "";
        if (text) {
            try { await navigator.clipboard.writeText(text); } catch (e) { }
        }
        const box = App.openModal(`
            <div class="detail center">
                <h3>📣 ${L("지깅클럽에 자랑하기", "Brag on Jigging Club")}</h3>
                <ol class="steps brag-steps">
                    <li>${L("📸 인증샷 카드 이미지를 먼저 저장하세요", "📸 Save your trophy card image first")}</li>
                    <li>${L("지깅클럽 카페에서 <b>글쓰기</b>를 누르세요", "Tap <b>Write</b> on the Jigging Club cafe")}</li>
                    <li>${L("사진을 올리고, 붙여넣기 하면 자랑 글이 들어가요", "Attach the photo and paste the text")}</li>
                </ol>
                ${text ? `<p class="muted small">${L("✓ 자랑 글을 복사해 뒀어요", "✓ Brag text copied")}<br>"${U.escape(text)}"</p>` : ""}
                <div class="detail-actions">
                    <button class="btn btn-gold btn-lg" data-act="cafe">${L("💬 지깅클럽 카페 열기", "💬 Open Jigging Club")}</button>
                    ${rec ? `<button class="btn btn-ghost" data-act="card">${L("📸 인증샷 카드 먼저 만들기", "📸 Make Trophy Card First")}</button>` : ""}
                </div>
            </div>`);
        box.onclick = e => {
            const b = e.target.closest("[data-act]");
            if (!b) return;
            Sound.click();
            if (b.dataset.act === "cafe") U.openExternal(CONFIG.NAVER_CAFE_URL);
            if (b.dataset.act === "card") TrophyCard.open(rec);
        };
    }
};
