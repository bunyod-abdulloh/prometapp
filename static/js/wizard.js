/* ══════════════════════════════════════════════
   wizard.js — Step-by-step hisoblash wizard

   Qadamlar:
   0 — Shakl tanlash (15 ta shablon + murakkab)
   1 — O'lcham kiritish
   2 — Tom turi
   3 — Profnastil
   4 — Rang
   5 — Xulosa + Hisoblash
   ══════════════════════════════════════════════ */

console.log("wizard loaded");

window.WZ = {
    step: 0,
    total: 6,
    shape: 'rect',
    dims: {},
    customDraw: false,
};

window.wzInit = function () {
    console.log("wzInit called");
    wzRender();
    wzGoTo(0);
};

/* ── Step ma'lumotlari (sarlavha + ko'rsatma) ── */
const STEPS = [
    {
        title: 'Uy shaklini tanlang',
        hint: 'Uyingiz tepadan qarasangiz qanday ko\'rinishda? Eng mos shaklni tanlang.',
        icon: '<path d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 21V12H15V21" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    },
    {
        title: 'O\'lchamlarni kiriting',
        hint: 'Har bir tomonning uzunligini metrda kiriting. Chizma avtomatik yangilanadi.',
        icon: '<path d="M21 3H3V21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M21 3L3 21" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3" opacity=".4"/><path d="M21 3V8M21 3H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 21H8M3 21V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    },
    {
        title: 'Tom turini tanlang',
        hint: 'Tom qanday bo\'lishini belgilang. Har bir tur narxga ta\'sir qiladi.',
        icon: '<path d="M3 12L12 4L21 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="5" y="12" width="14" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>',
    },
    {
        title: 'Profnastil parametrlari',
        hint: 'Ishlab chiqaruvchi davlat, tur va qalinligini tanlang.',
        icon: '<path d="M2 6L5 3L8 6L11 3L14 6L17 3L20 6M2 12L5 9L8 12L11 9L14 12L17 9L20 12M2 18L5 15L8 18L11 15L14 18L17 15L20 18" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    },
    {
        title: 'Rang tanlang',
        hint: 'Profnastil rangini tanlang. Rang narxga ta\'sir qilmaydi.',
        icon: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="7" r="2.5" fill="currentColor" opacity=".6"/><circle cx="7.5" cy="14.5" r="2.5" fill="currentColor" opacity=".6"/><circle cx="16.5" cy="14.5" r="2.5" fill="currentColor" opacity=".6"/>',
    },
    {
        title: 'Tekshirish va hisoblash',
        hint: 'Ma\'lumotlarni tekshiring. Hammasi to\'g\'ri bo\'lsa — \"Hisoblash\" tugmasini bosing.',
        icon: '<path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" stroke="currentColor" stroke-width="1.5"/>',
    },
];

/* ══════════════════════════════════════════════
   15 ta uy shakli
   ══════════════════════════════════════════════ */
const SHAPES = [
    /* 1 */ {
        id: 'rect', name: "To'rtburchak",
        svg: 'M6 10H42V38H6Z',
        fields: [
            { key: 'w', label: 'Eni', def: 10 },
            { key: 'h', label: "Bo'yi", def: 8 },
        ],
        pts: d => [[0,0],[d.w,0],[d.w,d.h],[0,d.h]],
    },
    /* 3 */ {
        id: 'l_left', name: 'L-shakl (chap)',
        svg: 'M6 6H26V22H42V42H6Z',
        fields: [
            { key: 'w', label: 'Umumiy eni', def: 10 },
            { key: 'h', label: "Umumiy bo'yi", def: 10 },
            { key: 'iw', label: "O'ng qismi eni", def: 5 },
            { key: 'ih', label: "O'ng qismi bo'yi", def: 5 },
        ],
        pts: d => {
            const iw = Math.min(d.iw, d.w - .1), ih = Math.min(d.ih, d.h - .1);
            return [[0,0],[d.w-iw,0],[d.w-iw,d.h-ih],[d.w,d.h-ih],[d.w,d.h],[0,d.h]];
        },
    },
    /* 4 */ {
        id: 'l_right', name: "L-shakl (o'ng)",
        svg: 'M22 6H42V42H6V22H22Z',
        fields: [
            { key: 'w', label: 'Umumiy eni', def: 10 },
            { key: 'h', label: "Umumiy bo'yi", def: 10 },
            { key: 'iw', label: 'Chap qismi eni', def: 5 },
            { key: 'ih', label: "Chap qismi bo'yi", def: 5 },
        ],
        pts: d => {
            const iw = Math.min(d.iw, d.w - .1), ih = Math.min(d.ih, d.h - .1);
            return [[iw,0],[d.w,0],[d.w,d.h],[0,d.h],[0,d.h-ih],[iw,d.h-ih]];
        },
    },
    /* 5 */ {
        id: 't_top', name: 'T-shakl',
        svg: 'M6 6H42V18H30V42H18V18H6Z',
        fields: [
            { key: 'w', label: 'Umumiy eni', def: 12 },
            { key: 'h', label: "Umumiy bo'yi", def: 10 },
            { key: 'tw', label: "Oyoq eni", def: 4 },
            { key: 'th', label: "Bosh bo'yi", def: 3 },
        ],
        pts: d => {
            const tw = Math.min(d.tw, d.w), th = Math.min(d.th, d.h - .1);
            const s = (d.w - tw) / 2;
            return [[0,0],[d.w,0],[d.w,th],[s+tw,th],[s+tw,d.h],[s,d.h],[s,th],[0,th]];
        },
    },
    /* 6 */ {
        id: 't_bottom', name: 'Teskari T',
        svg: 'M18 6H30V30H42V42H6V30H18Z',
        fields: [
            { key: 'w', label: 'Umumiy eni', def: 12 },
            { key: 'h', label: "Umumiy bo'yi", def: 10 },
            { key: 'tw', label: "Oyoq eni", def: 4 },
            { key: 'th', label: "Pastki bo'yi", def: 3 },
        ],
        pts: d => {
            const tw = Math.min(d.tw, d.w), th = Math.min(d.th, d.h - .1);
            const s = (d.w - tw) / 2;
            return [[s,0],[s+tw,0],[s+tw,d.h-th],[d.w,d.h-th],[d.w,d.h],[0,d.h],[0,d.h-th],[s,d.h-th]];
        },
    },
    /* 7 */ {
        id: 'u_shape', name: "П-shakl",
        svg: 'M6 6H18V30H30V6H42V42H6Z',
        fields: [
            { key: 'w', label: 'Umumiy eni', def: 12 },
            { key: 'h', label: "Umumiy bo'yi", def: 10 },
            { key: 'iw', label: "Ichki bo'shliq eni", def: 4 },
            { key: 'ih', label: "Ichki bo'shliq bo'yi", def: 6 },
        ],
        pts: d => {
            const iw = Math.min(d.iw, d.w - 1), ih = Math.min(d.ih, d.h - .5);
            const s = (d.w - iw) / 2;
            return [[0,0],[s,0],[s,ih],[s+iw,ih],[s+iw,0],[d.w,0],[d.w,d.h],[0,d.h]];
        },
    },
    /* 8 */ {
        id: 'u_inv', name: "Teskari П",
        svg: 'M6 6H42V42H30V18H18V42H6Z',
        fields: [
            { key: 'w', label: 'Umumiy eni', def: 12 },
            { key: 'h', label: "Umumiy bo'yi", def: 10 },
            { key: 'iw', label: "Ichki bo'shliq eni", def: 4 },
            { key: 'ih', label: "Ichki bo'shliq bo'yi", def: 6 },
        ],
        pts: d => {
            const iw = Math.min(d.iw, d.w - 1), ih = Math.min(d.ih, d.h - .5);
            const s = (d.w - iw) / 2;
            return [[0,0],[d.w,0],[d.w,d.h],[s+iw,d.h],[s+iw,d.h-ih],[s,d.h-ih],[s,d.h],[0,d.h]];
        },
    },
    /* 9 */ {
        id: 'g_shape', name: "C-shakl",
        svg: 'M6 6H42V18H18V30H42V42H6Z',
        fields: [
            { key: 'w', label: 'Umumiy eni', def: 12 },
            { key: 'h', label: "Umumiy bo'yi", def: 10 },
            { key: 'iw', label: "Ichki eni", def: 7 },
            { key: 'ih', label: "Ichki bo'yi", def: 4 },
        ],
        pts: d => {
            const iw = Math.min(d.iw, d.w - .5), ih = Math.min(d.ih, d.h - 1);
            const top = (d.h - ih) / 2;
            return [[0,0],[d.w,0],[d.w,top],[d.w-iw,top],[d.w-iw,top+ih],[d.w,top+ih],[d.w,d.h],[0,d.h]];
        },
    },
    /* 16 — Murakkab (qo'lda chizish) */ {
        id: 'custom', name: "Murakkab chizma",
        svg: 'M10 38L16 14L26 26L34 10L40 22',
        fields: [],
        pts: () => [],
        isCustom: true,
    },
];

/* ══════════════════════════════════════════════
   Wizard boshqaruvi
   ══════════════════════════════════════════════ */

/* ── Step'ga o'tish ── */
function wzGoTo(n) {
    if (n < 0 || n >= WZ.total) return;
    WZ.step = n;

    // Barcha step'larni yashirish
    document.querySelectorAll('.wz-body').forEach(el => el.classList.remove('vis'));
    const body = document.getElementById('wz-s' + n);
    if (body) body.classList.add('vis');

    // Progress bar
    wzUpdateProgress();

    // Step header
    wzUpdateHeader();

    // Navigation buttons
    wzUpdateNav();

    // Step-ga xos init
    switch (n) {
        case 0: wzInitShapes(); break;
        case 1: wzInitDims(); break;
        case 2: wzInitRoof(); break;
        case 3: wzInitProf(); break;
        case 4: wzInitColor(); break;
        case 5: wzInitSummary(); break;
    }

    hap('selectionChanged');
}

function wzNext() {
    // Murakkab chizma tanlangan — to'g'ridan-to'g'ri canvas'ga o'tish
    if (WZ.step === 0 && WZ.customDraw) {
        wzSwitchToCanvas();
        if (!localStorage.getItem('promet-tut-seen')) {
            localStorage.setItem('promet-tut-seen', '1');
            setTimeout(() => showCanvasTut(), 300);
        }
        return;
    }
    if (WZ.step < WZ.total - 1) wzGoTo(WZ.step + 1);
}

function wzPrev() {
    if (WZ.step > 0) wzGoTo(WZ.step - 1);
}

/* ── Progress bar ── */
function wzUpdateProgress() {
    const pct = ((WZ.step + 1) / WZ.total * 100).toFixed(0);
    const bar = document.getElementById('wz-prog-bar');
    if (bar) bar.style.width = pct + '%';

    // Step indikatorlar
    document.querySelectorAll('.wz-dot').forEach((dot, i) => {
        dot.classList.toggle('done', i < WZ.step);
        dot.classList.toggle('on', i === WZ.step);
    });
}

/* ── Header ── */
function wzUpdateHeader() {
    const s = STEPS[WZ.step];
    const hdr = document.getElementById('wz-header');
    if (!hdr) return;

    hdr.innerHTML =
        '<div class="wz-step-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none">' + s.icon + '</svg></div>' +
        '<div class="wz-step-info">' +
            '<div class="wz-step-num">' + (WZ.step + 1) + '-qadam</div>' +
            '<h2 class="wz-step-title">' + s.title + '</h2>' +
        '</div>';

    const hint = document.getElementById('wz-hint');
    if (hint) hint.textContent = s.hint;
}

/* ── Nav tugmalar ── */
function wzUpdateNav() {
    const prev = document.getElementById('wz-prev');
    const next = document.getElementById('wz-next');
    const home = document.getElementById('wz-home');

    if (prev) prev.style.display = WZ.step === 0 ? 'none' : '';

    if (WZ.step === WZ.total - 1) {
        // Oxirgi step: Orqaga + Bosh sahifa ko'rinadi, Keyingi yashirinadi
        if (next) next.style.display = 'none';
        if (home) home.style.display = '';
    } else {
        if (next) {
            next.style.display = '';
            const isCustom = WZ.step === 0 && WZ.customDraw;
            next.innerHTML = (isCustom ? "Chizmaga o'tish" : 'Keyingi') +
                ' <svg width="18" height="18" viewBox="0 0 24 24" fill="none">' +
                '<path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
        if (home) home.style.display = 'none';
    }
}

/* ── Bosh sahifaga qaytish — wizardni reset qilish ── */
function wzGoHome() {
    WZ.step = 0;
    WZ.shape = 'rect';
    WZ.dims = {};
    WZ.customDraw = false;
    State.shapes = [];
    State.sel = null;
    State.dirty = true;

    // Shapes grid ni qayta render qilish uchun tozalash
    const grid = document.getElementById('wz-shapes');
    if (grid) grid.innerHTML = '';

    wzGoTo(0);
    hap('impactLight');
}

/* ══════════════════════════════════════════════
   Step 0 — Shakl tanlash
   ══════════════════════════════════════════════ */
function wzInitShapes() {
    const grid = document.getElementById('wz-shapes');
    if (!grid || grid.children.length > 0) return; // Faqat birinchi marta

    grid.innerHTML = SHAPES.map(sh => {
        const isCustom = sh.isCustom;
        return '<button class="wz-sh' + (sh.id === WZ.shape ? ' on' : '') +
            (isCustom ? ' wz-sh-custom' : '') +
            '" data-sh="' + sh.id + '" onclick="wzPickShape(\'' + sh.id + '\')">' +
            '<svg viewBox="0 0 48 48" fill="none">' +
            '<path d="' + sh.svg + '" stroke="currentColor" stroke-width="1.5"' +
            (isCustom ? ' stroke-linecap="round" stroke-linejoin="round" fill="none"' : ' fill="none"') +
            '/>' +
            (isCustom ? '<circle cx="16" cy="14" r="2" fill="currentColor" opacity=".5"/>' +
            '<circle cx="26" cy="26" r="2" fill="currentColor" opacity=".5"/>' +
            '<circle cx="34" cy="10" r="2" fill="currentColor" opacity=".5"/>' : '') +
            '</svg>' +
            '<span>' + sh.name + '</span>' +
            '</button>';
    }).join('');
}

function wzPickShape(id) {
    WZ.shape = id;
    WZ.customDraw = (id === 'custom');
    WZ.dims = {};

    document.querySelectorAll('.wz-sh').forEach(b =>
        b.classList.toggle('on', b.dataset.sh === id)
    );

    // Keyingi tugma matnini o'zgartirish
    const next = document.getElementById('wz-next');
    if (next) {
        const label = WZ.customDraw ? "Chizmaga o'tish" : 'Keyingi';
        next.innerHTML = label +
            ' <svg width="18" height="18" viewBox="0 0 24 24" fill="none">' +
            '<path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    hap('impactLight');
}

/* ══════════════════════════════════════════════
   Step 1 — O'lchamlar
   ══════════════════════════════════════════════ */
function wzInitDims() {
    const sh = SHAPES.find(s => s.id === WZ.shape);
    if (!sh) return;

    const inputs = document.getElementById('wz-dim-inputs');
    if (!inputs) return;

    inputs.innerHTML = sh.fields.map(f => {
        const val = WZ.dims[f.key] ?? f.def;
        WZ.dims[f.key] = val;
        return '<div class="wz-inp">' +
            '<label>' + f.label + '</label>' +
            '<div class="wz-inp-wrap">' +
                '<input type="number" step="0.1" min="0.1" inputmode="decimal"' +
                ' value="' + val + '" data-key="' + f.key + '"' +
                ' oninput="wzDimChange(this)" placeholder="0.0">' +
                '<span class="wz-inp-unit">m</span>' +
            '</div>' +
        '</div>';
    }).join('');

    // "Chizmada tahrirlash" tugmasi
    const editWrap = document.getElementById('wz-edit-wrap');
    if (editWrap) {
        editWrap.innerHTML =
            '<button class="wz-edit-btn" onclick="wzEditInCanvas()">' +
                '<svg width="15" height="15" viewBox="0 0 16 16" fill="none">' +
                '<path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>' +
                '</svg>' +
                'Chizmada tahrirlash' +
            '</button>';
    }

    wzDrawPreview();
}

/* ── Template shaklni canvas'da tahrirlash ── */
function wzEditInCanvas() {
    wzSyncToState();
    wzSwitchToCanvas();
    setMode('edit');
    State.sel = 0;
    State.dirty = true;
    redraw();
}

function wzDimChange(inp) {
    const val = parseFloat(inp.value);
    if (!isNaN(val) && val > 0) {
        WZ.dims[inp.dataset.key] = val;
        wzDrawPreview();
    }
}

/* ── Preview canvas ── */
function wzDrawPreview() {
    const canvas = document.getElementById('wz-preview-cv');
    if (!canvas) return;

    const wrap = canvas.parentElement;
    const dpr = devicePixelRatio || 1;
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    canvas.style.width = wrap.clientWidth + 'px';
    canvas.style.height = wrap.clientHeight + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const W = wrap.clientWidth, H = wrap.clientHeight, pad = 45;

    const sh = SHAPES.find(s => s.id === WZ.shape);
    if (!sh) return;

    // Default qiymatlar
    sh.fields.forEach(f => {
        if (WZ.dims[f.key] == null) WZ.dims[f.key] = f.def;
    });

    const raw = sh.pts(WZ.dims);
    if (!raw || raw.length < 3) return;

    // Bounding box va scale
    let mnX = Infinity, mnY = Infinity, mxX = -Infinity, mxY = -Infinity;
    raw.forEach(([x, y]) => { mnX = Math.min(mnX, x); mnY = Math.min(mnY, y); mxX = Math.max(mxX, x); mxY = Math.max(mxY, y); });
    const sW = mxX - mnX, sH = mxY - mnY;
    if (sW <= 0 || sH <= 0) return;

    const sc = Math.min((W - pad * 2) / sW, (H - pad * 2) / sH);
    const ox = (W - sW * sc) / 2 - mnX * sc;
    const oy = (H - sH * sc) / 2 - mnY * sc;
    const pts = raw.map(([x, y]) => [x * sc + ox, y * sc + oy]);

    const light = document.documentElement.getAttribute('data-theme') === 'light';

    // Shakl chizish
    ctx.beginPath();
    pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.fillStyle = light ? 'rgba(34,197,94,.08)' : 'rgba(34,197,94,.05)';
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Nuqtalar
    pts.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e'; ctx.fill();
    });

    // O'lcham belgilari
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        const [x1, y1] = pts[i], [x2, y2] = pts[j];
        const [rx1, ry1] = raw[i], [rx2, ry2] = raw[j];
        const len = Math.sqrt((rx2 - rx1) ** 2 + (ry2 - ry1) ** 2);
        if (len < 0.05) continue;

        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const dx = x2 - x1, dy = y2 - y1;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / d * 18, ny = dx / d * 18;
        const lx = mx + nx, ly = my + ny;
        const txt = len.toFixed(1) + 'm';
        const tw = ctx.measureText(txt).width;

        ctx.fillStyle = light ? 'rgba(255,255,255,.92)' : 'rgba(12,18,32,.9)';
        ctx.beginPath(); ctx.roundRect(lx - tw / 2 - 5, ly - 9, tw + 10, 18, 4); ctx.fill();
        ctx.strokeStyle = light ? 'rgba(0,0,0,.06)' : 'rgba(34,197,94,.12)';
        ctx.lineWidth = .7; ctx.stroke();
        ctx.fillStyle = light ? '#475569' : '#94a3b8';
        ctx.fillText(txt, lx, ly);
    }

    // Yuza
    const sh2 = SHAPES.find(s => s.id === WZ.shape);
    const area = sh2.area ? sh2.area(WZ.dims) : wzCalcArea(raw);
    const areaEl = document.getElementById('wz-area');
    if (areaEl) areaEl.textContent = area.toFixed(2) + ' m²';

    // O-ramka: ichki to'rtburchakni chizish
    if (sh2.innerPts) {
        const innerRaw = sh2.innerPts(WZ.dims);
        const innerPts = innerRaw.map(([x, y]) => [x * sc + ox, y * sc + oy]);

        ctx.beginPath();
        innerPts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.closePath();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        innerPts.forEach(([x, y]) => {
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#22c55e'; ctx.fill();
        });
    }
}

function wzCalcArea(pts) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        a += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
    }
    return Math.abs(a / 2);
}

/* ══════════════════════════════════════════════
   Step 2 — Tom turi (mavjud UI'dan foydalanish)
   ══════════════════════════════════════════════ */
function wzInitRoof() {
    // Tom tugmalarini tanlangan holatga keltirish
    document.querySelectorAll('#wz-s2 .rf').forEach(b =>
        b.classList.toggle('on', b.dataset.r === cfg.roof)
    );
    wzUpdatePitchDisplay();
}

function wzSetRoof(r) {
    cfg.roof = r;
    document.querySelectorAll('#wz-s2 .rf').forEach(b =>
        b.classList.toggle('on', b.dataset.r === r)
    );
    hap('impactLight');
}

function wzSetPitch(v) {
    cfg.pitch = parseFloat(v);
    wzUpdatePitchDisplay();
}

function wzUpdatePitchDisplay() {
    const val = cfg.pitch || 2;
    const el = document.getElementById('wz-pitch-val');
    if (el) el.textContent = parseFloat(val).toFixed(1) + ' m';
    const fill = document.getElementById('wz-pitch-fill');
    if (fill) fill.style.width = ((val - 0.5) / 5.5 * 100) + '%';
}

/* ══════════════════════════════════════════════
   Step 3 — Profnastil (backend'dan yuklash)
   ══════════════════════════════════════════════ */
function wzInitProf() {
    wzLoadCountries();
}

async function wzLoadCountries() {
    const el = document.getElementById('wz-countries');
    if (!el) return;
    el.innerHTML = '<span class="wz-loading">Yuklanmoqda...</span>';

    let countries;
    try {
        const res = await fetch(`${API_BASE}/roof/countries/`);
        if (!res.ok) throw new Error();
        countries = await res.json();
    } catch { countries = FALLBACK.countries; }

    el.innerHTML = '';
    countries.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'wz-pill' + (c.slug === cfg.country ? ' on' : '');
        btn.textContent = c.name;
        btn.addEventListener('click', () => {
            el.querySelectorAll('.wz-pill').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            cfg.country = c.slug;
            wzLoadTypes(c.slug);
            hap('impactLight');
        });
        el.appendChild(btn);
    });

    wzLoadTypes(cfg.country);
}

async function wzLoadTypes(slug) {
    const el = document.getElementById('wz-types');
    const thEl = document.getElementById('wz-thick');
    if (!el) return;
    el.innerHTML = '<span class="wz-loading">Yuklanmoqda...</span>';
    if (thEl) thEl.innerHTML = '';

    let types;
    try {
        const res = await fetch(`${API_BASE}/roof/profnastil/${slug}/`);
        if (!res.ok) throw new Error();
        types = (await res.json()).types;
    } catch { types = FALLBACK.types; }

    if (!types.includes(cfg.type)) cfg.type = types[0];

    el.innerHTML = '';
    types.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'wz-pill' + (t === cfg.type ? ' on' : '');
        btn.textContent = t;
        btn.addEventListener('click', () => {
            el.querySelectorAll('.wz-pill').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            cfg.type = t;
            wzLoadThick(cfg.country, t);
            hap('impactLight');
        });
        el.appendChild(btn);
    });

    wzLoadThick(slug, cfg.type);
}

async function wzLoadThick(slug, type) {
    const el = document.getElementById('wz-thick');
    if (!el) return;
    el.innerHTML = '<span class="wz-loading">Yuklanmoqda...</span>';

    let thicknesses;
    try {
        const res = await fetch(`${API_BASE}/roof/profnastil/${slug}/?type=${type}`);
        if (!res.ok) throw new Error();
        thicknesses = (await res.json()).thicknesses;
    } catch { thicknesses = FALLBACK.thicknesses.map(v => ({ value: v, price: 0 })); }

    const values = thicknesses.map(t => t.value);
    if (!values.includes(cfg.thick)) cfg.thick = values[0];

    el.innerHTML = '';
    thicknesses.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'wz-thick-btn' + (t.value === cfg.thick ? ' on' : '');
        btn.innerHTML = '<span class="wz-th-v">' + t.value + ' mm</span>' +
            '<span class="wz-th-p">' + fmt(t.price) + " so'm/m</span>";
        btn.addEventListener('click', () => {
            el.querySelectorAll('.wz-thick-btn').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            cfg.thick = t.value;
            cfg.profPrice = t.price;
            hap('impactLight');
        });
        el.appendChild(btn);
    });
}

/* ══════════════════════════════════════════════
   Step 4 — Rang (backend'dan yuklash)
   ══════════════════════════════════════════════ */
function wzInitColor() {
    wzLoadColors();
}

async function wzLoadColors() {
    const grid = document.getElementById('wz-colors');
    if (!grid) return;
    if (grid.children.length > 1) return; // Allaqachon yuklangan

    grid.innerHTML = '<span class="wz-loading">Yuklanmoqda...</span>';

    let colors;
    try {
        const res = await fetch(`${API_BASE}/roof/colors/`);
        if (!res.ok) throw new Error();
        colors = await res.json();
    } catch {
        // Fallback: RAL ranglar
        colors = RAL.map(r => ({ slug: r.c, name: r.n, hex: r.h }));
    }

    grid.innerHTML = '';
    colors.forEach((c, i) => {
        const div = document.createElement('button');
        div.className = 'wz-color' + (i === 0 ? ' on' : '');
        div.dataset.slug = c.slug;

        if (c.image) {
            div.innerHTML = '<img src="' + c.image + '" alt="' + c.name + '"><span>' + c.name + '</span>';
        } else {
            div.innerHTML = '<div class="wz-color-swatch" style="background:' + (c.hex || '#888') + '"></div>' +
                '<span>' + c.name + '</span>';
        }

        div.addEventListener('click', () => {
            grid.querySelectorAll('.wz-color').forEach(b => b.classList.remove('on'));
            div.classList.add('on');
            cfg.color = c.slug;
            hap('impactLight');
        });
        grid.appendChild(div);
    });

    if (colors.length) cfg.color = colors[0].slug;
}

/* ══════════════════════════════════════════════
   Step 5 — Xulosa
   ══════════════════════════════════════════════ */
function wzInitSummary() {
    wzSyncToState();

    const area = wzGetArea();
    const sh = SHAPES.find(s => s.id === WZ.shape);
    const roofNames = { shed: 'Bir tomonli', gable: 'Ikki tomonli', doppili: "Do'ppili" };

    const el = document.getElementById('wz-summary');
    if (!el) return;

    el.innerHTML =
        '<div class="wz-sum-row">' +
            '<span class="wz-sum-label">Uy shakli</span>' +
            '<span class="wz-sum-val">' + (sh ? sh.name : '—') + '</span>' +
        '</div>' +
        '<div class="wz-sum-row">' +
            '<span class="wz-sum-label">Tom maydoni</span>' +
            '<span class="wz-sum-val wz-sum-accent">' + area.toFixed(2) + ' m²</span>' +
        '</div>' +
        '<div class="wz-sum-row">' +
            '<span class="wz-sum-label">Tom turi</span>' +
            '<span class="wz-sum-val">' + (roofNames[cfg.roof] || cfg.roof) + '</span>' +
        '</div>' +
        '<div class="wz-sum-row">' +
            '<span class="wz-sum-label">Profnastil</span>' +
            '<span class="wz-sum-val">' + cfg.type + ' · ' + cfg.thick + 'mm</span>' +
        '</div>' +
        '<div class="wz-sum-row">' +
            '<span class="wz-sum-label">Rang</span>' +
            '<span class="wz-sum-val">' + cfg.color + '</span>' +
        '</div>';

    // Yuza ni yangilash
    const raEl = document.getElementById('ra');
    if (raEl) raEl.textContent = area.toFixed(2) + ' m²';

    // Preview
    wzDrawSummaryPreview();
}

function wzDrawSummaryPreview() {
    const canvas = document.getElementById('wz-sum-cv');
    if (!canvas) return;

    const wrap = canvas.parentElement;
    const dpr = devicePixelRatio || 1;
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    canvas.style.width = wrap.clientWidth + 'px';
    canvas.style.height = wrap.clientHeight + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const W = wrap.clientWidth, H = wrap.clientHeight, pad = 30;

    const sh = SHAPES.find(s => s.id === WZ.shape);
    if (!sh || sh.isCustom) return;
    sh.fields.forEach(f => { if (WZ.dims[f.key] == null) WZ.dims[f.key] = f.def; });

    const raw = sh.pts(WZ.dims);
    if (!raw || raw.length < 3) return;

    let mnX = Infinity, mnY = Infinity, mxX = -Infinity, mxY = -Infinity;
    raw.forEach(([x,y]) => { mnX = Math.min(mnX,x); mnY = Math.min(mnY,y); mxX = Math.max(mxX,x); mxY = Math.max(mxY,y); });
    const sc = Math.min((W - pad * 2) / (mxX - mnX), (H - pad * 2) / (mxY - mnY));
    const ox = (W - (mxX - mnX) * sc) / 2 - mnX * sc;
    const oy = (H - (mxY - mnY) * sc) / 2 - mnY * sc;
    const pts = raw.map(([x,y]) => [x * sc + ox, y * sc + oy]);

    ctx.beginPath();
    pts.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.closePath();
    ctx.fillStyle = 'rgba(34,197,94,.06)';
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // O-ramka ichki to'rtburchak
    if (sh.innerPts) {
        const innerRaw = sh.innerPts(WZ.dims);
        const innerPts = innerRaw.map(([x,y]) => [x * sc + ox, y * sc + oy]);
        ctx.beginPath();
        innerPts.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
        ctx.closePath();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

/* ── State.shapes ga sinxronlash ── */
function wzSyncToState() {
    if (WZ.customDraw) return;

    const sh = SHAPES.find(s => s.id === WZ.shape);
    if (!sh || sh.isCustom) return;
    sh.fields.forEach(f => { if (WZ.dims[f.key] == null) WZ.dims[f.key] = f.def; });

    const raw = sh.pts(WZ.dims);
    if (!raw || raw.length < 3) return;

    const canvasPts = raw.map(([x, y]) => ({ x: x * G, y: y * G }));
    const segs = defaultSegs(canvasPts.length);

    State.shapes = [{
        pts: canvasPts,
        segs: segs,
        lens: calcSegLens(canvasPts, segs),
        closed: true,
    }];

    // O-ramka: ichki to'rtburchak — faqat vizual, yuzaga kiritilmaydi
    if (sh.innerPts) {
        const innerRaw = sh.innerPts(WZ.dims);
        const innerCanvasPts = innerRaw.map(([x, y]) => ({ x: x * G, y: y * G }));
        const innerSegs = defaultSegs(innerCanvasPts.length);
        State.shapes.push({
            pts: innerCanvasPts,
            segs: innerSegs,
            lens: calcSegLens(innerCanvasPts, innerSegs),
            closed: true,
            noArea: true,
        });
    }

    State.sel = 0;
    State.dirty = true;
}

/* ── Wizard yuzasini to'g'ri hisoblash ── */
function wzGetArea() {
    if (WZ.customDraw) return calcA(); // Canvas'da chizilgan shakllar

    const sh = SHAPES.find(s => s.id === WZ.shape);
    if (!sh || sh.isCustom) return 0;
    sh.fields.forEach(f => { if (WZ.dims[f.key] == null) WZ.dims[f.key] = f.def; });

    if (sh.area) return sh.area(WZ.dims); // O-ramka maxsus yuza

    const raw = sh.pts(WZ.dims);
    return raw && raw.length >= 3 ? wzCalcArea(raw) : 0;
}

/* ── Murakkab chizma — canvas'ga o'tish ── */
function wzSwitchToCanvas() {
    document.getElementById('wz-wrap').style.display = 'none';
    document.getElementById('canvas-mode').style.display = 'flex';

    requestAnimationFrame(() => {
        initCv();
        redraw();
    });
    hap('impactMedium');
}

/* ── Canvas tutorial overlay ── */
/* ── Canvas tutorial — step-by-step ── */

const TUT_STEPS = [
    { msg: "Ekranga bosib birinchi nuqtani qo'ying", cursor: [70, 60] }, /*70*/
    { msg: "Ikkinchi nuqtani qo'ying — chiziq chiziladi", cursor: [230, 60] },
    { msg: "Uchinchi nuqta — shakl davom etadi", cursor: [230, 180] },
    { msg: "To'rtinchi nuqtani qo'ying", cursor: [70, 180] },
    { msg: "Birinchi nuqtaga bosing — shakl yopiladi", cursor: [70, 60] },
    { msg: "Egri chiziq kerak bo'lsa o'rta nuqtani tortib chiziqni egri qiling", cursor: [150, 28] },
];

let _tutStep = 0;

function showCanvasTut() {
    // Oldingi tutorialni tozalash
    const old = document.getElementById('cv-tut');
    if (old) old.remove();

    const tpl = document.getElementById('cv-tut-tpl');
    const wrap = document.getElementById('cwrap');
    if (!tpl || !wrap) return;

    const clone = tpl.content.cloneNode(true);
    wrap.appendChild(clone);

    _tutStep = 0;
    tutGoTo(0);
}

function tutGoTo(step) {
    _tutStep = step;
    const total = TUT_STEPS.length;
    const s = TUT_STEPS[step];
    if (!s) { closeTut(); return; }

    const root = document.getElementById('cv-tut');
    if (!root) return;

    // Elementlarni step bo'yicha ko'rsatish/yashirish
    root.querySelectorAll('.tut-el').forEach(el => {
        const elStep = parseInt(el.getAttribute('data-s'));
        if (elStep <= step + 1) {
            if (!el.classList.contains('vis')) el.classList.add('vis');
        } else {
            el.classList.remove('vis');
        }
    });

    // Kursor
    const cur = document.getElementById('tut-cursor');
    if (cur) {
        cur.classList.add('vis');
        cur.style.transform = 'translate(' + s.cursor[0] + 'px,' + s.cursor[1] + 'px)';
        cur.classList.remove('tap');
        void cur.offsetWidth;
        cur.style.setProperty('--pos', 'translate(' + s.cursor[0] + 'px,' + s.cursor[1] + 'px)');
        cur.classList.add('tap');
    }

    // Matn va counter
    const msg = document.getElementById('tut-msg');
    if (msg) msg.textContent = s.msg;
    const counter = document.getElementById('tut-counter');
    if (counter) counter.textContent = (step + 1) + ' / ' + total;

    // Orqaga tugma
    const prevBtn = document.getElementById('tut-prev-btn');
    if (prevBtn) prevBtn.style.display = step === 0 ? 'none' : '';

    // Keyingi tugma
    const btn = document.getElementById('tut-next-btn');
    if (btn) {
        if (step >= total - 1) {
            btn.innerHTML = 'Tayyor <svg width="16" height="16" viewBox="0 0 24 24" fill="none">' +
                '<path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        } else {
            btn.innerHTML = 'Keyingi <svg width="16" height="16" viewBox="0 0 24 24" fill="none">' +
                '<path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
    }
}

function tutNext() {
    if (_tutStep >= TUT_STEPS.length - 1) {
        closeTut();
    } else {
        tutGoTo(_tutStep + 1);
    }
}

function tutPrev() {
    if (_tutStep > 0) {
        tutGoTo(_tutStep - 1);
    }
}

function closeTut() {
    const el = document.getElementById('cv-tut');
    if (!el) return;

    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
}

/* ── Canvas'dan wizard'ga qaytish ── */
function wzBackFromCanvas() {
    document.getElementById('canvas-mode').style.display = 'none';
    document.getElementById('wz-wrap').style.display = 'flex';

    if (State.shapes.length > 0) {
        WZ.customDraw = true;
        wzGoTo(2); // Tom turini tanlashga o'tish
    } else {
        wzGoTo(0);
    }
}

/* ══════════════════════════════════════════════
   Hisoblash — sendCalc ni qayta ishlatish
   ══════════════════════════════════════════════ */
function wzCalculate() {
    wzSyncToState();
    const area = wzGetArea();

    const btn = document.querySelector('.wz-calc-btn');
    if (!btn) return;

    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="spin">' +
        '<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" ' +
        'stroke-dasharray="28" stroke-dashoffset="8" fill="none"/></svg> Hisoblanmoqda...';

    fetch(`${API_BASE}/roof/calculate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            area: area,
            country: cfg.country,
            thickness: cfg.thick,
            type: cfg.type,
            roof: cfg.roof,
            color: cfg.color
        })
    })
    .then(r => {
        if (!r.ok) throw new Error('Server xato');
        return r.json();
    })
    .then(data => {
        showResult(data);
        hap('notificationSuccess');
    })
    .catch(e => {
        console.warn('Hisoblash xato:', e.message);
        hap('notificationWarning');
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = origHTML;
    });
}

/* ── DOM render ── */
function wzRender() {
    // wzInit da chaqiriladi, DOM allaqachon HTML template'da
}