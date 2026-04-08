/* ══════════════════════════════════════════════
   onboarding.js — Qadamma-qadam yo'riqnoma
   ══════════════════════════════════════════════ */

const OB = {
    active: false,
    flow: null,      // 'draw' yoki 'simple'
    step: 0,
    els: {},         // DOM elementlar cache
};

/* ── Qo'lda chizish uchun qadamlar ── */
const DRAW_STEPS = [
    {
        target: '.tg.tgm',
        title: 'Rejim tanlash',
        desc: '<b>Chizish</b> — yangi shakl chizish. <b>Tahrir</b> — mavjud shaklni o\'zgartirish.',
        arrow: 'bottom',
    },
    {
        target: '.tg:has(.tsh)',
        title: 'Tayyor shakllar',
        desc: 'To\'rtburchak, L-shakl yoki uchburchakni bir tugma bilan qo\'shing. O\'lchamini keyin o\'zgartirsa bo\'ladi.',
        arrow: 'bottom',
    },
    {
        target: '#cwrap',
        title: 'Chizma maydoni',
        desc: '1 barmoq bilan bosib nuqta qo\'ying, shakl hosil qiling. Oxirgi nuqtani birinchisiga yaqinlashtiring — shakl yopiladi.',
        arrow: 'top',
    },
    {
        target: '.cv-z',
        title: 'Zoom va boshqaruv',
        desc: '+/− tugmalari bilan kattalashtirish. 2 barmoq bilan suring va zoom qiling.',
        arrow: 'left',
    },
    {
        target: '[data-t="dims"]',
        title: 'O\'lchamlar paneli',
        desc: 'Bu yerda har bir tomon uzunligini metrda aniq kiritasiz.',
        arrow: 'top',
    },
    {
        target: '[data-t="roof"]',
        title: 'Tom sozlamalari',
        desc: 'Tom turini va qiyalik balandligini tanlang. Narxga ta\'sir qiladi.',
        arrow: 'top',
    },
    {
        target: '[data-t="prof"]',
        title: 'Profnastil tanlash',
        desc: 'Ishlab chiqaruvchi davlat, qalinlik va turini tanlang.',
        arrow: 'top',
    },
    {
        target: '#calcBtn',
        title: 'Narxni hisoblash',
        desc: 'Hammasi tayyor bo\'lgach — shu tugmani bosing. Natija avtomatik hisoblanadi.',
        arrow: 'top',
    },
];

/* ── Oddiy rejim uchun qadamlar (keyinchalik to'ldiriladi) ── */
const SIMPLE_STEPS = [
    {
        target: '.mode-sw',
        title: 'Rejim tanlash',
        desc: '<b>Oddiy</b> — shablon tanlash va o\'lcham kiritish. <b>Qo\'lda chizish</b> — murakkab shakllar uchun.',
        arrow: 'bottom',
    },
    {
        target: '#simple-shapes',
        title: 'Uy shaklini tanlang',
        desc: 'Uyingiz shakliga mos variantni bosing. Ko\'pchilik uylar to\'rtburchak yoki L-shaklda bo\'ladi.',
        arrow: 'bottom',
    },
    {
        target: '#simple-dims',
        title: 'O\'lchamlarni kiriting',
        desc: 'Eni va bo\'yini metrda kiriting. Chizma avtomatik yangilanadi.',
        arrow: 'top',
    },
    {
        target: '#simple-preview',
        title: 'Natijani tekshiring',
        desc: 'Kiritgan o\'lchamlaringiz asosida uy chizmasi shu yerda ko\'rinadi.',
        arrow: 'top',
    },
    {
        target: '[data-t="roof"]',
        title: 'Tom sozlamalari',
        desc: 'Tom turini tanlang — bir tomonli, ikki tomonli yoki do\'ppili.',
        arrow: 'top',
    },
    {
        target: '[data-t="prof"]',
        title: 'Profnastil tanlash',
        desc: 'Ishlab chiqaruvchi davlat, qalinlik va turini tanlang.',
        arrow: 'top',
    },
    {
        target: '#calcBtn',
        title: 'Narxni hisoblash',
        desc: 'Hammasi tayyor bo\'lgach — shu tugmani bosing!',
        arrow: 'top',
    },
];

/* ── DOM elementlarni yaratish ── */
function obInit() {
    // Overlay
    const ov = document.createElement('div');
    ov.className = 'ob-overlay';
    ov.addEventListener('click', obNext);
    document.body.appendChild(ov);

    // Tooltip
    const tip = document.createElement('div');
    tip.className = 'ob-tip';
    document.body.appendChild(tip);

    // Yordam tugmasi
    const help = document.createElement('button');
    help.className = 'ob-help';
    help.textContent = '?';
    help.title = 'Yo\'riqnoma';
    help.addEventListener('click', obShowWelcome);
    document.body.appendChild(help);

    // Welcome modal
    const wm = document.createElement('div');
    wm.className = 'ob-welcome';
    wm.innerHTML =
        '<div class="ob-welcome-card">' +
            '<div class="ob-welcome-icon">' +
                '<svg width="28" height="28" viewBox="0 0 24 24" fill="none">' +
                '<path d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
                '<path d="M9 21V12H15V21" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
                '</svg>' +
            '</div>' +
            '<h3>PROMET ga xush kelibsiz!</h3>' +
            '<p>Tom narxini hisoblash uchun avval uy chizmasini yarating. Qaysi usulni tanlaysiz?</p>' +
            '<div class="ob-welcome-btns">' +
                '<button class="ob-welcome-btn primary" onclick="obStartFlow(\'simple\')">Oddiy rejim yo\'riqnomasi</button>' +
                '<button class="ob-welcome-btn secondary" onclick="obStartFlow(\'draw\')">Qo\'lda chizish yo\'riqnomasi</button>' +
                '<button class="ob-welcome-btn ghost" onclick="obDismissWelcome()">O\'zim bilaman, o\'tkazib yuborish</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(wm);

    OB.els = { ov, tip, help, wm };

    // Birinchi marta kirgan foydalanuvchiga ko'rsatish
    if (!localStorage.getItem('promet-ob-done')) {
        setTimeout(obShowWelcome, 600);
    }
}

/* ── Welcome modal ── */
function obShowWelcome() {
    if (OB.active) obEnd();
    OB.els.wm.classList.add('vis');
    hap('impactLight');
}

function obDismissWelcome() {
    OB.els.wm.classList.remove('vis');
    localStorage.setItem('promet-ob-done', '1');
}

/* ── Flow boshlash ── */
function obStartFlow(flow) {
    OB.els.wm.classList.remove('vis');
    OB.flow = flow;
    OB.step = 0;
    OB.active = true;

    // Kalkulyator sahifasiga o'tish
    goP('calc');

    // Tegishli rejimga o'tish
    if (flow === 'simple') {
        setCalcMode('simple');
    } else {
        setCalcMode('draw');
        const calc = document.querySelector('.calc');
        if (calc && calc.classList.contains('collapsed')) togglePanel();
    }

    setTimeout(() => {
        OB.els.ov.classList.add('vis');
        obShowStep();
    }, 300);
}

/* ── Qadamni ko'rsatish ── */
function obShowStep() {
    const steps = OB.flow === 'draw' ? DRAW_STEPS : SIMPLE_STEPS;
    const s = steps[OB.step];
    if (!s) { obEnd(); return; }

    // Oldingi highlight'ni tozalash
    document.querySelectorAll('.ob-highlight').forEach(el => el.classList.remove('ob-highlight'));

    // Yangi elementni topish va highlight qilish
    const el = document.querySelector(s.target);
    if (!el) { OB.step++; obShowStep(); return; } // Element topilmasa keyingisiga o'tish

    el.classList.add('ob-highlight');

    // Agar panel tab bo'lsa, shu tabga o'tish
    if (s.target.startsWith('[data-t=')) {
        const tabName = el.dataset.t;
        if (tabName) rpTab(tabName);
    }

    // Tooltip pozitsiyasini hisoblash
    const tip = OB.els.tip;
    const rect = el.getBoundingClientRect();
    const totalSteps = steps.length;

    // Dots
    const dots = steps.map((_, i) =>
        '<div class="ob-dot' + (i === OB.step ? ' on' : '') + '"></div>'
    ).join('');

    tip.innerHTML =
        '<div class="ob-step">' + (OB.step + 1) + ' / ' + totalSteps + '</div>' +
        '<div class="ob-title">' + s.title + '</div>' +
        '<div class="ob-desc">' + s.desc + '</div>' +
        '<div class="ob-nav">' +
            '<div class="ob-dots">' + dots + '</div>' +
            '<div class="ob-btns">' +
                (OB.step > 0 ? '<button class="ob-btn ob-btn-prev" onclick="obPrev()">Orqaga</button>' : '') +
                (OB.step < totalSteps - 1
                    ? '<button class="ob-btn ob-btn-next" onclick="obNext()">Keyingi</button>'
                    : '<button class="ob-btn ob-btn-next" onclick="obEnd()">Tayyor!</button>') +
            '</div>' +
        '</div>' +
        '<button class="ob-btn ob-btn-skip" onclick="obEnd()" style="width:100%;text-align:center;margin-top:6px">O\'tkazib yuborish</button>';

    // Arrow yo'nalishi va pozitsiya
    tip.className = 'ob-tip vis arr-' + s.arrow;

    const tipW = 280, tipH = tip.offsetHeight || 180;
    let tx, ty;

    switch (s.arrow) {
        case 'top': // tooltip pastda, arrow tepada
            tx = Math.max(8, Math.min(rect.left, window.innerWidth - tipW - 8));
            ty = rect.bottom + 14;
            break;
        case 'bottom': // tooltip tepada, arrow pastda
            tx = Math.max(8, Math.min(rect.left, window.innerWidth - tipW - 8));
            ty = rect.top - tipH - 14;
            break;
        case 'left': // tooltip o'ngda, arrow chapda
            tx = rect.right + 14;
            ty = Math.max(8, rect.top);
            break;
        default:
            tx = rect.left;
            ty = rect.bottom + 14;
    }

    // Ekran chegarasidan chiqmasligi uchun
    ty = Math.max(8, Math.min(ty, window.innerHeight - tipH - 8));
    tx = Math.max(8, Math.min(tx, window.innerWidth - tipW - 8));

    tip.style.left = tx + 'px';
    tip.style.top = ty + 'px';

    hap('impactLight');
}

/* ── Navigatsiya ── */
function obNext() {
    const steps = OB.flow === 'draw' ? DRAW_STEPS : SIMPLE_STEPS;
    if (OB.step < steps.length - 1) {
        OB.step++;
        obShowStep();
    } else {
        obEnd();
    }
}

function obPrev() {
    if (OB.step > 0) {
        OB.step--;
        obShowStep();
    }
}

/* ── Tugatish ── */
function obEnd() {
    OB.active = false;
    OB.els.ov.classList.remove('vis');
    OB.els.tip.classList.remove('vis');
    document.querySelectorAll('.ob-highlight').forEach(el => el.classList.remove('ob-highlight'));
    localStorage.setItem('promet-ob-done', '1');
    hap('notificationSuccess');
}