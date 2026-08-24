import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: any;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  pagination?: ApiResponse['pagination']
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    pagination,
  });
};

export const sendError = (res: Response, statusCode: number, message: string, error?: any) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || null,
  });
};
