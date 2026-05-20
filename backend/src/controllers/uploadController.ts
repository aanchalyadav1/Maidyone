import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/responseHandler';

// @desc    Upload a file (banner image, worker document, etc.)
// @route   POST /api/v1/upload
export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, 'No file uploaded');
    }

    // Build the public URL for the uploaded file
    const protocol = req.protocol;
    const host = req.get('host') || 'localhost:5000';
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    sendResponse(res, 200, true, 'File uploaded successfully', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
    });
  } catch (error) {
    next(error);
  }
};
