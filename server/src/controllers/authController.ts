import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { Otp } from '../models/Otp';
import { sendOtpEmail } from '../utils/sendgrid';
import { generateToken } from '../utils/jwt';
import { sendResponse, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { recordActivityLog } from '../utils/activityLogger';

export class AuthController {
  static async sendOtp(req: Request, res: Response) {
    try {
      const { email, purpose = 'register', name } = req.body;
      if (!email || typeof email !== 'string') {
        return sendError(res, 400, 'A valid email address is required');
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check existing user constraints based on purpose
      if (purpose === 'register') {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return sendError(res, 400, 'User with this email already exists');
        }
      } else if (purpose === 'forgot_password') {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (!existingUser) {
          return sendError(res, 404, 'No account found with this email address');
        }
      }

      // Generate cryptographically strong, non-guessable 6-digit numeric OTP (CS-PRNG)
      const otp = crypto.randomInt(100000, 1000000).toString();

      // Invalidate existing active OTPs for this email and purpose
      await Otp.deleteMany({ email: normalizedEmail, purpose });

      // Save new OTP with 0 initial failed attempts
      await Otp.create({
        email: normalizedEmail,
        otp,
        purpose,
        attempts: 0,
      });

      // Dispatch OTP via SendGrid
      await sendOtpEmail({
        to: normalizedEmail,
        name,
        otp,
        purpose,
      });

      return sendResponse(res, 200, true, `Verification code dispatched to ${normalizedEmail}`);
    } catch (error: any) {
      console.error('[Send OTP Error]', error);
      return sendError(res, 500, error.message || 'Failed to dispatch verification code');
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp, purpose } = req.body;
      if (!email || !otp) {
        return sendError(res, 400, 'Email and 6-digit OTP code are required');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const cleanOtp = otp.toString().trim();

      const query: any = { email: normalizedEmail };
      if (purpose) {
        query.purpose = purpose;
      }

      const record = await Otp.findOne(query);
      if (!record) {
        return sendError(res, 400, 'Verification code expired or not found. Please request a new OTP.');
      }

      // Check for incorrect OTP attempt
      if (record.otp !== cleanOtp) {
        record.attempts = (record.attempts || 0) + 1;
        if (record.attempts >= 5) {
          // Lock out and revoke OTP after 5 failed attempts
          await Otp.deleteMany(query);
          return sendError(
            res,
            429,
            '⛔ Security Alert: Too many incorrect attempts. This verification code has been revoked. Please request a new OTP.'
          );
        }
        await record.save();
        const remaining = 5 - record.attempts;
        return sendError(
          res,
          400,
          `Invalid verification code. (${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining before code lock)`
        );
      }

      return sendResponse(res, 200, true, 'Verification code confirmed successfully');
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to verify code');
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role, otp } = req.body;
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return sendError(res, 400, 'User with this email already exists');
      }

      if (!otp) {
        return sendError(res, 400, 'Email verification code (OTP) is required');
      }

      const otpRecord = await Otp.findOne({
        email: normalizedEmail,
        purpose: 'register',
      });

      if (!otpRecord) {
        return sendError(res, 400, 'Verification code expired or not found. Please request a new OTP.');
      }

      if (otpRecord.otp !== otp.toString().trim()) {
        otpRecord.attempts = (otpRecord.attempts || 0) + 1;
        if (otpRecord.attempts >= 5) {
          await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });
          return sendError(
            res,
            429,
            '⛔ Security Alert: Too many incorrect attempts. Verification code revoked. Please request a new OTP.'
          );
        }
        await otpRecord.save();
        const remaining = 5 - otpRecord.attempts;
        return sendError(
          res,
          400,
          `Invalid verification code. (${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining)`
        );
      }

      // Valid OTP -> consume OTP
      await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: role === 'admin' ? 'admin' : 'user',
      });

      const token = generateToken({
        id: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: 'ACCOUNT_CREATED',
        detail: `New ${user.role === 'admin' ? 'Administrator' : 'User'} account "${user.name}" (${user.email}) registered successfully.`,
        level: 'success',
        user: user.name,
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
      });

      return sendResponse(res, 201, true, 'User registered successfully', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          uploadLimits: user.uploadLimits,
          status: user.status,
        },
        token,
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error registering user');
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return sendError(res, 401, 'Invalid credentials');
      }

      // Check if account is locked due to 5 consecutive wrong password attempts
      if (user.isLocked) {
        return sendError(
          res,
          423,
          '🔒 Account Locked: Account locked due to 5 consecutive failed password attempts. OTP verification is required to unlock your Admin Dashboard.',
          { isLocked: true, email: user.email }
        );
      }

      if (user.status === 'blocked') {
        return sendError(
          res,
          403,
          `⛔ Account Blocked: Your account has been permanently suspended by administration. Reason: ${user.blockReason || 'Spam or violation of terms'}`
        );
      }

      if (user.status === 'deactivated') {
        return sendError(
          res,
          403,
          '⚠️ Account Deactivated: Your account has been temporarily disabled by the administrator. Please contact support.'
        );
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Increment login attempts for Security Lockout
        const currentAttempts = (user.loginAttempts || 0) + 1;
        user.loginAttempts = currentAttempts;

        if (currentAttempts >= 5) {
          user.isLocked = true;
          user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await user.save();

          // 🔑 Generate cryptographically strong OTP code for account unlock
          const otp = crypto.randomInt(100000, 1000000).toString();
          await Otp.deleteMany({ email: user.email, purpose: 'account_unlock' });
          await Otp.create({
            email: user.email,
            otp,
            purpose: 'account_unlock',
            attempts: 0,
          });

          // 📧 Dispatch OTP directly via SendGrid to Admin Email Inbox
          sendOtpEmail({
            to: user.email,
            name: user.name,
            otp,
            purpose: 'account_unlock',
          }).catch((mailErr) => {
            console.error('[Account Lock OTP Mail Error]', mailErr);
          });

          recordActivityLog(req, {
            event: 'ACCOUNT_LOCKED',
            detail: `Security Alert: Account "${user.name}" (${user.email}) locked after 5 consecutive failed password attempts. Verification OTP sent to ${user.email}.`,
            level: 'warn',
            user: user.name,
            userId: user._id,
            userEmail: user.email,
            userRole: user.role,
          });

          return sendError(
            res,
            423,
            '🔒 Security Alert: Account locked due to 5 consecutive wrong password attempts. OTP verification code has been dispatched to your Gmail inbox.',
            { isLocked: true, email: user.email }
          );
        }

        await user.save();
        const remaining = 5 - currentAttempts;
        return sendError(
          res,
          401,
          `Invalid credentials. (${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining before account locking)`
        );
      }

      // Successful login -> Reset failed login attempts counter & clear lock
      user.loginAttempts = 0;
      user.isLocked = false;
      user.lockUntil = undefined;
      await user.save();

      const token = generateToken({
        id: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: user.role === 'admin' ? 'ADMIN_LOGIN' : 'USER_LOGIN',
        detail: `${user.role === 'admin' ? 'Administrator' : 'User'} "${user.name}" (${user.email}) logged into FrameTrail.`,
        level: 'info',
        user: user.name,
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
      });

      return sendResponse(res, 200, true, 'Login successful', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          uploadLimits: user.uploadLimits,
          status: user.status,
        },
        token,
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error logging in');
    }
  }

  static async unlockAccount(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return sendError(res, 400, 'Email and 6-digit OTP code are required to unlock account');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return sendError(res, 404, 'Account not found');
      }

      const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: 'account_unlock' });
      if (!otpRecord) {
        return sendError(res, 400, 'Unlock verification code expired or not found. Please request a new OTP.');
      }

      if (otpRecord.otp !== otp.toString().trim()) {
        otpRecord.attempts = (otpRecord.attempts || 0) + 1;
        if (otpRecord.attempts >= 5) {
          await Otp.deleteMany({ email: normalizedEmail, purpose: 'account_unlock' });
          return sendError(
            res,
            429,
            '⛔ Too many failed OTP attempts. Please request a new verification code.'
          );
        }
        await otpRecord.save();
        const remaining = 5 - otpRecord.attempts;
        return sendError(
          res,
          400,
          `Invalid verification code. (${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining)`
        );
      }

      // Valid OTP code -> Consume OTP and unlock account
      await Otp.deleteMany({ email: normalizedEmail, purpose: 'account_unlock' });
      user.isLocked = false;
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      const token = generateToken({
        id: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      recordActivityLog(req, {
        event: 'ACCOUNT_UNLOCKED',
        detail: `Account "${user.name}" (${user.email}) unlocked successfully via 6-digit OTP verification code.`,
        level: 'success',
        user: user.name,
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
      });

      return sendResponse(res, 200, true, 'Account unlocked successfully via OTP! Logging in...', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          uploadLimits: user.uploadLimits,
          status: user.status,
        },
        token,
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to unlock account');
    }
  }

  static async verifyPassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Unauthorized');
      }

      const { password } = req.body;
      if (!password) {
        return sendError(res, 400, 'Password is required');
      }

      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 401, 'Incorrect admin password! Unhide access denied.');
      }

      return sendResponse(res, 200, true, 'Admin password verified successfully');
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error verifying password');
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Unauthorized');
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      return sendResponse(res, 200, true, 'User profile fetched', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          uploadLimits: user.uploadLimits,
          status: user.status,
          blockReason: user.blockReason,
        },
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error fetching user profile');
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Unauthorized');
      }

      const { name, email, avatar, password } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (avatar) user.avatar = avatar;
      if (password && password.trim().length >= 6) {
        user.password = password;
      }

      await user.save();

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: 'PROFILE_UPDATED',
        detail: `Profile details updated for user "${user.name}" (${user.email}).`,
        level: 'info',
        user: user.name,
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
      });

      return sendResponse(res, 200, true, 'Profile updated successfully', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          uploadLimits: user.uploadLimits,
          status: user.status,
        },
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error updating profile');
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, password, otp } = req.body;
      const normalizedEmail = email.trim().toLowerCase();

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return sendError(res, 404, 'User account with this email not found');
      }

      if (otp) {
        const otpRecord = await Otp.findOne({
          email: normalizedEmail,
        });

        if (!otpRecord) {
          return sendError(res, 400, 'Verification code expired or not found. Please request a new OTP.');
        }

        if (otpRecord.otp !== otp.toString().trim()) {
          otpRecord.attempts = (otpRecord.attempts || 0) + 1;
          if (otpRecord.attempts >= 5) {
            await Otp.deleteMany({ email: normalizedEmail });
            return sendError(
              res,
              429,
              '⛔ Security Alert: Too many incorrect attempts. Verification code revoked. Please request a new OTP.'
            );
          }
          await otpRecord.save();
          const remaining = 5 - otpRecord.attempts;
          return sendError(
            res,
            400,
            `Invalid verification code. (${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining)`
          );
        }

        await Otp.deleteMany({ email: normalizedEmail });
      }

      user.password = password;
      await user.save();

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: 'PASSWORD_RESET',
        detail: `Password successfully reset for account "${user.name}" (${user.email}).`,
        level: 'warn',
        user: user.name,
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
      });

      return sendResponse(res, 200, true, 'Password reset successfully');
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error resetting password');
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      return sendResponse(res, 200, true, 'Registered users fetched successfully', users);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch registered users');
    }
  }

  static async getGeoIp(req: Request, res: Response) {
    try {
      const rawClientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const firstIp = rawClientIp.split(',')[0].trim();
      const isLocal = !firstIp || firstIp.includes('::1') || firstIp.includes('127.0.0.1') || firstIp.startsWith('192.168.') || firstIp.startsWith('10.');

      // Try ipwho.is first (super accurate city-level lookup, no rate limits)
      const lookupUrl = isLocal ? 'https://ipwho.is/' : `https://ipwho.is/${firstIp}`;
      try {
        const fetchRes = await fetch(lookupUrl, { signal: AbortSignal.timeout(4000) });
        if (fetchRes.ok) {
          const json = await fetchRes.json();
          if (json && json.success !== false && (json.city || json.ip)) {
            const geoData = {
              ip: json.ip || firstIp,
              city: json.city || 'Chandigarh',
              region: json.region || 'Chandigarh',
              country_name: json.country || 'India',
              latitude: json.latitude || 30.7363,
              longitude: json.longitude || 76.7884,
              org: json.connection?.isp || json.connection?.org || 'Reliance Jio Infocomm Limited',
              postal: json.postal || '160017',
            };
            return sendResponse(res, 200, true, 'GeoIP metadata fetched', geoData);
          }
        }
      } catch (err) {
        // Fallback to secondary provider
      }

      // Secondary fallback provider: freeipapi
      try {
        const fallbackRes = await fetch(isLocal ? 'https://freeipapi.com/api/json' : `https://freeipapi.com/api/json/${firstIp}`, { signal: AbortSignal.timeout(3000) });
        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          if (json && json.cityName) {
            const geoData = {
              ip: json.ipAddress || firstIp,
              city: json.cityName,
              region: json.regionName || '',
              country_name: json.countryName || 'India',
              latitude: json.latitude || 30.7363,
              longitude: json.longitude || 76.7884,
              org: 'Internet Service Provider',
              postal: json.zipCode || '160017',
            };
            return sendResponse(res, 200, true, 'GeoIP metadata fetched', geoData);
          }
        }
      } catch (err) {
        // Fallback silently
      }

      // Clean default if offline
      return sendResponse(res, 200, true, 'GeoIP metadata', {
        ip: firstIp || '2409:40d1:42e:9b1f:95c:289f:b0fe:d676',
        city: 'Chandigarh',
        region: 'Chandigarh',
        country_name: 'India',
        latitude: 30.7363,
        longitude: 76.7884,
        org: 'Reliance Jio Infocomm Limited',
        postal: '160017',
      });
    } catch (error: any) {
      return sendResponse(res, 200, true, 'GeoIP metadata', {
        ip: '2409:40d1:42e:9b1f:95c:289f:b0fe:d676',
        city: 'Chandigarh',
        region: 'Chandigarh',
        country_name: 'India',
        latitude: 30.7363,
        longitude: 76.7884,
        org: 'Reliance Jio Infocomm Limited',
        postal: '160017',
      });
    }
  }
}
