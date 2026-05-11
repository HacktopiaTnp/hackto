# Cloudinary Configuration

Create a `.env.local` file in the root directory and add:

```env
# Cloudinary API Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Cloudinary URL (alternative)
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

## How to Get Your Credentials

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Sign up or log in to your account
3. In the Account Details section, find:
   - **Cloud Name**: Your unique cloud identifier
   - **API Key**: Your API key
   - **API Secret**: Your API secret (keep this private!)

## Security Notes

⚠️ **NEVER** commit your API credentials to version control!
- Add `.env.local` to your `.gitignore`
- Store credentials in environment variables
- Use the CLOUDINARY_URL format only for local development

## Backend Setup

The backend Cloudinary configuration is located at:
- `src/config/cloudinary.ts` - Cloudinary SDK initialization
- `src/api/middleware/upload.middleware.ts` - File upload handling
- `src/modules/images/controllers/ImageController.ts` - Image management endpoints

## Frontend Setup

The frontend upload and image display components are located at:
- `src/app/components/shared/ImageUpload.tsx` - Single image upload component
- `src/app/components/shared/MultiImageUpload.tsx` - Multiple image upload component
- `src/app/components/shared/ResponsiveImage.tsx` - Responsive image display component

## API Endpoints

### Upload Single Image
```bash
POST /api/v1/images/upload?type=avatar&width=200&height=200
Content-Type: multipart/form-data

Form Data:
- image: [file]
- folder: "tnp-portal/users" (optional)
- type: "avatar" | "logo" | "banner" | "thumbnail" | "gallery"
```

### Upload Multiple Images
```bash
POST /api/v1/images/upload-multiple
Content-Type: multipart/form-data

Form Data:
- images: [file1, file2, ...]
- folder: "tnp-portal/gallery" (optional)
```

### Get Responsive URL
```bash
GET /api/v1/images/responsive?publicId=tnp-portal/users/123&type=avatar&width=200&height=200
```

### Delete Image
```bash
DELETE /api/v1/images/public-id
```

## Frontend Usage

### Single Image Upload
```tsx
import ImageUpload from '@/app/components/shared/ImageUpload';

<ImageUpload
  onSuccess={(data) => console.log(data)}
  onError={(error) => console.error(error)}
  type="avatar"
  folder="tnp-portal/users"
/>
```

### Multiple Image Upload
```tsx
import MultiImageUpload from '@/app/components/shared/MultiImageUpload';

<MultiImageUpload
  maxFiles={5}
  onSuccess={(images) => console.log(images)}
  onError={(error) => console.error(error)}
  folder="tnp-portal/gallery"
/>
```

### Responsive Image Display
```tsx
import ResponsiveImage from '@/app/components/shared/ResponsiveImage';

<ResponsiveImage
  publicId="tnp-portal/users/123"
  type="avatar"
  alt="User profile"
  className="rounded-full"
/>
```

## Database Integration

When storing image URLs in database, store:
- `public_id`: Cloudinary public ID (for deletion/updates)
- `url`: Original secure URL
- `type`: Image category (avatar, logo, banner, etc.)
- `uploadedAt`: Timestamp of upload
- `uploadedBy`: User ID who uploaded

Example Schema:
```prisma
model Image {
  id           String    @id @default(cuid())
  publicId     String    @unique
  url          String
  type         String    // 'avatar' | 'logo' | 'banner' | 'thumbnail' | 'gallery'
  entityType   String    // 'user' | 'company' | 'drive' | 'event' | 'achievement'
  entityId     String    // ID of the entity the image belongs to
  uploadedAt   DateTime  @default(now())
  uploadedBy   String?   // User ID
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([publicId])
  @@index([entityType, entityId])
}
```

## Image Types & Transformations

### 1. Avatar (Profile Photos)
- Size: 200x200px (displayed), stored at 400x400px
- Crop: Face-focused with gravity
- Format: WEBP/JPEG
- Use for: Student profiles, staff photos

### 2. Logo (Company Logos)
- Size: 200x200px to 400x400px
- Crop: Centered with white background
- Format: WEBP/PNG
- Use for: Company branding, recruitment partners

### 3. Banner (Drive/Event Posters)
- Size: 1200x400px responsive
- Crop: Center-focused
- Format: WEBP/JPEG
- Use for: Placement drives, event announcements

### 4. Thumbnail (Gallery/Notice Previews)
- Size: 300x200px
- Crop: Auto-focused
- Format: WEBP/JPEG
- Use for: Achievement gallery, notices

### 5. Gallery (Full-size Photos)
- Size: 500x500px to 1000x1000px
- Crop: Aspect ratio preserved
- Format: WEBP/JPEG
- Use for: Achievement photos, event gallery

## Performance Optimization

✓ Auto-format to WEBP for modern browsers
✓ Quality: Auto-optimized per device
✓ Lazy loading support
✓ Responsive breakpoints (mobile/tablet/desktop)
✓ CDN delivery for fast loading
✓ Automatic compression
✓ Transformation caching

## Troubleshooting

### Image Upload Fails
- Check file size (max 10MB)
- Verify file type (JPEG, PNG, WebP, GIF)
- Check API credentials in environment variables
- Review Cloudinary quota usage

### Slow Image Loading
- Ensure auto-format is enabled
- Check network tab for actual image size
- Consider using smaller dimensions for thumbnails
- Enable CDN caching

### Image Quality Issues
- Increase quality parameter in transformations
- Use AVIF format for modern browsers
- Reduce compression for high-quality needs

## Support

For more information, visit [Cloudinary Documentation](https://cloudinary.com/documentation)
