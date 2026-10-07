/* =========================================================
   낚시대 / 릴 데이터 (equipment-data.js)
   ---------------------------------------------------------
   ★ 낚시대는 지깅몰에서 판매 중인 SHARK 브랜드(샤크컴퍼니) 실제 상품만 등록합니다.
     (릴은 VJ3 + 지깅몰 시마노·다이와 스피닝릴 - 아래 릴 목록 참고)
     - 지깅 낚시대 : https://www.jiggingmall.com/goods/goods_list.php?cateCd=002007
     - 파핑 낚시대 : https://www.jiggingmall.com/goods/goods_list.php?cateCd=002003
     (상품 상세페이지의 "브랜드: SHARK" 항목으로 확인한 상품만 등록. NS 등 외부 브랜드 제외)

   ★ 새 상품 추가: { ... } 블록 하나를 복사해서 붙여넣고 값만 바꾸면 됩니다.
   - id            : 영문/숫자 고유값 (중복 금지)
   - name          : 지깅몰 상품명 그대로
   - nameEn        : 해외(영어) 접속 시 보이는 이름
   - fishingMethod : "jigging" (지깅 낚시대) 또는 "casting" (파핑/캐스팅 낚시대)
                     릴은 ["jigging", "casting"] 처럼 배열도 가능
   - targetFish    : 게임 추천 어종 id (fish-data.js)
   - difficulty    : 게임 난이도 표시 "쉬움" / "보통" / "어려움"
   - image         : 상품 이미지 주소 (비우면 게임이 자동으로 그림을 그림)
   - purchaseUrl   : 지깅몰 상품 상세 주소
                     (비우면 낚시대는 해당 카테고리 페이지, 그 외는 지깅몰 메인으로 이동)
   - realSpec      : 실제 제품 스펙 - 확인된 값만 입력. 모르면 {} 로 비워둠
   - gameStats     : 게임 전용 수치 (0~100, 실제 스펙과 무관)
                     power  : 버티는 힘 (대물일수록 높아야 함)
                     control: 라인 브레이크 방지 여유
                     drag   : 드랙 성능 (릴)
   ========================================================= */
window.SHARK_DATA = window.SHARK_DATA || {};

const JM_GOODS = "https://www.jiggingmall.com/goods/goods_view.php?goodsNo=";
const JM_IMG = "https://godomall-storage.cdn-nhncommerce.com/f6fe7522e96b4cabf7725cac932d6dd3/goods/";

SHARK_DATA.rods = [
    /* ================= SHARK 지깅 낚시대 (cateCd=002007) ================= */
    {
        id: "rod_2943", name: "아이언저크 B-67H3 버티컬 마이티 시리즈 / 업그레이드 버전",
        nameEn: "IRON JERK B-67H3 Vertical Mighty Series (Upgraded)",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "kingfish"], difficulty: "보통",
        image: JM_IMG + "2943/image/main/2943_main_054.jpg", purchaseUrl: JM_GOODS + "2943",
        realSpec: {}, gameStats: { power: 75, control: 70 }
    },
    {
        id: "rod_2942", name: "아이언저크 B-63H4 (버티컬) 마이티 시리즈 / 업그레이드 버전",
        nameEn: "IRON JERK B-63H4 Vertical Mighty Series (Upgraded)",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "tuna"], difficulty: "보통",
        image: JM_IMG + "2942/image/main/2942_main_031.jpg", purchaseUrl: JM_GOODS + "2942",
        realSpec: {}, gameStats: { power: 80, control: 65 }
    },
    {
        id: "rod_3471", name: "오션리퍼블릭 VJB66M 부시리 방어 참치 대구",
        nameEn: "OCEAN REPUBLIC VJB66M Jigging Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "tuna", "cod"], difficulty: "쉬움",
        image: JM_IMG + "3471/image/main/3471_main_012.jpg", purchaseUrl: JM_GOODS + "3471",
        realSpec: {}, gameStats: { power: 60, control: 80 }
    },
    {
        id: "rod_3415", name: "오션리퍼블릭 OTRJ60ML 갈치 참돔 농어 민어 낚시대",
        nameEn: "OCEAN REPUBLIC OTRJ60ML Light Jigging Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["snapper", "octopus", "spanish_mackerel"], difficulty: "쉬움",
        image: JM_IMG + "3415/image/main/3415_main_02.jpg", purchaseUrl: JM_GOODS + "3415",
        realSpec: {}, gameStats: { power: 35, control: 90 }
    },
    {
        id: "rod_3405", name: "오션리퍼블릭 VJB60H 버티컬 지깅 낚시대",
        nameEn: "OCEAN REPUBLIC VJB60H Vertical Jigging Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "kingfish"], difficulty: "보통",
        image: JM_IMG + "3405/image/main/3405_main_077.jpg", purchaseUrl: JM_GOODS + "3405",
        realSpec: {}, gameStats: { power: 75, control: 70 }
    },
    {
        id: "rod_3404", name: "오션리퍼블릭 VJB66H2 버티컬 지깅 낚시대",
        nameEn: "OCEAN REPUBLIC VJB66H2 Vertical Jigging Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "snapper"], difficulty: "쉬움",
        image: JM_IMG + "3404/image/main/3404_main_060.jpg", purchaseUrl: JM_GOODS + "3404",
        realSpec: {}, gameStats: { power: 65, control: 80 }
    },
    {
        id: "rod_3403", name: "오션리퍼블릭 VJS63H3 스피닝 버티컬 지깅 낚시대",
        nameEn: "OCEAN REPUBLIC VJS63H3 Spinning Vertical Jigging Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "kingfish"], difficulty: "보통",
        image: JM_IMG + "3403/image/main/3403_main_032.jpg", purchaseUrl: JM_GOODS + "3403",
        realSpec: {}, gameStats: { power: 75, control: 70 }
    },
    {
        id: "rod_1452", name: "아이언저크 65H2MF 70H3R 부시리 방어 지깅 낚시대",
        nameEn: "IRON JERK 65H2MF / 70H3R Jigging Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail"], difficulty: "보통",
        image: JM_IMG + "1452/image/main/1452_main_04.jpg", purchaseUrl: JM_GOODS + "1452",
        realSpec: {}, gameStats: { power: 70, control: 70 }
    },
    {
        id: "rod_3241", name: "아이언저크 B-58BG 버티컬 지깅낚시대 전동지깅",
        nameEn: "IRON JERK B-58BG Vertical Jigging Rod (Electric Jigging)",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["tuna", "dogtooth", "bigeye", "halibut"], difficulty: "어려움",
        image: JM_IMG + "3241/image/main/3241_main_083.jpg", purchaseUrl: JM_GOODS + "3241",
        realSpec: {}, gameStats: { power: 90, control: 60 }
    },
    {
        id: "rod_3458", name: "아이언저크 BS-602BG 스파이럴 가이드 전동지깅 부시리 방어 참치 대구",
        nameEn: "IRON JERK BS-602BG Spiral Guide Electric Jigging Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "tuna", "cod"], difficulty: "어려움",
        image: JM_IMG + "3458/image/main/3458_main_082.jpg", purchaseUrl: JM_GOODS + "3458",
        realSpec: {}, gameStats: { power: 85, control: 65 }
    },
    {
        id: "rod_2722", name: "아이언저크 S-53 / B-53 / 참치, 부시리, 방어",
        nameEn: "IRON JERK S-53 / B-53 Tuna & Amberjack Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["tuna", "amberjack", "yellowtail", "yellowfin"], difficulty: "어려움",
        image: JM_IMG + "2722/image/main/2722_main_077.jpg", purchaseUrl: JM_GOODS + "2722",
        realSpec: {}, gameStats: { power: 90, control: 60 }
    },
    {
        id: "rod_3437", name: "아이언저크 S-58BG 스피닝 지깅낚시대",
        nameEn: "IRON JERK S-58BG Spinning Jigging Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["tuna", "dogtooth", "gt"], difficulty: "어려움",
        image: JM_IMG + "3437/image/main/3437_main_026.jpg", purchaseUrl: JM_GOODS + "3437",
        realSpec: {}, gameStats: { power: 90, control: 60 }
    },
    {
        id: "rod_3218", name: "아이언저크 B-581(3) 튜나스탠드업 /참치낚시대",
        nameEn: "IRON JERK B-581(3) Tuna Stand-Up Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["tuna", "bluefin", "yellowfin", "bigeye"], difficulty: "어려움",
        image: JM_IMG + "3218/image/main/3218_main_053.jpg", purchaseUrl: JM_GOODS + "3218",
        realSpec: {}, gameStats: { power: 98, control: 55 }
    },
    {
        id: "rod_3076", name: "아이언저크 B-642VJ /버티컬 지깅대/",
        nameEn: "IRON JERK B-642VJ Vertical Jigging Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "snapper"], difficulty: "쉬움",
        image: JM_IMG + "3076/image/main/3076_main_01.jpg", purchaseUrl: JM_GOODS + "3076",
        realSpec: {}, gameStats: { power: 65, control: 80 }
    },
    {
        id: "rod_2897", name: "NEW 아이언저크 B57SJ II / 놀라운 퍼포먼스를 선보이다",
        nameEn: "NEW IRON JERK B57SJ II",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "kingfish"], difficulty: "보통",
        image: JM_IMG + "2897/image/main/2897_main_073.jpg", purchaseUrl: JM_GOODS + "2897",
        realSpec: {}, gameStats: { power: 75, control: 70 }
    },
    {
        id: "rod_2684", name: "아이언저크 B-64 / 스파이럴 가이드",
        nameEn: "IRON JERK B-64 Spiral Guide",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "kingfish"], difficulty: "보통",
        image: JM_IMG + "2684/image/main/2684_main_044.jpg", purchaseUrl: JM_GOODS + "2684",
        realSpec: {}, gameStats: { power: 70, control: 75 }
    },
    {
        id: "rod_2674", name: "아이언저크 B-66RM / 부시리,방어,참돔 / 버티컬지깅 / 민어낚시,농어흘림낚시",
        nameEn: "IRON JERK B-66RM Vertical Jigging Rod",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["amberjack", "yellowtail", "snapper"], difficulty: "쉬움",
        image: JM_IMG + "2674/image/main/2674_main_092.jpg", purchaseUrl: JM_GOODS + "2674",
        realSpec: {}, gameStats: { power: 60, control: 85 }
    },
    {
        id: "rod_2916", name: "LIVE BAIT 라이브 베이트 생미끼 전용 낚시 로드 /GT,참치,돗돔/",
        nameEn: "LIVE BAIT Rod (GT / Tuna / Deep-Sea Giants)",
        brand: "SHARK", category: "rod", fishingMethod: "jigging",
        targetFish: ["gt", "tuna", "dogtooth"], difficulty: "어려움",
        image: JM_IMG + "2916/image/main/1505893894233s0.jpg", purchaseUrl: JM_GOODS + "2916",
        realSpec: {}, gameStats: { power: 92, control: 55 }
    },

    /* ================= SHARK 파핑 / 캐스팅 낚시대 (cateCd=002003) ================= */
    {
        id: "rod_3565", name: "오션리퍼블릭 ORS84XH/LONGPEN.BIG POP",
        nameEn: "OCEAN REPUBLIC ORS84XH Long Pencil / Big Popper",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["tuna", "gt", "amberjack", "yellowfin"], difficulty: "어려움",
        image: JM_IMG + "3565/image/main/3565_main_05.jpg", purchaseUrl: JM_GOODS + "3565",
        realSpec: {}, gameStats: { power: 85, control: 60 }
    },
    {
        id: "rod_3409", name: "오션리퍼블릭 ORS82 대삼치 캐스팅 낚시대",
        nameEn: "OCEAN REPUBLIC ORS82 Spanish Mackerel Casting Rod",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["spanish_mackerel", "squid", "mahimahi"], difficulty: "쉬움",
        image: JM_IMG + "3409/image/main/3409_main_02.jpg", purchaseUrl: JM_GOODS + "3409",
        realSpec: {}, gameStats: { power: 45, control: 90 }
    },
    {
        id: "rod_3329", name: "아이언팝 92 II Version UP 파핑 낚시대 부시리 방어 참치 낚시",
        nameEn: "IRON POP 92 II Version UP Popping Rod",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["amberjack", "yellowtail", "tuna"], difficulty: "보통",
        image: JM_IMG + "3329/image/main/3329_main_067.jpg", purchaseUrl: JM_GOODS + "3329",
        realSpec: {}, gameStats: { power: 80, control: 70 }
    },
    {
        id: "rod_2064", name: "아이언팝 95 Version UP 파핑 낚시대",
        nameEn: "IRON POP 95 Version UP Popping Rod",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["gt", "tuna", "amberjack"], difficulty: "어려움",
        image: JM_IMG + "2064/image/main/2064_main_081.jpg", purchaseUrl: JM_GOODS + "2064",
        realSpec: {}, gameStats: { power: 88, control: 60 }
    },
    {
        id: "rod_3197", name: "아이언팝 S-86BG 빅게임 캐스팅 전용 참치 GT 부시리 방어 대삼치 낚시대",
        nameEn: "IRON POP S-86BG Big Game Casting Rod",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["tuna", "gt", "amberjack", "yellowtail", "spanish_mackerel"], difficulty: "어려움",
        image: JM_IMG + "3197/image/main/3197_main_042.jpg", purchaseUrl: JM_GOODS + "3197",
        realSpec: {}, gameStats: { power: 92, control: 60 }
    },
    {
        id: "rod_3273", name: "아이언팝 S95 SURF/INSHORE 참치 GT 부시리 방어 낚시대",
        nameEn: "IRON POP S95 Surf / Inshore Casting Rod",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["tuna", "gt", "amberjack", "yellowtail", "roosterfish"], difficulty: "보통",
        image: JM_IMG + "3273/image/main/3273_main_05.jpg", purchaseUrl: JM_GOODS + "3273",
        realSpec: {}, gameStats: { power: 80, control: 65 }
    },
    {
        id: "rod_3196", name: "아이언팝 S-84BG 빅게임 캐스팅 전용 참치 GT 부시리 방어 대삼치 낚시대",
        nameEn: "IRON POP S-84BG Big Game Casting Rod",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["tuna", "gt", "amberjack", "yellowtail", "spanish_mackerel"], difficulty: "어려움",
        image: JM_IMG + "3196/image/main/3196_main_052.jpg", purchaseUrl: JM_GOODS + "3196",
        realSpec: {}, gameStats: { power: 88, control: 65 }
    },
    {
        id: "rod_3070", name: "최상위 스펙의 로드!! 아이언팝 S-87 /GT/TUNA/YellowTail",
        nameEn: "IRON POP S-87 Top-Spec Rod (GT / Tuna / Yellowtail)",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["gt", "tuna", "bluefin", "yellowfin", "marlin"], difficulty: "어려움",
        image: JM_IMG + "3070/image/main/1537164431810s0.jpg", purchaseUrl: JM_GOODS + "3070",
        realSpec: {}, gameStats: { power: 98, control: 55 }
    },
    {
        id: "rod_3274", name: "아이언팝 S80 대삼치 캐스팅 낚시대",
        nameEn: "IRON POP S80 Spanish Mackerel Casting Rod",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["spanish_mackerel", "squid", "mahimahi", "snapper"], difficulty: "쉬움",
        image: JM_IMG + "3274/image/main/3274_main_037.jpg", purchaseUrl: JM_GOODS + "3274",
        realSpec: {}, gameStats: { power: 45, control: 90 }
    },
    {
        id: "rod_3065", name: "NEW 아이언 라이트팝 S-85 /아이언팝 90 리뉴얼제품!/",
        nameEn: "NEW IRON LIGHT POP S-85 (IRON POP 90 Renewal)",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["amberjack", "yellowtail", "spanish_mackerel", "kingfish", "sailfish"], difficulty: "쉬움",
        image: JM_IMG + "3065/image/main/3065_main_056.jpg", purchaseUrl: JM_GOODS + "3065",
        realSpec: {}, gameStats: { power: 65, control: 80 }
    },
    {
        id: "rod_3616", name: "아이언팝 S-83 EVA KW guide",
        nameEn: "IRON POP S-83 EVA KW Guide",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["amberjack", "yellowtail", "tuna"], difficulty: "보통",
        image: JM_IMG + "3616/image/main/3616_main_021.jpg", purchaseUrl: JM_GOODS + "3616",
        realSpec: {}, gameStats: { power: 75, control: 70 }
    },
    {
        id: "rod_3617", name: "아이언팝 S-83 코르크 KW guide",
        nameEn: "IRON POP S-83 Cork KW Guide",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["amberjack", "yellowtail", "tuna"], difficulty: "보통",
        image: JM_IMG + "3617/image/main/3617_main_052.jpg", purchaseUrl: JM_GOODS + "3617",
        realSpec: {}, gameStats: { power: 75, control: 70 }
    },
    {
        id: "rod_3614", name: "아이언팝 S-83 코르크 RV guide",
        nameEn: "IRON POP S-83 Cork RV Guide",
        brand: "SHARK", category: "rod", fishingMethod: "casting",
        targetFish: ["amberjack", "yellowtail", "tuna"], difficulty: "보통",
        image: JM_IMG + "3614/image/main/3614_main_038.png", purchaseUrl: JM_GOODS + "3614",
        realSpec: {}, gameStats: { power: 75, control: 70 }
    }
];

/* ================= 릴 =================
   - VJ3 : 샤크컴퍼니 지깅릴 (지깅 / 캐스팅 공용)
   - 시마노 · 다이와 : 지깅몰 스피닝릴 카테고리 상품
     https://www.jiggingmall.com/goods/goods_list.php?cateCd=001001
     randomPool: true 인 릴은 CASTING 장비 선택 때 3개만 랜덤으로 보여줌
     (몇 개를 보여줄지는 js/equipment.js 의 CASTING_REEL_PICK)
   ================================================= */
const REEL_SPINNING = { reelType: "스피닝릴", reelTypeEn: "Spinning Reel", category: "reel", fishingMethod: ["casting"], randomPool: true, realSpec: {} };

SHARK_DATA.reels = [
    {
        id: "vj3", name: "앰보스 VJ3 지깅릴", nameEn: "AMBOS VJ3 Jigging Reel", brand: "SHARK COMPANY", category: "reel",
        productCode: "3634",
        reelType: "지깅릴", reelTypeEn: "Jigging Reel",   // 스피닝/베이트 등 세부 타입은 표시하지 않음
        fishingMethod: ["jigging", "casting"],
        targetFish: ["amberjack", "yellowtail", "tuna", "gt", "kingfish"],
        difficulty: "보통",
        image: JM_IMG + "3634/image/main/3634_main_011.png",
        purchaseUrl: "https://www.jiggingmall.com/goods/goods_view.php?goodsNo=3634",
        realSpec: {},                           // 상세페이지에서 확인된 스펙만 입력
        gameStats: { power: 95, drag: 95, control: 88 }
    },

    /* ---------------- 시마노 SHIMANO (캐스팅 랜덤) ---------------- */
    {
        ...REEL_SPINNING, id: "shimano_3613", brand: "SHIMANO",
        name: "25 스텔라 14000XG", nameEn: "25 STELLA 14000XG",
        targetFish: ["tuna", "bluefin", "yellowfin", "gt", "marlin"],
        image: JM_IMG + "3613/image/main/3613_main_055.jpg", purchaseUrl: JM_GOODS + "3613",
        gameStats: { power: 98, drag: 97, control: 88, speed: 95, line: 450 }
    },
    {
        ...REEL_SPINNING, id: "shimano_3207", brand: "SHIMANO",
        name: "스텔라 SW 8000 / 10000 / 20000 / 30000", nameEn: "STELLA SW 8000 / 10000 / 20000 / 30000",
        targetFish: ["tuna", "gt", "amberjack", "yellowfin", "bluefin"],
        image: JM_IMG + "3207/image/main/3207_main_079.jpg", purchaseUrl: JM_GOODS + "3207",
        gameStats: { power: 95, drag: 95, control: 88, speed: 85, line: 450 }
    },
    {
        ...REEL_SPINNING, id: "shimano_3450", brand: "SHIMANO",
        name: "21 트윈파워 SW", nameEn: "21 TWIN POWER SW",
        targetFish: ["amberjack", "yellowtail", "tuna", "gt", "kingfish"],
        image: JM_IMG + "3450/image/main/3450_main_098.jpg", purchaseUrl: JM_GOODS + "3450",
        gameStats: { power: 88, drag: 88, control: 85, speed: 85, line: 400 }
    },
    {
        ...REEL_SPINNING, id: "shimano_1958", brand: "SHIMANO",
        name: "트윈파워 SW (15) 10000PG", nameEn: "TWIN POWER SW (15) 10000PG",
        targetFish: ["amberjack", "yellowtail", "tuna", "kingfish"],
        image: JM_IMG + "1958/image/main/1958_main_074.jpg", purchaseUrl: JM_GOODS + "1958",
        gameStats: { power: 85, drag: 85, control: 88, speed: 65, line: 400 }
    },
    {
        ...REEL_SPINNING, id: "shimano_3498", brand: "SHIMANO",
        name: "20 스트라딕 SW 8000HG", nameEn: "20 STRADIC SW 8000HG",
        targetFish: ["amberjack", "yellowtail", "spanish_mackerel", "mahimahi"],
        image: JM_IMG + "3498/image/main/3498_main_033.PNG", purchaseUrl: JM_GOODS + "3498",
        gameStats: { power: 75, drag: 78, control: 85, speed: 85, line: 350 }
    },
    {
        ...REEL_SPINNING, id: "shimano_3518", brand: "SHIMANO",
        name: "스페로스 SW (21) 8000HG", nameEn: "SPHEROS SW (21) 8000HG",
        targetFish: ["amberjack", "yellowtail", "spanish_mackerel", "squid"],
        image: JM_IMG + "3518/image/main/3518_main_041.jpg", purchaseUrl: JM_GOODS + "3518",
        gameStats: { power: 70, drag: 72, control: 85, speed: 85, line: 350 }
    },

    /* ---------------- 다이와 DAIWA (캐스팅 랜덤) ---------------- */
    {
        ...REEL_SPINNING, id: "daiwa_2861", brand: "DAIWA",
        name: "솔티가 4500H / 5000H / 6500H / 6500", nameEn: "SALTIGA 4500H / 5000H / 6500H / 6500",
        targetFish: ["tuna", "gt", "yellowfin", "amberjack", "marlin"],
        image: JM_IMG + "2861/image/main/2861_main_090.jpg", purchaseUrl: JM_GOODS + "2861",
        gameStats: { power: 93, drag: 94, control: 88, speed: 85, line: 400 }
    },
    {
        ...REEL_SPINNING, id: "daiwa_3514", brand: "DAIWA",
        name: "22 칼디아 SW 14000-H / 18000", nameEn: "22 CALDIA SW 14000-H / 18000",
        targetFish: ["tuna", "gt", "yellowfin", "amberjack"],
        image: JM_IMG + "3514/image/main/3514_main_084.jpg", purchaseUrl: JM_GOODS + "3514",
        gameStats: { power: 84, drag: 84, control: 82, speed: 80, line: 450 }
    },
    {
        ...REEL_SPINNING, id: "daiwa_3582", brand: "DAIWA",
        name: "23 BG SW 14000-H", nameEn: "23 BG SW 14000-H",
        targetFish: ["tuna", "gt", "amberjack", "yellowfin"],
        image: JM_IMG + "3582/image/main/3582_main_016.jpg", purchaseUrl: JM_GOODS + "3582",
        gameStats: { power: 80, drag: 80, control: 80, speed: 80, line: 450 }
    },
    {
        ...REEL_SPINNING, id: "daiwa_3203", brand: "DAIWA",
        name: "블래스트 LT6000D-H", nameEn: "BLAST LT6000D-H",
        targetFish: ["amberjack", "yellowtail", "spanish_mackerel", "mahimahi"],
        image: JM_IMG + "3203/image/main/1560820746670s0.jpg", purchaseUrl: JM_GOODS + "3203",
        gameStats: { power: 65, drag: 68, control: 85, speed: 80, line: 300 }
    },
    {
        ...REEL_SPINNING, id: "daiwa_3407", brand: "DAIWA",
        name: "21 프림스 LT6000D-H", nameEn: "21 FREAMS LT6000D-H",
        targetFish: ["spanish_mackerel", "amberjack", "squid", "roosterfish"],
        image: JM_IMG + "3407/image/main/3407_main_079.jpg", purchaseUrl: JM_GOODS + "3407",
        gameStats: { power: 60, drag: 62, control: 85, speed: 80, line: 300 }
    },
    {
        ...REEL_SPINNING, id: "daiwa_3489", brand: "DAIWA",
        name: "22 이그지스트 LT5000-CXH", nameEn: "22 EXIST LT5000-CXH",
        targetFish: ["spanish_mackerel", "squid", "amberjack", "snapper"],
        image: JM_IMG + "3489/image/main/3489_main_035.PNG", purchaseUrl: JM_GOODS + "3489",
        gameStats: { power: 62, drag: 65, control: 92, speed: 92, line: 300 }
    }
];
