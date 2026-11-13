// أدوات مشتركة لدوال Vercel (الملف ده مش endpoint لأن اسمه بيبدأ بـ _)
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAq8CVFxYPWAa9HBvSSz6NrEcek_UVf2QM'; // مفتاح عام مش سري

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

/** يتأكد إن الطلب جاي من نفس الموقع (حماية بسيطة من الاستخدام الخارجي) */
function sameOrigin(req) {
  const o = req.headers.origin;
  if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch { return false; }
}

/** Rate limit بسيط في الذاكرة (best-effort لكل instance) */
const hits = new Map();
function limited(req, max = 6, windowMs = 60_000) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'x';
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < windowMs);
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}

/** يتحقق إن الـ Firebase ID token بتاع أدمن الموقع (ADMIN_UID) — من غير أي مكتبات */
async function verifyAdmin(req) {
  const h = req.headers.authorization || '';
  const idToken = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!idToken) return { ok: false, status: 401, error: 'no_token' };
  let r;
  try {
    r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken })
    });
  } catch { return { ok: false, status: 502, error: 'auth_unreachable' }; }
  if (!r.ok) return { ok: false, status: 401, error: 'bad_token' };
  const u = (await r.json()).users?.[0];
  if (!u) return { ok: false, status: 401, error: 'bad_token' };
  if (!process.env.ADMIN_UID) return { ok: false, status: 500, error: 'ADMIN_UID_not_set', uid: u.localId };
  if (u.localId !== process.env.ADMIN_UID) return { ok: false, status: 403, error: 'not_admin', uid: u.localId };
  return { ok: true, uid: u.localId };
}

const escHtml = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

module.exports = { body, sameOrigin, limited, verifyAdmin, escHtml };
