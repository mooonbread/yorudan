# yorudan
@yorudan's personal site. A single static page with no build step, third-party font requests, or build dependencies. A small JavaScript module rotates the background photographs. The heading uses vector lettering traced from the user-approved mockup in `assets/yorudan-wordmark.svg`, with an accessible text label.

## Preview

Run `python3 -m http.server 8765` in this directory and open http://localhost:8765.

## Publish

GitHub Pages serves the root of `main`. Changes to `main` deploy automatically once Pages is enabled in the repository settings. The project URL is https://mooonbread.github.io/yorudan/.

The public domain https://yorudan.com is served by the existing Cloudflare `yorudan` Worker, which forwards public GET/HEAD requests to GitHub Pages. Its source is `hosting/worker.js`. The existing root and www routes are retained, and www redirects to the HTTPS root. Site updates on `main` therefore reach the domain after Pages deploys. Worker routing-code changes must be deployed separately through Cloudflare.

## Photographs

The background rotation uses four photographs in the user’s requested order: green hills in Alaska (`forest-storm.jpg`), Pedra da Gávea in Rio de Janeiro (`tropical-rock-towers.jpg`), Lone Peak with orange tree trunks (`granite-and-pines.jpg`, unfiltered), then the beach in Kauai (`sunlit-beach.jpg`). It loops back to Alaska. The mountain panorama, green mountain pinnacles, rocky turquoise shoreline, coastal overlook, summit boulders, mossy forest stream, granite cliffs, black-and-white summit silhouettes, and the woodland trail are set aside and remain saved for reference. The user confirmed that the black-and-white summit silhouettes were not taken by them; the photographer is not yet identified. Web-ready JPEG copies live in `assets/nature/`. The granite-and-pines slide uses the user’s unfiltered version. Full-resolution PNG originals are saved in the parent workspace under `photos/nature/`.

All 30 existing portrait photographs (including the 29 previously in rotation) are preserved byte-for-byte in `reference/portraits/`, along with their source metadata and original slideshow configuration, for future reference. They are no longer part of the active slideshow.

## Background rotation

Each image stays still for 15 seconds, followed by a 1.6-second crossfade. Desktop and phone focal points are defined per image. Left/right arrow keys jump between photos; Space pauses or resumes. The visible pause/play button, reduced-motion behavior, tab visibility handling, and failed-image handling are preserved. Without JavaScript, the opening Alaska green hills photograph remains visible.

The three identity links are defined in `index.html`; layout and hover/focus treatments are in `styles.css`. The @ sign retains its green/teal counterclockwise hover treatment.

Run `node --test tests/slideshow.test.mjs` to check timing, looping, pause/resume, reduced motion, tab visibility, and image failures.

## Slideshow cache refresh

`index.html` loads a content-hashed copy of `slideshow.js` to bypass stale custom-domain caches. Whenever the slideshow changes, copy it to `slideshow-<first 12 characters of SHA-256>.js` and update the script source in `index.html` before publishing. Keep `slideshow.js` as the editable source and test target.
