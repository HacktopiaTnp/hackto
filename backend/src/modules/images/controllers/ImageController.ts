import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';
import { imageUpload, uploadImageMiddleware } from '@api/middleware/upload.middleware';
import { getResponsiveImageUrl, deleteFromCloudinary, uploadToCloudinary } from '@config/cloudinary';

/**
 * Image Management Controller
 * Handles image uploads for various portal features
 */
export class ImageController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    // POST /api/v1/images/upload
    this.router.post(
      '/upload',
      imageUpload.single('image'),
      uploadImageMiddleware,
      asyncHandler((req, res) => this.uploadImage(req, res))
    );

    // POST /api/v1/images/upload-multiple
    this.router.post(
      '/upload-multiple',
      imageUpload.array('images', 5),
      asyncHandler((req, res) => this.uploadMultipleImages(req, res))
    );

    // GET /api/v1/images/responsive
    this.router.get(
      '/responsive',
      asyncHandler((req, res) => this.getResponsiveUrl(req, res))
    );

    // DELETE /api/v1/images/:publicId
    this.router.delete(
      '/:publicId',
      asyncHandler((req, res) => this.deleteImage(req, res))
    );

    // GET /api/v1/images/profile/:userid
    this.router.get(
      '/profile/:userId',
      asyncHandler((req, res) => this.getUserProfileImage(req, res))
    );
  }

  /**
   * Upload single image
   */
  private async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const cloudinaryResult = (req as any).cloudinaryResult;
      const imageType = req.query.type as string || 'thumbnail';

      if (!cloudinaryResult) {
        res.status(500).json({
          success: false,
          message: 'Image upload failed',
        });
        return;
      }

      const responsiveUrl = getResponsiveImageUrl(
        cloudinaryResult.public_id,
        parseInt(req.query.width as string) || 400,
        parseInt(req.query.height as string) || 400,
        imageType as any
      );

      res.status(200).json({
        success: true,
        data: {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.secure_url,
          responsiveUrl: responsiveUrl,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          size: cloudinaryResult.bytes,
          type: imageType,
        },
        message: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Upload multiple images
   */
  private async uploadMultipleImages(req: Request, res: Response): Promise<void> {
    try {
      const files = (req as any).files;
      if (!files || !Array.isArray(files) || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
        return;
      }

      const uploadPromises = files.map((file: any) =>
        uploadToCloudinary(
          file.buffer,
          `${Date.now()}-${file.originalname}`,
          req.query.folder as string || 'tnp-portal'
        )
      );

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result: any) => ({
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      }));

      res.status(200).json({
        success: true,
        data: uploadedImages,
        total: uploadedImages.length,
        message: 'Images uploaded successfully',
      });
    } catch (error) {
      console.error('Upload multiple images error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get responsive image URL
   */
  private async getResponsiveUrl(req: Request, res: Response): Promise<void> {
    try {
      const { publicId, width, height, type } = req.query;

      if (!publicId) {
        res.status(400).json({
          success: false,
          message: 'publicId is required',
        });
        return;
      }

      const responsiveUrl = getResponsiveImageUrl(
        publicId as string,
        parseInt(width as string) || 400,
        parseInt(height as string) || 400,
        (type as any) || 'thumbnail'
      );

      res.json({
        success: true,
        data: {
          publicId,
          responsiveUrl,
          type,
          width,
          height,
        },
      });
    } catch (error) {
      console.error('Get responsive URL error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate responsive URL',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete image from Cloudinary
   */
  private async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        res.status(400).json({
          success: false,
          message: 'publicId is required',
        });
        return;
      }

      await deleteFromCloudinary(publicId);

      res.json({
        success: true,
        data: { publicId },
        message: 'Image deleted successfully',
      });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get user profile image
   */
  private async getUserProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // This would fetch from database in a real application
      // For now, returning placeholder
      const publicId = `tnp-portal/users/${userId}`;

      const imageUrl = getResponsiveImageUrl(publicId, 200, 200, 'avatar');

      res.json({
        success: true,
        data: {
          userId,
          imageUrl,
        },
      });
    } catch (error) {
      console.error('Get user profile image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default ImageController;
