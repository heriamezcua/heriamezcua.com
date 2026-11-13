// Interactive hero: a generic banking platform drawn in isometric view.
// Hover a service to inspect it, click it to take it down, click empty space to send requests.
(function () {
  'use strict';

  // ---------- a generic banking platform, not any real system ----------
  var NODES = [
    { id: 'client',   label: 'client',        x: 0,   y: .50, w: .9,  h: .7,  role: 'Whoever calls the API: a web app, a mobile app, another system.' },
    { id: 'gateway',  label: 'api-gateway',   x: .20, y: .50, w: 1.25, h: 1.3, role: 'Single entry point. Routes each request to the service that owns it.' },
    { id: 'auth',     label: 'auth',          x: .40, y: .05, w: 1,   h: 1,   role: 'Checks the token before a request reaches any service.' },
    { id: 'users',    label: 'customers',     x: .45, y: .30, w: 1,   h: 1,   role: 'Owns customer profiles and their contact details.' },
    { id: 'catalog',  label: 'accounts',      x: .45, y: .55, w: 1,   h: 1,   role: 'Serves accounts and balances. Reads go through the cache first.' },
    { id: 'orders',   label: 'transfers',     x: .45, y: .80, w: 1,   h: 1.15, role: 'Moves money between accounts as one consistent operation.' },
    { id: 'payments', label: 'fraud-check',   x: .70, y: .95, w: 1,   h: 1,   role: 'Scores each transfer before any money moves.' },
    { id: 'cache',    label: 'cache',         x: .70, y: .42, w: .9,  h: .6,  role: 'Keeps hot reads in memory so the ledger is not asked twice.', bands: 1 },
    { id: 'bus',      label: 'event-bus',     x: .72, y: .10, w: 1.1, h: .55, role: 'Carries events so slow work never blocks a response.' },
    { id: 'notify',   label: 'notifications', x: 1,   y: .30, w: 1,   h: 1,   role: 'Listens for events and tells the customer what happened.' },
    { id: 'db',       label: 'ledger',        x: .95, y: .65, w: 1.15, h: 1.7, role: 'Every movement of money is recorded here, once.', bands: 3 }
  ];
  var EDGES = [
    ['client', 'gateway'], ['gateway', 'auth'], ['gateway', 'users'], ['gateway', 'catalog'], ['gateway', 'orders'],
    ['users', 'db'], ['catalog', 'cache'], ['catalog', 'db'], ['orders', 'payments'], ['orders', 'db'],
    ['orders', 'bus'], ['users', 'bus'], ['bus', 'notify']
  ];
  var ROUTES = [
    { verb: 'GET',  path: '/accounts',       ok: 200, turn: 3, event: null,
      hops: ['client', 'gateway', 'catalog', 'cache', 'catalog', 'gateway', 'client'] },
    { verb: 'GET',  path: '/accounts/{id}/movements', ok: 200, turn: 5, event: null,
      hops: ['client', 'gateway', 'catalog', 'cache', 'catalog', 'db', 'catalog', 'gateway', 'client'] },
    { verb: 'POST', path: '/transfers',         ok: 201, turn: 7, event: ['orders', 'bus', 'notify'],
      hops: ['client', 'gateway', 'auth', 'gateway', 'orders', 'payments', 'orders', 'db', 'orders', 'gateway', 'client'] },
    { verb: 'GET',  path: '/customers/me',       ok: 200, turn: 5, event: null,
      hops: ['client', 'gateway', 'auth', 'gateway', 'users', 'db', 'users', 'gateway', 'client'] },
    { verb: 'POST', path: '/customers',          ok: 201, turn: 3, event: ['users', 'bus', 'notify'],
      hops: ['client', 'gateway', 'users', 'db', 'users', 'gateway', 'client'] }
  ];

  var byId = {}, adj = {};
  NODES.forEach(function (n, i) { n.i = i; byId[n.id] = n; adj[n.id] = []; });
  EDGES.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });

  function wayBack(from) {
    var prev = {}, queue = [from], seen = {}; seen[from] = true;
    while (queue.length) {
      var cur = queue.shift();
      if (cur === 'client') break;
      adj[cur].forEach(function (nx) { if (!seen[nx]) { seen[nx] = true; prev[nx] = cur; queue.push(nx); } });
    }
    var path = ['client'];
    while (path[path.length - 1] !== from) path.push(prev[path[path.length - 1]]);
    return path.reverse();
  }

  // ---------- state ----------
  var hero = document.getElementById('hero');
  var canvas = document.getElementById('stage');
  var ctx = canvas.getContext('2d');
  var inspector = document.getElementById('inspector');
  var logEl = document.getElementById('log');
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COARSE = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  var W = 0, H = 0, DPR = 1, region = { x: 0, y: 0, w: 1, h: 1 };
  var pointer = { x: 0, y: 0, sx: 0, sy: 0, inside: false };
  var pos = {}, pulse = {}, down = {}, packets = [], hovered = null;
  var iso = { S: 1, cx: 0, cy: 0, px: 0, py: 0, tw: 20 };
  var spawnIn = 300, last = 0;
  NODES.forEach(function (n) { pulse[n.id] = 0; });

  var P = { ink: '#101C2E', paper: '#E9EDF2', req: '#2447F9', res: '#101C2E', evt: '#0F8B8D', err: '#C81E35',
            top: '#F8FAFC', left: '#BCC7D5', right: '#D4DCE6' };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function alpha(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function resize() {
    var r = hero.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    if (W >= 980) {
      var pad = Math.max(40, (W - 1320) / 2 + 40), inner = W - pad * 2;
      region = { x: pad + inner * 0.37, y: 40, w: inner * 0.63 + pad * 0.4, h: H - 80 };
    } else {
      region = { x: 12, y: H - 400, w: W - 24, h: 372 };
    }
  }

  function computePositions() {
    var r = region;
    var S = Math.min(r.w / 1.22, (r.h - 120) / 0.66);
    iso.S = S; iso.tw = clamp(S * 0.082, 17, 60);
    iso.cx = r.x + r.w * 0.5 - 0.1 * S * 0.866;
    iso.cy = r.y + r.h * 0.5 + 34 - 0.05 * S * 0.5;
    iso.px = 0; iso.py = 0;
    if (pointer.inside && !REDUCED && !COARSE) { iso.px = (pointer.sx / W - 0.5) * -30; iso.py = (pointer.sy / H - 0.5) * -18; }
    NODES.forEach(function (n) {
      var depth = 0.35 + n.x;
      pos[n.id] = {
        x: iso.cx + (n.x - n.y) * S * 0.866 + iso.px * depth,
        y: iso.cy + (n.x + n.y - 1) * S * 0.5 + iso.py * depth
      };
    });
  }
  function ground(u, v) {
    return { x: iso.cx + (u - v) * iso.S * 0.866 + iso.px * 0.6, y: iso.cy + (u + v - 1) * iso.S * 0.5 + iso.py * 0.6 };
  }
  function nodeH(n) { return down[n.id] ? 4 : iso.tw * 0.62 * n.h + pulse[n.id] * iso.tw * 0.14; }
  function segLen(a, b) { return Math.hypot(pos[b].x - pos[a].x, pos[b].y - pos[a].y); }

  // ---------- simulation ----------
  function spawn(route) {
    if (packets.length > 70) return;
    route = route || ROUTES[Math.floor(Math.random() * ROUTES.length)];
    packets.push({ route: route, hops: route.hops, i: 0, t: 0, kind: 'req', start: performance.now(), status: route.ok, turn: route.turn });
    pulse.client = 1;
  }
  function finish(p, now) {
    var ms = Math.max(8, Math.round((now - p.start) / 18));
    var li = document.createElement('li'), st = document.createElement('span');
    st.className = p.status >= 500 ? 'ko' : 'ok';
    st.textContent = String(p.status);
    li.appendChild(document.createTextNode(p.route.verb + ' ' + p.route.path + '  '));
    li.appendChild(st);
    li.appendChild(document.createTextNode('  ' + ms + ' ms'));
    logEl.appendChild(li);
    while (logEl.children.length > 4) logEl.removeChild(logEl.firstChild);
  }
  function update(dt, now) {
    spawnIn -= dt;
    if (spawnIn <= 0) { spawn(); spawnIn = (REDUCED ? 2600 : 560) + Math.random() * 480; }
    NODES.forEach(function (n) { pulse[n.id] = Math.max(0, pulse[n.id] - dt / 520); });
    pointer.sx = lerp(pointer.sx, pointer.x, 0.2); pointer.sy = lerp(pointer.sy, pointer.y, 0.2);

    var speed = (REDUCED ? 170 : 330) * (W < 980 ? 0.6 : 1);
    for (var k = packets.length - 1; k >= 0; k--) {
      var p = packets[k];
      var len = Math.max(30, segLen(p.hops[p.i], p.hops[p.i + 1]));
      p.t += dt / 1000 * (p.kind === 'evt' ? speed * 0.7 : speed) / len;
      if (p.t < 1) continue;
      p.t = 0; p.i += 1;
      var at = p.hops[p.i];
      pulse[at] = 1;
      if (down[at] && p.kind === 'evt') { packets.splice(k, 1); continue; }
      if (down[at] && p.kind === 'req') {
        p.kind = 'err'; p.status = 503; p.hops = wayBack(at); p.i = 0; p.turn = -1;
      } else if (p.kind === 'req' && p.i === p.turn) {
        p.kind = 'res';
        if (p.route.event) packets.push({ route: p.route, hops: p.route.event, i: 0, t: 0, kind: 'evt', start: now, status: 0, turn: -1 });
      }
      if (p.i >= p.hops.length - 1) {
        if (p.kind !== 'evt') finish(p, now);
        packets.splice(k, 1);
      }
    }
  }

  // ---------- drawing ----------
  function quad(a, b, c, d) {
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
  }
  function block(n) {
    var p = pos[n.id], x = p.x, y = p.y, tw = iso.tw * n.w, th = tw * 0.5, h = nodeH(n);
    var isDown = !!down[n.id], hot = n.id === hovered;
    var stroke = isDown ? P.err : (hot ? P.req : P.ink);

    quad([x, y + th + 10 - th], [x + tw + 12, y + 8], [x + 12, y + th + 14], [x - tw + 12, y + 8]);
    ctx.fillStyle = alpha(P.ink, 0.09); ctx.fill();

    ctx.lineJoin = 'round'; ctx.lineWidth = hot ? 2.2 : 1.5; ctx.strokeStyle = stroke;
    ctx.setLineDash(isDown ? [5, 4] : []);
    quad([x - tw, y - h], [x, y - h + th], [x, y + th], [x - tw, y]);
    ctx.fillStyle = isDown ? '#E7C3C9' : P.left; ctx.fill(); ctx.stroke();
    quad([x + tw, y - h], [x, y - h + th], [x, y + th], [x + tw, y]);
    ctx.fillStyle = isDown ? '#F0D3D8' : P.right; ctx.fill(); ctx.stroke();
    quad([x, y - h - th], [x + tw, y - h], [x, y - h + th], [x - tw, y - h]);
    ctx.fillStyle = isDown ? '#F8E6E9' : P.top; ctx.fill();
    if (!isDown && pulse[n.id] > 0.02) { ctx.fillStyle = alpha(P.req, pulse[n.id] * 0.38); ctx.fill(); }
    ctx.stroke();
    ctx.setLineDash([]);

    if (n.bands && !isDown) {
      ctx.lineWidth = 1; ctx.strokeStyle = alpha(P.ink, 0.55);
      for (var b = 1; b <= n.bands; b++) {
        var yy = -h + h * b / (n.bands + 1);
        ctx.beginPath(); ctx.moveTo(x - tw, y + yy); ctx.lineTo(x, y + yy + th); ctx.lineTo(x + tw, y + yy); ctx.stroke();
      }
    }

    var fs = W < 980 ? 9.5 : 12;
    ctx.font = '500 ' + fs + 'px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var tx = x, ty = y - h - th - fs * 0.5 - 7, wd = ctx.measureText(n.label).width + 10;
    ctx.fillStyle = alpha(P.paper, 0.9); ctx.fillRect(tx - wd / 2, ty - fs * 0.5 - 3, wd, fs + 6);
    ctx.fillStyle = isDown ? P.err : P.ink; ctx.fillText(n.label, tx, ty + 0.5);
    if (isDown) { ctx.lineWidth = 1; ctx.strokeStyle = P.err; ctx.beginPath(); ctx.moveTo(tx - wd / 2 + 5, ty); ctx.lineTo(tx + wd / 2 - 5, ty); ctx.stroke(); }
  }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    computePositions();

    var lo = -0.2, hi = 1.2, c = [ground(lo, lo), ground(hi, lo), ground(hi, hi), ground(lo, hi)];
    quad([c[0].x, c[0].y], [c[1].x, c[1].y], [c[2].x, c[2].y], [c[3].x, c[3].y]);
    ctx.fillStyle = alpha(P.ink, 0.035); ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = alpha(P.ink, 0.28); ctx.stroke();
    ctx.strokeStyle = alpha(P.ink, 0.09);
    for (var g = 1; g < 10; g++) {
      var f = lo + g * (hi - lo) / 10, a = ground(f, lo), b = ground(f, hi), d = ground(lo, f), e = ground(hi, f);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.moveTo(d.x, d.y); ctx.lineTo(e.x, e.y); ctx.stroke();
    }

    EDGES.forEach(function (ed) {
      var hot = hovered && (ed[0] === hovered || ed[1] === hovered), dead = down[ed[0]] || down[ed[1]];
      ctx.lineWidth = hot ? 2.4 : 1.4;
      ctx.strokeStyle = dead ? alpha(P.err, 0.6) : (hot ? P.req : alpha(P.ink, 0.42));
      ctx.setLineDash(dead ? [5, 5] : []);
      ctx.beginPath(); ctx.moveTo(pos[ed[0]].x, pos[ed[0]].y); ctx.lineTo(pos[ed[1]].x, pos[ed[1]].y); ctx.stroke();
    });
    ctx.setLineDash([]);

    NODES.slice().sort(function (m, n) { return (m.x + m.y) - (n.x + n.y); }).forEach(block);

    packets.forEach(function (p) {
      var A = byId[p.hops[p.i]], B = byId[p.hops[p.i + 1]], a2 = pos[A.id], b2 = pos[B.id];
      var x = lerp(a2.x, b2.x, p.t), y = lerp(a2.y, b2.y, p.t);
      var lift = lerp(nodeH(A), nodeH(B), p.t) + 8 + Math.sin(Math.PI * p.t) * iso.tw * 0.75;
      var r = (p.kind === 'evt' ? 4 : 5.5) * (W < 980 ? 0.75 : 1);
      ctx.fillStyle = alpha(P.ink, 0.16);
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.1, r * 0.55, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y - lift, r, 0, 6.283);
      if (p.kind === 'res') { ctx.fillStyle = P.top; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = P.ink; ctx.stroke(); }
      else { ctx.fillStyle = P[p.kind]; ctx.fill(); }
    });

    ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
    ctx.font = '400 11px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillStyle = alpha(P.ink, 0.6);
    ctx.fillText('filled = request · hollow = response · teal = event', Math.min(W - 16, region.x + region.w - 8), H - 18);
  }

  // ---------- interaction ----------
  function hit(x, y) {
    var best = null, bestD = 1e9;
    NODES.forEach(function (n) {
      var p = pos[n.id]; if (!p) return;
      var d = Math.hypot(x - p.x, (y - (p.y - nodeH(n) * 0.5)) * 1.15);
      if (d < bestD) { bestD = d; best = n.id; }
    });
    return bestD < Math.max(COARSE ? 30 : 22, iso.tw * 1.05) ? best : null;
  }
  function describe() {
    inspector.textContent = '';
    if (!hovered) {
      inspector.textContent = COARSE
        ? 'Tap a service to take it down. Tap empty space to send requests.'
        : 'Hover a service to see what it does. Click it to take it down.';
      return;
    }
    var n = byId[hovered], b = document.createElement('b');
    b.textContent = n.label; inspector.appendChild(b);
    if (down[n.id]) {
      var s = document.createElement('span'); s.className = 'down'; s.textContent = ' is down. ';
      inspector.appendChild(s);
      inspector.appendChild(document.createTextNode('Requests that need it come back as 503. Click to bring it up.'));
    } else {
      inspector.appendChild(document.createTextNode(' · ' + n.role));
    }
  }
  function setPointer(e) {
    var r = hero.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    if (!pointer.inside) { pointer.sx = pointer.x; pointer.sy = pointer.y; }
    pointer.inside = true;
  }
  hero.addEventListener('pointermove', function (e) {
    setPointer(e);
    var h = hit(pointer.x, pointer.y);
    if (h !== hovered) { hovered = h; describe(); }
    canvas.style.cursor = h && h !== 'client' ? 'pointer' : 'default';
  });
  hero.addEventListener('pointerleave', function () {
    pointer.inside = false;
    if (hovered) { hovered = null; describe(); }
  });
  hero.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('button, a')) return;
    setPointer(e);
    var h = hit(pointer.x, pointer.y);
    if (h && h !== 'client') {
      if (down[h]) delete down[h]; else down[h] = true;
      pulse[h] = 1; hovered = h; describe();
    } else {
      spawn(ROUTES[0]);
      setTimeout(function () { spawn(ROUTES[2]); }, 110);
      setTimeout(function () { spawn(ROUTES[3]); }, 220);
    }
    if (COARSE) pointer.inside = false;
  });

  function frame(now) {
    var dt = Math.min(50, now - (last || now)); last = now;
    update(dt, now); draw();
    requestAnimationFrame(frame);
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-go]'), function (btn) {
    btn.addEventListener('click', function () {
      var t = document.getElementById(btn.getAttribute('data-go'));
      if (t) t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    });
  });
  if (window.ResizeObserver) new ResizeObserver(resize).observe(hero);
  window.addEventListener('resize', resize);
  resize(); describe(); computePositions();
  spawn(ROUTES[2]); spawn(ROUTES[1]); spawn(ROUTES[3]);
  packets[0].i = 4; packets[0].t = 0.4;
  packets[1].i = 1; packets[1].t = 0.6;
  packets[2].i = 2; packets[2].t = 0.3;
  requestAnimationFrame(frame);
})();
