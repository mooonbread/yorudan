export const photos = [
  { src: "assets/20210603_111514.jpg", desktop: "50% 55%", mobile: "36% 50%", alt: "Yorudan taking a selfie above a green mountain valley beneath a wide, cloud-filled sky." },
  { src: "assets/photos/golden-light.webp", desktop: "50% 50%", mobile: "32% 50%", alt: "Yorudan in golden evening light on a mountain trail." },
  { src: "assets/photos/rocky-canyon.webp", desktop: "50% 50%", mobile: "69% 50%", alt: "Yorudan beside a rocky canyon and a green hillside." },
  { src: "assets/photos/mountain-portrait.webp", desktop: "50% 50%", mobile: "26% 50%", alt: "Yorudan wearing headphones beneath a cloudy mountain skyline." },
  { src: "assets/photos/wide-summit.webp", desktop: "50% 50%", mobile: "49% 50%", alt: "Yorudan on a rocky summit overlooking the mountains and valley." },
  { src: "assets/photos/cave.webp", desktop: "50% 55%", mobile: "62% 50%", alt: "Yorudan crouching inside a cave overlooking a snowy valley." },
];

// Nine seconds completely still, followed by a 1.6-second crossfade.
export const HOLD_MS = 9000;
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

  function prepare() {
    const target = nextIndex();
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
