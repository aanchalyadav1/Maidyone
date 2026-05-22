import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { sendResponse } from '../utils/responseHandler';

// @desc    Upload a file (banner image, worker document, etc.)
// @route   POST /api/v1/upload?folder=banners
export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, 'No file uploaded');
    }

    // Build the public URL using the configured API base URL (not req.protocol/host
    // which can be spoofed via X-Forwarded-Proto / Host headers).
    const apiBase = (process.env.API_BASE_URL || '').replace(/\/+$/, '');
    const folder = (req.query.folder as string) || 'banners';

    // Construct relative path: /uploads/<folder>/<filename>
    const relativePath = `/uploads/${folder}/${req.file.filename}`;
    const fileUrl = apiBase ? `${apiBase}${relativePath}` : relativePath;

    sendResponse(res, 200, true, 'File uploaded successfully', {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
    });
  } catch (error) {
    next(error);
  }
};
