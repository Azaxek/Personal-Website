import * as THREE from 'three'
import gsap from 'gsap'
import './style.css'
import { loadShop, makeSign } from './shop.js'
import { makeChef } from './chef.js'
import { makeBowl, makeStation, makePour, makeMenuCard, Steam, TOOL_REST } from './food.js'
import { makeEnv, makeFx } from './fx.js'
import { createUI } from './ui.js'
import { owner, items, greeting } from './menu.js'
import { hub as hubDefs, channels, links } from './content.js'
import { makePosters } from './posters.js'
import { makeHub } from './hub.js'
import { drawQuote } from './quotes.js'
import { FLAVORS, TRAY, makeBottle, tileAt } from './drinks.js'
import { COUNTER_Y, FLOOR_Y, CHEF_HOME, PREP, SERVE, NOODLE_POT, MENU_REST, SHOTS } from './stage.js'

const $ = (s) => document.querySelector(s)
const canvas = $('canvas.webgl')
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (s) => new Promise((r) => gsap.delayedCall(s, r))
const V = (x, y, z) => new THREE.Vector3(x, y, z)
const B = COUNTER_Y

// ---------- sound (plays only after the first click/tap: browsers block autoplay) ----------
const sfx = Object.fromEntries(['click', 'ding', 'whoosh', 'bloop', 'cooking'].map((k) => { const a = new Audio(`sounds/${k}.mp3`); a.preload = 'auto'; return [k, a] }))
sfx.cooking.loop = true; sfx.cooking.volume = 0.3
let soundOn = true
const play = (k) => { if(!soundOn) return; sfx[k].currentTime = 0; sfx[k].play().catch(() => {}) }

// ---------- state ----------
// state: loading | intro | hub | menu | cooking | served | traveling | channel
// where: the place being shown: hub | shop | tower | news | arcade | drinks
let state = 'loading', where = 'hub', channelId = null
let menuGiven = false
let chef
const PLACES = ['shop', 'tower', 'news', 'arcade', 'drinks']
const placeOf = (id) => PLACES.includes(id) ? id : channels.find((c) => c.id === id)?.place
const channelsIn = (place) => channels.filter((c) => c.place === place)
const arcadeGame = channels.find((c) => c.id === 'arcade').entries.find((e) => e.game).game

const vend = { phase: 'idle', pick: -1, hover: -1, t0: 0 } // the vending machine's screen reads this
const ui = createUI({
    order: (i) => order(i),
    back: () => back(),
    go: (id) => go(id),
    closeMenu: () => { ui.hideMenu(); play('click') },
    hoverHub: (id) => { hubSign?.setHot(id); ui.setCaption(id) },
    talk: (v) => { if(chef) chef.talking = v },
    drink: (i) => dispense(i),
    playGame: (g) => ui.openGame(g),
    gameClosed: () => {},
})

$('#hubBtn').onclick = () => go('hub')
$('#menuBtn').onclick = () => { if(state === 'menu'){ ui.showMenu(); play('click') } }
$('#soundBtn').onclick = () => { soundOn = !soundOn; ui.setSound(soundOn); if(!soundOn) sfx.cooking.pause(); else play('click') }
$('#skipCook').onclick = () => { gsap.globalTimeline.timeScale(10); ui.hideBubble(); ui.showSkip(false) }
addEventListener('keydown', (e) =>
{
    if(e.key !== 'Escape') return
    if(ui.gameOpen){ ui.closeGame(); return }
    if(state === 'served') back()
    else if(state === 'menu' && ui.menuOpen) ui.hideMenu()
    else if(state === 'menu' || state === 'channel') go('hub')
})

// ---------- renderer / scene ----------
let renderer
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 80)
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }) } catch(err) { fallback(err) }

// lights only matter for the procedural props; the shop itself is baked. One key light casts real shadows.
scene.add(new THREE.AmbientLight('#7d74b5', 0.4))
const key = new THREE.DirectionalLight('#ffe9d2', 0.95)
key.position.set(-3.6, 1.4, -2.6); key.target.position.set(-2.0, -1.7, -1.2); scene.add(key, key.target)
key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02; key.shadow.radius = 4
Object.assign(key.shadow.camera, { left: -2.4, right: 2.4, top: 2.4, bottom: -2.4, near: 0.5, far: 12 })
const pinkL = new THREE.PointLight('#ff3dcb', 0.75, 9); pinkL.position.set(-3, -0.6, 1.5); scene.add(pinkL)
const cyanL = new THREE.PointLight('#00bbff', 0.9, 9); cyanL.position.set(-1, -0.6, -3.5); scene.add(cyanL)

let fx = null
if(renderer)
{
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
    scene.environment = makeEnv(renderer)   // neon reflections for chrome and glaze
    fx = makeFx(renderer, scene, camera)    // bloom + grade (null where unsupported)
}

// The baked counter and floor can't receive shadows, so invisible planes that only draw shadows sit on top of them.
const catcher = (w, d, x, y, z) =>
{
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.ShadowMaterial({ opacity: 0.42, depthWrite: false }))
    m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; scene.add(m)
}
catcher(1.7, 2.75, -2.15, B + 0.004, -1.35)
catcher(1.1, 2.4, -0.9, FLOOR_Y + 0.01, -1.2)
const shade = (o) => { o.traverse((c) => { if(c.isMesh){ c.castShadow = true; c.receiveShadow = true } }); return o }

chef = makeChef(); scene.add(shade(chef.root))
const station = makeStation(); scene.add(shade(station.group))
const bowlSteam = new Steam(0.55, 8, 0.2); scene.add(bowlSteam.group)
const fizz = new Steam(0.35, 9, 0.12); scene.add(fizz.group)
const pour = makePour(); scene.add(pour)
const menuCard = makeMenuCard(items, owner.short + "'s Ramen"); menuCard.rotation.y = -Math.PI / 2; menuCard.visible = false; scene.add(shade(menuCard))
let servedBowl = null, bottle = null
const DOWN = V(0, -1, 0), tL = V(0, 0, 0), tR = V(0, 0, 0)
let now = 0

// ---------- tools, carrying and hand paths ----------
// Tools follow whichever hand holds them (a hand target is the palm center), and rest on their pot rim otherwise.
const tools = { ladle: { obj: station.ladle, hand: null, dir: TOOL_REST.ladle.dir.clone() }, basket: { obj: station.basket, hand: null, dir: TOOL_REST.basket.dir.clone() } }
const carry = { c: V(0, 0, 0), obj: null, drop: 0.14 }
const tmpH = { L: V(0, 0, 0), R: V(0, 0, 0) }

function moveHand(side, pts, dur, ease = 'power2.inOut')
{
    const curve = new THREE.CatmullRomCurve3([chef.palm(side, V(0, 0, 0)), ...pts], false, 'centripetal'), s = { u: 0 }
    chef.reach(side, () => curve.getPoint(s.u, tmpH[side]), 0.12)
    return gsap.to(s, { u: 1, duration: dur, ease })
}

// Both hands hold an object by its sides while it follows a path; `drop` = hand height above the object's origin.
function carryPath(obj, pts, dur, { lateral = 0.235, drop = 0.14, ease = 'power2.inOut' } = {})
{
    const curve = new THREE.CatmullRomCurve3([obj.position.clone().add(V(0, drop, 0)), ...pts], false, 'centripetal'), s = { u: 0 }
    carry.obj = obj; carry.drop = drop; curve.getPoint(0, carry.c)
    chef.reach('L', () => tL.copy(carry.c).add(V(0, 0, lateral)), 0.15); chef.reach('R', () => tR.copy(carry.c).add(V(0, 0, -lateral)), 0.15)
    return gsap.to(s, { u: 1, duration: dur, ease, onUpdate: () => curve.getPoint(s.u, carry.c) })
}

async function grab(name, side)
{
    await moveHand(side, [TOOL_REST[name].pos.clone()], 0.45)
    tools[name].hand = side; tools[name].dir.copy(TOOL_REST[name].dir)
}
async function putBack(name, side)
{
    await moveHand(side, [TOOL_REST[name].pos.clone()], 0.5)
    tools[name].hand = null
    await chef.reach(side, null, 0.3)
}

// ---------- camera director ----------
const cam = { pos: V(0, 0, 0), look: V(0, 0, 0), fov: 44 }
const par = { x: 0, y: 0, tx: 0, ty: 0 }
let currentShot = 'seat'

// Fit a shot to the viewport. Narrow screens widen the lens; the wide named shots also pull back (close-ups can't:
// retreating lifts the camera into the hanging lamps, so they only widen).
function shotFor(s)
{
    const named = typeof s === 'string'
    if(named) s = SHOTS[s]
    const t = THREE.MathUtils.clamp((1.4 - innerWidth / innerHeight) / 0.9, 0, 1)
    const look = V(...s.look), pos = V(...s.pos)
    if(named)
    {
        pos.sub(look).multiplyScalar(1 + t * 0.8).add(look)
        pos.y -= 0.3 * t; look.y -= 0.3 * t // portrait: the sheet covers the lower half, so lift the scene
    }
    return { pos, look, fov: s.fov + t * ((named ? 60 : 72) - s.fov) }
}
function flyTo(shot, dur = 1.4, ease = 'power2.inOut', via = null)
{
    currentShot = shot
    const s = shotFor(shot)
    if(reduceMotion) dur = 0.01
    if(via) // curved path (waypoints are positions): swings around the building instead of cutting through it
    {
        const curve = new THREE.CatmullRomCurve3([cam.pos.clone(), ...via.map((p) => V(...p)), s.pos.clone()])
        const from = { look: cam.look.clone(), fov: cam.fov }, p = { t: 0 }
        return gsap.to(p, { t: 1, duration: dur, ease, onUpdate: () => { curve.getPoint(p.t, cam.pos); cam.look.lerpVectors(from.look, s.look, p.t); cam.fov = from.fov + (s.fov - from.fov) * p.t } })
    }
    return gsap.timeline()
        .to(cam.pos, { x: s.pos.x, y: s.pos.y, z: s.pos.z, duration: dur, ease }, 0)
        .to(cam.look, { x: s.look.x, y: s.look.y, z: s.look.z, duration: dur, ease }, 0)
        .to(cam, { fov: s.fov, duration: dur, ease }, 0)
}
const snapTo = (shot) => { const s = shotFor(shot); currentShot = shot; cam.pos.copy(s.pos); cam.look.copy(s.look); cam.fov = s.fov }

// Close-up of something at `at` seen from `dir`, offset so the panel (right side, or a bottom sheet on tall screens)
// doesn't cover it. `right` = the world direction that is screen-right.
function closeShot(at, dir, dist, right, { fov = 42, lift = 0.5 } = {})
{
    const aspect = innerWidth / innerHeight, tan = Math.tan(THREE.MathUtils.degToRad(fov / 2))
    const look = at.clone(), pos = at.clone().addScaledVector(dir, dist); pos.y += lift
    if(aspect > 1){ const w = 2 * dist * tan * aspect * 0.2; look.addScaledVector(right, w); pos.addScaledVector(right, w) }
    else { look.y -= 0.42; pos.y += 0.2 } // portrait: the sheet covers the lower half, so look down into the subject from above
    return { pos: pos.toArray(), look: look.toArray(), fov }
}
const bowlShot = () => closeShot(V(SERVE.x, B + 0.12, SERVE.z), V(-1, 0, 0), 1.25, V(0, 0, 1), { lift: 0.5 })
const trayShot = () => closeShot(V(TRAY.x, TRAY.y + 0.05, TRAY.z), V(0, 0, 1), 1.9, V(1, 0, 0), { lift: 0.55 })

// Camera framing for a screen: straight in front of it, shifted so the panel doesn't cover it.
function screenShot(scr, minDist = 1.8)
{
    const { center, normal, right, w, h } = scr.info, fov = 42, aspect = innerWidth / innerHeight
    const tan = Math.tan(THREE.MathUtils.degToRad(fov / 2))
    const d = Math.max(h / 0.55 / (2 * tan), w / (aspect > 1 ? 0.5 : 0.85) / (2 * tan * Math.max(aspect, 0.3)), minDist)
    const shift = aspect > 1 ? right.clone().multiplyScalar(2 * d * tan * aspect * 0.2) : V(0, -2 * d * tan * 0.2, 0)
    const look = center.clone().add(shift)
    return { pos: center.clone().addScaledVector(normal, d).add(shift).toArray(), look: look.toArray(), fov }
}

// Routes: everything on the street side (-x: signpost, shop, chalkboard) is separated from the billboard side (+z:
// tower wall, arcade, vending machine) by the building, so trips between the two swing around its corner.
const FRONT = new Set(['hub', 'shop', 'news'])
const EXIT = { hub: [[-8.8, 0.6, -3.2], [-8.6, 1.0, 1.8]], shop: [[-7.5, 1.0, 0.5]], news: [[-6.6, 0.8, 3.6]] }
const ENTRY = [[-4.8, 2.2, 7.2]]
function routeVia(from, to)
{
    const fb = FRONT.has(from), tb = FRONT.has(to)
    if(fb === tb) return null
    const pts = [...EXIT[fb ? from : to], ...ENTRY]
    return fb ? pts : pts.reverse()
}

function resize()
{
    if(!renderer) return
    renderer.setSize(innerWidth, innerHeight); fx?.setSize(innerWidth, innerHeight)
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    if(state !== 'intro' && state !== 'traveling' && !gsap.isTweening(cam.pos)) snapTo(currentShot)
}
addEventListener('resize', resize)
addEventListener('pointermove', (e) => { par.tx = (e.clientX / innerWidth - 0.5) * 2; par.ty = (0.5 - e.clientY / innerHeight) * 2 })

// ---------- picking: signpost signs, screens, the menu card ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2()
const aim = (e) => { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera) }
let posters = null, hubSign = null, hotScreen = null
function pickScreen(e)
{
    if(!posters) return null
    aim(e)
    const h = ray.intersectObjects(posters.screens.map((s) => s.mesh), false)[0]
    return h ? { id: posters.screens.find((s) => s.mesh === h.object).id, point: h.point } : null
}
const setHotScreen = (id) => { if(id !== hotScreen){ hotScreen = id; posters?.hot(id) } }
const setCursor = (on) => { canvas.style.cursor = on ? 'pointer' : '' }
const pickCard = (e) => { aim(e); return menuCard.visible && ray.intersectObject(menuCard, true).length > 0 }

// which drink tile (0-3) of the vending machine's screen is under a hit point?
function tileUnder(point)
{
    const s = posters.primary('drinks'), d = point.clone().sub(s.info.center)
    return tileAt(d.dot(s.info.right) / s.info.w + 0.5, 0.5 - d.dot(s.info.up) / s.info.h)
}

canvas.addEventListener('pointermove', (e) =>
{
    if(state === 'menu'){ setCursor(pickCard(e)) }
    else if(state === 'hub')
    {
        aim(e); const id = hubSign?.pick(ray) ?? null
        hubSign?.setHot(id); ui.setCaption(id); setCursor(!!id)
    }
    else if(state === 'channel')
    {
        const hit = pickScreen(e), id = hit?.id ?? null
        const tile = id === 'drinks' && where === 'drinks' ? tileUnder(hit.point) : -1
        vend.hover = tile
        setHotScreen(id === 'drinks' ? null : id); setCursor(!!id && (id !== 'drinks' || tile >= 0))
    }
})
canvas.addEventListener('click', (e) =>
{
    if(state === 'menu'){ if(pickCard(e)){ ui.showMenu(); play('click') } }
    else if(state === 'hub'){ aim(e); const id = hubSign?.pick(ray); if(id) go(id) }
    else if(state === 'channel')
    {
        const hit = pickScreen(e); if(!hit) return
        if(hit.id === 'drinks' && where === 'drinks'){ const t = tileUnder(hit.point); if(t >= 0) dispense(t) }
        else if(hit.id === 'arcade' && where === 'arcade') ui.openGame(arcadeGame)
        else go(hit.id)
    }
})

// ---------- moving between places ----------
async function dismissBowl()
{
    gsap.to(bowlSteam, { intensity: 0, duration: 0.3 })
    if(servedBowl){ const b = servedBowl; servedBowl = null; await gsap.to(b.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.25 }); scene.remove(b) }
}
async function clearBottle()
{
    if(!bottle) return
    const b = bottle; bottle = null
    await gsap.to(b.group.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.25 }); scene.remove(b.group)
}

const hudFor = (mode) => ui.setHudMode({ hubBtn: mode !== 'hub', menuBtn: mode === 'shop' })

// target: 'hub' | a place | a channel id
async function go(target)
{
    if(!['hub', 'menu', 'served', 'channel'].includes(state)) return
    const place = target === 'hub' ? 'hub' : placeOf(target)
    if(!place) return
    const wantChannel = channels.find((c) => c.id === target)?.id ?? channelsIn(place)[0]?.id ?? null
    if(state === 'served' && place === 'shop'){ back(); return }
    if(place === where && (place === 'hub' || place === 'shop' || wantChannel === channelId)) return

    const from = where
    play('click')
    setHotScreen(null); hubSign?.setHot(null); setCursor(false); vend.hover = -1
    ui.hideMenu(); ui.hidePanel(); ui.hideBubble(); ui.showHint(false)
    if(state === 'served'){ chef.release(0.3); dismissBowl(); chef.pose('idle', 0.4) }
    if(from === 'drinks' && place !== 'drinks') clearBottle()
    state = 'traveling'; where = place; channelId = null
    hudFor(place)
    const via = routeVia(from, place)
    if(via || from === 'hub') play('whoosh')

    if(place === 'hub')
    {
        await flyTo('hub', via ? 2.6 : 1.8, 'power2.inOut', via)
        state = 'hub'; ui.showHint(true)
        chef.mode = 'wave'; chef.pose('wave', 0.4)
        wait(2.4).then(() => { if(chef.mode === 'wave'){ chef.mode = 'idle'; chef.pose('idle', 0.5) } })
        return
    }
    if(place === 'shop')
    {
        await flyTo('seat', via ? 2.6 : 1.8, 'power2.inOut', via)
        state = 'menu'
        if(!menuGiven){ menuGiven = true; await offerMenu() }
        if(where === 'shop' && state === 'menu'){ ui.showMenu(); play('bloop') }
        return
    }
    const scr = posters.primary(wantChannel)
    await flyTo(screenShot(scr, wantChannel === 'articles' ? 2.4 : wantChannel === 'drinks' ? 2.2 : 1.8), via ? 2.6 : place === 'tower' && from === 'tower' ? 1.3 : 1.9, 'power2.inOut', via)
    state = 'channel'; channelId = wantChannel
    posters.focus(wantChannel)
    if(place === 'drinks'){ vend.phase = 'idle'; vend.pick = -1; ui.showDrinks(); return }
    const list = channelsIn(place), idx = list.findIndex((c) => c.id === wantChannel)
    ui.showChannel(list[idx], list.length > 1 ? list[(idx + 1) % list.length] : null)
}

// ---------- the story ----------
async function runIntro()
{
    state = 'intro'
    const P = (a) => a.map((p) => V(...p))
    const posC = new THREE.CatmullRomCurve3(P([[-16, 2.4, -14], [-12.5, 1.2, -10.6], [-10.2, 0.2, -9.0], [0, 0, 0]]))
    const lookC = new THREE.CatmullRomCurve3(P([[-2.3, 0.8, -3.0], [-3.0, 0.2, -3.6], [-3.6, -0.3, -3.8], [0, 0, 0]]))
    const path = { t: 0 }
    const apply = () =>
    {
        const sp = shotFor('hub') // re-fitted every frame so a resize or rotation mid-flight still lands correctly
        posC.points[3].copy(sp.pos); lookC.points[3].copy(sp.look)
        posC.getPoint(path.t, cam.pos); lookC.getPoint(path.t, cam.look); cam.fov = 50 + (sp.fov - 50) * path.t
    }
    apply(); currentShot = 'hub'

    $('#loading').classList.add('done')
    await wait(0.4)
    play('whoosh')
    const flight = gsap.to(path, { t: 1, duration: reduceMotion ? 0.01 : 4, ease: 'power2.inOut', onUpdate: apply })
    await wait(reduceMotion ? 0.05 : 2.4)

    chef.mode = 'wave'; chef.pose('wave', 0.5)
    ui.showHud(); hudFor('hub')
    const say0 = ui.say(greeting[0])
    await flight
    await say0
    where = 'hub'
    ui.showHint(true)
    const say1 = ui.say(greeting[1])
    state = 'hub' // the visitor may already click a sign while the chef is still talking
    await say1
    chef.mode = 'idle'; chef.pose('idle', 0.5)
}

// The chef takes a menu from under the counter, holds it out with both hands, then slides it across to the customer.
async function offerMenu()
{
    menuCard.position.set(-1.36, B - 0.42, CHEF_HOME.z); menuCard.rotation.y = -Math.PI / 2; menuCard.visible = true
    const z = CHEF_HOME.z
    chef.pose({ lean: 0.16, headX: 0.12 }, 0.3)
    await carryPath(menuCard, [V(-1.42, B + 0.05, z), V(-1.62, B + 0.4, z), V(-1.95, B + 0.42, z)], 1.3, { lateral: 0.13, drop: 0.165 })
    if(state !== 'menu') return
    await ui.say(greeting[2])
    chef.pose({ lean: 0.4, headX: 0.15 }, 0.4)
    await carryPath(menuCard, [V(-2.05, B + 0.3, z), V(-2.1, B + 0.165, z + 0.15)], 0.7, { lateral: 0.13, drop: 0.165 })
    carry.obj = null
    await gsap.to(menuCard.position, { x: MENU_REST.x, y: B, z: MENU_REST.z, duration: 0.6, ease: 'power3.out' })
    menuCard.rotation.y = -Math.PI / 2 - 0.12
    chef.release(0.35); chef.pose('idle', 0.5)
}

async function order(i)
{
    if(!renderer){ ui.hideMenu(); ui.showPanel(i); return }
    if(state !== 'menu') return
    state = 'cooking'
    ui.hideMenu(); ui.hideBubble(); ui.showSkip(true); play('click')
    servedBowl = await cook(i)
    gsap.globalTimeline.timeScale(1); ui.showSkip(false)
    state = 'served'
    ui.showPanel(i)
}

// Everything happens on the counter directly in front of the customer: a bowl comes up from under the counter, noodles
// come out of the chrome-handed pot, broth from the stock pot, toppings by hand, then the bowl is slid across.
async function cook(i)
{
    const it = items[i], z = PREP.z
    const bowl = shade(makeBowl(it.dish, { built: false })); bowl.position.set(-1.36, B - 0.36, z); scene.add(bowl)
    const { broth, noodles, toppings } = bowl.userData
    const pop = (o, d = 0.4, ease = 'back.out(2)', k = 1) => gsap.to(o.scale, { x: k, y: k, z: k, duration: d, ease })
    const basket = tools.basket, ladle = tools.ladle, ball = station.basket.userData.noodles
    ball.scale.setScalar(0.46)

    ui.say(`${it.name}? Coming right up!`)
    flyTo('cook', 1.2)
    chef.pose({ lean: 0.16, headX: 0.22 }, 0.3); play('cooking')
    gsap.to([station.noodlePot.steam, station.stockPot.steam], { intensity: 1, duration: 0.8 })

    // 1. a bowl from the shelf under the counter, set down in front of the chef
    await carryPath(bowl, [V(-1.42, B - 0.02, z), V(-1.62, B + 0.2, z), V(PREP.x, B + 0.17, z), V(PREP.x, B + 0.14, z)], 1.3)
    carry.obj = null; bowl.position.set(PREP.x, B, z)
    chef.release(0.2)

    // 2. noodles: lift the strainer out of the boiling pot, shake it, tip it into the bowl
    chef.pose({ lean: 0.2, headX: 0.25 }, 0.3)
    await grab('basket', 'R')
    const lift = TOOL_REST.basket.pos.clone().add(V(0.0, 0.32, 0.02))
    await moveHand('R', [lift], 0.55)
    for(let k = 0; k < 2; k++) await moveHand('R', [lift.clone().add(V(0, -0.06, 0)), lift.clone()], 0.22, 'sine.inOut')
    gsap.to(basket.dir, { x: -0.5, y: -0.86, z: 0, duration: 0.6, ease: 'power2.inOut' })
    await moveHand('R', [V(NOODLE_POT.x + 0.1, B + 0.72, z - 0.3), V(PREP.x + 0.2, B + 0.67, z - 0.02)], 0.85)
    gsap.to(basket.dir, { x: -0.92, y: -0.4, z: 0, duration: 0.35, ease: 'power2.in' })
    await wait(0.3)
    gsap.to(ball.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.3 }); pop(noodles, 0.5, 'elastic.out(1,0.6)'); play('bloop')
    await wait(0.45)
    gsap.to(basket.dir, { x: TOOL_REST.basket.dir.x, y: TOOL_REST.basket.dir.y, z: 0, duration: 0.5 })
    await putBack('basket', 'R')

    // 3. broth: two ladles from the stock pot, poured in a thin stream
    await grab('ladle', 'L')
    const soup = station.ladle.userData.soup, sc = V(0, 0, 0)
    const streamTick = () => { sc.copy(ladle.obj.position).addScaledVector(ladle.dir, 0.36); pour.position.copy(sc); pour.scale.set(1, Math.max(0.05, sc.y - (B + 0.15)), 1) }
    for(let k = 0; k < 2; k++)
    {
        const dip = TOOL_REST.ladle.pos.clone().add(V(-0.05, -0.12, 0))
        await moveHand('L', [dip], 0.32); soup.visible = true
        await moveHand('L', [dip.clone().add(V(0.03, 0.34, 0)), V(PREP.x + 0.2, B + 0.68, z)], 0.7)
        gsap.to(ladle.dir, { x: -0.93, y: -0.3, z: 0, duration: 0.3, ease: 'power2.in' })
        await wait(0.28)
        soup.visible = false; pour.visible = true; play('bloop')
        gsap.ticker.add(streamTick)
        await pop(broth, 0.6, 'power2.out', k ? 1 : 0.62)
        gsap.ticker.remove(streamTick); pour.visible = false
        gsap.to(ladle.dir, { x: TOOL_REST.ladle.dir.x, y: TOOL_REST.ladle.dir.y, z: 0, duration: 0.4 })
        if(!k) await moveHand('L', [dip.clone().add(V(0.05, 0.3, 0))], 0.5)
    }
    await putBack('ladle', 'L')

    // 4. toppings by hand, one at a time
    const dipAmt = { L: 0, R: 0 }, hover = (side, s) => () => (s === 'L' ? tL : tR).set(PREP.x + 0.05, B + 0.42 - dipAmt[s] * 0.12, z + side * 0.1)
    chef.reach('L', hover(1, 'L'), 0.35); chef.reach('R', hover(-1, 'R'), 0.35)
    await wait(0.35)
    for(const [k, t] of toppings.entries())
    {
        const s = k % 2 ? 'L' : 'R'
        await gsap.to(dipAmt, { [s]: 1, duration: 0.16, ease: 'power2.in' })
        pop(t, 0.35, 'elastic.out(1,0.5)')
        gsap.to(dipAmt, { [s]: 0, duration: 0.2, ease: 'power2.out' }); await wait(0.24)
    }

    // 5. take the bowl in both hands and slide it across the counter to the customer
    await carryPath(bowl, [V(PREP.x, B + 0.15, z)], 0.35)
    chef.pose({ lean: 0.5, headX: 0.18 }, 0.4)
    await carryPath(bowl, [V(-2.08, B + 0.145, z)], 0.55)
    carry.obj = null
    chef.release(0.35)
    sfx.cooking.pause(); play('ding')
    gsap.to(bowl.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.6, ease: 'back.out(2)' })
    gsap.to([station.noodlePot.steam, station.stockPot.steam], { intensity: 0.45, duration: 1.5 })
    await gsap.to(bowl.position, { x: SERVE.x, z: SERVE.z, duration: 0.75, ease: 'power3.out' })
    bowlSteam.group.position.set(SERVE.x, B + 0.22, SERVE.z); gsap.to(bowlSteam, { intensity: 1, duration: 1 })

    // bow, then push in on the bowl
    ui.say(`Dōzo! Enjoy your ${it.name}.`)
    chef.pose('bow', 0.3); flyTo(bowlShot(), 1.3); await wait(0.5); chef.pose('idle', 0.5)
    await wait(0.8)
    return bowl
}

async function back()
{
    if(state !== 'served') return
    state = 'traveling'
    ui.hidePanel(); ui.hideBubble(); play('click')
    flyTo('seat', 1.3)
    await wait(0.4)
    await dismissBowl()
    chef.pose('idle', 0.4)
    await wait(0.3)
    ui.showMenu(); state = 'menu'
}

// ---------- the vending machine: pick a bottle, a random quote comes out inside it ----------
async function dispense(i)
{
    if(where !== 'drinks' || state !== 'channel' || vend.phase === 'busy') return
    const f = FLAVORS[i], quote = drawQuote()
    clearBottle()
    vend.phase = 'busy'; vend.pick = i; vend.t0 = now
    ui.showDrinks(); ui.setDrinksBusy(true); play('click')
    await wait(1.0)
    play('bloop')
    const b = makeBottle(f); bottle = b; scene.add(shade(b.group))
    b.group.position.set(TRAY.x, TRAY.y + 0.7, TRAY.z - 0.45)     // inside the machine, behind its front face
    b.group.rotation.set(0, 0, 0)
    gsap.to(b.group.rotation, { z: -Math.PI / 2, duration: 0.55, ease: 'power2.in' })                   // tips over as it falls
    await gsap.to(b.group.position, { y: TRAY.y, duration: 0.55, ease: 'power2.in' })
    await gsap.to(b.group.position, { z: TRAY.z, duration: 0.5, ease: 'power3.out' })               // rolls out into the tray
    play('ding'); vend.phase = 'done'
    flyTo(trayShot(), 1.0)
    await wait(0.9)
    // pop the cap: it flies off, a puff of fizz rises from the neck
    play('bloop')
    b.group.updateMatrixWorld(true)
    fizz.group.position.copy(b.group.localToWorld(V(0, 0.27, 0))); gsap.to(fizz, { intensity: 1, duration: 0.2 }); gsap.to(fizz, { intensity: 0, duration: 1.2, delay: 0.5 })
    const capPos = b.cap.getWorldPosition(V(0, 0, 0)); b.body.remove(b.cap); b.cap.position.copy(capPos); scene.add(b.cap)
    gsap.to(b.cap.position, { y: capPos.y + 0.35, x: capPos.x + 0.12, duration: 0.5, ease: 'power2.out' }); gsap.to(b.cap.rotation, { z: 6, x: 3, duration: 0.7 })
    gsap.to(b.cap.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.3, delay: 0.5, onComplete: () => scene.remove(b.cap) })
    await wait(0.6)
    if(where !== 'drinks') return
    ui.showDrinks(quote); vend.phase = 'done'
}

// ---------- helpers for the frame loop ----------
const v = V(0, 0, 0), right = V(0, 0, 0), UP = V(0, 1, 0), tagWorld = V(0, 0, 0)
const toScreen = (p) => { v.copy(p).project(camera); return v.z > 1 ? null : [(v.x * 0.5 + 0.5) * innerWidth, (-v.y * 0.5 + 0.5) * innerHeight] }

function fallback(err)
{
    console.error(err)
    $('#loading p').textContent = 'Your browser could not start the 3D shop, so here is the menu.'
    $('#loading .pot').hidden = true
    setTimeout(() => { $('#loading').classList.add('done'); ui.showHud(); hudFor('shop'); ui.showMenu(); state = 'menu'; where = 'shop' }, 1800)
}

// ---------- boot ----------
let shop
if(renderer)
{
    resize(); snapTo('hub')
    loadShop(renderer).then((s) =>
    {
        shop = s; scene.add(s.scene); scene.add(makeSign(`${owner.short.toUpperCase()}'S RAMEN`))
        s.scene.updateMatrixWorld(true)
        posters = makePosters(s.byName, channels, links, () => vend)
        hubSign = makeHub(s.byName, hubDefs, scene)
        runIntro()
    }).catch(fallback)

    const clock = new THREE.Clock()
    renderer.setAnimationLoop(() =>
    {
        const dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime; now = t
        if(shop) shop.fans.forEach((f) => { f.rotation.x += 0.05 })
        posters?.update(t); hubSign?.update(t, state === 'hub')

        // the chef, his tools and whatever he is carrying
        chef.update(t, dt, camera.position)
        station.update(t); bowlSteam.update(t); fizz.update(t)
        for(const [name, tool] of Object.entries(tools))
        {
            if(tool.hand){ chef.palm(tool.hand, v); tool.obj.position.copy(v); tool.obj.quaternion.setFromUnitVectors(DOWN, tool.dir) }
            else { tool.obj.position.copy(TOOL_REST[name].pos); tool.obj.quaternion.setFromUnitVectors(DOWN, TOOL_REST[name].dir) }
        }
        if(carry.obj){ carry.obj.position.copy(carry.c); carry.obj.position.y -= carry.drop }
        if(servedBowl) servedBowl.userData.toppings.forEach((tp) => { if(tp.userData.spin) tp.userData.spin.rotation.y += dt * 1.5 })

        // camera with a little pointer parallax, sideways relative to wherever it is looking
        par.x += (par.tx - par.x) * 0.05; par.y += (par.ty - par.y) * 0.05
        const px = reduceMotion ? 0 : par.x, py = reduceMotion ? 0 : par.y
        right.subVectors(cam.look, cam.pos).cross(UP).normalize()
        camera.position.copy(cam.pos).addScaledVector(right, px * 0.16); camera.position.y += py * 0.05
        camera.lookAt(cam.look)
        if(camera.fov !== cam.fov){ camera.fov = cam.fov; camera.updateProjectionMatrix() }

        // the speech bubble follows the chef's head
        if(!$('#bubble').hidden){ chef.head.getWorldPosition(tagWorld); tagWorld.y += 0.45; const p = toScreen(tagWorld); if(p) ui.moveBubble(p[0], p[1]) }

        if(fx) fx.render(dt, t); else renderer.render(scene, camera)
    })
}

ui.setSound(soundOn)
if(import.meta.env.DEV)
{
    Object.assign(window, { THREE, scene, camera, chef, station, tools, cam, flyTo, snapTo, order, back, go, dispense, offerMenu, ui, gsap, screenShot, bowlShot, trayShot, vend, key, fx })
    for(const [k, get] of Object.entries({ state: () => state, where: () => where, channelId: () => channelId, posters: () => posters, hubSign: () => hubSign, bottle: () => bottle, servedBowl: () => servedBowl }))
        Object.defineProperty(window, k, { get })
}
