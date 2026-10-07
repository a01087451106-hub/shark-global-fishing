/* =========================================================
   공용 도구 함수 (utils.js)
   ========================================================= */
const U = {
    $(sel, root) { return (root || document).querySelector(sel); },
    $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); },

    rand(min, max) { return min + Math.random() * (max - min); },
    randInt(min, max) { return Math.floor(U.rand(min, max + 1)); },
    clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
    lerp(a, b, t) { return a + (b - a) * t; },
    choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

    /* 가중치 랜덤: { key: weight } → key */
    weighted(weights) {
        const keys = Object.keys(weights);
        const total = keys.reduce((s, k) => s + weights[k], 0);
        let r = Math.random() * total;
        for (const k of keys) {
            r -= weights[k];
            if (r <= 0) return k;
        }
        return keys[keys.length - 1];
    },

    escape(str) {
        return String(str == null ? "" : str)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    },

    stars(n, max) {
        max = max || 5;
        const full = Math.round(n);
        return "★".repeat(full) + "☆".repeat(Math.max(0, max - full));
    },

    formatWeight(kg) {
        if (kg < 1) return Math.round(kg * 1000) + " g";
        if (kg < 10) return kg.toFixed(2) + " kg";
        return kg.toFixed(1) + " kg";
    },

    formatDate(ts) {
        const d = new Date(ts);
        const p = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    },

    methodLabel(m) { return m === "jigging" ? "JIGGING" : "CASTING"; },
    methodIcon(m) { return m === "jigging" ? "⚓" : "🎯"; },

    /* 외부 링크: 새 창 + 보안 속성 */
    openExternal(url) {
        const w = window.open(url, "_blank", "noopener,noreferrer");
        if (w) w.opener = null;
    },

    uid: (() => { let n = 0; return p => (p || "u") + (++n) + Math.floor(Math.random() * 1e4); })(),

    /* ---------------------------------------------------
       물고기 그림 (SVG) - 이미지 파일 없이 어종별 실루엣 생성
       --------------------------------------------------- */
    fishSVG(fish, opts) {
        opts = opts || {};
        /* 사실적인 캔버스 렌더링 이미지 사용 (scene.js) */
        if (typeof Scene !== "undefined") {
            try {
                return `<img class="fish-svg fish-real" src="${Scene.fishDataURL(fish, opts.silhouette)}" alt="" draggable="false">`;
            } catch (e) { /* 실패하면 아래 SVG 그림 사용 */ }
        }
        const c = fish.colors || { back: "#2c5a7a", belly: "#e9eef2", accent: "#e8c547" };
        const id = U.uid("g");
        const shadow = opts.silhouette;
        const back = shadow ? "#22364d" : c.back;
        const belly = shadow ? "#2b4560" : c.belly;
        const accent = shadow ? "#2b4560" : c.accent;
        const fill = `url(#${id})`;
        const grad = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${back}"/><stop offset="0.55" stop-color="${back}"/>
            <stop offset="0.62" stop-color="${belly}"/><stop offset="1" stop-color="${belly}"/></linearGradient></defs>`;
        const eye = (x, y, r) => shadow ? "" :
            `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="#0b1420"/>`;
        let body = "";
        switch (fish.shape) {
            case "tuna":
                body = `<path d="M70 30 L92 6 L104 30 Z" fill="${back}"/>
                    <path d="M80 72 L96 88 L102 70 Z" fill="${back}"/>
                    <path d="M8 50 C30 20 110 14 160 44 L192 20 L184 50 L192 80 L160 56 C110 86 30 82 8 50 Z" fill="${fill}"/>
                    <path d="M120 32 l5 -5 l3 5 M132 36 l5 -5 l3 5 M144 40 l5 -5 l3 5 M120 68 l5 5 l3 -5 M132 64 l5 5 l3 -5 M144 60 l5 5 l3 -5" stroke="${accent}" stroke-width="3" fill="none"/>
                    <path d="M52 52 L86 60 L56 62 Z" fill="${back}" opacity="0.8"/>
                    ${eye(26, 46, 4.5)}`;
                break;
            case "gt":
                body = `<path d="M60 26 L86 6 L110 32 Z" fill="${back}"/>
                    <path d="M70 76 L92 94 L106 70 Z" fill="${back}"/>
                    <path d="M10 54 C14 18 100 6 156 44 L192 16 L184 50 L192 84 L156 58 C100 92 20 90 10 54 Z" fill="${fill}"/>
                    <path d="M150 44 L160 50 L150 56" stroke="${accent}" stroke-width="3" fill="none"/>
                    ${eye(28, 42, 5)}`;
                break;
            case "long":
                body = `<path d="M96 38 L112 26 L118 40 Z" fill="${back}"/>
                    <path d="M4 50 C40 36 130 34 166 47 L194 32 L186 50 L194 68 L166 53 C130 66 40 64 4 50 Z" fill="${fill}"/>
                    <path d="M40 46 Q100 40 160 47" stroke="${accent}" stroke-width="2" fill="none" opacity="0.8"/>
                    ${eye(18, 48, 3.5)}`;
                break;
            case "billfish":
            case "sailfish":
                body = (fish.shape === "sailfish"
                    ? `<path d="M40 44 C50 4 120 2 140 42 Z" fill="${accent}" opacity="0.9"/>`
                    : `<path d="M52 42 L70 18 L84 42 Z" fill="${back}"/>`) +
                    `<path d="M0 49 L34 47 L34 52 Z" fill="${back}"/>
                    <path d="M30 50 C60 34 140 34 168 47 L196 24 L188 50 L196 76 L168 53 C140 66 60 66 30 50 Z" fill="${fill}"/>
                    ${fish.shape === "billfish" ? `<path d="M70 48 L150 48" stroke="${accent}" stroke-width="2" opacity="0.6"/>` : ""}
                    ${eye(42, 47, 3.5)}`;
                break;
            case "mahi":
                body = `<path d="M20 28 C60 6 130 22 160 42 L150 44 C120 30 70 22 22 34 Z" fill="${accent}"/>
                    <path d="M14 50 C10 22 60 18 120 34 C140 40 154 44 162 48 L194 24 L186 50 L194 76 L162 53 C130 68 60 82 14 60 Z" fill="${fill}"/>
                    ${shadow ? "" : `<circle cx="60" cy="50" r="2" fill="${accent}"/><circle cx="80" cy="56" r="2" fill="${accent}"/><circle cx="100" cy="48" r="2" fill="${accent}"/>`}
                    ${eye(26, 44, 4)}`;
                break;
            case "rooster":
                body = `<path d="M50 34 L44 2 M60 34 L60 0 M70 34 L74 2 M80 34 L88 4 M90 36 L100 8" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
                    <path d="M10 54 C18 22 100 16 156 44 L190 20 L182 50 L190 80 L156 58 C100 86 20 84 10 54 Z" fill="${fill}"/>
                    <path d="M40 40 Q70 60 60 80 M80 36 Q110 56 100 76" stroke="${accent}" stroke-width="4" fill="none" opacity="0.7"/>
                    ${eye(26, 46, 4.5)}`;
                break;
            case "flat":
                body = `<path d="M10 50 C24 14 140 10 164 44 L192 30 L192 70 L164 56 C140 90 24 86 10 50 Z" fill="${fill}"/>
                    <path d="M24 30 Q90 4 158 40 M24 70 Q90 96 158 60" stroke="${accent}" stroke-width="3" fill="none" opacity="0.6"/>
                    ${shadow ? "" : `<circle cx="70" cy="44" r="4" fill="${accent}" opacity="0.5"/><circle cx="100" cy="58" r="5" fill="${accent}" opacity="0.5"/><circle cx="120" cy="42" r="3" fill="${accent}" opacity="0.5"/>`}
                    ${eye(30, 40, 4)}${eye(38, 34, 4)}`;
                break;
            case "cod":
            case "snapper":
                body = `<path d="M50 34 C60 14 90 10 120 34 Z" fill="${back}"/>
                    ${fish.shape === "cod" ? `<path d="M120 36 C130 24 145 28 150 42 Z" fill="${back}"/>` : ""}
                    <path d="M10 56 C20 24 100 16 150 44 L186 26 L180 54 L186 80 L150 60 C100 88 24 84 10 56 Z" fill="${fill}"/>
                    ${fish.shape === "cod" ? `<path d="M14 62 l-4 10" stroke="${back}" stroke-width="2"/>` : ""}
                    ${shadow || fish.shape === "cod" ? "" : `<circle cx="60" cy="44" r="2.5" fill="${accent}"/><circle cx="80" cy="40" r="2.5" fill="${accent}"/><circle cx="100" cy="44" r="2.5" fill="${accent}"/>`}
                    ${eye(28, 46, 4.5)}`;
                break;
            case "squid":
                body = `<path d="M110 50 L196 30 L186 50 L196 70 Z" fill="${accent}" opacity="0.5"/>
                    <path d="M60 50 C70 22 150 22 186 50 C150 78 70 78 60 50 Z" fill="${fill}"/>
                    <path d="M62 44 C40 40 20 30 4 34 M62 48 C40 46 20 44 2 46 M62 52 C40 54 20 56 2 56 M62 56 C40 62 20 70 4 66" stroke="${back}" stroke-width="4" fill="none" stroke-linecap="round"/>
                    ${eye(66, 46, 5)}`;
                break;
            case "octopus":
                body = `<path d="M100 54 C64 70 30 62 10 74 M100 58 C70 80 40 84 20 96 M104 60 C90 84 70 94 60 98 M110 60 C120 84 140 94 150 98 M114 58 C140 80 160 84 180 94 M118 54 C150 66 170 62 192 72" stroke="${back}" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <ellipse cx="110" cy="34" rx="34" ry="28" fill="${fill}"/>
                    ${eye(98, 42, 4)}${eye(122, 42, 4)}`;
                break;
            default: /* jack: 부시리/방어/킹피시 */
                body = `<path d="M78 34 L96 14 L108 36 Z" fill="${back}"/>
                    <path d="M84 68 L98 84 L106 66 Z" fill="${back}"/>
                    <path d="M6 50 C36 26 120 24 158 46 L194 22 L186 50 L194 78 L158 54 C120 76 36 74 6 50 Z" fill="${fill}"/>
                    <path d="M18 48 Q90 40 168 48" stroke="${accent}" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9"/>
                    ${eye(24, 46, 4)}`;
        }
        return `<svg class="fish-svg" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${grad}${body}</svg>`;
    },

    /* 장비 그림 (SVG) - 상품 사진이 없을 때 사용 */
    gearSVG(item) {
        const col = item.color || "#4fa3d9";
        const id = U.uid("m");
        if (item.category === "rod") {
            return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#1b1f26"/><stop offset="1" stop-color="${col}"/></linearGradient></defs>
                <path d="M14 104 L190 18" stroke="url(#${id})" stroke-width="5" stroke-linecap="round"/>
                <path d="M14 104 L60 82" stroke="#0d1117" stroke-width="10" stroke-linecap="round"/>
                <path d="M62 81 L74 75" stroke="${col}" stroke-width="8"/>
                ${[96, 120, 142, 160, 176].map(x => { const y = 104 - (x - 14) * 0.4886; return `<circle cx="${x}" cy="${y + 5}" r="3" fill="none" stroke="#cfd8e3" stroke-width="1.5"/>`; }).join("")}
            </svg>`;
        }
        if (item.category === "reel") {
            return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs><radialGradient id="${id}"><stop offset="0" stop-color="#e9eef3"/><stop offset="1" stop-color="${col}"/></radialGradient></defs>
                <rect x="60" y="14" width="80" height="10" rx="4" fill="#2a313b"/>
                <path d="M100 24 L100 40" stroke="#2a313b" stroke-width="8"/>
                <circle cx="100" cy="72" r="38" fill="url(#${id})" stroke="#11161d" stroke-width="4"/>
                <circle cx="100" cy="72" r="20" fill="#1a2028"/>
                <circle cx="100" cy="72" r="8" fill="${col}"/>
                <path d="M138 72 L170 72 L170 96" stroke="#11161d" stroke-width="6" fill="none" stroke-linecap="round"/>
                <rect x="160" y="92" width="20" height="14" rx="5" fill="${col}"/>
            </svg>`;
        }
        /* 루어 */
        const isJig = item.fishingMethod === "jigging";
        const isEgi = /EGI/.test(item.type || "");
        if (isEgi) {
            return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M30 60 C40 40 130 36 160 54 C130 76 40 80 30 60 Z" fill="${col}" stroke="#11161d" stroke-width="2"/>
                <path d="M60 52 L120 48 M60 66 L120 64" stroke="#fff" stroke-width="2" opacity="0.6"/>
                <circle cx="48" cy="56" r="5" fill="#fff"/><circle cx="48" cy="56" r="2.5" fill="#000"/>
                <path d="M160 54 l18 -8 M160 54 l20 0 M160 54 l18 8 M160 54 l14 -14 M160 54 l14 14" stroke="#c9d3de" stroke-width="2"/>
            </svg>`;
        }
        if (isJig) {
            return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3f8"/><stop offset="0.5" stop-color="${col}"/><stop offset="1" stop-color="#1c2633"/></linearGradient></defs>
                <path d="M22 60 C40 46 150 44 178 58 C150 72 40 74 22 60 Z" fill="url(#${id})" stroke="#0d1117" stroke-width="2"/>
                <path d="M40 58 L170 58" stroke="#fff" stroke-width="1.5" opacity="0.7"/>
                <circle cx="36" cy="58" r="4" fill="#fff"/><circle cx="36" cy="58" r="2" fill="#000"/>
                <path d="M178 58 l10 0 M188 58 c6 0 6 12 0 14 c-6 2 -8 -6 -4 -8" stroke="#c9d3de" stroke-width="2" fill="none"/>
                <path d="M22 60 l-10 0 M12 60 c-6 0 -6 12 0 14 c6 2 8 -6 4 -8" stroke="#c9d3de" stroke-width="2" fill="none"/>
            </svg>`;
        }
        return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}"/><stop offset="0.6" stop-color="#eef3f8"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
            <path d="M16 58 C20 44 150 42 182 56 C150 70 20 74 16 58 Z" fill="url(#${id})" stroke="#0d1117" stroke-width="2"/>
            <circle cx="34" cy="56" r="5" fill="#fff"/><circle cx="34" cy="56" r="2.5" fill="#000"/>
            <path d="M70 66 c-2 10 6 16 10 10 M140 64 c-2 10 6 16 10 10" stroke="#c9d3de" stroke-width="2" fill="none"/>
            <path d="M182 56 l10 0" stroke="#c9d3de" stroke-width="2"/>
        </svg>`;
    },

    /* 상품 사진이 있으면 <img>, 없거나 깨지면 자동 그림 */
    gearImage(item) {
        const svg = U.gearSVG(item);
        if (!item.image) return `<div class="gear-img">${svg}</div>`;
        const fallback = encodeURIComponent(svg);
        return `<div class="gear-img"><img src="${U.escape(item.image)}" alt="${U.escape(I18N.name(item))}" loading="lazy"
            onerror="this.parentNode.innerHTML=decodeURIComponent('${fallback}')"></div>`;
    }
};
