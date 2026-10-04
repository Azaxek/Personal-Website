// Interaction layer for everything below the 3D hero: cursor, hover/scramble/word-glow, scroll
// reveals, tilt + spotlight cards, magnetic buttons, a draggable carousel (mouse, touch and
// two-finger trackpad), a soft click ping and a cursor-reactive particle backdrop. Motion is GSAP
// (+ its SplitText/ScrambleText/Draggable/Inertia/Observer plugins); vanilla-tilt and tsParticles
// cover the rest.
// Everything is gated on prefers-reduced-motion, and the pointer-only bits on a real mouse.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { Observer } from 'gsap/Observer'
import VanillaTilt from 'vanilla-tilt'
import { lenis } from './smooth.js'
import { photos as photoData } from './data.js'

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Draggable, InertiaPlugin, Observer)

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
const mk = (tag, cls) => { const e = document.createElement(tag); e.className = cls; return e }
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const GLYPHS = '01{}<>/\\_$#%&*'
const COLORS = ['#5dffb0', '#5ad4ff', '#ff6bd6', '#ffd166']

// The cursor and the click ping live in one popover, i.e. the browser's top layer: carousel cards (which slide and
// tilt, so the browser draws them as separate GPU layers) can never paint over them. A popover opened later sits
// above one opened earlier, so bringFxToFront() re-opens this one after the photo viewer / preview appear.
const topLayer = typeof HTMLElement.prototype.showPopover === 'function'
let fxLayer = null
function fxRoot()
{
    if(fxLayer) return fxLayer
    fxLayer = mk('div', 'fx-layer')
    if(topLayer) fxLayer.setAttribute('popover', 'manual')
    document.body.appendChild(fxLayer)
    if(topLayer) fxLayer.showPopover()
    return fxLayer
}
export function bringFxToFront()
{
    if(!fxLayer || !topLayer || !fxLayer.matches(':popover-open')) return
    fxLayer.hidePopover()
    fxLayer.showPopover()
}

// ---------- cursor: dot + lagging ring that morphs over links / the carousel / photos ----------

// over anything that isn't a link, the ring still answers — a small, faint swell
const SOFT = '.entry, .card, .skill-group, .stat, .prompt, .boot .out, .ticker, .legend, .photo-list li, .photo-page img'

function initCursor()
{
    if(!fine || reduced) return
    const ring = mk('div', 'cursor-ring'), dot = mk('div', 'cursor-dot'), label = mk('span', 'cursor-label')
    ring.appendChild(label)
    fxRoot().append(ring, dot)
    document.body.classList.add('has-cursor')
    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, autoAlpha: 0 })
    const rx = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3' })
    const dx = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' })
    let seen = false
    window.addEventListener('pointermove', (e) => {
        if(e.pointerType !== 'mouse') return
        if(!seen) { seen = true; gsap.set([ring, dot], { x: e.clientX, y: e.clientY }); gsap.to([ring, dot], { autoAlpha: 1, duration: 0.3 }) }
        rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY)
    })
    document.documentElement.addEventListener('pointerleave', () => gsap.to([ring, dot], { autoAlpha: 0, duration: 0.2 }))
    document.documentElement.addEventListener('pointerenter', () => { if(seen) gsap.to([ring, dot], { autoAlpha: 1, duration: 0.2 }) })
    window.addEventListener('pointerover', (e) => {
        const t = e.target.closest?.('[data-cursor], a, button')
        const kind = t ? t.dataset.cursor || 'link' : e.target.closest?.(SOFT) ? 'soft' : ''
        ring.dataset.state = kind
        label.textContent = kind === 'drag' || kind === 'view' ? kind : ''
    })
    window.addEventListener('pointerdown', () => gsap.to(ring, { scale: 0.75, duration: 0.15 }))
    window.addEventListener('pointerup', () => gsap.to(ring, { scale: 1, duration: 0.45, ease: 'back.out(3)' }))
}

// ---------- header: smooth anchor scroll, active section, progress bar ----------

function initNav()
{
    $$('#top nav a[href^="#"], #foot nav a[href^="#"]').forEach((a) => {
        const sec = $(a.getAttribute('href'))
        if(!sec) return
        a.addEventListener('click', (e) => {
            e.preventDefault()
            if(lenis) lenis.scrollTo(sec, { offset: -64, duration: 2, easing: (t) => 1 - Math.pow(1 - t, 4) })
            else sec.scrollIntoView()
        })
        ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => a.classList.toggle('active', s.isActive) })
    })
}

function initProgress()
{
    const bar = mk('div', '')
    bar.id = 'progress'
    document.body.appendChild(bar)
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } })
}

// ---------- text: scramble on hover, word-glow trail, decode prompts on scroll ----------

// Only the short labels (nav, brand, contact buttons) re-type on hover, quickly and with plain letters —
// body text and headings stay still so reading isn't distracting.
function initScramble()
{
    if(reduced) return
    $$('#top nav a, #top .brand, .links-row a').forEach((t) => {
        if(t.children.length) return
        const text = t.textContent
        t.addEventListener('pointerenter', () => gsap.to(t, { duration: 0.35, ease: 'none', overwrite: true, scrambleText: { text, chars: 'lowerCase', speed: 1.2, revealDelay: 0.03 } }))
    })
}

// Each word lights up as the cursor passes and fades back slowly, leaving a glowing trail (CSS .w).
function initTextHover()
{
    if(!fine || reduced) return
    $$('.entry .tagline, .entry p.body, .entry li, .entry .note, .boot .out, .quote-entry blockquote').forEach((t) => SplitText.create(t, { type: 'words', wordsClass: 'w' }))
}

// ---------- scroll: sections rise in, prompts "decode", numbers count up ----------

function initReveal()
{
    if(reduced) {
        $$('b[data-count]').forEach((b) => { b.textContent = (+b.dataset.count).toLocaleString('en-US') + b.textContent.replace(/[\d,]/g, '') })
        return
    }
    const sel = '.boot .out, .stats, .links-row, .seen-in, .entry, .card, .skill-group, .quote-entry, .ticker'
    gsap.set(sel, { autoAlpha: 0, y: 28 })
    ScrollTrigger.batch(sel, {
        start: 'top 90%', once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
    })
    $$('.prompt:not(.cursor) .cmd').forEach((cmd) => {
        const text = cmd.textContent
        cmd.textContent = ''
        ScrollTrigger.create({
            trigger: cmd, start: 'top 92%', once: true,
            onEnter: () => gsap.to(cmd, { duration: Math.min(1.4, 0.35 + text.length * 0.05), ease: 'none', scrambleText: { text, chars: GLYPHS, speed: 0.6, revealDelay: 0.1 } }),
        })
    })
    $$('b[data-count]').forEach((b) => {
        const to = +b.dataset.count, suf = b.textContent.replace(/[\d,]/g, ''), o = { v: 0 }
        ScrollTrigger.create({
            trigger: b, start: 'top 92%', once: true,
            onEnter: () => gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { b.textContent = Math.round(o.v).toLocaleString('en-US') + suf } }),
        })
    })
}

// ---------- cards: 3D tilt + glare, pointer-following spotlight, magnetic buttons ----------

function initHoverCards()
{
    if(!fine || reduced) return
    VanillaTilt.init($$('.card'), { max: 3, speed: 700, glare: true, 'max-glare': 0.08, scale: 1, perspective: 1200 }) // a gentle lean, no scale-up
    VanillaTilt.init($$('.stat'), { max: 4, speed: 700, scale: 1, perspective: 900 })
    $$('.entry, .card, .skill-group').forEach((e) => e.addEventListener('pointermove', (ev) => {
        const r = e.getBoundingClientRect()
        e.style.setProperty('--mx', `${ev.clientX - r.left}px`)
        e.style.setProperty('--my', `${ev.clientY - r.top}px`)
    }))
    $$('.links-row a, .carousel-controls button').forEach((m) => {
        const x = gsap.quickTo(m, 'x', { duration: 0.5, ease: 'power3.out' }), y = gsap.quickTo(m, 'y', { duration: 0.5, ease: 'power3.out' })
        m.addEventListener('pointermove', (e) => {
            const r = m.getBoundingClientRect()
            x((e.clientX - (r.left + r.width / 2)) * 0.15)
            y((e.clientY - (r.top + r.height / 2)) * 0.15)
        })
        m.addEventListener('pointerleave', () => { x(0); y(0) })
    })
}

// ---------- carousel: drag / swipe with inertia, snapping to cards; arrows still work ----------

function initCarousels()
{
    $$('.carousel-wrap').forEach((wrap) => {
        const view = $('.carousel', wrap), track = $('.track', wrap)
        const cards = [...track.children]
        let snaps = [0]
        const measure = () => {
            const max = Math.max(0, track.offsetWidth - view.clientWidth)
            const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0
            snaps = [...new Set(cards.map((c) => -Math.min(max, Math.max(0, c.offsetLeft - pad))))]
            return max
        }
        const nearest = (v) => snaps.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a))
        let maxX = measure()
        let resting = 0, ourSlide = false // ourSlide: one of our own settle/arrow slides is running, heading for 'resting' (so a quick second swipe builds on that, not on a half-finished slide)
        const drag = Draggable.create(track, {
            type: 'x', bounds: view, inertia: true, edgeResistance: 0.85, cursor: 'inherit', activeCursor: 'inherit',
            snap: { x: nearest },
            onPress() { ourSlide = false },
            onDragStart() { wrap.dataset.moved = '1' }, // lets click handlers ignore the click that ends a drag
            onRelease() { setTimeout(() => { delete wrap.dataset.moved }, 80) },
        })[0]
        const go = (dir) => {
            const x = gsap.getProperty(track, 'x')
            const next = dir > 0 ? snaps.find((s) => s < x - 4) : [...snaps].reverse().find((s) => s > x + 4)
            if(next == null) return
            resting = next; ourSlide = true
            gsap.to(track, { x: next, duration: 0.8, ease: 'power3.out', overwrite: true, onUpdate: () => drag.update(), onComplete: () => { ourSlide = false } })
        }
        $('.prev', wrap).addEventListener('click', () => go(-1))
        $('.next', wrap).addEventListener('click', () => go(1))

        // Two-finger swipe on a trackpad (or shift + wheel): sideways wheel movement drags the track along with
        // the fingers, then it settles on a card. Mostly-vertical gestures still scroll the page.
        //  - the axis is decided from the first moments of the gesture (trackpad swipes drift diagonally), not one noisy event
        //  - Firefox reports lines / pages instead of pixels, so deltas are normalised
        //  - a light flick still moves one card in the swipe's direction, instead of springing back to where it started
        let swipeFrom = 0, swipeBase = 0, swiping = false, sx = 0, sy = 0, settle = 0, reset = 0
        wrap.addEventListener('wheel', (e) => {
            if(!maxX) return
            const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? view.clientWidth : 1
            const dx = e.deltaX * unit, dy = e.deltaY * unit
            if(!swiping) {
                sx += dx; sy += dy
                clearTimeout(reset); reset = setTimeout(() => { sx = sy = 0 }, 200)
                if(Math.abs(sx) < 3 || Math.abs(sx) <= Math.abs(sy) * 1.15) return // mostly vertical: the page scrolls
                swiping = true
                swipeFrom = gsap.getProperty(track, 'x')
                swipeBase = ourSlide ? resting : swipeFrom // a slide may still be running: build on where it was heading
                ourSlide = false
                gsap.killTweensOf(track) // the new swipe takes over, so the old slide can't fight it
            }
            e.preventDefault() // also stops the browser treating a sideways swipe as back/forward
            gsap.set(track, { x: gsap.utils.clamp(-maxX, 0, gsap.getProperty(track, 'x') - dx) })
            drag.update()
            clearTimeout(settle)
            settle = setTimeout(() => {
                const x = gsap.getProperty(track, 'x'), moved = x - swipeFrom
                let target = nearest(swipeBase + moved)
                if(target === nearest(swipeBase) && Math.abs(moved) > 30) {
                    target = moved < 0 ? (snaps.find((s) => s < swipeBase - 4) ?? target) : ([...snaps].reverse().find((s) => s > swipeBase + 4) ?? target)
                }
                swiping = false; sx = sy = 0
                resting = target; ourSlide = true
                gsap.to(track, { x: target, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: () => drag.update(), onComplete: () => { ourSlide = false } })
            }, 140)
        }, { passive: false })

        window.addEventListener('resize', () => {
            maxX = measure()
            drag.applyBounds(view)
            gsap.set(track, { x: nearest(gsap.getProperty(track, 'x')) })
            drag.update()
            maxX ? drag.enable() : drag.disable()
        })
    })
}

// Swipe left/right on any element (touch or mouse drag). Returns a kill function.
export function onSwipe(target, { left, right })
{
    const o = Observer.create({ target, type: 'touch,pointer', tolerance: 50, dragMinimum: 6, onLeft: left, onRight: right })
    return () => o.kill()
}

// ---------- photos: hover a blue photo word and its picture pops up beside it (click enlarges, in main.js) ----------

function initPhotoPeek()
{
    if(!fine) return // touch has no hover — a tap opens the viewer instead
    const peek = mk('div', 'photo-peek')
    peek.innerHTML = '<img alt=""><div class="cap"><b></b><span></span></div>'
    // As a popover it lives in the browser's top layer, so a tilted or sliding carousel card can't paint over it.
    if(topLayer) peek.setAttribute('popover', 'manual')
    document.body.appendChild(peek)
    const img = $('img', peek), title = $('b', peek), cap = $('span', peek)
    const MAX_W = 280, MAX_H = 300
    let current = null, hideTimer = 0, closeTimer = 0

    // Fetch each photo's file as its word scrolls near the screen, so the preview is instant when hovered.
    const warm = new IntersectionObserver((hits) => hits.forEach((h) => {
        if(!h.isIntersecting) return
        const p = photoData[h.target.dataset.photo]
        if(p) new Image().src = p.src
        warm.unobserve(h.target)
    }), { rootMargin: '500px' })
    $$('a.photo-link').forEach((a) => warm.observe(a))

    // fade out, then (only if it hasn't been re-opened meanwhile) take it out of the top layer
    const conceal = () => {
        peek.classList.remove('open'); current = null
        if(!topLayer) return
        clearTimeout(closeTimer)
        closeTimer = setTimeout(() => { if(!peek.classList.contains('open') && peek.matches(':popover-open')) peek.hidePopover() }, 220)
    }
    const hide = () => { clearTimeout(hideTimer); hideTimer = setTimeout(conceal, 70) }

    function show(a, x, y)
    {
        const p = photoData[a.dataset.photo]
        if(!p) return
        clearTimeout(hideTimer); clearTimeout(closeTimer)
        if(topLayer && !peek.matches(':popover-open')) { peek.showPopover(); bringFxToFront() }
        current = a
        const s = Math.min(MAX_W / p.w, MAX_H / p.h, 1) // the box gets its final size before the file arrives
        img.style.width = `${Math.round(p.w * s)}px`
        img.style.height = `${Math.round(p.h * s)}px`
        img.classList.remove('on')
        img.onload = () => img.classList.add('on')
        img.src = p.src
        if(img.complete && img.naturalWidth) img.classList.add('on')
        title.textContent = p.title
        cap.textContent = p.caption

        // Sit above the line of text the pointer is on (a link can wrap across lines), or below if there's no room.
        const rects = [...a.getClientRects()]
        const r = rects.find((q) => y >= q.top - 2 && y <= q.bottom + 2 && x >= q.left - 2 && x <= q.right + 2) || rects[0]
        const w = peek.offsetWidth, h = peek.offsetHeight
        const left = gsap.utils.clamp(10, window.innerWidth - w - 10, r.left + r.width / 2 - w / 2)
        const above = r.top - h - 12
        peek.style.left = `${left}px`
        peek.style.top = `${above >= 10 ? above : Math.min(window.innerHeight - h - 10, r.bottom + 12)}px`
        peek.classList.add('open')
    }

    document.addEventListener('mouseover', (e) => {
        const a = e.target.closest?.('a.photo-link')
        if(!a) return
        if(a === current) clearTimeout(hideTimer) // moved between words inside the same link
        else show(a, e.clientX, e.clientY)
    })
    document.addEventListener('mouseout', (e) => {
        const from = e.target.closest?.('a.photo-link')
        if(from && from !== e.relatedTarget?.closest?.('a.photo-link')) hide()
    })
    // keyboard users get the same preview when they tab onto a photo word
    document.addEventListener('focusin', (e) => {
        const a = e.target.closest?.('a.photo-link')
        if(a) { const r = a.getBoundingClientRect(); show(a, r.left + 1, r.top + 1) }
    })
    document.addEventListener('focusout', (e) => { if(e.target.closest?.('a.photo-link')) hide() })
    document.addEventListener('click', (e) => { if(e.target.closest?.('a.photo-link')) { clearTimeout(hideTimer); conceal() } })
    window.addEventListener('scroll', () => { if(current) conceal() }, { passive: true }) // it's anchored to the word, so drop it when the page moves
}

// ---------- click: a soft phosphor "ping" — a thin ring spreads from the pointer while a dot fades ----------

function initClickFx()
{
    if(reduced) return
    window.addEventListener('click', (e) => {
        if(window.getSelection()?.toString()) return
        const ring = mk('div', 'click-ring'), dot = mk('div', 'click-dot')
        fxRoot().append(ring, dot)
        const at = { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50 }
        gsap.fromTo(ring, { ...at, scale: 0.3, opacity: 0.55 }, { scale: 1.5, opacity: 0, duration: 0.7, ease: 'power3.out', onComplete: () => ring.remove() })
        gsap.fromTo(dot, { ...at, scale: 1, opacity: 0.9 }, { scale: 0.2, opacity: 0, duration: 0.35, ease: 'power2.out', onComplete: () => dot.remove() })
    })
}

// ---------- backdrop: faint constellation that links to the cursor and spawns on click ----------

async function initBackground()
{
    if(reduced) return
    const host = mk('div', '')
    host.id = 'bg-particles'
    document.body.prepend(host)
    const [{ tsParticles }, { loadSlim }] = await Promise.all([import('@tsparticles/engine'), import('@tsparticles/slim')])
    await loadSlim(tsParticles)
    await tsParticles.load({
        id: 'bg-particles', element: host,
        options: {
            fullScreen: { enable: false }, fpsLimit: 40, detectRetina: true, background: { color: 'transparent' },
            particles: {
                number: { value: fine ? 46 : 22, limit: { value: 90, mode: 'delete' } },
                color: { value: COLORS.slice(0, 3) },
                opacity: { value: { min: 0.15, max: 0.45 } },
                size: { value: { min: 1, max: 2.4 } },
                move: { enable: true, speed: 0.4, outModes: { default: 'out' } },
                links: { enable: true, distance: 140, color: '#5dffb0', opacity: 0.1, width: 1 },
            },
            interactivity: {
                detectsOn: 'window',
                events: { onHover: { enable: true, mode: ['grab', 'repulse'] }, onClick: { enable: true, mode: 'push' } },
                modes: { grab: { distance: 170, links: { opacity: 0.35 } }, repulse: { distance: 90, duration: 0.4 }, push: { quantity: 3 } },
            },
        },
    })
}

export function initFx()
{
    initCursor()
    initNav()
    initProgress()
    initScramble()
    initTextHover()
    initReveal()
    initHoverCards()
    initCarousels()
    initPhotoPeek()
    initClickFx()
    initBackground().catch((err) => console.warn('particles backdrop failed', err))
    // SplitText + web fonts both change layout after the triggers above were measured.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    ScrollTrigger.refresh()
}
