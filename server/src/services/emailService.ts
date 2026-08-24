import nodemailer from 'nodemailer';
import dns from 'dns';

const EMAIL_USER = process.env.EMAIL_USER || 'sarbjeetkumar76350@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'mgfwxeedaltmwpai';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // false for port 587 STARTTLS
  requireTLS: SMTP_PORT === 587,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
} as any);

export class EmailService {
  /**
   * Send Real 6-Digit Verification OTP Email to user's inbox
   */
  static async sendOtpEmail(toEmail: string, otpCode: string, userName: string = 'FrameTrail User'): Promise<boolean> {
    try {
      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">FrameTrail Security</h1>
            <p style="margin: 6px 0 0 0; font-size: 14px; color: #c7d2fe; font-weight: 600;">Verification Code Request</p>
          </div>

          <div style="padding: 32px 24px; text-align: center;">
            <p style="font-size: 15px; color: #94a3b8; margin: 0 0 20px 0; font-weight: 500;">
              Hello <strong style="color: #ffffff;">${userName}</strong>,
            </p>
            <p style="font-size: 14px; color: #cbd5e1; margin: 0 0 28px 0; line-height: 1.6;">
              Your requested 6-digit Security Verification OTP code is below. Please enter this code in your FrameTrail app to proceed.
            </p>

            <div style="background-color: #1e293b; border: 2px dashed #6366f1; border-radius: 16px; padding: 20px; display: inline-block; margin-bottom: 28px;">
              <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #38bdf8;">${otpCode}</span>
            </div>

            <p style="font-size: 12px; color: #64748b; margin: 0;">
              ⏱️ This OTP code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.
            </p>
          </div>

          <div style="background-color: #0b0f19; padding: 20px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="margin: 0; font-size: 12px; color: #475569; font-weight: 600;">
              © ${new Date().getFullYear()} FrameTrail Media Studios. All rights reserved.
            </p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"FrameTrail" <${EMAIL_USER}>`,
        to: toEmail,
        subject: `${otpCode} is your FrameTrail Verification Code`,
        html: htmlContent,
      };

      console.log(`[Email Service] Attempting to send OTP email to ${toEmail} via ${SMTP_HOST}:${SMTP_PORT}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Real OTP successfully sent to ${toEmail}! MessageId: ${info.messageId}`);
      return true;
    } catch (error: any) {
      console.error('[Email Service Error]', error);
      return false;
    }
  }
}
