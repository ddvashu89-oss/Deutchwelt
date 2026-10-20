export default function handler(req, res) {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: process.env.NODE_ENV || "unknown"
  });
}
