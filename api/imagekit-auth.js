// GET /api/imagekit-auth — توقيع رفع ImageKit (للأدمن فقط). الـ private key بيفضل على السيرفر.
const crypto = require('crypto');
const { verifyAdmin } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const a = await verifyAdmin(req);
  if (!a.ok) return res.status(a.status).json({ error: a.error, uid: a.uid });
  const priv = process.env.IMAGEKIT_PRIVATE_KEY, pub = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!priv || !pub) return res.status(500).json({ error: 'imagekit_not_configured' });
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 40 * 60;           // لازم يكون أقل من ساعة
  const signature = crypto.createHmac('sha1', priv).update(token + expire).digest('hex');
  res.status(200).json({ token, expire, signature, publicKey: pub });
};
