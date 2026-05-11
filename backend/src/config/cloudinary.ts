import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret',
});

/**
 * Upload file to Cloudinary
 * @param fileBuffer - File buffer from multer
 * @param filename - Original filename
 * @param folder - Cloudinary folder to organize uploads
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  filename: string,
  folder: string = 'tnp-portal'
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        public_id: filename.split('.')[0], // Remove extension
        overwrite: true,
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param publicId - Cloudinary public ID of the file
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Generate responsive image URL with transformations
 * @param publicId - Cloudinary public ID
 * @param width - Image width
 * @param height - Image height
 * @param type - Image category type
 */
export const getResponsiveImageUrl = (
  publicId: string,
  width: number = 400,
  height: number = 400,
  type: 'avatar' | 'logo' | 'banner' | 'thumbnail' | 'gallery' = 'thumbnail'
): string => {
  const transformations: Record<string, any> = {
    avatar: {
      width,
      height,
      crop: 'fill',
      gravity: 'faces',
      quality: 'auto',
      fetch_format: 'auto',
    },
    logo: {
      width,
      height,
      crop: 'fill',
      background: 'white',
      quality: 'auto',
      fetch_format: 'auto',
    },
    banner: {
      width: width || 1200,
      height: height || 400,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    },
    thumbnail: {
      width: width || 300,
      height: height || 200,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    },
    gallery: {
      width: width || 500,
      height: height || 500,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    },
  };

  const config = transformations[type];
  return cloudinary.url(publicId, config);
};

export default cloudinary;
