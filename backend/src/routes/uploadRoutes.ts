import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadFile } from '../controllers/uploadController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { uploadLimiter } from '../middlewares/rateLimiter';
import { sendResponse } from '../utils/responseHandler';

const router = Router();

// ─── Allowed upload folders (whitelist — prevents path traversal) ─────────────
const ALLOWED_FOLDERS = new Set(['banners', 'documents', 'avatars']);

// Ensure base upload dirs exist at startup
for (const folder of ALLOWED_FOLDERS) {
  const dir = path.join(process.cwd(), 'uploads', folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Multer storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const raw = (req.query.folder as string) || 'banners';
    // Whitelist check — reject any folder not in the allowed set
    const folder = ALLOWED_FOLDERS.has(raw) ? raw : 'banners';
    const dest = path.join(process.cwd(), 'uploads', folder);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    // Sanitize original filename — strip path separators and non-safe chars
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

// ─── MIME type + extension double-check ──────────────────────────────────────
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTS.has(ext)) {
    return cb(new Error('Only image files are allowed: jpeg, png, webp, gif'));
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
router.post('/', (req, res, next) => {
  const folder = req.query.folder as string | undefined;
  if (folder && !ALLOWED_FOLDERS.has(folder)) {
    return sendResponse(res, 400, false, `Invalid folder. Allowed: ${[...ALLOWED_FOLDERS].join(', ')}`);
  }
  next();
}, upload.single('file'), uploadFile);

export default router;
