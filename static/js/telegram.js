/* ══════════════════════════════════════════════
   telegram.js — Telegram WebApp integratsiyasi
   ══════════════════════════════════════════════ */

let tg = null;

function initTelegram() {
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            tg = window.Telegram.WebApp;
            tg.ready();
            if (tg.expand) tg.expand();
            if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();

            // Ranglar theme.js tomonidan boshqariladi (updateTelegramTheme)

            const cta = document.getElementById('hdr-cta');
            if (cta) cta.style.display = 'none';
        }
    } catch (e) {
        console.warn('Telegram WebApp mavjud emas:', e.message);
    }
}

function hap(type) {
    try {
        if (tg && tg.HapticFeedback) tg.HapticFeedback[type]?.();
    } catch (e) {}
}