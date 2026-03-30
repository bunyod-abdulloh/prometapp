/* ══════════════════════════════════════════════
   app.js — Asosiy init, hammani birlashtirish
   ══════════════════════════════════════════════

   Yuklash tartibi (HTML'da):
   1. config.js    — konstantalar va state
   2. telegram.js  — Telegram WebApp
   3. utils.js     — matematik funksiyalar
   4. canvas.js    — canvas rendering
   5. shapes.js    — shakl boshqaruvi
   6. events.js    — event handler'lar
   7. calc.js      — narx hisoblash
   8. ui.js        — UI boshqaruvi
   9. theme.js     — dark/light mode
  10. app.js       — init (shu fayl)
*/

/* ── Sinxronizatsiya ── */
function sync() {
    render();
    upC();
    upH();
}

function redraw() {
    sync();
    updArea();
    if (State.dirty) {
        State.dirty = false;
        upD();
    }
}

/* ── Spin animatsiya (loading tugma uchun) ── */
function addSpinAnimation() {
    const style = document.createElement('style');
    style.textContent = '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}.spin{animation:spin .8s linear infinite}';
    document.head.appendChild(style);
}


/* ── Ilovani ishga tushirish ── */
window.addEventListener('load', () => {
    // Canvas elementlarni olish
    cv = document.getElementById('cv');
    cx = cv.getContext('2d');

    // Modullarni init
    initTelegram();
    initTheme();       // ← Dark/Light mode
    initCv();
    initPort();
    attachCanvasEvents();
    addSpinAnimation();

    // Boshlang'ich holatni ko'rsatish
    upH();
    upC();
    redraw();

    // Backend'dan ma'lumotlarni yuklash
    loadColors();
    loadCountries().then(() => loadCountryOptions(cfg.country));
});

/* ── Oyna o'lchami o'zgarganda canvas'ni qayta init qilish ── */
window.addEventListener('resize', () => {
    if (document.getElementById('pg-calc').classList.contains('on')) {
        initCv();
        redraw();
    }
});