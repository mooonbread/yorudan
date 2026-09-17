# yorudan
@yorudan's personal site. A single static page with no build step, third-party font requests, or build dependencies. A small JavaScript module rotates the background photographs. The heading uses vector lettering traced from the user-approved mockup in `assets/yorudan-wordmark.svg`, with an accessible text label.

## Preview

Run `python3 -m http.server 8765` in this directory and open http://localhost:8765.

## Publish

GitHub Pages serves the root of `main`. Changes to `main` deploy automatically once Pages is enabled in the repository settings. The project URL is https://mooonbread.github.io/yorudan/.

The public domain https://yorudan.com is served by the existing Cloudflare `yorudan` Worker, which forwards public GET/HEAD requests to GitHub Pages. Its source is `hosting/worker.js`. The existing root and www routes are retained, and www redirects to the HTTPS root. Site updates on `main` therefore reach the domain after Pages deploys. Worker routing-code changes must be deployed separately through Cloudflare.

## Photograph

`assets/20210603_111514.jpg` is the user's original uploaded mountain selfie, copied byte-for-byte. CSS crops it responsively without altering the file. SHA-256: `4312048993b1b3804172ef6c94db0527ca22fbf5438a2b7065120dfb60ecd8b9`.

The three identity links are defined in `index.html`; layout and hover/focus treatments are in `styles.css`.

## Background rotation

`slideshow.js` defines 29 photographs: the original, four previously selected photos, all 16 additional mountain photos, and eight coastal photos. Each image stays still for 9 seconds, followed by a 1.6-second crossfade. The text does not move. Desktop and phone focal points are defined per image. Left/right arrow keys jump between photos; Space pauses or resumes. Keyboard navigation preserves the paused state.

The @ sign links to https://twitter.com/yorudan and swirls green/teal counterclockwise on hover or keyboard focus. Reduced motion keeps that color treatment still. The original traced lettering is retained, with its @ spacing tightened.

The new photos are resized and WebP-encoded copies of the user's supplied originals, without retouching or AI recreation. Source and output checksums are recorded in `assets/photos/sources.json`. The opening JPEG remains byte-for-byte original.

Only the next image is loaded ahead. A failed image is skipped while the current one stays visible. Rotation pauses while the tab is hidden and has a visible pause/play button. Reduced-motion visitors see a still photo with no automatic advance or additional photo downloads. Without JavaScript, the original hero remains visible.

Run `node --test tests/slideshow.test.mjs` to check timing, looping, pause/resume, reduced motion, tab visibility, and image failures.
