import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { supabase } from '../config/supabase.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Whitelist of allowed folders. The handler MUST validate any user-supplied
// filename starts with one of these — prevents path traversal (../) and
// deletion of arbitrary files in the bucket.
const ALLOWED_FOLDERS = ['products/', 'categories/'];

const isSafeFilename = (filename) =>
  typeof filename === 'string'
  && filename.length > 0
  && filename.length < 256
  && !filename.includes('..')
  && !filename.includes('\\')
  && ALLOWED_FOLDERS.some((p) => filename.startsWith(p));

const compress = async (buffer, type = 'product') => {
  const size = type === 'category' ? 800 : 600;
  return sharp(buffer)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .webp({ quality: 75 })
    .toBuffer();
};

// Admin-only: catalog editors upload product / category images.
router.post('/image', protect, requireRole('admin'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    const type   = req.body.type === 'category' ? 'category' : 'product';
    const folder = type === 'category' ? 'categories' : 'products';

    const compressed = await compress(req.file.buffer, type);
    const filename   = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

    const { error } = await supabase.storage
      .from('luxe-images')
      .upload(filename, compressed, { contentType: 'image/webp', upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('luxe-images')
      .getPublicUrl(filename);

    res.json({ url: publicUrl, filename });
  } catch (err) { next(err); }
});

// Admin-only: deletion is destructive AND filename comes from request body —
// double-check it's inside an allowed folder before passing to storage.
router.delete('/image', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { filename } = req.body;
    if (!isSafeFilename(filename)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const { error } = await supabase.storage.from('luxe-images').remove([filename]);
    if (error) throw error;
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
