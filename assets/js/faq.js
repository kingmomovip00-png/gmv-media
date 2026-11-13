import { $$ } from './site.js';
$$('.qa').forEach(qa => {
  const b = qa.querySelector('button');
  b.addEventListener('click', () => { const open = qa.classList.toggle('open'); b.setAttribute('aria-expanded', open); });
});
