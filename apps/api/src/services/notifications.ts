import { env } from '../config/env.js';
import { prisma, isDatabaseConnected } from './prisma.js';

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character));
}

async function sendEmail(to: string, subject: string, message: string, linkUrl?: string | null) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) return;
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeLink = linkUrl && linkUrl.startsWith('/') ? `${env.FRONTEND_URL}${linkUrl}` : '';
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#17243a"><h2>DeutschWelt update</h2><p>${safeMessage}</p>${safeLink ? `<p><a href="${safeLink}">Open DeutschWelt</a></p>` : ''}<p style="color:#687487;font-size:12px">You received this class reminder because you enabled email notifications in your account.</p></div>`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, to: [to], subject, html }),
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}

async function sendWhatsApp(to: string, title: string, message: string) {
  if (!env.WHATSAPP_CLOUD_API_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_TEMPLATE_NAME) return;
  const endpoint = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.WHATSAPP_CLOUD_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/[^\d]/g, ''),
      type: 'template',
      template: {
        name: env.WHATSAPP_TEMPLATE_NAME,
        language: { code: env.WHATSAPP_TEMPLATE_LANGUAGE },
        components: [{ type: 'body', parameters: [{ type: 'text', text: title.slice(0, 120) }, { type: 'text', text: message.slice(0, 800) }] }]
      }
    }),
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`WhatsApp provider returned ${response.status}`);
}

export async function notifyBatchStudents(batchId: string, title: string, message: string, linkUrl: string) {
  if (!isDatabaseConnected) return;
  const members = await prisma.batchMembership.findMany({
    where: { batchId, status: 'ACTIVE' },
    include: { user: { include: { notificationPreference: true } } }
  });

  await Promise.all(members.map(async (membership: any) => {
    const user = membership.user;
    await prisma.notification.create({ data: { userId: user.id, title, message, type: 'CLASS', linkUrl } });
    const preference = user.notificationPreference;
    const sends: Promise<unknown>[] = [];
    if (preference?.emailReminders && user.isEmailVerified) sends.push(sendEmail(user.email, title, message, linkUrl));
    if (preference?.whatsappReminders && preference.reminderPhone) sends.push(sendWhatsApp(preference.reminderPhone, title, message));
    await Promise.allSettled(sends);
  }));
}
