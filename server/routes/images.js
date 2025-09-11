const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../index');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload single image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageId = uuidv4();
    const uploadDir = path.join(__dirname, '../uploads');
    const originalPath = path.join(uploadDir, `${imageId}_original.jpg`);
    const thumbnailPath = path.join(uploadDir, `${imageId}_thumb.jpg`);

    // Process and save original image
    await sharp(req.file.buffer)
      .jpeg({ quality: 90 })
      .toFile(originalPath);

    // Create thumbnail
    await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    const imageData = {
      id: imageId,
      originalName: req.file.originalname,
      filename: `${imageId}_original.jpg`,
      thumbnail: `${imageId}_thumb.jpg`,
      size: req.file.size,
      uploadDate: new Date().toISOString(),
      url: `/uploads/${imageId}_original.jpg`,
      thumbnailUrl: `/uploads/${imageId}_thumb.jpg`
    };

    logger.info('Image uploaded successfully', { imageId, originalName: req.file.originalname });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: imageData
    });

  } catch (error) {
    logger.error('Image upload failed', { error: error.message });
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get all images
router.get('/', async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads');
    const files = await fs.readdir(uploadDir);
    
    const images = files
      .filter(file => file.endsWith('_original.jpg'))
      .map(file => {
        const imageId = file.replace('_original.jpg', '');
        const stats = fs.statSync(path.join(uploadDir, file));
        
        return {
          id: imageId,
          filename: file,
          thumbnail: `${imageId}_thumb.jpg`,
          size: stats.size,
          uploadDate: stats.birthtime.toISOString(),
          url: `/uploads/${file}`,
          thumbnailUrl: `/uploads/${imageId}_thumb.jpg`
        };
      })
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.json({ success: true, data: images });
  } catch (error) {
    logger.error('Failed to get images', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
});

// Delete image
router.delete('/:id', async (req, res) => {
  try {
    const imageId = req.params.id;
    const uploadDir = path.join(__dirname, '../uploads');
    const originalPath = path.join(uploadDir, `${imageId}_original.jpg`);
    const thumbnailPath = path.join(uploadDir, `${imageId}_thumb.jpg`);

    // Check if files exist
    if (await fs.pathExists(originalPath)) {
      await fs.remove(originalPath);
    }
    if (await fs.pathExists(thumbnailPath)) {
      await fs.remove(thumbnailPath);
    }

    logger.info('Image deleted successfully', { imageId });
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete image', { error: error.message, imageId: req.params.id });
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;