import sgMail from '@sendgrid/mail';
import { env } from '../config/env';

export interface SendOtpEmailParams {
  to: string;
  name?: string;
  otp: string;
  purpose: 'register' | 'forgot_password' | 'profile_update';
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
