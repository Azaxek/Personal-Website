// Scroll-driven iMac G3 hero, built from the real model at /models/imac.glb.
// One master GSAP timeline, scrubbed by ScrollTrigger (which owns the pin), smoothed by Lenis.
// The timeline only tweens a plain `state` object; render() derives the whole pose from it, so the
// camera, model and screen texture can never disagree about where we are in the sequence.
//   TURN    — the iMac swings round from its back to face the camera while the camera eases in
//   BOOT    — the screen (a CanvasTexture, unlit) shows the Apple logo + progress bar, then types a boot log
//   ZOOM    — the camera orbits+dollies onto the screen's own center/normal until it overfills the viewport
//   HANDOFF — with the screen filling frame, canvas + studio backdrop fade out onto the real page behind
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { lenis } from './smooth.js'

gsap.registerPlugin(ScrollTrigger)

// Apple logo, 24x24 viewBox — simple-icons (CC0).
const APPLE_PATH = 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701'

const BOOT_LINES = ['$ boot portfolio.sh', '', 'loading profile......... done', 'loading projects......... done', 'loading experience....... done', '', '> welcome. scroll to enter_']
const BOOT_TEXT = BOOT_LINES.join('\n')

// Timeline layout, in arbitrary units (ScrollTrigger maps the whole thing onto the pinned scroll).
const T = { TURN: 4.4, BOOT_AT: 4.2, BOOT: 3.0, ZOOM_AT: 7.0, ZOOM: 3.4 }
const END = T.ZOOM_AT + T.ZOOM + 0.4
const START_YAW = -1.4 // radians; ~80 degrees round from the front, so we begin on the side profile

const HERO_DIR = new THREE.Vector3(-0.9, 0.22, 0.4).normalize() // front-left 3/4, a touch above
const START_DIR = new THREE.Vector3(-0.8, 0.5, 0.45).normalize()

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (x, a, b) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }

function firstMesh(obj)
{
    let found = null
    obj.traverse((n) => { if(!found && n.isMesh) found = n })
    return found
}

// The screen quad's true center / outward normal / width / height, read from its own world-space
// vertices — no guessing which local axis is "front" for this export. towardRef picks which of the
// two possible normals counts as outward (the side the hero camera sits on).
function getScreenFrame(mesh, towardRef)
{
    mesh.updateWorldMatrix(true, false)
    const pos = mesh.geometry.attributes.position
    const pts = []
    for (let i = 0; i < pos.count; i++) pts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld))
    const center = new THREE.Box3().setFromPoints(pts).getCenter(new THREE.Vector3())
    const normal = pts[1].clone().sub(pts[0]).cross(pts[2].clone().sub(pts[0])).normalize()
    if(normal.dot(towardRef.clone().sub(center)) < 0) normal.negate()
    const right = new THREE.Vector3(0, 1, 0).cross(normal).normalize()
    const up = normal.clone().cross(right)
    let minR = Infinity, maxR = -Infinity, minU = Infinity, maxU = -Infinity
    for (const p of pts) {
        const d = p.clone().sub(center)
        const r = d.dot(right), u = d.dot(up)
        minR = Math.min(minR, r); maxR = Math.max(maxR, r)
        minU = Math.min(minU, u); maxU = Math.max(maxU, u)
    }
    center.addScaledVector(right, (minR + maxR) / 2).addScaledVector(up, (minU + maxU) / 2)
    return { center, normal, width: maxR - minR, height: maxU - minU }
}

// The CRT: logo + progress bar, then a typed boot log, all drawn from one `boot` value (0..1).
function makeScreen(aspect, maxAniso)
{
    const W = 1600, H = Math.round(W / aspect)
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')
    const apple = new Path2D(APPLE_PATH)

    // Scanlines + vignette, drawn once and laid over every frame.
    const scan = document.createElement('canvas')
    scan.width = W; scan.height = H
    const sctx = scan.getContext('2d')
    sctx.fillStyle = 'rgba(0,0,0,.16)'
    for (let y = 0; y < H; y += 4) sctx.fillRect(0, y, W, 1)
    const vg = sctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, 'rgba(0,0,0,.5)')
    sctx.fillStyle = vg
    sctx.fillRect(0, 0, W, H)

    function draw(boot, blinkOn)
    {
        ctx.fillStyle = '#03100b'
        ctx.fillRect(0, 0, W, H)
        const glow = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.05, W / 2, H * 0.5, H * 0.85)
        glow.addColorStop(0, 'rgba(40,130,95,.32)')
        glow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.globalAlpha = smooth(boot, 0, 0.06)
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, W, H)

        const la = smooth(boot, 0.03, 0.15) * (1 - smooth(boot, 0.46, 0.54))
        if(la > 0.002) {
            ctx.globalAlpha = la
            const s = (H * 0.22) / 24
            ctx.save()
            ctx.translate(W / 2 - 12 * s, H * 0.4 - 12 * s)
            ctx.scale(s, s)
            ctx.shadowColor = 'rgba(150,255,210,.55)'
            ctx.shadowBlur = H * 0.04 / s
            ctx.fillStyle = '#eafff5'
            ctx.fill(apple)
            ctx.restore()
            const bw = W * 0.2, bh = H * 0.014, bx = W / 2 - bw / 2, by = H * 0.64
            ctx.fillStyle = 'rgba(234,255,245,.16)'
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, bh / 2); ctx.fill()
            const fw = bw * smooth(boot, 0.12, 0.46)
            if(fw > bh) { ctx.fillStyle = '#eafff5'; ctx.beginPath(); ctx.roundRect(bx, by, fw, bh, bh / 2); ctx.fill() }
        }
        ctx.globalAlpha = 1

        const typed = clamp01((boot - 0.54) / 0.42)
        if(typed > 0) {
            const lines = BOOT_TEXT.slice(0, Math.floor(typed * BOOT_TEXT.length)).split('\n')
            const fs = H * 0.046, lh = H * 0.08, x = W * 0.1, y0 = H * 0.24
            ctx.font = `${fs}px "Space Grotesk", ui-sans-serif, sans-serif`
            ctx.textBaseline = 'top'
            ctx.shadowColor = 'rgba(93,255,176,.55)'
            ctx.shadowBlur = H * 0.012
            ctx.fillStyle = '#7dffc0'
            lines.forEach((line, i) => ctx.fillText(line, x, y0 + i * lh))
            if(blinkOn) {
                const last = lines.length - 1
                ctx.fillRect(x + ctx.measureText(lines[last]).width + fs * 0.15, y0 + last * lh, fs * 0.55, fs)
            }
            ctx.shadowBlur = 0
        }
        ctx.drawImage(scan, 0, 0)
    }

    draw(0, false)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = maxAniso
    return { draw, texture }
}

function buildScene(container)
{
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) // transparent: the backdrop is CSS
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap // PCFSoftShadowMap was removed in recent three
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2))
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 50)

    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.5 // dark studio: the room env is only a fill, the key/rim lights do the shaping

    scene.add(new THREE.HemisphereLight('#dfe8ff', '#20140a', 0.55))
    const key = new THREE.DirectionalLight('#ffffff', 1.3)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.bias = -0.0004
    scene.add(key, key.target)
    const rim = new THREE.PointLight('#ffb87a', 3.5, 0, 2)
    scene.add(rim)

    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.5 }))
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)

    // Lights, shadow frustum and ground, sized to the model (centered on the origin).
    function fitTo(size)
    {
        const maxDim = Math.max(size.x, size.y, size.z)
        key.position.set(-maxDim * 0.8, maxDim * 1.8, maxDim * 1.2)
        key.shadow.camera.near = maxDim * 0.1
        key.shadow.camera.far = maxDim * 6
        const pad = maxDim * 1.6
        key.shadow.camera.left = -pad; key.shadow.camera.right = pad
        key.shadow.camera.top = pad; key.shadow.camera.bottom = -pad
        key.shadow.camera.updateProjectionMatrix()
        rim.position.set(maxDim * 1.6, maxDim * 0.4, -maxDim * 1.2)
        rim.distance = maxDim * 6
        shadowPlane.scale.setScalar(maxDim * 6)
        shadowPlane.position.set(0, -size.y / 2 - maxDim * 0.01, 0)
        camera.near = maxDim * 0.05
        camera.far = maxDim * 40
        camera.updateProjectionMatrix()
        return maxDim
    }

    function setSize(w, h)
    {
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
    }

    return { renderer, scene, camera, fitTo, setSize }
}

export function initIMacScene({ pin, container, loading })
{
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const debug = new URLSearchParams(location.search).get('debug') === '1'

    let built
    try { built = buildScene(container) } catch {
        pin.classList.add('no-webgl')
        loading.classList.add('done')
        return () => {}
    }
    const { renderer, scene, camera, fitTo, setSize } = built

    const studio = document.createElement('div')
    studio.className = 'imac-studio'
    pin.insertBefore(studio, pin.firstChild)

    let hint = null
    if(!reduced) {
        hint = document.createElement('div')
        hint.className = 'imac-hint'
        hint.textContent = 'scroll'
        pin.appendChild(hint)
    }

    let disposed = false
    let st = null, tl = null, tick = null, onLayout = null
    let inView = true
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting })
    io.observe(pin)

    new GLTFLoader().load('/models/imac.glb', (gltf) => {
        if(disposed) return
        const root = gltf.scene

        // Center the model on the origin, then turn it inside a pivot — so the turntable spins about
        // the middle of the whole set, not wherever the exporter put the origin.
        const box = new THREE.Box3().setFromObject(root)
        root.position.sub(box.getCenter(new THREE.Vector3()))
        const pivot = new THREE.Group()
        pivot.add(root)
        scene.add(pivot)
        pivot.updateMatrixWorld(true)
        const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3())
        const maxDim = fitTo(size)

        root.traverse((node) => {
            if(!node.isMesh) return
            node.castShadow = true; node.receiveShadow = true
            // Every material in this GLB exports with ior:1000 (a bogus default — real values are
            // ~1.4-1.5). At near-total Fresnel reflectance any glossy surface becomes a hard mirror.
            if(node.material?.ior > 10) node.material.ior = 1.5
            if(node.material?.name === 'black1_0_0.001') node.material.color.set(0x141414)
            if(node.material?.name === 'monitor_glass') { node.material.roughness = 0.4; node.material.envMapIntensity = 0.4 }
            // This sub-mesh's own surface detail showed through as a grille pattern in the screen
            // corner; swap in a plain glossy-plastic shell (slightly grey + clearcoat so the form
            // reads under the studio lights instead of blowing out to flat white).
            if(node.material?.name === 'Metallic_0_0.001') node.material = new THREE.MeshPhysicalMaterial({ color: '#b9c6c6', roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.22 })
            // Case interior ("color_base", saturated blue) sits right behind the glass and showed
            // through as a shape over the terminal. Not needed from outside — hide it.
            if(node.name === 'Object_16') node.visible = false
        })

        const screenMesh = firstMesh(root.getObjectByName('screen_image_6'))
        // screen_process_7 occupies the same region and is redundant with the terminal texture.
        const redundant = root.getObjectByName('screen_process_7')
        if(redundant) redundant.visible = false

        // Screen frame in the rest pose (pivot is identity here, so this is also pivot-local).
        const restHero = HERO_DIR.clone().multiplyScalar(maxDim * 2.55)
        const frame = getScreenFrame(screenMesh, restHero)
        const screen = makeScreen(frame.width / frame.height, renderer.capabilities.getMaxAnisotropy())
        // Unlit + untonemapped so the CRT colors come out exactly as drawn. polygonOffset pulls the
        // thin plane just in front of the cavity wall it nearly coincides with (instead of turning
        // the depth test off, which would paint the terminal through the case from behind).
        screenMesh.material = new THREE.MeshBasicMaterial({
            map: screen.texture, toneMapped: false, side: THREE.DoubleSide,
            polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
        })

        loading.classList.add('done')
        gsap.fromTo(renderer.domElement, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out' })

        // Everything the timeline drives lives here.
        const state = { yaw: START_YAW, push: 0, dolly: 0, boot: 0, zoom: 0 }
        if(reduced) Object.assign(state, { yaw: 0, push: 1, dolly: 1, boot: 1 })

        // Camera anchors, recomputed whenever the viewport aspect changes.
        const camStart = new THREE.Vector3(), camHero = new THREE.Vector3(), camClose = new THREE.Vector3()
        let zoomDist = 1
        function layout()
        {
            const portraitK = Math.max(1, 1.2 / camera.aspect) // back off in portrait so the set still fits
            const dist = maxDim * 2.55 * portraitK
            camHero.copy(HERO_DIR).multiplyScalar(dist)
            camStart.copy(START_DIR).multiplyScalar(dist * 1.2)
            camClose.copy(camHero).lerp(frame.center, 0.2)
            // Distance at which the screen quad exactly covers the viewport; landscape overfills a
            // hair (so no bezel peeks out), portrait fits the width instead.
            const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
            const rH = (frame.height / 2) / tanV
            const rW = (frame.width / 2) / (tanV * camera.aspect)
            zoomDist = camera.aspect >= 1 ? Math.min(rH, rW) * 0.97 : Math.max(rH, rW) * 1.02
        }
        onLayout = layout
        layout()

        // --- timeline: only tweens `state` -------------------------------------------------------
        tl = gsap.timeline({ paused: true })
        tl.to(state, { yaw: 0, duration: T.TURN, ease: 'power1.inOut' }, 0)
        tl.to(state, { push: 1, duration: T.TURN, ease: 'sine.inOut' }, 0)
        tl.to(state, { dolly: 1, duration: T.BOOT, ease: 'sine.inOut' }, T.BOOT_AT)
        tl.to(state, { boot: 1, duration: T.BOOT, ease: 'none' }, T.BOOT_AT)
        tl.to(state, { zoom: 1, duration: T.ZOOM, ease: 'power2.inOut' }, T.ZOOM_AT)
        tl.to([container, studio], { opacity: 0, duration: 0.9, ease: 'power1.inOut' }, T.ZOOM_AT + T.ZOOM - 0.6)
        if(hint) tl.to(hint, { opacity: 0, duration: 0.5, ease: 'none' }, 0)
        tl.set({}, {}, END)

        // --- per-frame render --------------------------------------------------------------------
        const pointer = { x: 0, y: 0 }, cur = { x: 0, y: 0 }
        window.addEventListener('pointermove', (e) => {
            pointer.x = e.clientX / window.innerWidth - 0.5
            pointer.y = e.clientY / window.innerHeight - 0.5
        })
        const base = new THREE.Vector3(), target = new THREE.Vector3(), dir = new THREE.Vector3()
        const sc = new THREE.Vector3(), sn = new THREE.Vector3()
        const q = new THREE.Quaternion(), qz = new THREE.Quaternion()
        let clock = 0, lastKey = '', fontsDirty = true
        document.fonts?.load('40px "Space Grotesk"').then(() => { fontsDirty = true; if(reduced) tick(0, 16) })

        function updateCamera()
        {
            // Hero pose: wide/high start easing to the 3/4 shot, then a small push-in during BOOT.
            base.lerpVectors(camStart, camHero, state.push).lerp(camClose, state.dolly)
            target.copy(pivot.position)
            const z = state.zoom
            if(z <= 0) { camera.position.copy(base); camera.lookAt(target); return }

            // ZOOM: orbit + dolly around the screen's *live* center onto its live normal. Distance
            // is interpolated geometrically (even perceived zoom), direction by slerp, and the look
            // target locks onto the screen center — so the screen stays dead-center, ending head-on.
            sc.copy(frame.center).applyMatrix4(pivot.matrixWorld)
            sn.copy(frame.normal).transformDirection(pivot.matrixWorld)
            dir.copy(base).sub(sc)
            const r0 = dir.length()
            dir.divideScalar(r0)
            q.setFromUnitVectors(dir, sn)
            qz.identity().slerp(q, z)
            dir.applyQuaternion(qz)
            camera.position.copy(sc).addScaledVector(dir, r0 * Math.pow(zoomDist / r0, z))
            target.lerp(sc, smooth(z, 0, 0.25))
            camera.lookAt(target)
        }

        tick = (_, deltaMs) => {
            if(!inView) return
            const dt = Math.min(deltaMs, 50) / 1000
            clock += dt
            const idle = reduced ? 0 : 1 - smooth(state.zoom, 0, 0.35)
            cur.x = THREE.MathUtils.damp(cur.x, pointer.x, 3, dt)
            cur.y = THREE.MathUtils.damp(cur.y, pointer.y, 3, dt)
            pivot.rotation.set(0, state.yaw + cur.x * 0.14 * idle, cur.y * 0.05 * idle)
            pivot.position.y = Math.sin(clock * 0.9) * maxDim * 0.008 * idle
            pivot.updateMatrixWorld(true)

            const blinkOn = state.boot < 0.99 || Math.floor(clock / 0.53) % 2 === 0
            const key = state.boot.toFixed(4) + blinkOn
            if(key !== lastKey || fontsDirty) {
                lastKey = key; fontsDirty = false
                screen.draw(state.boot, blinkOn)
                screen.texture.needsUpdate = true
            }

            updateCamera()
            renderer.render(scene, camera)
        }

        if(reduced) {
            tick(0, 16)
        } else {
            // refreshPriority + refresh: the model loads async, after the page's other triggers were
            // measured, so the pin spacer this adds has to push them down and re-measure everything.
            st = ScrollTrigger.create({
                trigger: pin, start: 'top top', end: () => `+=${Math.round(window.innerHeight * 6)}`,
                pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true, animation: tl, refreshPriority: 1,
            })
            ScrollTrigger.refresh()
            gsap.ticker.add(tick)
        }

        const seek = (p) => {
            const y = st.start + (st.end - st.start) * p
            if(lenis) lenis.scrollTo(y, { immediate: true, force: true })
            else window.scrollTo(0, y)
        }
        if(debug) {
            window.__imacDebug = { THREE, scene, camera, pivot, root, renderer, size, frame, state, tl, st, lenis, seek, screen, T, END }
            const bar = document.createElement('div')
            bar.className = 'imac-debug'
            bar.innerHTML = '<span>timeline</span><input type="range" min="0" max="1" step="0.001" value="0"><span class="val">0.00</span>'
            document.body.appendChild(bar)
            const input = bar.querySelector('input'), val = bar.querySelector('.val')
            input.addEventListener('input', () => { seek(+input.value); val.textContent = (+input.value).toFixed(2) })
        }

        setSize(container.clientWidth, container.clientHeight)
        layout()
    }, undefined, (err) => {
        console.error('Failed to load /models/imac.glb', err)
        loading.textContent = 'model failed to load'
    })

    // ResizeObserver over window 'resize' — catches container size changes regardless of cause.
    const resizeObserver = new ResizeObserver(() => {
        setSize(container.clientWidth, container.clientHeight)
        onLayout?.()
        if(reduced) tick?.(0, 16) // no render loop in reduced-motion mode, and resizing clears the canvas
    })
    resizeObserver.observe(container)
    setSize(container.clientWidth, container.clientHeight)

    return function dispose()
    {
        disposed = true
        io.disconnect()
        resizeObserver.disconnect()
        if(tick) gsap.ticker.remove(tick)
        st?.kill()
        tl?.kill()
        scene.traverse((node) => {
            if(node.isMesh) {
                node.geometry?.dispose()
                ;(Array.isArray(node.material) ? node.material : [node.material]).forEach((m) => { m?.map?.dispose(); m?.dispose() })
            }
        })
        renderer.dispose()
    }
}
