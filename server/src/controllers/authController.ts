import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { Otp } from '../models/Otp';
import { sendOtpEmail } from '../utils/sendgrid';
import { generateToken } from '../utils/jwt';
import { sendResponse, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

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
        return sendError(res, 401, 'Invalid credentials');
      }

      const token = generateToken({
        id: user._id.toString(),
        role: user.role,
        email: user.email,
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
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '103.211.54.12';
      let geoData: any = {
        ip: clientIp.includes('::1') || clientIp.includes('127.0.0.1') ? '103.211.54.12' : clientIp.split(',')[0].trim(),
        city: 'New Delhi',
        region: 'Delhi',
        country_name: 'India',
        latitude: 28.6139,
        longitude: 77.2090,
        org: 'Reliance Jio Infocomm Limited',
      };

      try {
        const fetchRes = await fetch('https://ipapi.co/json/').catch(() => null);
        if (fetchRes && fetchRes.ok) {
          const json = await fetchRes.json().catch(() => null);
          if (json && json.ip) {
            geoData = json;
          }
        }
      } catch (e) {
        // Fallback silently
      }

      return sendResponse(res, 200, true, 'GeoIP metadata fetched', geoData);
    } catch (error: any) {
      return sendResponse(res, 200, true, 'GeoIP fallback metadata', {
        ip: '103.211.54.12',
        city: 'New Delhi',
        region: 'Delhi',
        country_name: 'India',
        latitude: 28.6139,
        longitude: 77.2090,
        org: 'Reliance Jio Infocomm Limited',
      });
    }
  }
}
