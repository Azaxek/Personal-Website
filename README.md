# Arjan's Ramen: portfolio as a ramen shop

A 3D portfolio (Three.js) styled as a ramen stall under a neon billboard tower. You're let in automatically, the chef
greets you and introduces the owner, hands over a menu, and cooks and serves whichever project you pick. Look up and
the tower's billboards lead to the rest of the story.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## How the portfolio is organised

You land at the **signpost** in front of the shop (the pole with five signs). Click a sign, or use the five chips at the
bottom of the screen (keyboard and touch friendly), and the camera flies there.

| Sign | Place | Content |
| --- | --- | --- |
| projects | the ramen shop | a menu handed over by the chef; each dish is made in front of you and is a project ([`src/menu.js`](src/menu.js)) |
| about me | the billboard tower | About (animated hologram ID), Experience, Leadership, Honors, Skills, Contact ("ON AIR") ([`src/content.js`](src/content.js)) |
| articles | the sidewalk chalkboard | posts by you and coverage of you |
| arcade (was "credits") | the arcade cabinet | Shell Shockers in a window, plus band (season-by-season YouTube links), robotics, debate |
| drinks (the green square) | the vending machine | pick a bottle: a random favorite quote is dispensed inside it ([`src/quotes.js`](src/quotes.js)) |

Inside the tower, clicking another billboard or the **Next** button moves along it; **⌂ Signpost** (top bar, panel, or
Esc) always returns to the hub.

## Change the content

- `src/menu.js`: owner name, chef name, greeting, and the shop's dishes. A dish's `dish` block sets broth, bowl
  colour, the painted rim pattern colour and toppings (`egg naruto nori scallion chashu corn pepper menma star`).
- `src/content.js`: `hub` (the signpost signs), `channels` (one per screen; `place` says which sign it belongs to,
  `screen` names the mesh: `bigScreen`, `tallScreen`, `smallScreen1/3/5`, `sideScreen`, `vendingMachineScreen`,
  `easelFrontGraphic`, `arcadeScreen`), and `links` (small tower screens that point at other places). Entries can
  include `videos` (YouTube ids), and a `game` (`{ title, url, by }`) which renders a "Play" button that opens the game
  window; the game is only loaded after the visitor clicks through a short notice.
- `src/quotes.js`: the vending machine's quotes. `note` is shown under a quote (used where an attribution is disputed).
  Quotes are dealt from a shuffled deck, so none repeats until all have come out.

The sign above the counter and the page title follow `owner.short`.

**Sources and things to verify.** LinkedIn (pasted), resumes and the CV, three local news articles, the READMEs in your
project folders, YouTube, and Quote Investigator-style sources for the quote notes. The band videos are recordings by
other people (LBRB, Nathaniel Anderson), not the school's own channel, and the 2025-26 season only has the Region 4
contest so far. Dates differ between LinkedIn and the resume for Project Hope and Crime Stoppers (the site uses
LinkedIn's). Left out on purpose: phone number, GPA, LinkedIn's private analytics. Your email is on the Contact screen.

**Quote attributions.** Three carry a note because they don't hold up: the Emerson "path" line (Muriel Strode, 1903),
the Churchill "going through hell" line (not found in his published words) and the Machiavelli "prince beats the king"
line (no source found). Picasso's is marked "no primary source found". Einstein's is commonly quoted in other wordings.

## Look

The shop is a baked, unlit model; everything procedural (chef, food, pots, bottle) is PBR-lit and reflects a small neon
environment (`src/fx.js`), casts real soft shadows (the counter and floor get invisible shadow-catcher planes), and goes
through bloom plus a finishing grade (vignette, film grain, chromatic aberration). Bloom and grade are skipped on touch
devices and WebGL1 so the site stays smooth on phones.

The chef (`src/chef.js`) is built from primitives with realistic proportions: chrome cybernetic right arm, a
neon-lit apron, and 2-bone IK so his hands actually reach the pots, the ladle, the strainer and the bowl. There are no
model files. Ramen is made on the counter, in front of the customer: bowl up from under the counter, noodles from the
boiling pot (chrome hand), broth from the stock pot (organic hand), toppings, then the bowl is slid across.

## How it fits together

| File | Role |
| --- | --- |
| `src/main.js` | scene, shadows, camera director and routes, intro, hub and place navigation, the cook and vending sequences |
| `src/hub.js` | the signpost: glow, picking, re-lettering "credits" as "arcade" and the green square as "drinks" |
| `src/posters.js` | draws every screen: neon posters, the animated About hologram, ticker, chalkboard, arcade, ON AIR, vending UI |
| `src/shop.js` | loads the baked shop, hides/repairs the original author's branding, clears baked props, new sign |
| `src/chef.js`, `src/food.js` | the procedural chef (FK poses + IK hands); bowls, toppings, cooking station, tools, menu card |
| `src/drinks.js`, `src/quotes.js` | the vending machine: flavors, tray, bottle model; the quote deck |
| `src/mats.js`, `src/fx.js` | materials; neon environment, bloom and grade |
| `src/stage.js` | measured world coordinates of the counter, pots and camera shots |
| `src/ui.js`, `src/style.css` | signpost chips, speech bubble, menu card, panels (chamfered neon HUD), quote scroll, game window |

If you swap the shop model, re-measure `src/stage.js` first (counter height, where the chef and pots can stand).

## Assets and licensing: read before publishing

The shop model, baked textures and sound effects come from
[enderh3art/Ramen-Shop](https://github.com/enderh3art/Ramen-Shop). Its `package.json` declares
`"license": "UNLICENSED"`, which means all rights reserved: no permission to reuse is granted. Everything else in
`src/` is new code written here.

Before deploying publicly, get the author's permission or replace the shop model and sounds. Removing the
original name from the sign and floor (done here) does not change who owns the artwork.

Edits made to the baked scene: the "JESSE'S RAMEN" sign is covered by a new plane, the floor decal was painted out of
`floorBaked1024_clean.png`, the hanging banners and the counter's bowls, cups and bottles were cut out of the merged
mesh at load time (`cutBox` and `cutInside` in `shop.js`), and the original screens now show new posters, and the signpost's "credits" arrow is re-lettered "arcade".
