import { $, reveal } from './site.js';
import { loadRemote, buildAll, mountSlot, gallery } from './media.js';
import { initFeedback } from './feedback.js';

const grid = $('#grid');
gallery(grid);
const remote = await loadRemote();
mountSlot('reviews', buildAll(remote), grid, { w: 720, eagerN: 3 });
remote.late?.then(r => mountSlot('reviews', buildAll(r), grid, { w: 720, eagerN: 3 }));
initFeedback({ openBtn: '#openFeedback', listEl: $('#feedbackList'), limit: 30 });
reveal();
