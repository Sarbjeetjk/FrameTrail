import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return sendError(res, 400, `Validation Error: ${formattedErrors}`, error.errors);
      }
      return sendError(res, 400, 'Invalid Request Data');
    }
  };
};
