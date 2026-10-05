/* =========================================================
   세계지도 (world.js)
   - 외부 API 없이 SVG로 그린 간단한 세계지도
   - region-data.js 의 지역이 자동으로 지도 + 카드에 표시됨
   ========================================================= */
const World = {
    W: 1000, H: 500,
    area: "all",
    selectedId: null,
    onPick: null,

    /* 대륙 윤곽 (경도, 위도) - 단순화된 모양 */
    LAND: [
        /* 북미 */
        [[-168, 66], [-162, 70], [-140, 70], [-120, 72], [-95, 72], [-80, 73], [-65, 62], [-60, 55], [-55, 50], [-64, 46], [-66, 44.5], [-70, 42], [-74, 40.5], [-76, 38], [-76, 35], [-81, 31], [-80, 25.2], [-82, 27], [-84, 30], [-89, 30], [-94, 29.5], [-97, 26], [-97.5, 22], [-95, 18.5], [-91, 18.5], [-87, 21.5], [-88, 16], [-84, 15], [-83, 10], [-79, 9], [-77.5, 8], [-80, 7.3], [-83, 8.3], [-86, 12], [-92, 14.5], [-96, 15.8], [-105, 19.5], [-106, 23], [-109, 26], [-112, 29], [-114.5, 31.5], [-113, 29], [-111.5, 26], [-110, 23.2], [-109.9, 22.9], [-112, 25], [-114, 28], [-116, 30.5], [-117.2, 32.6], [-120.5, 34.5], [-122.5, 37.5], [-124.2, 40.5], [-124, 46], [-123, 49], [-130, 55], [-138, 59], [-148, 60.5], [-155, 58], [-165, 60]],
        /* 그린란드 */
        [[-55, 60], [-43, 60], [-35, 65], [-22, 70], [-20, 78], [-30, 83], [-60, 82], [-70, 78], [-58, 75], [-52, 68]],
        /* 쿠바 */
        [[-85, 22], [-80, 23.2], [-74, 20.2], [-77.5, 19.9]],
        /* 남미 */
        [[-77, 8], [-72, 12], [-62, 10.5], [-52, 5], [-50, 0], [-35, -5], [-35, -10], [-39, -15], [-41, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -42], [-68, -50], [-70, -55], [-74, -50], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-78, 3]],
        /* 유라시아 */
        [[-9, 37], [-9, 43], [-2, 43.5], [-1, 46], [-4.5, 48], [2, 51], [5, 53], [8, 55], [10, 57], [7, 58], [5, 62], [13, 68], [20, 70], [30, 70], [40, 67], [45, 68], [60, 69], [70, 73], [80, 73], [100, 77], [110, 74], [130, 71], [150, 71], [170, 70], [180, 68], [180, 65], [170, 60], [163, 59], [156, 51], [155, 57], [143, 59], [137, 54], [141, 52], [140, 48], [135, 43], [130.7, 42.3], [129.7, 41], [128.4, 38.6], [129.4, 36.8], [129.5, 35.7], [129.1, 35.1], [128.4, 34.85], [127.6, 34.7], [126.8, 34.4], [126.3, 34.6], [126.5, 35.4], [126.6, 36.1], [126.1, 36.8], [126.7, 37.5], [125.4, 37.8], [124.9, 38.4], [125.3, 39.5], [124.3, 39.9], [121.5, 39], [121, 40.8], [118, 39], [119, 37.2], [122.5, 37.2], [119.2, 35], [121, 32.2], [122, 30], [120, 26], [116, 23], [110.5, 21], [108, 21.5], [106, 19], [109, 12], [105, 9], [103, 10.5], [101, 13], [100, 8], [103.5, 1.5], [101, 3], [98.5, 8], [98, 16], [94, 17], [92, 21.5], [88, 22], [85, 20], [80, 15], [80, 10], [77.5, 8], [73.5, 16], [72.5, 21], [67, 25], [62, 25], [57, 26], [56, 24], [59, 22], [55, 17], [52, 16], [45, 13], [43, 13], [39, 21], [35, 28], [33, 30], [34.5, 31.5], [36, 36], [30, 36.5], [27, 37], [26, 40], [23, 40], [23, 37], [21, 38], [19.5, 42], [13.5, 45.5], [12.3, 44.2], [16, 41.5], [18.5, 40], [16, 38], [12, 42], [9, 44], [3, 43], [-1, 37], [-5.5, 36]],
        /* 아프리카 */
        [[-17, 15], [-17, 21], [-13, 27], [-10, 30], [-6, 35.8], [3, 37], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31], [34, 28], [35.5, 24], [38, 18], [43, 12], [51, 12], [48, 5], [40, -3], [40, -11], [35, -17], [35.5, -24], [32.5, -29], [27, -34], [20, -35], [18, -32], [12, -18], [13, -10], [9, -1], [9, 4], [4, 6], [-4, 5], [-8, 4], [-13, 8], [-16, 11]],
        /* 마다가스카르 */
        [[49.3, -12], [50.4, -16], [47, -25], [44, -25], [43.3, -21], [44.2, -17], [47, -14]],
        /* 영국 / 아일랜드 / 아이슬란드 */
        [[-5.5, 50], [1.3, 51], [1.7, 52.8], [-1, 55], [-2, 57.7], [-5, 58.6], [-6, 56.5], [-3, 54.5], [-5, 52]],
        [[-10, 51.6], [-6, 52], [-5.8, 54.8], [-8.3, 55.2], [-10, 53.5]],
        [[-24, 64], [-22, 66.3], [-15, 66.5], [-13.5, 65], [-18, 63.4]],
        /* 일본 */
        [[129.8, 31.2], [131.3, 31.4], [132.2, 33.8], [135, 33.5], [136.9, 34.2], [140, 35], [140.9, 37], [141.5, 39.5], [141.4, 41.4], [140, 40.8], [139.8, 38.5], [138.5, 37.3], [136.5, 37], [133, 35.6], [131, 34.4], [129.6, 33.2]],
        [[140, 41.6], [143.3, 42], [145.5, 43.3], [142, 45.5], [141.2, 43.2]],
        /* 제주 / 대만 */
        [[126.15, 33.25], [126.95, 33.33], [126.95, 33.55], [126.5, 33.56]],
        [[120.2, 22.6], [120.9, 21.9], [121.9, 24.6], [121.5, 25.3], [120.1, 23.6]],
        /* 필리핀 / 인도네시아 / 뉴기니 */
        [[120, 18.5], [122.3, 18.5], [124.3, 12.5], [126.3, 7], [122.2, 7], [120.8, 14.2]],
        [[95.3, 5.6], [98.3, 4], [104.5, -2.5], [106, -5.9], [102, -4], [96, 3]],
        [[109, 1.8], [111, -3], [116.3, -4], [119, 1], [117, 7], [115.3, 5]],
        [[105.2, -6.7], [114.5, -7.6], [114.4, -8.6], [106, -7.4]],
        [[119.4, -0.8], [120.8, 1.3], [125, 1.5], [121, -1.2], [123, -5.5], [120.4, -5.5]],
        [[131, -1], [141, -2.6], [150.5, -10.5], [143, -9], [138, -8.3], [134, -4]],
        /* 스리랑카 */
        [[79.8, 9.8], [81.9, 7.5], [81.2, 6.1], [79.9, 6.6]],
        /* 호주 / 태즈메이니아 */
        [[113.6, -22], [114.8, -34], [118, -35], [123.5, -34], [130, -31.5], [135, -35], [138, -35], [140, -38], [146.3, -39], [150, -37.5], [153.4, -32], [153.4, -25], [146, -19], [142.5, -10.7], [141.5, -17], [136, -12], [131, -11.2], [126, -14], [122, -18]],
        [[144.6, -40.7], [148.3, -40.9], [148, -43.2], [146, -43.6]],
        /* 뉴질랜드 */
        [[172.7, -34.4], [174.8, -36.8], [178.5, -37.7], [176.8, -40], [175.2, -41.6], [174.6, -39.8], [173.8, -39.2], [174.4, -36.5]],
        [[172.7, -40.5], [174.2, -41.4], [173, -43.8], [171, -44.5], [169, -46.6], [166.5, -46], [168.3, -44], [171.3, -41.7]]
    ],

    project(lon, lat) {
        return [(lon + 180) / 360 * this.W, (90 - lat) / 180 * this.H];
    },

    areaView(areaId) {
        const a = Game.D().areas.find(x => x.id === areaId) || Game.D().areas[0];
        const [lon1, lat1, lon2, lat2] = a.view;
        const [x1, y1] = this.project(lon1, lat2);
        const [x2, y2] = this.project(lon2, lat1);
        /* 화면 비율(2:1)에 맞게 확장 */
        let w = x2 - x1, h = y2 - y1;
        const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
        if (w / h < 2) w = h * 2; else h = w / 2;
        return { x: cx - w / 2, y: cy - h / 2, w, h };
    },

    landPath() {
        if (this._land) return this._land;
        this._land = this.LAND.map(poly =>
            "M" + poly.map(([lon, lat]) => this.project(lon, lat).map(n => n.toFixed(1)).join(" ")).join(" L") + " Z"
        ).join(" ");
        return this._land;
    },

    regionsIn(areaId) {
        const all = Game.D().regions;
        if (areaId === "all") return all;
        if (areaId === "expedition") return all.filter(r => r.expedition);
        return all.filter(r => r.area === areaId);
    },

    /* 지도 화면 전체 렌더 */
    render(container, onPick) {
        this.onPick = onPick;
        const areas = Game.D().areas;
        container.innerHTML = `
            <div class="area-chips">
                ${areas.map(a => `<button class="chip-btn ${a.id === this.area ? "active" : ""}" data-area="${a.id}">${U.escape(a.name)}</button>`).join("")}
                <button class="chip-btn chip-tuna ${this.area === "expedition" ? "active" : ""}" data-area="expedition">🐟 TUNA EXPEDITION</button>
            </div>
            <div class="map-wrap">
                <svg class="world-map" id="world-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"></svg>
                <div class="map-hint">지도의 점이나 아래 카드를 눌러 지역을 선택하세요</div>
            </div>
            <div class="region-info" id="region-info"></div>
            <h3 class="section-title" id="region-list-title"></h3>
            <div class="card-grid region-grid" id="region-grid"></div>`;
        container.querySelector(".area-chips").onclick = e => {
            const b = e.target.closest("[data-area]");
            if (!b) return;
            Sound.click();
            this.area = b.dataset.area;
            this.selectedId = null;
            this.render(container, onPick);
        };
        this.drawMap();
        this.renderCards();
        this.renderInfo();
    },

    drawMap() {
        const svg = document.getElementById("world-svg");
        const v = this.area === "expedition" ? this.areaView("all") : this.areaView(this.area);
        svg.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
        const k = v.w / this.W;              // 확대 비율 (마커 크기 보정)
        const grid = [];
        for (let lon = -150; lon <= 180; lon += 30) { const [x] = this.project(lon, 0); grid.push(`M${x} 0 L${x} ${this.H}`); }
        for (let lat = -60; lat <= 60; lat += 30) { const [, y] = this.project(0, lat); grid.push(`M0 ${y} L${this.W} ${y}`); }
        const shown = this.regionsIn(this.area);
        const zoomed = this.area !== "all" && this.area !== "expedition";
        const fs = 12 * k;
        /* 이름표 겹침 방지: 점 위치를 먼저 장애물로 등록 */
        const placed = shown.map(r => {
            const [x, y] = this.project(r.lon, r.lat);
            const d = 7 * k;
            return { x1: x - d, x2: x + d, y1: y - d, y2: y + d };
        });
        const overlaps = b => placed.some(p => b.x1 < p.x2 && b.x2 > p.x1 && b.y1 < p.y2 && b.y2 > p.y1);
        const placeLabel = (x, y, rad, name) => {
            const w = name.length * fs * 1.1 + 4 * k, h = fs * 1.1;
            const tries = [
                [0, -rad - 4 * k, "middle"], [0, rad + fs + 2 * k, "middle"],
                [rad + 4 * k, fs * 0.35, "start"], [-rad - 4 * k, fs * 0.35, "end"],
                [rad + 2 * k, -rad - 2 * k, "start"], [-rad - 2 * k, -rad - 2 * k, "end"],
                [rad + 2 * k, rad + fs, "start"], [-rad - 2 * k, rad + fs, "end"]
            ];
            for (const [dx, dy, anchor] of tries) {
                const x1 = anchor === "middle" ? x + dx - w / 2 : anchor === "start" ? x + dx : x + dx - w;
                const box = { x1, x2: x1 + w, y1: y + dy - h, y2: y + dy };
                if (!overlaps(box)) { placed.push(box); return { dx, dy, anchor }; }
            }
            return { dx: 0, dy: -rad - 4 * k, anchor: "middle" };
        };
        const regions = Game.D().regions.slice().sort((a, b) => (a.id === this.selectedId ? -1 : b.id === this.selectedId ? 1 : 0));
        const markers = regions.map(r => {
            const [x, y] = this.project(r.lon, r.lat);
            const active = shown.includes(r);
            const locked = !Game.isRegionUnlocked(r);
            const tuna = r.expedition || Game.isTunaSeason(r);
            const sel = r.id === this.selectedId;
            const rad = (sel ? 9 : 6) * k;
            let label = "";
            if ((zoomed && active) || sel) {
                const L = placeLabel(x, y, rad, r.name);
                label = `<text x="${L.dx}" y="${L.dy}" font-size="${fs}" text-anchor="${L.anchor}">${U.escape(r.name)}</text>`;
            }
            return `<g class="marker ${active ? "" : "dim"} ${locked ? "locked" : ""} ${tuna ? "tuna" : ""} ${sel ? "sel" : ""}" data-id="${r.id}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">
                <circle class="pulse" r="${rad * 2}" />
                <circle class="dot" r="${rad}" stroke-width="${1.5 * k}"/>
                ${label}
            </g>`;
        }).reverse().join("");   // 선택한 지역이 맨 위에 그려지도록
        svg.innerHTML = `
            <defs><radialGradient id="sea-grad" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#0f3a5f"/><stop offset="1" stop-color="#061629"/></radialGradient></defs>
            <rect x="-2000" y="-1000" width="5000" height="3000" fill="url(#sea-grad)"/>
            <path d="${grid.join(" ")}" stroke="#1d4a73" stroke-width="${0.6 * k}" fill="none" opacity="0.6"/>
            <path d="${this.landPath()}" class="land" stroke-width="${0.8 * k}"/>
            ${markers}`;
        svg.onclick = e => {
            const m = e.target.closest(".marker");
            if (!m) return;
            Sound.click();
            this.select(m.dataset.id);
        };
    },

    select(id) {
        this.selectedId = id;
        this.drawMap();
        this.renderInfo();
        U.$$("#region-grid .region-card").forEach(c => c.classList.toggle("selected", c.dataset.id === id));
        const info = document.getElementById("region-info");
        if (info && window.innerWidth < 900) info.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },

    badges(r) {
        const out = [];
        if (Game.isTunaSeason(r)) out.push(`<span class="badge badge-tuna">TUNA SEASON</span>`);
        else if (r.tunaSeason) out.push(`<span class="badge badge-off">SUMMER TUNA FIELD</span>`);
        if (r.expedition) out.push(`<span class="badge badge-exp">TUNA EXPEDITION</span>`);
        return out.join("");
    },

    renderInfo() {
        const box = document.getElementById("region-info");
        const r = this.selectedId && Game.regionById(this.selectedId);
        if (!r) { box.innerHTML = ""; box.classList.remove("show"); return; }
        const locked = !Game.isRegionUnlocked(r);
        const fish = Game.regionFish(r);
        box.classList.add("show");
        box.innerHTML = `
            <div class="ri-head">
                <div>
                    <div class="muted">${U.escape(r.country)} · ${U.escape(r.continent)}</div>
                    <h3>${U.escape(r.name)}</h3>
                    ${this.badges(r)}
                </div>
                <div class="ri-diff">난이도<br><b>${U.stars(r.difficulty)}</b></div>
            </div>
            <p>${U.escape(r.description || "")}</p>
            <div class="ri-fish">${fish.map(f => `<span class="mini-fish" title="${U.escape(f.name)}">${U.fishSVG(f)}<small>${U.escape(f.name)}</small></span>`).join("")}</div>
            <div class="ri-meta">지깅 수심 ${CONFIG.JIG_DEPTHS.join(" · ")}m · ${r.fishingTypes.map(U.methodLabel).join(" / ")}</div>
            ${locked
                ? `<button class="btn btn-locked" disabled>🔒 물고기 ${CONFIG.EXPEDITION_UNLOCK_CATCHES}마리를 잡으면 열려요 (현재 ${Records.totalCount()}마리)</button>`
                : `<button class="btn btn-primary btn-lg" id="btn-region-go">🎣 ${U.escape(r.name)}에서 낚시하기</button>`}`;
        const go = document.getElementById("btn-region-go");
        if (go) go.onclick = () => { Sound.click(); this.onPick && this.onPick(r); };
    },

    renderCards() {
        const list = this.regionsIn(this.area);
        const area = Game.D().areas.find(a => a.id === this.area);
        document.getElementById("region-list-title").textContent =
            (this.area === "expedition" ? "TUNA EXPEDITION" : (area ? area.name : "")) + ` · ${list.length}개 지역`;
        const grid = document.getElementById("region-grid");
        grid.innerHTML = list.map(r => {
            const locked = !Game.isRegionUnlocked(r);
            const fish = Game.regionFish(r).map(f => f.name).join(" · ");
            return `<div class="region-card ${locked ? "locked" : ""} ${r.id === this.selectedId ? "selected" : ""}" data-id="${r.id}">
                <div class="rc-top"><span class="muted">${U.escape(r.country)}</span><span class="rc-diff">${U.stars(r.difficulty)}</span></div>
                <div class="rc-name">${locked ? "🔒 " : ""}${U.escape(r.name)}</div>
                <div class="rc-badges">${this.badges(r)}</div>
                <div class="rc-fish">${U.escape(fish)}</div>
            </div>`;
        }).join("");
        grid.onclick = e => {
            const c = e.target.closest(".region-card");
            if (!c) return;
            Sound.click();
            this.select(c.dataset.id);
        };
    }
};
