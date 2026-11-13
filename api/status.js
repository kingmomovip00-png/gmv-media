// GET /api/status — حالة الإعدادات (أدمن فقط). بيرجع true/false من غير ما يكشف أي قيمة.
const { verifyAdmin } = require('./_lib');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const a = await verifyAdmin(req);
  if (!a.ok && a.error !== 'ADMIN_UID_not_set') return res.status(a.status).json({ error: a.error, uid: a.uid });
  res.status(200).json({
    uid: a.uid || null,
    adminUid: !!process.env.ADMIN_UID,
    imagekit: !!(process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_PUBLIC_KEY),
    telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
  });
};
