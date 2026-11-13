import { $, toast, store, postJSON, socialsHTML } from './site.js';
import { DB_URL } from './media.js';

$('#socials').innerHTML = socialsHTML();
$('#contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  if ($('#hp').value) return;
  const name = $('#name').value.trim(), phone = $('#phone').value.trim(), msg = $('#message').value.trim();
  if (!name || !phone || !msg) return toast('من فضلك أكمل البيانات');
  if (!/^\+?[0-9\s\-()]{8,20}$/.test(phone)) return toast('رقم الواتساب غير صحيح');
  if (Date.now() - Number(store.get('gmv_msg_last') || 0) < 20000) return toast('استنى شوية قبل ما تبعت رسالة تانية');
  const btn = $('#sendBtn'); btn.disabled = true; btn.textContent = 'جاري الإرسال...';
  const date = new Date().toLocaleString('ar-EG');
  const payload = { name: name.slice(0, 60), phone: phone.slice(0, 20), msg: msg.slice(0, 1000), date, ts: Date.now() };
  // بنحفظ في Firebase وبنبعت إشعار تيليجرام (من السيرفر) — لو واحدة نجحت يبقى وصلت
  const res = await Promise.allSettled([
    fetch(`${DB_URL}/supportMessages.json`, { method: 'POST', body: JSON.stringify(payload) }).then(r => { if (!r.ok) throw new Error(r.status); }),
    postJSON('/api/notify', { kind: 'support', name, phone, msg })
  ]);
  btn.disabled = false; btn.textContent = 'إرسال';
  if (res.some(r => r.status === 'fulfilled')) {
    store.set('gmv_msg_last', String(Date.now()));
    toast('تم إرسال رسالتك بنجاح 💚'); e.target.reset();
  } else toast('حصلت مشكلة في الإرسال، كلمنا على واتساب مباشرة');
});
