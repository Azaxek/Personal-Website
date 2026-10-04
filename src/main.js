import './style.css'
import { lenis } from './smooth.js'
import { initFx, onSwipe, bringFxToFront } from './fx.js'
import { initIMacScene } from './imac-scene.js'
import { owner, hero, education, projects, experience, leadership, honors, summer, skills, press, photos as photoData } from './data.js'

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
const el = (tag, cls, html) => { const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e }
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]))

// Escaped text with two kinds of links, written the way the resume writes them:
//   [label](https://url)  -> an article / outside page: opens in a new tab, marked with ↗
//   [label](photo:id)     -> a photo: opens in the on-site viewer, never leaves the page
const rich = (s) => esc(s).replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|photo:[a-z0-9-]+)\)/g, (_, label, target) => (target.startsWith('photo:')
    ? `<a href="#photos" class="photo-link" data-photo="${target.slice(6)}" data-cursor="view">${label}</a>`
    : `<a href="${target}" class="ext" target="_blank" rel="noopener" title="Opens in a new tab">${label}</a>`))


function prompt(cmd)
{
    return `<p class="prompt"><span class="user">arjan@khadka</span> <span class="path">~</span> <span class="dollar">%</span> <span class="cmd">${esc(cmd)}</span></p>`
}

// ---------- small renderers ----------

function entryLinks(links)
{
    if(!links || !links.length) return ''
    return `<div class="entry-links">${links.map((l) => `<a href="${esc(l.url)}" class="ext" target="_blank" rel="noopener" title="Opens in a new tab">${esc(l.label)}</a>`).join('')}</div>`
}

function tagsRow(tags)
{
    if(!tags || !tags.length) return ''
    return `<div class="tags">${tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`
}

function renderProject(p)
{
    const e = el('article', 'entry')
    e.innerHTML = `
        <div class="entry-head">
            <h3>${esc(p.name)}</h3>
            <span class="pill ${p.status}">${p.status}</span>
        </div>
        <p class="tagline">${esc(p.tagline)}</p>
        <p class="body">${rich(p.body)}</p>
        ${p.note ? `<p class="note"># ${rich(p.note)}</p>` : ''}
        <ul>${(p.facts || []).map((f) => `<li>${rich(f)}</li>`).join('')}</ul>
        ${tagsRow(p.tags)}
        ${entryLinks(p.links)}
    `
    return e
}

function renderRole(r)
{
    const e = el('article', 'entry')
    const body = r.body ? `<p class="body">${rich(r.body)}</p>` : ''
    const bullets = r.bullets ? `<ul>${r.bullets.map((b) => `<li>${rich(b)}</li>`).join('')}</ul>` : ''
    e.innerHTML = `
        <h3>${esc(r.title)}</h3>
        ${r.meta ? `<p class="meta">${rich(r.meta)}</p>` : ''}
        ${body}${bullets}
        ${tagsRow(r.tags)}
    `
    return e
}

// ---------- carousel (Experience, Leadership) ----------

function renderCard(r)
{
    const e = el('article', 'card')
    const body = r.body ? `<p class="body">${rich(r.body)}</p>` : ''
    const bullets = r.bullets ? `<ul>${r.bullets.map((b) => `<li>${rich(b)}</li>`).join('')}</ul>` : ''
    e.innerHTML = `
        <h3>${esc(r.title)}</h3>
        ${r.meta ? `<p class="meta">${rich(r.meta)}</p>` : ''}
        <div class="clamp">${body}${bullets}</div>
        ${tagsRow(r.tags)}
    `
    const clamp = $('.clamp', e)
    requestAnimationFrame(() => {
        if(clamp.scrollHeight > clamp.clientHeight + 2) {
            const more = el('button', 'see-more', 'see more ▾')
            more.type = 'button'
            more.onclick = () => {
                if(e.closest('.carousel-wrap')?.dataset.moved) return
                const open = e.classList.toggle('expanded'); more.textContent = open ? 'see less ▴' : 'see more ▾'
            }
            clamp.after(more)
        }
    })
    return e
}

// Draggable + inertia is wired in fx.js; the track is what actually moves inside the clipped .carousel.
function carousel(items, renderer)
{
    const wrap = el('div', 'carousel-wrap')
    wrap.appendChild(el('div', 'carousel-controls', '<span class="hint">swipe · drag · scroll sideways</span><button type="button" class="prev" aria-label="Previous">‹</button><button type="button" class="next" aria-label="Next">›</button>'))
    const view = el('div', 'carousel')
    view.dataset.cursor = 'drag'
    const track = el('div', 'track')
    items.forEach((it) => track.appendChild(renderer(it)))
    view.appendChild(track)
    wrap.appendChild(view)
    return wrap
}

// ---------- photo lightbox ----------

let lbPhotos = [], lbIndex = 0 // lbPhotos is a list of photo ids

function openLightbox(ids, index = 0)
{
    lbPhotos = ids; lbIndex = Math.max(0, index)
    renderLightbox()
    lenis?.stop()
    document.addEventListener('keydown', onLightboxKey)
}

function closeLightbox()
{
    const box = $('#lightbox')
    box?._killSwipe?.()
    if(box?.open) box.close()
    box?.remove()
    lenis?.start()
    document.removeEventListener('keydown', onLightboxKey)
}

function stepLightbox(d)
{
    lbIndex = (lbIndex + d + lbPhotos.length) % lbPhotos.length
    renderLightbox()
}

function onLightboxKey(e)
{
    if(e.key === 'Escape') closeLightbox()
    if(e.key === 'ArrowRight') stepLightbox(1)
    if(e.key === 'ArrowLeft') stepLightbox(-1)
}

function renderLightbox()
{
    let box = $('#lightbox')
    if(!box) {
        // a modal <dialog> lives in the browser's top layer, so no transformed card or carousel can ever paint over it
        box = document.createElement('dialog'); box.className = 'lightbox'; box.id = 'lightbox'
        document.body.appendChild(box)
        box.showModal()
        bringFxToFront() // the cursor must stay above the viewer
        box.addEventListener('cancel', (e) => { e.preventDefault(); closeLightbox() }) // Esc
        box._killSwipe = onSwipe(box, { left: () => stepLightbox(1), right: () => stepLightbox(-1) }) // swipe or drag between photos
    }
    const multi = lbPhotos.length > 1
    const p = photoData[lbPhotos[lbIndex]]
    box.innerHTML = `
        <button type="button" class="lb-close" aria-label="Close">✕</button>
        ${multi ? '<button type="button" class="lb-prev" aria-label="Previous photo">‹</button>' : ''}
        <figure class="lb-figure">
            <img src="${esc(p.src)}" alt="${esc(p.title)}: ${esc(p.caption)}" draggable="false">
            <figcaption><b>${esc(p.title)}</b><span>${esc(p.caption)}</span></figcaption>
        </figure>
        ${multi ? '<button type="button" class="lb-next" aria-label="Next photo">›</button>' : ''}
        ${multi ? `<span class="lb-count">${lbIndex + 1} / ${lbPhotos.length}</span>` : ''}
    `
    const next = photoData[lbPhotos[(lbIndex + 1) % lbPhotos.length]]
    if(next) new Image().src = next.src // preload the next one so stepping feels instant
    box.onclick = (e) => { if(e.target === box) closeLightbox() }
    $('.lb-close', box).onclick = closeLightbox
    if(multi) { $('.lb-prev', box).onclick = () => stepLightbox(-1); $('.lb-next', box).onclick = () => stepLightbox(1) }
}

function section(id, command, contentEl)
{
    const s = el('section')
    s.id = id
    s.insertAdjacentHTML('beforeend', prompt(command))
    s.appendChild(contentEl)
    return s
}

function list(items, renderer)
{
    const wrap = el('div')
    items.forEach((it) => wrap.appendChild(renderer(it)))
    return wrap
}

// ---------- page assembly ----------

function renderBoot()
{
    const b = el('section', 'boot')
    const bioText = hero.bio.map((part) => (typeof part === 'string' ? part : part.b)).join('')
    b.innerHTML = `
        ${prompt('whoami')}
        <p class="out">${esc(bioText)}</p>
        <p class="out dim">${esc(hero.kicker)}</p>
        ${prompt('cat mission.txt')}
        <p class="out">${esc(hero.tagline)}</p>
        <p class="out quote">"${esc(hero.epigraph.text)}" <span class="dim">— ${esc(hero.epigraph.by)}</span></p>
        ${prompt('stats --live')}
        <div class="stats">${hero.stats.map((s) => `<div class="stat"><b data-count="${s.n}">0${esc(s.suf || '')}</b><span>${esc(s.label)}</span></div>`).join('')}</div>
        ${prompt('open --contact')}
        <div class="links-row">
            <a href="mailto:${esc(owner.email)}">email</a>
            <a href="${esc(owner.linkedin)}" target="_blank" rel="noopener">linkedin</a>
            <a href="${esc(owner.github)}" target="_blank" rel="noopener">github</a>
        </div>
        ${prompt('cat articles.log')}
        <div class="seen-in">${press.map((p) => `<a href="${esc(p.url)}" class="ext" target="_blank" rel="noopener" title="Opens in a new tab">${esc(p.label)}</a>`).join('')}</div>
        <p class="legend"><span class="ext-mark">↗</span> an article — opens in a new tab <i>·</i> <span class="ph-mark">▣</span> a photo — hover to preview, click to enlarge</p>
        <p class="prompt cursor"><span class="user">arjan@khadka</span> <span class="path">~</span> <span class="dollar">%</span></p>
    `
    return b
}

function renderHonors()
{
    const wrap = el('div')
    // Endless marquee: the chips are listed twice and the track slides by exactly half its width.
    const t = el('div', 'ticker')
    const track = el('div', 'ticker-track')
    for (let pass = 0; pass < 2; pass++) {
        honors.ticker.forEach((label) => {
            const chip = el('span', null, esc(label))
            if(pass) chip.setAttribute('aria-hidden', 'true')
            track.appendChild(chip)
        })
    }
    t.appendChild(track)
    wrap.appendChild(t)
    wrap.appendChild(list(honors.groups, renderRole))
    return wrap
}

function renderSkills()
{
    const wrap = el('div')
    skills.forEach((g) => {
        const grp = el('div', 'skill-group')
        grp.appendChild(el('h3', null, esc(g.title)))
        grp.appendChild((() => { const d = el('div', 'tags'); g.tags.forEach((t) => d.appendChild(el('span', null, esc(t)))); return d })())
        wrap.appendChild(grp)
    })
    return wrap
}

function renderContact()
{
    const e = el('article', 'entry')
    e.innerHTML = `
        <p class="body">Open to work, and always up for talking about education, safety, and building things for the community.</p>
        <div class="links-row" style="margin-top:16px">
            <a href="mailto:${esc(owner.email)}">email</a>
            <a href="${esc(owner.linkedin)}" target="_blank" rel="noopener">linkedin</a>
            <a href="${esc(owner.github)}" target="_blank" rel="noopener">github</a>
        </div>
    `
    return e
}

function build()
{
    const content = $('#content')
    content.appendChild(renderBoot())
    content.appendChild(section('education', 'cat education.txt', list(education, renderRole)))
    content.appendChild(section('projects', 'ls projects/', list(projects, renderProject)))
    content.appendChild(section('experience', 'cat experience.log', carousel(experience, renderCard)))
    content.appendChild(section('leadership', 'cat leadership.log', carousel(leadership, renderCard)))
    content.appendChild(section('honors', 'cat honors.log', renderHonors()))
    content.appendChild(section('summer', 'cat summer.log', carousel(summer, renderCard)))
    content.appendChild(section('skills', 'cat skills.txt', renderSkills()))
    content.appendChild(section('contact', 'mail --compose', renderContact()))
}

// A photo word opens its picture larger, in the on-site viewer (hovering it shows a preview — see fx.js).
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-photo]')
    if(!link) return
    e.preventDefault()
    openLightbox([link.dataset.photo], 0)
})

build()
initFx() // after build(): it wires up the DOM that build() just created
initIMacScene({ pin: $('#imacPin'), container: $('#imacContainer'), loading: $('#imacLoading') })
