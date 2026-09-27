import './style.css'
import { owner, hero, projects, experience, leadership, honors, skills, writing, beyond } from './data.js'

const $ = (sel, root = document) => root.querySelector(sel)
const el = (tag, cls, html) => { const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e }
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]))

// ---------- intro ----------

function runIntro()
{
    const intro = $('#intro')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finish = () => { intro.classList.add('done'); $('#app').classList.add('ready') }
    if(reduced) return finish()
    const timer = setTimeout(finish, 2900)
    $('#skipIntro').onclick = () => { clearTimeout(timer); finish() }
}

// ---------- small renderers ----------

function entryLinks(links)
{
    if(!links || !links.length) return ''
    return `<div class="entry-links">${links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>`
}

function tagsRow(tags)
{
    if(!tags || !tags.length) return ''
    return `<div class="tags">${tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`
}

function photosButton(photos)
{
    return photos && photos.length ? '<button type="button" class="view-photos">View photos ▸</button>' : ''
}

function wirePhotos(container, photos)
{
    if(!photos || !photos.length) return
    const btn = container.querySelector('.view-photos')
    if(btn) btn.onclick = () => openLightbox(photos)
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
        <p class="body">${esc(p.body)}</p>
        ${p.note ? `<p class="note">${esc(p.note)}</p>` : ''}
        <ul>${(p.facts || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        ${tagsRow(p.tags)}
        ${entryLinks(p.links)}
        ${photosButton(p.photos)}
    `
    wirePhotos(e, p.photos)
    return e
}

function renderRole(r)
{
    const e = el('article', 'entry')
    const body = r.body ? `<p class="body">${esc(r.body)}</p>` : ''
    const bullets = r.bullets ? `<ul>${r.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''
    e.innerHTML = `
        <h3>${esc(r.title)}</h3>
        ${r.meta ? `<p class="meta">${esc(r.meta)}</p>` : ''}
        ${body}${bullets}
        ${tagsRow(r.tags)}
        ${photosButton(r.photos)}
    `
    wirePhotos(e, r.photos)
    return e
}

// ---------- photo lightbox (slideshow: prev/next, counter, esc/backdrop to close) ----------

let lbPhotos = [], lbIndex = 0

function openLightbox(photos, index = 0)
{
    lbPhotos = photos; lbIndex = index
    renderLightbox()
    document.addEventListener('keydown', onLightboxKey)
}

function closeLightbox()
{
    $('#lightbox')?.remove()
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
    if(!box) { box = el('div', 'lightbox'); box.id = 'lightbox'; document.body.appendChild(box) }
    const multi = lbPhotos.length > 1
    box.innerHTML = `
        <button type="button" class="lb-close" aria-label="Close">✕</button>
        ${multi ? '<button type="button" class="lb-prev" aria-label="Previous photo">‹</button>' : ''}
        <img src="${esc(lbPhotos[lbIndex])}" alt="">
        ${multi ? '<button type="button" class="lb-next" aria-label="Next photo">›</button>' : ''}
        ${multi ? `<span class="lb-count">${lbIndex + 1} / ${lbPhotos.length}</span>` : ''}
    `
    box.onclick = (e) => { if(e.target === box) closeLightbox() }
    $('.lb-close', box).onclick = closeLightbox
    if(multi) { $('.lb-prev', box).onclick = () => stepLightbox(-1); $('.lb-next', box).onclick = () => stepLightbox(1) }
}

function section(id, label, contentEl)
{
    const s = el('section')
    s.id = id
    s.appendChild(el('h2', null, esc(label)))
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

function renderHero()
{
    const h = el('div', 'hero')
    const bioHtml = hero.bio.map((part) => (typeof part === 'string' ? esc(part) : `<b>${esc(part.b)}</b>`)).join('')
    const photo = hero.photo ? `<img class="photo" src="${esc(hero.photo)}" alt="${esc(owner.name)}">` : ''
    h.innerHTML = `
        <div class="hero-top">
            <div class="hero-text">
                <p class="kicker">${esc(hero.kicker)}</p>
                <h1>${bioHtml}</h1>
                <p class="tagline">${esc(hero.tagline)}</p>
            </div>
            ${photo}
        </div>
        <p class="epigraph">“${esc(hero.epigraph.text)}”<span>— ${esc(hero.epigraph.by)}</span></p>
        <div class="stats">${hero.stats.map((s) => `<div class="stat"><b data-count="${s.n}">0${esc(s.suf || '')}</b><span>${esc(s.label)}</span></div>`).join('')}</div>
        <div class="links-row">
            <a href="mailto:${esc(owner.email)}">Email</a>
            <a href="${esc(owner.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
            <a href="${esc(owner.github)}" target="_blank" rel="noopener">GitHub</a>
        </div>
        <div class="seen-in">
            <span>As seen in</span>
            ${writing.press.map((p) => `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.label)}</a>`).join('')}
        </div>
    `
    return h
}

function renderHonors()
{
    const wrap = el('div')
    const t = el('div', 'ticker')
    honors.ticker.forEach((label) => t.appendChild(el('span', null, esc(label))))
    wrap.appendChild(t)
    wrap.appendChild(list(honors.groups, renderRole))
    return wrap
}

function renderSkills()
{
    const wrap = el('div', 'entry')
    skills.forEach((g) => {
        const grp = el('div', 'skill-group')
        grp.appendChild(el('h3', null, esc(g.title)))
        grp.appendChild((() => { const d = el('div', 'tags'); g.tags.forEach((t) => d.appendChild(el('span', null, esc(t)))); return d })())
        wrap.appendChild(grp)
    })
    return wrap
}

function renderWriting()
{
    const wrap = el('div')
    writing.posts.forEach((p) => {
        const e = el('div', 'quote-entry')
        e.innerHTML = `<blockquote>“${esc(p.quote)}”</blockquote><p class="meta">${esc(p.about)} — <a href="${esc(p.url)}" target="_blank" rel="noopener" style="color:var(--accent)">read it ↗</a></p>`
        wrap.appendChild(e)
    })
    return wrap
}

function renderBeyond()
{
    const e = el('article', 'entry')
    e.innerHTML = `<p class="body">${esc(beyond.body)}</p>${entryLinks(beyond.links)}`
    return e
}

function renderContact()
{
    const e = el('article', 'entry')
    e.innerHTML = `
        <p class="body">Open to work, and always up for talking about education, safety, and building things for the community.</p>
        <div class="links-row" style="margin-top:16px">
            <a href="mailto:${esc(owner.email)}">Email</a>
            <a href="${esc(owner.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
            <a href="${esc(owner.github)}" target="_blank" rel="noopener">GitHub</a>
        </div>
    `
    return e
}

function build()
{
    const content = $('#content')
    content.appendChild(renderHero())
    content.appendChild(section('projects', 'Projects', list(projects, renderProject)))
    content.appendChild(section('experience', 'Experience', list(experience, renderRole)))
    content.appendChild(section('leadership', 'Leadership', list(leadership, renderRole)))
    content.appendChild(section('honors', 'Honors', renderHonors()))
    content.appendChild(section('skills', 'Skills', renderSkills()))
    content.appendChild(section('writing', 'Writing & press', renderWriting()))
    content.appendChild(section('beyond', 'Beyond this', renderBeyond()))
    content.appendChild(section('contact', 'Contact', renderContact()))
}

function countUp()
{
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    $$('b[data-count]').forEach((b) => {
        const to = +b.dataset.count, suf = b.textContent.replace(/[\d,]/g, '')
        if(reduced) { b.textContent = to.toLocaleString('en-US') + suf; return }
        const t0 = performance.now()
        const tick = (now) => {
            const k = Math.min(1, (now - t0) / 1200), e = 1 - (1 - k) ** 3
            b.textContent = Math.round(to * e).toLocaleString('en-US') + suf
            if(k < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
    })
}
function $$(sel, root = document) { return [...root.querySelectorAll(sel)] }

function revealOnScroll()
{
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const entries = $$('.entry')
    if(reduced || !('IntersectionObserver' in window)) { entries.forEach((e) => e.classList.add('visible')); return }
    const io = new IntersectionObserver((hits) => {
        hits.forEach((hit) => { if(hit.isIntersecting) { hit.target.classList.add('visible'); io.unobserve(hit.target) } })
    }, { threshold: .1, rootMargin: '0px 0px -40px 0px' })
    entries.forEach((e) => io.observe(e))
}

build()
countUp()
revealOnScroll()
runIntro()
