import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RECIPIENT = 'shneior@shtetlatlas.org';

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(10).max(5000),
  cfTurnstileToken: z.string().min(1),
  // Honeypot — must stay empty. Real users never see it.
  website: z.string().max(0).optional().default(''),
});

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('[contact] TURNSTILE_SECRET_KEY is not set');
    return false;
  }
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);

  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body }
    );
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error('[contact] Turnstile verification error:', err);
    return false;
  }
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in env.'
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Honeypot tripped → silently accept (don't reveal the trap to bots).
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null;

  const turnstileOk = await verifyTurnstile(data.cfTurnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json({ error: 'captcha_failed' }, { status: 400 });
  }

  let transport;
  try {
    transport = getTransport();
  } catch (err) {
    console.error('[contact] SMTP not configured:', err);
    return NextResponse.json({ error: 'mail_not_configured' }, { status: 500 });
  }

  const from = process.env.SMTP_FROM || `Shtetl Atlas <${process.env.SMTP_USER}>`;
  const subjectLine = data.subject
    ? `[Contact] ${data.subject}`
    : `[Contact] Message from ${data.name}`;

  const textBody =
    `Name: ${data.name}\n` +
    `Email: ${data.email}\n` +
    (data.subject ? `Subject: ${data.subject}\n` : '') +
    `\n${data.message}\n`;

  const htmlBody =
    `<p><strong>Name:</strong> ${escapeHtml(data.name)}</p>` +
    `<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>` +
    (data.subject ? `<p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>` : '') +
    `<p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`;

  try {
    await transport.sendMail({
      from,
      to: RECIPIENT,
      replyTo: `${data.name} <${data.email}>`,
      subject: subjectLine,
      text: textBody,
      html: htmlBody,
    });
  } catch (err) {
    console.error('[contact] sendMail failed:', err);
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
