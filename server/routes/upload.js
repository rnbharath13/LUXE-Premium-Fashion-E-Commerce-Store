import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { supabase } from '../config/supabase.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const compress = async (buffer, type = 'product') => {
  const size = type === 'category' ? 800 : 600;
  return sharp(buffer)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .webp({ quality: 75 })
    .toBuffer();
};

router.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    const type   = req.body.type || 'product';
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

router.delete('/image', async (req, res, next) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'filename required' });

    const { error } = await supabase.storage.from('luxe-images').remove([filename]);
    if (error) throw error;
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
