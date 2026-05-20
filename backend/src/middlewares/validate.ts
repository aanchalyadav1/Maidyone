import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendResponse } from '../utils/responseHandler';

/**
 * Validates that req.params.id is a valid MongoDB ObjectId.
 * Prevents CastError crashes from malformed IDs.
 */
export const validateObjectId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, false, 'Invalid ID format');
  }
  next();
};

/**
 * Clamps pagination query params to safe ranges.
 * Prevents limit=999999 DB dumps.
 */
export const sanitizePagination = (req: Request, _res: Response, next: NextFunction) => {
  const MAX_LIMIT = 100;
  const DEFAULT_LIMIT = 10;

  if (req.query.page) {
    const p = parseInt(req.query.page as string, 10);
    req.query.page = (isNaN(p) || p < 1 ? 1 : p).toString();
  }
  if (req.query.limit) {
    const l = parseInt(req.query.limit as string, 10);
    req.query.limit = (isNaN(l) || l < 1 ? DEFAULT_LIMIT : Math.min(l, MAX_LIMIT)).toString();
  }
  next();
};

/**
 * Strips any keys that start with $ or contain . from req.body
 * to prevent NoSQL injection via body fields not caught by mongo-sanitize.
 */
export const sanitizeBody = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepStrip(req.body);
  }
  next();
};

function deepStrip(obj: any): any {
  if (Array.isArray(obj)) return obj.map(deepStrip);
  if (obj !== null && typeof obj === 'object') {
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) continue; // drop injection keys
      clean[key] = deepStrip(obj[key]);
    }
    return clean;
  }
  return obj;
}

/**
 * Validates email format.
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates that a value is a non-negative finite number.
 */
export const isValidPositiveNumber = (val: unknown): boolean => {
  const n = Number(val);
  return isFinite(n) && n >= 0;
};
