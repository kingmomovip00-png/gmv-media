/* GMV Media — لوحة الأدمن
   Firebase Auth (دخول) + Realtime Database (البيانات) + ImageKit (رفع الصور والفيديو عن طريق /api) */
import { firebaseConfig } from './firebase-config.js';
import { SLOTS, buildAll, itemsFor, thumbOf, fullOf } from './media-core.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getDatabase, ref, onValue, set, update, remove, push, get, query, limitToLast } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const root = $('#root');
let tt;
function toast(msg, ms = 3000) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), ms); }
const size = b => (b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB');
const ico = (d, c = '') => `<svg class="ico ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  up: ico('<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>'),
  lib: ico('<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>'),
  pin: ico('<path d="M12 17v5"/><path d="M8 3h8l-1 7 3 3H6l3-3-1-7Z"/>'),
  msg: ico('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>'),
  cog: ico('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
  x: ico('<path d="M6 6l12 12M18 6 6 18"/>'),
  trash: ico('<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>'),
  eye: ico('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
  eyeoff: ico('<path d="M3 3l18 18"/><path d="M10.6 6.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 4.4-1"/>'),
  edit: ico('<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>'),
  play: '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>',
  lock: ico('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  up2: ico('<path d="m6 15 6-6 6 6"/>'), dn2: ico('<path d="m6 9 6 6 6-6"/>'),
  out: ico('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l5-5-5-5M15 12H4"/>'),
  ok: ico('<path d="m5 12 5 5 9-10"/>'), pinfill: '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M8 3h8l-1 7 3 3H6l3-3-1-7Zm3.2 11h1.6v8h-1.6z"/></svg>'
};
const errAr = e => {
  const c = e?.code || '';
  if (/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c)) return 'الإيميل أو كلمة السر غير صحيحة (أو المستخدم ده لسه مضافش في Firebase ← Authentication ← Users)';
  if (/operation-not-allowed|configuration-not-found/.test(c)) return 'الدخول بالإيميل مش مفعّل: Firebase ← Authentication ← Sign-in method ← فعّل Email/Password (ولو أول مرة اضغط Get started)';
  if (/api-key/.test(c)) return 'مفتاح apiKey غلط في assets/js/firebase-config.js — انسخه من Firebase ← Project settings';
  if (/unauthorized-domain/.test(c)) return 'دومين الموقع مش مضاف: Firebase ← Authentication ← Settings ← Authorized domains';
  if (/user-disabled/.test(c)) return 'الحساب ده متوقف في Firebase';
  if (/too-many-requests/.test(c)) return 'محاولات كتير، جرّب بعد شوية';
  if (/network/.test(c)) return 'مشكلة في الاتصال بالإنترنت';
  if (/PERMISSION_DENIED|permission/i.test(e?.message || c)) return 'مفيش صلاحية — راجع قواعد Firebase و ADMIN_UID';
  return (c ? `[${c}] ` : '') + (e?.message || 'حصلت مشكلة غير متوقعة');
};

/* ---------- state ---------- */
const S = {
  user: null, gate: null, api: null, tab: 'upload', media: {}, overrides: {}, connected: false,
  queue: [], compress: true, uploading: false,
  defPl: new Set(JSON.parse(localStorage.getItem('gmv_adm_defpl') || '["works"]')),
  f: { q: '', type: 'all', slot: 'all', src: 'all' }, edit: null, subs: []
};
const all = () => buildAll({ media: S.media, overrides: S.overrides });
const pages = [...new Set(SLOTS.map(s => s.page))];
const slotChips = (sel, type, attr = '') => pages.map(p => `<div class="pg"><small>${esc(p)}</small><div class="chips">${SLOTS.filter(s => s.page === p).map(s => {
  const ok = !type || s.types.includes(type);
  return `<button type="button" class="chipbtn${sel.has(s.id) ? ' on' : ''}" ${ok ? '' : 'disabled'} data-slot="${s.id}" ${attr} title="${esc(s.hint)}${ok ? '' : ' — مش متاح للنوع ده'}">${esc(s.label)}</button>`;
}).join('')}</div></div>`).join('');
const plObj = set_ => { const a = [...set_]; return a.length ? Object.fromEntries(a.map(k => [k, true])) : { _: true }; };

/* ---------- auth flow ---------- */
function bootBg() { /* الخلفية موجودة في HTML */ }
onAuthStateChanged(auth, async u => {
  S.subs.forEach(f => f()); S.subs = [];
  S.user = u; S.gate = null; S.api = null;
  if (!u) return view();
  root.innerHTML = '<div class="splash"><div class="spin"></div><p>جاري التحقق...</p></div>';
  await checkApi();
  if (S.gate) return view();
  subscribe(); view();
});
async function token() { return S.user.getIdToken(); }
async function api(path, opts = {}) {
  const r = await fetch(path, { ...opts, headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + await token(), ...(opts.body ? { 'Content-Type': 'application/json' } : {}) } });
  let j = {}; try { j = await r.json(); } catch { /* not json */ }
  if (!r.ok) { const e = new Error(j.error || 'HTTP ' + r.status); e.data = j; e.status = r.status; throw e; }
  return j;
}
async function checkApi() {
  try { S.api = await api('/api/status'); }
  catch (e) {
    if (e.status === 403 && e.data?.error === 'not_admin') { S.gate = { uid: e.data.uid, reason: 'not_admin' }; return; }
    S.api = { error: true, offline: !e.status, uid: e.data?.uid };
  }
}
function subscribe() {
  const err = e => toast(errAr(e));
  S.subs.push(onValue(ref(db, 'media'), s => { S.media = s.val() || {}; refresh(); }, err));
  S.subs.push(onValue(ref(db, 'overrides'), s => { S.overrides = s.val() || {}; refresh(); }, err));
  S.subs.push(onValue(ref(db, '.info/connected'), s => { S.connected = !!s.val(); if (S.tab === 'settings') body(); }));
}
function refresh() { if (['library', 'slots'].includes(S.tab)) body(); if (S.edit) { /* المحرر مفتوح: متلمسهوش */ } }

/* ---------- views ---------- */
function view() {
  if (!S.user) return loginView();
  if (S.gate) return gateView();
  appView();
}
function loginView() {
  root.innerHTML = `
  <div class="login">
    <div class="login__logo"><img src="../assets/img/logo-sm.webp" alt="GMV Media" width="180" height="77"></div>
    <h1>لوحة التحكم</h1><p>سجّل دخولك لإدارة التصميمات والفيديوهات.</p>
    <form id="loginForm" novalidate>
      <div class="field"><label for="em">الإيميل</label><input class="input" id="em" type="email" autocomplete="username" dir="ltr" style="text-align:right" required></div>
      <div class="field"><label for="pw">كلمة السر</label><input class="input" id="pw" type="password" autocomplete="current-password" dir="ltr" style="text-align:right" required></div>
      <p class="err" id="loginErr" role="alert" hidden></p>
      <button class="btn btn--primary btn--block" id="loginBtn" type="submit">دخول</button>
      <button class="link" id="forgot" type="button">نسيت كلمة السر؟</button>
    </form>
  </div>`;
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const b = $('#loginBtn'), er = $('#loginErr'); er.hidden = true; b.disabled = true; b.textContent = 'جاري الدخول...';
    try { await signInWithEmailAndPassword(auth, $('#em').value.trim(), $('#pw').value); }
    catch (x) { er.textContent = errAr(x); er.hidden = false; b.disabled = false; b.textContent = 'دخول'; }
  });
  $('#forgot').addEventListener('click', async () => {
    const em = $('#em').value.trim(); if (!em) return toast('اكتب الإيميل الأول');
    try { await sendPasswordResetEmail(auth, em); toast('بعتنالك لينك تغيير كلمة السر على الإيميل'); } catch (x) { toast(errAr(x)); }
  });
}
function gateView() {
  root.innerHTML = `
  <div class="login">
    <div class="login__logo gate">${I.lock}</div>
    <h1>الحساب ده مش مسموح له</h1>
    <p>الدخول نجح، لكن الحساب مش هو أدمن الموقع. لو انت صاحب الموقع حط الـ UID ده في إعدادات Vercel باسم <b dir="ltr">ADMIN_UID</b> وفي ملف قواعد Firebase:</p>
    <code class="uid" id="uidBox" dir="ltr">${esc(S.gate.uid || '—')}</code>
    <button class="btn btn--block" id="copyUid" type="button">نسخ الـ UID</button>
    <button class="link" id="out" type="button">تسجيل الخروج</button>
  </div>`;
  $('#copyUid').onclick = () => navigator.clipboard?.writeText(S.gate.uid || '').then(() => toast('تم النسخ'));
  $('#out').onclick = () => signOut(auth);
}

const TABS = [['upload', 'رفع جديد', I.up], ['library', 'المكتبة', I.lib], ['slots', 'الأماكن والترتيب', I.pin], ['messages', 'الرسائل والآراء', I.msg], ['settings', 'الإعدادات', I.cog]];
function appView() {
  root.innerHTML = `
  <header class="adm__top">
    <div class="adm__brand"><img src="../assets/img/logo-sm.webp" alt="" width="89" height="38"><div><b>لوحة GMV</b><small dir="ltr">${esc(S.user.email || '')}</small></div></div>
    <div class="adm__top-r"><a class="btn btn--sm" href="../" target="_blank" rel="noopener">فتح الموقع</a><button class="btn btn--sm" id="logout" type="button">${I.out} خروج</button></div>
  </header>
  <nav class="tabs" id="tabs" role="tablist">${TABS.map(([id, t, ic]) => `<button type="button" role="tab" data-tab="${id}" class="${S.tab === id ? 'on' : ''}" aria-selected="${S.tab === id}">${ic}<span>${t}</span></button>`).join('')}</nav>
  <section id="body"></section>`;
  $('#logout').onclick = () => signOut(auth);
  $('#tabs').onclick = e => { const b = e.target.closest('[data-tab]'); if (!b) return; S.tab = b.dataset.tab; $$('#tabs button').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); }); body(); };
  body();
}
function body() {
  const el = $('#body'); if (!el) return;
  ({ upload: uploadTab, library: libraryTab, slots: slotsTab, messages: messagesTab, settings: settingsTab }[S.tab])(el);
}

/* ======================= رفع جديد ======================= */
function uploadTab(el) {
  el.innerHTML = `
  <div class="card">
    <h2>ارفع تصميمات وفيديوهات</h2>
    <label class="drop" id="drop" for="fileIn">
      <span class="drop__ico">${I.up}</span>
      <b>اسحب الملفات هنا أو اضغط للاختيار</b>
      <small>صور (JPG / PNG / WebP) وفيديوهات (MP4 / WebM / MOV) — تقدر تختار أكتر من ملف</small>
      <input type="file" id="fileIn" multiple accept="image/*,video/*" hidden>
    </label>
    <div class="defbox">
      <div class="defbox__h"><b>يظهر فين؟</b><small>الأماكن دي بتتطبق على أي ملف تضيفه، وتقدر تعدلها لكل ملف لوحده تحت.</small></div>
      <div id="defChips">${slotChips(S.defPl, null, 'data-def')}</div>
      <label class="check"><input type="checkbox" id="cmp" ${S.compress ? 'checked' : ''}> ضغط الصور تلقائيًا قبل الرفع (أخف وأسرع — بدون فرق واضح في الجودة)</label>
    </div>
  </div>
  <div id="queue"></div>`;
  const input = $('#fileIn'), drop = $('#drop');
  input.onchange = () => { addFiles([...input.files]); input.value = ''; };
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => addFiles([...e.dataTransfer.files]));
  $('#cmp').onchange = e => { S.compress = e.target.checked; };
  $('#defChips').onclick = e => {
    const b = e.target.closest('[data-def]'); if (!b) return;
    const s = b.dataset.slot; S.defPl.has(s) ? S.defPl.delete(s) : S.defPl.add(s);
    localStorage.setItem('gmv_adm_defpl', JSON.stringify([...S.defPl]));
    b.classList.toggle('on');
  };
  queueView();
}
const uid = () => Math.random().toString(36).slice(2, 9);
function addFiles(files) {
  let skipped = 0;
  files.forEach(f => {
    const type = f.type.startsWith('video/') ? 'video' : f.type.startsWith('image/') ? 'image' : null;
    if (!type) { skipped++; return; }
    const pl = new Set([...S.defPl].filter(s => SLOTS.find(x => x.id === s)?.types.includes(type)));
    S.queue.push({ id: uid(), file: f, type, preview: URL.createObjectURL(f), title: '', badge: '', pl, status: 'ready', pct: 0, err: '' });
  });
  if (skipped) toast(`${skipped} ملف تم تجاهله (النوع غير مدعوم)`);
  queueView();
}
function qItemHTML(q) {
  const st = { ready: 'جاهز', processing: 'بيتجهّز...', uploading: `بيترفع ${q.pct}%`, saving: 'بيتحفظ...', done: 'تم ✓', error: 'فشل' }[q.status];
  const locked = ['processing', 'uploading', 'saving', 'done'].includes(q.status);
  return `<article class="q q--${q.status}" data-q="${q.id}">
    <div class="q__prev">${q.type === 'video' ? `<video src="${q.preview}#t=0.5" muted playsinline preload="metadata"></video><span class="q__play">${I.play}</span>` : `<img src="${q.preview}" alt="">`}</div>
    <div class="q__main">
      <div class="q__top"><div class="q__name" dir="ltr">${esc(q.file.name)}</div><span class="q__size">${q.type === 'video' ? 'فيديو' : 'صورة'} · ${size(q.file.size)}</span>
        <button class="ib" data-act="qrm" data-q="${q.id}" aria-label="إزالة" ${q.status === 'uploading' || q.status === 'saving' ? 'disabled' : ''}>${I.x}</button></div>
      <div class="q__fields">
        <input class="input" data-qf="title" data-q="${q.id}" maxlength="80" placeholder="عنوان (اختياري)" value="${esc(q.title)}" ${locked ? 'disabled' : ''}>
        ${q.pl.has('home-offers') ? `<input class="input" data-qf="badge" data-q="${q.id}" maxlength="30" placeholder="شارة العرض (مثال: خصم حصري)" value="${esc(q.badge)}" ${locked ? 'disabled' : ''}>` : ''}
      </div>
      <details class="q__pl" ${q.pl.size ? '' : 'open'}><summary>يظهر في: <b>${q.pl.size ? [...q.pl].map(s => SLOTS.find(x => x.id === s)?.label).join('، ') : 'لسه مختارتش مكان!'}</b></summary>${slotChips(q.pl, q.type, `data-qpl="${q.id}"`)}</details>
      <div class="q__st"><div class="pb"><i style="width:${q.status === 'done' ? 100 : q.pct}%"></i></div><span class="q__msg">${st}${q.err ? ' — ' + esc(q.err) : ''}</span></div>
    </div></article>`;
}
function queueView() {
  const el = $('#queue'); if (!el) return;
  if (!S.queue.length) { el.innerHTML = ''; return; }
  const pending = S.queue.filter(q => q.status === 'ready' || q.status === 'error').length;
  el.innerHTML = `<div class="qlist">${S.queue.map(qItemHTML).join('')}</div>
    <div class="bar"><button class="btn btn--primary" id="go" type="button" ${S.uploading || !pending ? 'disabled' : ''}>${S.uploading ? 'جاري الرفع...' : `ابدأ الرفع (${pending})`}</button>
    <button class="btn" id="clr" type="button" ${S.uploading ? 'disabled' : ''}>مسح القائمة</button></div>`;
  $('#go').onclick = startUpload;
  $('#clr').onclick = () => { S.queue.forEach(q => URL.revokeObjectURL(q.preview)); S.queue = []; queueView(); };
  el.onclick = e => {
    const rm = e.target.closest('[data-act=qrm]');
    if (rm) { const i = S.queue.findIndex(q => q.id === rm.dataset.q); if (i > -1) { URL.revokeObjectURL(S.queue[i].preview); S.queue.splice(i, 1); queueView(); } return; }
    const c = e.target.closest('[data-qpl]'); if (!c) return;
    const q = S.queue.find(x => x.id === c.dataset.qpl); if (!q || ['uploading', 'saving', 'done'].includes(q.status)) return;
    const s = c.dataset.slot; q.pl.has(s) ? q.pl.delete(s) : q.pl.add(s);
    const keep = $('details', c.closest('.q'))?.open; queueView(); const d = $(`[data-q="${q.id}"] details`); if (d) d.open = keep ?? true;
  };
  el.oninput = e => { const f = e.target.dataset.qf; if (!f) return; const q = S.queue.find(x => x.id === e.target.dataset.q); if (q) q[f] = e.target.value; };
}
function qUpdate(q) {
  const el = $(`[data-q="${q.id}"]`); if (!el) return;
  el.className = `q q--${q.status}`;
  const st = { ready: 'جاهز', processing: 'بيتجهّز...', uploading: `بيترفع ${q.pct}%`, saving: 'بيتحفظ...', done: 'تم ✓', error: 'فشل' }[q.status];
  $('.pb i', el).style.width = (q.status === 'done' ? 100 : q.pct) + '%';
  $('.q__msg', el).textContent = st + (q.err ? ' — ' + q.err : '');
}

async function imageDims(file) { const b = await createImageBitmap(file); const d = { w: b.width, h: b.height }; b.close?.(); return d; }
function videoDims(file) {
  return new Promise(res => {
    const v = document.createElement('video'), u = URL.createObjectURL(file); let done = false;
    const fin = d => { if (done) return; done = true; URL.revokeObjectURL(u); res(d); };
    v.preload = 'metadata'; v.muted = true; v.onloadedmetadata = () => fin({ w: v.videoWidth || 0, h: v.videoHeight || 0 }); v.onerror = () => fin({ w: 0, h: 0 });
    setTimeout(() => fin({ w: 0, h: 0 }), 6000); v.src = u;
  });
}
async function prepare(q) {
  if (q.type === 'video') return { blob: q.file, ...(await videoDims(q.file)) };
  const f = q.file;
  if (!S.compress || /gif|svg/.test(f.type)) { let d = { w: 0, h: 0 }; try { d = await imageDims(f); } catch { /* svg */ } return { blob: f, ...d }; }
  const bmp = await createImageBitmap(f);
  const k = Math.min(1, 2400 / Math.max(bmp.width, bmp.height)), W = Math.round(bmp.width * k), H = Math.round(bmp.height * k);
  if (k === 1 && f.size < 1.2e6) { bmp.close?.(); return { blob: f, w: W, h: H }; }
  const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(bmp, 0, 0, W, H); bmp.close?.();
  const blob = await new Promise(r => c.toBlob(r, 'image/webp', .9));
  if (!blob || (k === 1 && blob.size >= f.size)) return { blob: f, w: W, h: H };
  return { blob, w: W, h: H, renamed: true };
}
const safeName = (name, ext) => { const base = name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'gmv'; return `${base}.${ext}`; };
async function ikUpload(q, blob, ext) {
  const a = await api('/api/imagekit-auth');
  const fd = new FormData();
  const name = safeName(q.file.name, ext);
  fd.append('file', blob, name); fd.append('fileName', name); fd.append('publicKey', a.publicKey);
  fd.append('signature', a.signature); fd.append('expire', a.expire); fd.append('token', a.token);
  fd.append('useUniqueFileName', 'true'); fd.append('folder', q.type === 'video' ? '/gmv/videos' : '/gmv/designs');
  return new Promise((res, rej) => {
    const x = new XMLHttpRequest();
    x.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');
    x.upload.onprogress = e => { if (e.lengthComputable) { q.pct = Math.round(e.loaded / e.total * 100); qUpdate(q); } };
    x.onload = () => { let j = {}; try { j = JSON.parse(x.responseText); } catch { /* */ } x.status >= 200 && x.status < 300 ? res(j) : rej(new Error(j.message || 'ImageKit HTTP ' + x.status)); };
    x.onerror = () => rej(new Error('تعذر الاتصال بـ ImageKit'));
    x.send(fd);
  });
}
async function uploadOne(q) {
  q.err = ''; q.pct = 0; q.status = 'processing'; qUpdate(q);
  try {
    if (!q.pl.size) throw new Error('اختار مكان الظهور الأول');
    const p = await prepare(q);
    const ext = q.type === 'video' ? (q.file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') : (p.renamed ? 'webp' : (q.file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, ''));
    q.status = 'uploading'; qUpdate(q);
    const r = await ikUpload(q, p.blob, ext);
    q.status = 'saving'; q.pct = 100; qUpdate(q);
    const rec = {
      type: q.type, url: r.url, fileId: r.fileId, name: r.name || '', w: r.width || p.w || null, h: r.height || p.h || null, size: r.size || p.blob.size,
      title: q.title.trim(), placements: plObj(q.pl), pin: false, active: true, createdAt: Date.now()
    };
    if (q.badge.trim() && q.pl.has('home-offers')) rec.badge = q.badge.trim();
    Object.keys(rec).forEach(k => (rec[k] === null || rec[k] === '') && delete rec[k]);
    await set(push(ref(db, 'media')), rec);
    q.status = 'done'; qUpdate(q);
  } catch (e) { q.status = 'error'; q.err = e.data?.error === 'imagekit_not_configured' ? 'مفاتيح ImageKit مش متضافة في Vercel' : errAr(e); qUpdate(q); }
}
async function startUpload() {
  if (S.uploading) return;
  S.uploading = true;
  const todo = S.queue.filter(q => q.status === 'ready' || q.status === 'error');
  queueView();
  let i = 0;
  const worker = async () => { while (i < todo.length) { const q = todo[i++]; await uploadOne(q); } };
  await Promise.all([worker(), worker()]);
  S.uploading = false;
  const ok = todo.filter(q => q.status === 'done').length, bad = todo.length - ok;
  toast(bad ? `تم رفع ${ok} وفشل ${bad}` : `تم رفع ${ok} ملف بنجاح ✓`);
  queueView();
}

/* ======================= المكتبة ======================= */
function filtered() {
  const { q, type, slot, src } = S.f, qq = q.trim().toLowerCase();
  return all().filter(i =>
    (type === 'all' || i.type === type) && (src === 'all' || (src === 'cloud' ? i.source === 'cloud' : i.source === 'local')) &&
    (slot === 'all' || (slot === 'none' ? i.placements.filter(p => SLOTS.some(s => s.id === p)).length === 0 : i.placements.includes(slot))) &&
    (!qq || (i.title || '').toLowerCase().includes(qq) || (i.name || '').toLowerCase().includes(qq) || String(i.id).toLowerCase().includes(qq)));
}
const slotLabel = id => SLOTS.find(s => s.id === id)?.label || id;
function lcard(i) {
  const pls = i.placements.filter(p => SLOTS.some(s => s.id === p));
  return `<article class="lcard${i.active ? '' : ' is-off'}" data-id="${esc(i.id)}">
    <button class="lcard__img" data-act="edit" data-id="${esc(i.id)}" aria-label="تعديل"><img src="${esc(thumbOf(i, 420))}" alt="" loading="lazy" decoding="async">
      <span class="tag">${i.type === 'video' ? 'فيديو' : 'صورة'}</span>${i.source === 'local' ? `<span class="tag tag--b">${i.locked ? I.lock + ' ثابت' : 'محلي'}</span>` : ''}${i.pin ? `<span class="tag tag--p">${I.pinfill}</span>` : ''}${i.type === 'video' ? `<span class="lcard__play">${I.play}</span>` : ''}${i.active ? '' : '<span class="lcard__off">مخفي</span>'}</button>
    <div class="lcard__b"><div class="lcard__t">${esc(i.title || i.name || i.id)}</div>
      <div class="lcard__pl">${pls.length ? pls.map(p => `<span>${esc(slotLabel(p))}</span>`).join('') : '<span class="warn">من غير مكان</span>'}</div></div>
    <div class="lcard__a">${i.locked ? `<span class="muted">${I.lock} ملف ثابت</span>` : `<button class="ib" data-act="edit" data-id="${esc(i.id)}" title="تعديل">${I.edit}</button><button class="ib" data-act="toggle" data-id="${esc(i.id)}" title="${i.active ? 'إخفاء' : 'إظهار'}">${i.active ? I.eye : I.eyeoff}</button>${i.source === 'cloud' ? `<button class="ib danger" data-act="del" data-id="${esc(i.id)}" title="حذف">${I.trash}</button>` : ''}`}</div>
  </article>`;
}
function libraryTab(el) {
  const list = filtered(), total = all().length;
  el.innerHTML = `
  <div class="card tools">
    <input class="input" id="fq" type="search" placeholder="ابحث بالعنوان أو اسم الملف..." value="${esc(S.f.q)}">
    <select class="input" id="ft"><option value="all">كل الأنواع</option><option value="image"${S.f.type === 'image' ? ' selected' : ''}>صور</option><option value="video"${S.f.type === 'video' ? ' selected' : ''}>فيديو</option></select>
    <select class="input" id="fs"><option value="all">كل الأماكن</option>${SLOTS.map(s => `<option value="${s.id}"${S.f.slot === s.id ? ' selected' : ''}>${esc(s.page)} · ${esc(s.label)}</option>`).join('')}<option value="none"${S.f.slot === 'none' ? ' selected' : ''}>من غير مكان</option></select>
    <select class="input" id="fr"><option value="all">كل المصادر</option><option value="cloud"${S.f.src === 'cloud' ? ' selected' : ''}>المرفوع من اللوحة</option><option value="local"${S.f.src === 'local' ? ' selected' : ''}>ملفات المشروع</option></select>
  </div>
  <p class="count">${list.length} من ${total} عنصر</p>
  <div class="lib" id="lib">${list.length ? list.map(lcard).join('') : '<p class="empty">مفيش نتائج.</p>'}</div>`;
  const rebuild = () => { const pos = $('#fq')?.selectionStart; libraryTab(el); const f = $('#fq'); if (f && document.activeElement !== f && S.f._focus) { f.focus(); f.setSelectionRange(pos, pos); } };
  $('#fq').oninput = e => { S.f.q = e.target.value; S.f._focus = true; rebuild(); };
  $('#ft').onchange = e => { S.f.type = e.target.value; S.f._focus = false; rebuild(); };
  $('#fs').onchange = e => { S.f.slot = e.target.value; S.f._focus = false; rebuild(); };
  $('#fr').onchange = e => { S.f.src = e.target.value; S.f._focus = false; rebuild(); };
  if (S.f._focus) { const f = $('#fq'); f.focus(); const n = f.value.length; f.setSelectionRange(n, n); }
}

/* ---------- حفظ التعديلات (سحابي → media/، محلي → overrides/) ---------- */
const pathOf = i => (i.source === 'cloud' ? `media/${i.id}` : `overrides/${i.id}`);
const byId = id => all().find(i => String(i.id) === String(id));
async function patch(i, vals) {
  if (i.locked) return toast('الملف ده ثابت ومينفعش يتغير');
  try { await update(ref(db, pathOf(i)), vals); } catch (e) { toast(errAr(e)); throw e; }
}
async function toggleActive(i) { await patch(i, { active: !i.active }); toast(i.active ? 'تم إخفاؤه من الموقع' : 'تم إظهاره في الموقع'); }
async function deleteItem(i) {
  if (!confirm(`حذف "${i.title || i.name || 'العنصر'}" نهائيًا من الموقع ومن ImageKit؟\nمينفعش التراجع.`)) return;
  try {
    if (i.fileId) { try { await api('/api/imagekit-delete', { method: 'POST', body: JSON.stringify({ fileId: i.fileId }) }); } catch (e) { if (!confirm('تعذر الحذف من ImageKit (' + (e.data?.error || e.message) + ').\nتحب تحذفه من الموقع بس؟')) return; } }
    await remove(ref(db, pathOf(i))); toast('تم الحذف ✓');
  } catch (e) { toast(errAr(e)); }
}

/* ---------- نافذة التعديل ---------- */
function openEditor(id) {
  const i = byId(id); if (!i) return;
  S.edit = { id: i.id, pl: new Set(i.placements.filter(p => SLOTS.some(s => s.id === p))), active: i.active, pin: !!i.pin };
  const m = document.createElement('div'); m.className = 'modal open'; m.id = 'editor'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  const ro = !!i.locked;
  m.innerHTML = `<div class="modal__box ed">
    <button class="iconbtn modal__x" data-x aria-label="إغلاق">${I.x}</button>
    <h3>${ro ? 'ملف ثابت' : 'تعديل العنصر'}</h3>
    <div class="ed__prev">${i.type === 'video' ? `<video src="${esc(fullOf(i))}" poster="${esc(thumbOf(i, 600))}" controls playsinline preload="none"></video>` : `<img src="${esc(thumbOf(i, 700))}" alt="">`}</div>
    ${ro ? '<p class="muted center-t">ده من باقاتك الأساسية — ثابت ومش بيتغير ولا بيتخفي من هنا.</p>' : `
    <div class="field"><label>العنوان</label><input class="input" id="edTitle" maxlength="80" value="${esc(i.title || '')}" placeholder="اختياري"></div>
    <div class="field" id="edBadgeF" ${S.edit.pl.has('home-offers') ? '' : 'hidden'}><label>شارة العرض</label><input class="input" id="edBadge" maxlength="30" value="${esc(i.badge || '')}" placeholder="مثال: خصم حصري"></div>
    <div class="field"><label>يظهر في</label><div id="edChips">${slotChips(S.edit.pl, i.type, 'data-ed')}</div></div>
    <div class="row2"><div class="field"><label>الترتيب (رقم أصغر = أول)</label><input class="input" id="edOrder" type="number" step="1" value="${i.order ?? ''}" placeholder="تلقائي"></div>
      <div class="field"><label>خيارات</label><label class="check"><input type="checkbox" id="edPin" ${i.pin ? 'checked' : ''}> تثبيت في أول القسم</label><label class="check"><input type="checkbox" id="edAct" ${i.active ? 'checked' : ''}> ظاهر في الموقع</label></div></div>
    <div class="bar"><button class="btn btn--primary" id="edSave" type="button">حفظ</button>${i.source === 'cloud' ? `<button class="btn danger-b" id="edDel" type="button">${I.trash} حذف</button>` : ''}</div>`}
  </div>`;
  document.body.append(m); document.documentElement.classList.add('lock');
  const close = () => { m.remove(); S.edit = null; document.documentElement.classList.remove('lock'); };
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-x]')) close(); });
  if (ro) return;
  $('#edChips', m).onclick = e => {
    const b = e.target.closest('[data-ed]'); if (!b) return;
    const s = b.dataset.slot; S.edit.pl.has(s) ? S.edit.pl.delete(s) : S.edit.pl.add(s);
    b.classList.toggle('on'); $('#edBadgeF', m).hidden = !S.edit.pl.has('home-offers');
  };
  $('#edSave', m).onclick = async () => {
    const ord = $('#edOrder', m).value.trim();
    const vals = { title: $('#edTitle', m).value.trim() || null, placements: plObj(S.edit.pl), pin: $('#edPin', m).checked, active: $('#edAct', m).checked, order: ord === '' ? null : Number(ord) };
    if (S.edit.pl.has('home-offers')) vals.badge = $('#edBadge', m).value.trim() || null; else vals.badge = null;
    try { await patch(i, vals); toast('تم الحفظ ✓'); close(); } catch { /* toast already */ }
  };
  $('#edDel', m)?.addEventListener('click', async () => { await deleteItem(i); close(); });
}

/* ======================= الأماكن والترتيب ======================= */
function slotsTab(el) {
  const A = all();
  el.innerHTML = `<p class="muted" style="margin:0 4px 16px">هنا بتشوف كل مكان في الموقع فيه إيه وبأي ترتيب. استخدم الأسهم لتغيير الترتيب — العناصر المثبّتة 📌 بتفضل في الأول. (الترتيب بيتطبق على العنصر في كل الأماكن اللي بيظهر فيها.)</p>` +
    SLOTS.map(s => {
      const on = itemsFor(s.id, A), off = A.filter(i => !i.active && i.placements.includes(s.id));
      return `<section class="card slot"><header class="slot__h"><div><small>${esc(s.page)}</small><h3>${esc(s.label)}</h3></div><span class="pill">${on.length} ظاهر${off.length ? ` · ${off.length} مخفي` : ''}</span></header>
        ${on.length ? `<div class="slot__l">${on.map((i, k) => `<div class="srow"><img src="${esc(thumbOf(i, 160))}" alt="" loading="lazy" decoding="async"><div class="srow__t"><b>${esc(i.title || i.name || i.id)}</b><small>${i.type === 'video' ? 'فيديو' : 'صورة'}${i.pin ? ' · 📌 مثبّت' : ''}${i.locked ? ' · ثابت' : ''}</small></div>
          <div class="srow__a">${i.locked ? `<span class="muted">${I.lock}</span>` : `<button class="ib" data-act="mv" data-s="${s.id}" data-i="${k}" data-d="-1" ${k === 0 ? 'disabled' : ''} aria-label="أعلى">${I.up2}</button><button class="ib" data-act="mv" data-s="${s.id}" data-i="${k}" data-d="1" ${k === on.length - 1 ? 'disabled' : ''} aria-label="أسفل">${I.dn2}</button><button class="ib" data-act="edit" data-id="${esc(i.id)}" aria-label="تعديل">${I.edit}</button>`}</div></div>`).join('')}</div>` : '<p class="empty" style="padding:14px">مفيش عناصر في المكان ده لسه.</p>'}
        ${off.length ? `<details class="slot__off"><summary>المخفي (${off.length})</summary>${off.map(i => `<div class="srow is-off"><img src="${esc(thumbOf(i, 160))}" alt="" loading="lazy"><div class="srow__t"><b>${esc(i.title || i.name || i.id)}</b></div><button class="ib" data-act="toggle" data-id="${esc(i.id)}">${I.eyeoff}</button></div>`).join('')}</details>` : ''}
      </section>`;
    }).join('');
}
async function move(slotId, idx, d) {
  const A = all(), L = itemsFor(slotId, A), j = idx + d;
  if (j < 0 || j >= L.length) return;
  [L[idx], L[j]] = [L[j], L[idx]];
  const up = {}; let n = 10;
  L.forEach(i => { if (i.locked) return; up[`${pathOf(i)}/order`] = n; n += 10; });
  try { await update(ref(db), up); } catch (e) { toast(errAr(e)); }
}

/* ======================= الرسائل والآراء ======================= */
async function messagesTab(el) {
  el.innerHTML = '<div class="splash"><div class="spin"></div></div>';
  try {
    const [fb, sp] = await Promise.all([get(query(ref(db, 'feedbacks'), limitToLast(100))), get(query(ref(db, 'supportMessages'), limitToLast(100)))]);
    const f = Object.entries(fb.val() || {}).reverse(), s = Object.entries(sp.val() || {}).reverse();
    const when = v => v.ts ? new Date(v.ts).toLocaleString('ar-EG') : (v.time || v.date || '');
    el.innerHTML = `
    <section class="card"><h2>رسائل خدمة العملاء <span class="pill">${s.length}</span></h2>
      ${s.length ? s.map(([id, v]) => `<div class="msg"><div class="msg__h"><b>${esc(v.name)}</b><a class="chipbtn" href="https://wa.me/${esc(String(v.phone || '').replace(/[^\d]/g, ''))}" target="_blank" rel="noopener" dir="ltr">${esc(v.phone)}</a><small>${esc(when(v))}</small><button class="ib danger" data-act="rm" data-p="supportMessages/${esc(id)}" aria-label="حذف">${I.trash}</button></div><p>${esc(v.msg)}</p></div>`).join('') : '<p class="empty">مفيش رسائل.</p>'}</section>
    <section class="card"><h2>آراء الزوار <span class="pill">${f.length}</span></h2>
      ${f.length ? f.map(([id, v]) => `<div class="msg"><div class="msg__h"><b>${esc(v.name)}</b><small>${esc(when(v))}</small><button class="ib danger" data-act="rm" data-p="feedbacks/${esc(id)}" aria-label="حذف">${I.trash}</button></div><p>${esc(v.msg)}</p></div>`).join('') : '<p class="empty">مفيش آراء.</p>'}</section>`;
  } catch (e) { el.innerHTML = `<div class="card"><p class="err">${esc(errAr(e))}</p></div>`; }
}

/* ======================= الإعدادات ======================= */
async function settingsTab(el) {
  const a = S.api || {};
  const row = (ok, t, hint) => `<div class="stat"><span class="dot ${ok === true ? 'ok' : ok === false ? 'bad' : ''}"></span><div><b>${t}</b>${hint ? `<small>${hint}</small>` : ''}</div></div>`;
  el.innerHTML = `
  <section class="card"><h2>حالة الإعدادات</h2>
    ${row(S.connected, 'الاتصال بـ Firebase', S.connected ? 'متصل' : 'غير متصل')}
    ${row(a.error ? null : !!a.adminUid, 'ADMIN_UID في Vercel', a.error ? 'مش قادر أوصل للـ API (لو بتجرب محليًا ده طبيعي)' : a.adminUid ? 'متظبط' : 'ناقص — ضيفه من Vercel ← Settings ← Environment Variables')}
    ${row(a.error ? null : !!a.imagekit, 'مفاتيح ImageKit', a.imagekit ? 'متظبطة' : 'ناقصة: IMAGEKIT_PRIVATE_KEY و IMAGEKIT_PUBLIC_KEY')}
    ${row(a.error ? null : !!a.telegram, 'إشعارات تيليجرام', a.telegram ? 'متظبطة' : 'ناقصة: TELEGRAM_BOT_TOKEN و TELEGRAM_CHAT_ID')}
  </section>
  <section class="card"><h2>الـ UID بتاعك</h2><p class="muted">الرقم ده بيحدد مين الأدمن في قواعد Firebase وفي Vercel (ADMIN_UID).</p><code class="uid" dir="ltr">${esc(S.user.uid)}</code><button class="btn btn--sm" id="cp" type="button">نسخ</button></section>
  <section class="card"><h2>عدّاد الزوار</h2><p class="muted" id="visInfo">جاري القراءة...</p><button class="btn btn--sm" id="sync" type="button">مزامنة العدّاد مع عدد الزوار المسجلين</button></section>`;
  $('#cp', el).onclick = () => navigator.clipboard?.writeText(S.user.uid).then(() => toast('تم النسخ'));
  try { const v = (await get(ref(db, 'stats/visitors'))).val(); $('#visInfo').textContent = `العدّاد الحالي: ${v ?? 0}`; } catch { $('#visInfo').textContent = 'تعذر القراءة'; }
  $('#sync', el).onclick = async () => {
    try {
      const u = (await get(ref(db, 'users'))).val() || {}, n = Object.keys(u).length;
      if (!confirm(`هيتضبط العدّاد على ${n} (عدد الزوار المسجلين في Firebase). متأكد؟`)) return;
      await set(ref(db, 'stats/visitors'), n); $('#visInfo').textContent = `العدّاد الحالي: ${n}`; toast('تمت المزامنة ✓');
    } catch (e) { toast(errAr(e)); }
  };
}

/* ---------- global click delegation ---------- */
root.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act;
  if (act === 'edit') return openEditor(b.dataset.id);
  if (act === 'toggle') { const i = byId(b.dataset.id); if (i) toggleActive(i); return; }
  if (act === 'del') { const i = byId(b.dataset.id); if (i) deleteItem(i); return; }
  if (act === 'mv') return move(b.dataset.s, Number(b.dataset.i), Number(b.dataset.d));
  if (act === 'rm') { if (!confirm('حذف نهائي؟')) return; try { await remove(ref(db, b.dataset.p)); b.closest('.msg')?.remove(); toast('تم الحذف'); } catch (x) { toast(errAr(x)); } }
});
