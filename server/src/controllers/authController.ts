import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { sendResponse, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return sendError(res, 400, 'User with this email already exists');
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
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
        },
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error updating profile');
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return sendError(res, 404, 'User account with this email not found');
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
