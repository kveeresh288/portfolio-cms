/**
 * Email service — uses Resend (HTTPS API, works from Vercel/AWS Lambda).
 * Falls back to console log in dev when RESEND_API_KEY is not set.
 *
 * Free plan: https://resend.com — 100 emails/day, 3,000/month.
 * Get your API key at https://resend.com/api-keys
 */
import { Resend } from 'resend';

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Dev fallback — print to Vercel function logs (check Dashboard > Logs)
    console.log(`\n📧 [DEV OTP] ${to} → ${otp}\n`);
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: 'Portfolio CMS <onboarding@resend.dev>',  // free-plan sender
    to,
    subject: 'Your Portfolio CMS login code',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;
                  padding:32px;background:#0d1224;border-radius:12px">
        <h1 style="color:#06b6d4;margin:0 0 8px;font-size:22px;font-weight:800">
          KV.dev CMS
        </h1>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 24px">Admin Authentication</p>

        <p style="color:#cbd5e1;margin:0 0 20px">
          Your one-time login code:
        </p>

        <div style="background:linear-gradient(135deg,#0ea5e9,#06b6d4);
                    border-radius:10px;padding:20px;text-align:center;margin-bottom:24px">
          <span style="color:#fff;font-size:36px;font-weight:700;
                       letter-spacing:12px;font-family:monospace">${otp}</span>
        </div>

        <p style="color:#64748b;font-size:12px;margin:0">
          Expires in <strong>5 minutes</strong>. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
    text: `Your Portfolio CMS login code: ${otp}. Expires in 5 minutes.`,
  });

  if (error) {
    console.error('[Resend] Email failed:', error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  console.log(`[Resend] OTP sent to ${to}`);
}

export async function sendContactEmail(
  from: { name: string; email: string },
  message: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'kveeresh288@gmail.com';

  if (!apiKey) {
    console.log(`[DEV Contact] From: ${from.name} <${from.email}>\n${message}`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: 'Portfolio Contact <onboarding@resend.dev>',
    to: adminEmail,
    replyTo: from.email,
    subject: `Portfolio Contact: ${from.name}`,
    html: `<p><b>From:</b> ${from.name} (${from.email})</p>
           <p><b>Message:</b></p>
           <p style="white-space:pre-wrap">${message}</p>`,
    text: `From: ${from.name} (${from.email})\n\n${message}`,
  });
}
