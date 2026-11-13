/* GMV Media — رسم الميديا في الصفحات العامة */
import { esc, icon, openLightbox, reveal, drag, wa } from './site.js';
import { itemsFor, thumbOf, lbItem } from './media-core.js';
export * from './media-core.js';

/* ---------- Render ---------- */
export function card(it, { w = 640, tag = false, cap = false, eager = false } = {}) {
  const el = document.createElement('figure');
  el.className = 'mcard'; el.tabIndex = 0; el.setAttribute('role', 'button');
  el.setAttribute('aria-label', it.title || (it.type === 'video' ? 'تشغيل الفيديو' : 'عرض الصورة'));
  if (it.w && it.h) el.style.setProperty('--ar', `${it.w}/${it.h}`);
  const img = new Image();
  img.alt = it.title || ''; img.decoding = 'async'; img.loading = eager ? 'eager' : 'lazy';
  if (it.w && it.h) { img.width = it.w; img.height = it.h; }
  const done = () => el.classList.add('loaded');
  img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true });
  img.src = thumbOf(it, w); if (img.complete) done();
  el.append(img);
  if (it.type === 'video') el.insertAdjacentHTML('beforeend', `<div class="mcard__play"><b>${icon('play')}</b></div>`);
  if (tag && it.badge) el.insertAdjacentHTML('beforeend', `<span class="mcard__tag">${esc(it.badge)}</span>`);
  if (cap && it.title) el.insertAdjacentHTML('beforeend', `<figcaption class="mcard__cap">${esc(it.title)}</figcaption>`);
  el._item = it;
  return el;
}

/** يملأ حاوية بكروت. `extra` بيتحط لو مفيش عناصر */
export function fill(container, items, opts = {}) {
  container.textContent = '';
  const frag = document.createDocumentFragment();
  items.forEach((it, i) => frag.append(card(it, { ...opts, eager: i < (opts.eagerN ?? 2) })));
  container.append(frag);
  return items.length;
}

/** الضغط على أي كارت يفتح الـ lightbox (بيتعامل مع الفلترة) */
export function gallery(container, opts = {}) {
  const open = card => {
    const cards = [...container.querySelectorAll('.mcard')].filter(c => !c.hidden && c.offsetParent !== null);
    const i = cards.indexOf(card);
    if (i > -1) openLightbox(cards.map(c => lbItem(c._item)), i, typeof opts.cta === 'function' ? { cta: opts.cta() } : opts);
  };
  container.addEventListener('click', e => { const c = e.target.closest('.mcard'); if (c) open(c); });
  container.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('mcard')) { e.preventDefault(); open(e.target); } });
}

export const scroller = c => drag(c);

/** يرسم slot في حاوية ويخفي القسم (sectionEl) لو فاضي */
export function mountSlot(slot, all, container, { section, ...opts } = {}) {
  const items = itemsFor(slot, all);
  const n = fill(container, items, opts);
  if (section) section.hidden = n === 0;
  if (!n) { container.innerHTML = '<p class="empty">لسه مفيش محتوى هنا.</p>'; }
  reveal(section || container);
  return n;
}

export { wa };
