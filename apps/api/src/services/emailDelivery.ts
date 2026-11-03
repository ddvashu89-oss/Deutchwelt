import { env } from '../config/env.js';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character);
}

export async function sendTransactionalEmail(to: string, subject: string, heading: string, message: string, actionLabel: string, actionUrl: string) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) return false;

  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#17243a"><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(message)}</p><p><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:12px 18px;background:#14243a;color:#fff;text-decoration:none;border-radius:8px">${escapeHtml(actionLabel)}</a></p><p style="color:#687487;font-size:12px">If you did not request this, you can ignore this email.</p></div>`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, to: [to], subject, html }),
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Transactional email provider returned ${response.status}`);
  return true;
}
