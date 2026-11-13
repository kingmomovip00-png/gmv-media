/* GMV Media — طبقة البيانات (بدون أي DOM) — بتستخدمها الصفحات العامة ولوحة الأدمن
   - بتقرأ الملفات المرفوعة من Firebase (REST خفيف بدون SDK)
   - بتدمجها مع الملفات المحلية (local-media.js)
   - بتحدد كل صورة/فيديو تظهر فين (slots) */
import { LOCAL } from './local-media.js';
const BASE = document.documentElement.dataset.base || '';

export const DB_URL = 'https://gmv-media-default-rtdb.firebaseio.com';

/** أماكن الظهور في الموقع — لوحة الأدمن بتستخدم نفس القايمة */
export const SLOTS = [
  { id: 'home-offers', page: 'الرئيسية', label: 'العروض', types: ['image'], hint: 'بانرات العروض أعلى الصفحة الرئيسية' },
  { id: 'home-works', page: 'الرئيسية', label: 'أعمالنا', types: ['image', 'video'], hint: 'شريط الأعمال المتحرك' },
  { id: 'home-showreel', page: 'الرئيسية', label: 'ريل الفيديوهات', types: ['video'], hint: 'قسم الفيديوهات الطولية' },
  { id: 'home-reviews', page: 'الرئيسية', label: 'آراء العملاء', types: ['image'], hint: 'صور آراء العملاء' },
  { id: 'works', page: 'صفحة الأعمال', label: 'معرض الأعمال', types: ['image', 'video'], hint: 'الصفحة الكاملة للأعمال' },
  { id: 'reviews', page: 'صفحة آراء العملاء', label: 'صور الآراء', types: ['image'], hint: 'معرض الآراء' },
  { id: 'pkg-small', page: 'صفحات الباقات', label: 'باقات محل صغير', types: ['image'], hint: 'بتتضاف بعد الباقات الأساسية' },
  { id: 'pkg-brand', page: 'صفحات الباقات', label: 'باقات براند / شركة', types: ['image'], hint: 'بتتضاف بعد الباقات الأساسية' },
  { id: 'pkg-outside', page: 'صفحات الباقات', label: 'باقات خارج مصر', types: ['image'], hint: 'بتتضاف بعد الباقات الأساسية' }
];
export const slotById = id => SLOTS.find(s => s.id === id);

/* ---------- Firebase REST ---------- */
const CACHE_KEY = 'gmv_media_v2';
const getJSON = async (path, q = '') => {
  const r = await fetch(`${DB_URL}/${path}.json${q}`, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${path}:${r.status}`);
  return r.json();
};
export function cachedRemote() {
  try { const c = JSON.parse(sessionStorage.getItem(CACHE_KEY)); return c && Date.now() - c.t < 5 * 60e3 ? c.d : null; } catch { return null; }
}
export async function fetchRemote() {
  const [media, overrides] = await Promise.all([getJSON('media').catch(() => null), getJSON('overrides').catch(() => null)]);
  const d = { media: media || {}, overrides: overrides || {} };
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d })); } catch { /* quota */ }
  return d;
}
export async function loadRemote(maxWait = 700) {
  const cached = cachedRemote();
  if (cached) { fetchRemote().catch(() => { }); return cached; }
  const p = fetchRemote().catch(() => ({ media: {}, overrides: {} }));
  return Promise.race([p, new Promise(r => setTimeout(() => r(null), maxWait))]).then(v => v || { media: {}, overrides: {}, late: p });
}

/* ---------- Merge ---------- */
const normPl = p => (Array.isArray(p) ? p : Object.keys(p || {}).filter(k => p[k]));
const local = p => (/^(https?:)?\/\//.test(p) ? p : BASE + p);

/** كل العناصر (محلي + سحابي) بما فيها المخفي — لوحة الأدمن بتحتاجها */
export function buildAll(remote) {
  const ov = remote?.overrides || {}, out = [];
  LOCAL.forEach((it, idx) => {
    const o = (!it.locked && ov[it.id]) || {};
    out.push({ ...it, ...o, source: 'local', idx, placements: normPl(o.placements ?? it.placements), active: o.active !== false });
  });
  Object.entries(remote?.media || {}).forEach(([id, m]) => {
    if (!m || !m.url) return;
    out.push({ ...m, id, source: 'cloud', placements: normPl(m.placements), active: m.active !== false });
  });
  return out;
}
const rank = it => (it.pin ? 0 : 1);
const cmp = (a, b) =>
  (b.locked ? 1 : 0) - (a.locked ? 1 : 0) ||          // الباقات الأساسية دايمًا الأول
  rank(a) - rank(b) ||
  (a.order ?? 1e6) - (b.order ?? 1e6) ||
  (a.source === b.source ? 0 : a.source === 'cloud' ? -1 : 1) ||
  (a.source === 'cloud' ? (b.createdAt || 0) - (a.createdAt || 0) : a.idx - b.idx);
export function itemsFor(slot, all) {
  return all.filter(i => i.active && i.placements.includes(slot)).sort(cmp);
}

/* ---------- URLs (ImageKit transformations للصور السحابية) ---------- */
const tr = (url, t) => `${url}${url.includes('?') ? '&' : '?'}tr=${t}`;
export function thumbOf(it, w = 640) {
  if (it.source === 'cloud') return it.type === 'video' ? tr(`${it.url}/ik-thumbnail.jpg`, `w-${w}`) : tr(it.url, `w-${w},q-72,f-auto`);
  return local(it.type === 'video' ? it.poster : (it.thumb || it.url));
}
export const fullOf = it => (it.source === 'cloud' ? (it.type === 'video' ? it.url : tr(it.url, 'w-1800,q-85,f-auto')) : local(it.url));
export const lbItem = it => ({ type: it.type, src: fullOf(it), thumb: it.type === 'video' ? null : thumbOf(it, 900), poster: it.type === 'video' ? thumbOf(it, 720) : null, title: it.title || '' });


export { cmp };
