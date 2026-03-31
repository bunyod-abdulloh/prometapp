/* ══════════════════════════════════════════════
   config.js — Konstantalar, narxlar, global state
   ══════════════════════════════════════════════ */

const G = 40, CD = 18, HR = 9;
const ALP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SC = ['#22c55e', '#3b82f6', '#a78bfa', '#f59e0b', '#ef4444', '#22d3ee'];
const API_BASE = 'https://pro-met.uz/api';

// RAL ranglar
const RAL = [
    { c: '1014', n: "Sarg'ish",       h: '#E1CC4F' },
    { c: '1015', n: "Och sarg'ish",    h: '#E6D690' },
    { c: '2004', n: "To'q sariq",      h: '#E75B12' },
    { c: '3003', n: 'Yoqut qizil',     h: '#8D1D2C' },
    { c: '3005', n: "Qizil-to'q",      h: '#5E2028' },
    { c: '3009', n: 'Oksid qizil',     h: '#6D342D' },
    { c: '3011', n: 'Qizil-jigarrang', h: '#792423' },
    { c: '5002', n: "Ko'k",            h: '#00387B' },
    { c: '5005', n: "Signal ko'k",     h: '#154889' },
    { c: '5021', n: "Suv ko'k",        h: '#07737A' },
    { c: '6002', n: 'Yashil',          h: '#325928' },
    { c: '6005', n: "Yashil-to'q",     h: '#0F4336' },
    { c: '6020', n: 'Xrom yashil',     h: '#37422F' },
    { c: '7004', n: 'Kulrang',         h: '#9EA0A1' },
    { c: '7024', n: 'Grafit',          h: '#474A50' },
    { c: '7035', n: 'Och kulrang',     h: '#CBD0CC' },
    { c: '8004', n: 'Mis jigarrang',   h: '#8D4931' },
    { c: '8017', n: 'Shokolad',        h: '#44322D' },
    { c: '9002', n: 'Oq-kulrang',      h: '#E0DDD4' },
    { c: '9003', n: 'Signal oq',       h: '#F4F4F4' },
    { c: '9005', n: 'Qora',            h: '#0A0A0D' },
    { c: '9006', n: 'Oq alyuminiy',    h: '#A5A8A6' }
];

// Portfolio loyihalar
const PROJ = [
    { t: 'Chorsu turar-joy',        d: '4 qavatli binosiga HC-35 profnastil bilan tom yopildi.', a: '1 200 m²', tp: 'HC-35', cl: '#5E2028', y: '2024' },
    { t: 'Toshkent 32-maktab',      d: 'Maktab binosiga yangi tom yopish ishlari.',              a: '2 400 m²', tp: 'H-60',  cl: '#154889', y: '2024' },
    { t: 'Chilonzor savdo markazi',  d: 'Mansard tipidagi tom loyihasi bajarildi.',                a: '3 200 m²', tp: 'H-75',  cl: '#474A50', y: '2023' },
    { t: 'Samarqand mehmonxonasi',   d: '5 yulduzli mehmonxona uchun premium tom.',               a: '1 800 m²', tp: 'HC-44', cl: '#44322D', y: '2023' },
    { t: "Farg'ona sanoat binosi",   d: 'Ishlab chiqarish sehi uchun tom yopish.',                a: '5 600 m²', tp: 'H-75',  cl: '#9EA0A1', y: '2023' },
    { t: 'Namangan turar-joy',       d: '120 xonadonlik yangi turar-joy majmuasi.',               a: '4 200 m²', tp: 'C-21',  cl: '#325928', y: '2022' }
];

// Tanlangan konfiguratsiya
const cfg = { roof: 'gable', type: 'glyanseviy', thick: '0.40', profPrice: '0', country: 'china', color: 'red' };

// Viewport holati
const V = { s: 1, tx: 0, ty: 0, mn: 0.07, mx: 14 };

/* ── O'zgaruvchan global state ── */
const State = {
    shapes: [],
    cur: null,       // hozir chizilayotgan shakl
    mode: 'draw',
    snap: true,
    sel: null,       // tanlangan shakl indexi
    hovA: null,      // hover arc handle
    hovP: null,      // hover point
    drg: null,       // drag holati
    ms: { x: 0, y: 0 },
    dirty: true
};

const ptrs = new Map();
let pinch = null;

// Canvas elementlari (app.js da init bo'ladi)
let cv = null, cx = null;