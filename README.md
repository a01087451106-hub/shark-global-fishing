# SHARK GLOBAL FISHING · 샤크 글로벌 피싱

**WORLD SALTWATER FISHING GAME**
SHARK COMPANY · 샤크 신동만

전 세계 바다에서 최고의 한 마리를 잡아라!
PC와 스마트폰에서 모두 플레이할 수 있는 바다낚시 정적 웹게임입니다.
(HTML + CSS + JavaScript만 사용 · 회원가입/로그인/서버/DB 없음)

---

## 1. 실행 방법

### 방법 A: 더블클릭 (가장 쉬움)
`index.html` 파일을 더블클릭하면 브라우저에서 바로 실행됩니다.

### 방법 B: VS Code Live Server
1. VS Code에서 `shark-global-fishing` 폴더를 엽니다.
2. 확장 프로그램 **Live Server**를 설치합니다.
3. `index.html`을 마우스 오른쪽 버튼으로 클릭하고 **Open with Live Server**를 누릅니다.

> 데이터는 JSON이 아니라 JavaScript 파일(`data/*.js`)로 만들어서
> `file://` 환경(더블클릭)에서도 문제없이 작동합니다.

---

## 2. 게임 흐름

```
YouTube 채널 방문 → GAME START
→ 세계지도에서 지역 선택 → 잡을 물고기 선택 → CASTING / JIGGING 선택
→ 낚시대 → 릴 → 루어 (또는 ⭐ 추천 장비로 시작)
→ 낚시 → HIT → 파이팅 → 랜딩 → 기록 저장
```

| 조작 | 스마트폰 | PC |
|---|---|---|
| 지깅 DROP (한 단계 아래) | DROP 버튼 | `Space` / `↓` |
| 지깅 JERK | 주황 버튼 (톡! 톡!) | `J` |
| 지깅 REEL (한 단계 위) | REEL 버튼 | `R` / `↑` |
| 캐스팅 CAST / STOP | 큰 버튼 터치 | `Space` |
| 캐스팅 ACTION | 주황 버튼 (리듬있게) | `J` |
| 캐스팅 REEL · 파이팅 REEL | 파란 버튼 **누르고 있기** | `Space` 누르고 있기 |

**지깅 수심:** 지깅은 **20 · 30 · 40 · 50 · 60m** 다섯 단계만 사용합니다 (`js/config.js` 의 `JIG_DEPTHS`).
화면 왼쪽 위 **SONAR**에 `TARGET DEPTH`(어군 수심)와 `JIG DEPTH`(지그 수심)가 표시됩니다.
DROP을 누를 때마다 한 단계씩 내려가고(60m 아래로는 내려가지 않음), REEL은 한 단계씩 올립니다.
목표수심에 맞으면 **DEPTH MATCH! 수심 적중!** → JERK 입질 확률이 크게 올라갑니다.

**파이팅 요령:** 물고기가 쉴 때는 REEL을 누르고 있고, 화면에 **RUN!** 이 나오면 손을 뗍니다.
텐션 바가 빨간색인 상태가 이어지면 라인이 끊어지고, 너무 오래 안 감으면 바늘이 빠집니다.

---

## 3. 폴더 구조

```
shark-global-fishing/
├─ index.html            화면 구조 (보통은 수정할 필요 없음)
├─ README.md
├─ css/
│   ├─ style.css         기본 디자인
│   ├─ responsive.css    스마트폰/태블릿
│   └─ animations.css    애니메이션 (HIT, 화면 흔들림 등)
├─ js/
│   ├─ config.js         ★ 외부 링크 주소 (지깅몰 / 카페 / YouTube)
│   ├─ i18n.js           한국어 / 영어 전환 (한국 외 국가 접속 시 영어)
│   ├─ app.js            화면 이동, 메뉴, 결과창
│   ├─ game.js           시즌, 히트 확률, 크기/등급 계산
│   ├─ world.js          SVG 세계지도
│   ├─ fishing.js        낚시 화면 (DROP/JERK/REEL, CAST)
│   ├─ scene.js          사실적인 화면 그리기 (바다·배·물고기)
│   ├─ battle.js         파이팅
│   ├─ equipment.js      장비 카드, 추천 장비, 루어 자동 필터
│   ├─ records.js        최대어 / 도감
│   ├─ storage.js        localStorage 저장
│   ├─ audio.js          효과음 (Web Audio로 합성, 음원 파일 불필요)
│   ├─ haptic.js         손맛 진동 (파이팅 중 휴대폰 진동 / 게임패드)
│   └─ utils.js          공용 함수, 물고기/장비 그림
├─ data/
│   ├─ fish-data.js      ★ 물고기
│   ├─ region-data.js    ★ 낚시 지역
│   ├─ equipment-data.js ★ 낚시대 / 릴
│   └─ lure-data.js      ★ 루어
└─ assets/
    ├─ images/ (fish, equipment, regions, boats, ui)
    └─ sounds/ (sea, reel, drag, hit, landing)  ← 나중에 실제 음원을 넣을 자리
```

---

## 4. 링크 주소 바꾸기

모든 외부 링크는 **`js/config.js` 한 곳**에서 관리합니다.

```js
const CONFIG = {
    JIGGING_MALL_URL: "https://www.jiggingmall.com/",
    NAVER_CAFE_URL: "https://cafe.naver.com/jiggingclub1",
    YOUTUBE_URL: "https://www.youtube.com/@shark_SHIN",
    ...
};
```

여기만 바꾸면 상단 메뉴, 첫 화면 YouTube 버튼, 장비의 "지깅몰" 기본 주소까지 모두 바뀝니다.
모든 외부 링크는 새 창(`target="_blank"`, `rel="noopener noreferrer"`)으로 열립니다.

---

## 5. ★ 새 지깅몰 상품 추가하는 방법 (초보자용)

**HTML은 수정할 필요가 없습니다.** 데이터 파일만 고치면 됩니다.

### 5-1. 루어 추가 → `data/lure-data.js`

1. VS Code에서 `data/lure-data.js`를 엽니다.
2. 비슷한 루어 블록 하나를 `{` 부터 `},` 까지 복사합니다.
3. 목록 안 아무 곳에 붙여넣고 값을 바꿉니다.

```js
{
    id: "my_new_jig_250",                 // 영어/숫자/밑줄. 다른 상품과 겹치면 안 됨!
    name: "새 메탈지그 250g",              // 화면에 보이는 이름
    brand: "SEADROP",
    type: "METAL JIG",                    // 화면에 보이는 종류
    fishingMethod: "jigging",             // 펜슬이면 "casting", 메탈지그면 "jigging"
    weight: 250,                          // 모르면 null
    targetFish: ["amberjack", "tuna"],    // 대상어 id (아래 표 참고)
    recommendedRegions: ["wangdolcho"],   // 추천 지역 id
    image: "assets/images/equipment/my_new_jig.jpg",  // 사진 (없으면 "")
    purchaseUrl: "https://www.jiggingmall.com/...",   // 상품 주소 (없으면 "")
    gamePower: 4,                         // 게임용 어필력 1~5
    gameAction: "하이피치 슬라이드",        // 게임용 액션 이름
    rarityBonus: 0.1,                     // 대물 보너스 0 ~ 0.3
    color: "#4fa3d9"                      // 사진이 없을 때 그림 색
},
```

4. 저장하고 브라우저를 새로고침(F5)하면 끝!

- `fishingMethod: "casting"` → CASTING을 고르면 보입니다. (펜슬 계열)
- `fishingMethod: "jigging"` → JIGGING을 고르면 보입니다. (메탈지그 계열)
- 선택한 물고기가 `targetFish`에 들어 있어야 그 물고기 낚시 때 목록에 나옵니다.

### 5-2. 낚시대 / 릴 추가 → `data/equipment-data.js`

`SHARK_DATA.rods` (낚시대) 또는 `SHARK_DATA.reels` (릴) 목록에 같은 방법으로 블록을 복사해 넣습니다.

**등록 기준:** 낚시대는 지깅몰에서 판매 중인 **SHARK 브랜드(샤크컴퍼니) 상품만** 등록합니다.
(상품 상세페이지의 "브랜드: SHARK" 확인. NS 등 외부 브랜드는 등록하지 않음)

```js
{
    id: "rod_3329",                                    // 고유값 (상품번호 사용 추천)
    name: "아이언팝 92 II Version UP 파핑 낚시대 부시리 방어 참치 낚시",  // 지깅몰 상품명 그대로
    brand: "SHARK",
    category: "rod",
    fishingMethod: "casting",                          // 지깅 낚시대 "jigging" / 파핑 낚시대 "casting"
    targetFish: ["amberjack", "yellowtail", "tuna"],   // 게임 추천 어종
    difficulty: "보통",
    image: "",                                         // 이미지 주소 (없으면 자동 그림)
    purchaseUrl: "https://www.jiggingmall.com/goods/goods_view.php?goodsNo=3329",
    realSpec: {},                                      // 확인된 실제 스펙만. 모르면 {}
    gameStats: { power: 80, control: 70 }              // 게임 전용 수치 0~100
},
```

- JIGGING 선택 → `fishingMethod: "jigging"` 낚시대만, CASTING 선택 → `"casting"` 낚시대만 자동 표시
- `realSpec`: **실제 제품 스펙** - 지깅몰 상품 페이지에서 확인된 값만 입력 (추측 금지)
- `gameStats`: **게임 전용 수치** (0~100, 실제 스펙과 별개)
- 릴: JIGGING은 **앰보스 VJ3 지깅릴** 하나만 사용합니다 (릴 화면에서 자동 선택 → [다음]).
- CASTING은 VJ3 + [지깅몰 스피닝릴](https://www.jiggingmall.com/goods/goods_list.php?cateCd=001001)의
  **시마노 · 다이와** 릴 중 **3개를 랜덤으로** 보여줍니다 (`randomPool: true` 인 릴, 낚시 방법을 고를 때마다 새로 뽑음).
  보여줄 개수는 `js/equipment.js` 의 `CASTING_REEL_PICK`.
- `nameEn` 처럼 뒤에 `En` 이 붙은 값은 해외(영어) 접속 시 보이는 문구입니다. 비워두면 한국어가 그대로 보입니다.

### 5-3. 상품 삭제 / 주소 변경
- 삭제: 해당 블록 `{ ... },` 전체를 지웁니다.
- 주소 변경: `purchaseUrl` 값만 바꿉니다.
  비워두면(`""`) 지깅 낚시대는 지깅 낚시대 카테고리, 파핑 낚시대는 파핑 낚시대 카테고리,
  그 외 상품은 지깅몰 메인으로 이동합니다. (카테고리 주소는 `js/config.js`)

### 5-4. 상품 사진 넣기
1. 사진을 `assets/images/equipment/` 폴더에 넣습니다. (예: `fs150.jpg`)
2. 상품 데이터의 `image` 에 `"assets/images/equipment/fs150.jpg"` 를 입력합니다.
3. 사진이 없거나 경로가 틀리면 게임이 자동으로 그림을 그려 줍니다.

> 게임은 지깅몰을 실시간으로 읽어오지(크롤링) 않습니다.
> 데이터 파일로 직접 관리하기 때문에 지깅몰 사이트 구조가 바뀌어도 게임이 고장 나지 않습니다.

---

## 6. 새 낚시 지역 추가 → `data/region-data.js`

블록 하나를 추가하면 **세계지도와 지역 카드에 자동으로 나타납니다.**

```js
{
    id: "ulleungdo", country: "대한민국", name: "울릉도", nameEn: "Ulleungdo",
    area: "korea",              // korea, japan, oceania, north_america, central_america, indian_ocean, europe, africa
    continent: "Asia",
    lat: 37.5, lon: 130.9,      // 지도 위치 (구글 지도에서 확인 가능)
    difficulty: 3,              // 1~5
    depthMin: 30, depthMax: 150,    // 지역 참고 정보 (게임 지깅 수심은 20~60m 고정)
    mainFish: ["amberjack", "yellowtail", "tuna"],
    trophyFish: ["amberjack"],  // 대물 포인트
    fishingTypes: ["jigging", "casting"],
    unlocked: true,             // false 면 물고기 N마리 잡은 뒤 오픈
    tunaSeason: SHARK_DATA.koreaTunaSeason,   // 여름 참치 필드로 만들 때만
    description: "동해 먼바다의 화산섬."
},
```

---

## 7. 대한민국 SUMMER TUNA FIELD (참치 시즌)

`data/region-data.js` 맨 위:

```js
SHARK_DATA.koreaTunaSeason = { months: [7, 8, 9, 10], hitBoost: 1.8, trophyBoost: 1.4, offSeasonHit: 0.35 };
```

- `months`: 참치 시즌 월. 해마다 회유 상황에 맞게 바꾸세요.
- `hitBoost`: 시즌 중 참치 히트율 배율
- `trophyBoost`: 시즌 중 대형 참치 확률 배율
- `offSeasonHit`: 비시즌 참치 히트율 배율

동해 · 남해 · 제주에 적용되어 있고, 시즌이 되면 **TUNA SEASON** 표시가 나타납니다.
테스트할 때는 `js/config.js`의 `SEASON_MONTH: 8` 처럼 월을 고정할 수 있습니다.

해외 참치 원정 필드(**TUNA EXPEDITION**)는 `expedition: true` 인 지역이며,
총 조과가 `CONFIG.EXPEDITION_UNLOCK_CATCHES`(기본 3마리)가 되면 열립니다.

---

## 8. 물고기 크기 · 최대어 시스템

`data/fish-data.js` 맨 위에서 수정합니다.

```js
SHARK_DATA.defaultGradeChance = { NORMAL: 65, GOOD: 22, BIG: 9, TROPHY: 3, MONSTER: 1 };
```

크기는 완전 랜덤이 아니라 다음 요소를 합산한 "행운 배율"로 대물 확률이 올라갑니다.

지역(대물 포인트) · 어종 · 시즌 · 수심(HIT ZONE) · 낚시 방법 · 루어(대상어/대물 보너스) ·
액션 리듬 · 장비 궁합 · 캐스팅 정확도 · **오늘의 히트 루어**(게임을 열 때마다 몰래 바뀜) · 랜덤

어종별 `sizeRange.max` 가 그 어종의 최대어입니다. 참치는
`TUNA → BIG TUNA → TROPHY TUNA → MONSTER TUNA → GLOBAL MONSTER` 등급으로 표시됩니다.

### 물고기 id 표

| id | 이름 | id | 이름 |
|---|---|---|---|
| amberjack | 부시리 | yellowfin | Yellowfin Tuna |
| yellowtail | 방어 | bluefin | Bluefin Tuna |
| spanish_mackerel | 대삼치 | bigeye | Bigeye Tuna |
| tuna | 참치 | dogtooth | Dogtooth Tuna |
| squid | 무늬오징어 | mahimahi | Mahi-mahi |
| octopus | 주꾸미 | wahoo | Wahoo |
| gt | GT (Giant Trevally) | marlin | Marlin |
| kingfish | Kingfish | sailfish | Sailfish |
| roosterfish | Roosterfish | halibut | Halibut |
| cod | Cod | snapper | Snapper |

---

## 9. YouTube 버튼 안내

- 첫 화면의 **▶ 샤크신동만 YouTube 구독하기** 버튼을 한 번 누르면 GAME START가 열립니다.
- 정적 웹사이트는 실제 구독 여부를 확인할 수 없으므로 게임에는
  **"YouTube 채널 방문 완료"** 라고만 표시합니다.
- 방문 기록은 `localStorage`의 `sharkYoutubeVisited` 에 저장되어 다음부터는 바로 시작할 수 있습니다.

## 10. 저장 데이터 (localStorage)

| 키 | 내용 |
|---|---|
| `sharkYoutubeVisited` | YouTube 채널 방문 여부 |
| `sharkRecords` | 낚시 기록 (최대어 / 도감) |
| `sharkSound` | 사운드 ON/OFF |

메인 메뉴의 **🗑 기록 초기화** 로 낚시 기록만 지울 수 있습니다.

---

## 한국어 / 영어 (해외 접속)

- **대한민국에서 접속하면 한국어**, **그 외 국가에서 접속하면 영어**로 자동 표시됩니다.
- 접속 국가는 무료 IP 위치 API(`get.geojs.io`, 실패 시 `api.country.is`)로 확인합니다. 확인 전에는 시간대/브라우저 언어로 먼저 추측합니다.
- 상단 **KO / EN** 버튼으로 직접 바꿀 수 있고, 직접 고른 언어는 계속 유지됩니다.
- 문구 추가 방법: 코드에서는 `L("한국어", "English")`, 데이터에서는 `nameEn` / `descriptionEn` 처럼 `En` 필드, HTML에서는 `data-en="English"` 속성 (`js/i18n.js` 참고).

---

## 난이도 (하 · 중 · 상) / 손맛 진동

- 메인 메뉴에서 **하 · 중 · 상**을 고릅니다 (브라우저에 저장). **중**이 기본 밸런스입니다.
- **상**: 텐션이 빨리 차고, 물고기가 더 오래 버티고 체력도 빨리 회복하며, 입질이 적고 캐스팅 게이지가 빠릅니다. 대신 **대물 확률이 1.35배**입니다.
- 난이도별 수치는 `js/config.js` 의 `DIFFICULTY` 에서 바꿀 수 있습니다.
- **손맛 진동**: 파이팅 중 휴대폰이 진동합니다. 질주 때 드랙 "지이익", 헤드쉐이크 "툭툭", 감을 때 "꾹꾹", 텐션 위험 "부르르". 화면의 낚싯대 끝도 같이 떨립니다.
  - 메인 메뉴의 **📳 손맛 진동** 버튼으로 켜고 끔. 세기는 `js/config.js` 의 `HAPTIC_STRENGTH`.
  - 안드로이드 크롬 등에서 동작합니다. **아이폰(Safari)은 웹 진동을 지원하지 않습니다.** PC는 진동 지원 게임패드를 연결하면 패드가 진동합니다.
