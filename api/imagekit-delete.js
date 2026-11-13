// POST /api/imagekit-delete {fileId} — حذف ملف من ImageKit (للأدمن فقط)
const { body, verifyAdmin } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const a = await verifyAdmin(req);
  if (!a.ok) return res.status(a.status).json({ error: a.error, uid: a.uid });
  const priv = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!priv) return res.status(500).json({ error: 'imagekit_not_configured' });
  const fileId = String(body(req).fileId || '');
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(fileId)) return res.status(400).json({ error: 'invalid_fileId' });
  try {
    const r = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE', headers: { Authorization: 'Basic ' + Buffer.from(priv + ':').toString('base64') }
    });
    if (r.ok || r.status === 404) return res.status(200).json({ ok: true });
    return res.status(502).json({ error: 'imagekit_failed', status: r.status });
  } catch { return res.status(502).json({ error: 'imagekit_unreachable' }); }
};
