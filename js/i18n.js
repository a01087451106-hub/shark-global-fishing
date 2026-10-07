/* =========================================================
   언어 설정 (i18n.js)
   ---------------------------------------------------------
   - 대한민국(KR)에서 접속하면 한국어, 그 외 국가에서 접속하면 영어로 표시합니다.
   - 접속 국가는 IP 위치 API(무료, 키 없음)로 확인합니다.
     확인 전에는 시간대/브라우저 언어로 먼저 추측해서 보여주고,
     결과가 다르면 화면을 바로 다시 그립니다.
   - 상단 KO / EN 버튼으로 직접 바꾸면 그 선택이 계속 유지됩니다.

   사용법
   - 코드 안의 문구   : L("한국어", "English")
   - 데이터의 문구    : I18N.f(item, "description") → 영어일 때 descriptionEn 사용
   - 이름             : I18N.name(item)            → 영어일 때 nameEn 사용
   - HTML 고정 문구   : 태그에 data-en="English" (innerHTML 교체)
                        data-en-title / data-en-aria 는 속성 교체
   ========================================================= */
const I18N = {
    lang: "ko",
    KEYS: { MANUAL: "sharkLang", COUNTRY: "sharkCountry" },
    GEO_APIS: [
        ["https://get.geojs.io/v1/ip/country.json", j => j.country],
        ["https://api.country.is/", j => j.country]
    ],
    listeners: [],

    get en() { return this.lang === "en"; },

    read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    write(key, v) { try { v == null ? localStorage.removeItem(key) : localStorage.setItem(key, v); } catch (e) { } },

    langOf(country) { return country === "KR" ? "ko" : "en"; },

    /* 국가 확인 전 임시 추측: 직접 선택 → 지난번 국가 → 시간대/브라우저 언어 */
    init() {
        const manual = this.read(this.KEYS.MANUAL);
        const country = this.read(this.KEYS.COUNTRY);
        if (manual === "ko" || manual === "en") this.lang = manual;
        else if (country) this.lang = this.langOf(country);
        else {
            let tz = "";
            try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { }
            const langs = navigator.languages || [navigator.language || ""];
            this.lang = (tz === "Asia/Seoul" || langs.some(l => /^ko/i.test(l))) ? "ko" : "en";
        }
        document.documentElement.lang = this.lang;
    },

    /* 접속 국가 확인 (실패하면 추측한 언어 그대로 사용) */
    async detectCountry() {
        for (const [url, get] of this.GEO_APIS) {
            try {
                const ctrl = new AbortController();
                const timer = setTimeout(() => ctrl.abort(), 4000);
                const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
                clearTimeout(timer);
                const code = String(get(await res.json()) || "").toUpperCase();
                if (/^[A-Z]{2}$/.test(code)) {
                    this.write(this.KEYS.COUNTRY, code);
                    if (!this.read(this.KEYS.MANUAL)) this.setLang(this.langOf(code));
                    return code;
                }
            } catch (e) { /* 다음 API 시도 */ }
        }
        return null;
    },

    /* 상단 KO / EN 버튼: 직접 선택은 저장해서 유지 */
    toggle() {
        const next = this.en ? "ko" : "en";
        this.write(this.KEYS.MANUAL, next);
        this.setLang(next);
    },

    setLang(lang) {
        if (lang === this.lang) return;
        this.lang = lang;
        document.documentElement.lang = lang;
        this.applyStatic();
        this.listeners.forEach(fn => fn(lang));
    },

    onChange(fn) { this.listeners.push(fn); },

    /* index.html 의 고정 문구 교체 (처음 한국어 내용은 data-ko 에 보관) */
    applyStatic() {
        document.querySelectorAll("[data-en]").forEach(el => {
            if (el.dataset.ko == null) el.dataset.ko = el.innerHTML;
            el.innerHTML = this.en ? el.dataset.en : el.dataset.ko;
        });
        [["data-en-aria", "aria-label"], ["data-en-content", "content"]].forEach(([src, attr]) => {
            document.querySelectorAll(`[${src}]`).forEach(el => {
                const keep = "data-ko-" + attr;
                if (!el.hasAttribute(keep)) el.setAttribute(keep, el.getAttribute(attr) || "");
                el.setAttribute(attr, this.en ? el.getAttribute(src) : el.getAttribute(keep));
            });
        });
        document.title = this.en ? "SHARK GLOBAL FISHING" : "SHARK GLOBAL FISHING · 샤크 글로벌 피싱";
        const btn = document.getElementById("btn-lang");
        if (btn) btn.textContent = this.en ? "KO" : "EN";
    },

    /* ---------------- 데이터 번역 도우미 ---------------- */
    f(item, field) {
        if (!item) return "";
        return (this.en && item[field + "En"]) || item[field] || "";
    },
    name(item) { return this.f(item, "name"); },

    MONTHS: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    month(m) { return this.en ? this.MONTHS[m - 1] : m + "월"; },
    months(list, sep) { return this.en ? list.map(m => this.MONTHS[m - 1]).join(sep || ", ") : list.join(sep || ", ") + "월"; },

    DIFFICULTY: { "쉬움": "Easy", "보통": "Normal", "어려움": "Hard" },
    difficulty(d) { return this.en ? (this.DIFFICULTY[d] || d) : d; },

    /* 마리 수: 한국어 "3마리" / 영어 "3 fish" */
    count(n) { return this.en ? `${n} fish` : `${n}마리`; }
};

function L(ko, en) { return I18N.en ? en : ko; }

I18N.init();
