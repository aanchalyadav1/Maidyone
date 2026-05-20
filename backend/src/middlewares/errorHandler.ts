import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/responseHandler';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Always log internally
  console.error(`[ERROR] ${req.method} ${req.originalUrl} —`, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendResponse(res, 400, false, 'Invalid ID format');
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map((e: any) => e.message)
      .join(', ');
    return sendResponse(res, 400, false, messages);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendResponse(res, 409, false, `Duplicate value for ${field}`);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendResponse(res, 400, false, 'File too large. Maximum size is 5 MB');
    }
    return sendResponse(res, 400, false, `Upload error: ${err.message}`);
  }

  // JWT / Firebase token errors
  if (err.code === 'auth/id-token-expired' || err.code === 'auth/argument-error') {
    return sendResponse(res, 401, false, 'Token expired or invalid. Please log in again.');
  }

  // CORS error
  if (err.message && err.message.startsWith('CORS:')) {
    return sendResponse(res, 403, false, err.message);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Never expose stack traces or internal details in production
  sendResponse(
    res,
    statusCode,
    false,
    process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message
  );
};
