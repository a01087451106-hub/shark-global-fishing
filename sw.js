/* =========================================================
   서비스 워커 (sw.js) - 홈 화면에 추가한 "앱"용
   - 항상 인터넷에서 최신 파일을 받아옴 (업데이트가 바로 반영되도록 캐시하지 않음)
   - 인터넷이 끊겼을 때만 안내 화면을 보여줌
   ========================================================= */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

const OFFLINE_HTML = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SHARK GLOBAL FISHING</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#06111f;color:#e9eef3;font-family:sans-serif;text-align:center">
<div><div style="font-size:3rem">🐟</div><h2>인터넷 연결이 필요해요</h2>
<p style="opacity:.7">연결을 확인한 뒤 다시 시도해 주세요.<br>Please check your internet connection.</p>
<button onclick="location.reload()" style="margin-top:12px;padding:12px 24px;border:0;border-radius:10px;background:#4fd1ff;color:#06111f;font-size:1rem;font-weight:bold">다시 시도 · Retry</button></div>
</body></html>`;

self.addEventListener("fetch", e => {
    if (e.request.mode !== "navigate") return;
    e.respondWith(fetch(e.request).catch(() =>
        new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })));
});
