/* آراء الزوار: عرض + إضافة (Firebase REST — بدون SDK) */
import { $, esc, toast, makeModal, openModal, closeModal, store, icon } from './site.js';
import { DB_URL } from './media.js';

const fmt = f => { try { return f.ts ? new Date(f.ts).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : (f.time || ''); } catch { return f.time || ''; } };
const cardHTML = f => `<article class="fb"><div class="fb__top"><span class="fb__av">${esc((f.name || 'ز').trim().charAt(0) || 'ز')}</span><div><div class="fb__n">${esc(f.name || 'زائر')}</div><div class="fb__t">${esc(fmt(f))}</div></div></div><p class="fb__m">${esc(f.msg || '')}</p></article>`;

export async function loadFeedbacks(listEl, limit = 12) {
  try {
    const r = await fetch(`${DB_URL}/feedbacks.json?orderBy=%22%24key%22&limitToLast=${limit}`);
    if (!r.ok) throw new Error(r.status);
    const o = await r.json();
    const arr = Object.entries(o || {}).map(([id, v]) => ({ id, ...v })).filter(v => v.name && v.msg).reverse();
    listEl.innerHTML = arr.length ? arr.map(cardHTML).join('') : '<p class="empty">كن أول من يشاركنا رأيه ✨</p>';
  } catch { listEl.innerHTML = ''; }
}

export function initFeedback({ openBtn, listEl, limit = 12 }) {
  const m = makeModal('fbModal', `
    <button class="iconbtn modal__x" type="button" data-close aria-label="إغلاق">${icon('close')}</button>
    <h3>شارك رأيك فينا</h3><p>رأيك بيفرق معانا وبيساعد غيرك يختار.</p>
    <form id="fbForm" novalidate>
      <div class="field"><label for="fbName">اسمك</label><input class="input" id="fbName" maxlength="60" autocomplete="name" placeholder="اكتب اسمك" required></div>
      <div class="field"><label for="fbMsg">رأيك</label><textarea class="input" id="fbMsg" maxlength="600" placeholder="اكتب رأيك..." required></textarea></div>
      <input class="hp" id="fbHp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn--primary btn--block" id="fbSend" type="submit">إرسال</button>
    </form>`);
  $(openBtn).addEventListener('click', () => openModal(m));
  loadFeedbacks(listEl, limit);
  $('#fbForm').addEventListener('submit', async e => {
    e.preventDefault();
    if ($('#fbHp').value) return;
    const name = $('#fbName').value.trim(), msg = $('#fbMsg').value.trim();
    if (!name || !msg) return toast('من فضلك اكتب الاسم والرأي');
    if (Date.now() - Number(store.get('gmv_fb_last') || 0) < 30000) return toast('استنى شوية قبل ما تبعت رأي تاني');
    const btn = $('#fbSend'); btn.disabled = true; btn.textContent = 'جاري الإرسال...';
    const payload = { name: name.slice(0, 60), msg: msg.slice(0, 600), ts: Date.now(), time: new Date().toLocaleString('ar-EG') };
    try {
      const r = await fetch(`${DB_URL}/feedbacks.json`, { method: 'POST', body: JSON.stringify(payload) });
      if (!r.ok) throw new Error(r.status);
      store.set('gmv_fb_last', String(Date.now()));
      listEl.querySelector('.empty')?.remove();
      listEl.insertAdjacentHTML('afterbegin', cardHTML(payload));
      e.target.reset(); closeModal(m); toast('تم إرسال رأيك — شكرًا ليك 💚');
    } catch { toast('حصلت مشكلة في الإرسال، جرب تاني بعد شوية'); }
    finally { btn.disabled = false; btn.textContent = 'إرسال'; }
  });
}
