// Paints every screen in the world: neon posters and the animated About hologram on the tower, the honors ticker, the
// sidewalk chalkboard, the arcade attract mode, the ON AIR contact screen and the vending machine's selection UI.
// Each canvas is laid out at the screen's real aspect ratio and mapped with a per-screen UV matrix (the baked UVs are not
// consistent between screens). Static art is drawn once; animated screens redraw at a modest frame rate on top of it.
import * as THREE from 'three'
import { owner } from './menu.js'
import { FLAVORS, tileRect } from './drinks.js'

const HEAD = (px) => `900 ${px}px "Segoe UI Black","Arial Black",Impact,sans-serif`
const BODY = (px) => `600 ${px}px "Segoe UI",system-ui,sans-serif`
const MONO = (px) => `800 ${px}px "Consolas","Courier New",monospace`
const CHALK = (px) => `700 ${px}px "Segoe Print","Bradley Hand","Comic Sans MS",cursive`
const TAU = Math.PI * 2
const touch = matchMedia('(pointer: coarse)').matches

// Exact frame of a (planar) screen mesh in world space: center, facing, right/up axes, width and height.
export function screenInfo(mesh)
{
    mesh.updateWorldMatrix(true, false)
    const pos = mesh.geometry.attributes.position, nrm = mesh.geometry.attributes.normal
    const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)
    const n = new THREE.Vector3(), v = new THREE.Vector3()
    for(let i = 0; i < nrm.count; i++) n.add(v.fromBufferAttribute(nrm, i).applyMatrix3(nm))
    n.normalize()
    const up = Math.abs(n.y) > 0.95 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0)
    const right = new THREE.Vector3().crossVectors(up, n).normalize()
    const upv = new THREE.Vector3().crossVectors(n, right).normalize()
    let r0 = Infinity, r1 = -Infinity, u0 = Infinity, u1 = -Infinity, d = 0
    for(let i = 0; i < pos.count; i++)
    {
        v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld)
        const r = v.dot(right), u = v.dot(upv)
        r0 = Math.min(r0, r); r1 = Math.max(r1, r); u0 = Math.min(u0, u); u1 = Math.max(u1, u); d += v.dot(n) / pos.count
    }
    const center = new THREE.Vector3().addScaledVector(right, (r0 + r1) / 2).addScaledVector(upv, (u0 + u1) / 2).addScaledVector(n, d)
    return { center, normal: n, right, up: upv, w: r1 - r0, h: u1 - u0 }
}

// Solve the affine map uv -> canvas fractions from the three best-spread vertices.
function uvMatrix(mesh, info)
{
    const pos = mesh.geometry.attributes.position, uv = mesh.geometry.attributes.uv, p = new THREE.Vector3(), pts = []
    for(let i = 0; i < pos.count; i++)
    {
        p.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).sub(info.center)
        pts.push({ sx: p.dot(info.right) / info.w + 0.5, sy: 0.5 - p.dot(info.up) / info.h, u: uv.getX(i), v: uv.getY(i) })
    }
    let best = null, area = -1
    for(let i = 0; i < pts.length; i++) for(let j = i + 1; j < pts.length; j++) for(let k = j + 1; k < pts.length; k++)
    {
        const a = Math.abs((pts[j].u - pts[i].u) * (pts[k].v - pts[i].v) - (pts[k].u - pts[i].u) * (pts[j].v - pts[i].v))
        if(a > area){ area = a; best = [pts[i], pts[j], pts[k]] }
    }
    const [A, B, C] = best
    const inv = new THREE.Matrix3().set(A.u, A.v, 1, B.u, B.v, 1, C.u, C.v, 1).invert()
    const r1 = new THREE.Vector3(A.sx, B.sx, C.sx).applyMatrix3(inv), r2 = new THREE.Vector3(A.sy, B.sy, C.sy).applyMatrix3(inv)
    return [r1.x, r1.y, r1.z, r2.x, r2.y, r2.z]
}

// ---------------------------------------------------------------- drawing helpers
function fit(g, text, font, maxW, px)
{
    g.font = font(px)
    while(g.measureText(text).width > maxW && px > 10) g.font = font(--px)
    return px
}

function wrapLines(g, text, maxW)
{
    const lines = []; let line = ''
    for(const word of text.split(' ')){ const t = line ? `${line} ${word}` : word; if(g.measureText(t).width > maxW && line){ lines.push(line); line = word } else line = t }
    if(line) lines.push(line)
    return lines
}

const rgba = (hex, a) => { const c = parseInt(hex.slice(1), 16); return `rgba(${c >> 16},${(c >> 8) & 255},${c & 255},${a})` }

// text with a chromatic split: cyan and magenta ghosts either side of white
function splitText(g, text, x, y, off, accent = '#00e5ff', pink = '#ff3dcb')
{
    g.fillStyle = rgba(accent, 0.9); g.fillText(text, x - off, y)
    g.fillStyle = rgba(pink, 0.9); g.fillText(text, x + off, y)
    g.fillStyle = '#ffffff'; g.fillText(text, x, y)
}

function hexPath(g, cx, cy, r, rot = Math.PI / 6)
{
    g.beginPath()
    for(let i = 0; i < 6; i++){ const a = rot + i * TAU / 6; g[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r) }
    g.closePath()
}

function hexGrid(g, w, h, size, stroke)
{
    const hh = size * Math.sqrt(3); g.strokeStyle = stroke; g.lineWidth = 1.2
    for(let col = -1; col * size * 1.5 < w + size * 2; col++) for(let row = -1; row * hh < h + hh; row++)
    {
        const cx = col * size * 1.5, cy = row * hh + (col & 1 ? hh / 2 : 0)
        hexPath(g, cx, cy, size, 0); g.stroke()
    }
}

// polygon with two cut corners (top-left and bottom-right)
function cutPath(g, x, y, w, h, c)
{
    g.beginPath(); g.moveTo(x + c, y); g.lineTo(x + w, y); g.lineTo(x + w, y + h - c); g.lineTo(x + w - c, y + h); g.lineTo(x, y + h); g.lineTo(x, y + c); g.closePath()
}

// the shared look: deep gradient, hex grid, colored glows, cut-corner neon frame with corner brackets
function panelArt(g, w, h, accent, accent2 = '#ff3dcb')
{
    const u = h / 900
    const bg = g.createLinearGradient(0, 0, w * 0.3, h); bg.addColorStop(0, '#060917'); bg.addColorStop(1, '#0e1430')
    g.fillStyle = bg; g.fillRect(0, 0, w, h)
    let r = g.createRadialGradient(w * 0.12, h * 0.15, 0, w * 0.12, h * 0.15, w * 0.6); r.addColorStop(0, rgba(accent, 0.22)); r.addColorStop(1, rgba(accent, 0))
    g.fillStyle = r; g.fillRect(0, 0, w, h)
    r = g.createRadialGradient(w * 0.95, h * 0.95, 0, w * 0.95, h * 0.95, w * 0.55); r.addColorStop(0, rgba(accent2, 0.2)); r.addColorStop(1, rgba(accent2, 0))
    g.fillStyle = r; g.fillRect(0, 0, w, h)
    hexGrid(g, w, h, 34 * u, rgba(accent, 0.075))
    g.fillStyle = 'rgba(255,255,255,0.03)'; for(let y = 0; y < h; y += 5 * u) g.fillRect(0, y, w, 1.5 * u)
    const m = 16 * u, c = 46 * u
    g.save(); g.shadowColor = accent; g.shadowBlur = 26 * u; g.strokeStyle = accent; g.lineWidth = 5 * u
    cutPath(g, m, m, w - m * 2, h - m * 2, c); g.stroke(); g.restore()
    g.strokeStyle = rgba(accent2, 0.75); g.lineWidth = 2 * u; cutPath(g, m + 12 * u, m + 12 * u, w - m * 2 - 24 * u, h - m * 2 - 24 * u, c - 6 * u); g.stroke()
    g.strokeStyle = accent2; g.lineWidth = 5 * u; g.lineCap = 'square'
    const b = 46 * u, ix = w - m - 8 * u, iy = m + 8 * u
    g.beginPath(); g.moveTo(ix - b, iy); g.lineTo(ix, iy); g.lineTo(ix, iy + b); g.stroke()
    const jx = m + 8 * u, jy = h - m - 8 * u
    g.beginPath(); g.moveTo(jx, jy - b); g.lineTo(jx, jy); g.lineTo(jx + b, jy); g.stroke()
}

// ---------------------------------------------------------------- the About hologram
function aboutStatic(g, w, h, ch)
{
    panelArt(g, w, h, ch.accent)
    const u = h / 982, m = 60 * u
    g.textBaseline = 'alphabetic'; g.textAlign = 'left'
    g.font = MONO(22 * u); g.fillStyle = rgba(ch.accent, 0.85); g.fillText('ARJAN.KHADKA  //  PROFILE.DAT', m + 20 * u, m + 30 * u)
    g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillText('SYS ONLINE', w - m - 50 * u, m + 30 * u)
    // avatar: layered hexagons around the monogram
    const ax = w * 0.155, ay = h * 0.4, R = h * 0.19
    let gr = g.createRadialGradient(ax, ay, 0, ax, ay, R * 1.7); gr.addColorStop(0, rgba(ch.accent, 0.35)); gr.addColorStop(1, rgba(ch.accent, 0))
    g.fillStyle = gr; g.fillRect(ax - R * 2, ay - R * 2, R * 4, R * 4)
    g.save(); g.shadowColor = ch.accent; g.shadowBlur = 30 * u; g.strokeStyle = ch.accent; g.lineWidth = 6 * u; hexPath(g, ax, ay, R); g.stroke(); g.restore()
    gr = g.createLinearGradient(ax - R, ay - R, ax + R, ay + R); gr.addColorStop(0, '#1b2a6b'); gr.addColorStop(1, '#0a0f2a')
    g.fillStyle = gr; hexPath(g, ax, ay, R * 0.92); g.fill()
    g.strokeStyle = rgba('#ff3dcb', 0.8); g.lineWidth = 2.5 * u; hexPath(g, ax, ay, R * 0.82); g.stroke()
    // stat tiles (numbers are live)
    const tw = (w - m * 2 - 40 * u - 3 * 22 * u) / 4, ty = h * 0.7, th = h * 0.2
    ch.stats.forEach((s, i) =>
    {
        const x = m + 20 * u + i * (tw + 22 * u)
        g.fillStyle = 'rgba(255,255,255,0.05)'; cutPath(g, x, ty, tw, th, 22 * u); g.fill()
        g.fillStyle = ch.accent; g.fillRect(x, ty + 22 * u, 6 * u, th - 22 * u)
        g.strokeStyle = rgba(ch.accent, 0.5); g.lineWidth = 1.5 * u; cutPath(g, x, ty, tw, th, 22 * u); g.stroke()
        g.fillStyle = '#aeb6e8'; g.font = BODY(21 * u); g.textAlign = 'left'
        wrapLines(g, s.t, tw - 40 * u).slice(0, 2).forEach((ln, k) => g.fillText(ln, x + 26 * u, ty + th * 0.68 + k * 26 * u))
    })
}

function aboutLive(st, g, w, h, ch, t, active)
{
    const u = h / 982, m = 60 * u
    g.drawImage(st, 0, 0)
    g.textBaseline = 'alphabetic'
    // avatar: orbit ring, monogram
    const ax = w * 0.155, ay = h * 0.4, R = h * 0.19
    g.save(); g.translate(ax, ay); g.rotate(t * 0.6); g.strokeStyle = rgba(ch.accent, 0.9); g.lineWidth = 3 * u
    for(let i = 0; i < 3; i++){ g.beginPath(); g.arc(0, 0, R * 1.14, i * TAU / 3, i * TAU / 3 + 1.05); g.stroke() }
    g.rotate(-t * 1.5); g.strokeStyle = rgba('#ff3dcb', 0.9); g.beginPath(); g.arc(0, 0, R * 1.24, 0, 0.6); g.stroke(); g.beginPath(); g.arc(0, 0, R * 1.24, Math.PI, Math.PI + 0.6); g.stroke(); g.restore()
    g.textAlign = 'center'; g.font = HEAD(R * 0.95); splitText(g, 'AK', ax, ay + R * 0.33, 4 * u)
    // name with chromatic split; brief horizontal glitch slices
    const nx = w * 0.32, nw = w - nx - m - 40 * u
    g.textAlign = 'left'
    const px = fit(g, owner.name.toUpperCase(), HEAD, nw, h * 0.15)
    const glitching = (t % 4.2) < 0.16
    const ny = h * 0.3
    if(glitching)
    {
        g.save()
        for(let i = 0; i < 3; i++)
        {
            const y0 = ny - px * 0.95 + i * px * 0.36, off = (Math.sin(t * 91 + i * 7) * 22 + (i - 1) * 8) * u
            g.save(); g.beginPath(); g.rect(nx - 40, y0, nw + 80, px * 0.36); g.clip(); g.font = HEAD(px); splitText(g, owner.name.toUpperCase(), nx + off, ny, 6 * u); g.restore()
        }
        g.restore()
    }
    else { g.font = HEAD(px); splitText(g, owner.name.toUpperCase(), nx, ny, (2.5 + Math.sin(t * 2) * 1.2) * u) }
    // role line, typed then held, with a blinking cursor
    const role = 'STUDENT  //  BUILDER  //  ORGANIZER', n = Math.min(role.length, Math.floor((t * 22) % (role.length + 40)))
    g.font = MONO(34 * u); g.fillStyle = ch.accent; g.fillText(role.slice(0, n) + (Math.floor(t * 2) % 2 ? '_' : ''), nx, h * 0.385)
    // tagline with a sweeping highlight
    g.font = `italic ${BODY(38 * u)}`; g.fillStyle = '#e9e4ff'; const tag = 'my goal: minimize structural violence', tw0 = g.measureText(tag).width
    g.fillText(tag, nx, h * 0.47)
    const sweep = ((t * 0.5) % 1.6 - 0.3) * tw0
    g.save(); g.beginPath(); g.rect(nx + sweep, h * 0.47 - 44 * u, 90 * u, 60 * u); g.clip(); g.fillStyle = '#ffffff'; g.shadowColor = ch.accent; g.shadowBlur = 16 * u; g.fillText(tag, nx, h * 0.47); g.restore()
    const ug = g.createLinearGradient(nx, 0, nx + tw0, 0); ug.addColorStop(0, ch.accent); ug.addColorStop(1, '#ff3dcb')
    g.fillStyle = ug; g.fillRect(nx, h * 0.47 + 12 * u, tw0, 4 * u)
    // pills
    let px0 = nx; const py = h * 0.545, ph = 44 * u
    const pill = (text, color, dot) =>
    {
        g.font = MONO(24 * u); const pw = g.measureText(text).width + 44 * u + (dot ? 26 * u : 0)
        g.fillStyle = rgba(color, 0.12); cutPath(g, px0, py, pw, ph, 12 * u); g.fill(); g.strokeStyle = rgba(color, 0.8); g.lineWidth = 2 * u; cutPath(g, px0, py, pw, ph, 12 * u); g.stroke()
        if(dot){ g.fillStyle = rgba(color, 0.55 + 0.45 * Math.sin(t * 4)); g.beginPath(); g.arc(px0 + 22 * u, py + ph / 2, 7 * u, 0, TAU); g.fill() }
        g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(text, px0 + (dot ? 40 : 22) * u, py + ph * 0.68); px0 += pw + 16 * u
    }
    pill('PARIS, TX', ch.accent); pill('CLASS OF 2027', '#ff3dcb'); pill('OPEN TO WORK', '#4dff88', true)
    // stat numbers count up whenever the screen has just been focused
    const tw = (w - m * 2 - 40 * u - 3 * 22 * u) / 4, ty = h * 0.7, th = h * 0.2
    const k = 1 - Math.pow(1 - Math.min(1, (t - active) / 2.2), 3)
    ch.stats.forEach((s, i) =>
    {
        const x = m + 20 * u + i * (tw + 22 * u)
        g.textAlign = 'left'; g.fillStyle = '#fff'; g.shadowColor = ch.accent; g.shadowBlur = 14 * u
        const val = (s.pre ?? '') + Math.round(s.n * k).toLocaleString('en-US') + (s.suf ?? '+')
        fit(g, '500,000+', HEAD, tw - 50 * u, th * 0.36); g.fillText(val, x + 26 * u, ty + th * 0.4); g.shadowBlur = 0
    })
    // marquee under the tiles and a scan line over everything
    g.font = MONO(22 * u); const mq = 'PARIS HS 2027  //  MANTIS AI @ MIT CSAIL  //  TEXAS CRIME STOPPERS AMBASSADOR  //  PROJECT HOPE.SERVE  //  OLYMPIADS DEMOCRATIZED  //  ', mw = g.measureText(mq).width
    g.fillStyle = rgba(ch.accent, 0.7); for(let x = -((t * 90 * u) % mw); x < w; x += mw) g.fillText(mq, x, h * 0.955)
    const sy = ((t * 0.25) % 1.3 - 0.15) * h, sg = g.createLinearGradient(0, sy - 60 * u, 0, sy + 60 * u)
    sg.addColorStop(0, 'rgba(0,229,255,0)'); sg.addColorStop(0.5, 'rgba(0,229,255,0.16)'); sg.addColorStop(1, 'rgba(0,229,255,0)')
    g.fillStyle = sg; g.fillRect(0, sy - 60 * u, w, 120 * u)
}

// ---------------------------------------------------------------- the other posters
function drawPoster(g, w, h, def, kicker)
{
    panelArt(g, w, h, def.accent)
    const [title, ...rest] = def.poster, u = h / 900, m = w * 0.1
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'
    g.fillStyle = def.accent; g.fillRect(m - 22 * u, h * 0.14, 6 * u, h * 0.72)                       // spine
    if(kicker){ g.font = MONO(h * 0.055); g.fillStyle = rgba(def.accent, 0.95); g.fillText(`▮ ${kicker}`, m, h * 0.17) }
    const px = fit(g, title, HEAD, w - m * 2, h * 0.19)
    g.font = HEAD(px); splitText(g, title, m, h * (kicker ? 0.36 : 0.32), 3 * u, def.accent)
    g.fillStyle = '#dcd8ff'
    rest.forEach((line, i) => { fit(g, line, BODY, w - m * 2 - 26 * u, h * 0.1); g.fillStyle = def.accent; g.fillText('▸', m, h * (0.53 + i * 0.14)); g.fillStyle = '#dcd8ff'; g.fillText(line, m + 30 * u, h * (0.53 + i * 0.14)) })
}

// sidewalk chalkboard: slate, wooden frame, chalk lettering
function drawChalk(g, w, h)
{
    const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#22302c'); bg.addColorStop(1, '#1a2522')
    g.fillStyle = bg; g.fillRect(0, 0, w, h)
    for(let i = 0; i < 260; i++){ g.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, Math.random() * 26 + 4, 0, 6.3); g.fill() } // chalk dust
    g.lineWidth = w * 0.02; g.strokeStyle = '#8a5a2b'; g.strokeRect(0, 0, w, h)
    const m = w * 0.1
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#f4f0d8'
    fit(g, 'ARTICLES', CHALK, w - m * 2, h * 0.16); g.fillText('ARTICLES', w / 2, h * 0.2)
    g.strokeStyle = '#ffd84a'; g.lineWidth = w * 0.012; g.lineCap = 'round'
    g.beginPath(); g.moveTo(m, h * 0.25); g.bezierCurveTo(w * 0.35, h * 0.27, w * 0.6, h * 0.23, w - m, h * 0.25); g.stroke()
    g.fillStyle = '#9fe8ff'; fit(g, 'fresh off the press', CHALK, w - m * 2, h * 0.07); g.fillText('fresh off the press', w / 2, h * 0.33)
    const rows = [['written by me', '#ffd0f0'], ['AI · school · debate', '#f4f0d8'], ['written about me', '#ffd0f0'], ['National Merit · Carson', '#f4f0d8']]
    rows.forEach(([t, c], i) => { g.fillStyle = c; fit(g, t, CHALK, w - m * 2, h * 0.075); g.fillText(t, w / 2, h * (0.46 + i * 0.13)) })
    g.fillStyle = '#ffd84a'; fit(g, '▸ tap to read', CHALK, w - m * 2, h * 0.075); g.fillText('▸ tap to read', w / 2, h * 0.94)
}

// arcade cabinet attract mode
function drawArcade(g, w, h, t)
{
    g.fillStyle = '#05060f'; g.fillRect(0, 0, w, h)
    const sky = g.createLinearGradient(0, h * 0.5, 0, h); sky.addColorStop(0, 'rgba(255,61,203,0)'); sky.addColorStop(1, 'rgba(255,61,203,0.35)')
    g.fillStyle = sky; g.fillRect(0, h * 0.5, w, h * 0.5)
    g.strokeStyle = 'rgba(0,229,255,0.55)'; g.lineWidth = 2 // scrolling perspective grid
    const hz = h * 0.55
    for(let i = -8; i <= 8; i++){ g.beginPath(); g.moveTo(w / 2 + i * 8, hz); g.lineTo(w / 2 + i * w * 0.14, h); g.stroke() }
    for(let k = 0; k < 8; k++){ const y = hz + ((k + (t * 0.8) % 1) / 8) ** 2 * (h - hz); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() }
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'
    fit(g, 'ARJAN ARCADE', HEAD, w * 0.86, h * 0.15); g.save(); g.shadowColor = '#ff3dcb'; g.shadowBlur = 22; g.fillStyle = '#fff'; g.fillText('ARJAN ARCADE', w / 2, h * 0.22); g.restore()
    g.fillStyle = '#00e5ff'; g.font = MONO(h * 0.055); g.fillText('SHELL SHOCKERS  ·  BAND  ·  VEX', w / 2, h * 0.33)
    if(Math.floor(t * 2) % 2 === 0){ g.fillStyle = '#ffd84a'; g.font = MONO(h * 0.085); g.fillText('PRESS START', w / 2, h * 0.62) }
    g.fillStyle = '#b7bde6'; g.font = MONO(h * 0.045); g.fillText('click the screen to play', w / 2, h * 0.74)
    g.fillStyle = 'rgba(255,255,255,0.05)'; for(let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1)
    g.strokeStyle = '#ff3dcb'; g.lineWidth = 5; g.strokeRect(3, 3, w - 6, h - 6)
}

// the ON AIR light doubles as the contact screen
function drawOnAir(g, w, h, t)
{
    panelArt(g, w, h, '#ff2f4d', '#ff8a3d')
    const u = h / 560
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'
    g.fillStyle = `rgba(255,47,77,${0.55 + 0.45 * Math.sin(t * 3)})`; g.beginPath(); g.arc(w * 0.5, h * 0.26, h * 0.09, 0, TAU); g.fill()
    g.save(); g.shadowColor = '#ff2f4d'; g.shadowBlur = 20; g.fillStyle = '#fff'; fit(g, 'ON AIR', HEAD, w * 0.7, h * 0.2); g.fillText('ON AIR', w / 2, h * 0.6); g.restore()
    g.fillStyle = '#ffb3bd'; g.font = MONO(30 * u); g.fillText('▸ CONTACT', w / 2, h * 0.78)
}

// ---------------------------------------------------------------- the vending machine's selection UI
function bottleIcon(g, cx, cy, s, color, lit)
{
    g.save(); g.translate(cx, cy); g.scale(s, s)
    g.beginPath(); g.moveTo(-8, -46); g.lineTo(8, -46); g.lineTo(8, -34); g.bezierCurveTo(8, -26, 24, -22, 24, -6); g.lineTo(24, 40); g.quadraticCurveTo(24, 48, 16, 48); g.lineTo(-16, 48); g.quadraticCurveTo(-24, 48, -24, 40); g.lineTo(-24, -6); g.bezierCurveTo(-24, -22, -8, -26, -8, -34); g.closePath()
    g.fillStyle = rgba(color, lit ? 0.75 : 0.45); g.shadowColor = color; g.shadowBlur = lit ? 26 : 8; g.fill(); g.shadowBlur = 0
    g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.stroke()
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(-24, -4, 48, 28); g.fillStyle = color; g.fillRect(-24, 2, 48, 6)
    g.restore()
}

function drawVending(g, w, h, t, v)
{
    const u = h / 1057
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#04141a'); bg.addColorStop(1, '#0a2a2e')
    g.fillStyle = bg; g.fillRect(0, 0, w, h)
    hexGrid(g, w, h, 30 * u, 'rgba(77,255,161,0.06)')
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'
    g.font = HEAD(96 * u); g.save(); g.shadowColor = '#4dffa1'; g.shadowBlur = 24 * u; splitText(g, 'DRINKS', w / 2, h * 0.115, 4 * u, '#4dffa1', '#38b6ff'); g.restore()
    g.font = MONO(30 * u); g.fillStyle = Math.floor(t * 2) % 2 || v.phase !== 'idle' ? '#9fe8ff' : '#4dffa1'
    g.fillText(v.phase === 'idle' ? 'SELECT A BOTTLE' : v.phase === 'busy' ? 'PLEASE WAIT' : 'THANK YOU', w / 2, h * 0.17)
    FLAVORS.forEach((f, i) =>
    {
        const r = tileRect(i), x = r.x0 * w, y = r.y0 * h, tw = (r.x1 - r.x0) * w, th = (r.y1 - r.y0) * h
        const lit = v.hover === i || v.pick === i
        g.fillStyle = rgba(f.color, lit ? 0.22 : 0.07); cutPath(g, x, y, tw, th, 26 * u); g.fill()
        g.save(); g.shadowColor = f.color; g.shadowBlur = lit ? 26 * u : 6 * u; g.strokeStyle = rgba(f.color, lit ? 1 : 0.6); g.lineWidth = (lit ? 5 : 3) * u; cutPath(g, x, y, tw, th, 26 * u); g.stroke(); g.restore()
        bottleIcon(g, x + tw / 2, y + th * 0.42 + (v.pick === i ? Math.sin(t * 14) * 3 * u : 0), th / 240, f.color, lit)
        g.fillStyle = '#fff'; g.font = HEAD(34 * u); g.fillText(f.name.toUpperCase(), x + tw / 2, y + th * 0.9)
        g.fillStyle = f.color; g.font = MONO(22 * u); g.fillText(`0${i + 1}`, x + 34 * u, y + 44 * u)
    })
    // status bar
    const bx = w * 0.07, by = h * 0.895, bw = w * 0.86, bh = h * 0.06
    g.fillStyle = 'rgba(255,255,255,0.06)'; cutPath(g, bx, by, bw, bh, 14 * u); g.fill()
    g.textAlign = 'center'; g.font = MONO(30 * u)
    if(v.phase === 'busy')
    {
        const k = Math.min(1, (t - v.t0) / 1.6)
        g.fillStyle = '#4dffa1'; cutPath(g, bx, by, bw * k, bh, 14 * u); g.fill()
        g.fillStyle = '#04141a'; g.fillText('DISPENSING…', w / 2, by + bh * 0.68)
    }
    else { g.fillStyle = v.phase === 'done' ? '#4dffa1' : '#9fe8ff'; g.fillText(v.phase === 'done' ? 'TAKE YOUR DRINK  ▾' : 'FREE  ·  PICK ONE', w / 2, by + bh * 0.68) }
    g.fillStyle = 'rgba(255,255,255,0.04)'; for(let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1)
    g.strokeStyle = '#4dffa1'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4)
}

// ---------------------------------------------------------------- assembly
function makeScreen(mesh, draw, maxW = 1600)
{
    const info = screenInfo(mesh), cw = Math.min(maxW, Math.max(512, Math.round(info.w * 700))), ch = Math.round(cw * info.h / info.w)
    const canvas = document.createElement('canvas'); canvas.width = cw; canvas.height = ch
    const g = canvas.getContext('2d')
    const map = new THREE.CanvasTexture(canvas)
    map.flipY = false; map.encoding = THREE.sRGBEncoding; map.anisotropy = 4
    map.matrixAutoUpdate = false; map.matrix.set(...uvMatrix(mesh, info), 0, 0, 1)
    mesh.material = new THREE.MeshBasicMaterial({ map })
    draw(g, cw, ch)
    map.needsUpdate = true
    return { info, g, cw, ch, map, mesh }
}

export function makePosters(byName, channels, links, getVend)
{
    const screens = [] // { id, mesh, info, primary }
    const live = []    // redrawn every so often: { every, last, fn }
    let now = 0, aboutFocus = -99

    for(const ch of channels)
    {
        const mesh = byName(ch.screen)
        if(ch.id === 'about')
        {
            const s = makeScreen(mesh, () => {}, touch ? 1000 : 1400); screens.push({ id: ch.id, primary: true, ...s })
            const st = document.createElement('canvas'); st.width = s.cw; st.height = s.ch; aboutStatic(st.getContext('2d'), s.cw, s.ch, ch)
            live.push({ every: touch ? 1 / 8 : 1 / 14, last: -1, fn: (t) => { aboutLive(st, s.g, s.cw, s.ch, ch, t, aboutFocus); s.map.needsUpdate = true } })
        }
        else if(ch.style === 'chalk') screens.push({ id: ch.id, primary: true, ...makeScreen(mesh, (g, w, h) => drawChalk(g, w, h)) })
        else if(ch.style === 'arcade')
        {
            const s = makeScreen(mesh, (g, w, h) => drawArcade(g, w, h, 0)); screens.push({ id: ch.id, primary: true, ...s })
            live.push({ every: 1 / 12, last: -1, fn: (t) => { drawArcade(s.g, s.cw, s.ch, t); s.map.needsUpdate = true } })
        }
        else if(ch.style === 'onair')
        {
            const s = makeScreen(mesh, (g, w, h) => drawOnAir(g, w, h, 0)); screens.push({ id: ch.id, primary: true, ...s })
            live.push({ every: 1 / 12, last: -1, fn: (t) => { drawOnAir(s.g, s.cw, s.ch, t); s.map.needsUpdate = true } })
        }
        else if(ch.style === 'vending')
        {
            const s = makeScreen(mesh, (g, w, h) => drawVending(g, w, h, 0, getVend())); screens.push({ id: ch.id, primary: true, ...s })
            live.push({ every: 1 / 15, last: -1, fn: (t) => { drawVending(s.g, s.cw, s.ch, t, getVend()); s.map.needsUpdate = true } })
        }
        else if(ch.ticker)
        {
            const s = makeScreen(mesh, (g, w, h) => panelArt(g, w, h, ch.accent)); screens.push({ id: ch.id, primary: true, ...s })
            const back = document.createElement('canvas'); back.width = s.cw; back.height = s.ch; panelArt(back.getContext('2d'), s.cw, s.ch, ch.accent)
            const text = ch.ticker.join('   ◆   ') + '   ◆   '; let width = 0
            live.push({ every: 1 / 30, last: -1, fn: (t) =>
            {
                const { g, cw: w, ch: h, map } = s, u = h / 260
                g.drawImage(back, 0, 0)
                g.textAlign = 'left'; g.textBaseline = 'alphabetic'
                g.fillStyle = rgba(ch.accent, 0.95); g.font = MONO(h * 0.12); g.fillText(`▮ ${ch.kicker}`, w * 0.04, h * 0.27)
                g.font = HEAD(h * 0.3)
                if(!width) width = g.measureText(text).width
                const off = -((t * 140) % width)
                for(let x = off; x < w; x += width) splitText(g, text, x, h * 0.72, 3 * u, ch.accent)
                map.needsUpdate = true
            } })
        }
        else screens.push({ id: ch.id, primary: true, ...makeScreen(mesh, (g, w, h) => drawPoster(g, w, h, ch, ch.kicker)) })
    }
    for(const l of links) screens.push({ id: l.id, primary: false, ...makeScreen(byName(l.screen), (g, w, h) => drawPoster(g, w, h, l, '')) })

    return {
        screens,
        primary: (id) => screens.find((s) => s.id === id && s.primary),
        update(t){ now = t; for(const l of live) if(t - l.last > l.every){ l.last = t; l.fn(t) } },
        // brighten every screen that leads to `id`
        hot(id){ for(const s of screens) s.mesh.material.color.setScalar(s.id === id ? 1.45 : 1) },
        // the About hologram counts its numbers up again whenever it is brought into focus
        focus(id){ if(id === 'about') aboutFocus = now },
    }
}
