export const photos = [
  { src: "assets/nature/summit-silhouettes.jpg", desktop: "50% 50%", mobile: "29% 50%", alt: "Black-and-white photograph of six hikers silhouetted on a rocky summit above distant snowy mountains." },
  { src: "assets/nature/tropical-rock-towers.jpg", desktop: "50% 50%", mobile: "47% 50%", alt: "Two towering rock faces rising above lush green foliage beneath a clear blue sky." },
  { src: "assets/nature/forest-storm.jpg", desktop: "50% 50%", mobile: "38% 50%", alt: "Rain clouds sweeping across rolling green mountain forests, framed by tall evergreen trees." },
  { src: "assets/nature/green-pinnacles.jpg", desktop: "50% 50%", mobile: "59% 50%", alt: "Jagged green mountain pinnacles beneath a bright blue sky, with exposed tree roots along the trail." },
  { src: "assets/nature/rocky-shoreline.jpg", desktop: "50% 50%", mobile: "45% 50%", alt: "Turquoise waves washing onto a rocky shoreline beside a forested cliff under a clear blue sky." },
  { src: "assets/nature/coastal-overlook.jpg", desktop: "50% 50%", mobile: "44% 50%", alt: "A sweeping coastal overlook with green mountains, a city-lined beach, and blue ocean dotted with islands." },
  { src: "assets/nature/granite-cliffs.jpg", desktop: "50% 50%", mobile: "55% 50%", alt: "Sheer granite cliffs surrounding a rocky alpine basin beneath a deep blue sky." },
];

// Fifteen seconds completely still, followed by a 1.6-second crossfade.
export const HOLD_MS = 15000;
export const FADE_MS = 1600;

export function startRotation({ layers, button, motion, page, frames = photos }) {
  let active = 0;
  let index = 0;
  let paused = false;
  let fading = false;
  let timer;
  let finishTimer;
  let generation = 0;
  let prepared;
  const failed = new Set();
  const stopped = () => paused || motion.matches || page.hidden;

  function nextIndex() {
    for (let step = 1; step < frames.length; step++) {
      const candidate = (index + step) % frames.length;
      if (!failed.has(candidate)) return candidate;
    }
    return -1;
  }

  function prepare(target = nextIndex()) {
    if (target < 0) {
      button.hidden = true;
      return null;
    }
    if (prepared?.index === target) return prepared;
    const image = layers[1 - active];
    const photo = frames[target];
    image.style.setProperty("--desktop-position", photo.desktop);
    image.style.setProperty("--mobile-position", photo.mobile);
    image.src = photo.src;
    image.alt = photo.alt;
    // Decode just the next photo; a slow or failed download never blanks the current one.
    prepared = { index: target, ready: image.decode().then(() => true, () => false) };
    return prepared;
  }

  function schedule() {
    clearTimeout(timer);
    if (stopped() || fading) return;
    if (!prepare()) return;
    timer = setTimeout(advance, HOLD_MS);
  }

  function finish() {
    if (!fading) return;
    clearTimeout(finishTimer);
    layers[active].classList.remove("is-visible");
    layers[active].setAttribute("aria-hidden", "true");
    active = 1 - active;
    layers[active].classList.remove("is-entering");
    layers[active].removeAttribute("aria-hidden");
    index = prepared.index;
    prepared = null;
    fading = false;
  }

  async function advance() {
    const token = generation;
    const next = prepare();
    if (!next) return;
    const ready = await next.ready;
    if (token !== generation || stopped()) return;
    if (!ready) {
      failed.add(next.index);
      prepared = null;
      schedule();
      return;
    }
    fading = true;
    const incoming = layers[1 - active];
    incoming.classList.add("is-entering");
    // Ensure the transparent frame is painted before starting its fade.
    void incoming.offsetWidth;
    incoming.classList.add("is-visible");
    finishTimer = setTimeout(() => { finish(); schedule(); }, FADE_MS);
  }

  function sync() {
    generation++;
    clearTimeout(timer);
    finish();
    button.classList.toggle("is-paused", paused || motion.matches);
    button.setAttribute("aria-label", paused || motion.matches ? "Play background slideshow" : "Pause background slideshow");
    button.hidden = motion.matches || nextIndex() < 0;
    schedule();
  }

  let manualTarget = null;
  async function jump(direction) {
    generation++;
    const token = generation;
    clearTimeout(timer);
    finish();
    let target = manualTarget ?? index;
    for (let step = 1; step < frames.length; step++) {
      target = (target + direction + frames.length) % frames.length;
      if (!failed.has(target)) break;
    }
    manualTarget = target;
    const next = prepare(target);
    const ready = await next.ready;
    if (token !== generation) return;
    manualTarget = null;
    if (!ready) {
      failed.add(target);
      prepared = null;
      schedule();
      return;
    }
    // Keyboard navigation jumps directly; automatic playback keeps the soft fade.
    layers[1 - active].classList.add("is-visible");
    fading = true;
    finish();
    schedule();
  }

  page.addEventListener("keydown", event => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target?.closest?.("input, textarea, select, [contenteditable]:not([contenteditable=false])")) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      void jump(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.code === "Space" || event.key === " ") {
      // A focused button already handles Space through its native click.
      if (event.target?.closest?.("button")) return;
      event.preventDefault();
      paused = !paused;
      manualTarget = null;
      sync();
    }
  });

  button.addEventListener("click", () => { paused = !paused; sync(); });
  motion.addEventListener("change", sync);
  page.addEventListener("visibilitychange", sync);
  sync();
}

if (typeof document !== "undefined") {
  startRotation({
    layers: [...document.querySelectorAll(".hero__photo")],
    button: document.querySelector(".rotation-toggle"),
    motion: matchMedia("(prefers-reduced-motion: reduce)"),
    page: document,
  });
}
