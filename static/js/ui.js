/* ══════════════════════════════════════════════
   ui.js — Navigatsiya, panellar, DOM yangilash
   ══════════════════════════════════════════════ */
/* ui.js — setRealVH ni shu bilan almashtir */
function setRealVH() {
    const height = window.visualViewport?.height || window.innerHeight;
    const vh = height * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setRealVH();

// visualViewport — keyboard ochilganda ham ishlaydi
window.visualViewport?.addEventListener('resize', setRealVH);
window.visualViewport?.addEventListener('scroll', setRealVH);

// Fallback: eski brauzerlar uchun
window.addEventListener('resize', setRealVH);

if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.onEvent('viewportChanged', function() {
        var h = (window.visualViewport?.height || window.innerHeight) * 0.01;
        document.documentElement.style.setProperty('--vh', h + 'px');
    });
}
/* ── Sahifa navigatsiyasi ── */
function goP(p) {
    document.querySelectorAll('.pg').forEach(e => e.classList.remove('on'));
    document.getElementById('pg-' + p).classList.add('on');
    document.querySelectorAll('.nt').forEach(t => t.classList.toggle('on', t.dataset.p === p));
    if (p === 'calc') requestAnimationFrame(() => { initCv(); redraw(); });
    hap('selectionChanged');
}

function rpTab(t) {
    document.querySelectorAll('.rpt').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    document.querySelectorAll('.rpn').forEach(p => p.classList.toggle('vis', p.dataset.t === t));
    hap('selectionChanged');
}

/* ── Tom sozlamalari ── */
function setRoof(r) {
    cfg.roof = r;
    document.querySelectorAll('.rf').forEach(b => b.classList.toggle('on', b.dataset.r === r));
    upC();
    hap('impactLight');
}

/* ── Chizish rejimi boshqaruvi ── */
function setMode(m) {
    State.mode = m;
    document.getElementById('b-draw').classList.toggle('on', m === 'draw');
    document.getElementById('b-edit').classList.toggle('on', m === 'edit');
    cv.style.cursor = m === 'draw' ? 'crosshair' : 'default';
    State.dirty = true; redraw();
    hap('selectionChanged');
}

function toggleSnap() {
    State.snap = !State.snap;
    document.getElementById('b-snap').classList.toggle('on', State.snap);
    hap('impactLight');
}

/* ── O'lcham panelini yangilash ── */
/*function upD() {
    const el = document.getElementById('dims');
    if (!State.shapes.length) {
        el.innerHTML = '<div class="empty">' +
            '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity=".3">' +
            '<rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>' +
            '<path d="M14 20H26M20 14V26" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>' +
            '</svg><p>Shakl chizing</p></div>';
        return;
    }

    el.innerHTML = State.shapes.map((sh, si) => {
        const rows = sh.pts.map((p, i) => {
            const j = (i + 1) % sh.pts.length;
            const b = sh.segs[i].bulge || 0;
            const vl = (aLen(p.x, p.y, sh.pts[j].x, sh.pts[j].y, b) / G).toFixed(2);
            const ml = sh.lens[i] != null ? sh.lens[i] : vl;
            const tag = b
                ? '<span class="st arc">EGRI</span>'
                : '<span class="st lin">TO\'G\'RI</span>';

            return '<div class="sr">' + tag +
                '<span class="sl">' + ALP[i] + (si + 1) + '\u2013' + ALP[j] + (si + 1) + '</span>' +
                '<input class="si" type="number" value="' + ml + '" min="0.01" step="0.1" inputmode="decimal"' +
                ' onpointerdown="event.stopPropagation()" onclick="event.stopPropagation()"' +
                ' oninput="setL(' + si + ',' + i + ',this.value)">' +
                '<span class="su">m</span></div>';
        }).join('');

        return '<div class="sc' + (State.sel === si ? ' sel' : '') + '" onclick="pickSh(' + si + ')">' +
            '<div class="sct"><span>\u25C6 SHAKL #' + (si + 1) + '</span>' +
            '<button class="scd" onclick="event.stopPropagation();delSh(' + si + ')">\u2715</button></div>' +
            rows + '</div>';
    }).join('');
}
*/
function setL(si, i, v) {
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0) {
        State.shapes[si].lens[i] = n;
        render(); upC();
    }
}

/* ── Hint va portfolio ── */
function upH() {
    const h = document.getElementById('cv-hint');
    if (h) h.classList.toggle('hid', State.shapes.length > 0 || (State.cur && State.cur.pts.length > 0));
}

function initClr() { /* rang tanlash — prod images bilan almashtirilgan */ }

function pickProd(idx) {
    document.querySelectorAll('.prod-card').forEach(el => el.classList.remove('on'));

    const selected = document.querySelector(`.prod-card[data-idx="${idx}"]`);
    selected.classList.add('on');

    const slug = selected.dataset.slug;
    cfg.color = slug;
    document.getElementById('selected-color-slug').value = slug;
    hap('impactLight');
}

/** Portfolio gradient — theme ga qarab end color o'zgaradi */
function getPortGradient(baseColor) {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    const end = light ? '#f8fafc' : '#080c14';
    return 'linear-gradient(135deg,' + baseColor + ',' + end + ')';
}

function initPort() {
    document.getElementById('pgrid').innerHTML = PROJ.map(p =>
        '<div class="pc">' +
        '<div class="pc-img"><div class="pc-bg" style="background:' + getPortGradient(p.cl) + '"></div>' +
        '<span class="pc-bd">' + p.tp + '</span></div>' +
        '<div class="pc-nf"><h3>' + p.t + '</h3><p>' + p.d + '</p>' +
        '<div class="pc-m">' +
        '<span><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.1"/></svg>' + p.a + '</span>' +
        '<span><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.1"/><path d="M6 3V6H9" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>' + p.y + '</span>' +
        '</div></div></div>'
    ).join('');
}

function togglePanel() {
    const calc = document.querySelector('.calc');
    const btn = document.getElementById('rp-toggle');
    const isCollapsed = calc.classList.toggle('collapsed');

    btn.querySelector('span').textContent = isCollapsed ? 'Sozlamalar' : 'Yopish';

    requestAnimationFrame(() => {
        initCv();
        redraw();
    });

    hap('impactLight');
}