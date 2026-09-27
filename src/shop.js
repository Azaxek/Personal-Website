// Loads the baked ramen-shop diorama (unlit meshes + baked KTX2 lightmaps) and applies the flat sign colors.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'

const BAKED = {
    ramenShopJoined: 'ramenShopBaked1024',
    machinesJoined: 'machinesBaked1024',
    floor: 'floorBaked1024',
    miscJoined: 'miscBaked1024',
    graphicsJoined: 'graphicsBaked512',
}

const COLORS = {
    '#1EFF51': ['greenSignSquare', 'chinese'],
    '#FF0033': ['projectsRed', 'articlesRed'],
    '#FFFFFF': ['projectsWhite', 'articlesWhite', 'whiteButton', 'vendingMachineLight', 'lampLights'],
    '#000000': ['aboutMeBlack', 'creditsBlack'],
    '#01DDFF': ['aboutMeBlue', 'blueLights'],
    '#FF5100': ['creditsOrange', 'yellowRightLight'],
    '#FF112B': ['redLED', 'arcadeToken'],
    '#00FF00': ['greenLED'],
    '#FFF668': ['neonYellow'],
    '#FF3DCB': ['neonPink'],
    '#00BBFF': ['neonBlue', 'portalLight', 'storageLight', 'arcadeRim'],
    '#FF5EF1': ['poleLight'],
    '#56FF54': ['neonGreen'],
    // screens: the original shows another person's content, so they get a dim glow instead
    '#0d3b4a': ['bigScreen', 'smallScreen1', 'smallScreen2', 'smallScreen3', 'smallScreen4', 'smallScreen5',
        'tallScreen', 'sideScreen', 'tvScreen', 'littleTVScreen', 'vendingMachineScreen', 'arcadeScreen', 'easelFrontGraphic'],
}

// Meshes that carry the original author's name/branding.
const HIDDEN = ['jesseZhouJoined', 'jZhouPink', 'jZhouBlack']

// Remove every triangle of `mesh` whose world-space centroid lies inside `box`.
function cutBox(mesh, box)
{
    const g = mesh.geometry, pos = g.attributes.position, idx = g.index.array
    const v = new THREE.Vector3(), c = new THREE.Vector3(), keep = []
    for(let i = 0; i < idx.length; i += 3)
    {
        c.set(0, 0, 0)
        for(let k = 0; k < 3; k++) c.add(v.fromBufferAttribute(pos, idx[i + k]).applyMatrix4(mesh.matrixWorld))
        if(!box.containsPoint(c.multiplyScalar(1 / 3))) keep.push(idx[i], idx[i + 1], idx[i + 2])
    }
    g.setIndex(keep)
}

// Stricter: remove only triangles that lie entirely inside `box`, and never the flat counter-top surface itself.
// Catches the small leftovers of baked props (bowl bottoms, cup rims) without carving holes in the big surfaces.
function cutInside(mesh, box, flatY)
{
    const g = mesh.geometry, pos = g.attributes.position, idx = g.index.array
    const v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], keep = []
    for(let i = 0; i < idx.length; i += 3)
    {
        for(let k = 0; k < 3; k++) v[k].fromBufferAttribute(pos, idx[i + k]).applyMatrix4(mesh.matrixWorld)
        const inside = v.every((p) => box.containsPoint(p)), flat = v.every((p) => Math.abs(p.y - flatY) < 0.008)
        if(!inside || flat) keep.push(idx[i], idx[i + 1], idx[i + 2])
    }
    g.setIndex(keep)
}

// Rectangle whose alpha feathers to 0 at the edges: paints over baked shadow without a visible outline.
// `feather` = [across, along] as fractions of the plane's width/length.
function softRect(color, feather)
{
    const N = 256, c = document.createElement('canvas'); c.width = c.height = N
    const g = c.getContext('2d'), img = g.createImageData(N, N), col = new THREE.Color(color)
    const ss = (e, x) => { const t = Math.min(1, Math.max(0, x / e)); return t * t * (3 - 2 * t) }
    for(let y = 0; y < N; y++) for(let x = 0; x < N; x++)
    {
        const u = x / (N - 1), v = y / (N - 1), i = (y * N + x) * 4
        img.data[i] = col.r * 255; img.data[i + 1] = col.g * 255; img.data[i + 2] = col.b * 255
        img.data[i + 3] = 255 * ss(feather[0], Math.min(u, 1 - u)) * ss(feather[1], Math.min(v, 1 - v))
    }
    g.putImageData(img, 0, 0)
    const map = new THREE.CanvasTexture(c); map.encoding = THREE.sRGBEncoding
    return new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false })
}

// Replacement for the baked "JESSE'S RAMEN" lettering: a plane in front of the sign's text band (measured in world space).
export function makeSign(text)
{
    const w = 1536, h = 224, c = document.createElement('canvas'); c.width = w; c.height = h
    const g = c.getContext('2d')
    g.fillStyle = '#35505f'; g.fillRect(0, 0, w, h)
    let size = 150; const face = (s) => `900 ${s}px "Segoe UI Black", "Arial Black", Impact, sans-serif`
    g.font = face(size)
    while(g.measureText(text).width > w * 0.9 && size > 40) g.font = face(--size)
    g.textAlign = 'center'; g.textBaseline = 'middle'
    g.lineJoin = 'round'; g.shadowColor = '#ff3dcb'; g.shadowBlur = 22
    const ty = h / 2 - 6 // text sits a little above center: the extra height below hides the baked wave pattern
    g.lineWidth = 9; g.strokeStyle = '#ff8fe6'; g.strokeText(text, w / 2, ty)
    g.shadowBlur = 0; g.fillStyle = '#5c1c58'; g.fillText(text, w / 2, ty)
    const map = new THREE.CanvasTexture(c); map.encoding = THREE.sRGBEncoding; map.anisotropy = 4
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.885, 0.567), new THREE.MeshBasicMaterial({ map }))
    plane.position.set(-2.445, 1.09, -0.958) // baked letters are 3D and reach x=-2.43; the neon border reaches -2.49
    plane.rotation.y = -Math.PI / 2 // faces -x, toward the customers
    return plane
}

export function loadShop(renderer)
{
    const draco = new DRACOLoader().setDecoderPath('draco/')
    const gltf = new GLTFLoader().setDRACOLoader(draco)
    const ktx2 = new KTX2Loader().setTranscoderPath('basis/').detectSupport(renderer)
    const tex = (path) => ktx2.loadAsync(path).then((t) => { t.encoding = THREE.sRGBEncoding; return t })
    // the floor bake is a retouched PNG (original author's name painted out); everything else stays KTX2
    const floorTex = new THREE.TextureLoader().loadAsync('textures/baked/floorBaked1024_clean.png')
        .then((t) => { t.flipY = false; t.encoding = THREE.sRGBEncoding; return t })

    return Promise.all([
        gltf.loadAsync('models/ramenShop.gltf'),
        tex('textures/matcaps/fanMatCap.ktx2'),
        tex('textures/matcaps/dishMatCap.ktx2'),
        ...Object.entries(BAKED).map(([mesh, n]) => (mesh === 'floor' ? floorTex : tex(`textures/baked/${n}.ktx2`))),
    ]).then(([model, fanCap, dishCap, ...baked]) =>
    {
        const byName = (n) => model.scene.children.find((c) => c.name === n)

        Object.keys(BAKED).forEach((n, i) => { byName(n).material = new THREE.MeshBasicMaterial({ map: baked[i] }) })
        for(const [color, names] of Object.entries(COLORS))
        {
            const m = new THREE.MeshBasicMaterial({ color })
            names.forEach((n) => { byName(n).material = m })
        }
        HIDDEN.forEach((n) => { byName(n).visible = false })

        const fanMat = new THREE.MeshMatcapMaterial({ matcap: fanCap })
        const dishMat = new THREE.MeshMatcapMaterial({ matcap: dishCap, side: THREE.DoubleSide })
        const fans = ['fan1', 'fan2'].map(byName)
        fans.forEach((f) => { f.material = fanMat })
        ;['dish', 'dishStand'].forEach((n) => { byName(n).material = dishMat })

        model.scene.position.y = -3 // same offset the original uses
        model.scene.updateMatrixWorld(true)

        // The hanging kanji banners sit between the customers and the chef's face. They're baked into one merged mesh,
        // so drop their triangles (world-space box) and hide the floating glyph mesh.
        cutBox(byName('ramenShopJoined'), new THREE.Box3(new THREE.Vector3(-1.78, -1.45, -3.3), new THREE.Vector3(-1.6, -0.63, 1.3)))
        byName('chinese').visible = false

        // The baked bowls, cup and bottle on the customer half of the counter would sit between the camera and every
        // served dish. Remove them (one box over the whole strip; the counter top itself is at y=-1.74) and hide the
        // contact shadows baked into the counter texture with soft counter-colored patches.
        cutBox(byName('ramenShopJoined'), new THREE.Box3(new THREE.Vector3(-3.05, -1.72, -2.75), new THREE.Vector3(-2.02, -1.0, -0.12)))
        cutInside(byName('ramenShopJoined'), new THREE.Box3(new THREE.Vector3(-3.2, -1.8, -3.0), new THREE.Vector3(-1.45, -1.0, 0.9)), -1.74)
        const W = 1.05, L = 2.85 // x extent, z extent of the strip
        const strip = new THREE.Mesh(new THREE.PlaneGeometry(W, L), softRect('#e2c37a', [0.16, 0.06]))
        strip.rotation.x = -Math.PI / 2 // lies flat: width along x, length along z
        strip.position.set(-2.475, -1.712 - model.scene.position.y, -1.42)
        model.scene.add(strip)
        return { scene: model.scene, fans, byName }
    })
}
