/* =========================================================
   localStorage 저장 (storage.js)
   - 서버/DB 없이 이 브라우저에만 저장됩니다.
   ========================================================= */
const Store = {
    KEYS: {
        YOUTUBE: "sharkYoutubeVisited",
        RECORDS: "sharkRecords",
        SOUND: "sharkSound",
        DIFFICULTY: "sharkDifficulty",
        HAPTIC: "sharkHaptic"
    },

    get(key, fallback) {
        try {
            const v = localStorage.getItem(key);
            if (v === null) return fallback;
            return JSON.parse(v);
        } catch (e) {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { /* 저장 불가 환경(시크릿 모드 등)에서도 게임은 계속 */ }
    },

    remove(key) {
        try { localStorage.removeItem(key); } catch (e) { }
    },

    isYoutubeVisited() { return Store.get(Store.KEYS.YOUTUBE, false) === true; },
    setYoutubeVisited() { Store.set(Store.KEYS.YOUTUBE, true); },

    getRecords() {
        const r = Store.get(Store.KEYS.RECORDS, []);
        return Array.isArray(r) ? r : [];
    },
    saveRecords(list) { Store.set(Store.KEYS.RECORDS, list); },
    clearRecords() { Store.remove(Store.KEYS.RECORDS); },

    isSoundOn() { return Store.get(Store.KEYS.SOUND, true) !== false; },
    setSoundOn(on) { Store.set(Store.KEYS.SOUND, !!on); },

    getDifficulty() {
        const d = Store.get(Store.KEYS.DIFFICULTY, CONFIG.DEFAULT_DIFFICULTY);
        return CONFIG.DIFFICULTY[d] ? d : CONFIG.DEFAULT_DIFFICULTY;
    },
    setDifficulty(d) { Store.set(Store.KEYS.DIFFICULTY, d); },

    isHapticOn() { return Store.get(Store.KEYS.HAPTIC, true) !== false; },
    setHapticOn(on) { Store.set(Store.KEYS.HAPTIC, !!on); }
};
