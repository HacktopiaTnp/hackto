import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';

interface ImageUploadProps {
  onSuccess?: (data: ImageUploadResponse) => void;
  onError?: (error: string) => void;
  type?: 'avatar' | 'logo' | 'banner' | 'thumbnail' | 'gallery';
  folder?: string;
  maxSize?: number; // in MB
  className?: string;
  accept?: string;
  multiple?: false;
}

interface ImageUploadResponse {
  public_id: string;
  url: string;
  responsiveUrl: string;
  width: number;
  height: number;
  format: string;
  size: number;
  type: string;
}

export default function ImageUpload({
  onSuccess,
  onError,
  type = 'thumbnail',
  folder = 'tnp-portal',
  maxSize = 10,
  className = '',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  multiple = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  const validateFile = (file: File): boolean => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    const validTypes = accept.split(',');
    if (!validTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed types: ${accept}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setError(null);
    setSuccess(false);

    // Validate
    if (!validateFile(file)) {
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('image', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 300);

      const response = await fetch(
        `${apiBaseUrl}/api/v1/images/upload?type=${type}&folder=${folder}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        onSuccess?.(data.data);
        setTimeout(() => {
          setPreview(null);
          setSuccess(false);
          setProgress(0);
        }, 2000);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setError(null);

      if (validateFile(file)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
        await uploadFile(file);
      }
    }
  };

  return (
    <div className={`w-full max-w-md ${className}`}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${
            uploading
              ? 'border-gray-300 bg-gray-50'
              : 'border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${success ? 'border-green-300 bg-green-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={accept}
          disabled={uploading}
          className="hidden"
        />

        {/* Preview */}
        {preview && (
          <div className="relative mb-4 inline-block">
            <img
              src={preview}
              alt="Preview"
              className={`w-24 h-24 object-cover rounded ${
                uploading ? 'opacity-50' : ''
              }`}
            />
            {!uploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Icon and Text */}
        {!preview && (
          <>
            <Upload
              className={`w-12 h-12 mx-auto mb-2 ${
                uploading ? 'text-gray-400' : 'text-blue-500'
              }`}
            />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">
              {accept.split(',').join(', ')} up to {maxSize}MB
            </p>
          </>
        )}

        {success && (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Upload successful!</span>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <Loader className="w-6 h-6 mx-auto animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Uploading to Cloudinary...</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {uploading && progress > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Upload Progress</span>
            <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Error Message */}
      {error && !uploading && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Upload Error</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Image Type:</strong> {type} | <strong>Folder:</strong> {folder}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Your image will be automatically optimized and compressed for web.
        </p>
      </div>
    </div>
  );
}
