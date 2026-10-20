export default function handler(req, res) {
  try {
    const payload = JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(payload);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(err ? (err.stack || err.message) : 'Unknown error');
  }
}
