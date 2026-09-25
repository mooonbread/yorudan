const audio = document.querySelector('#background-song');
const controls = document.querySelector('.music-controls');
const play = controls.querySelector('.music-play');
const mute = controls.querySelector('.music-mute');
const volume = controls.querySelector('input');
const status = controls.querySelector('[role="status"]');
audio.volume = Number(volume.value);
audio.controls = false;
controls.hidden = false;
function sync() {
  const playing = !audio.paused;
  play.classList.toggle('is-playing', playing);
  play.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} A Hope For A Prayer`);
  play.title = play.getAttribute('aria-label');
  const silent = audio.muted || audio.volume === 0;
  mute.setAttribute('aria-label', silent ? 'Unmute song' : 'Mute song');
  mute.setAttribute('aria-pressed', String(silent));
  mute.title = mute.getAttribute('aria-label');
}
play.addEventListener('click', async () => {
  status.textContent = '';
  if (!audio.paused) { audio.pause(); return; }
  try { await audio.play(); }
  catch { status.textContent = 'Unable to play. Please try again.'; }
  sync();
});
mute.addEventListener('click', () => {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    if (audio.volume === 0) { audio.volume = 0.35; volume.value = '0.35'; }
  } else audio.muted = true;
});
volume.addEventListener('input', () => {
  audio.volume = Number(volume.value);
  audio.muted = false;
});
for (const event of ['play', 'pause', 'volumechange', 'ended']) audio.addEventListener(event, sync);
audio.addEventListener('error', () => { status.textContent = 'Song unavailable. Please try again later.'; sync(); });
sync();
