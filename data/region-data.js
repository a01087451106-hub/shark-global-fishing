/* =========================================================
   지역 데이터 (region-data.js)
   ---------------------------------------------------------
   여기에 지역 하나를 추가하면 세계지도와 지역 선택 화면에
   자동으로 나타납니다. (HTML 수정 필요 없음)

   필드 설명
   - id          : 영문 고유 이름 (중복 금지)
   - area        : 지도 그룹 (아래 SHARK_DATA.areas 의 id)
   - lat / lon   : 지도 위치 (위도 / 경도)
   - difficulty  : 난이도 1~5
   - depthMin/Max: 지역 참고 정보 (게임의 지깅 수심은 js/config.js 의 JIG_DEPTHS 20/30/40/50/60m 사용)
   - mainFish    : 잡을 수 있는 어종 id (fish-data.js)
   - trophyFish  : 이 지역에서 대물 확률이 높은 어종
   - fishingTypes: "jigging", "casting"
   - unlocked    : false 이면 총 조과 CONFIG.EXPEDITION_UNLOCK_CATCHES 마리 후 오픈
   - expedition  : true 면 TUNA EXPEDITION 필드
   - tunaSeason  : 대한민국 SUMMER TUNA FIELD 설정
                   { months: [시즌 월], hitBoost: 히트율 배율, trophyBoost: 대물 배율, offSeasonHit: 비시즌 히트율 배율 }
   ========================================================= */
window.SHARK_DATA = window.SHARK_DATA || {};

/* 지도 그룹 (view: [서쪽 경도, 남쪽 위도, 동쪽 경도, 북쪽 위도]) */
SHARK_DATA.areas = [
    { id: "all", name: "전체 세계", nameEn: "WORLD", view: [-180, -58, 180, 80] },
    { id: "korea", name: "대한민국 / ASIA", nameEn: "KOREA · ASIA", view: [122.5, 31.8, 132, 38.9] },
    { id: "japan", name: "일본", nameEn: "JAPAN", view: [123, 24, 146, 44] },
    { id: "oceania", name: "오세아니아", nameEn: "OCEANIA", view: [108, -48, 182, -8] },
    { id: "north_america", name: "북미", nameEn: "NORTH AMERICA", view: [-165, 14, -55, 52] },
    { id: "central_america", name: "멕시코 · 중미", nameEn: "CENTRAL AMERICA", view: [-122, 0, -74, 34] },
    { id: "indian_ocean", name: "인도양", nameEn: "INDIAN OCEAN", view: [38, -28, 90, 10] },
    { id: "europe", name: "유럽", nameEn: "EUROPE", view: [-36, 24, 34, 74] },
    { id: "africa", name: "아프리카", nameEn: "AFRICA", view: [4, -38, 60, 0] }
];

/* 대한민국 SUMMER TUNA FIELD 공통 설정 (시즌 월은 자유롭게 변경 가능) */
SHARK_DATA.koreaTunaSeason = { months: [7, 8, 9, 10], hitBoost: 1.8, trophyBoost: 1.4, offSeasonHit: 0.35 };

SHARK_DATA.regions = [
    /* ================= 대한민국 ================= */
    {
        id: "wangdolcho", country: "대한민국", name: "왕돌초", nameEn: "Wangdolcho",
        area: "korea", continent: "Asia", lat: 36.72, lon: 129.73,
        difficulty: 2, depthMin: 30, depthMax: 120,
        mainFish: ["amberjack", "yellowtail", "spanish_mackerel"], trophyFish: ["amberjack"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "동해 한가운데 거대한 수중 암초. 대한민국 부시리 지깅의 성지."
    },
    {
        id: "jeju", country: "대한민국", name: "제주", nameEn: "Jeju",
        area: "korea", continent: "Asia", lat: 33.05, lon: 126.3,
        difficulty: 2, depthMin: 20, depthMax: 100,
        mainFish: ["amberjack", "yellowtail", "tuna", "squid", "spanish_mackerel"], trophyFish: ["yellowtail", "tuna"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        tunaSeason: SHARK_DATA.koreaTunaSeason,
        description: "사계절 대물의 섬. 겨울 대방어, 여름엔 SUMMER TUNA FIELD로 변신."
    },
    {
        id: "chujado", country: "대한민국", name: "추자도", nameEn: "Chujado",
        area: "korea", continent: "Asia", lat: 33.95, lon: 126.3,
        difficulty: 2, depthMin: 20, depthMax: 80,
        mainFish: ["amberjack", "yellowtail", "squid", "spanish_mackerel"], trophyFish: ["amberjack"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "조류가 빠른 남해의 명소. 부시리 캐스팅 게임으로 유명하다."
    },
    {
        id: "tongyeong", country: "대한민국", name: "통영", nameEn: "Tongyeong",
        area: "korea", continent: "Asia", lat: 34.72, lon: 128.42,
        difficulty: 1, depthMin: 10, depthMax: 50,
        mainFish: ["squid", "octopus", "spanish_mackerel"], trophyFish: ["squid"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "잔잔한 다도해. 무늬오징어 에깅과 주꾸미 선상낚시 입문 필드."
    },
    {
        id: "geoje", country: "대한민국", name: "거제", nameEn: "Geoje",
        area: "korea", continent: "Asia", lat: 34.78, lon: 128.75,
        difficulty: 1, depthMin: 15, depthMax: 70,
        mainFish: ["amberjack", "squid", "octopus", "spanish_mackerel"], trophyFish: [],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "가까운 거리, 다양한 어종. 처음 바다낚시를 시작하기 좋은 곳."
    },
    {
        id: "yeosu", country: "대한민국", name: "여수", nameEn: "Yeosu",
        area: "korea", continent: "Asia", lat: 34.55, lon: 127.75,
        difficulty: 1, depthMin: 10, depthMax: 60,
        mainFish: ["octopus", "squid", "spanish_mackerel", "amberjack"], trophyFish: ["octopus"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "가을 주꾸미와 삼치 캐스팅의 메카."
    },
    {
        id: "wando", country: "대한민국", name: "완도", nameEn: "Wando",
        area: "korea", continent: "Asia", lat: 34.22, lon: 126.82,
        difficulty: 2, depthMin: 15, depthMax: 70,
        mainFish: ["amberjack", "squid", "spanish_mackerel"], trophyFish: ["spanish_mackerel"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "남해 서부의 대삼치 명소. 가을 나부라를 노려라."
    },
    {
        id: "donghae", country: "대한민국", name: "동해", nameEn: "East Sea",
        area: "korea", continent: "Asia", lat: 37.6, lon: 129.45,
        difficulty: 3, depthMin: 30, depthMax: 150,
        mainFish: ["yellowtail", "amberjack", "tuna"], trophyFish: ["tuna"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        tunaSeason: SHARK_DATA.koreaTunaSeason,
        description: "깊고 푸른 동해. 여름이면 참치 무리가 회유하는 SUMMER TUNA FIELD."
    },
    {
        id: "namhae", country: "대한민국", name: "남해", nameEn: "South Sea",
        area: "korea", continent: "Asia", lat: 34.25, lon: 128.05,
        difficulty: 2, depthMin: 20, depthMax: 90,
        mainFish: ["amberjack", "spanish_mackerel", "tuna", "squid"], trophyFish: ["tuna"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        tunaSeason: SHARK_DATA.koreaTunaSeason,
        description: "따뜻한 쿠로시오 지류. 여름 참치 나부라가 터지는 SUMMER TUNA FIELD."
    },
    {
        id: "seohae", country: "대한민국", name: "서해", nameEn: "West Sea",
        area: "korea", continent: "Asia", lat: 36.25, lon: 125.85,
        difficulty: 1, depthMin: 10, depthMax: 40,
        mainFish: ["octopus", "spanish_mackerel"], trophyFish: ["octopus"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "가을 주꾸미 대박 필드. 누구나 쉽게 손맛을 볼 수 있다."
    },

    /* ================= 일본 ================= */
    {
        id: "okinawa", country: "일본", name: "오키나와", nameEn: "Okinawa",
        area: "japan", continent: "Asia", lat: 26.3, lon: 127.55,
        difficulty: 4, depthMin: 40, depthMax: 200,
        mainFish: ["gt", "dogtooth", "yellowfin", "mahimahi", "wahoo"], trophyFish: ["dogtooth"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "산호초와 깊은 드롭오프. 이빨참치와 GT의 무대."
    },
    {
        id: "goto", country: "일본", name: "고토열도", nameEn: "Goto Islands",
        area: "japan", continent: "Asia", lat: 32.75, lon: 128.65,
        difficulty: 3, depthMin: 30, depthMax: 130,
        mainFish: ["amberjack", "yellowtail", "tuna"], trophyFish: ["amberjack"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "대형 히라마사(부시리)의 고향. 거친 조류 속 대물 승부."
    },
    {
        id: "danjo", country: "일본", name: "남녀군도", nameEn: "Danjo Islands",
        area: "japan", continent: "Asia", lat: 31.95, lon: 128.35,
        difficulty: 4, depthMin: 40, depthMax: 150,
        mainFish: ["amberjack", "yellowtail", "tuna", "gt"], trophyFish: ["amberjack", "yellowtail"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "사람의 손이 닿지 않은 무인도 군도. 몬스터 부시리 전설의 장소."
    },
    {
        id: "tsugaru", country: "일본", name: "쓰가루 해협", nameEn: "Tsugaru Strait",
        area: "japan", continent: "Asia", lat: 41.5, lon: 140.8,
        difficulty: 5, depthMin: 50, depthMax: 200,
        mainFish: ["tuna", "yellowtail", "cod"], trophyFish: ["tuna"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "세계적인 대형 참다랑어 산지. 거센 해류 속 몬스터 참치와의 사투."
    },

    /* ================= 대만 ================= */
    {
        id: "taiwan_east", country: "대만", name: "대만 동부", nameEn: "East Taiwan",
        area: "korea", continent: "Asia", lat: 23.3, lon: 121.75,
        difficulty: 3, depthMin: 40, depthMax: 200,
        mainFish: ["gt", "yellowfin", "mahimahi", "wahoo", "sailfish"], trophyFish: ["sailfish"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "쿠로시오 본류가 스치는 태평양 연안. 회유어의 고속도로."
    },
    {
        id: "penghu", country: "대만", name: "펑후", nameEn: "Penghu",
        area: "korea", continent: "Asia", lat: 23.55, lon: 119.4,
        difficulty: 2, depthMin: 20, depthMax: 60,
        mainFish: ["gt", "amberjack", "snapper"], trophyFish: ["gt"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "대만 해협의 섬. 얕은 리프에서 GT와 부시리를 노린다."
    },

    /* ================= 호주 ================= */
    {
        id: "queensland", country: "호주", name: "Queensland", nameEn: "Queensland",
        area: "oceania", continent: "Oceania", lat: -26.6, lon: 153.6,
        difficulty: 2, depthMin: 30, depthMax: 120,
        mainFish: ["snapper", "kingfish", "mahimahi", "wahoo"], trophyFish: ["snapper"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "선샤인 코스트 앞바다. 스내퍼와 킹피시의 천국."
    },
    {
        id: "gbr", country: "호주", name: "Great Barrier Reef", nameEn: "Great Barrier Reef",
        area: "oceania", continent: "Oceania", lat: -17.0, lon: 147.2,
        difficulty: 4, depthMin: 30, depthMax: 150,
        mainFish: ["gt", "dogtooth", "sailfish", "marlin", "mahimahi", "wahoo"], trophyFish: ["marlin", "gt"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "세계 최대의 산호초. 블랙 말린과 GT의 성지."
    },
    {
        id: "western_australia", country: "호주", name: "Western Australia", nameEn: "Western Australia",
        area: "oceania", continent: "Oceania", lat: -21.8, lon: 113.6,
        difficulty: 3, depthMin: 30, depthMax: 150,
        mainFish: ["gt", "sailfish", "marlin", "wahoo", "snapper"], trophyFish: ["sailfish"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "닝갈루 리프와 엑스머스. 돛새치 무리가 몰려오는 곳."
    },

    /* ================= 뉴질랜드 ================= */
    {
        id: "bay_of_islands", country: "뉴질랜드", name: "Bay of Islands", nameEn: "Bay of Islands",
        area: "oceania", continent: "Oceania", lat: -35.0, lon: 174.6,
        difficulty: 3, depthMin: 30, depthMax: 120,
        mainFish: ["kingfish", "marlin", "snapper", "yellowfin"], trophyFish: ["kingfish"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "킹피시 지깅의 세계적인 명소. 대형 스내퍼도 함께."
    },
    {
        id: "north_island", country: "뉴질랜드", name: "North Island", nameEn: "North Island",
        area: "oceania", continent: "Oceania", lat: -37.4, lon: 177.2,
        difficulty: 4, depthMin: 30, depthMax: 150,
        mainFish: ["bluefin", "yellowfin", "kingfish", "snapper", "marlin"], trophyFish: ["bluefin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 남방 참다랑어와 황다랑어가 함께 나오는 북섬 동부."
    },
    {
        id: "nz_west_coast", country: "뉴질랜드", name: "West Coast", nameEn: "West Coast",
        area: "oceania", continent: "Oceania", lat: -42.2, lon: 170.4,
        difficulty: 5, depthMin: 40, depthMax: 180,
        mainFish: ["bluefin", "kingfish"], trophyFish: ["bluefin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 거친 태즈먼 해의 겨울, 몬스터 블루핀의 바다."
    },

    /* ================= 미국 ================= */
    {
        id: "hawaii", country: "미국", name: "Hawaii", nameEn: "Hawaii (Kona)",
        area: "north_america", continent: "North America", lat: 19.6, lon: -156.3,
        difficulty: 4, depthMin: 50, depthMax: 200,
        mainFish: ["yellowfin", "marlin", "mahimahi", "wahoo", "gt"], trophyFish: ["yellowfin", "marlin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 코나의 깊고 푸른 바다. 대형 황다랑어(Ahi)의 성지."
    },
    {
        id: "san_diego", country: "미국", name: "San Diego", nameEn: "San Diego",
        area: "north_america", continent: "North America", lat: 32.5, lon: -117.6,
        difficulty: 3, depthMin: 30, depthMax: 150,
        mainFish: ["bluefin", "yellowfin", "kingfish", "halibut"], trophyFish: ["bluefin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 장거리 원정선의 출발지. 블루핀과 옐로핀을 동시에."
    },
    {
        id: "cape_cod", country: "미국", name: "Cape Cod", nameEn: "Cape Cod",
        area: "north_america", continent: "North America", lat: 41.6, lon: -69.6,
        difficulty: 4, depthMin: 30, depthMax: 120,
        mainFish: ["bluefin", "cod"], trophyFish: ["bluefin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 대서양 자이언트 블루핀 캐스팅의 본고장."
    },
    {
        id: "outer_banks", country: "미국", name: "Outer Banks", nameEn: "Outer Banks",
        area: "north_america", continent: "North America", lat: 35.2, lon: -75.0,
        difficulty: 3, depthMin: 30, depthMax: 150,
        mainFish: ["yellowfin", "bluefin", "mahimahi", "wahoo", "sailfish"], trophyFish: ["bluefin"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "걸프스트림이 지나는 노스캐롤라이나 연안. 겨울 블루핀으로 유명."
    },
    {
        id: "louisiana_gulf", country: "미국", name: "Louisiana Gulf", nameEn: "Louisiana Gulf",
        area: "north_america", continent: "North America", lat: 28.6, lon: -89.8,
        difficulty: 3, depthMin: 40, depthMax: 200,
        mainFish: ["yellowfin", "snapper", "wahoo", "marlin"], trophyFish: ["yellowfin"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "멕시코만 오일리그 주변. 황다랑어와 레드 스내퍼의 보고."
    },

    /* ================= 캐나다 ================= */
    {
        id: "nova_scotia", country: "캐나다", name: "Nova Scotia", nameEn: "Nova Scotia",
        area: "north_america", continent: "North America", lat: 44.2, lon: -63.2,
        difficulty: 5, depthMin: 30, depthMax: 150,
        mainFish: ["bluefin", "cod", "halibut"], trophyFish: ["bluefin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 300kg급 Giant Bluefin Tuna가 회유하는 북대서양."
    },
    {
        id: "pei", country: "캐나다", name: "Prince Edward Island", nameEn: "Prince Edward Island",
        area: "north_america", continent: "North America", lat: 46.8, lon: -63.0,
        difficulty: 5, depthMin: 20, depthMax: 80,
        mainFish: ["bluefin", "cod"], trophyFish: ["bluefin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 세계 최대급 블루핀이 잡히는 '자이언트의 섬'."
    },

    /* ================= 멕시코 ================= */
    {
        id: "cabo", country: "멕시코", name: "Cabo San Lucas", nameEn: "Cabo San Lucas",
        area: "central_america", continent: "North America", lat: 22.6, lon: -110.0,
        difficulty: 3, depthMin: 40, depthMax: 200,
        mainFish: ["yellowfin", "marlin", "roosterfish", "mahimahi", "wahoo"], trophyFish: ["marlin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 세계 빌피시의 수도. 대형 옐로핀도 함께."
    },
    {
        id: "puerto_vallarta", country: "멕시코", name: "Puerto Vallarta", nameEn: "Puerto Vallarta",
        area: "central_america", continent: "North America", lat: 20.5, lon: -105.7,
        difficulty: 3, depthMin: 30, depthMax: 150,
        mainFish: ["yellowfin", "roosterfish", "sailfish", "mahimahi", "marlin"], trophyFish: ["yellowfin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 반데라스 만 앞바다, 100kg이 넘는 대형 옐로핀의 전설."
    },
    {
        id: "baja_california", country: "멕시코", name: "Baja California", nameEn: "Baja California",
        area: "central_america", continent: "North America", lat: 29.0, lon: -116.4,
        difficulty: 3, depthMin: 30, depthMax: 120,
        mainFish: ["kingfish", "yellowfin", "bluefin", "roosterfish"], trophyFish: ["kingfish"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "끝없이 이어지는 바하 반도. 대형 옐로테일(킹피시)의 바다."
    },

    /* ================= 중미 ================= */
    {
        id: "panama", country: "파나마", name: "Panama", nameEn: "Panama",
        area: "central_america", continent: "Central America", lat: 7.3, lon: -80.4,
        difficulty: 4, depthMin: 30, depthMax: 150,
        mainFish: ["yellowfin", "roosterfish", "marlin", "sailfish", "snapper"], trophyFish: ["yellowfin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 태평양 쪽 섬들 주변, 거대한 옐로핀 무리."
    },
    {
        id: "costa_rica", country: "코스타리카", name: "Costa Rica", nameEn: "Costa Rica",
        area: "central_america", continent: "Central America", lat: 9.4, lon: -85.9,
        difficulty: 3, depthMin: 30, depthMax: 150,
        mainFish: ["sailfish", "yellowfin", "roosterfish", "marlin", "mahimahi"], trophyFish: ["sailfish"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 돛새치와 옐로핀이 동시에 터지는 중미의 보석."
    },

    /* ================= 인도양 ================= */
    {
        id: "maldives", country: "몰디브", name: "Maldives", nameEn: "Maldives",
        area: "indian_ocean", continent: "Indian Ocean", lat: 3.2, lon: 73.6,
        difficulty: 4, depthMin: 40, depthMax: 200,
        mainFish: ["gt", "dogtooth", "yellowfin", "sailfish", "wahoo"], trophyFish: ["dogtooth", "gt"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 환초의 드롭오프. 옐로핀과 이빨참치의 낙원."
    },
    {
        id: "seychelles", country: "세이셸", name: "Seychelles", nameEn: "Seychelles",
        area: "indian_ocean", continent: "Indian Ocean", lat: -4.9, lon: 56.0,
        difficulty: 4, depthMin: 30, depthMax: 180,
        mainFish: ["gt", "dogtooth", "yellowfin", "sailfish", "wahoo"], trophyFish: ["gt"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "세계 최고의 GT 포핑 필드. 거대한 GT가 수면을 폭파한다."
    },
    {
        id: "mauritius", country: "모리셔스", name: "Mauritius", nameEn: "Mauritius",
        area: "indian_ocean", continent: "Indian Ocean", lat: -20.5, lon: 57.0,
        difficulty: 4, depthMin: 50, depthMax: 200,
        mainFish: ["marlin", "yellowfin", "dogtooth", "wahoo", "gt"], trophyFish: ["marlin"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "인도양 빌피시의 명소. 섬 바로 앞이 수백 미터 수심."
    },

    /* ================= 유럽 ================= */
    {
        id: "norway", country: "노르웨이", name: "Norway", nameEn: "Norway (Lofoten)",
        area: "europe", continent: "Europe", lat: 68.4, lon: 12.8,
        difficulty: 3, depthMin: 40, depthMax: 200,
        mainFish: ["cod", "halibut", "bluefin"], trophyFish: ["cod", "halibut"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "로포텐의 겨울 스크레이 대구와 거대 할리벗. 최근엔 블루핀도 돌아왔다."
    },
    {
        id: "iceland", country: "아이슬란드", name: "Iceland", nameEn: "Iceland",
        area: "europe", continent: "Europe", lat: 64.3, lon: -23.6,
        difficulty: 3, depthMin: 40, depthMax: 180,
        mainFish: ["cod", "halibut"], trophyFish: ["halibut"],
        fishingTypes: ["jigging"], unlocked: true,
        description: "북극권의 차가운 바다. 백야 아래 대구와 할리벗 지깅."
    },
    {
        id: "azores", country: "포르투갈", name: "Azores", nameEn: "Azores",
        area: "europe", continent: "Europe", lat: 38.4, lon: -28.6,
        difficulty: 4, depthMin: 50, depthMax: 200,
        mainFish: ["bigeye", "bluefin", "marlin", "wahoo"], trophyFish: ["bigeye"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 대서양 한가운데 화산섬. 빅아이와 블루핀의 회유로."
    },
    {
        id: "canary", country: "스페인", name: "Canary Islands", nameEn: "Canary Islands",
        area: "europe", continent: "Europe", lat: 28.0, lon: -16.9,
        difficulty: 4, depthMin: 50, depthMax: 200,
        mainFish: ["bluefin", "bigeye", "marlin", "wahoo"], trophyFish: ["bluefin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 봄철 대형 블루핀이 지나가는 아프리카 앞바다의 섬."
    },
    {
        id: "mediterranean", country: "지중해", name: "Mediterranean", nameEn: "Mediterranean",
        area: "europe", continent: "Europe", lat: 38.6, lon: 5.0,
        difficulty: 3, depthMin: 30, depthMax: 150,
        mainFish: ["bluefin", "amberjack", "mahimahi"], trophyFish: ["bluefin"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "블루핀 참치의 산란장. 여름 수면 보일링을 노려라."
    },

    /* ================= 아프리카 ================= */
    {
        id: "cape_town", country: "남아프리카공화국", name: "Cape Town", nameEn: "Cape Town",
        area: "africa", continent: "Africa", lat: -34.6, lon: 18.0,
        difficulty: 4, depthMin: 40, depthMax: 200,
        mainFish: ["yellowfin", "kingfish"], trophyFish: ["yellowfin"],
        fishingTypes: ["jigging", "casting"], unlocked: false, expedition: true,
        description: "TUNA EXPEDITION - 희망봉 앞 거친 바다. 대형 옐로핀 캐스팅."
    },
    {
        id: "mozambique", country: "모잠비크", name: "Mozambique", nameEn: "Mozambique",
        area: "africa", continent: "Africa", lat: -23.9, lon: 35.9,
        difficulty: 4, depthMin: 40, depthMax: 200,
        mainFish: ["gt", "marlin", "sailfish", "wahoo", "dogtooth", "yellowfin"], trophyFish: ["gt"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "인도양 해안의 야생 필드. 사람 손이 덜 탄 대물 천국."
    },
    {
        id: "madagascar", country: "마다가스카르", name: "Madagascar", nameEn: "Madagascar",
        area: "africa", continent: "Africa", lat: -13.2, lon: 47.6,
        difficulty: 4, depthMin: 30, depthMax: 180,
        mainFish: ["gt", "dogtooth", "yellowfin", "sailfish"], trophyFish: ["dogtooth"],
        fishingTypes: ["jigging", "casting"], unlocked: true,
        description: "노지베 주변 해역. 이빨참치 지깅과 GT 포핑의 숨은 명소."
    }
];
