import { fileURLToPath } from 'node:url'

// Two pages: the site (index.html) and the hidden photo list (photos/index.html).
// /photos/ and /photos/<name> are both served by photos/index.html, which reads the name from the URL —
// Vercel does the same through vercel.json. Real files like /photos/robotics.jpg are untouched.
const photoPages = () => {
    const rewrite = (req, _res, next) => {
        if(/^\/photos\/?$|^\/photos\/[a-z0-9-]+\/?$/.test((req.url || '').split('?')[0])) req.url = '/photos/index.html'
        next()
    }
    // (braces matter: Vite treats anything these hooks *return* as a function to run later)
    return { name: 'photo-pages', configureServer(s) { s.middlewares.use(rewrite) }, configurePreviewServer(s) { s.middlewares.use(rewrite) } }
}

export default {
    // absolute base: /photos/<name> and /photos/ sit at different depths, so relative asset paths would break
    base: '/',
    plugins: [photoPages()],
    build: {
        rollupOptions: {
            input: {
                main: fileURLToPath(new URL('./index.html', import.meta.url)),
                photos: fileURLToPath(new URL('./photos/index.html', import.meta.url)),
            },
        },
    },
}
