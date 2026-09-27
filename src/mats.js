// Shared materials for the procedural props (chef, food, kitchen). PBR so metal and glaze pick up the neon environment
// from fx.js; `glow` materials are unlit and may exceed 1.0, which is what the bloom pass turns into neon.
import * as THREE from 'three'

// The renderer outputs sRGB, but three r139 does not color-manage hex values, so convert once here.
export const lin = (c) => new THREE.Color(c).convertSRGBToLinear()

export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color: lin(color), roughness: 0.6, metalness: 0, envMapIntensity: 0.6, ...o })
export const phys = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color: lin(color), roughness: 0.3, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.55, ...o })
// lit surface that also emits (LED strips, seams)
export const led = (color, intensity = 2.2, base = '#0a0c14', o = {}) => new THREE.MeshStandardMaterial({ color: lin(base), emissive: lin(color), emissiveIntensity: intensity, roughness: 0.4, ...o })
// unlit glow, value `k` > 1 brightens past white for bloom
export const glow = (color, k = 1, o = {}) => new THREE.MeshBasicMaterial({ color: lin(color).multiplyScalar(k), ...o })

let blobTex
export function blob(radius, opacity = 0.5)
{
    if(!blobTex)
    {
        const c = document.createElement('canvas'); c.width = c.height = 64
        const g = c.getContext('2d'), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
        grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(1, 'rgba(0,0,0,0)')
        g.fillStyle = grad; g.fillRect(0, 0, 64, 64)
        blobTex = new THREE.CanvasTexture(c)
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2),
        new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity, depthWrite: false }))
    m.rotation.x = -Math.PI / 2
    m.position.y = 0.012
    m.renderOrder = 1
    return m
}
