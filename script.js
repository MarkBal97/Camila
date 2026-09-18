/* =========================================================
   Feliz día de las flores amarillas — lógica de la escena
   ========================================================= */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- referencias DOM ---------------- */
  var welcomeScreen = document.getElementById('welcome-screen');
  var giftBtn = document.getElementById('gift-btn');
  var scene = document.getElementById('scene');
  var particlesCanvas = document.getElementById('particles-canvas');
  var pctx = particlesCanvas.getContext('2d');
  var butterflyLayer = document.getElementById('butterfly-layer');
  var bouquet = document.getElementById('bouquet');
  var sunflowerHolder = document.getElementById('sunflower-holder');
  var paperWrap = document.getElementById('paper-wrap');
  var messagesLayer = document.getElementById('messages-layer');
  var headline = document.getElementById('headline');
  var subheadline = document.getElementById('subheadline');
  var glowOverlay = document.getElementById('glow-overlay');
  var soundBtn = document.getElementById('sound-btn');
  var restartBtn = document.getElementById('restart-btn');
  var audio = document.getElementById('bg-music');

  /* ---------------- utilidades ---------------- */
  function rand(min, max) { return min + Math.random() * (max - min); }
  function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) { el.setAttribute(k, attrs[k]); }
    return el;
  }

  var W = window.innerWidth;
  var H = window.innerHeight;

  /* ================================================================
     PARTÍCULAS DORADAS (canvas)
     ================================================================ */
  var particles = [];
  var particleTarget = 34;

  function makeParticle() {
    return {
      x: rand(0, W),
      y: rand(0, H),
      r: rand(1, 2.6),
      baseAlpha: rand(0.25, 0.85),
      glow: Math.random() < 0.35,
      vx: rand(-0.12, 0.12),
      vy: rand(-0.22, -0.05),
      driftPhase: rand(0, Math.PI * 2),
      driftSpeed: rand(0.2, 0.6),
      twinklePhase: rand(0, Math.PI * 2),
      twinkleSpeed: rand(0.4, 1.3)
    };
  }

  function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    particlesCanvas.width = Math.floor(W * dpr);
    particlesCanvas.height = Math.floor(H * dpr);
    particlesCanvas.style.width = W + 'px';
    particlesCanvas.style.height = H + 'px';
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ensureParticleCount() {
    while (particles.length < particleTarget) { particles.push(makeParticle()); }
    while (particles.length > particleTarget) { particles.pop(); }
  }

  function drawParticles(t) {
    pctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.driftPhase += 0.012 * p.driftSpeed;
      p.x += p.vx + Math.sin(p.driftPhase) * 0.16;
      p.y += p.vy;
      if (p.y < -12) { p.y = H + 12; p.x = rand(0, W); }
      if (p.x < -12) p.x = W + 12;
      if (p.x > W + 12) p.x = -12;

      var twinkle = 0.5 + 0.5 * Math.sin(t * 0.0011 * p.twinkleSpeed + p.twinklePhase);
      var alpha = p.baseAlpha * (0.55 + 0.45 * twinkle);

      pctx.save();
      pctx.globalAlpha = alpha;
      if (p.glow) {
        pctx.shadowBlur = 9;
        pctx.shadowColor = 'rgba(255,216,115,0.9)';
      }
      pctx.fillStyle = '#ffe9b0';
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();
    }
  }

  /* ================================================================
     MARIPOSAS (SVG generado + movimiento por rAF)
     ================================================================ */
  var BUTTERFLY_COLORS = [
    { name: 'yellow', main: 'var(--bf-yellow)', accent: 'var(--bf-yellow-dark)' },
    { name: 'blue', main: 'var(--bf-blue)', accent: 'var(--bf-blue-dark)' },
    { name: 'purple', main: 'var(--bf-purple)', accent: 'var(--bf-purple-dark)' },
    { name: 'green', main: 'var(--bf-green)', accent: 'var(--bf-green-dark)' },
    { name: 'pink', main: 'var(--bf-pink)', accent: 'var(--bf-pink-dark)' },
    { name: 'turquoise', main: 'var(--bf-turquoise)', accent: 'var(--bf-turquoise-dark)' }
  ];

  function buildButterflySVG(colorSet) {
    var svg = svgEl('svg', { viewBox: '0 0 120 80', class: 'butterfly-svg' });

    function wingSide(sign, cls) {
      var g = svgEl('g', { class: 'wing ' + cls });
      var cx = 60 + sign * 25;
      var hindCx = 60 + sign * 20;
      var fore = svgEl('ellipse', {
        cx: cx, cy: 28, rx: 28, ry: 20,
        transform: 'rotate(' + (sign * 24) + ' ' + cx + ' 28)',
        class: 'wing-fore'
      });
      var hind = svgEl('ellipse', {
        cx: hindCx, cy: 54, rx: 18, ry: 15,
        transform: 'rotate(' + (sign * 10) + ' ' + hindCx + ' 54)',
        class: 'wing-hind'
      });
      var spotBig = svgEl('ellipse', {
        cx: 60 + sign * 27, cy: 24, rx: 7, ry: 5,
        transform: 'rotate(' + (sign * 24) + ' ' + (60 + sign * 27) + ' 24)',
        class: 'wing-spot'
      });
      var spotSmall = svgEl('circle', {
        cx: hindCx, cy: 52, r: 3.4,
        class: 'wing-spot'
      });
      var vein = svgEl('path', {
        d: 'M' + (60 + sign * 4) + ',22 Q' + (60 + sign * 20) + ',30 ' + (60 + sign * 6) + ',48',
        class: 'wing-vein'
      });
      g.appendChild(fore);
      g.appendChild(hind);
      g.appendChild(spotBig);
      g.appendChild(spotSmall);
      g.appendChild(vein);
      return g;
    }

    svg.appendChild(wingSide(-1, 'wing--left'));
    svg.appendChild(wingSide(1, 'wing--right'));

    var body = svgEl('ellipse', { cx: 60, cy: 40, rx: 3, ry: 22, class: 'bf-body' });
    var head = svgEl('circle', { cx: 60, cy: 15, r: 3.4, class: 'bf-body' });
    var antennaL = svgEl('path', { d: 'M59,13 C55,6 50,4 47,2', stroke: '#2a2118', 'stroke-width': 1.2, fill: 'none', 'stroke-linecap': 'round' });
    var antennaR = svgEl('path', { d: 'M61,13 C65,6 70,4 73,2', stroke: '#2a2118', 'stroke-width': 1.2, fill: 'none', 'stroke-linecap': 'round' });
    svg.appendChild(body);
    svg.appendChild(head);
    svg.appendChild(antennaL);
    svg.appendChild(antennaR);

    svg.style.setProperty('--wing-main', colorSet.main);
    svg.style.setProperty('--wing-accent', colorSet.accent);
    return svg;
  }

  var butterflies = [];
  var butterflyTarget = 0;

  function spawnButterfly() {
    var colorSet = choice(BUTTERFLY_COLORS);
    var el = document.createElement('div');
    el.className = 'butterfly';
    var size = rand(26, 46);
    var behind = Math.random() < 0.5;
    el.style.zIndex = behind ? 5 : 15;
    el.style.width = size + 'px';
    var flapDur = rand(0.55, 1.05).toFixed(2) + 's';
    el.style.setProperty('--flap-dur', flapDur);
    var svg = buildButterflySVG(colorSet);
    el.appendChild(svg);
    butterflyLayer.appendChild(el);

    var margin = 60;
    var b = {
      el: el,
      startX: rand(-margin, W + margin),
      startY: rand(-margin, H * 0.85),
      endX: rand(-margin, W + margin),
      endY: rand(-margin, H * 0.85),
      amp1: rand(30, 90),
      amp2: rand(20, 60),
      freq1: rand(0.8, 1.8),
      freq2: rand(1.2, 2.4),
      phase1: rand(0, Math.PI * 2),
      phase2: rand(0, Math.PI * 2),
      duration: rand(9000, 16000),
      startTime: performance.now() + rand(0, 600),
      size: size,
      lastX: null,
      lastY: null
    };
    butterflies.push(b);
  }

  function ensureButterflies() {
    while (butterflies.length < butterflyTarget) { spawnButterfly(); }
  }

  function removeButterfly(b) {
    if (b.el && b.el.parentNode) { b.el.parentNode.removeChild(b.el); }
  }

  function updateButterflies(now) {
    for (var i = butterflies.length - 1; i >= 0; i--) {
      var b = butterflies[i];
      var t = (now - b.startTime) / b.duration;
      if (t < 0) continue;
      if (t >= 1) {
        removeButterfly(b);
        butterflies.splice(i, 1);
        continue;
      }
      var lx = b.startX + (b.endX - b.startX) * t + Math.sin(t * Math.PI * 2 * b.freq1 + b.phase1) * b.amp1;
      var ly = b.startY + (b.endY - b.startY) * t + Math.sin(t * Math.PI * 2 * b.freq2 + b.phase2) * b.amp2;

      var angle = 0;
      if (b.lastX !== null) {
        var dx = lx - b.lastX, dy = ly - b.lastY;
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          angle = Math.atan2(dy, dx) * (180 / Math.PI) * 0.35;
        }
      }
      b.lastX = lx; b.lastY = ly;

      var fade = 1;
      if (t < 0.08) fade = t / 0.08;
      else if (t > 0.9) fade = (1 - t) / 0.1;
      fade = Math.max(0, Math.min(1, fade));

      b.el.style.opacity = fade;
      b.el.style.transform =
        'translate3d(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px,0) rotate(' + angle.toFixed(1) + 'deg)';
    }
  }

  /* ================================================================
     GIRASOLES (SVG generado)
     ================================================================ */
  function buildSunflowerSVG() {
    var svg = svgEl('svg', { viewBox: '0 0 100 100' });
    var petals = svgEl('g');
    var petalCount = 15;
    var petalD = 'M50,50 C42,44 42,19 50,7 C58,19 58,44 50,50 Z';

    for (var i = 0; i < petalCount; i++) {
      var angle = (360 / petalCount) * i + rand(-3, 3);
      var petal = svgEl('path', {
        d: petalD,
        transform: 'rotate(' + angle.toFixed(1) + ' 50 50)',
        fill: i % 2 === 0 ? 'var(--petal)' : 'var(--petal-dark)'
      });
      petals.appendChild(petal);
    }
    svg.appendChild(petals);

    var gradId = 'sfCenter' + Math.floor(Math.random() * 1e6);
    var defs = svgEl('defs');
    var grad = svgEl('radialGradient', { id: gradId, cx: '38%', cy: '35%', r: '75%' });
    grad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': 'var(--center-light)' }));
    grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': 'var(--center-dark)' }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    var center = svgEl('circle', { cx: 50, cy: 50, r: 21, fill: 'url(#' + gradId + ')' });
    svg.appendChild(center);

    var dots = svgEl('g');
    var goldenAngle = 137.508 * (Math.PI / 180);
    var dotCount = 46;
    for (var d = 0; d < dotCount; d++) {
      var a = d * goldenAngle;
      var r = 19 * Math.sqrt(d / dotCount);
      var dx = 50 + r * Math.cos(a);
      var dy = 50 + r * Math.sin(a);
      var dot = svgEl('circle', {
        cx: dx.toFixed(2), cy: dy.toFixed(2), r: 1.05,
        fill: d % 2 === 0 ? 'rgba(0,0,0,0.28)' : 'rgba(255,214,140,0.28)'
      });
      dots.appendChild(dot);
    }
    svg.appendChild(dots);

    var ring = svgEl('circle', { cx: 50, cy: 50, r: 21, fill: 'none', stroke: 'rgba(0,0,0,0.25)', 'stroke-width': 0.6 });
    svg.appendChild(ring);

    return svg;
  }

  var SUNFLOWER_SLOTS = [
    { x: '50%', y: '42%', rot: 0, scale: 1.15, sway: 6.5 },
    { x: '28%', y: '52%', rot: -18, scale: 0.85, sway: 5.5 },
    { x: '72%', y: '54%', rot: 16, scale: 0.9, sway: 5.8 },
    { x: '12%', y: '66%', rot: -30, scale: 0.68, sway: 6.2 },
    { x: '88%', y: '68%', rot: 28, scale: 0.7, sway: 6.8 },
    { x: '38%', y: '25%', rot: -8, scale: 0.72, sway: 5.2 },
    { x: '62%', y: '23%', rot: 10, scale: 0.78, sway: 5.9 },
    { x: '50%', y: '73%', rot: 2, scale: 0.55, sway: 4.8 },
    { x: '50%', y: '12%', rot: -2, scale: 0.5, sway: 6.1 }
  ];

  var sunflowerElements = [];

  function buildSunflowers() {
    SUNFLOWER_SLOTS.forEach(function (slot) {
      var wrap = document.createElement('div');
      wrap.className = 'sunflower';
      wrap.style.setProperty('--sx', slot.x);
      wrap.style.setProperty('--sy', slot.y);
      wrap.style.setProperty('--srot', slot.rot + 'deg');
      wrap.style.setProperty('--sscale', slot.scale);
      wrap.style.setProperty('--sway-dur', slot.sway + 's');
      wrap.style.setProperty('--ssize', '40%');
      wrap.appendChild(buildSunflowerSVG());
      sunflowerHolder.appendChild(wrap);
      sunflowerElements.push(wrap);
    });
  }

  function revealSunflowers(count) {
    for (var i = 0; i < count && i < sunflowerElements.length; i++) {
      sunflowerElements[i].classList.add('is-visible');
    }
  }

  /* ================================================================
     MENSAJES ROMÁNTICOS
     ================================================================ */
  var MESSAGES = [
    'Siempre pienso en ti',
    'Te quiero muchísimo',
    'Eres mi paz y mi alegría',
    'Eres mi sol de cada día',
    'Contigo quiero existir',
    'Gracias por existir'
  ];

  var MESSAGE_POSITIONS = [
    { left: '8%', top: '22%', dir: 'left' },
    { left: '76%', top: '16%', dir: 'right' },
    { left: '5%', top: '58%', dir: 'left' },
    { left: '80%', top: '56%', dir: 'right' },
    { left: '14%', top: '80%', dir: 'left' },
    { left: '70%', top: '80%', dir: 'right' }
  ];

  function showMessage(index) {
    var text = MESSAGES[index];
    var pos = MESSAGE_POSITIONS[index % MESSAGE_POSITIONS.length];
    var el = document.createElement('div');
    el.className = 'message from-' + pos.dir;
    el.style.left = pos.left;
    el.style.top = pos.top;
    var inner = document.createElement('span');
    inner.className = 'message__inner';
    inner.textContent = text;
    el.appendChild(inner);
    messagesLayer.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add('is-visible');
    });
    return el;
  }

  /* ================================================================
     TEMPORIZADOR / TIMELINE
     ================================================================ */
  var timers = [];
  function after(ms, fn) {
    var id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function runTimeline() {
    // Fase 1 — 0 a 7s: partículas + primeras mariposas, ramo aún no visible
    particleTarget = 26;
    butterflyTarget = 3;

    after(4800, function () {
      paperWrap.classList.add('is-visible');
    });

    // Fase 2 — 7 a 15s: más mariposas, primeros girasoles, texto principal
    after(7000, function () {
      butterflyTarget = 7;
      revealSunflowers(3);
      headline.classList.add('is-visible');
    });
    after(9000, function () {
      subheadline.classList.add('is-visible');
    });
    after(11000, function () {
      revealSunflowers(5);
    });

    // Fase 3 — 15 a 25s: ramo completo, más mariposas, primeros mensajes
    after(15000, function () {
      revealSunflowers(7);
      butterflyTarget = 11;
      particleTarget = 32;
    });
    after(16000, function () { showMessage(0); });
    after(19500, function () { showMessage(1); });
    after(22500, function () { showMessage(2); });

    // Fase 4 — 25 a 35s: ramo como elemento hero, más luz, mensajes finales
    after(25000, function () {
      revealSunflowers(9);
      butterflyTarget = 14;
      particleTarget = 40;
      bouquet.classList.add('is-glowing');
      glowOverlay.classList.add('is-bright');
    });
    after(26500, function () { showMessage(3); });
    after(29500, function () { showMessage(4); });
    after(32500, function () { showMessage(5); });

    // Fase 5 — 35 a 40s: estado cálido y estable, todo sigue con vida
    after(35500, function () {
      bouquet.classList.add('is-breathing');
    });
  }

  /* ================================================================
     BUCLE PRINCIPAL
     ================================================================ */
  var rafId = null;

  function tick(now) {
    ensureParticleCount();
    drawParticles(now);
    ensureButterflies();
    updateButterflies(now);
    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (rafId === null) {
      rafId = requestAnimationFrame(tick);
    }
  }
  function stopLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /* ================================================================
     ESTADO / CONTROLES
     ================================================================ */
  var started = false;

  function resetSceneDOM() {
    clearTimers();
    butterflies.forEach(removeButterfly);
    butterflies = [];
    butterflyTarget = 0;
    particleTarget = 26;
    messagesLayer.innerHTML = '';
    headline.classList.remove('is-visible');
    subheadline.classList.remove('is-visible');
    paperWrap.classList.remove('is-visible');
    bouquet.classList.remove('is-glowing', 'is-breathing');
    glowOverlay.classList.remove('is-bright');
    sunflowerElements.forEach(function (el) { el.classList.remove('is-visible'); });
  }

  function beginExperience() {
    if (started) return;
    started = true;
    welcomeScreen.classList.add('is-hidden');
    scene.hidden = false;
    requestAnimationFrame(function () {
      scene.classList.add('is-visible');
    });
    startLoop();
    runTimeline();
  }

  function restartExperience() {
    resetSceneDOM();
    startLoop();
    runTimeline();
  }

  /* ---------------- sonido opcional ---------------- */
  var musicOn = false;
  var audioAvailable = true;

  audio.addEventListener('error', function () {
    audioAvailable = false;
    soundBtn.classList.add('is-disabled');
    soundBtn.title = 'Música no disponible';
  });

  function toggleMusic() {
    if (!audioAvailable) return;
    if (musicOn) {
      audio.pause();
      musicOn = false;
      soundBtn.setAttribute('aria-pressed', 'false');
      soundBtn.title = 'Activar música';
    } else {
      var playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.then(function () {
          musicOn = true;
          soundBtn.setAttribute('aria-pressed', 'true');
          soundBtn.title = 'Silenciar música';
        }).catch(function () {
          audioAvailable = false;
          soundBtn.classList.add('is-disabled');
          soundBtn.title = 'Música no disponible';
        });
      } else {
        musicOn = true;
        soundBtn.setAttribute('aria-pressed', 'true');
      }
    }
  }

  /* ---------------- eventos ---------------- */
  window.addEventListener('resize', resizeCanvas);
  giftBtn.addEventListener('click', beginExperience);
  restartBtn.addEventListener('click', restartExperience);
  soundBtn.addEventListener('click', toggleMusic);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stopLoop(); } else if (started) { startLoop(); }
  });

  /* ---------------- inicialización ---------------- */
  resizeCanvas();
  buildSunflowers();
  ensureParticleCount();
})();
