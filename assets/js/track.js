/* تسجيل الزائر الجديد مرة واحدة فقط (يتحمّل Firebase SDK بس وقتها) */
import { store, getCat, hasCat, postJSON } from './site.js';
import { DB_URL } from './media.js';
import { firebaseConfig, FIREBASE_SDK } from './firebase-config.js';

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
const cookie = n => document.cookie.split('; ').find(r => r.startsWith(n + '='))?.split('=')[1];

export function startTracking() {
  if (store.get('gmv_reg') === '1') return;
  const old = cookie('gmv_uid');                         // زائر قديم اتسجل قبل كده
  if (old) { store.set('gmv_uid', old); store.set('gmv_reg', '1'); return; }
  let uid = store.get('gmv_uid');
  if (!uid) { uid = uuid(); store.set('gmv_uid', uid); }
  let done = false;
  const go = () => { if (!done) { done = true; register(uid); } };
  if (hasCat()) setTimeout(go, 1500);
  else { window.addEventListener('gmv:cat', () => setTimeout(go, 300), { once: true }); setTimeout(go, 15000); }
}

async function register(uid) {
  const type = hasCat() ? getCat().value : 'غير محدد';
  try {
    const [{ initializeApp }, { getDatabase, ref, set, increment }] = await Promise.all([
      import(`${FIREBASE_SDK}/firebase-app.js`), import(`${FIREBASE_SDK}/firebase-database.js`)]);
    const db = getDatabase(initializeApp(firebaseConfig, 'track'));
    await set(ref(db, `users/${uid}`), { type, ts: Date.now(), time: new Date().toLocaleString('ar-EG'), page: location.pathname });
    await set(ref(db, 'stats/visitors'), increment(1));
    store.set('gmv_reg', '1');
    const total = await fetch(`${DB_URL}/stats/visitors.json`).then(r => r.json()).catch(() => null);
    postJSON('/api/notify', { kind: 'visit', type, total }).catch(() => { });
  } catch (e) { console.warn('track skipped', e?.message || e); }
}
