/* صفحة الباقات: العميل بيشوف باقات الفئة اللي اختارها بس */
import { $, wa, hasCat, getCat, askCat, reveal, BASE } from './site.js';
import { loadRemote, buildAll, mountSlot, gallery } from './media.js';

const main = $('#main'), cid = main.dataset.cat, msg = main.dataset.msg, grid = $('#grid');

async function show() {
  gallery(grid, { cta: () => ({ label: 'استفسر عن هذه الباقة', href: wa(msg) }) });
  const remote = await loadRemote();
  const draw = r => mountSlot(`pkg-${cid}`, buildAll(r), grid, { w: 900, eagerN: 4 });
  draw(remote); remote.late?.then(draw); reveal();
}

if (hasCat()) {
  // لو فتح فئة غير اللي اختارها → نوديه لفئته
  if (getCat().id !== cid) location.replace(BASE + getCat().path);
  else show();
} else {
  // لسه مختارش نوع نشاطه: نسأله، ومنعرضش أي أسعار قبل ما يختار
  grid.hidden = true; $('.note', main).hidden = true;
  const pick = document.createElement('div');
  pick.className = 'center';
  pick.innerHTML = '<button class="btn btn--primary" type="button">اختار نوع نشاطك عشان نعرضلك الباقات</button>';
  grid.before(pick);
  const go = cat => { if (cat.id === cid) { pick.remove(); grid.hidden = false; $('.note', main).hidden = false; show(); } else location.replace(BASE + cat.path); };
  pick.firstChild.addEventListener('click', () => askCat(go));
  askCat(go);
}
