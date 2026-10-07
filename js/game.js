/* =========================================================
   게임 핵심 계산 (game.js)
   - 현재 선택 상태 (지역 / 물고기 / 낚시법 / 장비 3개)
   - 시즌, 오늘의 히트 루어, 히트 확률, 크기·등급 계산
   ========================================================= */
const Game = {
    state: { region: null, fish: null, method: null, rod: null, reel: null, lure: null },

    /* 하루의 히트 루어: 게임을 열 때마다 새로 정해짐 (정답은 알려주지 않음) */
    dailyHit: {},

    D() { return window.SHARK_DATA; },

    fishById(id) { return this.D().fish.find(f => f.id === id); },
    regionById(id) { return this.D().regions.find(r => r.id === id); },
    lureById(id) { return this.D().lures.find(l => l.id === id); },
    rodById(id) { return this.D().rods.find(r => r.id === id); },
    reelById(id) { return this.D().reels.find(r => r.id === id); },

    /* 현재 난이도 설정 (config.js 의 DIFFICULTY) */
    difficultyId() { return Store.getDifficulty(); },
    difficulty() { return CONFIG.DIFFICULTY[this.difficultyId()]; },
    difficultyLabel(id) {
        const d = CONFIG.DIFFICULTY[id || this.difficultyId()];
        return d ? L(d.label, d.labelEn) : "";
    },

    month() {
        return CONFIG.SEASON_MONTH || (new Date().getMonth() + 1);
    },

    isFishInSeason(fish) {
        return !fish.seasons || fish.seasons.includes(this.month());
    },

    /* 대한민국 SUMMER TUNA FIELD 시즌 여부 */
    isTunaSeason(region) {
        return !!(region && region.tunaSeason && region.tunaSeason.months.includes(this.month()));
    },

    isRegionUnlocked(region) {
        if (region.unlocked !== false) return true;
        return Records.totalCount() >= CONFIG.EXPEDITION_UNLOCK_CATCHES;
    },

    /* 지역에서 선택 가능한 물고기 목록 */
    regionFish(region) {
        return region.mainFish.map(id => this.fishById(id)).filter(Boolean);
    },

    /* 물고기 + 지역에서 가능한 낚시법 */
    availableMethods(region, fish) {
        return ["casting", "jigging"].filter(m => fish.methods.includes(m) && region.fishingTypes.includes(m));
    },

    resetSelection(from) {
        const order = ["region", "fish", "method", "rod", "reel", "lure"];
        const idx = order.indexOf(from);
        order.slice(idx).forEach(k => { this.state[k] = null; });
    },

    gearPower() {
        const s = this.state;
        if (!s.rod || !s.reel) return 2;
        return (Equip.stat(s.rod, "power", 3) + Equip.stat(s.reel, "power", 3)) / 2;
    },

    getDailyHitLure(region, fish, method) {
        const key = `${region.id}|${fish.id}|${method}`;
        if (!(key in this.dailyHit)) {
            const list = Equip.luresFor(method, fish.id);
            this.dailyHit[key] = list.length > 1 ? U.choice(list).id : null;
        }
        return this.dailyHit[key];
    },

    /* ---------------------------------------------------
       히트 확률 배율 (루어/시즌/지역 조건)
       --------------------------------------------------- */
    hitFactor() {
        const { region, fish, method, lure } = this.state;
        let f = 1;
        if (lure.targetFish.includes(fish.id)) f *= 1.2; else f *= 0.7;
        f *= 0.8 + lure.gamePower * 0.08;
        if (this.getDailyHitLure(region, fish, method) === lure.id) f *= 1.3;
        f *= this.isFishInSeason(fish) ? 1.15 : 0.8;
        if (fish.isTuna && region.tunaSeason) {
            f *= this.isTunaSeason(region) ? region.tunaSeason.hitBoost : region.tunaSeason.offSeasonHit;
        }
        if (fish.bestMethod === method) f *= 1.1;
        f *= this.difficulty().hitRate;                                                // 난이도
        return f;
    },

    /* ---------------------------------------------------
       대물 확률 배율 (지역·어종·시즌·수심·낚시법·루어·액션·장비·플레이)
       --------------------------------------------------- */
    luck(ctx) {
        const { region, fish, method, lure } = this.state;
        let m = 1;
        if (region.trophyFish && region.trophyFish.includes(fish.id)) m *= 1.5;      // 지역
        m *= this.isFishInSeason(fish) ? 1.3 : 0.85;                                   // 시즌
        if (fish.isTuna && this.isTunaSeason(region)) m *= region.tunaSeason.trophyBoost;
        if (method === "jigging" && ctx.depthMatch != null) {                          // 수심 적중
            m *= ctx.depthMatch ? 1.15 : 0.9;
        }
        if (fish.bestMethod === method) m *= 1.1;                                     // 낚시법
        if (lure.targetFish.includes(fish.id)) m *= 1.15;                              // 루어
        m *= 1 + (lure.rarityBonus || 0);
        if (this.getDailyHitLure(region, fish, method) === lure.id) m *= 1.5;          // 오늘의 히트 루어
        m *= this.gearPower() >= fish.recommendedPower ? 1.1 : 0.85;                   // 장비 궁합
        m *= 0.85 + 0.4 * U.clamp(ctx.playScore || 0, 0, 1);                           // 플레이 타이밍(액션)
        m *= this.difficulty().luck;                                                   // 난이도 (상일수록 대물 UP)
        return U.clamp(m, 0.4, 6);
    },

    /* 히트한 물고기의 등급/크기/무게 결정 */
    rollCatch(ctx) {
        const D = this.D();
        const { region, fish, method, rod, reel, lure } = this.state;
        const base = Object.assign({}, D.defaultGradeChance, fish.gradeChance || {});
        const m = this.luck(ctx);
        const w = {
            NORMAL: base.NORMAL,
            GOOD: base.GOOD * Math.sqrt(m),
            BIG: base.BIG * Math.pow(m, 0.8),
            TROPHY: base.TROPHY * Math.pow(m, 0.9),
            MONSTER: base.MONSTER * m
        };
        const grade = U.weighted(w);
        const band = D.gradeBands[grade];
        const t = U.rand(band[0], band[1]);
        const length = Math.round((fish.sizeRange.min + (fish.sizeRange.max - fish.sizeRange.min) * t) * 10) / 10;
        const weight = Math.round(fish.weightK * Math.pow(length, 3) * 100) / 100;
        const gradeLabel = fish.isTuna ? D.tunaGradeNames[grade] : grade;
        return {
            fishId: fish.id, fishName: fish.name, fishNameEn: fish.nameEn,
            grade, gradeLabel, length, weight,
            isTuna: !!fish.isTuna,
            power: fish.fightPower * D.gradePowerMult[grade],
            regionId: region.id, regionName: region.name, country: region.country,
            method, rodName: rod.name, rodId: rod.id, reelName: reel.name, reelId: reel.id, lureName: lure.name, lureId: lure.id,
            luck: Math.round(m * 100) / 100,
            difficulty: this.difficultyId(),
            date: Date.now()
        };
    },

    gradeIndex(grade) { return this.D().gradeOrder.indexOf(grade); }
};
