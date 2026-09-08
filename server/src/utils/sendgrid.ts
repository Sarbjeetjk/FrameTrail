import sgMail from '@sendgrid/mail';
import { env } from '../config/env';

export interface SendOtpEmailParams {
  to: string;
  name?: string;
  otp: string;
  purpose: 'register' | 'forgot_password' | 'profile_update' | 'account_unlock';
}

export const sendOtpEmail = async ({ to, name, otp, purpose }: SendOtpEmailParams): Promise<boolean> => {
  const apiKey = process.env.SENDGRID_API_KEY || env.SENDGRID.API_KEY;
  if (!apiKey) {
    console.error('[SendGrid Error] SENDGRID_API_KEY is not configured in server/.env');
    throw new Error('Email delivery service is currently not configured. Please contact support.');
  }

  sgMail.setApiKey(apiKey);

  const recipientName = name?.trim() || 'FrameTrail Member';
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || env.SENDGRID.FROM_EMAIL || 'sarbjeetkumar76350@gmail.com';

  let subject = '🔐 Verify Your Email - FrameTrail Security';
  let title = 'Verify Your Email Address';
  let description = 'Welcome to FrameTrail! Use the single-use verification code below to verify your email and activate your account:';

  if (purpose === 'forgot_password') {
    subject = '🔑 Reset Your Password - FrameTrail Security';
    title = 'Password Reset Request';
    description = 'We received a request to reset your FrameTrail account password. Use the single-use verification code below:';
  } else if (purpose === 'profile_update') {
    subject = '🛡️ Verify New Email Address - FrameTrail';
    title = 'Confirm New Email Address';
    description = 'You requested to update your email address for FrameTrail. Use the verification code below:';
  } else if (purpose === 'account_unlock') {
    subject = '🔓 Unlock Admin Account - FrameTrail Security';
    title = 'Admin Account Locked (Security Protocol)';
    description = 'Your Administrator Account was locked after 5 failed login attempts. Use the 6-digit OTP code below to verify ownership and unlock your Admin Dashboard:';
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #131b2e; border: 1px solid #1e293b; border-radius: 24px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); overflow: hidden;">
          
          <!-- Top Header Gradient -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(147, 51, 234, 0.1));">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="background: linear-gradient(135deg, #4f46e5, #7c3aed); width: 48px; height: 48px; border-radius: 14px; text-align: center; vertical-align: middle; font-size: 24px;">
                    🎞️
                  </td>
                  <td style="padding-left: 14px; text-align: left;">
                    <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">FrameTrail</div>
                    <div style="font-size: 11px; font-weight: 600; color: #818cf8; text-transform: uppercase; letter-spacing: 1px;">Cloud Media Vault</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 24px 36px 36px 36px; text-align: center;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #f8fafc;">${title}</h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Hello <strong>${recipientName}</strong>,<br/>
                ${description}
              </p>

              <!-- OTP Display Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 28px auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(124, 58, 237, 0.18)); border: 2px dashed #6366f1; border-radius: 16px; padding: 18px 36px; text-align: center;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Your 6-Digit Code</span>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #ffffff; text-shadow: 0 2px 10px rgba(99, 102, 241, 0.5);">${otp}</span>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 12px 16px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #cbd5e1;">
                  ⏱️ <strong>Validity:</strong> This code is valid for <strong>10 minutes</strong>. Do NOT share this code with anyone, including FrameTrail staff.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                If you did not request this code, you can safely ignore this email. No changes will be made to your account.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0e1424; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} FrameTrail Media Inc. &bull; Automated Security Service
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textContent = `
FrameTrail Security
--------------------
${title}

Hello ${recipientName},

${description}

Your 6-digit OTP code is: ${otp}

This code is valid for 10 minutes. Please do not share it with anyone.

If you did not make this request, please ignore this email.
--------------------
FrameTrail Media
  `.trim();

  try {
    const response = await sgMail.send({
      to,
      from: {
        email: fromEmail,
        name: 'FrameTrail Security',
      },
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[SendGrid Success] OTP email dispatched to ${to} (Status: ${response[0]?.statusCode})`);
    return true;
  } catch (error: any) {
    console.error('[SendGrid Dispatch Error]', error?.response?.body || error?.message || error);
    const sgErrors = error?.response?.body?.errors;
    if (sgErrors && sgErrors.length > 0) {
      throw new Error(`SendGrid delivery failed: ${sgErrors[0]?.message || 'Unknown SendGrid error'}`);
    }
    throw new Error(error?.message || 'Failed to dispatch email via SendGrid');
  }
};

export interface SendContactInquiryParams {
  name: string;
  email: string;
  category?: string;
  subject: string;
  message: string;
}

export const sendContactInquiryNotification = async ({
  name,
  email,
  category,
  subject,
  message,
}: SendContactInquiryParams): Promise<boolean> => {
  const apiKey = process.env.SENDGRID_API_KEY || env.SENDGRID.API_KEY;
  const adminEmail = process.env.SENDGRID_FROM_EMAIL || env.SENDGRID.FROM_EMAIL ;

  if (!apiKey) {
    console.warn('[SendGrid Notice] SENDGRID_API_KEY is not configured; skipping email notification.');
    return false;
  }

  const clientUrl = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://frametrail-1.onrender.com' : 'http://localhost:5173');
  const adminInboxUrl = `${clientUrl}/admin`;

  sgMail.setApiKey(apiKey);

  const mailSubject = `📩 [New Inquiry] ${subject || 'Contact Form Submission'} - FrameTrail`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Support Inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #131b2e; border: 1px solid #1e293b; border-radius: 24px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); overflow: hidden;">
          
          <!-- Top Header -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(79, 70, 229, 0.15)); border-b: 1px solid #1e293b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 800; color: #f43f5e; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">📩 New Inquiry Received</span>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">FrameTrail Support Portal</h1>
                  </td>
                  <td align="right">
                    <span style="background-color: #e11d48; color: #ffffff; padding: 6px 12px; border-radius: 9999px; font-size: 10px; font-weight: 900; text-transform: uppercase; tracking: 1px;">Admin Alert</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              
              <!-- Sender Details Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0e1424; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Sender Name</span><br/>
                    <strong style="font-size: 15px; color: #f8fafc;">${name}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Email Address</span><br/>
                    <a href="mailto:${email}" style="font-size: 14px; color: #818cf8; font-weight: 600; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Category</span><br/>
                    <span style="font-size: 13px; color: #38bdf8; font-weight: 700;">${category || 'General Inquiry'}</span>
                  </td>
                </tr>
              </table>

              <!-- Subject & Message Box -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 800; color: #cbd5e1; margin-bottom: 8px;">
                  Subject: <span style="color: #ffffff;">${subject}</span>
                </div>
                <div style="background-color: #0b0f19; border: 1px solid #334155; border-radius: 14px; padding: 18px; color: #e2e8f0; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
              </div>

              <!-- Action Link -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; padding: 14px 28px;">
                    <a href="${adminInboxUrl}" target="_blank" style="font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; display: inline-block;">Open Admin Inquiries Inbox &rarr;</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0e1424; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} FrameTrail Media System &bull; Live Support Dispatcher
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await sgMail.send({
      to: adminEmail,
      from: {
        email: adminEmail,
        name: 'FrameTrail Contact Support',
      },
      subject: mailSubject,
      html: htmlContent,
    });

    console.log(`[Contact Mail Success] Admin notification email sent to ${adminEmail}`);
    return true;
  } catch (error: any) {
    console.error('[Contact Mail Error]', error?.response?.body || error?.message || error);
    return false;
  }
};

