'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
const toggle = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function setMenuOpen(open) {
  navigation.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  toggle.textContent = open ? '×' : '☰';
}
toggle.addEventListener('click', () => setMenuOpen(!navigation.classList.contains('open')));
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('click', event => {
  if (!navigation.contains(event.target) && !toggle.contains(event.target)) setMenuOpen(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) { setMenuOpen(false); toggle.focus(); }
});

// Accessible accordion and scroll-driven preparation timeline.
const prepTimeline = document.querySelector('.prep-grid');
const prepSteps = [...prepTimeline.querySelectorAll('.prep-step')];
const prepTriggers = [...prepTimeline.querySelectorAll('.prep-trigger')];
let selectedPrepTile = null;
function setPrepOpen(trigger, open) {
  trigger.setAttribute('aria-expanded', String(open));
  document.getElementById(trigger.getAttribute('aria-controls')).hidden = !open;
}
prepTriggers.forEach(trigger => {
  setPrepOpen(trigger, false);
  trigger.addEventListener('click', () => {
    const open = trigger.getAttribute('aria-expanded') !== 'true';
    prepTriggers.forEach(other => setPrepOpen(other, other === trigger && open));
    selectedPrepTile = trigger.closest('.prep-step');
    updatePrepProgress();
    // Center the tile after the accordion has its final layout height.
    requestAnimationFrame(() => {
      const tile = trigger.closest('.prep-step');
      const timelineTop = prepTimeline.getBoundingClientRect().top + window.scrollY;
      const target = timelineTop + tile.offsetTop + tile.offsetHeight / 2 - window.innerHeight / 2;
      window.scrollTo({
        top: Math.max(0, target),
        behavior: reducedMotion.matches ? 'instant' : 'smooth'
      });
    });
  });
});
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const prepProgress = prepTimeline.querySelector('.prep-progress');
const clampPrep = value => Math.max(0, Math.min(1, value));
const smoothPrep = value => value * value * (3 - 2 * value);
// One rendering loop: read geometry first, then update visual styles.
let prepFrame = 0;
let prepLastTime = 0;
const prepScales = prepSteps.map(() => 1);
function updatePrepProgress() {
  if (!prepFrame) prepFrame = requestAnimationFrame(renderPrepFrame);
}
function renderPrepFrame(time) {
  prepFrame = 0;
  const elapsed = prepLastTime ? Math.min(64, time - prepLastTime) : 16.67;
  prepLastTime = time;
  const rect = prepTimeline.getBoundingClientRect();
  const viewport = window.innerHeight;
  const mobile = window.innerWidth <= 700;
  // Complete every layout read before writing any styles.
  const offsets = prepSteps.map(step => step.offsetTop + step.offsetHeight / 2);
  const selectedIndex = prepSteps.indexOf(selectedPrepTile);
  const lineHeight = selectedIndex >= 0 ? offsets[selectedIndex] : viewport * 0.78 - rect.top;
  const progress = clampPrep(lineHeight / Math.max(1, rect.height));
  const centers = offsets.map(offset => rect.top + offset);
  const lineTip = rect.top + progress * rect.height;
  let activeIndex = -1;
  if (progress > 0 && progress < 1) {
    activeIndex = centers.reduce((nearest, center, index) =>
      Math.abs(center - lineTip) < Math.abs(centers[nearest] - lineTip) ? index : nearest, 0);
  }
  const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 65);
  let settling = false;
  prepProgress.style.transform = `scaleY(${progress})`;
  prepSteps.forEach((step, index) => {
    const active = index === activeIndex;
    // Finish revealing before the gold line reaches the tile: no opacity jump on selection.
    const reveal = reducedMotion.matches ? 1 : smoothPrep(clampPrep((viewport * 1.08 - centers[index]) / (viewport * 0.2)));
    const targetScale = reducedMotion.matches ? 1 : active ? (mobile ? 1.035 : 1.06) : 0.93;
    prepScales[index] += (targetScale - prepScales[index]) * blend;
    if (Math.abs(targetScale - prepScales[index]) < 0.0005) prepScales[index] = targetScale;
    else settling = true;
    const direction = index % 2 === 0 ? -1 : 1;
    step.classList.toggle('is-current', active);
    step.style.setProperty('--prep-x', `${direction * (mobile ? 16 : 36) * (1 - reveal)}px`);
    step.style.setProperty('--prep-scale', prepScales[index].toFixed(4));
    step.style.setProperty('--prep-opacity', reveal.toFixed(4));
  });
  if (settling) updatePrepProgress();
  else prepLastTime = 0;
}
// Manual scrolling resumes the scroll-following line after a tile selection.
function releasePrepSelection() {
  if (!selectedPrepTile) return;
  selectedPrepTile = null;
  updatePrepProgress();
}
window.addEventListener('wheel', releasePrepSelection, { passive: true });
window.addEventListener('touchmove', releasePrepSelection, { passive: true });
window.addEventListener('keydown', event => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)
      && !event.target.closest('button, input, textarea, select, [contenteditable]')) {
    releasePrepSelection();
  }
});
window.addEventListener('scroll', updatePrepProgress, { passive: true });
window.addEventListener('resize', updatePrepProgress);
reducedMotion.addEventListener('change', updatePrepProgress);
if ('ResizeObserver' in window) new ResizeObserver(updatePrepProgress).observe(prepTimeline);
prepTimeline.classList.add('scroll-animated');
updatePrepProgress();

// Remove the finished fullscreen intro from painting and hit testing entirely.
const signatureIntro = document.querySelector('.signature-intro');
signatureIntro?.addEventListener('animationend', event => {
  if (event.target === signatureIntro && ['signature-exit', 'logo-intro-finish'].includes(event.animationName)) {
    signatureIntro.remove();
  }
});

// Light, time-based falling glitter. A single canvas avoids animating many DOM nodes.
(() => {
  const hero = document.querySelector('.velvet-hero');
  const canvas = hero?.querySelector('.hero-glitter');
  const context = canvas?.getContext('2d', { alpha: true });
  if (!context) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, particles = [], frame = 0, last = 0;
  let visible = false;
  const random = (a, b) => a + Math.random() * (b - a);
  function resizeGlitter() {
    width = hero.clientWidth; height = hero.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({length: width < 701 ? 70 : 150}, () => ({
      x: random(0, width), y: random(0, height), size: random(.65, 1.65),
      speed: random(32, 64), drift: random(-7, 9), phase: random(0, Math.PI * 2)
    }));
  }
  function tick(time) {
    frame = 0;
    if (!visible || document.hidden || motion.matches) { last = 0; return; }
    const dt = last ? Math.min((time - last) / 1000, .05) : 0;
    last = time; context.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.y += p.speed * dt; p.x += p.drift * dt;
      if (p.y > height + 5) { p.y = -5; p.x = random(0, width); }
      if (p.x < -5) p.x = width + 5;
      if (p.x > width + 5) p.x = -5;
      // Centre stays quiet so the logo and button are always clear.
      const edge = Math.abs(p.x / width - .5) > .25 ? 1 : .55;
      context.globalAlpha = edge * (.48 + .32 * (1 + Math.sin(time / 1700 + p.phase)) / 2);
      context.fillStyle = '#efd1aa'; context.beginPath();
      context.arc(p.x, p.y, p.size, 0, Math.PI * 2); context.fill();
    }
    context.globalAlpha = 1;
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; last = 0;
    if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
    else context.clearRect(0, 0, width, height);
  }
  resizeGlitter();
  if ('ResizeObserver' in window) new ResizeObserver(resizeGlitter).observe(hero);
  else window.addEventListener('resize', resizeGlitter);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; sync();
  }).observe(hero);
  else { visible = true; sync(); }
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
})();

// Center the booking heading and calendar together when there is room.
function centerBooking(includeHeading = true) {
  const panel = document.querySelector('.calendar-frame');
  const heading = document.querySelector('#appointments .center-heading');
  const panelRect = panel.getBoundingClientRect();
  const top = includeHeading ? heading.getBoundingClientRect().top : panelRect.top;
  const height = panelRect.bottom - top;
  const viewport = window.innerHeight;
  const headerHeight = document.querySelector('.hero-nav').getBoundingClientRect().height;
  const available = viewport - headerHeight;
  const inset = height <= available - 32 ? headerHeight + (available - height) / 2 : headerHeight + 16;
  window.scrollTo({top: Math.max(0, window.scrollY + top - inset), behavior: reducedMotion.matches ? 'instant' : 'smooth'});
}
document.querySelectorAll('a[href="#appointments"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    history.replaceState(null, '', '#appointments');
    centerBooking(true);
  });
});

// Speed up the same animation timeline: no jump or alternate exit transition.
document.querySelector('.intro-skip')?.addEventListener('click', event => {
  event.currentTarget.disabled = true;
  document.getAnimations().forEach(animation => {
    const target = animation.effect?.target;
    const timing = animation.effect?.getTiming();
    if (timing?.iterations !== Infinity && target &&
        (target.closest('.logo-intro') || target.matches('.fixed-brand, .hero-inner, .hero-nav'))) {
      animation.updatePlaybackRate(2.5);
    }
  });
});

// Use the measured header height so the opening panel meets its exact edge.
const introHeader = document.querySelector('.hero-nav');
function measureIntroHeader() {
  document.documentElement.style.setProperty('--intro-header-height', `${introHeader.offsetHeight}px`);
}
measureIntroHeader();
if ('ResizeObserver' in window) new ResizeObserver(measureIntroHeader).observe(introHeader);
// Skip is only offered before the homepage begins opening. The final logo
// movement then runs at its original smooth speed, even after an early Skip.
document.querySelector('.intro-shutter-top')?.addEventListener('animationstart', event => {
  if (event.animationName !== 'logo-open-top') return;
  const skip = document.querySelector('.intro-skip');
  if (skip) { skip.hidden = true; skip.disabled = true; }
  document.getAnimations().forEach(animation => {
    const target = animation.effect?.target;
    if (target && (target.closest('.logo-intro') || target.matches('.fixed-brand, .hero-inner, .hero-nav'))) {
      animation.updatePlaybackRate(1);
    }
  });
});

const lowerIntroPanel = document.querySelector('.intro-shutter-bottom');
lowerIntroPanel?.addEventListener('animationend', event => {
  if (event.animationName === 'logo-open-bottom') lowerIntroPanel.remove();
});
