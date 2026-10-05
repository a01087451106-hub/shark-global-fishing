/* =========================================================
   SHARK GLOBAL FISHING - 사이트 설정
   ---------------------------------------------------------
   외부 링크 주소는 반드시 이 파일 한 곳에서만 관리합니다.
   여기 주소를 바꾸면 사이트 전체(상단 메뉴, 첫 화면 버튼,
   장비의 "지깅몰에서 보기" 기본 주소)에 바로 적용됩니다.
   ========================================================= */
const CONFIG = {
    JIGGING_MALL_URL: "https://www.jiggingmall.com/",
    NAVER_CAFE_URL: "https://cafe.naver.com/jiggingclub1",
    YOUTUBE_URL: "https://www.youtube.com/@shark_SHIN",

    /* 지깅몰 낚시대 카테고리 (상품 상세 주소가 없는 낚시대는 여기로 이동) */
    JIGGING_ROD_CATEGORY_URL: "https://www.jiggingmall.com/goods/goods_list.php?cateCd=002007",
    POPPING_ROD_CATEGORY_URL: "https://www.jiggingmall.com/goods/goods_list.php?cateCd=002003",

    /* 지깅 수심 (m) - DROP 한 번에 한 단계씩 내려갑니다 */
    JIG_DEPTHS: [20, 30, 40, 50, 60],

    /* 게임 이름 / 브랜드 */
    TITLE: "SHARK GLOBAL FISHING",
    TITLE_KO: "샤크 글로벌 피싱",
    SUBTITLE: "WORLD SALTWATER FISHING GAME",
    BRAND: "SHARK COMPANY",
    BRAND_KO: "샤크 신동만",

    /* 시즌 테스트용: null 이면 오늘 날짜의 '월'을 사용합니다.
       예) 8 로 바꾸면 항상 8월(참치 시즌)로 게임이 진행됩니다. */
    SEASON_MONTH: null,

    /* 해외 TUNA EXPEDITION 필드를 열기 위해 필요한 총 조과(마리) */
    EXPEDITION_UNLOCK_CATCHES: 3
};
