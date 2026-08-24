import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Handler]', err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'Internal Server Error';

  sendError(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, 404, `API Route Not Found - ${req.originalUrl}`);
};
