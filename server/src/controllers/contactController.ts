import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

export const sendContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Invalid email address' });
      return;
    }

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });

      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
        replyTo: email,
        subject: `Portfolio Contact: Message from ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto">
            <h2 style="color:#06b6d4">New Portfolio Contact</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <hr/>
            <p><strong>Message:</strong></p>
            <p style="white-space:pre-wrap">${message}</p>
          </div>
        `,
      });
    }

    res.json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (err) {
    console.error('[sendContact]', err);
    res.status(500).json({ success: false, message: 'Failed to send message — please try again.' });
  }
};
