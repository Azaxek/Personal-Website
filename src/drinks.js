// The vending machine's drinks: four flavors, the tray where a bottle comes to rest, the layout of the selection tiles on
// the machine's screen, and the bottle itself (glass, liquid, a rolled quote scroll inside, printed label, pop-off cap).
import * as THREE from 'three'
import { lin, phys, mat, glow } from './mats.js'

export const FLAVORS = [
    { name: 'Neon Cola', color: '#ff3dcb', liquid: '#6a0f3f', cap: '#ff3dcb' },
    { name: 'Yuzu Fizz', color: '#ffe14d', liquid: '#a8860c', cap: '#ffe14d' },
    { name: 'Melon Soda', color: '#4dffa1', liquid: '#118a52', cap: '#4dffa1' },
    { name: 'Blue Volt', color: '#38b6ff', liquid: '#0f4f9c', cap: '#38b6ff' },
]

// where a dispensed bottle comes to rest: lying in the recessed tray at the bottom of the machine, neck toward +x
export const TRAY = { x: 1.1, y: -2.09, z: 2.9 }
export const BOTTLE_LEN = 0.49

// 2x2 selection tiles on the machine's screen, as fractions of the screen (x right, y down)
export const tileRect = (i) =>
{
    const col = i % 2, row = Math.floor(i / 2), x0 = 0.07 + col * 0.44, y0 = 0.2 + row * 0.335
    return { x0, y0, x1: x0 + 0.415, y1: y0 + 0.31 }
}
export const tileAt = (sx, sy) => FLAVORS.findIndex((_, i) => { const r = tileRect(i); return sx >= r.x0 && sx <= r.x1 && sy >= r.y0 && sy <= r.y1 })

function labelTexture(f)
{
    const S = 512, c = document.createElement('canvas'); c.width = c.height = S
    const g = c.getContext('2d')
    g.fillStyle = '#0c0e1a'; g.fillRect(0, 0, S, S)
    // the mapping runs the label's text along the bottle: draw rotated a quarter turn
    g.translate(S / 2, S / 2); g.rotate(-Math.PI / 2); g.translate(-S / 2, -S / 2)
    const grad = g.createLinearGradient(0, 0, S, 0); grad.addColorStop(0, f.color); grad.addColorStop(1, '#ffffff')
    g.fillStyle = f.color; g.globalAlpha = 0.18; g.fillRect(0, 0, S, S); g.globalAlpha = 1
    g.fillStyle = f.color; g.fillRect(0, 0, S, 22); g.fillRect(0, S - 22, S, 22)
    g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.shadowColor = f.color; g.shadowBlur = 18
    let px = 108; g.font = `900 ${px}px "Segoe UI Black","Arial Black",sans-serif`
    const words = f.name.toUpperCase().split(' ')
    while(Math.max(...words.map((w) => g.measureText(w).width)) > S * 0.88) g.font = `900 ${--px}px "Segoe UI Black","Arial Black",sans-serif`
    words.forEach((w, i) => g.fillText(w, S / 2, 190 + i * (px * 0.98)))
    g.shadowBlur = 0
    g.font = '700 34px "Consolas","Courier New",monospace'; g.fillStyle = f.color; g.fillText('QUOTE INSIDE', S / 2, 420)
    for(let i = 0; i < 7; i++){ g.beginPath(); g.arc(70 + i * 62, 90 + Math.sin(i * 1.7) * 14, 8 + (i % 3) * 3, 0, 6.3); g.strokeStyle = '#ffffff'; g.globalAlpha = 0.6; g.lineWidth = 3; g.stroke() }
    g.globalAlpha = 1
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8
    return t
}

// origin at the bottle's center, long axis along local +y (neck up); the caller lays it down
export function makeBottle(f)
{
    const outer = new THREE.Group(), body = new THREE.Group(); body.position.y = -BOTTLE_LEN / 2; outer.add(body)
    const glassPts = [[0.001, 0], [0.04, 0.002], [0.072, 0.012], [0.078, 0.05], [0.078, 0.27], [0.072, 0.31], [0.05, 0.345], [0.032, 0.375], [0.03, 0.435], [0.036, 0.448], [0.036, 0.462], [0.031, 0.47]]
    const glass = new THREE.Mesh(new THREE.LatheGeometry(glassPts.map(([r, y]) => new THREE.Vector2(r, y)), 40),
        new THREE.MeshPhysicalMaterial({ color: lin('#dff6ff'), transparent: true, opacity: 0.16, roughness: 0.04, clearcoat: 1, envMapIntensity: 0.9, side: THREE.DoubleSide, depthWrite: false }))
    glass.renderOrder = 3
    const liqPts = [[0.001, 0.008], [0.066, 0.014], [0.071, 0.05], [0.071, 0.26], [0.066, 0.3], [0.046, 0.335], [0.027, 0.362], [0.001, 0.362]]
    const liquid = new THREE.Mesh(new THREE.LatheGeometry(liqPts.map(([r, y]) => new THREE.Vector2(r, y)), 32),
        new THREE.MeshStandardMaterial({ color: lin(f.liquid), emissive: lin(f.color), emissiveIntensity: 0.85, transparent: true, opacity: 0.6, roughness: 0.1, depthWrite: false }))
    liquid.renderOrder = 2
    const arc = 2.0, labelMat = new THREE.MeshStandardMaterial({ map: labelTexture(f), roughness: 0.55, emissiveMap: null, side: THREE.DoubleSide })
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.0792, 0.0792, 0.16, 36, 1, true, -arc / 2, arc), labelMat); label.position.y = 0.16
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.17, 14), new THREE.MeshStandardMaterial({ color: lin('#f3e6c4'), emissive: lin('#f3e6c4'), emissiveIntensity: 0.9, roughness: 0.8 }))
    scroll.position.set(0.0, 0.22, 0.03); scroll.rotation.set(0.5, 0, 0.55)
    for(const y of [-0.05, 0.05]){ const band = new THREE.Mesh(new THREE.TorusGeometry(0.0125, 0.003, 6, 14), glow('#ff3dcb', 1.4)); band.rotation.x = Math.PI / 2; band.position.y = y; scroll.add(band) }
    const cap = new THREE.Group(); cap.position.y = 0.478
    const capBody = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.036, 0.022, 24), new THREE.MeshStandardMaterial({ color: lin(f.cap), roughness: 0.25, metalness: 0.9, envMapIntensity: 1.6 })); cap.add(capBody)
    const crimp = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.004, 6, 24), mat('#cfd6e4', { metalness: 1, roughness: 0.3 })); crimp.rotation.x = Math.PI / 2; crimp.position.y = -0.008; cap.add(crimp)
    body.add(liquid, scroll, label, glass, cap)
    return { group: outer, cap, body }
}
