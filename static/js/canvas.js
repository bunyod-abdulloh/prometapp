/* ══════════════════════════════════════════════
   canvas.js — Canvas rendering (grid, shakllar, cursor)
   ══════════════════════════════════════════════ */

/* ── Theme-aware canvas ranglar ── */
function getCC() {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    return {
        gridMajor:  light ? 'rgba(34,197,94,.15)' : 'rgba(34,197,94,.22)',
        gridMinor:  light ? 'rgba(34,197,94,.05)' : 'rgba(34,197,94,.08)',
        gridLabel:  light ? 'rgba(34,197,94,.30)' : 'rgba(34,197,94,.18)',
        ptStroke:   light ? '#e2e8f0' : '#0c1220',
        dimBg:      light ? 'rgba(255,255,255,.92)' : 'rgba(12,18,32,.88)',
        dimBorder:  light ? 'rgba(0,0,0,.08)' : 'rgba(34,197,94,.15)',
        dimText:    light ? '#475569' : '#94a3b8',
        fillSel:    light ? 'rgba(34,197,94,.10)' : 'rgba(34,197,94,.06)',
        fillNorm:   light ? 'rgba(59,130,246,.06)' : 'rgba(59,130,246,.03)',
        arcStroke:  light ? '#e2e8f0' : '#0c1220',
        hoverRing:  light ? 'rgba(34,197,94,.3)' : 'rgba(34,197,94,.4)',
        cursorDash: light ? 'rgba(34,197,94,.25)' : 'rgba(34,197,94,.3)',
    };
}

function initCv() {
    const w = document.getElementById('cwrap');
    const dpr = devicePixelRatio || 1;
    cv.width  = Math.max(1, Math.floor(w.clientWidth * dpr));
    cv.height = Math.max(1, Math.floor(w.clientHeight * dpr));
    cv.style.width  = w.clientWidth + 'px';
    cv.style.height = w.clientHeight + 'px';
    cx.scale(dpr, dpr);
}

function render() {
    const dpr = devicePixelRatio || 1;
    const w = cv.width / dpr, h = cv.height / dpr;
    cx.clearRect(0, 0, w, h);
    cx.save();
    cx.setTransform(V.s * dpr, 0, 0, V.s * dpr, V.tx * dpr, V.ty * dpr);
    drawGrid(w, h);
    State.shapes.forEach((sh, i) => drawShape(sh, i, State.mode === 'edit' && State.sel === i));
    if (State.cur) drawCursor();
    cx.restore();
    updArea();
}

/* ── Grid chizish ── */
function drawGrid(cw, ch) {
    const cc = getCC();
    const s = V.s, lw = 1 / s;
    const gx0 = Math.floor((-V.tx / s) / G) * G;
    const gy0 = Math.floor((-V.ty / s) / G) * G;
    const gx1 = Math.ceil(((cw - V.tx) / s) / G) * G;
    const gy1 = Math.ceil(((ch - V.ty) / s) / G) * G;

    for (let x = gx0; x <= gx1; x += G) {
        cx.strokeStyle = (x / G) % 5 === 0 ? cc.gridMajor : cc.gridMinor;
        cx.lineWidth = lw;
        cx.beginPath(); cx.moveTo(x, gy0); cx.lineTo(x, gy1); cx.stroke();
    }
    for (let y = gy0; y <= gy1; y += G) {
        cx.strokeStyle = (y / G) % 5 === 0 ? cc.gridMajor : cc.gridMinor;
        cx.lineWidth = lw;
        cx.beginPath(); cx.moveTo(gx0, y); cx.lineTo(gx1, y); cx.stroke();
    }

    cx.fillStyle = cc.gridLabel;
    cx.font = `${8 / s}px "JetBrains Mono",monospace`;
    for (let x = Math.ceil(gx0 / G / 5) * G * 5; x <= gx1; x += G * 5)
        cx.fillText((x / G) + 'm', x + 2 / s, gy0 + 10 / s);
    for (let y = Math.ceil(gy0 / G / 5) * G * 5; y <= gy1; y += G * 5)
        cx.fillText((y / G) + 'm', gx0 + 2 / s, y - 2 / s);
}

/* ── Shape path yaratish ── */
function buildPath(sh) {
    cx.beginPath();
    for (let i = 0; i < sh.pts.length; i++) {
        const j = (i + 1) % sh.pts.length;
        const b = sh.segs[i].bulge || 0;
        if (i === 0) cx.moveTo(sh.pts[0].x, sh.pts[0].y);
        if (Math.abs(b) < 0.5) {
            cx.lineTo(sh.pts[j].x, sh.pts[j].y);
        } else {
            const a = arcG(sh.pts[i].x, sh.pts[i].y, sh.pts[j].x, sh.pts[j].y, b);
            if (a) cx.arc(a.cx, a.cy, a.r, a.sa, a.ea, a.acw);
            else cx.lineTo(sh.pts[j].x, sh.pts[j].y);
        }
    }
    if (sh.closed) cx.closePath();
}

/* ── Shaklni chizish ── */
function drawShape(sh, si, isSel) {
    const cc = getCC();
    const s = V.s;
    const col = isSel ? '#22c55e' : SC[si % SC.length];

    // Fill & stroke
    buildPath(sh);
    cx.fillStyle = isSel ? cc.fillSel : cc.fillNorm;
    cx.fill();
    cx.strokeStyle = col;
    cx.lineWidth = (isSel ? 2.5 : 1.8) / s;
    cx.setLineDash([]);
    buildPath(sh);
    cx.stroke();

    // Nuqta belgilari
    sh.pts.forEach((p, i) => {
        cx.beginPath(); cx.arc(p.x, p.y, 5 / s, 0, Math.PI * 2);
        cx.fillStyle = col; cx.fill();
        cx.strokeStyle = cc.ptStroke; cx.lineWidth = 1.5 / s; cx.stroke();
        cx.fillStyle = col;
        cx.font = `600 ${10 / s}px "JetBrains Mono",monospace`;
        cx.fillText(ALP[i] + (si + 1), p.x + 7 / s, p.y - 7 / s);
    });

    // O'lcham belgilari
    sh.pts.forEach((p, i) => {
        const j = (i + 1) % sh.pts.length;
        const b = sh.segs[i].bulge || 0;
        const hp = hPos(p.x, p.y, sh.pts[j].x, sh.pts[j].y, b);
        const vl = (aLen(p.x, p.y, sh.pts[j].x, sh.pts[j].y, b) / G).toFixed(2);
        const ml = sh.lens[i] != null ? sh.lens[i] : vl;
        const txt = ml + 'm';

        cx.font = `500 ${9 / s}px "JetBrains Mono",monospace`;
        const tw = cx.measureText(txt).width;

        cx.fillStyle = cc.dimBg;
        cx.beginPath(); cx.roundRect(hp.x - tw / 2 - 5 / s, hp.y - 21 / s, tw + 10 / s, 16 / s, 4 / s);
        cx.fill();
        cx.strokeStyle = cc.dimBorder; cx.lineWidth = 0.8 / s; cx.stroke();
        cx.fillStyle = cc.dimText;
        cx.fillText(txt, hp.x - tw / 2, hp.y - 10 / s);
    });

    // Edit mode: arc va point handle'lar
    if (isSel) {
        sh.pts.forEach((p, i) => {
            const j = (i + 1) % sh.pts.length;
            const b = sh.segs[i].bulge || 0;
            const hp = hPos(p.x, p.y, sh.pts[j].x, sh.pts[j].y, b);
            const hv = State.hovA && State.hovA.si === si && State.hovA.seg === i;

            cx.beginPath(); cx.arc(hp.x, hp.y, (hv ? HR + 2 : HR) / s, 0, Math.PI * 2);
            cx.fillStyle = hv ? '#22c55e' : (b ? 'rgba(167,139,250,.75)' : 'rgba(59,130,246,.6)');
            cx.fill();
            cx.strokeStyle = cc.arcStroke; cx.lineWidth = 2 / s; cx.stroke();

            // Arc ikonka — doim oq (rangli bg da)
            cx.fillStyle = '#fff';
            cx.font = `bold ${9 / s}px sans-serif`;
            cx.textAlign = 'center'; cx.textBaseline = 'middle';
            cx.fillText('\u2322', hp.x, hp.y + 1 / s);
            cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
        });

        sh.pts.forEach((p, i) => {
            if (State.hovP && State.hovP.si === si && State.hovP.pi === i) {
                cx.beginPath(); cx.arc(p.x, p.y, 12 / s, 0, Math.PI * 2);
                cx.strokeStyle = cc.hoverRing;
                cx.lineWidth = 2 / s; cx.stroke();
            }
        });
    }
}

/* ── Chizish kursori ── */
function drawCursor() {
    const cc = getCC();
    const p = State.cur.pts;
    if (!p.length) return;
    const s = V.s;

    cx.strokeStyle = '#22c55e'; cx.lineWidth = 2 / s;
    cx.setLineDash([5 / s, 4 / s]);
    cx.beginPath(); cx.moveTo(p[0].x, p[0].y);
    p.forEach((pt, i) => { if (i) cx.lineTo(pt.x, pt.y); });
    cx.lineTo(State.ms.x, State.ms.y);
    cx.stroke(); cx.setLineDash([]);

    if (p.length > 2 && Math.hypot(p[0].x - State.ms.x, p[0].y - State.ms.y) < cdw()) {
        cx.beginPath(); cx.arc(p[0].x, p[0].y, cdw(), 0, Math.PI * 2);
        cx.strokeStyle = cc.cursorDash;
        cx.lineWidth = 2 / s;
        cx.setLineDash([3 / s, 3 / s]); cx.stroke(); cx.setLineDash([]);
    }

    p.forEach((pt, i) => {
        cx.beginPath(); cx.arc(pt.x, pt.y, 5 / s, 0, Math.PI * 2);
        cx.fillStyle = i === 0 ? '#22c55e' : '#3b82f6'; cx.fill();
        cx.strokeStyle = cc.ptStroke; cx.lineWidth = 1.5 / s; cx.stroke();
        cx.fillStyle = i === 0 ? '#22c55e' : '#3b82f6';
        cx.font = `600 ${10 / s}px "JetBrains Mono",monospace`;
        cx.fillText(ALP[i], pt.x + 7 / s, pt.y - 7 / s);
    });
}

/* ── Zoom ── */
function zoomAt(f, sx, sy) {
    const ns = clamp(V.s * f, V.mn, V.mx);
    if (ns === V.s) return;
    const r = ns / V.s;
    V.tx = sx - r * (sx - V.tx);
    V.ty = sy - r * (sy - V.ty);
    V.s = ns;
    render();
}

function zoomIn()  { const r = cv.getBoundingClientRect(); zoomAt(1.3, r.width / 2, r.height / 2); }
function zoomOut() { const r = cv.getBoundingClientRect(); zoomAt(1 / 1.3, r.width / 2, r.height / 2); }

function resetView() {
    V.s = 1; V.tx = 0; V.ty = 0;
    render();
}