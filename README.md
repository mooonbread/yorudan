# yorudan
@yorudan's personal site. A single static page with no build step, JavaScript, external fonts, or dependencies.

## Preview

Run `python3 -m http.server 8765` in this directory and open http://localhost:8765.

## Publish

GitHub Pages serves the root of `main`. Changes to `main` deploy automatically once Pages is enabled in the repository settings. The project URL is https://mooonbread.github.io/yorudan/.

The public domain https://yorudan.com is served by the existing Cloudflare `yorudan` Worker, which forwards public GET/HEAD requests to GitHub Pages. Its source is `hosting/worker.js`. The existing root and www routes are retained, and www redirects to the HTTPS root. Site updates on `main` therefore reach the domain after Pages deploys. Worker routing-code changes must be deployed separately through Cloudflare.

## Photograph

`assets/20210603_111514.jpg` is the user's original uploaded mountain selfie, copied byte-for-byte. CSS crops it responsively without altering the file. SHA-256: `4312048993b1b3804172ef6c94db0527ca22fbf5438a2b7065120dfb60ecd8b9`.

The three identity links are defined in `index.html`; layout and hover/focus treatments are in `styles.css`.
