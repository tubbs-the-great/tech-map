# When the Code Writes Itself

An interactive guide to how apps and AI actually work. One simple story, told twelve times, one pass per screen, with a map that grows as you go.

Each pass plays its request on the map, then its text comes in short cards. The next pass unlocks once the request has played. Progress is saved in the reader's browser (nothing is sent anywhere), so the opening screen offers "Continue from pass N" on a return visit.

## How it's built

A plain static site — no build step:

- `index.html` — the page
- `css/styles.css` — styles, using the Tech Map design system (navy palette, Geist type)
- `js/content.js` — every word and the map layout, in one place
- `js/map.js` — draws and animates the map
- `js/app.js` — the lesson flow: views, cards, unlocking, saved progress, quick checks
- `js/vendor/` — GSAP for animation

## Publishing with GitHub Pages

Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **main**, folder **/ (root)** → Save.

The site appears at `https://<username>.github.io/tech-map/` a minute or two later.

## Editing the words

All text lives in `js/content.js`. Keep to the writing rules at the top of that file.
