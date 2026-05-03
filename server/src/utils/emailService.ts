// Ported from the MFA project (emailService.js → TypeScript)
import nodemailer from 'nodemailer';

const getTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    // Dev fallback — print to console if email is not configured
    console.log(`\n📧 [DEV] Email OTP for ${to}: ${otp}\n`);
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Portfolio CMS" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your Portfolio CMS login code',
    html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc">
        <h1 style="color:#06b6d4;margin:0 0 4px;font-size:24px;font-weight:800;letter-spacing:-0.5px">KV.dev CMS</h1>
        <p style="color:#64748b;font-size:13px;margin:0 0 24px">Admin Authentication</p>
        <div style="background:#fff;border-radius:8px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
          <p style="color:#334155;margin:0 0 16px;line-height:1.6">
            Use the code below to complete your login. It expires in <strong>5 minutes</strong>.
          </p>
          <div style="text-align:center;margin:28px 0">
            <div style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#06b6d4);color:#fff;font-size:30px;font-weight:700;letter-spacing:10px;padding:14px 28px;border-radius:8px;font-family:monospace">
              ${otp}
            </div>
          </div>
          <p style="color:#64748b;font-size:12px;margin:0">
            If you didn't request this code, someone may be trying to access your admin panel.
          </p>
        </div>
        <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:20px">
          &copy; ${new Date().getFullYear()} K Veeresh Portfolio CMS
        </p>
      </div>`,
    text: `Your Portfolio CMS login code is: ${otp}. It expires in 5 minutes.`,
  });
  console.log(`[EmailService] OTP sent to ${to}`);
};
