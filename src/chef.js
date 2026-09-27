// Procedural cyberpunk ramen chef with realistic proportions (about 2 units tall, hips at 0.98). No model files:
// tapered limbs, a lathe-turned torso, a modelled head, and a chrome right arm with glowing seams.
//
// Two ways to move: FK poses (state `s`, tweened by gsap: idle, wave, bow...) and 2-bone IK for the hands
// (chef.reach('R', () => worldPoint) makes the hand go there). update() applies FK, then blends IK over it.
import * as THREE from 'three'
import gsap from 'gsap'
import { mat, led, blob } from './mats.js'
import { FLOOR_Y, CHEF_HOME, FACING_CUSTOMER } from './stage.js'

const V3 = THREE.Vector3
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const mesh = (g, m) => new THREE.Mesh(g, m)
const ell = (r, sx, sy, sz, m) => { const o = mesh(new THREE.SphereGeometry(r, 24, 16), m); o.scale.set(sx, sy, sz); return o }
const cyl = (rt, rb, h, m, seg = 20, open = false) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), m)
const cap = (r, len, m) => mesh(new THREE.CapsuleGeometry(r, len, 6, 14), m)
const box = (w, h, d, m) => mesh(new THREE.BoxGeometry(w, h, d), m)
const torus = (r, t, m, seg = 28) => mesh(new THREE.TorusGeometry(r, t, 8, seg), m)

// body dimensions (root = floor; hips group at y = HIP)
const HIP = 0.98, THIGH = 0.46, SHIN = 0.46
const SHO_Y = 0.66, SHO_X = 0.215, UPPER = 0.33, FORE = 0.29, GRIP = 0.08 // GRIP = wrist to palm center

// resting FK angles; `pose()` merges named or custom targets over these
const IDLE = { lsx: 0.06, lsz: 0.1, lex: 0.3, rsx: 0.06, rsz: 0.1, rex: 0.3, lean: 0, headX: 0 }
export const POSES = {
    idle: {},
    wave: { rsx: 0.25, rsz: 2.35, rex: 0.6 },
    present: { lsx: 0.95, lsz: 0.55, lex: 0.8, rsx: 0.95, rsz: 0.55, rex: 0.8, lean: 0.06 },
    bow: { lean: 0.75, headX: 0.15 },
    nod: { lean: 0.28, headX: 0.25 },
}

function apronTexture()
{
    const c = document.createElement('canvas'); c.width = 256; c.height = 512
    const g = c.getContext('2d')
    g.fillStyle = '#12131b'; g.fillRect(0, 0, 256, 512)
    g.fillStyle = 'rgba(255,255,255,0.035)'; for(let y = 0; y < 512; y += 4) g.fillRect(0, y, 256, 1)
    g.lineCap = 'round'; g.lineJoin = 'round'
    g.strokeStyle = 'rgba(0,229,255,0.7)'; g.lineWidth = 3; g.strokeRect(66, 350, 124, 86)   // pocket
    g.shadowColor = '#ff3dcb'; g.shadowBlur = 16; g.strokeStyle = '#ff3dcb'; g.lineWidth = 7
    g.beginPath(); g.arc(128, 168, 54, 0.04 * Math.PI, 0.96 * Math.PI); g.stroke()                // bowl
    g.beginPath(); g.moveTo(72, 166); g.lineTo(184, 166); g.stroke()
    g.lineWidth = 5; for(const dx of [-26, 0, 26]){ g.beginPath(); g.moveTo(128 + dx, 128); g.bezierCurveTo(118 + dx, 110, 138 + dx, 98, 128 + dx, 80); g.stroke() } // steam
    g.strokeStyle = '#00e5ff'; g.shadowColor = '#00e5ff'; g.lineWidth = 6
    g.beginPath(); g.moveTo(150, 138); g.lineTo(200, 92); g.moveTo(164, 146); g.lineTo(212, 106); g.stroke()  // chopsticks
    g.shadowBlur = 10; g.fillStyle = '#fff'; g.textAlign = 'center'
    g.font = '800 30px Consolas, "Courier New", monospace'; g.fillText("ARJAN'S", 128, 270)
    g.fillStyle = '#ff9be9'; g.font = '800 22px Consolas, "Courier New", monospace'; g.fillText('RAMEN BAR', 128, 302)
    g.shadowColor = '#00e5ff'; g.fillStyle = '#00e5ff'; g.fillRect(0, 496, 256, 8)
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4
    return t
}

function headGeometry()
{
    const g = new THREE.SphereGeometry(0.115, 40, 28), p = g.attributes.position, v = new V3()
    for(let i = 0; i < p.count; i++)
    {
        v.fromBufferAttribute(p, i)
        if(v.y < 0){ const t = Math.min(1, -v.y / 0.115); v.x *= 1 - 0.24 * t ** 1.4; v.z *= 1 - 0.16 * t ** 1.6; v.y *= 1.08; v.z += 0.014 * t } // jaw taper, longer face, chin forward
        v.x *= 0.72; v.z *= 0.86
        p.setXYZ(i, v.x, v.y, v.z)
    }
    g.computeVertexNormals()
    return g
}

function makeHand(m, cyber, side)
{
    const g = new THREE.Group()
    g.add(ell(0.045, 0.95, 1.05, 0.42, m))
    const fingers = new THREE.Group(); g.add(fingers)
    for(let i = 0; i < 4; i++)
    {
        const f = new THREE.Group(); f.position.set((i - 1.5) * 0.0215, -0.04, 0.004)
        const a = cap(0.0085, 0.036, m); a.position.y = -0.026
        const b = new THREE.Group(); b.position.y = -0.05; b.rotation.x = -0.75
        const c = cap(0.0078, 0.03, m); c.position.y = -0.022; b.add(c)
        f.add(a, b); f.rotation.x = -0.25; fingers.add(f)
        if(cyber){ const j = mesh(new THREE.SphereGeometry(0.0065, 8, 6), led('#00e5ff', 3)); j.position.set(0, -0.05, 0.007); f.add(j) }
    }
    const th = new THREE.Group(); th.position.set(-side * 0.04, -0.005, 0.012); th.rotation.set(-0.5, 0, side * 0.9)
    const t1 = cap(0.0095, 0.03, m); t1.position.y = -0.02; th.add(t1); g.add(th)
    return g
}

export function makeChef()
{
    // ----- materials -----
    const skin = mat('#a9764f', { roughness: 0.55 }), lip = mat('#8f4f48', { roughness: 0.4 })
    const jacket = mat('#14151e', { roughness: 0.62, metalness: 0.15 }), pants = mat('#1b1e2a', { roughness: 0.75 })
    const boot = mat('#0c0d12', { roughness: 0.4, metalness: 0.2 })
    const chrome = mat('#c4cee0', { roughness: 0.22, metalness: 1 }), dark = mat('#262b3a', { roughness: 0.4, metalness: 0.85 })
    const hair = mat('#0d0e14', { roughness: 0.45 }), white = mat('#ecebe8', { roughness: 0.25 })
    const cyan = led('#00e5ff', 3), pink = led('#ff3dcb', 2.6)
    const band_ = mat('#161824', { roughness: 0.8 })
    const apronTex = apronTexture()
    const apron = new THREE.MeshStandardMaterial({ map: apronTex, emissiveMap: apronTex, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.7, side: THREE.DoubleSide })

    const root = new THREE.Group()
    const hips = new THREE.Group(); hips.position.y = HIP; root.add(hips)
    const spine = new THREE.Group(); hips.add(spine)

    // ----- legs (children of hips so leaning the torso doesn't tilt them) -----
    const legs = [1, -1].map((s) =>
    {
        const thigh = new THREE.Group(); thigh.position.set(s * 0.095, -0.01, 0); hips.add(thigh)
        const tm = cyl(0.078, 0.058, THIGH, pants); tm.position.y = -THIGH / 2; thigh.add(tm)
        const knee = ell(0.062, 1, 1.1, 0.9, dark); knee.position.set(0, -THIGH, 0.03); thigh.add(knee)
        const stripe = box(0.012, THIGH * 0.8, 0.012, cyan); stripe.position.set(s * 0.072, -THIGH / 2, 0); thigh.add(stripe)
        const shin = new THREE.Group(); shin.position.y = -THIGH; thigh.add(shin)
        const sm = cyl(0.056, 0.042, SHIN, pants); sm.position.y = -SHIN / 2; shin.add(sm)
        const b = new THREE.Group(); b.position.y = -SHIN; shin.add(b)
        const bm = box(0.095, 0.075, 0.24, boot); bm.position.set(0, -0.035, 0.06); b.add(bm)
        const toe = ell(0.05, 1, 0.75, 1.1, boot); toe.position.set(0, -0.035, 0.17); b.add(toe)
        const sole = box(0.1, 0.012, 0.3, pink); sole.position.set(0, -0.07, 0.07); b.add(sole)
        return { thigh, shin }
    })

    // ----- torso -----
    const pel = ell(0.16, 1, 0.75, 0.74, pants); pel.position.y = -0.01; spine.add(pel)
    const prof = [[0.001, -0.07], [0.13, -0.06], [0.145, 0.02], [0.135, 0.16], [0.15, 0.3], [0.18, 0.44], [0.195, 0.55], [0.19, 0.63], [0.16, 0.68], [0.1, 0.72], [0.06, 0.75], [0.001, 0.76]]
    const torso = mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 32), jacket); torso.scale.z = 0.66; spine.add(torso)
    const belt = torus(0.148, 0.02, dark); belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.72, 1); belt.position.y = 0.03; spine.add(belt)
    const buckle = box(0.05, 0.04, 0.02, chrome); buckle.position.set(0, 0.03, 0.112); spine.add(buckle)
    for(const s of [-1, 1]){ const p = box(0.055, 0.07, 0.04, dark); p.position.set(s * 0.13, 0.0, 0.07); p.rotation.y = s * -0.5; spine.add(p) } // pouches
    const zip = box(0.008, 0.6, 0.006, cyan); zip.position.set(0.03, 0.4, 0.132); spine.add(zip)
    // apron: pink-neon bowl logo, hangs to the knee, hem swings forward
    const ap = mesh(new THREE.PlaneGeometry(0.34, 0.72, 1, 8), apron)
    const apPos = ap.geometry.attributes.position
    for(let i = 0; i < apPos.count; i++){ const y = apPos.getY(i); apPos.setZ(i, Math.max(0, -y - 0.05) * 0.16) }
    ap.geometry.computeVertexNormals(); ap.position.set(0, 0.2, 0.137); spine.add(ap)
    for(const s of [-1, 1]){ const strap = box(0.012, 0.3, 0.008, cyan); strap.position.set(s * 0.115, 0.6, 0.128); strap.rotation.z = s * -0.55; spine.add(strap) }
    for(const s of [-1, 1]){ const st = box(0.022, 0.5, 0.012, dark); st.position.set(s * 0.06, 0.47, 0.126); st.rotation.z = s * 0.28; spine.add(st) } // chest harness
    const ring = torus(0.02, 0.005, chrome, 14); ring.position.set(0, 0.5, 0.13); spine.add(ring)
    const collarMat = jacket.clone(); collarMat.side = THREE.DoubleSide
    const collar = cyl(0.082, 0.074, 0.075, collarMat, 24, true); collar.position.y = 0.725; spine.add(collar)
    const collarRim = torus(0.082, 0.005, cyan, 30); collarRim.rotation.x = Math.PI / 2; collarRim.position.y = 0.762; spine.add(collarRim)
    const neck = cyl(0.043, 0.048, 0.16, skin); neck.position.y = 0.79; spine.add(neck)

    // ----- head -----
    const head = new THREE.Group(); head.position.y = 0.905; spine.add(head)
    head.add(mesh(headGeometry(), skin))
    for(const s of [-1, 1]){ const ear = ell(0.021, 0.55, 1.05, 0.75, skin); ear.position.set(s * 0.083, -0.004, -0.004); head.add(ear) }
    const nose = ell(0.014, 0.75, 1.25, 0.9, skin); nose.position.set(0, -0.02, 0.095); head.add(nose)
    const bridge = ell(0.008, 0.7, 1.8, 0.8, skin); bridge.position.set(0, 0.006, 0.093); head.add(bridge)
    // eyes: natural (chef's left, +x) and cybernetic (chef's right, -x)
    const eyes = new THREE.Group(); head.add(eyes)
    const irisM = mat('#3a2418', { roughness: 0.3 })
    for(const s of [1, -1])
    {
        const e = new THREE.Group(); e.position.set(s * 0.034, 0.012, 0.083); eyes.add(e)
        e.add(mesh(new THREE.SphereGeometry(0.0138, 16, 12), white))
        const iris = mesh(new THREE.CircleGeometry(0.0088, 20), s > 0 ? irisM : cyan); iris.position.z = 0.0136; e.add(iris)
        const pupil = mesh(new THREE.CircleGeometry(0.0042, 12), mat('#000000')); pupil.position.z = 0.0138; e.add(pupil)
        if(s < 0){ const r = torus(0.0105, 0.0013, cyan, 20); r.position.z = 0.0138; e.add(r) }
        const brow = box(0.036, 0.006, 0.009, hair); brow.position.set(s * 0.035, 0.04, 0.087); brow.rotation.z = s * 0.14; head.add(brow)
    }
    // mouth
    const mouth = new THREE.Group(); mouth.position.set(0, -0.06, 0.079); head.add(mouth)
    const inside = ell(0.016, 1.5, 0.3, 0.4, mat('#1a0808')); inside.position.z = -0.002; mouth.add(inside)
    const upperLip = ell(0.019, 1.4, 0.32, 0.5, lip); upperLip.position.y = 0.004; mouth.add(upperLip)
    const lowerLip = ell(0.017, 1.3, 0.36, 0.5, lip); lowerLip.position.y = -0.005; mouth.add(lowerLip)
    // hair (undercut with a cyan streak) + tenugui headband with an LED stripe
    const hairCap = mesh(new THREE.SphereGeometry(0.121, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.34), hair); hairCap.scale.set(0.76, 1.02, 0.94); hairCap.position.y = 0.016; head.add(hairCap)
    const tuft = ell(0.05, 1.3, 0.55, 1.15, hair); tuft.position.set(0, 0.104, 0.05); tuft.rotation.x = -0.35; head.add(tuft)
    const streak = box(0.012, 0.005, 0.11, cyan); streak.position.set(0.02, 0.116, 0.02); streak.rotation.x = -0.22; head.add(streak)
    const band = torus(0.104, 0.0125, band_, 36); band.rotation.x = Math.PI / 2; band.scale.set(0.8, 0.98, 1); band.position.y = 0.074; head.add(band)
    const bandLed = torus(0.1, 0.0035, pink, 36); bandLed.rotation.x = Math.PI / 2; bandLed.scale.set(0.8, 0.98, 1); bandLed.position.y = 0.083; head.add(bandLed)
    for(const s of [-1, 1]){ const tail = box(0.03, 0.09, 0.006, band_); tail.position.set(s * 0.02, 0.03, -0.1); tail.rotation.set(0.25, 0, s * 0.25); head.add(tail) }
    // cyber details: jaw seam + cheek circuit (right side), headset with boom mic (left)
    for(let i = 0; i < 3; i++){ const c = box(0.02, 0.0025, 0.0025, cyan); c.position.set(-0.058 - i * 0.004, 0.01 - i * 0.012, 0.062 - i * 0.012); c.rotation.y = -0.9; head.add(c) }
    const cup = cyl(0.026, 0.026, 0.014, dark, 20); cup.rotation.z = Math.PI / 2; cup.position.set(0.09, -0.005, 0); head.add(cup)
    const cupLed = torus(0.019, 0.0028, cyan, 20); cupLed.rotation.y = Math.PI / 2; cupLed.position.set(0.099, -0.005, 0); head.add(cupLed)
    const boomCurve = new THREE.CatmullRomCurve3([new V3(0.092, -0.02, 0.008), new V3(0.088, -0.07, 0.03), new V3(0.06, -0.088, 0.07), new V3(0.03, -0.075, 0.093)])
    head.add(mesh(new THREE.TubeGeometry(boomCurve, 20, 0.0032, 6), dark))
    const mic = mesh(new THREE.SphereGeometry(0.0085, 12, 8), cyan); mic.position.set(0.03, -0.075, 0.093); head.add(mic)

    // ----- arms: left organic with a wrist device, right chrome with glowing seams -----
    const makeArm = (side) =>
    {
        const cyber = side < 0
        const sh = new THREE.Group(); sh.position.set(side * SHO_X, SHO_Y, 0); spine.add(sh)
        sh.add(ell(0.072, 1, 0.95, 1, jacket))
        const pad = mesh(new THREE.SphereGeometry(0.1, 18, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), dark); pad.scale.set(1.05, 0.7, 1.0); pad.position.y = 0.02; pad.rotation.z = side * 0.35; sh.add(pad)
        const padLed = torus(0.088, 0.0035, cyber ? cyan : pink, 22); padLed.rotation.x = Math.PI / 2; padLed.position.y = 0.012; padLed.rotation.z = side * 0.35; sh.add(padLed)
        const up = cyl(0.056, 0.048, UPPER, jacket); up.position.y = -UPPER / 2; sh.add(up)
        const cuffUp = torus(0.05, 0.005, cyber ? cyan : pink, 20); cuffUp.rotation.x = Math.PI / 2; cuffUp.position.y = -UPPER + 0.03; sh.add(cuffUp)
        const el = new THREE.Group(); el.position.y = -UPPER; sh.add(el)
        el.add(ell(0.05, 1, 1, 1, cyber ? dark : jacket))
        const fore = new THREE.Group(); el.add(fore)
        if(cyber)
        {
            const f = cyl(0.045, 0.037, FORE, chrome, 22); f.position.y = -FORE / 2; fore.add(f)
            for(const y of [0.2, 0.55, 0.88]){ const r = torus(0.043 - y * 0.007, 0.004, cyan, 24); r.rotation.x = Math.PI / 2; r.position.y = -FORE * y; fore.add(r) }
            const plate = box(0.03, FORE * 0.55, 0.012, dark); plate.position.set(0, -FORE * 0.5, 0.04); fore.add(plate)
            const sm = box(0.006, FORE * 0.5, 0.004, cyan); sm.position.set(0, -FORE * 0.5, 0.047); fore.add(sm)
            const piston = cyl(0.007, 0.007, FORE * 0.7, chrome, 10); piston.position.set(0.04, -FORE * 0.5, -0.02); fore.add(piston)
        }
        else
        {
            const roll = cyl(0.058, 0.055, 0.1, jacket); roll.position.y = -0.05; fore.add(roll)
            const rollLed = torus(0.057, 0.0035, pink, 20); rollLed.rotation.x = Math.PI / 2; rollLed.position.y = -0.1; fore.add(rollLed)
            const f = cyl(0.043, 0.034, FORE - 0.06, skin, 18); f.position.y = -0.1 - (FORE - 0.06) / 2; fore.add(f)
            const dev = box(0.062, 0.034, 0.052, dark); dev.position.set(0, -FORE + 0.045, 0); fore.add(dev)
            const scr = box(0.048, 0.006, 0.036, cyan); scr.position.set(0, -FORE + 0.06, 0); fore.add(scr)
        }
        const hand = new THREE.Group(); hand.position.y = -FORE; el.add(hand)
        const palm = makeHand(cyber ? chrome : skin, cyber, side); palm.position.y = -GRIP + 0.005; hand.add(palm)
        return { sh, el, hand, side }
    }
    const armL = makeArm(1), armR = makeArm(-1)

    root.add(blob(0.55, 0.6))
    root.position.set(CHEF_HOME.x, FLOOR_Y, CHEF_HOME.z)

    // ----- state & controls -----
    const s = { ...IDLE, yaw: FACING_CUSTOMER }
    const ik = { L: { w: 0, target: null }, R: { w: 0, target: null } }
    const chef = { root, hips, spine, head, armL, armR, handL: armL.hand, handR: armR.hand, s, ik, mode: 'idle', talking: false, lookAt: null }
    let blinkAt = 2, blink = 0, phase = 0, mouthOpen = 0
    const last = root.position.clone()
    const _S = new V3(), _T = new V3(), _E = new V3(), _u = new V3(), _p = new V3(), _x = new V3(), _y = new V3(), _z = new V3(), _mv = new V3()
    const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _uq = new THREE.Quaternion(), _qU = new THREE.Quaternion(), _qF = new THREE.Quaternion()

    chef.pose = (p, dur = 0.5, ease = 'power2.inOut') => gsap.to(s, { ...IDLE, ...(typeof p === 'string' ? POSES[p] : p), duration: dur, ease, overwrite: 'auto' })
    chef.face = (yaw, dur = 0.35) => gsap.to(s, { yaw: () => s.yaw + wrap(yaw - s.yaw), duration: dur, ease: 'power2.inOut' }) // end value resolved when the tween starts
    // hand goes to fn() (a world point, re-read every frame); fn = null lets go
    chef.reach = (side, fn, dur = 0.3) => { if(fn) ik[side].target = fn; return gsap.to(ik[side], { w: fn ? 1 : 0, duration: dur, ease: 'power2.inOut', overwrite: 'auto' }) }
    chef.release = (dur = 0.3) => Promise.all([chef.reach('L', null, dur), chef.reach('R', null, dur)])

    // walk to (x, z); by default turn to face the way of travel and back, `strafe` keeps facing the counter (carrying a bowl)
    chef.walkTo = (x, z, endYaw = FACING_CUSTOMER, strafe = false) =>
    {
        const dx = x - root.position.x, dz = z - root.position.z, dist = Math.hypot(dx, dz)
        const tl = gsap.timeline()
        if(dist < 0.02) return tl.add(chef.face(endYaw, 0.3))
        if(!strafe) tl.add(chef.face(Math.atan2(dx, dz), 0.15))
        tl.to(root.position, { x, z, duration: 0.2 + dist / 2.4, ease: 'power1.inOut' })
        if(!strafe) tl.add(chef.face(endYaw, 0.2))
        return tl
    }

    // world position of a hand's palm center (the wrist plus GRIP along the forearm)
    chef.palm = (side, out) =>
    {
        const arm = side === 'L' ? armL : armR
        arm.hand.getWorldPosition(out)
        return out.addScaledVector(_y.set(0, -1, 0).applyQuaternion(arm.el.getWorldQuaternion(_qU)), GRIP)
    }
    chef.midHands = (out) => { armL.hand.getWorldPosition(out); armR.hand.getWorldPosition(_T); return out.add(_T).multiplyScalar(0.5) }

    // 2-bone IK: put the palm at `target` (world), elbow pushed down/out/back. Blends over the FK pose by weight w.
    function solve(arm, target, w)
    {
        const a = UPPER, b = FORE + GRIP
        arm.sh.getWorldPosition(_S)
        _T.copy(target)
        const dist = clamp(_S.distanceTo(_T), Math.abs(a - b) + 1e-3, a + b - 1e-3)
        _u.subVectors(_T, _S).normalize()
        const along = (dist * dist + a * a - b * b) / (2 * dist), h = Math.sqrt(Math.max(a * a - along * along, 0))
        spine.getWorldQuaternion(_pq)
        _p.set(arm.side * 0.55, -0.7, -0.45).applyQuaternion(_pq)              // elbow points down, out and back
        _p.addScaledVector(_u, -_p.dot(_u)).normalize()
        _E.copy(_S).addScaledVector(_u, along).addScaledVector(_p, h)
        const W = _T.copy(_S).addScaledVector(_u, dist)
        // upper arm: local -y along shoulder->elbow, local +z = bend direction (opposite the elbow bump)
        _y.subVectors(_S, _E).normalize(); _z.copy(_p).negate(); _z.addScaledVector(_y, -_z.dot(_y)).normalize(); _x.crossVectors(_y, _z)
        _qU.setFromRotationMatrix(_m.makeBasis(_x, _y, _z))
        _y.subVectors(_E, W).normalize(); _z.copy(_p).negate(); _z.addScaledVector(_y, -_z.dot(_y)).normalize(); _x.crossVectors(_y, _z)
        _qF.setFromRotationMatrix(_m.makeBasis(_x, _y, _z))
        arm.sh.parent.getWorldQuaternion(_uq)
        _q.copy(_uq).invert().multiply(_qU)
        arm.sh.quaternion.slerp(_q, w)
        _q.copy(_qU).invert().multiply(_qF)
        arm.el.quaternion.slerp(_q, w)
    }

    chef.update = (t, dt, camPos) =>
    {
        root.rotation.y = s.yaw
        spine.rotation.x = s.lean

        for(const arm of [armL, armR])
        {
            const p = arm === armL ? 'l' : 'r', k = arm.side
            arm.sh.rotation.set(-s[p + 'sx'], 0, k * s[p + 'sz'])
            arm.el.rotation.set(-s[p + 'ex'], 0, 0)
        }
        if(chef.mode === 'wave') armR.el.rotation.z = -Math.sin(t * 11) * 0.4 - 0.1

        // walking: swing follows how fast the body moves along/across its own facing
        _mv.copy(root.position).sub(last); last.copy(root.position)
        const speed = dt > 0 ? _mv.length() / dt : 0
        const fwd = _mv.dot(_S.set(Math.sin(s.yaw), 0, Math.cos(s.yaw))), lat = _mv.dot(_S.set(Math.cos(s.yaw), 0, -Math.sin(s.yaw)))
        phase += _mv.length() * 7
        const stride = Math.min(1, speed * 1.1), sw = Math.sin(phase), dir = Math.abs(fwd) >= Math.abs(lat) ? Math.sign(fwd || 1) : 0
        legs[0].thigh.rotation.set(-sw * 0.6 * stride * dir, 0, dir === 0 ? sw * 0.3 * stride : 0)
        legs[1].thigh.rotation.set(sw * 0.6 * stride * dir, 0, dir === 0 ? -sw * 0.3 * stride : 0)
        legs[0].shin.rotation.x = Math.max(0, sw) * 0.7 * stride
        legs[1].shin.rotation.x = Math.max(0, -sw) * 0.7 * stride
        hips.position.y = HIP + Math.sin(t * 2.0) * 0.004 - Math.abs(sw) * 0.02 * stride
        spine.rotation.z = Math.sin(t * 0.9) * 0.012

        // IK over FK
        root.updateMatrixWorld(true)
        for(const [key, arm] of [['L', armL], ['R', armR]])
            if(ik[key].w > 0.001 && ik[key].target){ const tg = ik[key].target; solve(arm, typeof tg === 'function' ? tg() : tg, ik[key].w) }

        // gaze: yaw toward the target (default camera), pitch from pose
        head.rotation.x += (s.headX - head.rotation.x) * 0.15
        const tgt = chef.lookAt || camPos
        if(tgt)
        {
            const local = root.worldToLocal(_S.copy(tgt))
            head.rotation.y += (clamp(Math.atan2(local.x, local.z), -0.9, 0.9) - head.rotation.y) * 0.12
        }
        head.rotation.z = Math.sin(t * 0.7) * 0.02

        // blink + talk
        blinkAt -= dt
        if(blinkAt < 0){ blink = 0.12; blinkAt = 2 + Math.random() * 3 }
        blink = Math.max(0, blink - dt)
        eyes.scale.y = blink > 0 ? 0.08 : 1
        mouthOpen += ((chef.talking ? 0.4 + 0.6 * (Math.sin(t * 21) * 0.5 + 0.5) : 0) - mouthOpen) * 0.35
        lowerLip.position.y = -0.005 - mouthOpen * 0.009
        inside.scale.y = 0.3 + mouthOpen * 1.6
    }

    return chef
}
