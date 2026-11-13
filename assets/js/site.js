/* GMV Media — core UI (shared by every public page)
   topbar + القايمة الجانبية + الخلفية + lightbox + modal + helpers */
const html = document.documentElement;
export const BASE = html.dataset.base || '';
export const PAGE = html.dataset.page || '';
export const WA_NUMBER = '201508280795';
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const wa = (text = '') => `https://wa.me/${WA_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
export const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
};

/* ---------- الفئات (نفس مفاتيح التخزين القديمة) ---------- */
export const CATS = [
  { id: 'small', label: 'محل صغير', value: 'محل صغير', path: 'server-small/', icon: 'store', hint: 'للمحلات والمشاريع الصغيرة' },
  { id: 'brand', label: 'براند / شركة', value: 'براند / شركة', path: 'server-brand/', icon: 'building', hint: 'للبراندات والشركات' },
  { id: 'outside', label: 'عميل خارج مصر', value: 'عميل خارج مصر', path: 'server-outside/', icon: 'globe', hint: 'أسعار بالدولار' }
];
export const hasCat = () => !!(store.get('gmv_usertype') || store.get('gmv_userType'));
export function getCat() {
  const t = (store.get('gmv_usertype') || store.get('gmv_userType') || '').toLowerCase();
  if (t.includes('براند')) return CATS[1];
  if (t.includes('خارج') || t.includes('بره')) return CATS[2];
  return CATS[0];
}
export function setCat(cat) {
  store.set('gmv_usertype', cat.value);
  window.dispatchEvent(new CustomEvent('gmv:cat', { detail: cat }));
}

/* ---------- Icons (line icons, currentColor) ---------- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  services: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12.5 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  works: '<rect x="3" y="4" width="18" height="16" rx="3.5"/><path d="m10 9 5 3-5 3V9Z"/>',
  reviews: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>',
  faq: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8"/><path d="M12 17h.01"/>',
  contact: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M9 11h6M9 14h3"/>',
  store: '<path d="M4 9 5.5 4h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M5 12v8h14v-8"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  left: '<path d="m15 5-7 7 7 7"/>',
  right: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  play: '<path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/>',
  wa: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
  arrow: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>'
};
export const icon = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

export const SOCIALS = [
  ['facebook', 'Facebook', 'https://web.facebook.com/profile.php?id=61581553779583&locale=ar_AR'],
  ['instagram', 'Instagram', 'https://www.instagram.com/gmv_media_1?igsh=aXdzdWxja2djaTVr'],
  ['tiktok', 'TikTok', 'https://www.tiktok.com/@gmv.media_1?_t=ZS-90FZ4HqZdSb&_r=1'],
  ['youtube', 'YouTube', 'https://youtube.com/@mgv_media?si=vR7s38oUB-lxC1oy'],
  ['pinterest', 'Pinterest', 'https://pin.it/1i5Ymyc1O'],
  ['whatsapp', 'WhatsApp', wa()]
];
export const socialsHTML = () => SOCIALS.map(([n, t, h]) =>
  `<a href="${esc(h)}" target="_blank" rel="noopener noreferrer" title="${t}" aria-label="${t}"><img src="${BASE}icons/${n}.svg" alt="" width="26" height="26" loading="lazy"></a>`).join('');

/* ---------- Chrome: bg + topbar + drawer + fab + toast ---------- */
const homeHref = BASE || './';
function navItems() {
  const cat = getCat();
  return [
    ['home', 'home', 'الرئيسية', 'ابدأ من هنا', homeHref],
    ['services', 'services', 'خدماتنا', `باقات ${cat.label}`, BASE + cat.path],
    ['works', 'works', 'أعمالنا', 'تصاميم وفيديوهات', BASE + 'works/'],
    ['reviews', 'reviews', 'آراء العملاء', 'تجارب اللي اشتغلوا معانا', BASE + 'reviews/'],
    ['faq', 'faq', 'الأسئلة الشائعة', 'إجابات سريعة', BASE + 'faq/'],
    ['contact', 'contact', 'خدمة العملاء', 'كلمنا في أي وقت', BASE + 'contact/']
  ];
}
const navHTML = () => navItems().map(([id, ic, t, s, href], i) =>
  `<a class="nav${PAGE === id ? ' is-active' : ''}" data-nav="${id}" href="${href}" style="--i:${i}"${PAGE === id ? ' aria-current="page"' : ''}>
     <span class="nav__ico">${icon(ic)}</span><span class="nav__t"><b>${t}</b><small>${esc(s)}</small></span><span class="nav__go">${icon('left')}</span></a>`).join('');

let drawer, burger, lastFocus;
function buildChrome() {
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="bg" aria-hidden="true"><i class="bg__a"></i><i class="bg__b"></i><i class="bg__grid"></i><img class="bg__logo" src="${BASE}assets/img/logo.webp" alt="" width="1000" height="429"></div>
  <header class="topbar" id="topbar">
    <button class="burger" id="burger" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>
    <a class="topbar__logo" href="${homeHref}" aria-label="GMV Media — الرئيسية"><img src="${BASE}assets/img/logo-sm.webp" alt="GMV Media" width="84" height="36"></a>
  </header>
  <div class="scrim" id="scrim"></div>
  <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="القائمة الرئيسية" inert>
    <div class="drawer__head">
      <a class="drawer__brand" href="${homeHref}" aria-label="GMV Media"><img src="${BASE}assets/img/logo-sm.webp" alt="GMV Media" width="130" height="56"></a>
      <button class="iconbtn" type="button" data-close aria-label="إغلاق القائمة">${icon('close')}</button>
    </div>
    <nav class="drawer__nav" aria-label="التنقل">${navHTML()}</nav>
    <div class="drawer__foot">
      <a class="btn btn--primary btn--block" href="${wa('مرحبًا GMV Media، حابب أستفسر عن خدماتكم.')}" target="_blank" rel="noopener noreferrer">${icon('wa')} تواصل معنا على واتساب</a>
      <div class="socials" style="animation:none">${socialsHTML()}</div>
      <p class="drawer__copy">© GMV Media ${new Date().getFullYear()}</p>
    </div>
  </aside>
  <a class="fab" href="${wa('مرحبًا GMV Media، حابب أستفسر عن خدماتكم.')}" target="_blank" rel="noopener noreferrer" aria-label="واتساب"><img src="${BASE}icons/whatsapp.svg" alt="" width="58" height="58"></a>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`);
  drawer = $('#drawer'); burger = $('#burger');
  burger.addEventListener('click', () => (html.classList.contains('menu-open') ? closeMenu() : openMenu()));
  $('#scrim').addEventListener('click', closeMenu);
  $$('[data-close]', drawer).forEach(b => b.addEventListener('click', closeMenu));
  $$('.nav', drawer).forEach(a => a.addEventListener('click', () => { if (a.getAttribute('href') === location.pathname) closeMenu(); }));
}
export function openMenu() {
  lastFocus = document.activeElement;
  drawer.inert = false; html.classList.add('menu-open', 'lock');
  burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'إغلاق القائمة');
  setTimeout(() => ($('.nav.is-active', drawer) || $('.nav', drawer)).focus({ preventScroll: true }), 120);
}
export function closeMenu() {
  if (!html.classList.contains('menu-open')) return;
  html.classList.remove('menu-open', 'lock'); drawer.inert = true;
  burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'فتح القائمة');
  (lastFocus && lastFocus.focus ? lastFocus : burger).focus({ preventScroll: true });
}
function trapFocus(e) {
  if (e.key === 'Escape') { if (modalOpen) return closeModal(modalOpen); if (lb?.classList.contains('open')) return closeLB(); return closeMenu(); }
  if (e.key !== 'Tab' || !html.classList.contains('menu-open')) return;
  const f = $$('a[href],button:not([disabled])', drawer).filter(x => x.offsetParent !== null || x === burger);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
window.addEventListener('gmv:cat', () => {
  const a = $('[data-nav=services]'); if (!a) return;
  const cat = getCat(); a.href = BASE + cat.path; $('small', a).textContent = `باقات ${cat.label}`;
});

/* ---------- Toast ---------- */
let tt;
export function toast(msg, ms = 2600) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), ms);
}

/* ---------- Reveal on scroll ---------- */
let io;
export function reveal(root = document) {
  const els = $$('.reveal:not(.in)', root);
  if (!('IntersectionObserver' in window)) { html.classList.add('no-io'); return; }
  io ??= new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  els.forEach(e => io.observe(e));
}

/* ---------- Horizontal scroller helpers ---------- */
export function drag(el) {
  let down = false, sx = 0, sl = 0, moved = false;
  el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; });
  window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (!moved && Math.abs(dx) > 5) { moved = true; el.classList.add('drag'); } if (moved) el.scrollLeft = sl - dx; });
  window.addEventListener('pointerup', () => { if (!down) return; down = false; el.classList.remove('drag'); if (moved) { el._moved = true; setTimeout(() => { el._moved = false; }, 0); } });
  el.addEventListener('click', e => { if (el._moved) { e.stopPropagation(); e.preventDefault(); } }, true);
}
export function arrows(el, prev, next) {
  const dir = getComputedStyle(el).direction === 'rtl' ? -1 : 1;
  const step = () => Math.max(240, el.clientWidth * .8);
  prev?.addEventListener('click', () => el.scrollBy({ left: -dir * step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => el.scrollBy({ left: dir * step(), behavior: 'smooth' }));
}

/* ---------- Modal ---------- */
let modalOpen = null;
export function openModal(m) {
  modalOpen = m; m.classList.add('open'); html.classList.add('lock');
  setTimeout(() => ($('input,textarea,button.opt,[data-close]', m) || m).focus?.(), 80);
}
export function closeModal(m) { m.classList.remove('open'); if (!lb?.classList.contains('open')) html.classList.remove('lock'); if (modalOpen === m) modalOpen = null; }
export function makeModal(id, inner) {
  const m = document.createElement('div');
  m.className = 'modal'; m.id = id; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="modal__box">${inner}</div>`;
  document.body.append(m);
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); });
  return m;
}


/* ---------- اختيار نوع النشاط (مودال مشترك) ---------- */
export function askCat(onPick) {
  let m = $('#typeModal');
  if (!m) {
    m = makeModal('typeModal', `<h3>اختار نوع نشاطك</h3><p>عشان نعرضلك الباقات والأسعار المناسبة ليك.</p>
      <div class="opts">${CATS.map((c, i) => `<button class="opt" type="button" data-i="${i}"><span class="opt__i">${icon(c.icon)}</span><span><b>${c.label}</b><small>${c.hint}</small></span></button>`).join('')}</div>`);
    m.addEventListener('click', e => {
      const b = e.target.closest('.opt'); if (!b) return;
      const cat = CATS[b.dataset.i]; setCat(cat); closeModal(m); toast(`تمام — هنعرضلك باقات ${cat.label}`); m._cb?.(cat);
    });
  }
  m._cb = onPick; openModal(m);
}

/* ---------- Lightbox ---------- */
let lb, lbList = [], lbI = 0, lbOpts = {}, lbFocus, tx0 = 0;
function buildLB() {
  lb = document.createElement('div');
  lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'عرض');
  lb.innerHTML = `<div class="lb__bg" data-x></div>
    <button class="lb__btn lb__close" type="button" data-x aria-label="إغلاق">${icon('close')}</button>
    <button class="lb__btn lb__prev" type="button" aria-label="السابق">${icon('right')}</button>
    <button class="lb__btn lb__next" type="button" aria-label="التالي">${icon('left')}</button>
    <div class="lb__stage"></div>
    <div class="lb__bar"><span class="lb__count"></span><a class="btn btn--primary btn--sm lb__cta" target="_blank" rel="noopener noreferrer" hidden></a></div>`;
  document.body.append(lb);
  lb.addEventListener('click', e => { if (e.target.closest('[data-x]')) closeLB(); });
  $('.lb__prev', lb).addEventListener('click', () => showLB(lbI - 1));
  $('.lb__next', lb).addEventListener('click', () => showLB(lbI + 1));
  lb.addEventListener('touchstart', e => { tx0 = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx0; if (Math.abs(dx) > 60) showLB(lbI + (dx < 0 ? 1 : -1)); }, { passive: true });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') showLB(lbI + 1); else if (e.key === 'ArrowRight') showLB(lbI - 1);
  });
}
function showLB(i) {
  const n = lbList.length; lbI = (i + n) % n;
  const it = lbList[lbI], stage = $('.lb__stage', lb);
  stage.querySelector('video')?.pause(); stage.textContent = '';
  if (it.type === 'video') {
    const v = document.createElement('video');
    v.controls = true; v.playsInline = true; v.autoplay = true; v.loop = true; if (it.poster) v.poster = it.poster; v.src = it.src;
    stage.append(v); v.play().catch(() => { });
  } else {
    const img = new Image(); img.alt = it.title || ''; img.decoding = 'async'; stage.append(img);
    if (it.thumb && it.thumb !== it.src) {
      img.className = 'soft'; img.src = it.thumb;
      const full = new Image(); full.onload = () => { if (stage.contains(img)) { img.src = full.src; img.classList.remove('soft'); } }; full.src = it.src;
    } else img.src = it.src;
  }
  $('.lb__count', lb).textContent = `${lbI + 1} / ${n}`;
  $('.lb__prev', lb).hidden = $('.lb__next', lb).hidden = n < 2;
  $('.lb__count', lb).hidden = n < 2;
  const cta = $('.lb__cta', lb);
  if (lbOpts.cta) { cta.hidden = false; cta.href = lbOpts.cta.href; cta.innerHTML = `${icon('wa')} ${esc(lbOpts.cta.label)}`; } else cta.hidden = true;
}
export function openLightbox(list, index = 0, opts = {}) {
  if (!list.length) return;
  if (!lb) buildLB();
  lbList = list; lbOpts = opts; lbFocus = document.activeElement;
  lb.classList.add('open'); html.classList.add('lock'); showLB(index);
  $('.lb__close', lb).focus({ preventScroll: true });
}
export function closeLB() {
  if (!lb) return;
  lb.classList.remove('open'); $('.lb__stage', lb).querySelector('video')?.pause();
  setTimeout(() => { if (!lb.classList.contains('open')) $('.lb__stage', lb).textContent = ''; }, 320);
  if (!html.classList.contains('menu-open') && !modalOpen) html.classList.remove('lock');
  lbFocus?.focus?.({ preventScroll: true });
}

/* ---------- Network helpers ---------- */
export async function postJSON(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(String(r.status));
  return r.json().catch(() => ({}));
}

/* ---------- init ---------- */
function splitTitle() {
  $$('[data-split]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true" style="--i:${i}">${esc(w)}</span>`).join(' ');
  });
}
export function counter(el, to, ms = 1400) {
  if (!el) return; const from = 0, t0 = performance.now();
  const tick = t => { const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(from + (to - from) * e).toLocaleString('ar-EG'); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => { html.classList.toggle('scrolled', window.scrollY > 24); ticking = false; });
}, { passive: true });
document.addEventListener('keydown', trapFocus);

buildChrome();
splitTitle();
reveal();
html.classList.toggle('scrolled', window.scrollY > 24);
