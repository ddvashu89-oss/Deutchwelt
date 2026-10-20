import app from '../apps/api/dist/app.js';

export default function handler(req, res) {
  // Ensure the request path has /api prefix for Express routers
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
