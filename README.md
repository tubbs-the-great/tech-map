# When the Code Writes Itself

An interactive guide to how apps and AI actually work. One simple story, told twelve times, with a map that grows as you read.

## How it's built

A plain static site — no build step:

- `index.html` — the page
- `css/styles.css` — styles, using the Tech Map design system (navy palette, Geist type)
- `js/content.js` — every word and the map layout, in one place
- `js/map.js` — draws and animates the map
- `js/app.js` — the scroll story, quick checks and progress bar
- `js/vendor/` — GSAP and ScrollTrigger for animation

## Publishing with GitHub Pages

Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **main**, folder **/ (root)** → Save.

The site appears at `https://<username>.github.io/tech-map/` a minute or two later.

## Editing the words

All text lives in `js/content.js`. Keep to the writing rules at the top of that file.
