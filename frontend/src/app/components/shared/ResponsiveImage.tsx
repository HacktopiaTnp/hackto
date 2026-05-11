import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ResponsiveImageProps {
  publicId: string;
  type?: 'avatar' | 'logo' | 'banner' | 'thumbnail' | 'gallery';
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: string; // Fallback image URL
  lazy?: boolean;
  onClick?: () => void;
}

const imageDimensions = {
  avatar: { width: 200, height: 200, defaultWidth: 200, defaultHeight: 200 },
  logo: { width: 200, height: 200, defaultWidth: 200, defaultHeight: 200 },
  banner: { width: 1200, height: 400, defaultWidth: 1200, defaultHeight: 400 },
  thumbnail: { width: 300, height: 200, defaultWidth: 300, defaultHeight: 200 },
  gallery: { width: 500, height: 500, defaultWidth: 500, defaultHeight: 500 },
};

export default function ResponsiveImage({
  publicId,
  type = 'thumbnail',
  alt,
  className = '',
  width,
  height,
  fallback = 'https://via.placeholder.com/300x200?text=Image+Loading',
  lazy = true,
  onClick,
}: ResponsiveImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  const dims = imageDimensions[type];
  const imgWidth = width || dims.defaultWidth;
  const imgHeight = height || dims.defaultHeight;

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `${apiBaseUrl}/api/v1/images/responsive?publicId=${publicId}&type=${type}&width=${imgWidth}&height=${imgHeight}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch image URL');
        }

        const data = await response.json();

        if (data.success) {
          setImageUrl(data.data.responsiveUrl);
        } else {
          throw new Error(data.message || 'Failed to get image URL');
        }
      } catch (err) {
        console.error('Error fetching image URL:', err);
        setError(true);
        setImageUrl(fallback);
      } finally {
        setLoading(false);
      }
    };

    if (publicId) {
      fetchImageUrl();
    }
  }, [publicId, type, imgWidth, imgHeight, apiBaseUrl, fallback]);

  // Responsive breakpoints for different image types
  const srcSet = (() => {
    if (!imageUrl || imageUrl === fallback) return undefined;

    switch (type) {
      case 'banner':
        return `
          ${imageUrl}?w=768 768w,
          ${imageUrl}?w=1024 1024w,
          ${imageUrl}?w=1200 1200w,
          ${imageUrl}?w=1920 1920w
        `;
      case 'gallery':
        return `
          ${imageUrl}?w=400 400w,
          ${imageUrl}?w=600 600w,
          ${imageUrl}?w=800 800w,
          ${imageUrl}?w=1000 1000w
        `;
      case 'avatar':
      case 'logo':
        return `
          ${imageUrl}?w=100 100w,
          ${imageUrl}?w=150 150w,
          ${imageUrl}?w=200 200w,
          ${imageUrl}?w=400 400w
        `;
      case 'thumbnail':
      default:
        return `
          ${imageUrl}?w=300 300w,
          ${imageUrl}?w=450 450w,
          ${imageUrl}?w=600 600w
        `;
    }
  })();

  const sizesAttribute = (() => {
    switch (type) {
      case 'banner':
        return '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px';
      case 'gallery':
        return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px';
      case 'avatar':
      case 'logo':
        return '(max-width: 640px) 100px, (max-width: 1024px) 150px, 200px';
      case 'thumbnail':
      default:
        return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px';
    }
  })();

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{
        aspectRatio: type === 'banner' ? '3/1' : undefined,
      }}
    >
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-xs text-red-600">Failed to load image</p>
          </div>
        </div>
      ) : (
        <img
          src={imageUrl || fallback}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loading ? 'opacity-0' : 'opacity-100'
          } ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          srcSet={srcSet}
          sizes={sizesAttribute}
          onClick={onClick}
          style={{
            width: type === 'avatar' || type === 'logo' ? imgWidth : '100%',
            height:
              type === 'avatar' || type === 'logo' || type === 'gallery'
                ? imgHeight
                : 'auto',
          }}
        />
      )}

      {/* Image overlay hints */}
      {type === 'avatar' && (
        <style jsx>{`
          img {
            border-radius: 50%;
          }
        `}</style>
      )}
    </div>
  );
}

/**
 * Utility hook to get responsive image URL
 */
export function useResponsiveImage(publicId: string, type: string = 'thumbnail') {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiBaseUrl}/api/v1/images/responsive?publicId=${publicId}&type=${type}`
        );

        if (!response.ok) throw new Error('Failed to fetch image URL');

        const data = await response.json();
        setImageUrl(data.data.responsiveUrl);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (publicId) fetchUrl();
  }, [publicId, type, apiBaseUrl]);

  return { imageUrl, loading, error };
}
