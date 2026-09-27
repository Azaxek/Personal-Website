// Procedural food & kitchen props: glazed ceramic ramen bowls with wavy noodles and detailed toppings, a two-pot cooking
// station that sits on the counter (so ramen is made in front of the customer), a strainer basket, a ladle, a menu card,
// steam, and a pour stream. Everything is generated (no model files).
import * as THREE from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mat, phys, led, glow, lin, blob } from './mats.js'
import { COUNTER_Y, NOODLE_POT, STOCK_POT } from './stage.js'

const V3 = THREE.Vector3
const mesh = (g, m) => new THREE.Mesh(g, m)

// deterministic randomness so every bowl of the same dish looks the same
function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

function canvasTex(w, h, draw)
{
    const c = document.createElement('canvas'); c.width = w; c.height = h
    draw(c.getContext('2d'), w, h)
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8
    return t
}

// ---------------------------------------------------------------- textures (built once)
let TX
const textures = () => TX ||= {
    chashu: canvasTex(128, 128, (g, w, h) =>
    {
        const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, '#b56a52'); r.addColorStop(0.7, '#9a4e39'); r.addColorStop(0.9, '#5b2a1e'); r.addColorStop(1, '#2a120c')
        g.fillStyle = r; g.fillRect(0, 0, w, h)
        g.lineCap = 'round'; g.strokeStyle = 'rgba(250,222,210,0.55)'
        for(let i = 0; i < 6; i++){ g.lineWidth = 3 + (i % 3) * 2; g.beginPath(); g.moveTo(14 + i * 4, 30 + i * 16); g.bezierCurveTo(50, 20 + i * 14, 80, 60 + i * 8, 116 - i * 3, 40 + i * 14); g.stroke() }
    }),
    egg: canvasTex(128, 128, (g, w, h) =>
    {
        const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
        r.addColorStop(0, '#ff9508'); r.addColorStop(0.3, '#f7a51a'); r.addColorStop(0.37, '#f6d58c'); r.addColorStop(0.62, '#f2e2bd'); r.addColorStop(0.9, '#d6b477'); r.addColorStop(1, '#a9783b')
        g.fillStyle = r; g.fillRect(0, 0, w, h)
    }),
    naruto: canvasTex(128, 128, (g, w, h) =>
    {
        g.fillStyle = '#f7f1e6'; g.fillRect(0, 0, w, h)
        g.strokeStyle = '#ee7f9b'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath()
        for(let a = 0.3; a < 4 * Math.PI; a += 0.08){ const rr = 3 + a * 4.6; g.lineTo(64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr) }
        g.stroke(); g.strokeStyle = '#ee7f9b'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 58, 0, 6.3); g.stroke()
    }),
}

// ---------------------------------------------------------------- noodles: one shared geometry of wavy strands
let NOODLES
function noodleGeometry()
{
    if(NOODLES) return NOODLES
    const rand = rng(11), geos = []
    for(let i = 0; i < 46; i++)
    {
        const r0 = 0.02 + rand() * 0.16, th0 = rand() * 6.283, span = 0.9 + rand() * 2.6, dir = rand() < 0.5 ? -1 : 1, layer = Math.floor(rand() * 4), wob = 7 + rand() * 6
        const pts = []
        for(let k = 0; k <= 22; k++)
        {
            const t = k / 22, th = th0 + dir * span * t
            const rr = Math.min(0.185, Math.max(0.012, r0 + Math.sin(t * wob + i) * 0.007 + (t - 0.5) * (rand() - 0.5) * 0.04))
            const dome = 0.022 * (1 - (rr / 0.19) ** 2)
            pts.push(new V3(Math.cos(th) * rr, 0.152 + dome + layer * 0.0045 + Math.sin(t * wob * 1.7 + i * 2) * 0.004, Math.sin(th) * rr))
        }
        geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 44, 0.0058, 5, false))
    }
    return NOODLES = mergeBufferGeometries(geos)
}
const noodleMat = () => phys('#f0d48c', { roughness: 0.5, clearcoat: 0.25 })

// ---------------------------------------------------------------- toppings
let TM
const tm = () => TM ||= {
    brown: mat('#3b1d13', { roughness: 0.6 }),
    white: phys('#eee2c2', { roughness: 0.25, clearcoat: 0.5 }),
    nori: mat('#0e2418', { roughness: 0.38, metalness: 0.15, side: THREE.DoubleSide }),
    green: mat('#5fd056', { roughness: 0.45, emissive: lin('#14421a'), emissiveIntensity: 0.6 }),
    corn: phys('#ffcf3a', { roughness: 0.3, clearcoat: 0.7 }),
    chili: phys('#d2261b', { roughness: 0.3, clearcoat: 0.6 }),
    menma: mat('#c99f5c', { roughness: 0.5 }),
    holo: led('#ffd84a', 2.8, '#3a2a00'),
    holoRing: glow('#00e5ff', 2.4),
}

const disc = (r, h, capTex, sideMat) =>
{
    const capMat = new THREE.MeshStandardMaterial({ map: capTex, roughness: 0.45 })
    return mesh(new THREE.CylinderGeometry(r, r, h, 28), [sideMat, capMat, sideMat])
}

const TOPPINGS = {
    chashu: () =>
    {
        const T = textures(), M = tm(), g = new THREE.Group()
        for(let i = 0; i < 2; i++)
        {
            const s = disc(0.075, 0.015, T.chashu, M.brown); s.position.set(i * 0.03, i * 0.008, i * -0.04); s.rotation.set(-1.05 + i * 0.12, i * 0.5, 0); g.add(s)
        }
        return g
    },
    egg: () =>
    {
        const T = textures(), M = tm(), g = new THREE.Group()
        for(const z of [-0.048, 0.048])
        {
            const half = new THREE.Group(); half.position.z = z; half.rotation.y = z * 4
            const dome = mesh(new THREE.SphereGeometry(0.045, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.white); dome.scale.set(1.15, 0.85, 0.95); half.add(dome)
            const face = mesh(new THREE.CircleGeometry(0.045, 26), new THREE.MeshStandardMaterial({ map: T.egg, roughness: 0.3 })); face.rotation.x = -Math.PI / 2; face.scale.set(1.15, 0.95, 1); half.add(face)
            half.rotation.x = 0.35; g.add(half)
        }
        return g
    },
    naruto: () =>
    {
        const T = textures(), g = new THREE.Group()
        const rim = mat('#ee7f9b', { roughness: 0.4 })
        for(let i = 0; i < 2; i++){ const s = disc(0.05, 0.008, T.naruto, rim); s.position.set(i * 0.035, i * 0.006, i * 0.02); s.rotation.set(-0.95 + i * 0.15, i * 0.7, 0); g.add(s) }
        return g
    },
    nori: () =>
    {
        const M = tm(), g = new THREE.Group()
        const geo = new THREE.PlaneGeometry(0.115, 0.15, 6, 8), p = geo.attributes.position
        for(let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 40) * 0.004 + p.getY(i) * 0.05)
        geo.computeVertexNormals()
        const sheet = mesh(geo, M.nori); sheet.position.y = 0.07; sheet.rotation.set(-0.25, 0.2, 0.05); g.add(sheet)
        return g
    },
    scallion: () =>
    {
        const M = tm(), rand = rng(5), geos = []
        for(let i = 0; i < 34; i++)
        {
            const t = new THREE.TorusGeometry(0.0095, 0.0026, 5, 10)
            t.rotateX(rand() * 3.1); t.rotateY(rand() * 3.1); t.translate((rand() - 0.5) * 0.13, rand() * 0.012, (rand() - 0.5) * 0.13)
            geos.push(t)
        }
        return mesh(mergeBufferGeometries(geos), M.green)
    },
    corn: () =>
    {
        const M = tm(), rand = rng(9), geos = []
        for(let i = 0; i < 16; i++){ const k = new THREE.SphereGeometry(0.0125, 8, 6); k.scale(1, 0.85, 1); k.translate((rand() - 0.5) * 0.1, rand() * 0.02, (rand() - 0.5) * 0.1); geos.push(k) }
        return mesh(mergeBufferGeometries(geos), M.corn)
    },
    pepper: () =>
    {
        const M = tm(), rand = rng(3), geos = []
        for(let i = 0; i < 9; i++)
        {
            const c = new THREE.CatmullRomCurve3([new V3(0, 0, 0), new V3(0.03, 0.012, (rand() - 0.5) * 0.03), new V3(0.055, 0.004, (rand() - 0.5) * 0.06)])
            const t = new THREE.TubeGeometry(c, 8, 0.0028, 4); t.rotateY(rand() * 6.28); t.translate((rand() - 0.5) * 0.07, 0, (rand() - 0.5) * 0.07); geos.push(t)
        }
        return mesh(mergeBufferGeometries(geos), M.chili)
    },
    menma: () =>
    {
        const M = tm(), rand = rng(21), geos = []
        for(let i = 0; i < 7; i++){ const b = new THREE.BoxGeometry(0.034, 0.008, 0.012); b.rotateY(rand() * 3.1); b.translate((rand() - 0.5) * 0.08, rand() * 0.012, (rand() - 0.5) * 0.08); geos.push(b) }
        return mesh(mergeBufferGeometries(geos), M.menma)
    },
    // a hovering holo-chip (available to any dish; none uses it right now)
    star: () =>
    {
        const M = tm(), g = new THREE.Group()
        const chip = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 6), M.holo); chip.position.y = 0.08
        const ring = mesh(new THREE.TorusGeometry(0.062, 0.0028, 6, 6), M.holoRing); ring.rotation.x = Math.PI / 2; chip.add(ring)
        const beam = mesh(new THREE.CylinderGeometry(0.004, 0.03, 0.08, 10, 1, true), new THREE.MeshBasicMaterial({ color: lin('#00e5ff'), transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = -0.04; chip.add(beam)
        g.add(chip); g.userData.spin = chip
        return g
    },
}

// slots on the broth, (x, z) in bowl space; -x faces the customer so slot 0 is the most visible
const SLOTS = [[-0.105, 0.03], [0.02, -0.118], [0.03, 0.115], [0.118, 0.0]]

// outer wall (foot to rim) and inner wall (rim to floor) of a ramen bowl, as (radius, height)
const OUTER = [[0.001, 0], [0.072, 0], [0.079, 0.006], [0.083, 0.02], [0.1, 0.032], [0.148, 0.075], [0.198, 0.125], [0.229, 0.178], [0.243, 0.216], [0.247, 0.225], [0.241, 0.229]]
const INNER = [[0.236, 0.226], [0.229, 0.208], [0.196, 0.15], [0.144, 0.098], [0.062, 0.062], [0.001, 0.058]]

// glazed exterior with a hand-painted meander band under the rim
function bowlGlaze(base, band)
{
    return canvasTex(1024, 256, (g, w, h) =>
    {
        const grad = g.createLinearGradient(0, h, 0, 0); grad.addColorStop(0, base); grad.addColorStop(0.7, base); grad.addColorStop(1, '#ffffff')
        g.fillStyle = base; g.fillRect(0, 0, w, h)
        g.globalAlpha = 0.16; g.fillStyle = grad; g.fillRect(0, 0, w, h); g.globalAlpha = 1
        const r = rng(4); g.fillStyle = 'rgba(0,0,0,0.05)'; for(let i = 0; i < 700; i++) g.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3)
        g.strokeStyle = band; g.lineWidth = 5; g.globalAlpha = 0.9
        for(const y of [h * 0.045, h * 0.235]){ g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() }
        const u = w / 26, top = h * 0.085, bot = h * 0.195, mid = (top + bot) / 2
        g.lineWidth = 6; g.lineJoin = 'miter'; g.beginPath(); g.moveTo(0, bot)
        for(let x = 0; x < w; x += u){ g.lineTo(x, top); g.lineTo(x + u * 0.62, top); g.lineTo(x + u * 0.62, mid); g.lineTo(x + u * 0.3, mid); g.lineTo(x + u * 0.3, bot - 2); g.lineTo(x + u, bot) }
        g.stroke(); g.globalAlpha = 1
    })
}

export function makeBowl(dish, { built = true, scale = 1 } = {})
{
    const g = new THREE.Group()
    const outer = mesh(new THREE.LatheGeometry(OUTER.map(([r, y]) => new THREE.Vector2(r, y)), 56), new THREE.MeshPhysicalMaterial({ map: bowlGlaze(dish.bowl, dish.band), roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.14, envMapIntensity: 0.9 }))
    const inner = mesh(new THREE.LatheGeometry(INNER.map(([r, y]) => new THREE.Vector2(r, y)), 56), phys('#e9dfc8', { roughness: 0.36, clearcoatRoughness: 0.2, clearcoat: 0.8, envMapIntensity: 0.35, side: THREE.DoubleSide }))
    g.add(outer, inner)

    // broth: dished surface with an oil sheen, tinted toward realistic browns
    const tint = '#' + new THREE.Color(dish.broth).lerp(new THREE.Color('#7a5028'), 0.3).getHexString()
    const bg = new THREE.CircleGeometry(0.207, 56), bp = bg.attributes.position
    for(let i = 0; i < bp.count; i++){ const r = Math.hypot(bp.getX(i), bp.getY(i)) / 0.207; bp.setZ(i, r ** 4 * 0.012) }
    bg.computeVertexNormals()
    const broth = new THREE.Group()
    const surface = mesh(bg, phys(tint, { roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 })); surface.rotation.x = -Math.PI / 2; broth.add(surface)
    const rand = rng(17)
    for(let i = 0; i < 11; i++)
    {
        const o = mesh(new THREE.CircleGeometry(0.01 + rand() * 0.02, 14), new THREE.MeshStandardMaterial({ color: lin(tint).multiplyScalar(1.9), roughness: 0.03, transparent: true, opacity: 0.4, depthWrite: false }))
        const a = rand() * 6.28, rr = rand() * 0.17; o.rotation.x = -Math.PI / 2; o.position.set(Math.cos(a) * rr, 0.0015, Math.sin(a) * rr); broth.add(o)
    }
    broth.position.y = 0.147; g.add(broth)

    const noodles = mesh(noodleGeometry(), noodleMat()); g.add(noodles)

    const toppings = dish.toppings.map((name, i) =>
    {
        const t = TOPPINGS[name](), [x, z] = SLOTS[i], rr = new THREE.Group()
        rr.position.set(x, 0.198, z); rr.scale.setScalar(1); rr.rotation.y = (rng(i * 13 + name.length)() - 0.5) * 1.6
        rr.add(t); g.add(rr); return rr
    })

    g.userData = { broth, noodles, toppings }
    g.scale.setScalar(scale)
    if(!built) [broth, noodles, ...toppings].forEach((p) => p.scale.setScalar(0.0001))
    return g
}

// ---------------------------------------------------------------- steam: soft puffs that rise and fade
let puffTex
export class Steam
{
    constructor(height = 0.6, count = 9, size = 0.22)
    {
        puffTex ||= (() =>
        {
            const c = document.createElement('canvas'); c.width = c.height = 64
            const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
            gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
            g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c)
        })()
        this.group = new THREE.Group(); this.height = height; this.size = size; this.intensity = 0
        this.puffs = Array.from({ length: count }, (_, i) =>
        {
            const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0, color: 0xe6f6ff }))
            s.userData.seed = i / count; this.group.add(s); return s
        })
    }

    update(t)
    {
        for(const [i, s] of this.puffs.entries())
        {
            const p = (t * 0.32 + s.userData.seed) % 1
            s.position.set(Math.sin(p * 5 + i) * 0.05, p * this.height, Math.cos(p * 4 + i * 2) * 0.05)
            s.scale.setScalar(this.size * (0.5 + p))
            s.material.opacity = Math.sin(p * Math.PI) * 0.4 * this.intensity
        }
    }
}

// ---------------------------------------------------------------- the counter-top cooking station
const BURNER_H = 0.045, POT_H = 0.34
export const RIM_Y = COUNTER_Y + BURNER_H + POT_H     // world height of both pot rims
export const WATER_Y = RIM_Y - 0.05                   // world height of the liquid surfaces

// One pot on a compact induction burner. `bubbles` = a rolling boil.
function makePot(spot, { bubbles, liquid, r = 0.27 })
{
    const g = new THREE.Group(); g.position.set(spot.x, COUNTER_Y, spot.z)
    const steel = mat('#c9d2e2', { roughness: 0.3, metalness: 1, envMapIntensity: 1.6, side: THREE.DoubleSide }), dark = mat('#171923', { roughness: 0.5, metalness: 0.8 })
    const burner = mesh(new THREE.BoxGeometry(0.74, BURNER_H, 0.74), dark); burner.position.y = BURNER_H / 2; g.add(burner)
    const ring = mesh(new THREE.TorusGeometry(r * 0.78, 0.007, 8, 40), glow('#ff9a3d', 2.2)); ring.rotation.x = Math.PI / 2; ring.position.y = BURNER_H + 0.002; g.add(ring)
    const pot = new THREE.Group(); pot.position.y = BURNER_H; g.add(pot)
    const wall = mesh(new THREE.CylinderGeometry(r * 1.06, r, POT_H, 40, 1, true), steel); wall.position.y = POT_H / 2; pot.add(wall)
    const bottom = mesh(new THREE.CylinderGeometry(r, r, 0.02, 40), steel); bottom.position.y = 0.01; pot.add(bottom)
    const rim = mesh(new THREE.TorusGeometry(r * 1.06, 0.014, 8, 44), steel); rim.rotation.x = Math.PI / 2; rim.position.y = POT_H; pot.add(rim)
    for(const s of [-1, 1]){ const h = mesh(new THREE.TorusGeometry(0.05, 0.011, 6, 12), steel); h.position.set(0, POT_H * 0.85, s * (r * 1.06 + 0.03)); pot.add(h) }
    const surface = mesh(new THREE.CircleGeometry(r * 1.02, 40), phys(liquid, { roughness: 0.12, clearcoat: 1 })); surface.rotation.x = -Math.PI / 2; surface.position.y = POT_H - 0.05; pot.add(surface)
    const foam = []
    if(bubbles) for(let i = 0; i < 16; i++)
    {
        const m = mesh(new THREE.CircleGeometry(0.018 + Math.random() * 0.02, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false }))
        const a = Math.random() * 6.28, rr = Math.random() * r * 0.9
        m.rotation.x = -Math.PI / 2; m.position.set(Math.cos(a) * rr, POT_H - 0.047, Math.sin(a) * rr); m.userData.seed = Math.random() * 6.28; pot.add(m); foam.push(m)
    }
    const steam = new Steam(0.9, 12, 0.3); steam.group.position.set(0, POT_H, 0); pot.add(steam.group)
    return { group: g, steam, foam, r }
}

// world-space rest poses of the tools, chosen so a hand can take them off the pot rim
export const TOOL_REST = {
    basket: { pos: new V3(NOODLE_POT.x + 0.27, WATER_Y + 0.13, NOODLE_POT.z), dir: new V3(-0.86, -0.5, 0).normalize() },
    ladle: { pos: new V3(STOCK_POT.x + 0.27, WATER_Y + 0.13, STOCK_POT.z), dir: new V3(-0.86, -0.5, 0).normalize() },
}

export function makeStation()
{
    const g = new THREE.Group()
    const noodlePot = makePot(NOODLE_POT, { bubbles: true, liquid: '#b9d6e6' })
    const stockPot = makePot(STOCK_POT, { liquid: '#c8893a' })
    g.add(noodlePot.group, stockPot.group)
    noodlePot.steam.intensity = 0.55; stockPot.steam.intensity = 0.4

    const steel = mat('#cfd6e4', { roughness: 0.2, metalness: 1, envMapIntensity: 1.6 })
    const grip = () => mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.13, 12), led('#00e5ff', 1.6, '#0a1a20'))
    // cups open toward local -x (so a tilted tool holds liquid); tools hang along local -y from the grip at the origin
    const cup = (r, material) =>
    {
        const c = mesh(new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), material); c.rotation.z = Math.PI / 2
        return c
    }

    const ladle = new THREE.Group()
    const shaft = mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.34, 10), steel); shaft.position.y = -0.17; ladle.add(shaft)
    const lg = grip(); lg.position.y = -0.03; ladle.add(lg)
    const scoop = cup(0.06, new THREE.MeshStandardMaterial({ color: lin('#cfd6e4'), roughness: 0.2, metalness: 1, envMapIntensity: 1.6, side: THREE.DoubleSide })); scoop.position.set(-0.03, -0.35, 0); ladle.add(scoop)
    const soup = mesh(new THREE.CircleGeometry(0.056, 18), phys('#c8893a', { roughness: 0.1, clearcoat: 1 })); soup.rotation.y = -Math.PI / 2; soup.position.set(-0.03, -0.35, 0); soup.visible = false; ladle.add(soup)
    ladle.userData.soup = soup

    const basket = new THREE.Group()
    const bs = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 10), steel); bs.position.y = -0.17; basket.add(bs)
    const bg = grip(); bg.position.y = -0.03; basket.add(bg)
    const wire = cup(0.088, new THREE.MeshStandardMaterial({ color: lin('#cfd6e4'), roughness: 0.25, metalness: 1, wireframe: true })); wire.position.set(-0.035, -0.36, 0); basket.add(wire)
    const brim = mesh(new THREE.TorusGeometry(0.088, 0.005, 8, 28), steel); brim.rotation.y = Math.PI / 2; brim.position.set(-0.035, -0.36, 0); basket.add(brim)
    const ball = mesh(noodleGeometry(), noodleMat()); ball.scale.setScalar(0.46); ball.rotation.z = Math.PI / 2; ball.position.set(-0.05, -0.36, 0); basket.add(ball)
    basket.userData.noodles = ball

    g.add(ladle, basket)
    return {
        group: g, ladle, basket, noodlePot, stockPot,
        update(t)
        {
            noodlePot.steam.update(t); stockPot.steam.update(t)
            for(const m of noodlePot.foam){ const k = 0.5 + 0.5 * Math.sin(t * 5 + m.userData.seed); m.scale.setScalar(0.6 + k * 0.7); m.material.opacity = 0.25 + k * 0.4 }
        },
    }
}

// a thin stream of broth: origin at the top, length along -y is set with scale.y
export function makePour()
{
    const m = mesh(new THREE.CylinderGeometry(0.006, 0.0045, 1, 8, 1, true), new THREE.MeshStandardMaterial({ color: lin('#c8893a'), roughness: 0.1, transparent: true, opacity: 0.8, emissive: lin('#6b3d0a'), emissiveIntensity: 0.6 }))
    m.geometry.translate(0, -0.5, 0); m.visible = false
    return m
}

// ---------------------------------------------------------------- the menu card handed to the customer
export function makeMenuCard(items, title)
{
    const front = canvasTex(512, 720, (g, w, h) =>
    {
        g.fillStyle = '#0f1120'; g.fillRect(0, 0, w, h)
        g.fillStyle = 'rgba(255,255,255,0.04)'; for(let y = 0; y < h; y += 5) g.fillRect(0, y, w, 2)
        g.lineWidth = 6; g.strokeStyle = '#ff3dcb'; g.shadowColor = '#ff3dcb'; g.shadowBlur = 16; g.strokeRect(22, 22, w - 44, h - 44); g.shadowBlur = 0
        g.lineWidth = 2; g.strokeStyle = '#00e5ff'; g.strokeRect(36, 36, w - 72, h - 72)
        g.textAlign = 'center'; g.fillStyle = '#fff'; g.shadowColor = '#00e5ff'; g.shadowBlur = 14
        g.font = '900 78px "Segoe UI Black","Arial Black",sans-serif'; g.fillText('MENU', w / 2, 128); g.shadowBlur = 0
        g.font = '600 26px "Consolas","Courier New",monospace'; g.fillStyle = '#ff9be9'; g.fillText(title.toUpperCase(), w / 2, 172)
        g.textAlign = 'left'; g.font = '600 25px "Segoe UI",sans-serif'
        items.slice(0, 8).forEach((it, i) =>
        {
            const y = 236 + i * 56; g.fillStyle = '#e9e4ff'; g.fillText(it.name, 66, y)
            g.fillStyle = 'rgba(255,255,255,0.28)'; const wname = g.measureText(it.name).width; for(let x = 76 + wname; x < w - 70; x += 9) g.fillRect(x, y - 6, 3, 3)
        })
    })
    const card = new THREE.Group()
    const dark = mat('#0f1120')
    const slab = mesh(new THREE.BoxGeometry(0.24, 0.33, 0.008), [dark, dark, dark, dark, new THREE.MeshStandardMaterial({ map: front, roughness: 0.5, emissiveMap: front, emissive: 0xffffff, emissiveIntensity: 0.55 }), dark])
    slab.position.y = 0.165; card.add(slab)
    const leg = mesh(new THREE.BoxGeometry(0.16, 0.24, 0.006), dark); leg.position.set(0, 0.12, -0.05); leg.rotation.x = 0.4; card.add(leg)
    return card
}

export { blob }
