import { $, $$, wa, setCat, CATS, reveal } from './site.js';
import { loadRemote, buildAll, mountSlot, gallery } from './media.js';

const main = $('#main'), cid = main.dataset.cat, msg = main.dataset.msg;
const grid = $('#grid');
// الضغط على تاب فئة = اختيار الفئة (عشان "خدماتنا" في القايمة ترجعله)
$$('.seg a').forEach(a => a.addEventListener('click', () => { const c = CATS.find(x => x.id === a.dataset.cat); if (c) setCat(c); }));
gallery(grid, { cta: () => ({ label: 'استفسر عن هذه الباقة', href: wa(msg) }) });
const remote = await loadRemote();
const draw = r => mountSlot(`pkg-${cid}`, buildAll(r), grid, { w: 900, eagerN: 4 });
draw(remote);
remote.late?.then(draw);
reveal();
