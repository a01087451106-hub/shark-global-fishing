/* =========================================================
   물고기 데이터 (fish-data.js)
   ---------------------------------------------------------
   - 여기 값만 바꾸면 게임 전체에 적용됩니다.
   - sizeRange : 게임에서 나오는 최소~최대 길이(cm). max 가 그 어종의 "최대어"
   - weightK   : 무게(kg) = weightK × 길이(cm)³  (체형 계수)
   - seasons   : 시즌(월). 시즌이면 히트율·대물 확률 상승
   - depthPref : 지깅에서 물고기가 잘 반응하는 수심(m)
   - fightPower: 파이팅 힘 (1 약함 ~ 5 매우 강함)
   - recommendedPower : 권장 장비 파워 (낚시대+릴 평균)
   - gradeChance : 등급 기본 확률(%) - 생략하면 기본값 사용
   ========================================================= */
window.SHARK_DATA = window.SHARK_DATA || {};

SHARK_DATA.gradeOrder = ["NORMAL", "GOOD", "BIG", "TROPHY", "MONSTER"];

/* 등급 기본 확률(%) - 대물이 너무 쉽게 나오지 않도록 낮게 설정 */
SHARK_DATA.defaultGradeChance = { NORMAL: 65, GOOD: 22, BIG: 9, TROPHY: 3, MONSTER: 1 };

/* 등급별 크기 구간 (sizeRange 안에서 0=최소, 1=최대어) */
SHARK_DATA.gradeBands = {
    NORMAL: [0.00, 0.35],
    GOOD: [0.35, 0.55],
    BIG: [0.55, 0.75],
    TROPHY: [0.75, 0.92],
    MONSTER: [0.92, 1.00]
};

/* 등급별 파이팅 힘 배율 */
SHARK_DATA.gradePowerMult = { NORMAL: 1.0, GOOD: 1.15, BIG: 1.35, TROPHY: 1.6, MONSTER: 1.9 };

/* 참치 전용 등급 이름 */
SHARK_DATA.tunaGradeNames = {
    NORMAL: "TUNA",
    GOOD: "BIG TUNA",
    BIG: "TROPHY TUNA",
    TROPHY: "MONSTER TUNA",
    MONSTER: "GLOBAL MONSTER"
};

SHARK_DATA.fish = [
    /* ---------------- 대한민국 기본 대상어 ---------------- */
    {
        id: "amberjack", name: "부시리", nameEn: "Yellowtail Amberjack",
        shape: "jack", colors: { back: "#2c5a7a", belly: "#e9eef2", accent: "#e8c547" },
        methods: ["jigging", "casting"], bestMethod: "jigging",
        depthPref: [25, 90], seasons: [4, 5, 6, 9, 10, 11, 12],
        sizeRange: { min: 50, max: 170 }, weightK: 1.2e-5,
        fightPower: 3.2, recommendedPower: 3,
        description: "대한민국 지깅·캐스팅의 대표 어종. 바닥을 향해 처박는 강력한 첫 질주가 특징이다.", descriptionEn: "Korea's signature jigging & casting target, famous for a powerful first run straight to the bottom."
    },
    {
        id: "yellowtail", name: "방어", nameEn: "Japanese Amberjack",
        shape: "jack", colors: { back: "#34607e", belly: "#eef2f4", accent: "#f0cf4a" },
        methods: ["jigging", "casting"], bestMethod: "jigging",
        depthPref: [30, 100], seasons: [11, 12, 1, 2],
        sizeRange: { min: 40, max: 130 }, weightK: 1.3e-5,
        fightPower: 2.8, recommendedPower: 2.5,
        description: "겨울 시즌 최고의 손님. 큰 개체는 '대방어'라 부르며 묵직하게 버틴다.", descriptionEn: "The star of winter. Big ones are called 'Daebang-eo' and pull with heavy, stubborn weight."
    },
    {
        id: "spanish_mackerel", name: "대삼치", nameEn: "Japanese Spanish Mackerel",
        shape: "long", colors: { back: "#4b6f8f", belly: "#f1f4f6", accent: "#9fb7c9" },
        methods: ["casting", "jigging"], bestMethod: "casting",
        depthPref: [5, 50], seasons: [9, 10, 11, 12],
        sizeRange: { min: 60, max: 130 }, weightK: 7e-6,
        fightPower: 2.2, recommendedPower: 2,
        description: "빠른 스피드와 날카로운 이빨. 가을 수면 나부라에 펜슬을 던지면 폭발적인 입질!", descriptionEn: "Blazing speed and razor teeth. Throw a pencil into autumn surface boils for explosive strikes!"
    },
    {
        id: "tuna", name: "참치", nameEn: "Pacific Bluefin Tuna",
        isTuna: true, shape: "tuna", colors: { back: "#1b2f57", belly: "#dfe6ee", accent: "#f2d34b" },
        methods: ["casting", "jigging"], bestMethod: "casting",
        depthPref: [5, 60], seasons: [7, 8, 9, 10],
        sizeRange: { min: 60, max: 220 }, weightK: 2.0e-5,
        fightPower: 4.2, recommendedPower: 4,
        description: "여름 시즌 동해·남해·제주에 찾아오는 SUMMER TUNA. 걸리면 라인이 끝없이 풀려나간다.", descriptionEn: "The SUMMER TUNA that visits Korea's East Sea, South Sea and Jeju. Once hooked, line just keeps peeling off."
    },
    {
        id: "squid", name: "무늬오징어", nameEn: "Bigfin Reef Squid",
        shape: "squid", colors: { back: "#b07f5b", belly: "#f3e3d3", accent: "#7ac3c9" },
        methods: ["casting"], bestMethod: "casting",
        depthPref: [3, 20], seasons: [4, 5, 6, 9, 10, 11],
        sizeRange: { min: 15, max: 50 }, weightK: 3.5e-5,
        fightPower: 1.0, recommendedPower: 1,
        description: "에깅의 꽃. 크기는 외투막 길이(cm). 2kg 이상은 '킬로급'이라 부른다.", descriptionEn: "The flower of eging. Size is mantle length (cm). Over 2kg is called a 'kilo-class' squid."
    },
    {
        id: "octopus", name: "주꾸미", nameEn: "Webfoot Octopus",
        shape: "octopus", colors: { back: "#8a5a4a", belly: "#d9b4a3", accent: "#c98c6f" },
        methods: ["jigging"], bestMethod: "jigging",
        depthPref: [5, 30], seasons: [3, 4, 9, 10, 11],
        sizeRange: { min: 10, max: 35 }, weightK: 1.1e-5,
        fightPower: 0.5, recommendedPower: 1,
        description: "가을 서해·남해 선상낚시의 인기 대상어. 바닥을 톡톡 치며 올라탄 무게를 느껴라.", descriptionEn: "A popular autumn boat target in Korea's west and south seas. Tap the bottom and feel the weight climb on."
    },

    /* ---------------- 해외 필드 대상어 ---------------- */
    {
        id: "gt", name: "GT", nameEn: "Giant Trevally",
        shape: "gt", colors: { back: "#3a4049", belly: "#c9ced4", accent: "#1d2228" },
        methods: ["casting", "jigging"], bestMethod: "casting",
        depthPref: [10, 60], seasons: [1, 2, 3, 4, 5, 9, 10, 11, 12],
        sizeRange: { min: 50, max: 170 }, weightK: 1.8e-5,
        fightPower: 4.3, recommendedPower: 4,
        description: "리프의 왕. 포퍼·펜슬을 덮치는 폭발적인 수면 바이트 후 산호초로 돌진한다.", descriptionEn: "King of the reef. Explodes on poppers and pencils at the surface, then bolts for the coral."
    },
    {
        id: "kingfish", name: "킹피시", nameEn: "Kingfish (Yellowtail Kingfish)",
        shape: "jack", colors: { back: "#2f5f6e", belly: "#eef3f2", accent: "#e8c547" },
        methods: ["jigging", "casting"], bestMethod: "jigging",
        depthPref: [20, 100], seasons: [1, 2, 3, 4, 10, 11, 12],
        sizeRange: { min: 60, max: 180 }, weightK: 1.2e-5,
        fightPower: 3.4, recommendedPower: 3,
        description: "뉴질랜드·호주·캘리포니아의 대형 부시리류. 바닥 암초로 파고드는 힘이 엄청나다.", descriptionEn: "The giant yellowtail of New Zealand, Australia and California, with incredible power to dive into reefs."
    },
    {
        id: "yellowfin", name: "황다랑어", nameEn: "Yellowfin Tuna",
        isTuna: true, shape: "tuna", colors: { back: "#1d3366", belly: "#e5eaf0", accent: "#f5c518" },
        methods: ["casting", "jigging"], bestMethod: "casting",
        depthPref: [5, 80], seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        sizeRange: { min: 60, max: 220 }, weightK: 1.9e-5,
        fightPower: 4.2, recommendedPower: 4,
        description: "노란 지느러미의 열대 참치. 돌고래 무리와 함께 다니며 펜슬에 폭발적으로 반응한다.", descriptionEn: "Tropical tuna with yellow fins. Travels with dolphin pods and smashes pencils at the surface."
    },
    {
        id: "bluefin", name: "참다랑어(대형)", nameEn: "Giant Bluefin Tuna",
        isTuna: true, shape: "tuna", colors: { back: "#14244a", belly: "#dde4ec", accent: "#e8c547" },
        methods: ["casting", "jigging"], bestMethod: "casting",
        depthPref: [5, 80], seasons: [6, 7, 8, 9, 10, 11],
        sizeRange: { min: 80, max: 320 }, weightK: 2.0e-5,
        fightPower: 5.0, recommendedPower: 4.5,
        description: "바다의 최강자. 300kg을 넘는 자이언트 블루핀은 모든 앵글러의 꿈이다.", descriptionEn: "The strongest fish in the sea. A 300kg+ giant bluefin is every angler's dream."
    },
    {
        id: "bigeye", name: "눈다랑어", nameEn: "Bigeye Tuna",
        isTuna: true, shape: "tuna", colors: { back: "#182c5c", belly: "#dfe5ee", accent: "#f0c93a" },
        methods: ["jigging", "casting"], bestMethod: "jigging",
        depthPref: [40, 150], seasons: [4, 5, 6, 7, 8, 9, 10],
        sizeRange: { min: 60, max: 230 }, weightK: 2.1e-5,
        fightPower: 4.5, recommendedPower: 4.5,
        description: "큰 눈으로 깊은 수심을 누비는 참치. 깊은 곳에서 끈질기게 원을 그리며 버틴다.", descriptionEn: "A big-eyed tuna that roams the depths, circling stubbornly deep below the boat."
    },
    {
        id: "dogtooth", name: "이빨참치", nameEn: "Dogtooth Tuna",
        isTuna: true, shape: "tuna", colors: { back: "#3b4a5c", belly: "#d9dee4", accent: "#9aa7b4" },
        methods: ["jigging"], bestMethod: "jigging",
        depthPref: [40, 150], seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        sizeRange: { min: 60, max: 210 }, weightK: 1.9e-5,
        fightPower: 4.6, recommendedPower: 4.5,
        description: "날카로운 이빨의 리프 참치. 히트 직후 리프로 처박는 첫 10초가 승부다.", descriptionEn: "A sharp-toothed reef tuna. The first 10 seconds after the hookup, as it dives for the reef, decide everything."
    },
    {
        id: "mahimahi", name: "만새기", nameEn: "Mahi-mahi",
        shape: "mahi", colors: { back: "#1f8f6a", belly: "#f1d64a", accent: "#2d7fd0" },
        methods: ["casting"], bestMethod: "casting",
        depthPref: [0, 20], seasons: [4, 5, 6, 7, 8, 9, 10],
        sizeRange: { min: 50, max: 200 }, weightK: 6e-6,
        fightPower: 2.6, recommendedPower: 2.5,
        description: "황금빛 몸색의 아크로바틱 파이터. 수면 위로 점프를 반복한다.", descriptionEn: "A golden acrobatic fighter that jumps again and again above the surface."
    },
    {
        id: "wahoo", name: "와후", nameEn: "Wahoo",
        shape: "long", colors: { back: "#22476e", belly: "#e5ecf2", accent: "#5c86b3" },
        methods: ["casting", "jigging"], bestMethod: "casting",
        depthPref: [5, 60], seasons: [1, 2, 3, 4, 5, 9, 10, 11, 12],
        sizeRange: { min: 80, max: 230 }, weightK: 5.5e-6,
        fightPower: 3.0, recommendedPower: 3,
        description: "시속 70km를 넘는 바다의 스프린터. 첫 질주에 드랙이 비명을 지른다.", descriptionEn: "The sprinter of the sea at over 70km/h. Its first run makes the drag scream."
    },
    {
        id: "marlin", name: "청새치", nameEn: "Blue Marlin",
        shape: "billfish", colors: { back: "#1a3a78", belly: "#dfe7ef", accent: "#4f8be0" },
        methods: ["casting"], bestMethod: "casting",
        depthPref: [0, 40], seasons: [5, 6, 7, 8, 9, 10, 11],
        sizeRange: { min: 150, max: 450 }, weightK: 9.3e-6,
        fightPower: 5.0, recommendedPower: 5,
        description: "빌피시의 왕. 수면을 박차고 솟구치는 점프는 평생 잊지 못할 장면이다.", descriptionEn: "King of billfish. Its leap out of the water is a sight you'll never forget."
    },
    {
        id: "sailfish", name: "돛새치", nameEn: "Sailfish",
        shape: "sailfish", colors: { back: "#1c3f7a", belly: "#e6ecf2", accent: "#3a6cc4" },
        methods: ["casting"], bestMethod: "casting",
        depthPref: [0, 30], seasons: [1, 2, 3, 4, 5, 10, 11, 12],
        sizeRange: { min: 120, max: 320 }, weightK: 2.5e-6,
        fightPower: 3.5, recommendedPower: 3,
        description: "거대한 돛 지느러미를 펼치는 바다에서 가장 빠른 물고기.", descriptionEn: "The fastest fish in the sea, spreading a giant sail-like dorsal fin."
    },
    {
        id: "roosterfish", name: "루스터피시", nameEn: "Roosterfish",
        shape: "rooster", colors: { back: "#6f7d8a", belly: "#eef0f2", accent: "#2a2f36" },
        methods: ["casting"], bestMethod: "casting",
        depthPref: [0, 20], seasons: [4, 5, 6, 7, 8, 9, 10],
        sizeRange: { min: 40, max: 160 }, weightK: 1.4e-5,
        fightPower: 3.0, recommendedPower: 3,
        description: "닭벼슬 같은 등지느러미. 중미 해변 서프라인에서 펜슬을 쫓는다.", descriptionEn: "A dorsal fin like a rooster's comb. Chases pencils through Central American surf lines."
    },
    {
        id: "halibut", name: "광어(넙치·할리벗)", nameEn: "Halibut",
        shape: "flat", colors: { back: "#5d5340", belly: "#f1ede4", accent: "#3b3427" },
        methods: ["jigging"], bestMethod: "jigging",
        depthPref: [40, 200], seasons: [4, 5, 6, 7, 8, 9],
        sizeRange: { min: 50, max: 300 }, weightK: 1.2e-5,
        fightPower: 3.0, recommendedPower: 3.5,
        description: "북쪽 바다의 거대한 넙치류. 바닥에서 '문짝'만 한 녀석이 올라온다.", descriptionEn: "Giant flatfish of the northern seas. 'Barn door' sized fish come up from the bottom."
    },
    {
        id: "cod", name: "대구", nameEn: "Atlantic Cod",
        shape: "cod", colors: { back: "#6b6a45", belly: "#efece0", accent: "#4a4a30" },
        methods: ["jigging"], bestMethod: "jigging",
        depthPref: [40, 200], seasons: [1, 2, 3, 4, 10, 11, 12],
        sizeRange: { min: 40, max: 180 }, weightK: 9e-6,
        fightPower: 2.0, recommendedPower: 2.5,
        description: "노르웨이·아이슬란드의 겨울 대표 어종. 대형은 '스크레이(Skrei)'라 불린다.", descriptionEn: "Winter icon of Norway and Iceland. The big spawning fish are called 'Skrei'."
    },
    {
        id: "snapper", name: "스내퍼(참돔류)", nameEn: "Snapper",
        shape: "snapper", colors: { back: "#c4504a", belly: "#f6d9d2", accent: "#4bb3e0" },
        methods: ["jigging", "casting"], bestMethod: "jigging",
        depthPref: [20, 100], seasons: [1, 2, 3, 4, 5, 9, 10, 11, 12],
        sizeRange: { min: 25, max: 110 }, weightK: 1.5e-5,
        fightPower: 2.2, recommendedPower: 2,
        description: "호주·뉴질랜드의 국민 어종. 묵직한 머리 흔들기로 저항한다.", descriptionEn: "The national fish of Australia and New Zealand, fighting back with heavy head shakes."
    }
];
