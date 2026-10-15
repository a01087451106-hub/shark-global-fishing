/* =========================================================
   🆕 업데이트 소식 (news-data.js)
   ---------------------------------------------------------
   ★ 새 업데이트를 알리려면 맨 위에 { ... } 블록 하나를 추가하세요.
   - id    : 숫자. 새 소식일수록 크게 (게임에 들어오면 처음 한 번 자동으로 보여줌)
   - date  : 날짜
   - items : [아이콘, 제목, 설명, 영어 제목, 영어 설명]
   ========================================================= */
window.SHARK_DATA = window.SHARK_DATA || {};

SHARK_DATA.news = [
    {
        id: 9, date: "2026.10.15",
        items: [
            ["📡", "실시간 바다 날씨", "지역마다 지금 실제 날씨 · 바람 · 파고 · 수온이 입질에 반영돼요. 비 오는 날은 입질 활발, 풍랑엔 입질 ↓ 대물 ↑!", "Live sea weather", "Real weather, wind, waves and water temperature now affect bites in every region."],
            ["🌙", "물때 반영", "한국 물때표(서해 7물때식 · 동해 · 남해 8물때식)대로 계산해요. 물이 잘 가는 사리 무렵엔 입질 UP, 조금엔 DOWN.", "Real tides", "Tides follow the moon. Spring tides boost bites, neap tides slow them down."],
            ["🌅", "피딩타임", "현지 시각 해 뜰 무렵 · 해 질 무렵엔 입질이 확 살아나요!", "Feeding time", "Bites pick up at local dawn and dusk!"]
        ]
    },
    {
        id: 8, date: "2026.10.15",
        items: [
            ["📳", "손맛 진동 강화", "안드로이드 폰에서 진동이 항상 켜지고, 더 또렷하게 느껴지도록 바꿨어요. (아이폰은 웹 진동 미지원)", "Stronger vibration", "Vibration is now always on and stronger on Android phones. (Not supported on iPhone)"]
        ]
    },
    {
        id: 7, date: "2026.10.15",
        items: [
            ["🔐", "로그인 · 기기끼리 이어하기", "오른쪽 위 '로그인'으로 가입하면 컴퓨터 · 핸드폰 어디서든 같은 기록으로 이어서 할 수 있어요.", "Log in & play anywhere", "Log in (top right) to keep the same progress on your computer and phone."],
            ["🏅", "어종별 랭킹", "로그인한 뒤 잡은 물고기는 어종별 최대어 랭킹에 올라가요. 1등에 도전하세요!", "Species rankings", "Fish you catch while logged in go on the species leaderboard. Go for #1!"],
            ["📡", "실시간 대물 소식", "누군가 BIG 이상 대물을 잡으면 화면 아래에 바로 소식이 떠요.", "Live big-catch news", "When anyone lands a BIG or better, it shows up at the bottom of the screen."]
        ]
    },
    {
        id: 6, date: "2026.10.15",
        items: [
            ["📅", "출석체크", "매일 접속하면 골드를 드려요. 7일 연속이면 50,000G!", "Daily check-in", "Log in every day for gold. 7 days in a row = 50,000G!"],
            ["📣", "지깅클럽에 자랑하기", "결과 화면과 인증샷 카드에서 지깅클럽(네이버 카페)으로 바로 자랑할 수 있어요.", "Brag on Jigging Club", "Share your catch on Jigging Club right from the result screen and trophy card."],
            ["🆕", "업데이트 소식", "새로 바뀐 점을 이 창에서 알려드려요. 메뉴의 🆕 버튼으로 언제든 다시 볼 수 있어요.", "Update news", "See what's new here anytime with the 🆕 button in the menu."]
        ]
    },
    {
        id: 5, date: "2026.10.15",
        items: [
            ["💥", "라인 브레이크 현실화", "RUN이나 헤드쉐이크 때 계속 감으면 라인이 터져요! 난이도가 높을수록 더 빨리 손을 떼야 해요.", "Realistic line breaks", "Keep reeling during a RUN or head shake and the line snaps! Higher difficulty = faster reactions needed."],
            ["📸", "인증샷 카드 저장 개선", "카카오톡 안에서는 카드 사진을 길게 눌러 저장할 수 있어요.", "Easier card saving", "In KakaoTalk, press and hold the card image to save it."]
        ]
    },
    {
        id: 4, date: "2026.10.15",
        items: [
            ["🎖", "업적 · 칭호 20종", "첫 참치, 30kg 클럽, 도감 마스터... 달성하면 보너스 골드와 칭호를 받아요.", "20 achievements & titles", "First Tuna, 30kg Club, Fish Guide Master... earn bonus gold and titles."],
            ["📸", "트로피 인증샷 카드", "큰 고기를 잡으면 인증샷 카드를 만들어 카톡 · 인스타로 자랑하세요!", "Trophy card", "Make a trophy card of your big catch and share it!"]
        ]
    },
    {
        id: 3, date: "2026.10.15",
        items: [
            ["💰", "골드 · 장비 구매", "잡은 물고기를 팔아 골드를 모으고, 더 강한 낚시대 · 릴을 사세요.", "Gold & gear shop", "Sell your catch for gold and buy stronger rods and reels."],
            ["🥇", "어종별 메달", "브론즈 → 실버 → 골드 → 레전드. 신기록이면 판매가 ×2!", "Species medals", "Bronze → Silver → Gold → Legend. New record = sale ×2!"]
        ]
    },
    {
        id: 2, date: "2026.10.15",
        items: [
            ["🎣", "손맛 연출 강화", "드랙이 차고 나갈 때 화면 떨림, 낚싯대 휘어짐, 헤드쉐이크 '쿵!', 랜딩 슬로우모션.", "Better fight feel", "Screen shake on runs, bending rod, head-shake thumps, slow-motion landing."],
            ["🌊", "'보일링' 표기", "캐스팅의 '나부라'를 '보일링'으로 바꿨어요.", "'Boiling' wording", "Renamed surface boils to 'boiling' in Korean."]
        ]
    }
];
