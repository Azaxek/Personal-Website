// The signpost in front of the shop: five signs that lead to the five places. Signs glow on hover and pulse gently while
// the visitor is standing at the post. Two signs need re-lettering (the baked "credits" arrow becomes "arcade", and the
// plain green square becomes a "drinks" sign), done with planes drawn just in front of them.
import * as THREE from 'three'

function overPlane(mesh, w, h, draw)
{
    const c = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3())
    const cw = 512, ch = Math.round(512 * h / w), canvas = document.createElement('canvas'); canvas.width = cw; canvas.height = ch
    draw(canvas.getContext('2d'), cw, ch)
    const map = new THREE.CanvasTexture(canvas); map.encoding = THREE.sRGBEncoding; map.anisotropy = 4
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map }))
    plane.position.set(c.x - 0.02, c.y, c.z); plane.rotation.y = -Math.PI / 2 // faces -x like the signs
    return plane
}

// same orange as the arrow, so the plane simply overprints the old text
const relabel = (textMesh, text) =>
{
    const s = new THREE.Box3().setFromObject(textMesh).getSize(new THREE.Vector3())
    textMesh.visible = false
    return overPlane(textMesh, s.z * 1.08, s.z * 1.08 / 4, (g, w, h) =>
    {
        g.fillStyle = '#ff9a00'; g.fillRect(0, 0, w, h)
        g.fillStyle = '#12100c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 96px "Consolas","Courier New",monospace'; g.fillText(text, w / 2, h / 2 + 6)
    })
}

const drinksSign = (square) =>
{
    const s = new THREE.Box3().setFromObject(square).getSize(new THREE.Vector3())
    return overPlane(square, s.z * 1.02, s.y * 1.02, (g, w, h) =>
    {
        g.fillStyle = '#0a2f1e'; g.fillRect(0, 0, w, h)
        g.strokeStyle = '#4dffa1'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20)
        // bottle glyph
        g.save(); g.translate(w / 2, h * 0.38); g.scale(w / 210, w / 210)
        g.beginPath(); g.moveTo(-14, -84); g.lineTo(14, -84); g.lineTo(14, -60); g.bezierCurveTo(14, -46, 42, -40, 42, -12); g.lineTo(42, 70); g.quadraticCurveTo(42, 84, 28, 84); g.lineTo(-28, 84); g.quadraticCurveTo(-42, 84, -42, 70); g.lineTo(-42, -12); g.bezierCurveTo(-42, -40, -14, -46, -14, -60); g.closePath()
        g.fillStyle = 'rgba(77,255,161,0.55)'; g.fill(); g.strokeStyle = '#eafff3'; g.lineWidth = 5; g.stroke()
        g.fillStyle = '#eafff3'; g.fillRect(-42, 0, 84, 46); g.fillStyle = '#4dffa1'; g.fillRect(-42, 10, 84, 10)
        g.restore()
        g.textAlign = 'center'; g.fillStyle = '#eafff3'; g.font = '800 64px "Consolas","Courier New",monospace'; g.fillText('DRINKS', w / 2, h * 0.86)
        g.fillStyle = '#4dffa1'; g.font = '800 34px "Consolas","Courier New",monospace'; g.fillText('▸ FREE', w / 2, h * 0.94)
    })
}

export function makeHub(byName, defs, parent)
{
    const items = defs.map((d, i) =>
    {
        const [arrowName, textName] = d.arrow
        const arrow = byName(arrowName), text = textName ? byName(textName) : null
        arrow.material = arrow.material.clone() // signs share materials with other meshes; give each its own
        const meshes = [arrow, ...(text ? [text] : [])], mats = [arrow.material]
        const extra = d.relabel ? relabel(text, d.relabel) : d.overlay === 'drinks' ? drinksSign(arrow) : null
        if(extra){ parent.add(extra); meshes.push(extra); mats.push(extra.material) }
        return { id: d.id, arrow, meshes, mats, bases: mats.map((m) => m.color.clone()), phase: i * 1.3 }
    })
    let hot = null

    return {
        items,
        // which sign (if any) does this ray hit?
        pick(ray){ const h = ray.intersectObjects(items.flatMap((it) => it.meshes), false)[0]; return h ? items.find((it) => it.meshes.includes(h.object)).id : null },
        setHot(id){ hot = id },
        update(t, active)
        {
            for(const it of items)
            {
                const f = it.id === hot ? 1.9 : active ? 1.15 + 0.3 * Math.sin(t * 3 + it.phase) : 1
                it.mats.forEach((m, k) => m.color.copy(it.bases[k]).multiplyScalar(f))
            }
        },
        center: (id) => new THREE.Box3().setFromObject(items.find((it) => it.id === id).arrow).getCenter(new THREE.Vector3()),
    }
}
