import { $, $$, reveal } from './site.js';
import { loadRemote, buildAll, mountSlot, gallery } from './media.js';

const grid = $('#grid');
gallery(grid);
function render(all) {
  mountSlot('works', all, grid, { w: 640, cap: true, eagerN: 6 });
  applyFilter(current);
}
let current = 'all';
function applyFilter(f) {
  current = f;
  $$('.mcard', grid).forEach(c => { c.hidden = f !== 'all' && c._item.type !== f; });
  $$('#filters button').forEach(b => { const on = b.dataset.f === f; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}
$('#filters').addEventListener('click', e => { const b = e.target.closest('button'); if (b) applyFilter(b.dataset.f); });

const remote = await loadRemote();
render(buildAll(remote));
remote.late?.then(r => render(buildAll(r)));
reveal();
