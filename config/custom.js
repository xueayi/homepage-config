/* ============================================================
   Homepage 定制脚本「樱夜 · Sakura」—— 移植自 gitea-sakura-theme
   ------------------------------------------------------------
   浮窗切换器（可拖动，位置记忆）：
     · 壁纸     壁纸库缩略图（每张自带暗化/模糊参数）
     · 飘落特效 无 / 🌸 樱花（CSS 花瓣） / ❄ 雪花（canvas 六角晶簇三层视差）
     · 背景模糊 关 / 轻 / 中 / 强（倍率作用于壁纸预模糊）
     · 点击迸溅 开关
   另含：自制「主页 / 资讯」页签、glances CPU 圆环驱动。
   性能约定：花瓣走 CSS 动画；canvas 仅雪花运行且页面隐藏即暂停。
   ============================================================ */
(function () {
  "use strict";

  var html = document.documentElement;
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BG = "/bg/";

  /* ============ 1. 壁纸清单 ============ */
  /* dim: 暗化遮罩强度(0~1)；blur: 该壁纸的基础模糊半径(px)，
     实际模糊 = blur × 用户档位系数 */
  var WALLS = [
    { id: "sakura-night", name: "樱夜·矢量", url: "", thumb: BG + "sakura-night.svg", dim: 0, blur: 6 },
    { id: "xingjianya", name: "星见雅·夜城", url: BG + "xingjianya.webp", thumb: BG + "thumbs/xingjianya.webp", dim: 0.18, blur: 12 },
    { id: "xingjianya-ox", name: "星见雅·OX", url: BG + "xingjianya-ox.webp", thumb: BG + "thumbs/xingjianya-ox.webp", dim: 0.2, blur: 13 },
    { id: "ailian", name: "艾莲·街头", url: BG + "ailian.webp", thumb: BG + "thumbs/ailian.webp", dim: 0.24, blur: 13 },
    { id: "ailian-2", name: "艾莲·雨巷", url: BG + "ailian-2.webp", thumb: BG + "thumbs/ailian-2.webp", dim: 0.26, blur: 14 },
    { id: "ailian-3", name: "艾莲·特写", url: BG + "ailian-3.webp", thumb: BG + "thumbs/ailian-3.webp", dim: 0.24, blur: 13 },
    { id: "leimi", name: "蕾米·蓝天", url: BG + "leimi.webp", thumb: BG + "thumbs/leimi.webp", dim: 0.36, blur: 16 },
    { id: "remielle-1", name: "绝区零·粉", url: BG + "remielle-1.webp", thumb: BG + "thumbs/remielle-1.webp", dim: 0.32, blur: 15 },
    { id: "remielle-2", name: "绝区零·霓虹", url: BG + "remielle-2.webp", thumb: BG + "thumbs/remielle-2.webp", dim: 0.32, blur: 15 }
  ];

  var LS = { bg: "hpBg", fx: "hpFx", burst: "hpBurst", blur: "hpBlur", px: "hpBtnX", py: "hpBtnY" };
  /* 模糊档位: 关 / 轻 / 中 / 强 → 基础模糊的倍率（默认「中」） */
  var BLUR_LEVELS = { off: 0, low: 0.55, mid: 1, high: 1.6 };

  /* 旧版主题遗留的键位，清一次 */
  ["hp-palette", "hp-style", "hp-fall", "hp-wall", "hp-gear"].forEach(function (k) {
    localStorage.removeItem(k);
  });

  function findWall(id) {
    for (var i = 0; i < WALLS.length; i++) if (WALLS[i].id === id) return WALLS[i];
    return WALLS[0];
  }
  function getBgId() { return localStorage.getItem(LS.bg) || "sakura-night"; }
  function getFx() { return localStorage.getItem(LS.fx) || "sakura"; }
  function getBurst() { return localStorage.getItem(LS.burst) !== "0"; }
  function getBlurLevel() {
    var v = localStorage.getItem(LS.blur);
    return (v && BLUR_LEVELS[v] !== undefined) ? v : "mid";
  }

  /* ============ 2. 壁纸 + 毛玻璃 ============ */
  function applyWall() {
    var w = findWall(getBgId());
    if (w.url) {
      html.style.setProperty("--hp-bg-img", 'url("' + w.url + '")');
    } else {
      html.style.removeProperty("--hp-bg-img");
    }
    html.style.setProperty("--hp-bg-dim", String(w.dim || 0));
    applyBlur();
  }
  function applyBlur() {
    var w = findWall(getBgId());
    var base = (typeof w.blur === "number") ? w.blur : 12;
    var px = base * BLUR_LEVELS[getBlurLevel()];
    html.style.setProperty("--hp-bg-blur", px.toFixed(1) + "px");
  }

  /* ============ 3. 樱花花瓣引擎（DOM + CSS 动画，零帧循环） ============ */
  var petalLayer = null;
  function startPetals() {
    if (petalLayer) return;
    petalLayer = document.createElement("div");
    petalLayer.className = "sakura-layer";
    var count = window.innerWidth < 768 ? 12 : 22;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "sakura-petal";
      var size = 7 + Math.random() * 9;
      p.style.width = size.toFixed(1) + "px";
      p.style.height = (size * 1.25).toFixed(1) + "px";
      p.style.left = (Math.random() * 100).toFixed(2) + "vw";
      p.style.animationDuration = (9 + Math.random() * 9).toFixed(1) + "s";
      p.style.animationDelay = (-Math.random() * 18).toFixed(1) + "s";
      p.style.opacity = (0.3 + Math.random() * 0.45).toFixed(2);
      frag.appendChild(p);
    }
    petalLayer.appendChild(frag);
    document.body.appendChild(petalLayer);
  }
  function stopPetals() {
    if (petalLayer) { petalLayer.remove(); petalLayer = null; }
  }

  /* ============ 4. 雪花引擎（canvas 六角晶簇，三层视差） ============ */
  /* 飘落速度系数：1 = 原速。0.55 ≈ 半速，飘落更舒缓 */
  var SNOW_SLOW = 0.55;
  var snowCanvas = null, snowRAF = 0, snowResize = null, snowDraw = null;
  function startSnow() {
    if (snowCanvas) return;
    snowCanvas = document.createElement("canvas");
    snowCanvas.className = "snow-layer";
    document.body.appendChild(snowCanvas);
    var ctx = snowCanvas.getContext("2d");
    var W, H;
    snowResize = function () {
      W = snowCanvas.width = window.innerWidth;
      H = snowCanvas.height = window.innerHeight;
    };
    snowResize();
    window.addEventListener("resize", snowResize);

    var N = W < 768 ? 30 : 60;
    var flakes = [];
    for (var i = 0; i < N; i++) {
      var layer = Math.random(); /* 0 远景小而慢, 1 近景大而快 */
      flakes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1.1 + layer * 2.6 + Math.random() * 1.1,
        sp: (0.35 + layer * 1.05 + Math.random() * 0.5) * SNOW_SLOW,
        ph: Math.random() * Math.PI * 2,
        sw: 0.4 + Math.random() * 0.8,
        rot: Math.random() * Math.PI * 2,
        rs: (Math.random() - 0.5) * 0.02,
        a: 0.35 + layer * 0.5,
        crystal: layer > 0.55
      });
    }
    var t = 0;
    var last = 0; /* 时间步长归一：以 60fps 为 1 倍，避免 120Hz 屏上雪花快一倍 */
    snowDraw = function (now) {
      if (!snowCanvas) return;
      if (!last) last = now;
      var dt = Math.min((now - last) / 16.667, 3);
      last = now;
      t += 0.016 * dt;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.sp * dt;
        f.x += Math.sin(t * f.sw + f.ph) * 0.45 * dt;
        f.rot += f.rs * dt;
        if (f.y > H + 12) { f.y = -12; f.x = Math.random() * W; }
        if (f.x < -12) f.x = W + 12; else if (f.x > W + 12) f.x = -12;
        drawFlake(ctx, f);
      }
      snowRAF = requestAnimationFrame(snowDraw);
    };
    snowRAF = requestAnimationFrame(snowDraw);

    /* 性能：页面不可见即暂停，回来再续 */
    document.addEventListener("visibilitychange", onVis);
  }
  function onVis() {
    if (!snowCanvas) return;
    if (document.hidden) {
      if (snowRAF) { cancelAnimationFrame(snowRAF); snowRAF = 0; }
    } else if (!snowRAF && snowDraw) {
      snowRAF = requestAnimationFrame(snowDraw);
    }
  }
  function drawFlake(ctx, f) {
    if (!f.crystal) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(235,245,255," + f.a + ")";
      ctx.fill();
      return;
    }
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    ctx.strokeStyle = "rgba(235,245,255," + f.a + ")";
    ctx.lineWidth = 1;
    var r = f.r * 2.2;
    for (var k = 0; k < 6; k++) {
      var a = (Math.PI / 3) * k;
      var dx = Math.cos(a) * r, dy = Math.sin(a) * r;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(dx, dy);
      ctx.moveTo(dx * 0.62, dy * 0.62);
      ctx.lineTo(dx * 0.62 + Math.cos(a - 0.5) * r * 0.28, dy * 0.62 + Math.sin(a - 0.5) * r * 0.28);
      ctx.moveTo(dx * 0.62, dy * 0.62);
      ctx.lineTo(dx * 0.62 + Math.cos(a + 0.5) * r * 0.28, dy * 0.62 + Math.sin(a + 0.5) * r * 0.28);
      ctx.stroke();
    }
    ctx.restore();
  }
  function stopSnow() {
    if (snowRAF) { cancelAnimationFrame(snowRAF); snowRAF = 0; }
    if (snowResize) { window.removeEventListener("resize", snowResize); snowResize = null; }
    document.removeEventListener("visibilitychange", onVis);
    snowDraw = null;
    if (snowCanvas) { snowCanvas.remove(); snowCanvas = null; }
  }

  function applyFx() {
    if (REDUCED) return;
    var mode = getFx();
    stopPetals();
    stopSnow();
    if (mode === "sakura") startPetals();
    else if (mode === "snow") startSnow();
  }

  /* ============ 5. 点击迸溅 ============ */
  document.addEventListener("click", function (e) {
    if (e.button !== 0) return;
    if (REDUCED || !getBurst()) return;
    var snowMode = getFx() === "snow";
    var box = document.createElement("div");
    box.className = "sakura-burst" + (snowMode ? " snow" : "");
    box.style.left = e.clientX + "px";
    box.style.top = e.clientY + "px";
    for (var j = 0; j < 6; j++) {
      var q = document.createElement("span");
      var a = ((Math.PI * 2) / 6) * j + Math.random() * 0.6;
      var dist = 26 + Math.random() * 26;
      q.style.setProperty("--dx", (Math.cos(a) * dist).toFixed(0) + "px");
      q.style.setProperty("--dy", (Math.sin(a) * dist).toFixed(0) + "px");
      q.style.animationDelay = (Math.random() * 0.08).toFixed(2) + "s";
      box.appendChild(q);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 900);
  });

  /* ============ 6. glances CPU 圆环 ============ */
  function updateRings() {
    document.querySelectorAll(".service-container.chart").forEach(function (c) {
      var el = c.querySelector(".absolute.bottom-3.right-3 > div") ||
               c.querySelector(".absolute.bottom-3.right-3");
      if (!el) return;
      var m = el.textContent.match(/(\d+(?:\.\d+)?)\s*%/);
      if (!m) return;
      c.style.setProperty("--p", m[1]);
      var t = m[1] + "%";
      if (el.textContent !== t) el.textContent = t;
    });
  }

  /* ============ 7. 自制页签（homepage v2.4.0 原生 tab 有渲染 bug） ============ */
  var TABS = [
    { id: "home", name: "主页", groups: ["设备", "服务", "影音娱乐"] },
    { id: "news", name: "资讯", groups: ["资讯"] }
  ];
  function applyTab(id) {
    var t = TABS[0];
    for (var i = 0; i < TABS.length; i++) if (TABS[i].id === id) t = TABS[i];
    document.querySelectorAll(".service-group-name").forEach(function (g) {
      var band = g.closest("section") || g.parentElement.parentElement;
      if (!band) return;
      band.style.display = t.groups.indexOf(g.textContent.trim()) !== -1 ? "" : "none";
    });
    document.querySelectorAll(".my-tab").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-tab") === t.id);
    });
  }
  function buildTabs() {
    var anchor = document.querySelector("#information-widgets");
    if (!anchor || document.querySelector(".my-tabs")) return;
    var bar = document.createElement("div");
    bar.className = "my-tabs";
    TABS.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "my-tab";
      b.setAttribute("data-tab", t.id);
      b.textContent = t.name;
      b.addEventListener("click", function () {
        localStorage.setItem("hp-tab", t.id);
        applyTab(t.id);
      });
      bar.appendChild(b);
    });
    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    applyTab(localStorage.getItem("hp-tab") || "home");
  }

  /* ============ 8. 浮窗切换器（可拖动，与 gitea 同构） ============ */
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function buildSwitcher() {
    if (document.getElementById("bg-switch-btn")) return;

    var panel = document.createElement("div");
    panel.id = "bg-switch-panel";
    var inner = '<div class="bg-panel-title">壁纸</div><div class="bg-grid">';
    WALLS.forEach(function (w) {
      inner += '<button type="button" class="bg-opt" data-id="' + w.id + '">' +
        '<img loading="lazy" src="' + w.thumb + '" alt="">' +
        '<span class="bg-opt-name">' + w.name + "</span></button>";
    });
    inner += '</div><div class="bg-panel-title">飘落特效</div><div class="bg-seg">' +
      '<button type="button" data-fx="none">无</button>' +
      '<button type="button" data-fx="sakura">🌸 樱花</button>' +
      '<button type="button" data-fx="snow">❄ 雪花</button>' +
      '</div><div class="bg-panel-title">背景模糊</div><div class="bg-seg">' +
      '<button type="button" data-blur="off">关</button>' +
      '<button type="button" data-blur="low">轻</button>' +
      '<button type="button" data-blur="mid">中</button>' +
      '<button type="button" data-blur="high">强</button>' +
      '</div><label class="bg-chk"><input type="checkbox" id="bg-burst-chk"> 点击迸溅</label>' +
      '<div class="bg-panel-hint">设置保存在本浏览器 · 按钮可拖动</div>';
    panel.innerHTML = inner;

    var btn = document.createElement("button");
    btn.id = "bg-switch-btn";
    btn.type = "button";
    btn.title = "壁纸与特效（可拖动）";
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">' +
      '<path d="M12 3c-4 3-6 6.5-6 9.5A6 6 0 0 0 12 21a6 6 0 0 0 6-8.5C18 9.5 16 6 12 3z" opacity=".55"/>' +
      '<path d="M12 3v18M12 12l3.5-2.2M12 15l-3.5-2.2" opacity=".8"/></svg>';

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    /* ---------- 位置：默认上移，避免遮挡右下角内容 ---------- */
    function placeBtn() {
      var w = btn.offsetWidth || 44, h = btn.offsetHeight || 44;
      var maxX = window.innerWidth - w - 8, maxY = window.innerHeight - h - 8;
      var sx = localStorage.getItem(LS.px), sy = localStorage.getItem(LS.py);
      var x, y;
      if (sx === null || sy === null) {
        x = maxX - 10;   /* 默认贴右 */
        y = maxY - 104;  /* 默认上移 */
      } else {
        x = clamp(parseFloat(sx), 8, maxX);
        y = clamp(parseFloat(sy), 8, maxY);
      }
      btn.style.left = Math.round(x) + "px";
      btn.style.top = Math.round(y) + "px";
    }

    /* ---------- 面板跟随按钮定位 ---------- */
    function positionPanel() {
      var r = btn.getBoundingClientRect();
      var pw = panel.offsetWidth || 276, ph = panel.offsetHeight || 420;
      var vw = window.innerWidth, vh = window.innerHeight;
      var left = clamp(r.left + r.width - pw, 8, Math.max(8, vw - pw - 8));
      var top = (r.top > ph + 16) ? (r.top - ph - 10) : Math.min(r.bottom + 10, vh - ph - 8);
      panel.style.left = Math.round(left) + "px";
      panel.style.top = Math.round(Math.max(8, top)) + "px";
    }

    function syncUI() {
      var bgId = getBgId(), fx = getFx(), blur = getBlurLevel();
      panel.querySelectorAll(".bg-opt").forEach(function (el) {
        el.classList.toggle("active", el.getAttribute("data-id") === bgId);
      });
      panel.querySelectorAll(".bg-seg button").forEach(function (el) {
        if (el.hasAttribute("data-fx")) el.classList.toggle("active", el.getAttribute("data-fx") === fx);
        if (el.hasAttribute("data-blur")) el.classList.toggle("active", el.getAttribute("data-blur") === blur);
      });
      var chk = document.getElementById("bg-burst-chk");
      if (chk) chk.checked = getBurst();
    }

    function togglePanel() {
      var open = panel.classList.toggle("open");
      if (open) { positionPanel(); btn.classList.add("active"); }
      else btn.classList.remove("active");
    }

    /* ---------- 拖动（pointer events，兼容鼠标/触屏） ---------- */
    var dragging = false, moved = false, sx0 = 0, sy0 = 0, ox = 0, oy = 0;

    btn.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true; moved = false;
      sx0 = e.clientX; sy0 = e.clientY;
      var r = btn.getBoundingClientRect();
      ox = r.left; oy = r.top;
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      btn.classList.add("dragging");
    });

    btn.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - sx0, dy = e.clientY - sy0;
      if (!moved && Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      if (!moved) return;
      var w = btn.offsetWidth, h = btn.offsetHeight;
      btn.style.left = Math.round(clamp(ox + dx, 8, window.innerWidth - w - 8)) + "px";
      btn.style.top = Math.round(clamp(oy + dy, 8, window.innerHeight - h - 8)) + "px";
      if (panel.classList.contains("open")) positionPanel();
      e.preventDefault();
    });

    btn.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      dragging = false;
      btn.classList.remove("dragging");
      try { btn.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      if (moved) {
        localStorage.setItem(LS.px, parseFloat(btn.style.left));
        localStorage.setItem(LS.py, parseFloat(btn.style.top));
      } else {
        togglePanel();
      }
    });

    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePanel(); }
    });

    document.addEventListener("click", function (e) {
      if (panel.classList.contains("open") && !panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove("open");
        btn.classList.remove("active");
      }
    });

    panel.addEventListener("click", function (e) {
      e.stopPropagation();
      var opt = e.target.closest(".bg-opt");
      if (opt) {
        localStorage.setItem(LS.bg, opt.getAttribute("data-id"));
        applyWall();
        syncUI();
        return;
      }
      var seg = e.target.closest(".bg-seg button");
      if (seg) {
        if (seg.hasAttribute("data-fx")) {
          localStorage.setItem(LS.fx, seg.getAttribute("data-fx"));
          applyFx();
        } else if (seg.hasAttribute("data-blur")) {
          localStorage.setItem(LS.blur, seg.getAttribute("data-blur"));
          applyBlur();
        }
        syncUI();
      }
    });
    panel.addEventListener("change", function (e) {
      if (e.target.id === "bg-burst-chk") {
        localStorage.setItem(LS.burst, e.target.checked ? "1" : "0");
      }
    });

    window.addEventListener("resize", function () {
      placeBtn();
      if (panel.classList.contains("open")) positionPanel();
    });

    placeBtn();
    syncUI();
  }

  /* ============ 9. 启动 ============ */
  applyWall();
  applyFx();
  updateRings();
  setInterval(updateRings, 3000);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      buildSwitcher();
      setTimeout(buildTabs, 800);
      setTimeout(buildTabs, 2500);
    });
  } else {
    buildSwitcher();
    setTimeout(buildTabs, 800);
    setTimeout(buildTabs, 2500);
  }
})();
