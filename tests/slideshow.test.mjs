import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../slideshow.js', import.meta.url), 'utf8');
const { startRotation, HOLD_MS, FADE_MS } = await import('data:text/javascript,' + encodeURIComponent(source));

function element(visible = false) {
  const classes = new Set(visible ? ['is-visible'] : []);
  return {
    classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x), toggle(x, value) { value ? classes.add(x) : classes.delete(x); } },
    style: { setProperty() {} }, attributes: {}, handlers: {}, hidden: true, decodeCalls: 0,
    setAttribute(k,v) { this.attributes[k] = v; }, removeAttribute(k) { delete this.attributes[k]; },
    addEventListener(k,fn) { this.handlers[k] = fn; },
    decode() { this.decodeCalls++; return this.src === 'broken' ? Promise.reject(new Error('offline')) : Promise.resolve(); },
  };
}
async function fixture(run, { reduced = false, hidden = false, frames } = {}) {
  let time = 0, id = 0;
  const tasks = new Map();
  const original = { setTimeout, clearTimeout };
  globalThis.setTimeout = (fn, delay) => { tasks.set(++id, { fn, at: time + delay }); return id; };
  globalThis.clearTimeout = key => tasks.delete(key);
  const layers = [element(true), element()]; layers[0].src = 'opening';
  const button = element(), motion = element(), page = element();
  motion.matches = reduced; page.hidden = hidden;
  const tick = async ms => {
    const end = time + ms;
    for (;;) {
      const next = [...tasks].sort((a,b) => a[1].at-b[1].at)[0];
      if (!next || next[1].at > end) break;
      time = next[1].at; tasks.delete(next[0]); next[1].fn();
      for (let i = 0; i < 5; i++) await Promise.resolve();
    }
    time = end;
  };
  try {
    startRotation({ layers, button, motion, page, frames: frames || ['opening','second','third'].map(src => ({src, alt:src, desktop:'50% 50%', mobile:'40% 50%'})) });
    await run({ layers, button, motion, page, tick, tasks });
  } finally { Object.assign(globalThis, original); }
}

test('holds each frame for fifteen seconds, overlays the next, then loops without blanking', () => fixture(async ({layers, tick}) => {
  assert.equal(layers[1].decodeCalls, 1);
  await tick(HOLD_MS - 1);
  assert.equal(layers[1].classList.contains('is-visible'), false);
  await tick(1);
  assert.equal(layers[0].classList.contains('is-visible'), true);
  assert.equal(layers[1].classList.contains('is-entering'), true);
  assert.equal(layers[1].classList.contains('is-visible'), true);
  await tick(FADE_MS);
  assert.equal(layers[0].classList.contains('is-visible'), false);
  assert.equal(layers[0].src, 'third');
  await tick(HOLD_MS + FADE_MS);
  assert.equal(layers[0].classList.contains('is-visible'), true);
  assert.equal(layers[1].src, 'opening');
  await tick(HOLD_MS + FADE_MS);
  assert.equal(layers[1].classList.contains('is-visible'), true);
  assert.equal(layers[1].src, 'opening');
}));
test('pause stops advancement and play restarts a full hold', () => fixture(async ({layers, button, tick}) => {
  button.handlers.click();
  await tick(50000);
  assert.equal(layers[1].classList.contains('is-visible'), false);
  assert.equal(button.attributes['aria-label'], 'Play background slideshow');
  button.handlers.click();
  await tick(HOLD_MS - 1);
  assert.equal(layers[1].classList.contains('is-visible'), false);
  await tick(1);
  assert.equal(layers[1].classList.contains('is-visible'), true);
}));
test('reduced motion does not load or animate additional photos', () => fixture(async ({layers,button,tick,tasks}) => {
  await tick(60000);
  assert.equal(layers[1].decodeCalls,0);
  assert.equal(button.hidden,true);
  assert.equal(tasks.size,0);
}, {reduced:true}));
test('hidden tabs stop and resume without jumping ahead', () => fixture(async ({page,layers,tick}) => {
  await tick(4000); page.hidden = true; page.handlers.visibilitychange();
  await tick(60000); assert.equal(layers[1].classList.contains('is-visible'),false);
  page.hidden = false; page.handlers.visibilitychange();
  await tick(HOLD_MS); assert.equal(layers[1].classList.contains('is-visible'),true);
}));
test('a failed image is skipped without losing the visible photo', () => fixture(async ({layers,tick}) => {
  await tick(HOLD_MS); assert.equal(layers[0].classList.contains('is-visible'),true);
  assert.equal(layers[1].src,'third');
  await tick(HOLD_MS + FADE_MS); assert.equal(layers[1].classList.contains('is-visible'),true);
}, {frames:['opening','broken','third'].map(src => ({src,alt:src}))}));
test('pausing or changing reduced motion during a fade settles on one image', () => fixture(async ({layers,motion,button,tick,tasks}) => {
  await tick(HOLD_MS + 500); motion.matches = true; motion.handlers.change();
  assert.equal(layers.filter(x=>x.classList.contains('is-visible')).length,1);
  assert.equal(layers[1].classList.contains('is-entering'),false);
  assert.equal(button.hidden,true); assert.equal(tasks.size,0);
}));
const key = (page, name, target) => {
  let prevented = false;
  page.handlers.keydown({ key:name, target, preventDefault(){ prevented=true; } });
  return prevented;
};
const settle = async () => { for(let i=0;i<8;i++) await Promise.resolve(); };
test('keyboard arrows wrap in both directions while Space preserves pause through jumps', () => fixture(async ({page,layers,button,tick}) => {
  assert.equal(key(page,' '),true);
  assert.equal(button.attributes['aria-label'],'Play background slideshow');
  key(page,'ArrowLeft'); await settle();
  assert.equal(layers.find(x=>x.classList.contains('is-visible')).src,'third');
  key(page,'ArrowRight'); await settle();
  assert.equal(layers.find(x=>x.classList.contains('is-visible')).src,'opening');
  await tick(50000);
  assert.equal(layers.find(x=>x.classList.contains('is-visible')).src,'opening');
  key(page,' '); await tick(HOLD_MS+FADE_MS);
  assert.equal(layers.find(x=>x.classList.contains('is-visible')).src,'second');
}));
test('keyboard shortcuts leave editing and native button activation alone', () => fixture(async ({page,button}) => {
  assert.equal(key(page,'ArrowRight',{closest:()=>true}),false);
  assert.equal(key(page,' ',{closest:selector=>selector==='button'}),false);
  assert.equal(button.attributes['aria-label'],'Pause background slideshow');
}));
test('manual arrows work with reduced motion without starting playback', () => fixture(async ({page,layers,tasks}) => {
  key(page,'ArrowRight'); await settle();
  assert.equal(layers.find(x=>x.classList.contains('is-visible')).src,'second');
  assert.equal(tasks.size,0);
}, {reduced:true}));
