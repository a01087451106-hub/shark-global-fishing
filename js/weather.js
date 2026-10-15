/* =========================================================
   실시간 바다 날씨 · 물때 (weather.js)
   - 날씨 · 바람 · 파고 · 수온 : Open-Meteo (무료, 키 없음) 의 지역 좌표(lat/lon) 현재값
   - 물때 : 달의 위치(신월 시각, Meeus 천문 계산)로 음력 날짜를 구해 한국 물때표로 변환
            서해 = 7물때식(조금 다음 무시), 동해 · 남해 · 제주 = 8물때식(13물 다음 14물, 조금). 해외는 사리(대조) / 조금(소조)로 표시
   - 입질 · 대물 확률에 반영 → Game.hitFactor / Game.luck
   - 인터넷이 안 되거나 API 가 실패하면 날씨는 보통(영향 없음)으로 진행, 물때는 계산값 사용
   ========================================================= */
const Weather = {
    cache: {},              // regionId → { at, data }
    TTL: 30 * 60 * 1000,    // 30분마다 새로 받아옴

    /* ---------------- 물때 (달 계산) ---------------- */
    jd(ms) { return ms / 86400000 + 2440587.5; },

    /* k 번째 신월(그믐)의 시각 (율리우스일) - Meeus, Astronomical Algorithms 49장 */
    newMoonJD(k) {
        const T = k / 1236.85, r = Math.PI / 180;
        let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T * T * T + 0.00000000073 * T * T * T * T;
        const E = 1 - 0.002516 * T - 0.0000074 * T * T;
        const M = (2.5534 + 29.1053567 * k - 0.0000014 * T * T) * r;
        const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T * T * T) * r;
        const F = (160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T * T * T) * r;
        const O = (124.7746 - 1.56375588 * k + 0.0020672 * T * T) * r;
        const s = Math.sin;
        jde += -0.4072 * s(Mp) + 0.17241 * E * s(M) + 0.01608 * s(2 * Mp) + 0.01039 * s(2 * F)
            + 0.00739 * E * s(Mp - M) - 0.00514 * E * s(Mp + M) + 0.00208 * E * E * s(2 * M)
            - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M)
            - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F)
            - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(O);
        return jde - 69 / 86400;   // 지구시(TT) → 세계시(UT) 근사
    },

    /* 음력 날짜(1~30) - utcOffset 시간대의 달력 기준 (한국 = +9) */
    lunarDay(ms, utcOffsetH) {
        const off = (utcOffsetH == null ? 9 : utcOffsetH) / 24;
        const now = this.jd(ms);
        const day = j => Math.floor(j + 0.5 + off);        // 그 시간대의 날짜 번호
        const today = day(now);
        /* 오늘 날짜 안에 신월이 있으면(시각과 상관없이) 오늘이 음력 1일 */
        let k = Math.floor((now - 2451550.09766) / 29.530588861);
        while (day(this.newMoonJD(k + 1)) <= today) k++;
        while (day(this.newMoonJD(k)) > today) k--;
        return today - day(this.newMoonJD(k)) + 1;
    },

    /* 한국 물때표: 7물때식(서해) / 8물때식(남해 · 동해 · 제주) */
    MULTTAE_7: ["7물", "8물", "9물", "10물", "11물", "12물", "13물", "조금", "무시", "1물", "2물", "3물", "4물", "5물", "6물"],
    MULTTAE_8: ["8물", "9물", "10물", "11물", "12물", "13물", "14물", "조금", "1물", "2물", "3물", "4물", "5물", "6물", "7물"],   // 바다타임 물때 안내 기준
    tide(region, ms, utcOffsetH) {
        const ld = this.lunarDay(ms || Date.now(), region && region.area === "korea" ? 9 : utcOffsetH);
        const west = region && region.id === "seohae";
        const table = west ? this.MULTTAE_7 : this.MULTTAE_8;
        const name = table[(ld - 1) % 15];
        const n = name === "조금" ? 0.3 : name === "무시" ? 0.6 : parseInt(name, 10);
        const strength = Math.max(0.12, Math.sin(Math.PI * n / 14));        // 7물 무렵 가장 셈, 조금 · 무시 약함
        const korea = region && region.area === "korea";
        const kind = strength > 0.85 ? L("사리", "Spring tide") : strength < 0.3 ? L("조금", "Neap tide") : L("중물", "Mid tide");
        return {
            lunarDay: ld, name, strength, kind,
            label: korea ? `🌙 ${name} (${kind})` : `🌙 ${kind}`,
            system: west ? "7물때식" : "8물때식"
        };
    },

    /* ---------------- 날씨 받아오기 ---------------- */
    async load(region) {
        if (!region || region.lat == null) return null;
        const c = this.cache[region.id];
        if (c && Date.now() - c.at < this.TTL) return c.data;
        const q = `latitude=${region.lat}&longitude=${region.lon}&timezone=auto`;
        const get = url => {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 6000);
            return fetch(url, { signal: ctrl.signal }).then(r => r.ok ? r.json() : null).catch(() => null).finally(() => clearTimeout(t));
        };
        const [w, m] = await Promise.all([
            get(`https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,weather_code,wind_speed_10m,precipitation,is_day&wind_speed_unit=ms`),
            get(`https://marine-api.open-meteo.com/v1/marine?${q}&current=wave_height,sea_surface_temperature`)
        ]);
        if (!w || !w.current) { this.cache[region.id] = { at: Date.now() - this.TTL + 60000, data: null }; return null; }   // 1분 뒤 다시 시도
        const data = {
            temp: w.current.temperature_2m,
            code: w.current.weather_code,
            wind: w.current.wind_speed_10m,
            rain: w.current.precipitation,
            offsetH: (w.utc_offset_seconds || 0) / 3600,
            wave: m && m.current ? m.current.wave_height : null,
            sst: m && m.current ? m.current.sea_surface_temperature : null
        };
        this.cache[region.id] = { at: Date.now(), data };
        return data;
    },

    get(region) { const c = region && this.cache[region.id]; return c ? c.data : null; },

    /* 그 지역 현지 시각(시) */
    localHour(region) {
        const d = this.get(region);
        const off = d ? d.offsetH : (region && region.area === "korea" ? 9 : Math.round((region ? region.lon : 0) / 15));
        return (new Date().getUTCHours() + new Date().getUTCMinutes() / 60 + off + 48) % 24;
    },

    sky(code) {
        if (code == null) return ["🌤", L("정보 없음", "No data")];
        if (code === 0) return ["☀️", L("맑음", "Clear")];
        if (code <= 2) return ["🌤", L("구름 조금", "Partly cloudy")];
        if (code === 3) return ["☁️", L("흐림", "Cloudy")];
        if (code <= 48) return ["🌫", L("안개", "Fog")];
        if (code <= 67 || (code >= 80 && code <= 82)) return ["🌧", L("비", "Rain")];
        if (code <= 77 || code === 85 || code === 86) return ["🌨", L("눈", "Snow")];
        return ["⛈", L("뇌우", "Thunderstorm")];
    },

    /* ---------------- 낚시에 주는 영향 ---------------- */
    effects(region, fish) {
        const d = this.get(region), t = this.tide(region, Date.now(), d ? d.offsetH : null);
        const fx = [];   // [설명, 입질 배율, 대물 배율]
        /* 물때: 물이 잘 가야 입질이 살아남 */
        fx.push([`${t.name === "조금" || t.name === "무시" ? t.name : t.kind} ${L("물때", "tide")}`, 0.85 + 0.35 * t.strength, 0.95 + 0.15 * t.strength]);
        /* 시간: 해 뜰 무렵 · 해 질 무렵 피딩타임 */
        const h = this.localHour(region);
        if ((h >= 5 && h < 7.5) || (h >= 17 && h < 19.5)) fx.push([L("피딩타임 (아침 · 저녁)", "Feeding time (dawn · dusk)"), 1.25, 1.1]);
        else if (h >= 22 || h < 4) fx.push([L("한밤중", "Late night"), 0.85, 1]);
        if (d) {
            if (d.wind >= 12) fx.push([L("강풍", "Strong wind"), 0.75, 1]);
            else if (d.wind >= 8) fx.push([L("바람 강함", "Windy"), 0.9, 1]);
            else if (d.wind >= 3) fx.push([L("적당한 바람 (잔물결)", "Light breeze"), 1.05, 1]);
            if (d.wave != null) {
                if (d.wave >= 2.5) fx.push([L("높은 파도 (풍랑)", "High waves"), 0.8, 1.15]);
                else if (d.wave >= 1.5) fx.push([L("파도 다소 높음", "Choppy sea"), 0.95, 1.05]);
                else if (d.wave < 0.3) fx.push([L("장판 (잔잔함)", "Glassy calm"), 0.95, 1]);
            }
            const code = d.code;
            if (code >= 95) fx.push([L("뇌우", "Thunderstorm"), 0.7, 1]);
            else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) fx.push([L("비 (입질 활발)", "Rain (active bites)"), 1.1, 1.05]);
            if (d.sst != null && fish) {
                if (fish.isTuna && d.sst < 18) fx.push([L("수온 낮음 (참치)", "Cold water (tuna)"), 0.7, 0.9]);
                else if (fish.isTuna && d.sst >= 22) fx.push([L("따뜻한 수온 (참치)", "Warm water (tuna)"), 1.1, 1.05]);
                else if (d.sst < 10) fx.push([L("수온 낮음", "Cold water"), 0.85, 1]);
            }
        }
        const hit = U.clamp(fx.reduce((a, x) => a * x[1], 1), 0.55, 1.7);
        const luck = U.clamp(fx.reduce((a, x) => a * x[2], 1), 0.8, 1.4);
        return { fx, hit, luck, tide: t, data: d };
    },

    hitMult() { const s = Game.state; return s.region ? this.effects(s.region, s.fish).hit : 1; },
    luckMult() { const s = Game.state; return s.region ? this.effects(s.region, s.fish).luck : 1; },

    /* ---------------- 화면 표시 ---------------- */
    pills(region) {
        const d = this.get(region), t = this.tide(region, Date.now(), d ? d.offsetH : null);
        const p = [];
        if (d) {
            const [ic, sky] = this.sky(d.code);
            p.push(`${ic} ${sky} ${Math.round(d.temp)}℃`);
            p.push(`💨 ${d.wind.toFixed(1)}m/s`);
            if (d.wave != null) p.push(`🌊 ${L("파고", "Waves")} ${d.wave.toFixed(1)}m`);
            if (d.sst != null) p.push(`🌡 ${L("수온", "Water")} ${d.sst.toFixed(1)}℃`);
        }
        p.push(t.label);
        const h = this.localHour(region);
        p.push(`🕐 ${L("현지", "Local")} ${String(Math.floor(h)).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`);
        return p;
    },

    /* 물고기 선택 화면의 "오늘의 바다" 카드 */
    cardHTML(region, fish) {
        const e = this.effects(region, fish);
        const grade = e.hit >= 1.2 ? ["great", L("최고! 🔥", "Excellent! 🔥")] : e.hit >= 1.05 ? ["good", L("좋음 👍", "Good 👍")] : e.hit >= 0.9 ? ["ok", L("보통", "Average")] : ["bad", L("어려움 😓", "Tough 😓")];
        return `<div class="sea-card">
            <div class="sea-head"><b>📡 ${L("오늘의 바다", "Today's Sea")}</b> <span class="muted small">${e.data ? L("실시간", "Live") : L("날씨 정보 없음 · 물때만 반영", "No weather data · tide only")}</span>
                <span class="sea-grade sea-${grade[0]}">${L("조황", "Bite")} ${grade[1]}</span></div>
            <div class="sea-pills">${this.pills(region).map(x => `<span>${U.escape(x)}</span>`).join("")}</div>
            <div class="sea-fx">${e.fx.map(([t, h]) => `<span class="${h > 1.01 ? "up" : h < 0.99 ? "down" : ""}">${h > 1.01 ? "▲" : h < 0.99 ? "▼" : "·"} ${U.escape(t)}</span>`).join("")}</div>
        </div>`;
    }
};
