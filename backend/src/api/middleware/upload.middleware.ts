import { Request, Response, NextFunction } from 'express';
const multer = require('multer');
import { uploadToCloudinary } from '@config/cloudinary';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: any, cb: any) => {
  // Allowed MIME types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
    'image/gif',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not supported. Only JPEG, PNG, WebP, JPG, GIF are allowed.`));
  }
};

// Initialize multer
export const imageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Middleware to upload image to Cloudinary
 * Expects file to be uploaded via multer
 */
export const uploadImageMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    // Get folder from query params or default
    const folder = req.query.folder as string || 'tnp-portal';

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      file.buffer,
      `${Date.now()}-${file.originalname}`,
      folder
    );

    // Attach Cloudinary result to request object
    (req as any).cloudinaryResult = result;

    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export default imageUpload;
