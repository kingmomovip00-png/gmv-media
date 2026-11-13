import { $, $$, reveal, arrows, CATS, getCat, hasCat, setCat, askCat, socialsHTML, counter, toast, store, BASE } from './site.js';
import { loadRemote, buildAll, mountSlot, gallery, scroller, DB_URL } from './media.js';
import { initFeedback } from './feedback.js';

/* ---- Hero ---- */
$('#heroSocials').innerHTML = socialsHTML();
const setCta = () => { $('#ctaPkg').href = BASE + getCat().path; };
setCta(); window.addEventListener('gmv:cat', setCta);

const words = ['تصميم جرافيك', 'فيديو', 'إدارة إعلانات', 'كتابة نصوص إعلانية', 'تحليل النتائج', 'استهداف متقدم', 'تقارير أسبوعية'];
const row = words.map(w => `<span>${w}</span>`).join('');
$('#marq').innerHTML = row + row;

/* ---- الميديا (محلي + Firebase/ImageKit) ---- */
const el = { offers: $('#offers'), works: $('#worksScroller'), reel: $('#reel'), reviews: $('#reviewsScroller') };
[el.works, el.reel, el.reviews].forEach(scroller);
arrows(el.works, $('#wPrev'), $('#wNext')); arrows(el.reviews, $('#rPrev'), $('#rNext'));
[el.offers, el.works, el.reel, el.reviews].forEach(c => gallery(c));

function render(all) {
  const n = mountSlot('home-offers', all, el.offers, { section: $('#offersSec'), w: 900, tag: true, eagerN: 2 });
  el.offers.classList.toggle('offers--one', n === 1);
  mountSlot('home-works', all, el.works, { section: $('#worksSec'), w: 560 });
  mountSlot('home-showreel', all, el.reel, { section: $('#reelSec'), w: 480 });
  const rn = mountSlot('home-reviews', all, el.reviews, { w: 640, eagerN: 0 });   // قسم الآراء فيه فورم فمبيتخفاش كله
  el.reviews.hidden = rn === 0; $('#rPrev').parentElement.hidden = rn === 0;
}
const remote = await loadRemote();
render(buildAll(remote));
remote.late?.then(r => render(buildAll(r)));

/* ---- آراء الزوار ---- */
initFeedback({ openBtn: '#openFeedback', listEl: $('#feedbackList'), limit: 9 });

/* ---- اختيار نوع النشاط (أول زيارة) ---- */
if (!hasCat()) setTimeout(() => { if (!hasCat()) askCat(); }, 900);

/* ---- عدّاد الزوار + تسجيل الزائر الجديد ---- */
fetch(`${DB_URL}/stats/visitors.json`).then(r => r.json()).then(n => {
  if (typeof n === 'number' && n > 0) { $('#visitChip').hidden = false; counter($('#visitCount'), n); }
}).catch(() => { });
if (!store.get('gmv_uid') || store.get('gmv_reg') !== '1') import('./track.js').then(m => m.startTracking()).catch(() => { });
reveal();
