// Interaction layer for everything below the 3D hero: cursor, hover/scramble/word-glow, scroll
// reveals, tilt + spotlight cards, magnetic buttons, a draggable carousel, click bursts and a
// cursor-reactive particle backdrop. Motion is GSAP (+ its SplitText/ScrambleText/Draggable/
// Inertia/Observer plugins); vanilla-tilt, canvas-confetti and tsParticles cover the rest.
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

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Draggable, InertiaPlugin, Observer)

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
const mk = (tag, cls) => { const e = document.createElement(tag); e.className = cls; return e }
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const GLYPHS = '01{}<>/\\_$#%&*'
const COLORS = ['#5dffb0', '#5ad4ff', '#ff6bd6', '#ffd166']

// ---------- cursor: dot + lagging ring that morphs over links / the carousel / photos ----------

function initCursor()
{
    if(!fine || reduced) return
    const ring = mk('div', 'cursor-ring'), dot = mk('div', 'cursor-dot'), label = mk('span', 'cursor-label')
    ring.appendChild(label)
    document.body.append(ring, dot)
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
        const t = e.target.closest?.('[data-cursor], a, button, .photo-strip img')
        const kind = !t ? '' : t.dataset.cursor || (t.matches('.photo-strip img') ? 'view' : 'link')
        ring.dataset.state = kind
        label.textContent = kind === 'drag' || kind === 'view' ? kind : ''
    })
    window.addEventListener('pointerdown', () => gsap.to(ring, { scale: 0.75, duration: 0.15 }))
    window.addEventListener('pointerup', () => gsap.to(ring, { scale: 1, duration: 0.45, ease: 'back.out(3)' }))
}

// ---------- header: smooth anchor scroll, active section, progress bar ----------

function initNav()
{
    $$('#top nav a[href^="#"]').forEach((a) => {
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

function initScramble()
{
    if(reduced) return
    $$('#top nav a, #top .brand, .links-row a, .entry-links a, .entry h3, .card h3, .seen-in a, .skill-group h3').forEach((t) => {
        if(t.children.length) return
        const text = t.textContent
        t.addEventListener('pointerenter', () => gsap.to(t, { duration: 0.6, ease: 'none', overwrite: true, scrambleText: { text, chars: GLYPHS, speed: 0.8, revealDelay: 0.05 } }))
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
    VanillaTilt.init($$('.card'), { max: 7, speed: 500, glare: true, 'max-glare': 0.14, scale: 1.02, perspective: 900 })
    VanillaTilt.init($$('.stat'), { max: 10, speed: 500, scale: 1.05, perspective: 600 })
    $$('.entry, .card, .skill-group').forEach((e) => e.addEventListener('pointermove', (ev) => {
        const r = e.getBoundingClientRect()
        e.style.setProperty('--mx', `${ev.clientX - r.left}px`)
        e.style.setProperty('--my', `${ev.clientY - r.top}px`)
    }))
    $$('.links-row a, .carousel-controls button').forEach((m) => {
        const x = gsap.quickTo(m, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' }), y = gsap.quickTo(m, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' })
        m.addEventListener('pointermove', (e) => {
            const r = m.getBoundingClientRect()
            x((e.clientX - (r.left + r.width / 2)) * 0.35)
            y((e.clientY - (r.top + r.height / 2)) * 0.35)
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
        measure()
        const drag = Draggable.create(track, {
            type: 'x', bounds: view, inertia: true, edgeResistance: 0.85, cursor: 'inherit', activeCursor: 'inherit',
            snap: { x: nearest },
            onDragStart() { wrap.dataset.moved = '1' }, // lets click handlers ignore the click that ends a drag
            onRelease() { setTimeout(() => { delete wrap.dataset.moved }, 80) },
        })[0]
        const go = (dir) => {
            const x = gsap.getProperty(track, 'x')
            const next = dir > 0 ? snaps.find((s) => s < x - 4) : [...snaps].reverse().find((s) => s > x + 4)
            if(next == null) return
            gsap.to(track, { x: next, duration: 0.8, ease: 'power3.out', overwrite: true, onUpdate: () => drag.update() })
        }
        $('.prev', wrap).addEventListener('click', () => go(-1))
        $('.next', wrap).addEventListener('click', () => go(1))
        window.addEventListener('resize', () => {
            const max = measure()
            drag.applyBounds(view)
            gsap.set(track, { x: nearest(gsap.getProperty(track, 'x')) })
            drag.update()
            max ? drag.enable() : drag.disable()
        })
    })
}

// Swipe left/right on any element (touch or mouse drag). Returns a kill function.
export function onSwipe(target, { left, right })
{
    const o = Observer.create({ target, type: 'touch,pointer', tolerance: 50, dragMinimum: 6, onLeft: left, onRight: right })
    return () => o.kill()
}

// ---------- click: expanding ring + a burst of code glyphs in the accent colors ----------

function initClickFx()
{
    if(reduced) return
    let confetti = null, shapes = []
    const load = async () => {
        if(confetti) return
        confetti = (await import('canvas-confetti')).default
        const font = '"Space Grotesk", ui-sans-serif, sans-serif'
        shapes = COLORS.flatMap((color) => ['0', '1', '{', '}', '$', '/', '<', '>'].map((text) => confetti.shapeFromText({ text, scalar: 1.6, color, fontFamily: font })))
    }
    window.addEventListener('click', async (e) => {
        if(window.getSelection()?.toString()) return
        const ring = mk('div', 'click-ring')
        document.body.appendChild(ring)
        gsap.fromTo(ring, { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50, scale: 0.2, opacity: 0.9 }, { scale: 1.8, opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => ring.remove() })
        await load()
        const big = !!e.target.closest?.('a, button')
        confetti({
            particleCount: big ? 26 : 10, spread: 360, startVelocity: big ? 24 : 15, ticks: 55, gravity: 0.7, decay: 0.9, scalar: 1.6,
            shapes, zIndex: 400, disableForReducedMotion: true, origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        })
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
    initClickFx()
    initBackground().catch((err) => console.warn('particles backdrop failed', err))
    // SplitText + web fonts both change layout after the triggers above were measured.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    ScrollTrigger.refresh()
}
