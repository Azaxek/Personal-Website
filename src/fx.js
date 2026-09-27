// Cyberpunk look: a neon-lit reflection environment for the PBR props, and a bloom pass that turns bright emissives
// (signs, LED seams, bowl rims, hovered arrows) into glow. Bloom needs WebGL2 half-float targets, so it is skipped on
// touch devices and anything that can't do it; the scene still renders, just without the glow.
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'

// A dark room with a few colored light panels; PMREM-filtered so metal and glaze reflect pink/cyan streaks.
export function makeEnv(renderer)
{
    const env = new THREE.Scene()
    env.add(new THREE.Mesh(new THREE.BoxGeometry(14, 8, 14), new THREE.MeshBasicMaterial({ color: 0x14162a, side: THREE.BackSide })))
    const panel = (hex, k, w, h, pos, ry = 0, rx = 0) =>
    {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), side: THREE.DoubleSide }))
        m.position.set(...pos); m.rotation.set(rx, ry, 0); env.add(m)
    }
    panel(0xff2fd0, 7, 1.4, 6, [-6.5, 0, 2], Math.PI / 2)   // pink strip, street side
    panel(0x00c8ff, 7, 1.4, 6, [-6.5, 0, -3], Math.PI / 2)  // cyan strip
    panel(0xfff1dc, 5, 5, 2.4, [0, 3.8, 0], 0, Math.PI / 2) // warm softbox overhead
    panel(0x7a3cff, 3, 4, 1.2, [3, 0.5, -6.5], 0)           // violet wash behind
    panel(0xff8a3d, 2.5, 3, 1, [6.5, -1, 0], Math.PI / 2)   // amber from the kitchen
    const pmrem = new THREE.PMREMGenerator(renderer)
    const tex = pmrem.fromScene(env, 0.03).texture
    pmrem.dispose()
    return tex
}

// Final grade, applied after gamma: soft vignette, fine film grain, and a hint of chromatic aberration toward the edges.
const GradeShader = {
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
        uniform sampler2D tDiffuse; uniform float uTime; varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){
            vec2 c = vUv - 0.5; float d = dot(c, c);
            vec2 off = c * d * 0.014;
            vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
            col *= 1.0 - smoothstep(0.18, 0.72, d) * 0.5;
            col += (hash(vUv * 1024.0 + fract(uTime) * 91.0) - 0.5) * 0.028;
            gl_FragColor = vec4(col, 1.0);
        }`,
}

export function makeFx(renderer, scene, camera)
{
    if(!renderer.capabilities.isWebGL2 || matchMedia('(pointer: coarse)').matches) return null
    try
    {
        const size = renderer.getSize(new THREE.Vector2()), dpr = renderer.getPixelRatio()
        const target = new THREE.WebGLRenderTarget(size.x * dpr, size.y * dpr, { type: THREE.HalfFloatType, samples: 4 })
        const composer = new EffectComposer(renderer, target)
        composer.setPixelRatio(dpr); composer.setSize(size.x, size.y)
        composer.addPass(new RenderPass(scene, camera))
        const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.55, 0.6, 0.92)
        composer.addPass(bloom)
        composer.addPass(new ShaderPass(GammaCorrectionShader)) // targets are linear; this encodes to sRGB
        const grade = new ShaderPass(GradeShader); composer.addPass(grade)
        return { composer, bloom, setSize: (w, h) => composer.setSize(w, h), render: (dt, t) => { grade.uniforms.uTime.value = t; composer.render(dt) } }
    }
    catch(err){ console.warn('bloom disabled', err); return null }
}
