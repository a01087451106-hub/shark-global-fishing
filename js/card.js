/* =========================================================
   📸 트로피 인증샷 카드 (card.js)
   - 잡은 물고기 기록으로 1080×1350 이미지(인스타 세로 비율)를 그립니다.
   - 휴대폰: 공유하기 → 카카오톡 · 인스타그램 등으로 바로 공유
   - PC: 이미지 저장 + 링크 복사
   ========================================================= */
const TrophyCard = {
    W: 1080, H: 1350,
    SITE: "game.sharkfish7.com",

    font(px, weight) {
        return `${weight || 700} ${px}px "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", system-ui, sans-serif`;
    },

    loadImg(src) {
        return new Promise(res => {
            const im = new Image();
            im.onload = () => res(im);
            im.onerror = () => res(null);
            im.src = src;
        });
    },

    /* 글자가 너무 길면 줄여서 한 줄에 맞춤 */
    fitText(c, text, x, y, maxW, px, weight) {
        let size = px;
        c.font = this.font(size, weight);
        while (c.measureText(text).width > maxW && size > 18) { size -= 2; c.font = this.font(size, weight); }
        c.fillText(text, x, y);
    },

    roundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
    },

    async render(rec) {
        const W = this.W, H = this.H;
        const cv = document.createElement("canvas");
        cv.width = W; cv.height = H;
        const c = cv.getContext("2d");
        const fish = Game.fishById(rec.fishId);
        const gi = Game.gradeIndex(rec.grade);
        const gradeColors = ["#7fb3d5", "#3ddc97", "#4fd1ff", "#f2c94c", "#ff5a7a"];
        const gc = gradeColors[gi] || "#f2c94c";

        /* 배경: 깊은 바다 */
        const bg = c.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, "#0b3d66"); bg.addColorStop(0.5, "#06223f"); bg.addColorStop(1, "#020a16");
        c.fillStyle = bg; c.fillRect(0, 0, W, H);
        const glow = c.createRadialGradient(W / 2, 560, 40, W / 2, 560, 560);
        glow.addColorStop(0, gc + "55"); glow.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = glow; c.fillRect(0, 0, W, H);
        c.strokeStyle = "rgba(255,255,255,0.06)"; c.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            c.beginPath();
            for (let x = 0; x <= W; x += 20) c.lineTo(x, 860 + i * 70 + Math.sin(x / 90 + i) * 14);
            c.stroke();
        }
        /* 테두리 */
        c.strokeStyle = gc; c.lineWidth = 8;
        this.roundRect(c, 24, 24, W - 48, H - 48, 36); c.stroke();

        c.textAlign = "center"; c.textBaseline = "alphabetic";
        /* 헤더 */
        c.fillStyle = "#f2c94c"; c.font = this.font(46, 900);
        c.fillText("SHARK GLOBAL FISHING", W / 2, 110);
        c.fillStyle = "rgba(255,255,255,0.7)"; c.font = this.font(28, 600);
        c.fillText(L("🏆 TROPHY CARD · 인증샷", "🏆 TROPHY CARD"), W / 2, 154);

        /* 등급 */
        c.font = this.font(44, 900);
        const gl = rec.gradeLabel || rec.grade;
        const gw = c.measureText(gl).width + 80;
        c.fillStyle = gc; this.roundRect(c, W / 2 - gw / 2, 192, gw, 72, 36); c.fill();
        c.fillStyle = "#04121f"; c.fillText(gl, W / 2, 244);

        /* 물고기 그림 */
        if (fish) {
            const im = await this.loadImg(Scene.fishDataURL(fish));
            if (im) {
                c.save();
                c.shadowColor = gc; c.shadowBlur = 50;
                c.drawImage(im, 70, 290, 940, 470);
                c.restore();
            }
        }

        /* 이름 · 크기 */
        c.fillStyle = "#ffffff";
        this.fitText(c, fish ? I18N.name(fish) : rec.fishName, W / 2, 830, W - 160, 76, 900);
        if (fish && !I18N.en) { c.fillStyle = "rgba(255,255,255,0.6)"; c.font = this.font(30, 600); c.fillText(fish.nameEn, W / 2, 876); }
        c.fillStyle = gc; c.font = this.font(96, 900);
        c.fillText(`${rec.length}cm · ${U.formatWeight(rec.weight)}`, W / 2, 990);

        /* 메달 · 신기록 */
        const best = Records.bestOf(rec.fishId);
        const medal = Shop.MEDALS[Shop.medalLevel(rec)];
        const tags = [];
        if (best && best.id === rec.id) tags.push(L("🏆 나의 최대어", "🏆 PERSONAL BEST"));
        if (medal) tags.push(`${medal.icon} ${L(medal.ko, medal.en)}`);
        if (tags.length) { c.fillStyle = "#f2c94c"; c.font = this.font(36, 800); c.fillText(tags.join("   "), W / 2, 1052); }

        /* 정보 */
        c.fillStyle = "rgba(255,255,255,0.85)"; c.font = this.font(32, 600);
        this.fitText(c, `📍 ${Records.countryOf(rec)} · ${Records.regionNameOf(rec)}`, W / 2, 1112, W - 140, 32, 600);
        c.fillStyle = "rgba(255,255,255,0.65)";
        this.fitText(c, `${U.methodLabel(rec.method)} · ${Records.lureNameOf(rec)}`, W / 2, 1158, W - 140, 28, 500);
        this.fitText(c, `${Records.gearNameOf(rec, "rod")} / ${Records.gearNameOf(rec, "reel")}`, W / 2, 1198, W - 140, 24, 500);

        /* 낚시꾼 · 날짜 · 주소 */
        const name = Achieve.playerName() || "ANGLER";
        const title = Achieve.title();
        c.fillStyle = "#ffffff"; c.font = this.font(34, 800);
        this.fitText(c, title ? `${title} ${name}` : name, W / 2, 1258, W - 140, 34, 800);
        c.fillStyle = "rgba(255,255,255,0.55)"; c.font = this.font(24, 600);
        const diff = rec.difficulty ? ` · ${L("난이도", "Level")} ${Game.difficultyLabel(rec.difficulty)}` : "";
        c.fillText(`${U.formatDate(rec.date)}${diff} · ${this.SITE}`, W / 2, 1300);
        return cv;
    },

    shareText(rec) {
        const fish = Game.fishById(rec.fishId);
        const n = fish ? I18N.name(fish) : rec.fishName;
        return L(`SHARK GLOBAL FISHING에서 ${n} ${rec.length}cm · ${U.formatWeight(rec.weight)} 잡았어요! 🎣 나도 도전 →`,
            `I landed a ${rec.length}cm · ${U.formatWeight(rec.weight)} ${n} in SHARK GLOBAL FISHING! 🎣 Try it →`);
    },

    url() { return "https://" + this.SITE + "/"; },

    /* 카드 미리보기 + 공유/저장 */
    async open(rec, onClose) {
        const box = App.openModal(`<div class="detail center card-modal"><p class="muted">${L("인증샷 카드를 만드는 중...", "Making your trophy card...")}</p></div>`, onClose);
        const cv = await this.render(rec);
        const blob = await new Promise(r => cv.toBlob(r, "image/png"));
        const fileName = `shark-trophy-${rec.fishId}-${Math.round(rec.length)}cm.png`;
        const file = typeof File !== "undefined" && blob ? new File([blob], fileName, { type: "image/png" }) : null;
        const canShareFile = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
        const imgUrl = blob ? URL.createObjectURL(blob) : cv.toDataURL("image/png");
        box.innerHTML = `
            <div class="detail center card-modal">
                <h3>📸 ${L("인증샷 카드", "Trophy Card")}</h3>
                <img class="card-preview" src="${imgUrl}" alt="trophy card">
                <label class="ach-name">${L("낚시꾼 이름", "Angler name")}
                    <input id="card-name" maxlength="16" placeholder="ANGLER" value="${U.escape(Achieve.playerName())}"></label>
                <div class="detail-actions">
                    ${canShareFile ? `<button class="btn btn-gold btn-lg" data-act="share">${L("📤 공유하기 (카톡 · 인스타)", "📤 Share")}</button>` : ""}
                    <a class="btn btn-primary" data-act="save" href="${imgUrl}" download="${fileName}">${L("💾 이미지 저장", "💾 Save Image")}</a>
                    <button class="btn btn-ghost" data-act="copy">${L("🔗 게임 링크 복사", "🔗 Copy Game Link")}</button>
                </div>
                <p class="muted small">${canShareFile ? "" : L("이미지를 저장한 뒤 카카오톡 · 인스타그램에 올려보세요!", "Save the image and post it on Instagram or anywhere!")}</p>
            </div>`;
        const nameInput = box.querySelector("#card-name");
        nameInput.onchange = () => {
            Achieve.setPlayerName(nameInput.value);
            this.open(rec, onClose);             // 이름을 바꾸면 카드 다시 그림
        };
        box.onclick = async e => {
            const b = e.target.closest("[data-act]");
            if (!b) return;
            Sound.click();
            const act = b.dataset.act;
            if (act === "share") {
                try { await navigator.share({ files: [file], title: "SHARK GLOBAL FISHING", text: this.shareText(rec) + " " + this.url() }); } catch (err) { }
            }
            if (act === "copy") {
                const text = this.shareText(rec) + " " + this.url();
                try { await navigator.clipboard.writeText(text); App.toast(L("링크를 복사했어요!", "Link copied!")); }
                catch (err) { window.prompt(L("아래 글을 복사하세요", "Copy this text"), text); }
            }
        };
    }
};
