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
    EXPEDITION_UNLOCK_CATCHES: 3,

    /* 난이도 (하 · 중 · 상) - 메인 메뉴에서 선택, 브라우저에 저장됩니다.
       중(normal) 이 기본 밸런스. 숫자를 바꾸면 그 난이도의 밸런스가 바뀝니다.
       - gearBase / runOut / reelSpeed / drainRest / drainRun / recover / breakGrace : js/battle.js 의 TUNE 값을 덮어씀
       - tension    : 감거나 질주할 때 텐션이 올라가는 배율 (높을수록 라인이 잘 터짐)
       - slackLimit : 라인이 느슨한 채로 버틸 수 있는 시간(초). 넘으면 바늘 빠짐
       - finalPower : 배 근처 마지막 저항의 힘
       - hitRate    : 입질 확률 배율
       - gaugeSpeed : 캐스팅 거리 게이지 속도 배율
       - luck       : 대물 확률 배율 (어려울수록 보상) */
    DIFFICULTY: {
        easy: {
            label: "하", labelEn: "EASY", desc: "입문 · 넉넉한 텐션", descEn: "Beginner · forgiving tension",
            gearBase: 2.9, runOut: 1.0, reelSpeed: 1.55, drainRest: 3.6, drainRun: 4.0, recover: 1.8, breakGrace: 0.7,
            tension: 0.88, slackLimit: 3.6, finalPower: 1.0, hitRate: 1.35, gaugeSpeed: 0.8, luck: 0.9
        },
        normal: {
            label: "중", labelEn: "NORMAL", desc: "기본 밸런스", descEn: "Standard balance",
            gearBase: 2.4, runOut: 1.25, reelSpeed: 1.3, drainRest: 2.9, drainRun: 3.3, recover: 2.5, breakGrace: 0.3,
            tension: 1.0, slackLimit: 2.6, finalPower: 1.2, hitRate: 1.0, gaugeSpeed: 1.0, luck: 1.0
        },
        hard: {
            label: "상", labelEn: "HARD", desc: "고수용 · 대물 확률 UP", descEn: "Expert · more trophy fish",
            gearBase: 2.15, runOut: 1.4, reelSpeed: 1.15, drainRest: 2.5, drainRun: 2.9, recover: 3.0, breakGrace: 0.2,
            tension: 1.07, slackLimit: 2.0, finalPower: 1.4, hitRate: 0.75, gaugeSpeed: 1.4, luck: 1.35
        }
    },
    DEFAULT_DIFFICULTY: "normal",

    /* 손맛(진동): 파이팅 중 휴대폰 진동 세기 배율 (0 이면 끔, 1 기본) */
    HAPTIC_STRENGTH: 1
};
