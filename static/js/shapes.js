/* ══════════════════════════════════════════════
   shapes.js — Shakllar boshqaruvi
   ══════════════════════════════════════════════ */

/* ── Yuza hisoblash (Shoelace formula) ── */
function calcArea(sh) {
    if (!sh.closed || sh.pts.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < sh.pts.length; i++) {
        const j = (i + 1) % sh.pts.length;
        area += sh.pts[i].x * sh.pts[j].y;
        area -= sh.pts[j].x * sh.pts[i].y;
    }
    return Math.abs(area / 2) / (G * G);
}

/* ── Umumiy yuzani yangilash ── */
function updArea() {
    let total = 0;
    State.shapes.forEach(sh => {
        if (sh.noArea) return;
        try { total += sArea(sh) / (G * G); } catch (e) { /* segs xato */ }
    });
    if (State.cur && State.cur.pts.length >= 3) {
        try {
            total += sArea({ pts: State.cur.pts, closed: true, segs: State.cur.segs }) / (G * G);
        } catch (e) { /* */ }
    }
    const txt = total.toFixed(2) + ' m²';

    // Barcha mumkin bo'lgan yuza elementlarni yangilash
    ['ra', 'cv-area-val', 'wz-area'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
    });

    // Fallback: agar cv-area-val yo'q bo'lsa, cv-area ga to'g'ridan-to'g'ri yozish
    if (!document.getElementById('cv-area-val')) {
        const cv = document.getElementById('cv-area');
        if (cv) cv.textContent = txt;
    }
}

function calcSegLens(pts, segs) {
    return pts.map((p, i) => {
        const j = (i + 1) % pts.length;
        return parseFloat((aLen(p.x, p.y, pts[j].x, pts[j].y, segs[i].bulge || 0) / G).toFixed(2));
    });
}

function defaultSegs(count) {
    return Array.from({ length: count }, () => ({ type: 'line', bulge: 0 }));
}

/* ── Umumiy: shaklni ro'yxatga qo'shish ── */
function pushShape(pts) {
    const segs = defaultSegs(pts.length);
    State.shapes.push({ pts, segs, lens: calcSegLens(pts, segs), closed: true });
    State.cur = null;
    State.sel = State.shapes.length - 1;
    setMode('edit');
    State.dirty = true;
    redraw();
    hap('notificationSuccess');
}

/* ── Tayyor shakllar ── */
function addRect() {
    const c = vc();
    const x0 = Math.round((c.x - 2.5 * G) / G) * G;
    const y0 = Math.round((c.y - 2 * G) / G) * G;
    pushShape([
        { x: x0, y: y0 },         { x: x0 + 5*G, y: y0 },
        { x: x0 + 5*G, y: y0 + 4*G }, { x: x0, y: y0 + 4*G }
    ]);
}

function addLShape() {
    const c = vc();
    const x0 = Math.round((c.x - 3 * G) / G) * G;
    const y0 = Math.round((c.y - 3 * G) / G) * G;
    pushShape([
        { x: x0, y: y0 },             { x: x0 + 3*G, y: y0 },
        { x: x0 + 3*G, y: y0 + 2*G }, { x: x0 + 5*G, y: y0 + 2*G },
        { x: x0 + 5*G, y: y0 + 5*G }, { x: x0, y: y0 + 5*G }
    ]);
}

function addTri() {
    const c = vc();
    const x0 = Math.round(c.x / G) * G;
    const y0 = Math.round((c.y - 2 * G) / G) * G;
    pushShape([
        { x: x0, y: y0 },
        { x: x0 + 3*G, y: y0 + 4*G },
        { x: x0 - 3*G, y: y0 + 4*G }
    ]);
}

/* ── Shaklni yopish ── */
function closeSh() {
    if (!State.cur || State.cur.pts.length < 3) return;
    State.cur.closed = true;
    State.cur.lens = calcSegLens(State.cur.pts, State.cur.segs);
    State.shapes.push(State.cur);
    State.cur = null;
    State.sel = State.shapes.length - 1;
    setMode('edit');
    hap('notificationSuccess');
}

/* ── O'chirish ── */
function delSh(i) {
    State.shapes.splice(i, 1);
    if (State.sel != null) {
        if (State.sel >= State.shapes.length) State.sel = State.shapes.length - 1;
        if (State.shapes.length === 0) State.sel = null;
    }
    State.dirty = true;
    redraw();
    upD();          // dims panelni majburiy yangilash
    hap('impactMedium');
}

function delActive() {
    if (State.mode === 'edit' && State.sel != null) {
        delSh(State.sel);
        return;
    }
    if (State.mode === 'draw' && State.cur) {
        State.cur = null;
        State.dirty = true;
        redraw();
        upD();
        hap('impactMedium');
    }
}

/* ── Undo ── */
function undoAction() {
    if (State.mode === 'draw' && State.cur) {
        if (State.cur.pts.length > 0) {
            State.cur.pts.pop();
            State.cur.segs.pop();
            State.cur.lens.pop();
        } else {
            State.cur = null;
        }
    } else if (State.shapes.length > 0) {
        State.shapes.pop();
        if (State.sel != null && State.sel >= State.shapes.length)
            State.sel = State.shapes.length - 1;
        if (!State.shapes.length) State.sel = null;
    }
    State.dirty = true;
    redraw();
    hap('impactMedium');
}

function newShape() {
    State.cur = null;
    State.sel = null;
    setMode('draw');
    hap('impactLight');
}

function resetAll() {
    State.shapes = [];
    State.cur = null;
    State.sel = null;
    setMode('draw');
    State.dirty = true;
    redraw();
    hap('notificationWarning');
}

function pickSh(i) {
    State.sel = i;
    if (State.mode !== 'edit') setMode('edit');
    State.dirty = true;
    redraw();
    hap('selectionChanged');
}