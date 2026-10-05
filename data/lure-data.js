/* =========================================================
   루어 데이터 (lure-data.js)
   ---------------------------------------------------------
   ★ 새 지깅몰 루어 추가: 블록 하나를 복사 → 값만 바꾸기

   - fishingMethod : "casting" (펜슬 등) 또는 "jigging" (메탈지그 등)
                     CASTING 을 고르면 casting 루어만,
                     JIGGING 을 고르면 jigging 루어만 자동으로 보입니다.
   - type          : 화면에 보이는 루어 종류 (SINKING PENCIL, METAL JIG ...)
   - weight        : 무게(g). 모르면 null
   - targetFish    : 대상어 id. 선택한 물고기가 여기에 있어야 목록에 나옵니다.
   - recommendedRegions : 추천 지역 id
   - image         : 상품 사진 경로 (비워두면 자동 그림)
   - purchaseUrl   : 지깅몰 상품 주소 (비워두면 지깅몰 메인)
   - gamePower     : 게임 전용 어필력 1~5 (히트율)
   - gameAction    : 게임 전용 액션 이름 (화면 표시용)
   - rarityBonus   : 대물 확률 보너스 (0 ~ 0.3 권장)
   - color         : 자동 그림 색상
   ========================================================= */
window.SHARK_DATA = window.SHARK_DATA || {};

SHARK_DATA.lures = [
    /* ================= CASTING : PENCIL ================= */
    {
        id: "seadrop_fs150", name: "씨드롭 FS150 95g 싱킹펜슬", brand: "SEADROP",
        type: "SINKING PENCIL", fishingMethod: "casting", weight: 95,
        targetFish: ["amberjack", "yellowtail", "spanish_mackerel", "tuna", "kingfish", "yellowfin", "gt", "mahimahi"],
        recommendedRegions: ["chujado", "wangdolcho", "jeju", "namhae"],
        image: "", purchaseUrl: "",
        gamePower: 4, gameAction: "S자 슬라이드", rarityBonus: 0.1, color: "#4fa3d9"
    },
    {
        id: "moral_kings", name: "모랄 킹스", brand: "MORAL",
        type: "PENCIL", fishingMethod: "casting", weight: null,
        targetFish: ["amberjack", "yellowtail", "tuna", "gt", "yellowfin", "bluefin", "marlin"],
        recommendedRegions: ["danjo", "goto", "seychelles", "maldives"],
        image: "", purchaseUrl: "",
        gamePower: 4, gameAction: "와이드 다이브", rarityBonus: 0.15, color: "#e0a526"
    },
    {
        id: "moral_longpen", name: "모랄 롱펜", brand: "MORAL",
        type: "PENCIL", fishingMethod: "casting", weight: null,
        targetFish: ["spanish_mackerel", "amberjack", "wahoo", "mahimahi", "sailfish", "roosterfish"],
        recommendedRegions: ["wando", "yeosu", "costa_rica", "cabo"],
        image: "", purchaseUrl: "",
        gamePower: 3.5, gameAction: "롱 다트", rarityBonus: 0.05, color: "#9fd36a"
    },
    {
        id: "moral_alban", name: "모랄 알밴 펜슬", brand: "MORAL",
        type: "PENCIL", fishingMethod: "casting", weight: null,
        targetFish: ["tuna", "bluefin", "yellowfin", "bigeye", "gt", "marlin"],
        recommendedRegions: ["donghae", "hawaii", "nova_scotia", "cape_cod"],
        image: "", purchaseUrl: "",
        gamePower: 4.5, gameAction: "묵직한 롤링", rarityBonus: 0.2, color: "#d9573b"
    },
    {
        id: "seadrop_lip140", name: "씨드롭 LIP140", brand: "SEADROP",
        type: "PENCIL", fishingMethod: "casting", weight: null,
        targetFish: ["amberjack", "gt", "roosterfish", "kingfish", "snapper"],
        recommendedRegions: ["penghu", "panama", "bay_of_islands"],
        image: "", purchaseUrl: "",
        gamePower: 3.5, gameAction: "워블링 스윔", rarityBonus: 0.1, color: "#f0cf4a"
    },
    {
        id: "egi_35", name: "에기 3.5호", brand: "기본 장비",
        type: "EGI", fishingMethod: "casting", weight: null,
        targetFish: ["squid"],
        recommendedRegions: ["tongyeong", "geoje", "jeju"],
        image: "", purchaseUrl: "",
        gamePower: 3.5, gameAction: "샤크리 & 폴링", rarityBonus: 0.1, color: "#ff8a5c"
    },

    /* ================= JIGGING : METAL JIG ================= */
    {
        id: "seadrop_scale_240", name: "씨드롭 스케일 240g", brand: "SEADROP",
        type: "METAL JIG", fishingMethod: "jigging", weight: 240,
        targetFish: ["amberjack", "yellowtail", "kingfish", "tuna", "dogtooth", "yellowfin", "bigeye", "bluefin", "gt"],
        recommendedRegions: ["wangdolcho", "goto", "okinawa", "maldives"],
        image: "", purchaseUrl: "",
        gamePower: 4, gameAction: "하이피치 슬라이드", rarityBonus: 0.1, color: "#9fb7c9"
    },
    {
        id: "seadrop_galchi_xl_300", name: "씨드롭 갈치 XL 300g", brand: "SEADROP",
        type: "METAL JIG", fishingMethod: "jigging", weight: 300,
        targetFish: ["tuna", "bluefin", "bigeye", "dogtooth", "halibut", "cod", "amberjack"],
        recommendedRegions: ["tsugaru", "donghae", "azores", "norway"],
        image: "", purchaseUrl: "",
        gamePower: 4.5, gameAction: "롱 폴", rarityBonus: 0.2, color: "#d8dde3"
    },
    {
        id: "steel_longjerker_edge", name: "스틸 롱저커 엣지", brand: "",
        type: "METAL JIG", fishingMethod: "jigging", weight: null,
        targetFish: ["amberjack", "yellowtail", "spanish_mackerel", "kingfish", "wahoo", "yellowfin"],
        recommendedRegions: ["wangdolcho", "bay_of_islands", "danjo"],
        image: "", purchaseUrl: "",
        gamePower: 3.5, gameAction: "롱 저크", rarityBonus: 0.1, color: "#5c86b3"
    },
    {
        id: "realjig_200", name: "리얼지그 200g", brand: "",
        type: "METAL JIG", fishingMethod: "jigging", weight: 200,
        targetFish: ["amberjack", "yellowtail", "snapper", "cod", "halibut", "kingfish"],
        recommendedRegions: ["queensland", "iceland", "chujado"],
        image: "", purchaseUrl: "",
        gamePower: 3.5, gameAction: "리얼 베이트 폴", rarityBonus: 0.05, color: "#c4504a"
    },
    {
        id: "or_seadrop_galchi", name: "오션리퍼블릭 씨드롭 갈치", brand: "OCEAN REPUBLIC",
        type: "METAL JIG", fishingMethod: "jigging", weight: null,
        targetFish: ["spanish_mackerel", "amberjack", "yellowtail", "tuna", "wahoo", "gt"],
        recommendedRegions: ["wando", "namhae", "jeju"],
        image: "", purchaseUrl: "",
        gamePower: 4, gameAction: "갈치 플래시", rarityBonus: 0.1, color: "#eef2f6"
    },
    {
        id: "seadrop_rsc", name: "씨드롭 RSC", brand: "SEADROP",
        type: "METAL JIG", fishingMethod: "jigging", weight: null,
        targetFish: ["amberjack", "snapper", "cod", "dogtooth", "gt"],
        recommendedRegions: ["penghu", "mozambique", "madagascar"],
        image: "", purchaseUrl: "",
        gamePower: 3.5, gameAction: "숏 피치 롤링", rarityBonus: 0.15, color: "#58c08f"
    },
    {
        id: "jjukkumi_egi", name: "주꾸미 에기 세트", brand: "기본 장비",
        type: "OCTOPUS EGI", fishingMethod: "jigging", weight: null,
        targetFish: ["octopus"],
        recommendedRegions: ["seohae", "yeosu", "tongyeong"],
        image: "", purchaseUrl: "",
        gamePower: 3.5, gameAction: "바닥 톡톡", rarityBonus: 0.1, color: "#ff6fa3"
    }
];
