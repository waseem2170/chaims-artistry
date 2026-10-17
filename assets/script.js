'use strict';
// Replace the placeholder below with the public Google Calendar EMBED URL.
const GOOGLE_CALENDAR_EMBED_URL = 'YOUR_GOOGLE_CALENDAR_EMBED_URL';
const calendar = document.getElementById('booking-calendar');
const placeholder = document.getElementById('calendar-placeholder');
if (GOOGLE_CALENDAR_EMBED_URL !== 'YOUR_GOOGLE_CALENDAR_EMBED_URL' && /^https:\/\/calendar\.google\.com\/calendar\/embed\?/.test(GOOGLE_CALENDAR_EMBED_URL)) {
  calendar.src = GOOGLE_CALENDAR_EMBED_URL;
  calendar.hidden = false;
  placeholder.hidden = true;
}
document.getElementById('year').textContent = new Date().getFullYear();
const toggle = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
toggle.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? '×' : '☰';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = '☰';
}));

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
function updatePrepProgress() {
  const rect = prepTimeline.getBoundingClientRect();
  const viewport = window.innerHeight;
  const lineHeight = selectedPrepTile
    ? selectedPrepTile.offsetTop + selectedPrepTile.offsetHeight / 2
    : viewport * 0.78 - rect.top;
  const progress = clampPrep(lineHeight / rect.height);
  prepProgress.style.transform = `scaleY(${progress})`;
  const mobile = window.innerWidth <= 700;
  // Measure layout coordinates, unaffected by the animated transforms.
  const centers = prepSteps.map(step => rect.top + step.offsetTop + step.offsetHeight / 2);
  const lineTip = rect.top + progress * rect.height;
  // Only the tile nearest the gold line's tip is emphasized.
  let activeIndex = -1;
  if (progress > 0 && progress < 1) {
    activeIndex = centers.reduce((nearest, center, index) =>
      Math.abs(center - lineTip) < Math.abs(centers[nearest] - lineTip) ? index : nearest, 0);
  }
  prepSteps.forEach((step, index) => {
    const center = centers[index];
    const active = index === activeIndex;
    const reveal = reducedMotion.matches || active ? 1 : smoothPrep(clampPrep((viewport * 0.98 - center) / (viewport * 0.25)));
    const scale = reducedMotion.matches ? 1 : active ? (mobile ? 1.035 : 1.06) : 0.93;
    step.classList.toggle('is-current', active);
    const direction = index % 2 === 0 ? -1 : 1;
    step.style.setProperty('--prep-x', `${direction * (mobile ? 16 : 36) * (1 - reveal)}px`);
    step.style.setProperty('--prep-scale', scale);
    step.style.setProperty('--prep-opacity', reveal);
  });
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
let prepFramePending = false;
window.addEventListener('scroll', () => {
  if (!prepFramePending) {
    prepFramePending = true;
    requestAnimationFrame(() => { updatePrepProgress(); prepFramePending = false; });
  }
}, { passive: true });
window.addEventListener('resize', updatePrepProgress);
reducedMotion.addEventListener('change', updatePrepProgress);
if ('ResizeObserver' in window) new ResizeObserver(updatePrepProgress).observe(prepTimeline);
updatePrepProgress();
prepTimeline.classList.add('scroll-animated');
