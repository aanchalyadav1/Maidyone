import { Response, NextFunction } from 'express';
import { Request } from 'express';
import { sendResponse } from '../utils/responseHandler';

// Extend Express Request to include multer's file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// @desc    Upload a file (banner image, worker document, etc.)
// @route   POST /api/v1/upload?folder=banners
export const uploadFile = (req: MulterRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.file) {
      sendResponse(res, 400, false, 'No file uploaded');
      return;
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
      size:     req.file.size,
      url:      fileUrl,
    });
  } catch (error) {
    next(error);
  }
};
