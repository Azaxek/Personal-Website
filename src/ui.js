// DOM overlay: signpost chips, speech bubble, menu card, project / channel / drinks panels, game window, HUD.
// All text comes from menu.js, content.js and quotes.js.
import { owner, items } from './menu.js'
import { hub } from './content.js'
import { FLAVORS } from './drinks.js'

const $ = (s) => document.querySelector(s)
const el = (tag, cls, html) => { const e = document.createElement(tag); if(cls) e.className = cls; if(html !== undefined) e.innerHTML = html; return e }
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const initials = owner.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

export function createUI(on)
{
    const bubble = $('#bubble'), menu = $('#menu'), panel = $('#panel'), hud = $('#hud'), skipCook = $('#skipCook'), game = $('#game')
    $('#bubble .who').textContent = owner.chef
    $('.brand').textContent = `${owner.short}'s Ramen`

    // ---------- signpost chips (an accessible alternative to clicking the 3D signs) ----------
    const hint = $('#hint'), caption = hint.querySelector('.caption'), DEFAULT_CAPTION = caption.textContent
    hub.forEach((h) =>
    {
        const b = el('button', 'chip-btn', esc(h.label)); b.type = 'button'
        b.onclick = () => on.go(h.id)
        b.onpointerenter = () => on.hoverHub(h.id); b.onpointerleave = () => on.hoverHub(null)
        b.onfocus = () => on.hoverHub(h.id); b.onblur = () => on.hoverHub(null)
        hint.querySelector('.chips').appendChild(b)
    })

    // ---------- menu card ----------
    const kinds = [...new Set(items.map((i) => i.kind))]
    menu.innerHTML = `<div class="in">
        <div class="card-head"><span class="chip">▮ THE MENU</span><h2>MENU</h2><p>${esc(owner.name)} · ${esc(owner.tagline)}</p><button class="close" type="button" aria-label="Close menu">×</button></div>
        <div class="scroll">${kinds.map((k) => `<h3>${esc(k)}</h3>` + items.map((it, i) => it.kind !== k ? '' : `
            <button class="row" type="button" data-i="${i}"><span class="top"><i class="swatch" style="--bowl:${esc(it.dish.bowl)};--broth:${esc(it.dish.broth)}"></i><span class="name">${esc(it.name)}</span><span class="dots"></span><span class="go">Order ›</span></span><small>${esc(it.summary)}</small></button>`).join('')).join('')}
        </div>
        <div class="card-foot">Made fresh, right in front of you. <a href="${esc(owner.github)}" target="_blank" rel="noopener">GitHub</a></div></div>`
    menu.querySelector('.close').onclick = () => on.closeMenu()
    menu.querySelectorAll('.row').forEach((r) => { r.onclick = () => on.order(+r.dataset.i) })

    // ---------- speech bubble ----------
    let sayToken = 0, skipLine = null
    bubble.querySelector('.skip').onclick = () => { skipLine?.() }
    bubble.onclick = () => { skipLine?.() }

    async function say(lines, { hold = true } = {})
    {
        const token = ++sayToken
        const list = Array.isArray(lines) ? lines : [lines]
        bubble.hidden = false
        for(const line of list)
        {
            if(token !== sayToken) return
            const textEl = bubble.querySelector('.text'); textEl.textContent = ''
            let skipped = false; skipLine = () => { skipped = true }
            on.talk(true)
            for(let c = 1; c <= line.length && !skipped && token === sayToken; c++){ textEl.textContent = line.slice(0, c); await sleep(22) }
            textEl.textContent = line; on.talk(false)
            const until = performance.now() + (hold ? Math.max(1200, line.length * 38) : 500)
            skipped = false
            while(!skipped && token === sayToken && performance.now() < until) await sleep(60)
        }
        if(token === sayToken){ skipLine = null; bubble.hidden = true; on.talk(false) }
    }
    const hideBubble = () => { sayToken++; bubble.hidden = true; on.talk(false) }
    const moveBubble = (x, y) =>
    {
        const w = bubble.offsetWidth / 2 + 10
        bubble.style.left = Math.min(innerWidth - w, Math.max(w, x)) + 'px'
        bubble.style.top = Math.max(bubble.offsetHeight + 60, y) + 'px'
    }

    // ---------- panels ----------
    const setPanel = (html) => { panel.setAttribute('aria-labelledby', 'panelTitle'); panel.innerHTML = `<div class="in">${html}</div>`; panel.hidden = false; panel.querySelector('.scroll')?.focus({ preventScroll: true }) }
    const hidePanel = () => { panel.hidden = true }

    function showPanel(i)
    {
        const it = items[i]
        setPanel(`
            <div class="scroll" tabindex="-1">
                <span class="chip">▮ ${esc(it.kind.toUpperCase())}</span>
                <h2 id="panelTitle">${esc(it.name)}</h2>
                <p class="tagline">${esc(it.tagline)}</p>
                ${it.description.map((p) => `<p>${esc(p)}</p>`).join('')}
                ${it.facts?.length ? `<ul>${it.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
                <div class="tags">${it.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
                ${it.links?.length ? `<div class="links">${it.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}
            </div>
            <div class="card-foot"><button class="btn back" type="button">← Back to the menu</button><button class="btn post" type="button">⌂ Signpost</button></div>`)
        panel.querySelector('.back').onclick = () => on.back()
        panel.querySelector('.post').onclick = () => on.go('hub')
    }

    const entryHtml = (e) => `
        <article class="entry">
            <h3>${esc(e.title)}</h3>
            ${e.meta ? `<p class="meta">${esc(e.meta)}</p>` : ''}
            ${(e.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}
            ${e.bullets?.length ? `<ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
            ${e.tags?.length ? `<div class="tags">${e.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
            ${(e.videos || []).map((s) => `
                <div class="season"><h4>${esc(s.season)}</h4>${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}
                    <div class="videos">${s.items.map((v) => `
                        <a class="video" href="https://www.youtube.com/watch?v=${esc(v.id)}" target="_blank" rel="noopener">
                            <img src="https://i.ytimg.com/vi/${esc(v.id)}/mqdefault.jpg" alt="" loading="lazy" width="320" height="180">
                            <span class="play" aria-hidden="true">▶</span>
                            <b>${esc(v.title)}</b><small>${esc(v.sub)} · YouTube ↗</small>
                        </a>`).join('')}</div>
                </div>`).join('')}
            ${e.game ? `<button class="btn play" type="button" data-game="1">▶ Play ${esc(e.game.title)}</button>` : ''}
            ${e.links?.length ? `<div class="links">${e.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}
        </article>`

    // numbers in the panel count up from zero when it opens
    function countUp()
    {
        panel.querySelectorAll('[data-n]').forEach((b) =>
        {
            const to = +b.dataset.n, t0 = performance.now(), pre = b.dataset.pre ?? '', suf = b.dataset.suf ?? '+'
            const tick = (now) => { const k = Math.min(1, (now - t0) / 1300), e = 1 - (1 - k) ** 3; b.textContent = pre + Math.round(to * e).toLocaleString('en-US') + suf; if(k < 1 && !panel.hidden) requestAnimationFrame(tick) }
            requestAnimationFrame(tick)
        })
    }

    function showChannel(ch, next)
    { // next = the following channel in the same place, or null when the place has only one
        const hero = ch.hero
            ? `<header class="hero">
                <div class="avatar" aria-hidden="true"><span>${esc(initials)}</span></div>
                <div class="hero-txt">
                    <span class="chip">▮ ${esc(ch.kicker)}</span>
                    <h2 id="panelTitle" class="glitch" data-text="${esc(owner.name.toUpperCase())}">${esc(owner.name.toUpperCase())}</h2>
                    <p class="role">STUDENT // BUILDER // ORGANIZER</p>
                    <p class="loc">◉ PARIS, TX · CLASS OF 2027 · <b class="live">OPEN TO WORK</b></p>
                </div>
            </header>`
            : `<span class="chip">▮ ${esc(ch.kicker)}</span><h2 id="panelTitle">${esc(ch.label)}</h2>`
        setPanel(`
            <div class="scroll" tabindex="-1">
                ${hero}
                <p class="tagline">${esc(ch.tagline)}</p>
                ${ch.stats ? `<div class="stats">${ch.stats.map((s) => `<div class="stat"><b data-n="${s.n}" data-pre="${esc(s.pre ?? '')}" data-suf="${esc(s.suf ?? '+')}">${esc((s.pre ?? '') + '0' + (s.suf ?? '+'))}</b><span>${esc(s.t)}</span></div>`).join('')}</div>` : ''}
                ${ch.entries.map(entryHtml).join('')}
            </div>
            <div class="card-foot"><button class="btn post" type="button">⌂ Signpost</button>${next ? `<button class="btn next" type="button">${esc(next.label)} →</button>` : ''}</div>`)
        panel.querySelector('.post').onclick = () => on.go('hub')
        if(next) panel.querySelector('.next').onclick = () => on.go(next.id)
        panel.querySelectorAll('[data-game]').forEach((b) => { b.onclick = () => { const g = ch.entries.find((e) => e.game).game; on.playGame(g) } })
        countUp()
    }

    // ---------- the vending machine ----------
    const flavorButtons = () => `<div class="flavors">${FLAVORS.map((f, i) => `<button class="flavor" type="button" data-i="${i}" style="--c:${f.color}"><i></i>${esc(f.name)}</button>`).join('')}</div>`
    function showDrinks(quote = null)
    {
        setPanel(`
            <div class="scroll" tabindex="-1">
                <span class="chip">▮ DISPENSER</span><h2 id="panelTitle">Drinks</h2>
                <p class="tagline">Pick a bottle. Inside is one of my favorite quotes.</p>
                ${quote ? `<figure class="paper reveal">
                        <span class="qm" aria-hidden="true">“</span>
                        <blockquote>${esc(quote.text)}</blockquote>
                        <figcaption>${esc(quote.by)}</figcaption>
                        ${quote.note ? `<p class="qnote">${esc(quote.note)}</p>` : ''}
                    </figure><p class="again">Thirsty for another?</p>`
                    : `<p>Click a drink here, or one of the four bottles on the machine. Every bottle is a random draw from the quotes I keep coming back to.</p>`}
                ${flavorButtons()}
            </div>
            <div class="card-foot"><button class="btn post" type="button">⌂ Signpost</button></div>`)
        panel.querySelector('.post').onclick = () => on.go('hub')
        panel.querySelectorAll('.flavor').forEach((b) => { b.onclick = () => on.drink(+b.dataset.i) })
    }
    const setDrinksBusy = (busy) => { panel.classList.toggle('busy', busy); panel.querySelectorAll('.flavor').forEach((b) => { b.disabled = busy }) }

    // ---------- the game window (a third-party game, loaded only after the visitor agrees) ----------
    let gameSrc = ''
    const closeGame = () => { game.hidden = true; game.querySelector('.game-body iframe')?.remove(); game.querySelector('.gate').hidden = false }
    game.querySelector('.game-close').onclick = () => { closeGame(); on.gameClosed() }
    game.querySelector('.load').onclick = () =>
    {
        const f = document.createElement('iframe')
        f.src = gameSrc; f.title = game.querySelector('.game-title').textContent
        f.allow = 'fullscreen; autoplay; gamepad; clipboard-write'
        f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals')
        f.referrerPolicy = 'no-referrer'
        game.querySelector('.gate').hidden = true; game.querySelector('.game-body').appendChild(f); f.focus()
    }
    function openGame(g)
    {
        gameSrc = g.url
        game.querySelector('.game-title').textContent = g.title
        game.querySelector('.gate-title').textContent = g.title
        game.querySelector('.gate-by').textContent = `by ${g.by}`
        game.querySelector('.game-open').href = g.url
        game.hidden = false; game.querySelector('.load').focus()
    }

    return {
        say, hideBubble, moveBubble,
        showHud: () => { hud.hidden = false },
        showMenu: () => { menu.hidden = false },
        hideMenu: () => { menu.hidden = true },
        get menuOpen() { return !menu.hidden },
        showPanel, hidePanel, showChannel, showDrinks, setDrinksBusy, openGame, closeGame,
        get gameOpen() { return !game.hidden },
        showHint: (v) => { hint.hidden = !v; if(v) caption.textContent = DEFAULT_CAPTION },
        setCaption: (id) => { const h = hub.find((x) => x.id === id); caption.textContent = h ? `${h.label}: ${h.blurb}` : DEFAULT_CAPTION },
        // which HUD buttons make sense where
        setHudMode: ({ hubBtn, menuBtn }) => { $('#hubBtn').hidden = !hubBtn; $('#menuBtn').hidden = !menuBtn },
        showSkip: (v) => { skipCook.hidden = !v },
        setSound: (onNow) => { const b = $('#soundBtn'); b.textContent = onNow ? 'Sound on' : 'Sound off'; b.setAttribute('aria-pressed', String(onNow)) },
    }
}
