/* ══════════════════════════════════════════════
   events.js — Canvas event handler'lar
   ══════════════════════════════════════════════ */

/* ── Drag logikasi ── */
function handleDrag(wx, wy) {
    const drg = State.drg;
    if (!drg) return;

    if (drg.t === 'arc') {
        const sh = State.shapes[drg.si], i = drg.seg;
        const j = (i + 1) % sh.pts.length;
        const b = pOff(sh.pts[i].x, sh.pts[i].y, sh.pts[j].x, sh.pts[j].y, wx, wy);
        const ch = Math.hypot(sh.pts[j].x - sh.pts[i].x, sh.pts[j].y - sh.pts[i].y);
        const cl = clamp(b, -ch * 0.75, ch * 0.75);
        sh.segs[i] = Math.abs(cl) < 6
            ? { type: 'line', bulge: 0 }
            : { type: 'arc', bulge: cl };
        sh.lens[i] = parseFloat((aLen(
            sh.pts[i].x, sh.pts[i].y, sh.pts[j].x, sh.pts[j].y, sh.segs[i].bulge || 0
        ) / G).toFixed(2));
        sync(); return;
    }

    if (drg.t === 'pt') {
        const sh = State.shapes[drg.si];
        const x = State.snap ? Math.round(wx / G) * G : wx;
        const y = State.snap ? Math.round(wy / G) * G : wy;
        sh.pts[drg.pi] = { x, y };
        const n = sh.pts.length;
        for (const idx of [drg.pi, (drg.pi - 1 + n) % n]) {
            const j = (idx + 1) % n;
            sh.lens[idx] = parseFloat((aLen(
                sh.pts[idx].x, sh.pts[idx].y, sh.pts[j].x, sh.pts[j].y, sh.segs[idx].bulge || 0
            ) / G).toFixed(2));
        }
        sync(); return;
    }

    if (drg.t === 'sh') {
        const sh = State.shapes[drg.si];
        let dx = wx - drg.sx, dy = wy - drg.sy;
        if (State.snap) { dx = Math.round(dx / G) * G; dy = Math.round(dy / G) * G; }
        for (let i = 0; i < sh.pts.length; i++) {
            sh.pts[i].x = drg.orig[i].x + dx;
            sh.pts[i].y = drg.orig[i].y + dy;
        }
        sync();
    }
}

/* ── Pinch zoom holati ── */
function handlePinch(ps) {
    const d = pD(ps[0], ps[1]), m = pM(ps[0], ps[1]);
    const f = d / pinch.d0;
    const ns = clamp(pinch.s0 * f, V.mn, V.mx);
    const r = ns / pinch.s0;
    V.tx = pinch.m0.x - r * (pinch.m0.x - pinch.tx0) + (m.x - pinch.m0.x);
    V.ty = pinch.m0.y - r * (pinch.m0.y - pinch.ty0) + (m.y - pinch.m0.y);
    V.s = ns;
    render();
}

/* ── Event'larni ulash ── */
function attachCanvasEvents() {
    // Wheel zoom
    cv.addEventListener('wheel', e => {
        e.preventDefault();
        const sp = csp(e);
        zoomAt(e.deltaY < 0 ? 1.14 : 1 / 1.14, sp.x, sp.y);
    }, { passive: false });

    // Touch default'ni bloklash (mobile chizish uchun)
    cv.addEventListener('touchstart',  e => { e.preventDefault(); }, { passive: false });
    cv.addEventListener('touchmove',   e => { e.preventDefault(); }, { passive: false });
    cv.addEventListener('touchend',    e => { e.preventDefault(); }, { passive: false });
    cv.addEventListener('contextmenu', e => { e.preventDefault(); });

    // Pointer down
    cv.addEventListener('pointerdown', e => {
        e.preventDefault();
        try { cv.setPointerCapture(e.pointerId); } catch (x) {}
        const sp = csp(e);
        ptrs.set(e.pointerId, sp);

        // 2 barmaq = pinch zoom
        if (ptrs.size >= 2) {
            State.drg = null;
            const ps = [...ptrs.values()];
            pinch = { d0: pD(ps[0], ps[1]), s0: V.s, tx0: V.tx, ty0: V.ty, m0: pM(ps[0], ps[1]) };
            return;
        }
        pinch = null;
        const w = s2w(sp.x, sp.y);

        if (State.mode === 'edit') {
            // Arc handle bosildimi?
            if (State.sel != null) {
                const sh = State.shapes[State.sel];
                for (let i = 0; i < sh.pts.length; i++) {
                    const j = (i + 1) % sh.pts.length;
                    const b = sh.segs[i].bulge || 0;
                    const hp = hPos(sh.pts[i].x, sh.pts[i].y, sh.pts[j].x, sh.pts[j].y, b);
                    if (Math.hypot(hp.x - w.x, hp.y - w.y) < ahr()) {
                        State.drg = { t: 'arc', si: State.sel, seg: i };
                        cv.style.cursor = 'grabbing'; return;
                    }
                }
                // Nuqta bosildimi?
                for (let i = 0; i < sh.pts.length; i++) {
                    if (Math.hypot(sh.pts[i].x - w.x, sh.pts[i].y - w.y) < phr()) {
                        State.drg = { t: 'pt', si: State.sel, pi: i };
                        cv.style.cursor = 'grabbing'; return;
                    }
                }
            }
            // Shakl tanlandimi?
            const hit = topAt(w.x, w.y);
            if (hit != null) {
                State.sel = hit; State.dirty = true; upD(); render();
                State.drg = {
                    t: 'sh', si: hit, sx: w.x, sy: w.y,
                    orig: State.shapes[hit].pts.map(p => ({ x: p.x, y: p.y }))
                };
                cv.style.cursor = 'grabbing';
                hap('impactLight'); return;
            }
            State.sel = null; State.dirty = true; redraw();
            return;
        }

        // Draw mode: yangi nuqta qo'shish
        if (State.mode === 'draw') {
            if (!State.cur) State.cur = { pts: [], segs: [], lens: [], closed: false };
            const wx = State.snap ? Math.round(w.x / G) * G : w.x;
            const wy = State.snap ? Math.round(w.y / G) * G : w.y;

            // Birinchi nuqtaga yaqin → yopish
            if (State.cur.pts.length > 2 &&
                Math.hypot(State.cur.pts[0].x - wx, State.cur.pts[0].y - wy) < cdw()) {
                closeSh(); return;
            }
            State.cur.pts.push({ x: wx, y: wy });
            State.cur.segs.push({ type: 'line', bulge: 0 });
            State.cur.lens.push(null);
            upH(); render();
            hap('impactLight');
        }
    });

    // Pointer move
    cv.addEventListener('pointermove', e => {
        const sp = csp(e);
        if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, sp);

        // Pinch zoom
        if (ptrs.size === 2 && pinch) {
            handlePinch([...ptrs.values()]);
            return;
        }

        const w = s2w(sp.x, sp.y);
        State.ms = {
            x: State.snap && State.mode === 'draw' ? Math.round(w.x / G) * G : w.x,
            y: State.snap && State.mode === 'draw' ? Math.round(w.y / G) * G : w.y
        };

        if (State.drg) { handleDrag(w.x, w.y); return; }

        // Edit mode hover
        if (State.mode === 'edit') {
            State.hovA = null; State.hovP = null;
            if (State.sel != null) {
                const sh = State.shapes[State.sel];
                for (let i = 0; i < sh.pts.length; i++) {
                    const j = (i + 1) % sh.pts.length;
                    const b = sh.segs[i].bulge || 0;
                    const hp = hPos(sh.pts[i].x, sh.pts[i].y, sh.pts[j].x, sh.pts[j].y, b);
                    if (Math.hypot(hp.x - w.x, hp.y - w.y) < ahr()) {
                        State.hovA = { si: State.sel, seg: i };
                        cv.style.cursor = 'grab'; render(); return;
                    }
                }
                for (let i = 0; i < sh.pts.length; i++) {
                    if (Math.hypot(sh.pts[i].x - w.x, sh.pts[i].y - w.y) < phr()) {
                        State.hovP = { si: State.sel, pi: i };
                        cv.style.cursor = 'move'; render(); return;
                    }
                }
                if (ptIn(w.x, w.y, sh)) { cv.style.cursor = 'grab'; render(); return; }
            }
            cv.style.cursor = 'default';
        }
        render();
    });

    // Pointer up/cancel
    function pointerUp(e) {
        ptrs.delete(e.pointerId);
        if (ptrs.size < 2) pinch = null;
        if (ptrs.size === 0 && State.drg) {
            State.drg = null;
            cv.style.cursor = State.mode === 'draw' ? 'crosshair' : 'default';
            State.dirty = true; redraw();
        }
    }
    cv.addEventListener('pointerup', pointerUp);
    cv.addEventListener('pointercancel', pointerUp);
}