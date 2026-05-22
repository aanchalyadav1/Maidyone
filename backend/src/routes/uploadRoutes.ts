import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadFile } from '../controllers/uploadController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { uploadLimiter } from '../middlewares/rateLimiter';
import { sendResponse } from '../utils/responseHandler';

const router = Router();

// ─── Allowed upload folders (whitelist — prevents path traversal) ─────────────
const ALLOWED_FOLDERS = new Set<string>(['banners', 'documents', 'avatars']);

// Ensure base upload dirs exist at startup
for (const folder of ALLOWED_FOLDERS) {
  const dir = path.join(process.cwd(), 'uploads', folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Multer storage ───────────────────────────────────────────────────────────
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const raw = (req.query.folder as string) || 'banners';
    // Whitelist check — reject any folder not in the allowed set
    const folder = ALLOWED_FOLDERS.has(raw) ? raw : 'banners';
    const dest = path.join(process.cwd(), 'uploads', folder);
    cb(null, dest);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Sanitize original filename — strip path separators and non-safe chars
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

// ─── MIME type + extension double-check ──────────────────────────────────────
const ALLOWED_MIMES = new Set<string>(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXTS  = new Set<string>(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTS.has(ext)) {
    cb(new Error('Only image files are allowed: jpeg, png, webp, gif'));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB hard cap
    files: 1,                   // single file only
    fields: 0,                  // no extra non-file fields via multipart
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────
router.use(protect);
router.use(authorize('admin'));
router.use(uploadLimiter);

// Validate folder query param before multer runs
router.post(
  '/',
  (req: Request, res: Response, next: NextFunction): void => {
    const folder = req.query.folder as string | undefined;
    if (folder && !ALLOWED_FOLDERS.has(folder)) {
      sendResponse(res, 400, false, `Invalid folder. Allowed: ${[...ALLOWED_FOLDERS].join(', ')}`);
      return;
    }
    next();
  },
  upload.single('file'),
  uploadFile
);

export default router;
