# yorudan
@yorudan's personal site. A single static page with no build step, third-party font requests, or build dependencies. A small JavaScript module rotates the background photographs. The heading uses vector lettering traced from the user-approved mockup in `assets/yorudan-wordmark.svg`, with an accessible text label.

## Preview

Run `python3 -m http.server 8765` in this directory and open http://localhost:8765.

## Publish

GitHub Pages serves the root of `main`. Changes to `main` deploy automatically once Pages is enabled in the repository settings. The project URL is https://mooonbread.github.io/yorudan/.

The public domain https://yorudan.com is served by the existing Cloudflare `yorudan` Worker, which forwards public GET/HEAD requests to GitHub Pages. Its source is `hosting/worker.js`. The existing root and www routes are retained, and www redirects to the HTTPS root. Site updates on `main` therefore reach the domain after Pages deploys. Worker routing-code changes must be deployed separately through Cloudflare.

## Photographs

The background rotation uses six nature photographs supplied by the user: black-and-white summit silhouettes, tropical rock towers, a forest beneath rain clouds, green mountain pinnacles, a rocky turquoise shoreline, and a coastal overlook. The first mountain panorama is set aside and remains saved for future use. Web-ready JPEG copies live in `assets/nature/`. Full-resolution PNG originals are saved in the parent workspace under `photos/nature/`.

All 30 existing portrait photographs (including the 29 previously in rotation) are preserved byte-for-byte in `reference/portraits/`, along with their source metadata and original slideshow configuration, for future reference. They are no longer part of the active slideshow.

## Background rotation

Each image stays still for 9 seconds, followed by a 1.6-second crossfade. Desktop and phone focal points are defined per image. Left/right arrow keys jump between photos; Space pauses or resumes. The visible pause/play button, reduced-motion behavior, tab visibility handling, and failed-image handling are preserved. Without JavaScript, the opening black-and-white summit photograph remains visible.

The three identity links are defined in `index.html`; layout and hover/focus treatments are in `styles.css`. The @ sign retains its green/teal counterclockwise hover treatment.

Run `node --test tests/slideshow.test.mjs` to check timing, looping, pause/resume, reduced motion, tab visibility, and image failures.
