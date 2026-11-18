'use strict';
/* Entreno — PWA de entrenamiento, nutrición y seguimiento de peso.
   Todos los datos se guardan en el propio iPhone (localStorage). */

const KEY = 'entreno-v1';
const DEFAULT = () => ({
  profile: { sex: 'h', age: 25, height: 178, weight: 75, activity: 1.55, goal: 'volumen' },
  workouts: [], active: null, routines: [], body: [], food: {}, recent: [],
});
let db = load();
function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d) return Object.assign(DEFAULT(), d); } catch (e) {}
  return DEFAULT();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { alert('No se pudo guardar: ' + e.message); }
}

/* ---------- utilidades ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const dkey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return dkey(d); };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDay = (d, o = { weekday: 'long', day: 'numeric', month: 'long' }) => cap(new Date(d).toLocaleDateString('es-ES', o));
const n1 = x => (Math.round(x * 10) / 10).toLocaleString('es-ES');
const n0 = x => Math.round(x).toLocaleString('es-ES');
const num = v => { const x = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(x) ? x : null; };
const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const EQ = { cal: 'Calistenia', man: 'Mancuernas', pol: 'Polea alta' };
const DOW = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0];
const UNIT_LABEL = { lastre: 'lastre kg', kg: 'kg', seg: 'kg' };
const repTop = r => { const p = String(r).split('-').map(Number); return p[1] || p[0] || 0; };
const repLow = r => Number(String(r).split('-')[0]) || 0;

/* ---------- navegación ---------- */
const nav = { tab: 'today', stack: [] };
const TITLES = { today: 'Hoy', history: 'Historial', nutrition: 'Nutrición', progress: 'Progreso', study: 'Estudio' };
const state = { today: { dow: new Date().getDay() }, nutrition: { date: dkey() }, progress: { seg: 'body', ex: null, metric: 'e1rm' } };

function go(screen, params = {}) { nav.stack.push({ screen, params }); render(); window.scrollTo(0, 0); }
function back() { nav.stack.pop(); render(); }
function setTab(t) { nav.tab = t; nav.stack = []; render(); window.scrollTo(0, 0); }
function current() { return nav.stack[nav.stack.length - 1] || { screen: nav.tab, params: state[nav.tab] || {} }; }

function render() {
  const cur = current();
  const s = SCREENS[cur.screen](cur.params);
  $('#title').textContent = s.title;
  $('#back').classList.toggle('hidden', nav.stack.length === 0);
  $('#top-action').innerHTML = s.action || '';
  $('#view').innerHTML = s.html;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === nav.tab));
  bannerMode = null; tick();
  if (s.after) s.after();
}

/* ---------- lógica de entrenamiento ---------- */
function sortedWorkouts() { return [...db.workouts].sort((a, b) => b.start - a.start); }
function lastPerf(exId) {
  for (const w of sortedWorkouts()) {
    const e = w.exercises.find(x => x.id === exId);
    if (e && e.sets.length) return { sets: e.sets, date: w.start };
  }
  return null;
}
function fmtSet(unit, s) {
  if (unit === 'seg') return `${s.r} s` + (s.w ? ` +${n1(s.w)}` : '');
  if (unit === 'lastre') return (s.w ? `+${n1(s.w)}` : 'PC') + ` × ${s.r}`;
  return `${n1(s.w || 0)} kg × ${s.r}`;
}
function suggestion(exId, reps) {
  const last = lastPerf(exId);
  const e = EXERCISES[exId] || {};
  if (!last) return { text: `Primera vez: elige una carga con la que llegues a ${reps} reps dejando 1–2 en reserva.`, cls: '' };
  const top = repTop(reps);
  const allTop = last.sets.every(s => s.r >= top);
  const summary = last.sets.map(s => fmtSet(e.unit, s)).join(' · ');
  if (allTop) return { text: `Última: ${summary}. ⬆️ Sube carga (+1–2,5 kg) o pasa a una variante más difícil.`, cls: 'up' };
  return { text: `Última: ${summary}. ➡️ Misma carga, intenta +1 rep en cada serie.`, cls: '' };
}
function newSets(exId, rounds) {
  const e = EXERCISES[exId] || {};
  const last = lastPerf(exId);
  return Array.from({ length: rounds }, (_, k) => ({
    w: last ? (last.sets[Math.min(k, last.sets.length - 1)].w ?? '') : (e.unit === 'kg' ? '' : 0),
    r: '', done: false,
  }));
}
function workoutFromPlan(dow) {
  const p = PLAN[dow];
  const exercises = [];
  p.blocks.forEach((b, bi) => b.items.forEach((it, ii) => {
    const e = EXERCISES[it.ex];
    exercises.push({
      id: it.ex, name: e.n, unit: e.unit, reps: it.reps, tech: it.tech || '',
      label: String.fromCharCode(65 + bi) + (b.items.length > 1 ? ii + 1 : ''),
      endOfBlock: ii === b.items.length - 1, rest: b.rest, sets: newSets(it.ex, b.rounds),
    });
  }));
  return { id: uid(), title: p.title, planKey: p.key, start: Date.now(), exercises, restEnd: 0 };
}
function workoutFromRoutine(r) {
  return {
    id: uid(), title: r.name, routineId: r.id, start: Date.now(), restEnd: 0,
    exercises: r.items.map((it, i) => {
      const e = EXERCISES[it.ex];
      return { id: it.ex, name: e.n, unit: e.unit, reps: it.reps, tech: '', label: String(i + 1), endOfBlock: true, rest: 120, sets: newSets(it.ex, it.sets) };
    }),
  };
}
function startWorkout(w) {
  if (db.active && !confirm('Ya tienes un entreno en curso. ¿Descartarlo y empezar otro?')) return;
  db.active = w; save(); go('active');
}
function bodyWeightAt(t) {
  const k = dkey(new Date(t));
  const list = [...db.body].filter(b => b.weight).sort((a, b) => a.date.localeCompare(b.date));
  let w = null;
  for (const b of list) { if (b.date <= k) w = b.weight; }
  return w ?? (list[0] ? list[0].weight : db.profile.weight);
}
function latestWeight() {
  const list = db.body.filter(b => b.weight).sort((a, b) => b.date.localeCompare(a.date));
  return list[0] ? list[0].weight : db.profile.weight;
}
function volume(w) {
  let v = 0;
  w.exercises.forEach(e => e.sets.forEach(s => { if (e.unit !== 'seg') v += ((e.unit === 'lastre' ? bodyWeightAt(w.start) : 0) + (s.w || 0)) * (s.r || 0); }));
  return v;
}

/* ---------- nutrición ---------- */
function targets() {
  const p = db.profile, w = latestWeight();
  const bmr = 10 * w + 6.25 * p.height - 5 * p.age + (p.sex === 'm' ? -161 : 5);
  const tdee = bmr * p.activity;
  const adj = { volumen: 0.1, mantener: 0, definicion: -0.2 }[p.goal] ?? 0;
  const kcal = tdee * (1 + adj);
  const prot = w * (p.goal === 'definicion' ? 2.2 : 2.0);
  const fat = w * (p.goal === 'definicion' ? 0.8 : 0.9);
  const carbs = Math.max(0, (kcal - prot * 4 - fat * 9) / 4);
  return { kcal, prot, fat, carbs, tdee, w };
}
function dayTotals(k) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  (db.food[k] || []).forEach(e => { t.kcal += e.kcal; t.p += e.p; t.c += e.c; t.f += e.f; });
  return t;
}
const LOCAL_FOODS = FOODS.map(([name, cat, kcal, p, c, f, fib, star]) => ({ name, cat, kcal, p, c, f, fib, star: !!star, src: 'local' }));
const protDensity = f => f.kcal > 0 ? f.p / f.kcal * 100 : 0;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
let offResults = null, offStatus = '';

async function searchOFF(q) {
  offStatus = 'Buscando…'; offResults = null; renderFoodList();
  try {
    const url = 'https://es.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=25&fields=product_name,brands,nutriments&search_terms=' + encodeURIComponent(q);
    const res = await fetch(url);
    const data = await res.json();
    offResults = (data.products || []).map(pr => {
      const nu = pr.nutriments || {};
      const kcal = nu['energy-kcal_100g'] ?? (nu['energy_100g'] ? nu['energy_100g'] / 4.184 : null);
      if (!pr.product_name || kcal == null) return null;
      return {
        name: pr.product_name + (pr.brands ? ` (${pr.brands.split(',')[0]})` : ''), cat: 'Open Food Facts', src: 'off',
        kcal: +kcal, p: +(nu.proteins_100g || 0), c: +(nu.carbohydrates_100g || 0), f: +(nu.fat_100g || 0),
        fib: nu.fiber_100g != null ? +nu.fiber_100g : null, sug: nu.sugars_100g, sat: nu['saturated-fat_100g'], salt: nu.salt_100g,
      };
    }).filter(Boolean);
    offStatus = offResults.length ? '' : 'Sin resultados en Open Food Facts.';
  } catch (e) {
    offStatus = 'No se pudo conectar (¿sin internet?). La base local funciona sin conexión.';
  }
  renderFoodList();
}

/* ---------- gráficos SVG ---------- */
function lineChart(series, { h = 200, fmt = n1 } = {}) {
  const all = series.flatMap(s => s.pts);
  if (all.length < 2) return '<p class="muted small">Necesitas al menos 2 registros para ver el gráfico.</p>';
  const W = 340, H = h, pl = 40, pr = 10, pt = 12, pb = 26;
  let x0 = Math.min(...all.map(p => p.x)), x1 = Math.max(...all.map(p => p.x));
  let y0 = Math.min(...all.map(p => p.y)), y1 = Math.max(...all.map(p => p.y));
  if (x1 === x0) x1 = x0 + 1;
  const pad = (y1 - y0) * 0.12 || Math.max(1, Math.abs(y1) * 0.05);
  y0 -= pad; y1 += pad;
  const X = x => pl + (x - x0) / (x1 - x0) * (W - pl - pr);
  const Y = y => pt + (1 - (y - y0) / (y1 - y0)) * (H - pt - pb);
  let g = '';
  for (let i = 0; i <= 3; i++) {
    const v = y0 + (y1 - y0) * i / 3, yy = Y(v);
    g += `<line x1="${pl}" x2="${W - pr}" y1="${yy}" y2="${yy}" stroke="#2a2e38" stroke-width="1"/>`;
    g += `<text x="${pl - 6}" y="${yy + 4}" fill="#8b90a0" font-size="10" text-anchor="end">${fmt(v)}</text>`;
  }
  const dl = t => new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  [x0, (x0 + x1) / 2, x1].forEach((t, i) => {
    g += `<text x="${X(t)}" y="${H - 6}" fill="#8b90a0" font-size="10" text-anchor="${['start', 'middle', 'end'][i]}">${dl(t)}</text>`;
  });
  series.forEach(s => {
    if (!s.pts.length) return;
    const d = s.pts.map((p, i) => (i ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join(' ');
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.5}" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? 'stroke-dasharray="4 4"' : ''}/>`;
    if (s.dots) s.pts.forEach(p => { g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="3.2" fill="${s.color}"/>`; });
  });
  return `<div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}">${g}</svg></div>`;
}

/* ---------- pantallas ---------- */
const SCREENS = {};

SCREENS.today = p => {
  const dow = p.dow, plan = PLAN[dow], isToday = dow === new Date().getDay();
  const doneToday = db.workouts.find(w => w.planKey === plan.key && dkey(new Date(w.start)) === dkey());
  const t = targets(), tot = dayTotals(dkey());
  const weighed = db.body.find(b => b.date === dkey() && b.weight);
  let html = `<div class="chips">${DOW_ORDER.map(d => `<button class="chip ${d === dow ? 'on' : ''}" data-act="dow" data-d="${d}">${DOW[d]}</button>`).join('')}</div>`;
  html += `<div class="card hero">
    <div class="muted small">${isToday ? fmtDay(Date.now()) : 'Plan del ' + ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][dow]}</div>
    <h2>${esc(plan.title)} ${doneToday && isToday ? '✅' : ''}</h2>
    <div class="muted">${esc(plan.focus)}</div>
    <div class="muted small" style="margin-top:6px">⏱ ≈30 min · ${plan.blocks.length} superseries · todas las series a 0–2 reps del fallo</div>
  </div>`;
  html += `<div class="card"><div class="muted small"><b>Calentamiento:</b> ${esc(WARMUP)}</div></div>
    <p class="muted small" style="margin:0 4px">▶ Toca un ejercicio para ver cómo se hace.</p>`;
  plan.blocks.forEach((b, bi) => {
    const L = String.fromCharCode(65 + bi);
    html += `<div class="section-title">Superserie ${L} · ${b.rounds} rondas · descanso ${b.rest} s</div><div class="card">`;
    b.items.forEach((it, ii) => {
      const e = EXERCISES[it.ex], sg = suggestion(it.ex, it.reps);
      html += `<div class="ex-line ${ii ? 'sep' : ''}">
        <div class="row tap" data-act="demo" data-ex="${it.ex}"><span class="badge">${L}${ii + 1}</span><b class="grow">${esc(e.n)}</b><span class="play">▶</span></div>
        <div class="muted small">${b.rounds} × ${it.reps} reps${e.unit === 'seg' ? ' (seg)' : ''} · ${EQ[e.eq]} · ${esc(e.m)}${it.tech ? ' · <span class="accent">' + esc(it.tech) + '</span>' : ''}</div>
        <div class="small sugg ${sg.cls}">${esc(sg.text)}</div>
      </div>`;
    });
    html += `</div>`;
  });
  if (db.active) html += `<button class="btn primary block" data-act="open-active">Continuar entreno en curso</button>`;
  else html += `<button class="btn primary block" data-act="start-plan" data-d="${dow}">${doneToday && isToday ? 'Repetir entreno' : 'Empezar entreno'}</button>`;
  html += `<div class="section-title">Hoy</div>
    <div class="card tap" data-act="tab" data-tab="nutrition"><div class="row space"><span>🍽️ ${n0(tot.kcal)} / ${n0(t.kcal)} kcal</span><span>🥩 ${n0(tot.p)} / ${n0(t.prot)} g prot.</span><span class="muted">›</span></div></div>
    <div class="card tap" data-act="tab" data-tab="progress"><div class="row space"><span>⚖️ ${weighed ? 'Peso de hoy: ' + n1(weighed.weight) + ' kg' : 'Registra tu peso de hoy'}</span><span class="muted">›</span></div></div>
    <button class="btn block" data-act="routines">Mis rutinas personalizadas</button>`;
  return { title: 'Hoy', html, action: `<button class="link" data-act="settings" aria-label="Ajustes">⚙️</button>` };
};

SCREENS.active = () => {
  const w = db.active;
  if (!w) return { title: 'Entreno', html: '<div class="empty">No hay entreno en curso.</div>' };
  let html = `<p class="muted small">Haz los ejercicios con la misma letra en superserie (A1 → A2 → descanso). Marca ✓ al terminar cada serie: el descanso arranca solo al acabar la superserie.</p>`;
  w.exercises.forEach((e, i) => {
    const last = lastPerf(e.id);
    html += `<div class="card">
      <div class="row tap" data-act="demo" data-ex="${e.id}"><span class="badge">${esc(e.label)}</span><b class="grow">${esc(e.name)}</b><span class="play">▶</span></div>
      <div class="muted small">Objetivo ${e.sets.length} × ${esc(e.reps)}${e.unit === 'seg' ? ' s' : ' reps'}${e.unit === 'lastre' ? ' · peso corporal + lastre' : ''}${e.tech ? ' · <span class="accent">' + esc(e.tech) + '</span>' : ''}</div>
      <div class="small sugg ${suggestion(e.id, e.reps).cls}">${esc(suggestion(e.id, e.reps).text)}</div>
      <div class="set-grid">
        <div class="h">#</div><div class="h">Anterior</div><div class="h">${UNIT_LABEL[e.unit]}</div><div class="h">${e.unit === 'seg' ? 'seg' : 'reps'}</div><div class="h">✓</div>
        ${e.sets.map((s, j) => {
          const prev = last && last.sets[j] ? fmtSet(e.unit, last.sets[j]) : '—';
          return `<div class="num">${j + 1}</div><div class="prev">${esc(prev)}</div>
          <input class="${s.done ? 'on' : ''}" inputmode="decimal" data-ex="${i}" data-set="${j}" data-f="w" value="${esc(s.w)}" placeholder="0">
          <input class="${s.done ? 'on' : ''}" inputmode="numeric" data-ex="${i}" data-set="${j}" data-f="r" value="${esc(s.r)}" placeholder="${repLow(e.reps)}–${repTop(e.reps)}">
          <button class="check ${s.done ? 'on' : ''}" data-act="check" data-ex="${i}" data-set="${j}">✓</button>`;
        }).join('')}
      </div>
      <div class="row" style="margin-top:8px"><button class="btn sm" data-act="add-set" data-ex="${i}">+ Serie</button><button class="btn sm" data-act="del-set" data-ex="${i}">− Serie</button></div>
    </div>`;
  });
  html += `<button class="btn ok block" data-act="finish">Terminar y guardar</button>
    <button class="btn danger block" data-act="discard">Descartar entreno</button>`;
  return { title: w.title, html };
};

SCREENS.routines = () => {
  let html = db.routines.length ? '' : '<div class="empty"><span class="big">📋</span>Aún no tienes rutinas propias. El plan diario ya está listo en «Hoy», pero aquí puedes crear las tuyas.</div>';
  db.routines.forEach(r => {
    html += `<div class="card"><h3>${esc(r.name)}</h3><div class="chips">${r.items.map(it => `<button class="chip" data-act="demo" data-ex="${it.ex}">▶ ${esc(EXERCISES[it.ex].n)}</button>`).join('')}</div>
      <div class="row" style="margin-top:10px"><button class="btn primary sm" data-act="start-routine" data-id="${r.id}">Empezar</button><button class="btn sm" data-act="edit-routine" data-id="${r.id}">Editar</button></div></div>`;
  });
  html += `<button class="btn primary block" data-act="edit-routine">+ Nueva rutina</button>`;
  return { title: 'Mis rutinas', html };
};

function exerciseOptions(sel) {
  return Object.entries(EQ).map(([k, label]) => `<optgroup label="${label}">${Object.entries(EXERCISES).filter(([, e]) => e.eq === k)
    .map(([id, e]) => `<option value="${id}" ${id === sel ? 'selected' : ''}>${esc(e.n)}</option>`).join('')}</optgroup>`).join('');
}
SCREENS.routineEdit = p => {
  const r = p.draft;
  let html = `<label>Nombre</label><input id="rName" value="${esc(r.name)}" placeholder="p. ej. Torso pesado">
    <div class="section-title">Ejercicios (series · reps)</div>`;
  r.items.forEach((it, i) => {
    html += `<div class="card ri" data-i="${i}"><select class="rEx">${exerciseOptions(it.ex)}</select>
      <div class="row" style="margin-top:8px"><input class="rSets" inputmode="numeric" value="${it.sets}" style="width:70px;text-align:center"><span class="muted">series de</span>
      <input class="rReps" value="${esc(it.reps)}" style="width:90px;text-align:center"><span class="muted">reps</span><span class="grow"></span>
      <button class="link" style="color:var(--danger)" data-act="routine-del-item" data-i="${i}">Quitar</button></div></div>`;
  });
  html += `<button class="btn block" data-act="routine-add-item">+ Añadir ejercicio</button>
    <button class="btn primary block" data-act="routine-save">Guardar rutina</button>
    ${db.routines.some(x => x.id === r.id) ? '<button class="btn danger block" data-act="routine-delete">Eliminar rutina</button>' : ''}`;
  return { title: r.name || 'Nueva rutina', html };
};
function readRoutineForm() {
  const r = current().params.draft;
  r.name = $('#rName').value.trim();
  r.items = [...document.querySelectorAll('.ri')].map(el => ({
    ex: el.querySelector('.rEx').value,
    sets: Math.max(1, Math.min(10, parseInt(el.querySelector('.rSets').value) || 3)),
    reps: el.querySelector('.rReps').value.trim() || '8-12',
  }));
  return r;
}

SCREENS.history = () => {
  const list = sortedWorkouts();
  if (!list.length) return { title: 'Historial', html: '<div class="empty"><span class="big">📅</span>Aún no hay entrenos guardados.<br>Empieza el de hoy desde la pestaña «Hoy».</div>' };
  const weekAgo = Date.now() - 7 * 864e5;
  const week = list.filter(w => w.start >= weekAgo);
  let html = `<div class="stats"><div class="stat"><b>${week.length}</b><span>entrenos 7 días</span></div>
    <div class="stat"><b>${week.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.length, 0), 0)}</b><span>series 7 días</span></div>
    <div class="stat"><b>${list.length}</b><span>total</span></div></div>`;
  let month = '';
  list.forEach(w => {
    const m = cap(new Date(w.start).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
    if (m !== month) { month = m; html += `<div class="section-title">${m}</div>`; }
    const sets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
    const mins = w.end ? Math.round((w.end - w.start) / 60000) : 0;
    html += `<div class="card tap" data-act="workout" data-id="${w.id}"><div class="row space"><h3>${esc(w.title)}</h3><span class="muted">›</span></div>
      <div class="muted small">${fmtDay(w.start, { weekday: 'short', day: 'numeric', month: 'short' })} · ${mins} min · ${sets} series · ${n0(volume(w))} kg de volumen</div></div>`;
  });
  return { title: 'Historial', html };
};

SCREENS.workout = p => {
  const w = db.workouts.find(x => x.id === p.id);
  if (!w) return { title: 'Entreno', html: '<div class="empty">Entreno no encontrado.</div>' };
  let html = `<div class="muted" style="margin-bottom:10px">${fmtDay(w.start)} · ${w.end ? Math.round((w.end - w.start) / 60000) + ' min' : ''} · ${n0(volume(w))} kg de volumen</div>`;
  w.exercises.forEach(e => {
    html += `<div class="card"><b>${esc(e.label ? e.label + '. ' : '')}${esc(e.name)}</b><table class="detail">${e.sets.map((s, j) => `<tr><td>Serie ${j + 1}</td><td>${esc(fmtSet(e.unit, s))}</td></tr>`).join('')}</table></div>`;
  });
  html += `<button class="btn danger block" data-act="del-workout" data-id="${w.id}">Eliminar entreno</button>`;
  return { title: w.title, html };
};

SCREENS.nutrition = p => {
  const k = p.date, t = targets(), tot = dayTotals(k), entries = db.food[k] || [];
  const bar = (label, v, goal, unit, color) => {
    const pct = goal ? Math.min(100, v / goal * 100) : 0;
    return `<div class="macro"><div class="row space small"><span>${label}</span><span><b>${n0(v)}</b> / ${n0(goal)} ${unit}</span></div>
      <div class="bar"><i style="width:${pct}%;background:${color}"></i></div></div>`;
  };
  let html = `<div class="row space datenav"><button class="btn sm" data-act="nday" data-n="-1">‹</button>
    <b>${k === dkey() ? 'Hoy' : fmtDay(parseKey(k), { weekday: 'short', day: 'numeric', month: 'short' })}</b>
    <button class="btn sm" data-act="nday" data-n="1">›</button></div>
    <div class="card">${bar('Calorías', tot.kcal, t.kcal, 'kcal', 'var(--accent)')}${bar('Proteína', tot.p, t.prot, 'g', '#34c759')}
    ${bar('Hidratos', tot.c, t.carbs, 'g', '#0a84ff')}${bar('Grasas', tot.f, t.fat, 'g', '#ffd60a')}
    <div class="muted small" style="margin-top:6px">Objetivo: ${{ volumen: 'volumen (+10 %)', mantener: 'mantenimiento', definicion: 'definición (−20 %)' }[db.profile.goal]} · ${n1(t.w)} kg · <button class="link small" data-act="settings">cambiar</button></div></div>`;
  html += `<button class="btn primary block" data-act="foods" data-date="${k}">+ Añadir alimento</button>`;
  if (entries.length) {
    html += `<div class="section-title">Comido</div><div class="card">`;
    entries.forEach(e => {
      html += `<div class="row food-row"><div class="grow"><div>${esc(e.name)}</div><div class="muted small">${n0(e.g)} g · ${n0(e.kcal)} kcal · P ${n1(e.p)} · H ${n1(e.c)} · G ${n1(e.f)}</div></div>
        <button class="link" style="color:var(--danger)" data-act="del-food" data-id="${e.id}">✕</button></div>`;
    });
    html += `</div>`;
  }
  if (db.recent.length) {
    html += `<div class="section-title">Añadir rápido (recientes)</div><div class="chips">${db.recent.slice(0, 10).map((r, i) => `<button class="chip" data-act="quick-food" data-i="${i}">${esc(r.name)} · ${n0(r.g)} g</button>`).join('')}</div>`;
  }
  html += `<button class="btn block" data-act="foods">🔎 Consultar valor nutricional de alimentos</button>`;
  return { title: 'Nutrición', html };
};

SCREENS.foods = p => {
  const cats = ['Todos', '★ Recomendados', 'Más proteína', ...new Set(LOCAL_FOODS.map(f => f.cat))];
  const html = `<input id="foodQ" type="search" placeholder="Buscar alimento (p. ej. pollo, avena…)" value="${esc(p.q || '')}" autocomplete="off">
    <div class="chips" style="margin-top:10px">${cats.map(c => `<button class="chip ${(p.cat || 'Todos') === c ? 'on' : ''}" data-act="food-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <div id="foodList"></div>`;
  return { title: p.date ? 'Añadir alimento' : 'Alimentos', html, after: renderFoodList };
};
function renderFoodList() {
  const el = $('#foodList'); if (!el) return;
  const p = current().params, q = norm(p.q || ''), cat = p.cat || 'Todos';
  let list = LOCAL_FOODS.filter(f => !q || norm(f.name).includes(q));
  if (cat === '★ Recomendados') list = list.filter(f => f.star);
  else if (cat === 'Más proteína') list = [...list].filter(f => f.p >= 5).sort((a, b) => protDensity(b) - protDensity(a));
  else if (cat !== 'Todos') list = list.filter(f => f.cat === cat);
  const row = (f, i, src) => `<div class="row food-row tap" data-act="food" data-src="${src}" data-i="${i}">
    <div class="grow"><div>${f.star ? '★ ' : ''}${esc(f.name)}</div>
    <div class="muted small">${n0(f.kcal)} kcal · P ${n1(f.p)} · H ${n1(f.c)} · G ${n1(f.f)} <span class="accent">· ${n1(protDensity(f))} g prot/100 kcal</span></div></div><span class="muted">›</span></div>`;
  let html = `<div class="muted small" style="margin:4px 4px 8px">Valores por 100 g</div>`;
  html += list.length ? `<div class="card">${list.map(f => row(f, LOCAL_FOODS.indexOf(f), 'local')).join('')}</div>` : '<p class="muted">No está en la base local.</p>';
  if (q) html += `<button class="btn block" data-act="off">🌐 Buscar «${esc(p.q)}» en Open Food Facts (marcas y productos)</button>`;
  if (offStatus) html += `<p class="muted small">${esc(offStatus)}</p>`;
  if (offResults && offResults.length) html += `<div class="section-title">Open Food Facts</div><div class="card">${offResults.map((f, i) => row(f, i, 'off')).join('')}</div>`;
  el.innerHTML = html;
}

SCREENS.food = p => {
  const f = p.food, t = targets();
  const g = p.g ?? 100;
  const rows = [['Energía', f.kcal, 'kcal'], ['Proteína', f.p, 'g'], ['Hidratos', f.c, 'g'], ['  de los cuales azúcares', f.sug, 'g'], ['Grasas', f.f, 'g'], ['  de las cuales saturadas', f.sat, 'g'], ['Fibra', f.fib, 'g'], ['Sal', f.salt, 'g']]
    .filter(r => r[1] != null && r[1] !== '');
  let html = `<div class="muted small">${esc(f.cat)}${f.src === 'off' ? ' · datos de la comunidad, revisa la etiqueta' : ' · valores aproximados'}</div>
    <div class="card" style="margin-top:10px"><table class="detail nut"><tr><td></td><td class="muted">100 g</td><td><b id="gLabel">${n0(g)} g</b></td></tr>
    ${rows.map(r => `<tr><td>${esc(r[0])}</td><td>${n1(+r[1])} ${r[2]}</td><td class="portion" data-v="${+r[1]}" data-u="${r[2]}"><b>${n1(r[1] * g / 100)} ${r[2]}</b></td></tr>`).join('')}</table></div>
    <div class="stats"><div class="stat"><b>${n1(protDensity(f))}</b><span>g prot / 100 kcal</span></div>
      <div class="stat"><b id="pctProt">${n0(f.p * g / 100 / t.prot * 100)} %</b><span>de tu proteína diaria</span></div>
      <div class="stat"><b id="pctKcal">${n0(f.kcal * g / 100 / t.kcal * 100)} %</b><span>de tus kcal</span></div></div>
    <label>Cantidad (g)</label><input id="portion" inputmode="decimal" value="${g}">
    <button class="btn primary block" data-act="add-food">Añadir a ${p.date && p.date !== dkey() ? fmtDay(parseKey(p.date), { day: 'numeric', month: 'short' }) : 'hoy'}</button>`;
  return { title: f.name, html };
};

SCREENS.progress = p => {
  const seg = `<div class="chips"><button class="chip ${p.seg === 'body' ? 'on' : ''}" data-act="pseg" data-s="body">⚖️ Peso corporal</button><button class="chip ${p.seg === 'ex' ? 'on' : ''}" data-act="pseg" data-s="ex">🏋️ Ejercicios</button></div>`;
  return { title: 'Progreso', html: seg + (p.seg === 'body' ? bodyProgress() : exerciseProgress(p)) };
};
function bodyProgress() {
  const list = [...db.body].sort((a, b) => a.date.localeCompare(b.date));
  const today = db.body.find(b => b.date === dkey()) || {};
  let html = `<div class="card"><div class="row"><div class="grow"><label>Peso (kg)</label><input id="bW" inputmode="decimal" value="${today.weight ?? ''}" placeholder="${n1(latestWeight())}"></div>
    <div class="grow"><label>Cintura (cm)</label><input id="bWaist" inputmode="decimal" value="${today.waist ?? ''}"></div>
    <div class="grow"><label>Brazo (cm)</label><input id="bArm" inputmode="decimal" value="${today.arm ?? ''}"></div></div>
    <button class="btn primary block" data-act="save-body">Guardar medidas de hoy</button>
    <p class="muted small" style="margin:8px 2px 0">Pésate por la mañana, en ayunas y tras ir al baño.</p></div>`;
  const ws = list.filter(b => b.weight);
  if (ws.length) {
    const now = parseKey(dkey()).getTime();
    const avg = (from, to) => { const xs = ws.filter(b => { const t = parseKey(b.date).getTime(); return t > now - from * 864e5 && t <= now - to * 864e5; }).map(b => b.weight); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
    const a7 = avg(7, 0), a14 = avg(14, 7);
    const rate = a7 != null && a14 != null ? a7 - a14 : null;
    const pct = rate != null ? rate / a14 * 100 : null;
    let advice = '';
    if (pct != null) {
      const g = db.profile.goal;
      if (g === 'volumen') advice = pct < 0.1 ? 'Subes muy poco: añade ≈150–200 kcal/día.' : pct > 0.6 ? 'Subes rápido: quizá ganas grasa de más, quita ≈100–150 kcal/día.' : 'Ritmo ideal para ganar músculo (0,25–0,5 %/semana).';
      else if (g === 'definicion') advice = pct > -0.3 ? 'Bajas poco: reduce ≈150 kcal/día o añade pasos.' : pct < -1 ? 'Bajas muy rápido: sube algo las kcal para no perder músculo.' : 'Buen ritmo de definición (0,5–1 %/semana).';
      else advice = Math.abs(pct) < 0.3 ? 'Peso estable.' : 'Te estás moviendo del peso de mantenimiento; ajusta las kcal.';
    }
    html += `<div class="stats"><div class="stat"><b>${n1(ws[ws.length - 1].weight)}</b><span>último (kg)</span></div>
      <div class="stat"><b>${a7 != null ? n1(a7) : '—'}</b><span>media 7 días</span></div>
      <div class="stat"><b>${rate != null ? (rate > 0 ? '+' : '') + n1(rate) : '—'}</b><span>kg / semana</span></div></div>`;
    if (advice) html += `<div class="card small">${pct != null ? `<b>${pct > 0 ? '+' : ''}${n1(pct)} %/semana.</b> ` : ''}${esc(advice)}</div>`;
    const pts = ws.map(b => ({ x: parseKey(b.date).getTime(), y: b.weight }));
    const ma = pts.map(pt => { const xs = pts.filter(q => q.x <= pt.x && q.x > pt.x - 7 * 864e5); return { x: pt.x, y: xs.reduce((a, q) => a + q.y, 0) / xs.length }; });
    html += `<div class="section-title">Peso corporal <span style="color:var(--accent)">● diario</span> <span style="color:#34c759">— media 7 días</span></div>
      <div class="card">${lineChart([{ pts, color: 'var(--accent)', dots: true, width: 1.5 }, { pts: ma, color: '#34c759' }])}</div>`;
  }
  const waist = list.filter(b => b.waist), arm = list.filter(b => b.arm);
  if (waist.length > 1 || arm.length > 1) {
    html += `<div class="section-title">Medidas (cm) <span style="color:#0a84ff">— cintura</span> <span style="color:#ffd60a">— brazo</span></div><div class="card">
      ${waist.length > 1 ? lineChart([{ pts: waist.map(b => ({ x: parseKey(b.date).getTime(), y: b.waist })), color: '#0a84ff', dots: true }], { h: 150 }) : ''}
      ${arm.length > 1 ? lineChart([{ pts: arm.map(b => ({ x: parseKey(b.date).getTime(), y: b.arm })), color: '#ffd60a', dots: true }], { h: 150 }) : ''}</div>`;
  }
  if (list.length) {
    html += `<div class="section-title">Registros</div><div class="card">${[...list].reverse().slice(0, 40).map(b => `<div class="row food-row"><div class="grow">${fmtDay(parseKey(b.date), { weekday: 'short', day: 'numeric', month: 'short' })}</div>
      <div class="muted small">${b.weight ? n1(b.weight) + ' kg' : ''}${b.waist ? ' · cint. ' + n1(b.waist) : ''}${b.arm ? ' · brazo ' + n1(b.arm) : ''}</div>
      <button class="link" style="color:var(--danger)" data-act="del-body" data-d="${b.date}">✕</button></div>`).join('')}</div>`;
  } else html += '<div class="empty"><span class="big">⚖️</span>Registra tu primer peso arriba.</div>';
  return html;
}
function exerciseProgress(p) {
  const ids = [];
  sortedWorkouts().forEach(w => w.exercises.forEach(e => { if (!ids.includes(e.id) && e.sets.length) ids.push(e.id); }));
  if (!ids.length) return '<div class="empty"><span class="big">📈</span>Cuando guardes entrenos verás aquí tu progreso en cada ejercicio.</div>';
  const id = ids.includes(p.ex) ? p.ex : ids[0];
  const unit = (EXERCISES[id] || {}).unit;
  const metrics = unit === 'seg' ? [['reps', 'Mejor tiempo (s)']] : [['e1rm', '1RM estimado'], ['best', 'Carga máx.'], ['reps', 'Reps máx.'], ['vol', 'Volumen']];
  const metric = metrics.some(m => m[0] === p.metric) ? p.metric : metrics[0][0];
  const pts = [];
  [...db.workouts].sort((a, b) => a.start - b.start).forEach(w => {
    const e = w.exercises.find(x => x.id === id); if (!e || !e.sets.length) return;
    const bw = unit === 'lastre' ? bodyWeightAt(w.start) : 0;
    const loads = e.sets.map(s => ({ load: bw + (s.w || 0), r: s.r || 0 }));
    let y;
    if (metric === 'e1rm') y = Math.max(...loads.map(l => l.load * (1 + l.r / 30)));
    else if (metric === 'best') y = Math.max(...loads.map(l => l.load));
    else if (metric === 'reps') y = Math.max(...loads.map(l => l.r));
    else y = loads.reduce((a, l) => a + l.load * l.r, 0);
    pts.push({ x: w.start, y });
  });
  const best = pts.length ? Math.max(...pts.map(q => q.y)) : 0;
  const first = pts[0]?.y, lastV = pts[pts.length - 1]?.y;
  let html = `<select id="exSel">${ids.map(i => `<option value="${i}" ${i === id ? 'selected' : ''}>${esc(exName(i))}</option>`).join('')}</select>
    <div class="chips" style="margin-top:10px">${metrics.map(m => `<button class="chip ${m[0] === metric ? 'on' : ''}" data-act="pmetric" data-m="${m[0]}">${m[1]}</button>`).join('')}</div>
    <div class="stats"><div class="stat"><b>${n1(best)}</b><span>récord</span></div><div class="stat"><b>${n1(lastV)}</b><span>última sesión</span></div>
    <div class="stat"><b>${first ? (lastV >= first ? '+' : '') + n0((lastV - first) / first * 100) + ' %' : '—'}</b><span>desde el inicio</span></div></div>
    <div class="card">${lineChart([{ pts, color: 'var(--accent)', dots: true }])}</div>
    ${unit === 'lastre' ? '<p class="muted small">En calistenia la carga incluye tu peso corporal registrado + lastre.</p>' : ''}
    ${metric === 'e1rm' ? '<p class="muted small">1RM estimado con la fórmula de Epley: carga × (1 + reps/30).</p>' : ''}`;
  return html;
}
const exName = id => (EXERCISES[id] || {}).n || id;

SCREENS.study = () => ({ title: 'Estudio', html: `<p class="muted small" style="margin:0 4px 12px">Qué dice la ciencia sobre ganar músculo rápido, y cómo lo aplica tu plan.</p>` + STUDY });

SCREENS.settings = () => {
  const p = db.profile, t = targets();
  const opt = (v, cur, label) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${label}</option>`;
  const html = `<div class="section-title">Perfil (para calcular tus calorías)</div><div class="card">
    <div class="row"><div class="grow"><label>Sexo</label><select id="pSex">${opt('h', p.sex, 'Hombre')}${opt('m', p.sex, 'Mujer')}</select></div>
    <div class="grow"><label>Edad</label><input id="pAge" inputmode="numeric" value="${p.age}"></div></div>
    <div class="row"><div class="grow"><label>Altura (cm)</label><input id="pH" inputmode="decimal" value="${p.height}"></div>
    <div class="grow"><label>Peso inicial (kg)</label><input id="pW" inputmode="decimal" value="${p.weight}"></div></div>
    <label>Actividad diaria (además del entreno)</label><select id="pAct">${opt(1.375, p.activity, 'Baja (sentado casi todo el día)')}${opt(1.55, p.activity, 'Media (de pie / caminas bastante)')}${opt(1.725, p.activity, 'Alta (trabajo físico)')}</select>
    <label>Objetivo</label><select id="pGoal">${opt('volumen', p.goal, 'Ganar músculo (volumen limpio)')}${opt('mantener', p.goal, 'Mantener peso (recomposición)')}${opt('definicion', p.goal, 'Perder grasa (definición)')}</select>
    <button class="btn primary block" data-act="save-profile">Guardar perfil</button></div>
    <div class="card small">Con tu último peso (${n1(t.w)} kg): gasto ≈ <b>${n0(t.tdee)} kcal</b> → objetivo <b>${n0(t.kcal)} kcal</b>, <b>${n0(t.prot)} g</b> proteína, <b>${n0(t.carbs)} g</b> hidratos, <b>${n0(t.fat)} g</b> grasa.</div>
    <div class="section-title">Copia de seguridad</div><div class="card">
    <p class="muted small" style="margin-top:0">Tus datos solo están en este iPhone. Exporta una copia de vez en cuando (por ejemplo a Archivos o iCloud Drive).</p>
    <button class="btn block" data-act="export">⬇️ Exportar datos</button>
    <label class="btn block" style="text-align:center;color:var(--text);font-size:16px;margin-top:10px">⬆️ Importar copia<input id="importFile" type="file" accept="application/json,.json" class="hidden"></label>
    <button class="btn danger block" data-act="reset">Borrar todos los datos</button></div>
    <p class="muted small" style="text-align:center">Entreno · v1</p>`;
  return { title: 'Ajustes', html };
};

/* ---------- acciones ---------- */
let audio = null;
function beep() {
  try {
    if (!audio) return;
    [0, 0.25, 0.5].forEach(t => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(0.25, audio.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + t + 0.2);
      o.start(audio.currentTime + t); o.stop(audio.currentTime + t + 0.2);
    });
    navigator.vibrate?.([200, 100, 200]);
  } catch (e) {}
}

function openDemo(id) {
  const e = EXERCISES[id]; if (!e) return;
  const sh = $('#sheet');
  sh.innerHTML = `<div class="sheet-card" role="dialog" aria-label="${esc(e.n)}">
    <div class="row space"><h3 class="grow">${esc(e.n)}</h3><button class="link" data-act="close-demo" aria-label="Cerrar">✕</button></div>
    <div class="muted small">${EQ[e.eq]} · ${esc(e.m)}</div>
    <div id="demoAnim" class="demo-anim"></div>
    <p>${esc(e.cue)}</p>
    <a class="link" href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.n + ' técnica')}" target="_blank" rel="noopener">Ver vídeos de la técnica ›</a>
  </div>`;
  sh.classList.remove('hidden');
  ANIM.play($('#demoAnim'), id);
}
function closeDemo() { ANIM.stop(); $('#sheet').classList.add('hidden'); $('#sheet').innerHTML = ''; }

const ACT = {
  demo: el => openDemo(el.dataset.ex),
  'close-demo': () => closeDemo(),
  tab: el => setTab(el.dataset.tab),
  dow: el => { state.today.dow = +el.dataset.d; render(); },
  settings: () => go('settings'),
  routines: () => go('routines'),
  'open-active': () => go('active'),
  'start-plan': el => startWorkout(workoutFromPlan(+el.dataset.d)),
  'start-routine': el => startWorkout(workoutFromRoutine(db.routines.find(r => r.id === el.dataset.id))),
  'edit-routine': el => {
    const r = db.routines.find(x => x.id === el.dataset.id);
    go('routineEdit', { draft: r ? structuredClone(r) : { id: uid(), name: '', items: [{ ex: 'pullup', sets: 3, reps: '6-10' }] } });
  },
  'routine-add-item': () => { const r = readRoutineForm(); r.items.push({ ex: 'dips', sets: 3, reps: '8-12' }); render(); },
  'routine-del-item': el => { const r = readRoutineForm(); r.items.splice(+el.dataset.i, 1); render(); },
  'routine-save': () => {
    const r = readRoutineForm();
    if (!r.name) return alert('Ponle un nombre a la rutina.');
    if (!r.items.length) return alert('Añade al menos un ejercicio.');
    const i = db.routines.findIndex(x => x.id === r.id);
    if (i >= 0) db.routines[i] = r; else db.routines.push(r);
    save(); back();
  },
  'routine-delete': () => {
    const r = current().params.draft;
    if (!confirm(`¿Eliminar la rutina «${r.name}»?`)) return;
    db.routines = db.routines.filter(x => x.id !== r.id); save(); back();
  },
  check: el => {
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    audio?.resume?.();
    const e = db.active.exercises[+el.dataset.ex], s = e.sets[+el.dataset.set];
    s.done = !s.done;
    if (s.done) {
      if (s.r === '' || s.r == null) s.r = repLow(e.reps);
      if (s.w === '' || s.w == null) s.w = 0;
      db.active.restEnd = e.endOfBlock ? Date.now() + e.rest * 1000 : 0;
      db.active.restNext = e.endOfBlock ? '' : 'Pasa al siguiente ejercicio de la superserie';
    }
    save(); render();
  },
  'add-set': el => { const e = db.active.exercises[+el.dataset.ex]; const l = e.sets[e.sets.length - 1]; e.sets.push({ w: l ? l.w : 0, r: '', done: false }); save(); render(); },
  'del-set': el => { const e = db.active.exercises[+el.dataset.ex]; if (e.sets.length > 1) e.sets.pop(); save(); render(); },
  'rest-add': () => { db.active.restEnd = Math.max(Date.now(), db.active.restEnd) + 15000; save(); tick(); },
  'rest-skip': () => { db.active.restEnd = 0; save(); bannerMode = null; tick(); },
  finish: () => {
    const w = db.active;
    w.exercises.forEach(e => {
      e.sets = e.sets.filter(s => s.done || num(s.r) != null).map(s => ({ w: num(s.w) || 0, r: num(s.r) || 0 }));
    });
    w.exercises = w.exercises.filter(e => e.sets.length);
    if (!w.exercises.length) { if (confirm('No has registrado ninguna serie. ¿Descartar el entreno?')) { db.active = null; save(); setTab('today'); } return; }
    if (!confirm('¿Terminar y guardar el entreno?')) return;
    w.end = Date.now(); delete w.restEnd; delete w.restNext;
    db.workouts.push(w); db.active = null; save();
    nav.tab = 'history'; nav.stack = [{ screen: 'workout', params: { id: w.id } }]; render();
  },
  discard: () => { if (confirm('¿Descartar este entreno sin guardar?')) { db.active = null; save(); setTab('today'); } },
  workout: el => go('workout', { id: el.dataset.id }),
  'del-workout': el => { if (confirm('¿Eliminar este entreno del historial?')) { db.workouts = db.workouts.filter(w => w.id !== el.dataset.id); save(); back(); } },
  nday: el => { state.nutrition.date = addDays(state.nutrition.date, +el.dataset.n); render(); },
  foods: el => { offResults = null; offStatus = ''; go('foods', { date: el.dataset.date || null, q: '', cat: 'Todos' }); },
  'food-cat': el => { current().params.cat = el.dataset.cat; document.querySelectorAll('[data-act="food-cat"]').forEach(c => c.classList.toggle('on', c === el)); renderFoodList(); },
  off: () => searchOFF(current().params.q),
  food: el => { const f = el.dataset.src === 'off' ? offResults[+el.dataset.i] : LOCAL_FOODS[+el.dataset.i]; go('food', { food: f, date: current().params.date || dkey() }); },
  'add-food': () => {
    const p = current().params, f = p.food, g = num($('#portion').value);
    if (!g || g <= 0) return alert('Indica la cantidad en gramos.');
    addFoodEntry(p.date || dkey(), f, g);
    nav.tab = 'nutrition'; state.nutrition.date = p.date || dkey(); nav.stack = []; render();
  },
  'quick-food': el => { const r = db.recent[+el.dataset.i]; addFoodEntry(state.nutrition.date, r.per, r.g); render(); },
  'del-food': el => { const k = state.nutrition.date; db.food[k] = (db.food[k] || []).filter(e => e.id !== el.dataset.id); save(); render(); },
  pseg: el => { state.progress.seg = el.dataset.s; render(); },
  pmetric: el => { state.progress.metric = el.dataset.m; render(); },
  'save-body': () => {
    const w = num($('#bW').value), waist = num($('#bWaist').value), arm = num($('#bArm').value);
    if (w == null && waist == null && arm == null) return alert('Escribe al menos un dato.');
    const k = dkey(); const i = db.body.findIndex(b => b.date === k);
    const entry = { date: k, weight: w, waist, arm };
    if (i >= 0) db.body[i] = entry; else db.body.push(entry);
    save(); render();
  },
  'del-body': el => { if (confirm('¿Eliminar este registro?')) { db.body = db.body.filter(b => b.date !== el.dataset.d); save(); render(); } },
  'save-profile': () => {
    const p = db.profile;
    p.sex = $('#pSex').value; p.age = num($('#pAge').value) || p.age; p.height = num($('#pH').value) || p.height;
    p.weight = num($('#pW').value) || p.weight; p.activity = num($('#pAct').value) || 1.55; p.goal = $('#pGoal').value;
    save(); render(); alert('Perfil guardado.');
  },
  export: async () => {
    const name = `entreno-copia-${dkey()}.json`;
    const blob = new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' });
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: name }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  },
  reset: () => {
    if (!confirm('¿Borrar TODOS tus datos (entrenos, comidas, peso)? No se puede deshacer.')) return;
    if (!confirm('¿Seguro? Exporta antes una copia si la quieres conservar.')) return;
    db = DEFAULT(); save(); setTab('today');
  },
};
function addFoodEntry(k, f, g) {
  const m = g / 100;
  (db.food[k] = db.food[k] || []).push({ id: uid(), name: f.name, g, kcal: f.kcal * m, p: f.p * m, c: f.c * m, f: f.f * m });
  db.recent = [{ name: f.name, g, per: f }, ...db.recent.filter(r => r.name !== f.name)].slice(0, 12);
  save();
}

document.addEventListener('click', e => {
  if (e.target.id === 'sheet') return closeDemo();
  const el = e.target.closest('[data-act]');
  if (el && ACT[el.dataset.act]) { e.preventDefault(); ACT[el.dataset.act](el, e); }
});
$('#back').addEventListener('click', back);
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.f && db.active) {
    const s = db.active.exercises[+t.dataset.ex].sets[+t.dataset.set];
    s[t.dataset.f] = t.value; save();
  } else if (t.id === 'foodQ') {
    const p = current().params; p.q = t.value; offResults = null; offStatus = ''; renderFoodList();
  } else if (t.id === 'portion') {
    const p = current().params, g = num(t.value) || 0, f = p.food, tg = targets();
    p.g = g;
    $('#gLabel').textContent = n0(g) + ' g';
    document.querySelectorAll('.portion').forEach(td => { td.innerHTML = `<b>${n1(+td.dataset.v * g / 100)} ${td.dataset.u}</b>`; });
    $('#pctProt').textContent = n0(f.p * g / 100 / tg.prot * 100) + ' %';
    $('#pctKcal').textContent = n0(f.kcal * g / 100 / tg.kcal * 100) + ' %';
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'exSel') { state.progress.ex = t.value; render(); }
  if (t.id === 'importFile' && t.files[0]) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d || !Array.isArray(d.workouts)) throw new Error('formato no válido');
        if (!confirm('Esto reemplazará tus datos actuales por los de la copia. ¿Continuar?')) return;
        db = Object.assign(DEFAULT(), d); save(); setTab('today'); alert('Copia importada.');
      } catch (err) { alert('No se pudo importar: ' + err.message); }
    };
    r.readAsText(t.files[0]);
  }
});

/* ---------- banner (entreno en curso / descanso) ---------- */
let bannerMode = null, beeped = false;
function tick() {
  const b = $('#active-banner');
  const w = db.active;
  if (!w) { b.classList.add('hidden'); bannerMode = null; return; }
  b.classList.remove('hidden');
  const onActive = current().screen === 'active';
  const restLeft = (w.restEnd || 0) - Date.now();
  let mode;
  if (onActive && restLeft > 0) mode = 'rest';
  else if (onActive && w.restNext) mode = 'next';
  else if (onActive) mode = 'clock';
  else mode = 'open';
  if (mode !== bannerMode) {
    bannerMode = mode;
    b.className = 'banner-' + mode;
    if (mode === 'rest') { beeped = false; b.innerHTML = `<span>Descanso <b id="bT"></b></span><span class="row"><button class="btn sm" data-act="rest-add">+15 s</button><button class="btn sm" data-act="rest-skip">Saltar</button></span>`; }
    else if (mode === 'next') b.innerHTML = `<span>➡️ ${esc(w.restNext)}</span><span id="bT"></span>`;
    else if (mode === 'clock') b.innerHTML = `<span>⏱ Entreno <b id="bT"></b></span><span class="muted-w">a por ello 💪</span>`;
    else b.innerHTML = `<span data-act="open-active">🏋️ Entreno en curso · <b id="bT"></b></span><span data-act="open-active">Abrir ›</span>`;
  }
  const bT = $('#bT');
  if (mode === 'rest') bT.textContent = mmss(restLeft / 1000);
  else if (mode !== 'next' && bT) bT.textContent = mmss((Date.now() - w.start) / 1000);
  if (onActive && w.restEnd && restLeft <= 0 && !beeped) { beeped = true; w.restEnd = 0; save(); beep(); }
}
setInterval(tick, 500);

/* ---------- arranque ---------- */
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
navigator.storage?.persist?.().catch(() => {});
