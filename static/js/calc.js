/* ══════════════════════════════════════════════
   calc.js — Narx hisoblash va backend API
   ══════════════════════════════════════════════ */

/* ── Fallback ma'lumotlar (backend ishlamasa) ── */
const FALLBACK = {
    countries: [
        { slug: 'china', name: 'Xitoy' },
        { slug: 'samarkand', name: 'Samarqand' },
        { slug: 'tashkent', name: "Toshkent" },
        { slug: 'russia', name: 'Rossiya' }
    ],
    thicknesses: ['0.40', '0.45', '0.50'],
    types: ['matoviy', 'glyanseviy']
};

/* ══════════════════════════════════════════════
   Lokal hisoblash (backend'siz ham ishlaydi)
   ══════════════════════════════════════════════ */

function calcA() {
    let t = 0;
    State.shapes.forEach(sh => {
        if (!sh.closed) return;

        const va = sArea(sh) / (G * G);
        t += va; // 🔥 faqat real maydon
    });

    return t;
}

function calcCo(a) {
    return Math.round(a * (PRICES[cfg.country]?.[cfg.thick] || 60000) * (TMUL[cfg.type] || 1));
}

function upC() {
    const raEl = document.getElementById('ra');
    const rcEl = document.getElementById('rc');
    const rsEl = document.getElementById('rs');
    if (!raEl || !rcEl || !rsEl) return;

    const a = calcA(), c = calcCo(a);
    raEl.textContent = a.toFixed(2) + ' m²';
    rcEl.textContent = fmt(c) + " so'm";

    const cn = { china: 'Xitoy', russia: 'Rossiya', korea: 'Koreya', kazakhstan: "Qozog'iston" };
    rsEl.textContent = cfg.type + ' · ' + cfg.thick + 'mm · ' + (cn[cfg.country] || cfg.country);
}

/* ══════════════════════════════════════════════
   Umumiy pill tugma yaratish (DRY)
   ══════════════════════════════════════════════ */

function renderPillButtons(container, items, activeVal, onClick) {
    container.innerHTML = '';
    items.forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'pp' + (val === activeVal ? ' on' : '');
        btn.dataset.v = val;
        btn.textContent = val;
        btn.addEventListener('click', () => {
            container.querySelectorAll('.pp').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            onClick(val);
        });
        container.appendChild(btn);
    });
}

/* ══════════════════════════════════════════════
   Backend API
   ══════════════════════════════════════════════ */

/* ── 1. Davlatlar ro'yxatini yuklash ── */
async function loadCountries() {
    const cnEl = document.getElementById('pt-cn');
    if (!cnEl) return;

    cnEl.innerHTML = '<span class="pp-loading">Yuklanmoqda...</span>';

    let countries;
    try {
        const res = await fetch(`${API_BASE}/roof/countries/`);
        if (!res.ok) throw new Error('Server xato');
        countries = await res.json();
    } catch (e) {
        console.warn('Davlatlar: backend ulanmadi, lokal rejim:', e.message);
        countries = FALLBACK.countries;
    }

    // Tugmalarni yaratish (backend yoki fallback — farqi yo'q)
    cnEl.innerHTML = '';
    countries.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'pp' + (c.slug === cfg.country ? ' on' : '');
        btn.dataset.v = c.slug;
        btn.textContent = c.name;
        btn.addEventListener('click', () => {
            cnEl.querySelectorAll('.pp').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            cfg.country = c.slug;
            loadCountryOptions(cfg.country);
            hap('impactLight');
        });
        cnEl.appendChild(btn);
    });
}

/* ── 2. Davlat bo'yicha profnastil turlarini yuklash ── */
async function loadCountryOptions(countrySlug) {
    const tyEl = document.getElementById('pt-type');
    const thEl = document.getElementById('pt-th');
    if (!tyEl || !thEl) return;

    tyEl.innerHTML = '<span class="pp-loading">Yuklanmoqda...</span>';
    thEl.innerHTML = '<span class="pp-loading">Tur tanlang...</span>';

    let types;
    try {
        const res = await fetch(`${API_BASE}/roof/profnastil/${countrySlug}/`);
        if (!res.ok) throw new Error('Server xato');
        const data = await res.json();
        types = data.types;
    } catch (e) {
        console.warn('Turlar: backend ulanmadi:', e.message);
        types = FALLBACK.types;
    }

    if (!types.includes(cfg.type)) cfg.type = types[0];

    renderPillButtons(tyEl, types, cfg.type, val => {
        cfg.type = val;
        loadThicknesses(cfg.country, val);  // qalinliklarni yuklash
        hap('impactLight');
    });

    // Tanlangan tur uchun qalinliklarni yuklash
    loadThicknesses(countrySlug, cfg.type);
}

/* ── 3. Davlat + Tur bo'yicha qalinliklarni yuklash ── */
async function loadThicknesses(countrySlug, profType) {
    const thEl = document.getElementById('pt-th');
    if (!thEl) return;

    thEl.innerHTML = '<span class="pp-loading">Yuklanmoqda...</span>';

    let thicknesses;
    try {
        const res = await fetch(`${API_BASE}/roof/profnastil/${countrySlug}/?type=${profType}`);
        if (!res.ok) throw new Error('Server xato');
        const data = await res.json();
        thicknesses = data.thicknesses; // [{value, price}, ...]
    } catch (e) {
        console.warn('Qalinliklar: backend ulanmadi:', e.message);
        thicknesses = FALLBACK.thicknesses.map(v => ({ value: v, price: 0 }));
    }

    // cfg.thick mavjudligini tekshirish
    const values = thicknesses.map(t => t.value);
    if (!values.includes(cfg.thick)) cfg.thick = values[0];

    // Tanlangan qalinlik narxini saqlash
    const selected = thicknesses.find(t => t.value === cfg.thick);
    cfg.profPrice = selected?.price || 0;

    // Pill buttonlarni renderPillButtons o'rniga maxsus yasaymiz
    thEl.innerHTML = '';
    thicknesses.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'th-row' + (t.value === cfg.thick ? ' on' : '');
        btn.dataset.v = t.value;
        btn.innerHTML =
            `<span class="th-val">${t.value} mm</span>` +
            `<span class="th-price">${fmt(t.price)} so'm/m²</span>`;
        btn.addEventListener('click', () => {
            thEl.querySelectorAll('.th-row').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            cfg.thick = t.value;
            cfg.profPrice = t.price;
            upC();
            hap('impactLight');
        });
        thEl.appendChild(btn);
    });

    upC();
}


async function loadColors() {
    const grid = document.getElementById('prod-grid');
    if (!grid) return;

    const res = await fetch(`${API_BASE}/roof/colors/`);
    const colors = await res.json();

    grid.innerHTML = '';
    colors.forEach((c, idx) => {
        const div = document.createElement('div');
        div.className = 'prod-card' + (idx === 0 ? ' on' : '');
        div.dataset.idx = idx;
        div.dataset.slug = c.slug;
        div.onclick = () => pickProd(idx);
        div.innerHTML = `<img src="${c.image}" alt="${c.name}"><span>${c.name}</span>`;
        grid.appendChild(div);
    });

    // Birinchi rangni default qilish
    if (colors.length) cfg.color = colors[0].slug;
}


/* ── 4. "Hisoblash" tugmasi ── */
async function sendCalc() {
    const btn = document.getElementById('calcBtn');
    if (!btn) return;

    btn.disabled = true;
    btn.classList.add('loading');
    const originalHTML = btn.innerHTML;
    btn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="spin">' +
        '<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" ' +
        'stroke-dasharray="28" stroke-dashoffset="8" fill="none"/>' +
        '</svg> Hisoblanmoqda...';

    try {
        const res = await fetch(`${API_BASE}/roof/calculate/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                area: calcA(),
                country: cfg.country,
                thickness: cfg.thick,
                type: cfg.type,
                roof: cfg.roof,
                color: cfg.color
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Server xato');
        }

        const data = await res.json();
        showResult(data);
        hap('notificationSuccess');
    } catch (e) {
        console.warn('Hisoblash: backend ulanmadi, lokal:', e.message);
        upC();
        hap('notificationWarning');
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.innerHTML = originalHTML;
    }
}

/* ── Natija modalni ochish ── */
function showResult(data) {
    // Subtitle: tom turi + profnastil ma'lumotlari
    const roofNames = { shed: 'Bir tomonli', gable: 'Ikki tomonli', doppili: "Do'ppili" };
    const sub = (roofNames[data.roof_type] || data.roof_type)
        + ' · ' + data.type + ' · ' + data.thickness + 'mm'
        + ' · ' + data.roof_area.toFixed(1) + ' m²';

    const total = data.total_price;

    // DOM elementlarni yangilash
    const $ = id => document.getElementById(id);
    $('rm-sub').textContent = sub;
    $('rm-total').innerHTML = fmt(total) + " <small>so'm</small>";
    $('rm-covering').textContent = fmt(data.roof_covering) + " so'm";
    $('rm-structure').textContent = fmt(data.structure) + " so'm";
    $('rm-helpers').textContent = fmt(data.helpers) + " so'm";
    $('rm-labor').textContent = fmt(data.labor_price) + " so'm";

    // Result bar ni ham yangilash
    const raEl = $('ra');
    if (raEl) raEl.textContent = data.roof_area.toFixed(2) + ' m²';

    // Modalni ko'rsatish
    $('rm-overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

/* ── Natija modalni yopish ── */
function closeResult(e) {
    // Agar overlay bosilgan bo'lsa (modal emas) yoki button bosilgan bo'lsa
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('rm-overlay').classList.remove('show');
    document.body.style.overflow = '';
}