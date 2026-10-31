export default function handler(req, res) {
  try {
    const payload = JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString()
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(payload);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Health check unavailable');
  }
}
