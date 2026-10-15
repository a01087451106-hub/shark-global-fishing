/* =========================================================
   온라인 (online.js) - Supabase
   - 로그인: 카카오 / 이메일
   - 게임 저장을 서버에 올려서 컴퓨터 · 핸드폰 어디서든 이어하기
   - 잡은 물고기를 서버에 기록 → 어종별 랭킹 · 실시간 대물 소식
   - 설정: js/config.js 의 SUPABASE_URL / SUPABASE_ANON_KEY / KAKAO_LOGIN
     (비어 있으면 온라인 기능은 숨겨지고, 예전처럼 이 기기에만 저장돼요)
   - 데이터베이스 만들기: supabase/schema.sql
   ========================================================= */
const Online = {
    db: null,
    user: null,
    profile: null,
    feed: [],
    feedIdx: 0,
    syncing: false,
    pushTimer: 0,
    META_KEY: "sharkSyncMeta",
    FEED_GRADES: ["BIG", "TROPHY", "MONSTER"],

    get enabled() { return !!this.db; },

    /* 서버에 올리는 저장 항목 (소리 · 진동 같은 기기 설정은 제외) */
    syncKeys() {
        const K = Store.KEYS;
        return [K.RECORDS, K.GOLD, K.OWNED, K.MEDALS, K.ECON_INIT, K.ACHIEVE, K.TITLE, K.NAME, K.ATTEND, K.NEWS_SEEN, K.DIFFICULTY];
    },

    meta() { try { return JSON.parse(localStorage.getItem(this.META_KEY)) || {}; } catch (e) { return {}; } },
    setMeta(m) { try { localStorage.setItem(this.META_KEY, JSON.stringify(m)); } catch (e) { } },

    snapshot() {
        const out = {};
        this.syncKeys().forEach(k => { try { const v = localStorage.getItem(k); if (v !== null) out[k] = v; } catch (e) { } });
        return out;
    },

    summary(data) {
        let recs = [], gold = 0;
        try { recs = JSON.parse(data[Store.KEYS.RECORDS] || "[]") || []; } catch (e) { }
        try { gold = JSON.parse(data[Store.KEYS.GOLD] || "0") || 0; } catch (e) { }
        return { count: recs.length, gold };
    },

    /* ---------------- 시작 ---------------- */
    async init() {
        if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY || !window.supabase) {
            U.$("#btn-login").style.display = "none";
            U.$$('[data-go="rank"]').forEach(b => { b.style.display = "none"; });   // 서버 연결 전에는 랭킹 숨김
            return;
        }
        this.db = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        this.hookStore();
        U.$("#btn-login").onclick = () => { Sound.click(); this.user ? this.openAccount() : this.openLogin(); };
        this.db.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY") return this.openNewPassword();
            const u = session && session.user;
            if (u && (!this.user || this.user.id !== u.id)) { this.user = u; this.afterLogin(); }
            if (!u && this.user) { this.user = null; this.profile = null; this.ready = false; this.renderBtn(); }
        });
        const { data } = await this.db.auth.getSession();
        if (data && data.session && !this.user) { this.user = data.session.user; this.afterLogin(); }
        this.renderBtn();
        this.initFeed();
        document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") this.pushNow(); });
    },

    /* 저장 항목이 바뀌면 → 잠시 뒤 서버에 올림 */
    hookStore() {
        const keys = new Set(this.syncKeys());
        const touch = k => {
            if (!keys.has(k) || this.applying) return;
            const m = this.meta(); m.dirty = true; this.setMeta(m);
            this.schedulePush();
        };
        const set = Store.set.bind(Store), remove = Store.remove.bind(Store);
        Store.set = (k, v) => { set(k, v); touch(k); };
        Store.remove = k => { remove(k); touch(k); };
    },

    renderBtn() {
        const b = U.$("#btn-login");
        if (!b) return;
        b.textContent = this.user ? `👤 ${this.profile ? this.profile.nickname : "..."}` : L("로그인", "Log in");
        b.classList.toggle("logged", !!this.user);
    },

    /* ---------------- 로그인 후 ---------------- */
    async afterLogin() {
        this.renderBtn();
        if (!(await this.ensureProfile())) return;
        this.renderBtn();
        await this.syncOnLogin();
        if (App.current === "menu") App.renderMenu();
    },

    async ensureProfile() {
        const { data, error } = await this.db.from("profiles").select("*").eq("id", this.user.id).maybeSingle();
        if (error) { App.toast(L("서버 연결이 불안정해요", "Server connection problem")); return false; }
        if (data) {
            this.profile = data;
            Achieve.setPlayerName(data.nickname);
            return true;
        }
        const md = this.user.user_metadata || {};
        const guess = (Achieve.playerName() || md.nickname || md.name || md.full_name || "").slice(0, 12);
        return new Promise(resolve => this.openNickname(guess, resolve));
    },

    openNickname(guess, resolve) {
        const box = App.openModal(`
            <div class="detail center">
                <h3>🎣 ${L("낚시꾼 이름 만들기", "Choose Your Angler Name")}</h3>
                <p class="muted">${L("랭킹 · 대물 소식 · 인증샷 카드에 표시돼요 (2~12자)", "Shown on rankings, catch news and trophy cards (2-12 chars)")}</p>
                <input id="nick-in" class="text-in" maxlength="12" value="${U.escape(guess)}" placeholder="${L("예: 샤크신동만", "e.g. SharkShin")}">
                <p class="warn small" id="nick-msg"></p>
                <div class="detail-actions"><button class="btn btn-gold btn-lg" data-act="ok">${L("시작하기", "Start")}</button></div>
            </div>`, () => resolve(!!this.profile));
        const input = box.querySelector("#nick-in"), msg = box.querySelector("#nick-msg");
        const save = async () => {
            const nick = input.value.trim();
            if (nick.length < 2) { msg.textContent = L("2자 이상 입력해 주세요", "At least 2 characters"); return; }
            const { data, error } = await this.db.from("profiles").insert({ id: this.user.id, nickname: nick, title: Achieve.title() }).select().single();
            if (error) { msg.textContent = error.code === "23505" ? L("이미 있는 이름이에요. 다른 이름을 써주세요", "That name is taken") : L("저장하지 못했어요. 다시 눌러주세요", "Couldn't save. Try again"); return; }
            this.profile = data;
            Achieve.setPlayerName(nick);
            App.closeModal();
        };
        box.onclick = e => { if (e.target.closest("[data-act=ok]")) save(); };
        input.onkeydown = e => { if (e.key === "Enter") save(); };
    },

    async rename(nick) {
        nick = String(nick || "").trim().slice(0, 12);
        if (!this.profile || nick.length < 2 || nick === this.profile.nickname) return false;
        const { error } = await this.db.from("profiles").update({ nickname: nick, updated_at: new Date().toISOString() }).eq("id", this.user.id);
        if (error) { App.toast(error.code === "23505" ? L("이미 있는 이름이에요", "That name is taken") : L("이름을 바꾸지 못했어요", "Couldn't rename")); return false; }
        this.profile.nickname = nick;
        Achieve.setPlayerName(nick);
        this.renderBtn();
        App.toast(L("✓ 이름을 바꿨어요", "✓ Name changed"));
        return true;
    },

    /* ---------------- 기기끼리 이어하기 (저장 동기화) ---------------- */
    async syncOnLogin() {
        this.ready = false;
        const { data: row, error } = await this.db.from("saves").select("data, updated_at").eq("user_id", this.user.id).maybeSingle();
        if (error) return;
        const done = () => { this.ready = true; };
        const meta = this.meta(), local = this.snapshot();
        const localSum = this.summary(local);
        const sameAccount = meta.uid === this.user.id;
        if (!row) { done(); return this.pushNow(true); }                            // 서버에 아직 없음 → 이 기기 기록을 올림
        const serverChanged = !sameAccount || Date.parse(row.updated_at) !== Date.parse(meta.serverAt || 0);
        if (!serverChanged) { done(); if (meta.dirty) this.pushNow(); return; }     // 서버는 그대로 → 이 기기 변경분만 올림
        if (sameAccount && !meta.dirty) return this.applyServer(row);                 // 다른 기기에서 진행 → 받아옴
        if (!sameAccount && localSum.count === 0 && localSum.gold === 0) return this.applyServer(row);
        this.askConflict(row, localSum);
    },

    askConflict(row, localSum) {
        const s = this.summary(row.data || {});
        const box = App.openModal(`
            <div class="detail center">
                <h3>☁️ ${L("어떤 기록으로 할까요?", "Which progress do you want?")}</h3>
                <p class="muted">${L("이 기기의 기록과 계정에 저장된 기록이 달라요. 하나를 골라주세요.", "This device and your account have different progress. Pick one.")}</p>
                <div class="pick-grid">
                    <button class="pick" data-act="server"><b>☁️ ${L("계정 기록", "Account")}</b><span>${I18N.count(s.count)} · ${Shop.fmt(s.gold)}</span><small>${U.formatDate(Date.parse(row.updated_at))}</small></button>
                    <button class="pick" data-act="local"><b>📱 ${L("이 기기 기록", "This device")}</b><span>${I18N.count(localSum.count)} · ${Shop.fmt(localSum.gold)}</span><small>${L("지금 이 기기", "On this device")}</small></button>
                </div>
                <p class="muted small">${L("고르지 않은 쪽 기록은 사라져요.", "The other progress will be replaced.")}</p>
            </div>`);
        box.onclick = e => {
            const b = e.target.closest("[data-act]");
            if (!b) return;
            Sound.click();
            if (b.dataset.act === "server") this.applyServer(row);
            else { App.closeModal(true); this.ready = true; this.pushNow(true); App.toast(L("✓ 이 기기 기록을 계정에 저장했어요", "✓ Saved this device's progress to your account")); }
        };
    },

    applyServer(row) {
        this.applying = true;
        const data = row.data || {};
        this.syncKeys().forEach(k => {
            try { if (k in data) localStorage.setItem(k, data[k]); else localStorage.removeItem(k); } catch (e) { }
        });
        this.setMeta({ uid: this.user.id, serverAt: row.updated_at, dirty: false });
        location.reload();
    },

    schedulePush() {
        if (!this.user || !this.profile || !this.ready) return;
        clearTimeout(this.pushTimer);
        this.pushTimer = setTimeout(() => this.pushNow(), 2500);
    },

    async pushNow(force) {
        if (!this.user || this.syncing) return;
        const meta = this.meta();
        if (!this.ready && !force) return;                                          // 로그인 직후 어느 기록을 쓸지 정하기 전엔 올리지 않음
        if (!force && !(meta.dirty && meta.uid === this.user.id)) return;
        clearTimeout(this.pushTimer);
        this.syncing = true;
        const at = new Date().toISOString();
        const { error } = await this.db.from("saves").upsert({ user_id: this.user.id, data: this.snapshot(), updated_at: at });
        this.syncing = false;
        if (error) return;
        this.setMeta({ uid: this.user.id, serverAt: at, dirty: false });
        this.lastPush = Date.now();
        if (this.profile && this.profile.title !== Achieve.title()) {
            this.profile.title = Achieve.title();
            this.db.from("profiles").update({ title: this.profile.title }).eq("id", this.user.id).then(() => { });
        }
    },

    /* ---------------- 잡은 물고기 기록 (랭킹 · 대물 소식) ---------------- */
    reportCatch(rec) {
        if (!this.user || !this.profile) return;
        this.db.from("catches").insert({
            user_id: this.user.id, fish_id: rec.fishId, length: rec.length, weight: rec.weight,
            grade: rec.grade, grade_label: rec.gradeLabel || "", region_id: rec.regionId || "",
            method: rec.method || "", difficulty: rec.difficulty || ""
        }).then(() => { });
    },

    /* ---------------- 실시간 대물 소식 ---------------- */
    async initFeed() {
        const { data } = await this.db.from("catches").select("*").in("grade", this.FEED_GRADES).order("created_at", { ascending: false }).limit(10);
        this.feed = data || [];
        this.showFeed();
        this.db.channel("catch-feed")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "catches" }, p => {
                const c = p.new;
                if (!c || !this.FEED_GRADES.includes(c.grade)) return;
                this.feed.unshift(c);
                this.feed = this.feed.slice(0, 15);
                this.feedIdx = 0;
                this.showFeed(true);
            })
            .subscribe();
        clearInterval(this.feedTimer);
        this.feedTimer = setInterval(() => { this.feedIdx++; this.showFeed(); }, 6000);
    },

    feedText(c) {
        const f = Game.fishById(c.fish_id), r = Game.regionById(c.region_id);
        const fish = f ? I18N.name(f) : c.fish_id, region = r ? I18N.name(r) : "";
        return L(`${c.nickname}님이 ${region ? region + "에서 " : ""}${fish} ${c.length}cm · ${U.formatWeight(c.weight)} ${c.grade_label || c.grade}!`,
            `${c.nickname} landed a ${c.length}cm · ${U.formatWeight(c.weight)} ${fish}${region ? " at " + region : ""} (${c.grade_label || c.grade})!`);
    },

    showFeed(fresh) {
        const el = U.$("#catch-feed");
        if (!el) return;
        if (!this.feed.length) { el.classList.remove("show"); return; }
        const c = this.feed[this.feedIdx % this.feed.length];
        el.innerHTML = `<span class="feed-ic">${fresh ? "🔔" : "📡"}</span><span class="feed-tx grade-${String(c.grade).toLowerCase()}">${U.escape(this.feedText(c))}</span>`;
        el.classList.add("show");
        el.classList.toggle("fresh", !!fresh);
        if (fresh) setTimeout(() => el.classList.remove("fresh"), 3000);
    },

    /* ---------------- 🏆 랭킹 화면 ---------------- */
    rankFish: "amberjack",
    async renderRank(container) {
        const fishList = Game.D().fish;
        const tabs = `<div class="area-chips rank-tabs">${fishList.map(f => `<button class="chip-btn ${f.id === this.rankFish ? "active" : ""}" data-fish="${f.id}">${U.escape(I18N.name(f))}</button>`).join("")}</div>`;
        if (!this.enabled) {
            container.innerHTML = `<div class="empty">${L("랭킹은 준비 중이에요.", "Rankings are coming soon.")}</div>`;
            return;
        }
        const head = this.user
            ? `<p class="muted center small">${L("로그인한 뒤 잡은 물고기만 랭킹에 올라가요 · 한 사람당 가장 무거운 1마리", "Only fish caught while logged in count · each angler's heaviest fish")}</p>`
            : `<div class="rank-login"><span>${L("로그인하면 내 기록도 랭킹에 올라가요!", "Log in to get on the leaderboard!")}</span><button class="btn btn-gold btn-sm" data-act="login">${L("로그인", "Log in")}</button></div>`;
        container.innerHTML = head + tabs + `<div class="rank-list"><p class="muted center">${L("불러오는 중...", "Loading...")}</p></div>`;
        container.onclick = e => {
            const t = e.target.closest("[data-fish]");
            if (t) { Sound.click(); this.rankFish = t.dataset.fish; return this.renderRank(container); }
            if (e.target.closest("[data-act=login]")) { Sound.click(); this.openLogin(); }
        };
        const fishId = this.rankFish;
        const { data, error } = await this.db.from("fish_rank").select("*").eq("fish_id", fishId).order("weight", { ascending: false }).limit(30);
        if (fishId !== this.rankFish) return;
        const list = container.querySelector(".rank-list");
        if (error) { list.innerHTML = `<p class="warn center">${L("랭킹을 불러오지 못했어요", "Couldn't load rankings")}</p>`; return; }
        if (!data.length) { list.innerHTML = `<div class="empty">${L("아직 아무도 못 잡았어요. 1등의 주인공이 되어보세요! 🎣", "Nobody has caught one yet. Be the first! 🎣")}</div>`; return; }
        const me = this.user && this.user.id;
        const medal = i => ["🥇", "🥈", "🥉"][i] || `${i + 1}`;
        list.innerHTML = data.map((r, i) => {
            const reg = Game.regionById(r.region_id);
            return `<div class="rank-row ${r.user_id === me ? "mine" : ""}">
                <span class="rank-no">${medal(i)}</span>
                <span class="rank-name"><b>${U.escape(r.nickname)}</b>${r.title ? `<small>${U.escape(r.title)}</small>` : ""}</span>
                <span class="rank-size"><b>${U.formatWeight(r.weight)}</b><small>${r.length}cm · <span class="grade ${Records.gradeClass(r.grade)}">${U.escape(r.grade_label || r.grade)}</span></small></span>
                <span class="rank-meta muted small">${U.escape(reg ? I18N.name(reg) : "")}<br>${U.formatDate(Date.parse(r.created_at)).slice(0, 10)}</span>
            </div>`;
        }).join("");
        if (me && !data.some(r => r.user_id === me)) {
            const mine = await this.db.from("fish_rank").select("weight,length").eq("fish_id", fishId).eq("user_id", me).maybeSingle();
            if (mine.data) {
                const { count } = await this.db.from("fish_rank").select("user_id", { count: "exact", head: true }).eq("fish_id", fishId).gt("weight", mine.data.weight);
                list.insertAdjacentHTML("beforeend", `<div class="rank-row mine"><span class="rank-no">${(count || 0) + 1}</span><span class="rank-name"><b>${U.escape(this.profile ? this.profile.nickname : "")}</b></span><span class="rank-size"><b>${U.formatWeight(mine.data.weight)}</b><small>${mine.data.length}cm</small></span><span></span></div>`);
            }
        }
    },

    /* ---------------- 로그인 창 ---------------- */
    errText(error) {
        const m = (error && error.message) || "";
        if (/Invalid login credentials/i.test(m)) return L("이메일 또는 비밀번호가 맞지 않아요", "Wrong email or password");
        if (/already registered|already been registered/i.test(m)) return L("이미 가입된 이메일이에요. 로그인해 주세요", "This email is already registered. Please log in");
        if (/Email not confirmed/i.test(m)) return L("메일함에서 인증 링크를 먼저 눌러주세요", "Please confirm your email first");
        if (/rate limit|too many/i.test(m)) return L("잠시 후 다시 시도해 주세요", "Too many tries. Please wait a moment");
        if (/password/i.test(m)) return L("비밀번호는 8자 이상으로 해주세요", "Password must be at least 8 characters");
        if (/valid email|invalid email/i.test(m)) return L("이메일 주소를 확인해 주세요", "Please check the email address");
        return L("문제가 생겼어요. 다시 시도해 주세요", "Something went wrong. Please try again");
    },

    openLogin(mode) {
        mode = mode || "login";
        const signup = mode === "signup";
        const box = App.openModal(`
            <div class="detail center login-box">
                <h3>🎣 ${signup ? L("회원가입", "Sign Up") : L("로그인", "Log In")}</h3>
                <p class="muted small">${L("로그인하면 컴퓨터 · 핸드폰 어디서든 기록이 이어지고, 랭킹에 올라가요!", "Log in to keep your progress on every device and join the rankings!")}</p>
                ${CONFIG.KAKAO_LOGIN ? `<button class="btn btn-kakao btn-lg" data-act="kakao">💬 ${L("카카오로 시작하기", "Continue with Kakao")}</button>
                <div class="or"><span>${L("또는 이메일로", "or with email")}</span></div>` : ""}
                <input id="lg-email" class="text-in" type="email" autocomplete="username" placeholder="${L("이메일", "Email")}">
                <input id="lg-pw" class="text-in" type="password" autocomplete="${signup ? "new-password" : "current-password"}" placeholder="${L("비밀번호 (8자 이상)", "Password (8+ chars)")}">
                ${signup ? `<input id="lg-pw2" class="text-in" type="password" autocomplete="new-password" placeholder="${L("비밀번호 확인", "Confirm password")}">` : ""}
                <p class="small" id="lg-msg"></p>
                <button class="btn btn-primary btn-lg" data-act="go">${signup ? L("가입하기", "Sign Up") : L("로그인", "Log In")}</button>
                <div class="login-links">
                    <a data-act="${signup ? "login" : "signup"}">${signup ? L("이미 계정이 있어요 → 로그인", "Have an account? Log in") : L("처음이에요 → 회원가입", "New here? Sign up")}</a>
                    ${signup ? "" : `<a data-act="reset">${L("비밀번호를 잊었어요", "Forgot password")}</a>`}
                </div>
            </div>`);
        const $ = s => box.querySelector(s);
        const msg = (t, ok) => { const el = $("#lg-msg"); el.textContent = t; el.className = "small " + (ok ? "ok" : "warn"); };
        const go = async () => {
            const email = $("#lg-email").value.trim(), pw = $("#lg-pw").value;
            if (!/^\S+@\S+\.\S+$/.test(email)) return msg(L("이메일 주소를 확인해 주세요", "Please check the email address"));
            if (pw.length < 8) return msg(L("비밀번호는 8자 이상이에요", "Password must be 8+ characters"));
            if (signup && pw !== $("#lg-pw2").value) return msg(L("비밀번호가 서로 달라요", "Passwords don't match"));
            msg(L("잠시만요...", "One moment..."), true);
            if (signup) {
                const { data, error } = await this.db.auth.signUp({ email, password: pw, options: { emailRedirectTo: location.origin + location.pathname } });
                if (error) return msg(this.errText(error));
                if (!data.session) return msg(L("✉️ 메일함에서 인증 링크를 누르면 가입이 끝나요", "✉️ Check your inbox and click the confirmation link"), true);
                App.closeModal(true);
            } else {
                const { error } = await this.db.auth.signInWithPassword({ email, password: pw });
                if (error) return msg(this.errText(error));
                App.closeModal(true);
                App.toast(L("✓ 로그인했어요", "✓ Logged in"));
            }
        };
        box.onclick = async e => {
            const b = e.target.closest("[data-act]");
            if (!b) return;
            const act = b.dataset.act;
            if (act === "go") return go();
            if (act === "login" || act === "signup") return this.openLogin(act);
            if (act === "kakao") {
                await this.db.auth.signInWithOAuth({ provider: "kakao", options: { redirectTo: location.origin + location.pathname } });
                return;
            }
            if (act === "reset") {
                const email = $("#lg-email").value.trim();
                if (!/^\S+@\S+\.\S+$/.test(email)) return msg(L("위에 가입한 이메일을 먼저 입력해 주세요", "Enter your email above first"));
                const { error } = await this.db.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
                msg(error ? this.errText(error) : L("✉️ 비밀번호 재설정 메일을 보냈어요", "✉️ Password reset email sent"), !error);
            }
        };
        box.querySelectorAll("input").forEach(i => { i.onkeydown = e => { if (e.key === "Enter") go(); }; });
    },

    openNewPassword() {
        const box = App.openModal(`
            <div class="detail center login-box">
                <h3>🔑 ${L("새 비밀번호", "New Password")}</h3>
                <input id="np-pw" class="text-in" type="password" autocomplete="new-password" placeholder="${L("새 비밀번호 (8자 이상)", "New password (8+ chars)")}">
                <p class="small warn" id="np-msg"></p>
                <button class="btn btn-primary btn-lg" data-act="ok">${L("바꾸기", "Change")}</button>
            </div>`);
        box.onclick = async e => {
            if (!e.target.closest("[data-act=ok]")) return;
            const pw = box.querySelector("#np-pw").value;
            if (pw.length < 8) { box.querySelector("#np-msg").textContent = L("8자 이상 입력해 주세요", "At least 8 characters"); return; }
            const { error } = await this.db.auth.updateUser({ password: pw });
            if (error) { box.querySelector("#np-msg").textContent = this.errText(error); return; }
            App.closeModal(true);
            App.toast(L("✓ 비밀번호를 바꿨어요", "✓ Password changed"));
        };
    },

    openAccount() {
        const p = this.profile || {};
        const box = App.openModal(`
            <div class="detail center login-box">
                <h3>👤 ${L("내 계정", "My Account")}</h3>
                <p class="muted small">${U.escape(this.user.email || L("카카오 계정", "Kakao account"))}</p>
                <label class="ach-name">${L("낚시꾼 이름", "Angler name")}
                    <input id="acc-nick" class="text-in" maxlength="12" value="${U.escape(p.nickname || "")}"></label>
                <p class="ok small">☁️ ${L("기록이 계정에 자동 저장돼요", "Progress is saved to your account automatically")}</p>
                <div class="detail-actions">
                    <button class="btn btn-primary" data-act="save">${L("☁️ 지금 저장", "☁️ Save Now")}</button>
                    <button class="btn btn-ghost" data-act="logout">${L("로그아웃", "Log Out")}</button>
                </div>
            </div>`);
        box.onclick = async e => {
            const b = e.target.closest("[data-act]");
            if (!b) return;
            Sound.click();
            if (b.dataset.act === "save") {
                await this.rename(box.querySelector("#acc-nick").value);
                await this.pushNow(true);
                App.toast(L("✓ 계정에 저장했어요", "✓ Saved to your account"));
            }
            if (b.dataset.act === "logout") {
                await this.pushNow();
                await this.db.auth.signOut();
                App.closeModal(true);
                App.toast(L("로그아웃했어요", "Logged out"));
            }
        };
    }
};
