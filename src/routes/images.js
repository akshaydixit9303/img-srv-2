import { Router } from 'express';
import { upload, multerErrorHandler } from '../middleware/upload.js';
import { buildS3Key, uploadToS3, deleteFromS3 } from '../utils/s3.js';

const router = Router();

// POST /upload  – upload a single image to S3
router.post('/upload', upload.single('image'), multerErrorHandler, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const key = buildS3Key(req.file.originalname);
    const url = await uploadToS3(req.file.buffer, key, req.file.mimetype);

    console.log(`[upload] OK  key=${key}  size=${req.file.size}`);

    return res.status(201).json({
      message: 'Image uploaded successfully.',
      url,
      key,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    console.error('[upload] ERROR', err);
    return res.status(500).json({ error: 'Upload to S3 failed. Check your AWS credentials and bucket configuration.' });
  }
});

// DELETE /images/:key  – delete an image from S3 (key is base64-encoded)
router.delete('/images/:key', async (req, res) => {
  try {
    const key = Buffer.from(req.params.key, 'base64').toString('utf-8');
    await deleteFromS3(key);
    console.log(`[delete] OK  key=${key}`);
    return res.json({ message: 'Image deleted successfully.', key });
  } catch (err) {
    console.error('[delete] ERROR', err);
    return res.status(500).json({ error: 'Failed to delete image from S3.' });
  }
});

export default router;
