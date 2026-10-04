// The hidden photo list. /photos/ lists every picture; /photos/<name> shows one. Each has a link you can
// paste into a resume. All the data comes from src/data.js (photos + photoGroups) — add a photo there and it
// appears here automatically.
import './style.css'
import { photos, photoGroups } from './data.js'

const root = document.querySelector('#content')
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]))
const ids = photoGroups.flatMap((g) => g.ids)
const link = (id) => `${location.origin}/photos/${id}`
const shortLink = (id) => `${location.host}/photos/${id}`
const name = location.pathname.replace(/^\/photos\/?/, '').replace(/\/+$/, '')

function row(id)
{
    const p = photos[id]
    return `
        <li>
            <a class="thumb" href="/photos/${id}" tabindex="-1" aria-hidden="true"><img src="${esc(p.src)}" width="${p.w}" height="${p.h}" alt="" loading="lazy"></a>
            <div class="info">
                <a class="name" href="/photos/${id}">${esc(p.title)}</a>
                <span class="cap">${esc(p.caption)}</span>
                <code class="url">${esc(shortLink(id))}</code>
            </div>
            <button type="button" class="copy" data-copy="${esc(link(id))}">copy link</button>
        </li>`
}

function renderList(missing)
{
    document.title = 'Photos — Arjan Khadka'
    root.innerHTML = `
        <div class="photo-index">
            <p class="prompt"><span class="user">arjan@khadka</span> <span class="path">~</span> <span class="dollar">%</span> <span class="cmd">ls photos/</span></p>
            <p class="lead">The pictures behind items on my resume. Each one has its own link.</p>
            ${missing ? `<p class="note">There's no photo called “${esc(missing)}” — here's everything.</p>` : ''}
            ${photoGroups.map((g) => `
                <h2>${esc(g.title)}</h2>
                <ul class="photo-list ${esc(g.kind || '')}">${g.ids.map(row).join('')}</ul>`).join('')}
        </div>`
}

function renderPhoto(id)
{
    const p = photos[id]
    const i = ids.indexOf(id)
    const prev = ids[i - 1], next = ids[i + 1]
    document.title = `${p.title} — Arjan Khadka`
    root.innerHTML = `
        <article class="photo-page">
            <a class="back" href="/photos/">← all photos</a>
            <h1>${esc(p.title)}</h1>
            <p class="cap">${esc(p.caption)}</p>
            <a class="full" href="${esc(p.src)}" target="_blank" rel="noopener" title="Open the image file"><img src="${esc(p.src)}" width="${p.w}" height="${p.h}" alt="${esc(p.title)}: ${esc(p.caption)}"></a>
            <div class="share">
                <code class="url">${esc(shortLink(id))}</code>
                <button type="button" class="copy" data-copy="${esc(link(id))}">copy link</button>
                <a class="ext" href="${esc(p.src)}" target="_blank" rel="noopener">the image file</a>
            </div>
            <nav class="pager" aria-label="Other photos">
                ${prev ? `<a href="/photos/${prev}" rel="prev">← ${esc(photos[prev].title)}</a>` : '<span></span>'}
                ${next ? `<a href="/photos/${next}" rel="next">${esc(photos[next].title)} →</a>` : '<span></span>'}
            </nav>
        </article>`
    document.addEventListener('keydown', (e) => {
        if(e.metaKey || e.ctrlKey || e.altKey) return
        if(e.key === 'ArrowLeft' && prev) location.assign(`/photos/${prev}`)
        if(e.key === 'ArrowRight' && next) location.assign(`/photos/${next}`)
    })
}

// "copy link" buttons (the plain link is also printed next to each one, in case copying is blocked)
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]')
    if(!btn) return
    try { await navigator.clipboard.writeText(btn.dataset.copy) } catch {
        const t = Object.assign(document.createElement('textarea'), { value: btn.dataset.copy })
        document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove()
    }
    const was = btn.dataset.label || btn.textContent
    btn.dataset.label = was
    btn.textContent = 'copied ✓'
    btn.classList.add('done')
    clearTimeout(btn._t)
    btn._t = setTimeout(() => { btn.textContent = was; btn.classList.remove('done') }, 1500)
})

if(name && photos[name]) renderPhoto(name)
else renderList(name)
