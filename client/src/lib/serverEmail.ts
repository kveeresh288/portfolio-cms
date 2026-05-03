import nodemailer from 'nodemailer';

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`\n📧 [DEV] Email OTP for ${to}: ${otp}\n`);
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  await transporter.sendMail({
    from: `"Portfolio CMS" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your Portfolio CMS login code',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="color:#06b6d4;margin:0 0 16px">KV.dev CMS Login</h2>
      <p style="color:#334155">Your one-time login code:</p>
      <div style="text-align:center;margin:24px 0">
        <span style="background:linear-gradient(135deg,#0ea5e9,#06b6d4);color:#fff;font-size:28px;font-weight:700;letter-spacing:10px;padding:14px 24px;border-radius:8px;font-family:monospace">${otp}</span>
      </div>
      <p style="color:#64748b;font-size:13px">Expires in 5 minutes. If you didn't request this, ignore this email.</p>
    </div>`,
    text: `Your Portfolio CMS login code: ${otp}. Expires in 5 minutes.`,
  });
}

export async function sendContactEmail(from: { name: string; email: string }, message: string): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
    replyTo: from.email,
    subject: `Portfolio Contact from ${from.name}`,
    html: `<p><b>From:</b> ${from.name} (${from.email})</p><p><b>Message:</b></p><p style="white-space:pre-wrap">${message}</p>`,
  });
}
