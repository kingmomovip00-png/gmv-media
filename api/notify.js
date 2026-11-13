// POST /api/notify  — بيبعت إشعارات تيليجرام من السيرفر (التوكن مش بيظهر في المتصفح أبدًا)
const { body, sameOrigin, limited, escHtml } = require('./_lib');

function countryName(code) {
  if (!code) return 'غير معروف';
  try { return new Intl.DisplayNames(['ar'], { type: 'region' }).of(code) || code; } catch { return code; }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'forbidden' });
  if (limited(req)) return res.status(429).json({ error: 'too_many_requests' });

  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return res.status(500).json({ error: 'telegram_not_configured' });

  const b = body(req);
  const cut = (v, n) => String(v ?? '').trim().slice(0, n);
  let text;
  if (b.kind === 'visit') {
    const total = Number.isFinite(b.total) ? `\n👥 إجمالي الزوار: ${b.total}` : '';
    text = `👤 <b>زائر جديد دخل الموقع</b>\n\n🌍 الدولة: ${escHtml(countryName(req.headers['x-vercel-ip-country']))}\n🏷️ الفئة: ${escHtml(cut(b.type, 40) || 'غير محدد')}\n🕒 ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}${total}`;
  } else if (b.kind === 'support') {
    const name = cut(b.name, 60), phone = cut(b.phone, 20), msg = cut(b.msg, 1000);
    if (!name || !msg || !/^\+?[0-9\s\-()]{8,20}$/.test(phone)) return res.status(400).json({ error: 'invalid' });
    text = `📩 <b>رسالة دعم جديدة</b>\n\n👤 الاسم: ${escHtml(name)}\n📱 الواتس: ${escHtml(phone)}\n📝 الرسالة:\n${escHtml(msg)}\n\n⏰ ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`;
  } else return res.status(400).json({ error: 'invalid_kind' });

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });
    if (!r.ok) return res.status(502).json({ error: 'telegram_failed' });
    return res.status(200).json({ ok: true });
  } catch { return res.status(502).json({ error: 'telegram_unreachable' }); }
};
