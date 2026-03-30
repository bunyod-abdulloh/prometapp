/* ══════════════════════════════════════════════
   utils.js — Matematik va geometriya funksiyalari
   ══════════════════════════════════════════════ */

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function normA(a) { return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); }
function pD(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function pM(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

// Burchak oralig'ini tekshirish (counter-clockwise)
function betCCW(a, s, e) {
    a = normA(a); s = normA(s); e = normA(e);
    return s <= e ? (a >= s && a <= e) : (a >= s || a <= e);
}

// Screen → World koordinata
function s2w(sx, sy) {
    return { x: (sx - V.tx) / V.s, y: (sy - V.ty) / V.s };
}

// Canvas markazini world koordinatada olish
function vc() {
    const r = cv.getBoundingClientRect();
    return s2w(r.width / 2, r.height / 2);
}

// Canvas screen pozitsiyasi
function csp(e) {
    const r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

// Dinamik radiuslar (zoom darajasiga qarab)
function ahr() { return (HR + 4) / V.s; }
function phr() { return 12 / V.s; }
function cdw() { return CD / V.s; }

/* ── Arc (yoy) geometriyasi ── */
function arcG(x1, y1, x2, y2, b) {
    if (Math.abs(b) < 0.5) return null;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1, ln = Math.hypot(dx, dy);
    if (ln < 1) return null;

    const px = -dy / ln, py = dx / ln;
    const ax = mx + b * px, ay = my + b * py;
    const D = 2 * (x1 * (ay - y2) + ax * (y2 - y1) + x2 * (y1 - ay));
    if (Math.abs(D) < 0.001) return null;

    const ccx = ((x1*x1+y1*y1)*(ay-y2) + (ax*ax+ay*ay)*(y2-y1) + (x2*x2+y2*y2)*(y1-ay)) / D;
    const ccy = ((x1*x1+y1*y1)*(x2-ax) + (ax*ax+ay*ay)*(x1-x2) + (x2*x2+y2*y2)*(ax-x1)) / D;
    const r = Math.hypot(x1 - ccx, y1 - ccy);
    const sa = Math.atan2(y1 - ccy, x1 - ccx);
    const ea = Math.atan2(y2 - ccy, x2 - ccx);
    const ap = Math.atan2(ay - ccy, ax - ccx);
    const acw = !betCCW(ap, sa, ea);
    const span = acw ? normA(sa - ea) : normA(ea - sa);

    return { cx: ccx, cy: ccy, r, sa, ea, acw, span };
}

// Arc uzunligi
function aLen(x1, y1, x2, y2, b) {
    const a = arcG(x1, y1, x2, y2, b);
    return a ? a.r * a.span : Math.hypot(x2 - x1, y2 - y1);
}

// Arc handle pozitsiyasi (bulge uchun)
function hPos(x1, y1, x2, y2, b) {
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
    return { x: (x1 + x2) / 2 + b * (-dy / l), y: (y1 + y2) / 2 + b * (dx / l) };
}

// Nuqtadan chiziqqa offset (bulge drag uchun)
function pOff(x1, y1, x2, y2, mx, my) {
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
    return (mx - (x1 + x2) / 2) * (-dy / l) + (my - (y1 + y2) / 2) * (dx / l);
}

/* ── Shape geometriyasi ── */

// Shaklni polygon nuqtalariga aylantirish (arc segmentlarni ham)
function sPoly(sh, n = 24) {
    const o = [];
    for (let i = 0; i < sh.pts.length; i++) {
        const j = (i + 1) % sh.pts.length;
        const b = sh.segs[i].bulge || 0;
        if (Math.abs(b) < 0.5) {
            o.push({ x: sh.pts[i].x, y: sh.pts[i].y });
        } else {
            const a = arcG(sh.pts[i].x, sh.pts[i].y, sh.pts[j].x, sh.pts[j].y, b);
            if (!a) { o.push({ x: sh.pts[i].x, y: sh.pts[i].y }); continue; }
            const d = a.acw ? -1 : 1;
            for (let k = 0; k < n; k++) {
                const ang = a.sa + d * a.span * (k / n);
                o.push({ x: a.cx + a.r * Math.cos(ang), y: a.cy + a.r * Math.sin(ang) });
            }
        }
    }
    return o;
}

// Shakl yuzasini hisoblash
function sArea(sh) {
    if (!sh.closed || sh.pts.length < 3) return 0;
    const a = sPoly(sh, 32);
    let s = 0;
    for (let i = 0; i < a.length; i++) {
        const j = (i + 1) % a.length;
        s += a[i].x * a[j].y - a[j].x * a[i].y;
    }
    return Math.abs(s) / 2;
}

// Nuqta shakl ichidami? (ray casting)
function ptIn(x, y, sh) {
    if (!sh.closed || sh.pts.length < 3) return false;
    const a = sPoly(sh, 18);
    let ins = false;
    for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
        const xi = a[i].x, yi = a[i].y, xj = a[j].x, yj = a[j].y;
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
}

// Berilgan nuqtada eng ustdagi shaklni topish
function topAt(x, y) {
    for (let i = State.shapes.length - 1; i >= 0; i--) {
        if (ptIn(x, y, State.shapes[i])) return i;
    }
    return null;
}