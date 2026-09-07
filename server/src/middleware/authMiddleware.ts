import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Unauthorized: Access token missing');
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;

    // Verify account status from DB
    const dbUser = await User.findById(decoded.id).select('status blockReason role');
    if (!dbUser) {
      return sendError(res, 401, 'User account no longer exists');
    }

    if (dbUser.status === 'blocked') {
      return sendError(res, 403, `Account Blocked: Your account has been permanently suspended. Reason: ${dbUser.blockReason || 'Spam or violation of community guidelines'}`);
    }

    if (dbUser.status === 'deactivated') {
      return sendError(res, 403, 'Account Deactivated: Your account has been temporarily disabled by the administrator.');
    }

    next();
  } catch (error) {
    return sendError(res, 401, 'Unauthorized: Invalid or expired token');
  }
};

export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch {
      // Ignore token decode errors for optional auth
    }
  }
  next();
};

export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'Forbidden: Admin access required');
  }
  next();
};
