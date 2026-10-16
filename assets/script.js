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
