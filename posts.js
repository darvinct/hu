const BIN_ID  = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;
const PASSWORD = process.env.ADMIN_PASSWORD;
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — ambil semua posts (publik, tidak perlu password)
  if (req.method === 'GET') {
    try {
      const r    = await fetch(BIN_URL + '/latest', { headers: { 'X-Master-Key': API_KEY } });
      const data = await r.json();
      return res.status(200).json(data.record?.posts || []);
    } catch (e) {
      return res.status(500).json({ error: 'Gagal load posts' });
    }
  }

  // Semua method selain GET butuh password
  const pw = req.headers['x-admin-password'];
  if (pw !== PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // PUT — simpan semua posts (replace)
  if (req.method === 'PUT') {
    try {
      const { posts } = req.body;
      await fetch(BIN_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
        body: JSON.stringify({ posts })
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Gagal simpan posts' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
