/* ============================================================
   Homepage 定制脚本：配色切换 + 壁纸背景切换
   - 右下角圆形按钮①：循环 5 套强调色（存 localStorage）
   - 右下角圆形按钮②：循环 背景壁纸（无背景 → 8 张横版壁纸），
     壁纸来自 NAS /vol3/.../横版，经容器 /backgrounds/ 提供
   ============================================================ */
(function () {
  /* ---------- 配色切换 ---------- */
  var THEMES = ["amber", "emerald", "sky", "violet", "rose"];
  var DOTS = { amber: "🟠", emerald: "🟢", sky: "🔵", violet: "🟣", rose: "🔴" };
  var THEME_KEY = "hp-palette";

  function currentTheme() {
    var m = document.documentElement.className.match(/theme-([a-z]+)/);
    return m ? m[1] : "amber";
  }
  function applyTheme(t) {
    var h = document.documentElement;
    if (!h.className.includes("theme-" + t)) {
      h.className = h.className.replace(/theme-[a-z]+/, "theme-" + t);
    }
  }
  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved && THEMES.includes(saved)) applyTheme(saved);
    new MutationObserver(function () {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved && THEMES.includes(saved) && currentTheme() !== saved) applyTheme(saved);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "thm-switch";
    btn.title = "切换配色主题（当前：" + currentTheme() + "）";
    btn.textContent = DOTS[currentTheme()] || "🎨";
    btn.addEventListener("click", function () {
      var next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
      btn.textContent = DOTS[next] || "🎨";
      btn.title = "切换配色主题（当前：" + next + "）";
    });
    document.body.appendChild(btn);
  }

  /* ---------- 壁纸背景切换 ---------- */
  var BGS = [
    "Wallpaper Alchemy - Remielle Dan 绝区零 4K 壁纸.jpg",
    "Wallpaper Alchemy - Remielle Dan 绝区零 4K 壁纸 (1).jpg",
    "星见雅.png",
    "星见雅ox.jpeg",
    "艾莲.png",
    "艾莲2.png",
    "艾莲3.png",
    "蕾米.jpg",
  ];
  var BG_KEY = "hp-bg";

  function applyBg(idx) {
    var b = document.body;
    if (idx >= 0 && idx < BGS.length) {
      b.classList.add("has-bg");
      b.style.setProperty("--bg-image", 'url("/backgrounds/' + encodeURIComponent(BGS[idx]) + '")');
    } else {
      b.classList.remove("has-bg");
      b.style.removeProperty("--bg-image");
    }
  }
  function bgIndex() {
    var v = parseInt(localStorage.getItem(BG_KEY), 10);
    return isNaN(v) || v < -1 || v >= BGS.length ? -1 : v;
  }
  function initBg() {
    applyBg(bgIndex());
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "thm-switch bg-switch";
    btn.textContent = "🖼";
    function syncTitle() {
      var i = bgIndex();
      btn.title = "切换背景壁纸（当前：" + (i < 0 ? "无背景" : i + 1 + "/" + BGS.length + " " + BGS[i]) + "）";
    }
    syncTitle();
    btn.addEventListener("click", function () {
      var next = bgIndex() + 1;
      if (next >= BGS.length) next = -1;
      localStorage.setItem(BG_KEY, String(next));
      applyBg(next);
      syncTitle();
    });
    document.body.appendChild(btn);
  }

  /* ---------- glances 圆环：把卡片百分比写入圆环角度 ---------- */
  function updateRings() {
    document.querySelectorAll(".service-container.chart").forEach(function (c) {
      var el = c.querySelector(".absolute.bottom-3.right-3 > div") || c.querySelector(".absolute.bottom-3.right-3");
      if (!el) return;
      var m = el.textContent.match(/(\d+(?:\.\d+)?)\s*%/);
      if (!m) return;
      c.style.setProperty("--p", m[1]);
      var t = m[1] + "%";
      if (el.textContent !== t) el.textContent = t;
    });
  }
  function initRings() {
    updateRings();
    setInterval(updateRings, 3000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { initTheme(); initBg(); initRings(); });
  } else {
    initTheme();
    initBg();
    initRings();
  }
})();
