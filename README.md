# Arjan Khadka — portfolio

A single-page portfolio: a short water/streams intro, then one continuous scroll with everything readable
without clicking into anything — projects, experience, leadership, honors, skills, writing, and contact.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## How it's organised

- [`src/data.js`](src/data.js) — all content (name, bio, stats, projects, experience, leadership, honors,
  skills, writing, press, and the "beyond this" section). Edit this file to change what's on the page.
- [`src/main.js`](src/main.js) — renders `data.js` into `#content`, runs the intro, animates the stat
  count-up, and reveals entries as they scroll into view.
- [`src/style.css`](src/style.css) — the look: dark background, serif headlines, monospace tags/meta,
  a handwritten accent font for the epigraph and project asides ("notes"), and the intro's water/stream
  animation.
- [`index.html`](index.html) — page shell: the intro overlay markup, the sticky nav, and the content mount.

Each project has a `status` (`live` / `testing` / `research` / `built`) rendered as a colored pill — keep
these current rather than decorative. A project or role can carry a `note`, shown as a small handwritten
aside, for real texture that doesn't fit the main copy.

To show a real photo next to the bio, drop an image at `public/photo.jpg` and set `hero.photo` in
`src/data.js` to `/photo.jpg`.

Any project, experience, or leadership entry can carry a `photos: ['/photos/whatever.jpg', ...]` array —
this shows a "View photos" button that opens a full-screen slideshow (prev/next arrows, a counter, Escape
or click-outside to close). Drop images in `public/photos/` and reference them from there.

## Sources

LinkedIn (pasted), resumes, three local news articles, and YouTube. Dates follow LinkedIn where it
disagrees with the resume (Project Hope, Crime Stoppers Ambassador). Left out on purpose: phone number,
GPA, LinkedIn's private analytics — email is in Contact.
