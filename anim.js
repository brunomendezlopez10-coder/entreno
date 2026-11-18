// Viñetas animadas de cada ejercicio: un muñeco de palitos en SVG.
// Cada ejercicio tiene 2 posturas clave (f) que se alternan suavemente.
// Postura: h = cadera [x,y], t = inclinación del tronco (grados, 0 = vertical, + hacia delante),
// w / w2 = manos, a / a2 = tobillos, hd = cabeza (opcional), toe = punta del pie (opcional).
// Codos y rodillas se calculan solos (cinemática inversa) para que los huesos no cambien de largo.
// front: true = vista de frente. ab / lb = hacia qué lado se doblan codos / rodillas en vista lateral.
(function () {
  const L = { torso: 46, neck: 13, ua: 26, fa: 24, th: 34, sh: 32 };
  const G = ['ground'];
  const bar = (y, x1 = 60, x2 = 140) => ['line', x1, y, x2, y, 4];
  const parallels = y => [['line', 64, y, 136, y, 4], ['line', 72, y, 72, 150, 3], ['line', 128, y, 128, 150, 3], G];
  const inclineBench = [['line', 90, 128, 26, 92, 6], ['line', 84, 128, 84, 150, 3], ['line', 40, 100, 40, 150, 3], G];

  const pullup = { props: [bar(20)], ab: 1, lb: 1, f: [
    { h: [106, 116], t: -5, w: [104, 20], a: [88, 164] },
    { h: [114, 76], t: -15, w: [104, 20], a: [94, 124] }] };

  const A = {
    dips: { props: parallels(80), ab: -1, lb: 1, f: [
      { h: [94, 73], t: 10, w: [106, 80], a: [80, 118] },
      { h: [77, 94], t: 25, w: [106, 80], a: [62, 138] }] },
    ppPush: { sl: true, props: [G], ab: -1, f: [
      { h: [92, 124], t: 70, w: [106, 152], a: [28, 146], toe: [30, 152] },
      { h: [94, 140], t: 85, w: [106, 152], a: [28, 146], toe: [30, 152] }] },
    archerPush: { sl: true, props: [['rect', 132, 144, 16, 6], G], ab: -1, f: [
      { h: [92, 122], t: 65, w: [138, 144], a: [28, 146], toe: [30, 152] },
      { h: [94, 138], t: 85, w: [140, 144], a: [28, 146], toe: [30, 152] }] },
    hspu: { sl: true, props: [['rect', 86, 146, 28, 6], G], ab: 1, f: [
      { h: [100, 50], t: 180, w: [92, 146], a: [100, -16] },
      { h: [100, 80], t: 180, w: [92, 146], a: [100, 14] }] },
    pullup,
    chinup: pullup,
    neutralPull: { front: true, props: [bar(20, 40, 160)], f: [
      { h: [94, 108], t: 0, w: [60, 20], w2: [128, 20], a: [88, 170], a2: [100, 170] },
      { h: [68, 76], t: 0, w: [60, 20], w2: [128, 20], a: [62, 138], a2: [74, 138] }] },
    flRow: { props: [bar(30)], ab: 1, lb: -1, f: [
      { h: [54, 80], t: 90, w: [100, 30], a: [60, 64] },
      { h: [52, 50], t: 90, w: [100, 30], a: [58, 34] }] },
    dragonFlag: { sl: true, props: [['line', 50, 122, 178, 122, 6], ['line', 60, 122, 60, 150, 3], ['line', 168, 122, 168, 150, 3], G], f: [
      { h: [142, 71], t: 170, w: [172, 116], a: [131, 6], hd: [164, 112] },
      { h: [105, 108], t: 100, w: [172, 116], a: [40, 96], hd: [164, 112] }] },
    toes2bar: { sl: true, props: [bar(20)], f: [
      { h: [100, 116], t: 0, w: [102, 20], a: [104, 176] },
      { h: [119, 112], t: -25, w: [102, 20], a: [110, 48] }] },
    lsit: { sl: true, props: parallels(92), f: [
      { h: [100, 88], t: -4, w: [102, 92], a: [164, 90] },
      { h: [100, 84], t: -6, w: [102, 92], a: [164, 80] }] },
    pistol: { props: [G], db: ['w'], f: [
      { h: [100, 84], t: 0, w: [128, 62], a: [100, 150], a2: [136, 138] },
      { h: [90, 126], t: 32, w: [150, 92], a: [100, 150], a2: [154, 128] }] },
    shrimp: { props: [G], f: [
      { h: [100, 84], t: 5, w: [126, 62], w2: [84, 100], a: [100, 150], a2: [82, 102] },
      { h: [92, 120], t: 35, w: [150, 80], w2: [66, 128], a: [100, 150], a2: [62, 132] }] },
    nordic: { props: [['rect', 56, 144, 18, 8], G], lb: 1, f: [
      { h: [100, 114], t: 0, w: [112, 64], a: [66, 148], toe: [60, 154] },
      { h: [129, 131], t: 60, w: [178, 146], a: [66, 148], toe: [60, 154] }] },
    sissy: { props: [G], ab: -1, f: [
      { h: [100, 84], t: 0, w: [124, 58], a: [100, 146] },
      { h: [88, 122], t: -32, w: [96, 70], a: [100, 146] }] },
    dbIncline: { props: inclineBench, ab: -1, db: ['w'], f: [
      { h: [80, 118], t: -60, w: [46, 48], a: [128, 150] },
      { h: [80, 118], t: -60, w: [52, 86], a: [128, 150] }] },
    dbFly: { polar: ['w', 'w2'], front: true, props: [['rect', 86, 24, 28, 130]], db: ['w', 'w2'], f: [
      { h: [100, 96], t: 0, w: [94, 6], w2: [106, 6], a: [90, 160], a2: [110, 160] },
      { h: [100, 96], t: 0, w: [42, 58], w2: [158, 58], a: [90, 160], a2: [110, 160] }] },
    latRaise: { polar: ['w', 'w2'], front: true, props: [G], db: ['w', 'w2'], f: [
      { h: [100, 84], t: 0, w: [84, 88], w2: [116, 88], a: [92, 150], a2: [108, 150] },
      { h: [100, 84], t: 0, w: [40, 36], w2: [160, 36], a: [92, 150], a2: [108, 150] }] },
    leanLat: { polar: ['w'], front: true, props: [['line', 150, -20, 150, 150, 4], G], db: ['w'], f: [
      { h: [100, 84], t: -12, w: [78, 86], w2: [146, 46], a: [94, 150], a2: [108, 150] },
      { h: [100, 84], t: -12, w: [36, 30], w2: [146, 46], a: [94, 150], a2: [108, 150] }] },
    skull: { props: inclineBench, ab: -1, db: ['w'], f: [
      { h: [80, 118], t: -60, w: [30, 47], a: [128, 150] },
      { h: [80, 118], t: -60, w: [14, 84], a: [128, 150] }] },
    dbRow: { props: [['line', 100, 132, 172, 132, 6], ['line', 166, 132, 166, 150, 3], G], ab: -1, db: ['w'], f: [
      { h: [70, 92], t: 80, w: [114, 134], w2: [124, 130], a: [60, 150], a2: [84, 150] },
      { h: [70, 92], t: 80, w: [92, 104], w2: [124, 130], a: [60, 150], a2: [84, 150] }] },
    inclineCurl: { props: [['line', 98, 126, 58, 62, 6], ['line', 92, 126, 92, 150, 3], G], ab: -1, db: ['w'], f: [
      { h: [90, 118], t: -30, w: [60, 127], a: [136, 150] },
      { h: [90, 118], t: -30, w: [84, 86], a: [136, 150] }] },
    hammer: { props: [G], ab: -1, db: ['w'], f: [
      { h: [100, 84], t: 0, w: [102, 88], a: [100, 150] },
      { h: [100, 84], t: 0, w: [118, 48], a: [100, 150] }] },
    bulgarian: { props: [['line', 24, 112, 70, 112, 6], ['line', 30, 112, 30, 150, 3], ['line', 64, 112, 64, 150, 3], G], lb: 1, db: ['w'], f: [
      { h: [96, 88], t: 5, w: [100, 92], a: [124, 150], a2: [54, 110] },
      { h: [92, 118], t: 12, w: [100, 124], a: [124, 150], a2: [54, 110] }] },
    rdl: { props: [G], lb: 1, db: ['w'], f: [
      { h: [100, 84], t: 0, w: [102, 88], a: [102, 150] },
      { h: [84, 84], t: 80, w: [129, 128], a: [104, 150] }] },
    slRdl: { props: [G], db: ['w'], f: [
      { h: [100, 84], t: 0, w: [102, 88], a: [100, 150], a2: [96, 148] },
      { h: [92, 82], t: 80, w: [137, 126], a: [100, 150], a2: [28, 72] }] },
    hipThrust: { props: [['line', 28, 106, 72, 106, 6], ['line', 34, 106, 34, 150, 3], ['line', 66, 106, 66, 150, 3], G], lb: 1, db: ['w'], f: [
      { h: [99, 130], t: -50, w: [103, 126], a: [140, 150], a2: [146, 104], hd: [52, 94] },
      { h: [110, 102], t: -88, w: [112, 98], a: [140, 150], a2: [160, 80], hd: [50, 96] }] },
    lunge: { props: [G], lb: 1, db: ['w'], f: [
      { h: [100, 84], t: 2, w: [102, 90], a: [110, 150], a2: [92, 150] },
      { h: [94, 116], t: 8, w: [100, 122], a: [132, 150], a2: [54, 146] }] },
    calf: { props: [['rect', 107, 146, 44, 8], G], lb: 1, db: ['w'], f: [
      { h: [100, 88], t: 0, w: [102, 92], a: [100, 154], toe: [114, 150] },
      { h: [100, 74], t: 0, w: [102, 78], a: [104, 140], toe: [116, 150] }] },
    cableOhExt: { props: [['pulley', 14, 14], G], cable: [[14, 14, 'w']], ab: -1, f: [
      { h: [100, 86], t: 25, w: [106, 24], a: [122, 150], a2: [78, 150] },
      { h: [100, 86], t: 25, w: [162, 12], a: [122, 150], a2: [78, 150] }] },
    pushdown: { props: [['pulley', 150, 4], G], cable: [[150, 4, 'w']], ab: -1, f: [
      { h: [96, 86], t: 10, w: [128, 58], a: [100, 150], a2: [86, 150] },
      { h: [96, 86], t: 10, w: [110, 92], a: [100, 150], a2: [86, 150] }] },
    cableFly: { polar: ['w', 'w2'], front: true, props: [['pulley', 8, 0], ['pulley', 192, 0], G], cable: [[8, 0, 'w'], [192, 0, 'w2']], f: [
      { h: [100, 84], t: 0, w: [40, 30], w2: [160, 30], a: [90, 150], a2: [110, 150] },
      { h: [100, 84], t: 0, w: [96, 82], w2: [104, 82], a: [90, 150], a2: [110, 150] }] },
    pulldown: { props: [['pulley', 112, -20], G], cable: [[112, -20, 'w']], ab: -1, lb: 1, f: [
      { h: [100, 114], t: 0, w: [108, 20], a: [68, 148], toe: [60, 152] },
      { h: [100, 114], t: -5, w: [112, 62], a: [68, 148], toe: [60, 152] }] },
    straightArm: { polar: ['w'], props: [['pulley', 176, 0], G], cable: [[176, 0, 'w']], ab: -1, f: [
      { h: [96, 86], t: 30, w: [156, 10], a: [104, 150], a2: [86, 150] },
      { h: [96, 86], t: 30, w: [112, 94], a: [104, 150], a2: [86, 150] }] },
    facePull: { props: [['pulley', 176, 26], G], cable: [[176, 26, 'w']], ab: 1, f: [
      { h: [100, 86], t: -5, w: [144, 34], a: [108, 150], a2: [92, 150] },
      { h: [100, 86], t: -5, w: [108, 26], a: [108, 150], a2: [92, 150] }] },
    cableCurl: { up: true, front: true, props: [['pulley', 6, 30], ['pulley', 194, 30], G], cable: [[6, 30, 'w'], [194, 30, 'w2']], f: [
      { h: [100, 84], t: 0, w: [40, 36], w2: [160, 36], a: [90, 150], a2: [110, 150] },
      { h: [100, 84], t: 0, w: [82, 18], w2: [118, 18], a: [90, 150], a2: [110, 150] }] },
    cableCrunch: { props: [['pulley', 150, -20], G], cable: [[150, -20, 'w']], ab: -1, lb: 1, f: [
      { h: [100, 114], t: 15, w: [120, 54], a: [68, 148], toe: [60, 152] },
      { h: [100, 114], t: 105, w: [150, 112], a: [68, 148], toe: [60, 152] }] },
  };

  /* --- geometría --- */
  const lerp = (a, b, k) => a + (b - a) * k;
  const lerpP = (p, q, k) => (p && q) ? [lerp(p[0], q[0], k), lerp(p[1], q[1], k)] : (p || q);
  function mix(f0, f1, k) {
    const o = { t: lerp(f0.t || 0, f1.t || 0, k) };
    ['h', 'w', 'w2', 'a', 'a2', 'hd', 'toe'].forEach(n => { o[n] = lerpP(f0[n], f1[n], k); });
    return o;
  }
  // Cinemática inversa de 2 huesos: devuelve [articulación, extremo (recortado si no llega)].
  function ik(root, end, l1, l2, s) {
    let dx = end[0] - root[0], dy = end[1] - root[1], d = Math.hypot(dx, dy) || 0.001;
    const ux = dx / d, uy = dy / d;
    const max = l1 + l2 - 0.01, min = Math.abs(l1 - l2) + 2;
    if (d > max) d = max; if (d < min) d = min;
    const e = [root[0] + ux * d, root[1] + uy * d];
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const px = uy, py = -ux;
    return [[root[0] + ux * a + px * h * s, root[1] + uy * a + py * h * s], e];
  }
  // En vista frontal, codos y rodillas se doblan hacia fuera.
  function outward(root, end, side, up) {
    const dx = end[0] - root[0], dy = end[1] - root[1], d = Math.hypot(dx, dy) || 1;
    const px = dy / d, py = -dx / d;
    if (up && Math.abs(py) > 0.3) return Math.sign(-py); // codos arriba (curl en polea alta)
    return Math.abs(px) > 0.3 ? Math.sign(px * side) : (Math.sign(py) || 1);
  }

  const C = { body: '#f2f3f5', back: '#7d8394', prop: '#4a4f5c', db: '#ff6b35', cable: '#8b90a0' };
  // Los huesos llevan un contorno oscuro para que se distingan cuando se cruzan.
  const ln = (p, q, c, w) => (c === C.body || c === C.back ? seg(p, q, '#12141a', w + 3) : '') + seg(p, q, c, w);
  const seg = (p, q, c, w) => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

  function drawProps(def) {
    return def.props.map(p => {
      if (p[0] === 'ground') return `<line x1="0" y1="152" x2="200" y2="152" stroke="${C.prop}" stroke-width="3"/>`;
      if (p[0] === 'line') return ln([p[1], p[2]], [p[3], p[4]], C.prop, p[5]);
      if (p[0] === 'rect') return `<rect x="${p[1]}" y="${p[2]}" width="${p[3]}" height="${p[4]}" rx="2" fill="${C.prop}"/>`;
      if (p[0] === 'pulley') return `<circle cx="${p[1]}" cy="${p[2]}" r="6" fill="none" stroke="${C.prop}" stroke-width="3"/>`;
      return '';
    }).join('');
  }

  // Hombro (izquierdo para w, derecho para w2 en vista frontal).
  function shoulderOf(def, fr, n) {
    const r = (fr.t || 0) * Math.PI / 180, dir = [Math.sin(r), -Math.cos(r)];
    const neck = [fr.h[0] + dir[0] * L.torso, fr.h[1] + dir[1] * L.torso];
    if (!def.front) return neck;
    const side = n === 'w' ? -1 : 1;
    return [neck[0] - dir[1] * 13 * side, neck[1] + dir[0] * 13 * side];
  }
  function frame(def, k) {
    const fr = mix(def.f[0], def.f[1], k);
    // polar: la mano describe un arco alrededor del hombro (elevaciones, aperturas…).
    (def.polar || []).forEach(n => {
      const f0 = def.f[0], f1 = def.f[1];
      const s0 = shoulderOf(def, f0, n), s1 = shoulderOf(def, f1, n), sk = shoulderOf(def, fr, n);
      const a0 = Math.atan2(f0[n][1] - s0[1], f0[n][0] - s0[0]);
      let a1 = Math.atan2(f1[n][1] - s1[1], f1[n][0] - s1[0]);
      if (a1 - a0 > Math.PI) a1 -= 2 * Math.PI; if (a0 - a1 > Math.PI) a1 += 2 * Math.PI;
      const d = lerp(Math.hypot(f0[n][0] - s0[0], f0[n][1] - s0[1]), Math.hypot(f1[n][0] - s1[0], f1[n][1] - s1[1]), k);
      const a = lerp(a0, a1, k);
      fr[n] = [sk[0] + Math.cos(a) * d, sk[1] + Math.sin(a) * d];
    });
    const r = fr.t * Math.PI / 180, dir = [Math.sin(r), -Math.cos(r)];
    const hip = fr.h, neck = [hip[0] + dir[0] * L.torso, hip[1] + dir[1] * L.torso];
    const head = fr.hd || [neck[0] + dir[0] * L.neck, neck[1] + dir[1] * L.neck];
    const pts = {};
    let back = '', front = '';
    if (def.front) {
      const pp = [-dir[1], dir[0]];
      const shL = [neck[0] - pp[0] * 13, neck[1] - pp[1] * 13], shR = [neck[0] + pp[0] * 13, neck[1] + pp[1] * 13];
      const hpL = [hip[0] - pp[0] * 8, hip[1] - pp[1] * 8], hpR = [hip[0] + pp[0] * 8, hip[1] + pp[1] * 8];
      front += ln(shL, shR, C.body, 6) + ln(hpL, hpR, C.body, 6);
      [[shL, fr.w, 'w', -1], [shR, fr.w2, 'w2', 1]].forEach(([s, e, n, side]) => {
        if (!e) return;
        const [j, end] = ik(s, e, L.ua, L.fa, outward(s, e, side, def.up));
        pts[n] = end; front += ln(s, j, C.body, 6) + ln(j, end, C.body, 6);
      });
      [[hpL, fr.a, -1], [hpR, fr.a2, 1]].forEach(([s, e, side]) => {
        if (!e) return;
        const [j, end] = ik(s, e, L.th, L.sh, outward(s, e, side));
        front += ln(s, j, C.body, 7) + ln(j, end, C.body, 7);
      });
    } else {
      const ab = def.ab ?? -1, lb = def.lb ?? 1;
      const limb = (root, e, l1, l2, s, col, wd) => {
        const [j, end] = ik(root, e, l1, l2, s);
        let out = ln(root, j, col, wd) + ln(j, end, col, wd);
        return { out, end };
      };
      const foot = (ank, toe, col) => (toe || ank[1] > 135) ? ln(ank, toe || [ank[0] + 10, ank[1] + 1], col, 5) : '';
      if (fr.a2) { const l = limb(hip, fr.a2, L.th, L.sh, lb, C.back, 7); back += l.out + foot(l.end, null, C.back); }
      if (fr.w2) { const l = limb(neck, fr.w2, L.ua, L.fa, ab, C.back, 6); back += l.out; pts.w2 = l.end; }
      if (def.sl && fr.a) { const dx = fr.a[0] - hip[0], dy = fr.a[1] - hip[1], d = Math.hypot(dx, dy) || 1, m = L.th + L.sh - 0.5; fr.a = [hip[0] + dx / d * m, hip[1] + dy / d * m]; }
      if (fr.a) { const l = limb(hip, fr.a, L.th, L.sh, lb, C.body, 7); front += l.out + foot(l.end, fr.toe, C.body); }
      if (fr.w) { const l = limb(neck, fr.w, L.ua, L.fa, ab, C.body, 6); front += l.out; pts.w = l.end; }
    }
    const torso = ln(hip, neck, C.body, 8) + `<circle cx="${head[0].toFixed(1)}" cy="${head[1].toFixed(1)}" r="9" fill="${C.body}"/>`;
    let cables = '';
    (def.cable || []).forEach(([x, y, n]) => { if (pts[n]) cables += `<line x1="${x}" y1="${y}" x2="${pts[n][0].toFixed(1)}" y2="${pts[n][1].toFixed(1)}" stroke="${C.cable}" stroke-width="1.5" stroke-dasharray="3 2"/>`; });
    let dbs = '';
    (def.db || []).forEach(n => { const p = pts[n]; if (p) dbs += `<rect x="${(p[0] - 10).toFixed(1)}" y="${(p[1] - 4).toFixed(1)}" width="20" height="8" rx="2" fill="${C.db}"/><rect x="${(p[0] - 12).toFixed(1)}" y="${(p[1] - 6).toFixed(1)}" width="5" height="12" rx="1.5" fill="${C.db}"/><rect x="${(p[0] + 7).toFixed(1)}" y="${(p[1] - 6).toFixed(1)}" width="5" height="12" rx="1.5" fill="${C.db}"/>`; });
    return cables + back + torso + front + dbs;
  }

  let raf = 0;
  window.ANIM = {
    has: id => !!A[id],
    // Pinta la animación del ejercicio dentro de `el` hasta que se llame a stop().
    play(el, id) {
      cancelAnimationFrame(raf);
      const def = A[id]; if (!def) { el.innerHTML = ''; return; }
      const props = drawProps(def);
      const t0 = performance.now(), P = 2800;
      const step = now => {
        const ph = ((now - t0) % P) / P;
        const k = 0.5 - 0.5 * Math.cos(ph * 2 * Math.PI);
        el.innerHTML = `<svg viewBox="0 -26 200 204" xmlns="http://www.w3.org/2000/svg">${props}${frame(def, k)}</svg>`;
        if (el.isConnected) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    },
    stop() { cancelAnimationFrame(raf); },
    ids: () => Object.keys(A),
    // Imagen fija de una postura intermedia (k de 0 a 1).
    svg: (id, k) => `<svg viewBox="0 -26 200 204" xmlns="http://www.w3.org/2000/svg">${drawProps(A[id])}${frame(A[id], k)}</svg>`,
  };
})();
