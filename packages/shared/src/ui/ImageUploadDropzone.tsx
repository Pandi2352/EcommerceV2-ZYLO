import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  X,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { uploadsService } from '../api/uploads.service';
import type { UploadFolder } from '../types/upload';
import { toast } from './Toast';

export interface ImageUploadDropzoneProps {
  label?: string;
  helperText?: string;
  folder?: UploadFolder;
  multiple?: boolean;
  value?: string | string[];
  onChange: (value: any) => void;
  maxSizeMb?: number;
  aspectRatioHint?: string;
  className?: string;
  disabled?: boolean;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  label,
  helperText,
  folder = 'general',
  multiple = false,
  value,
  onChange,
  maxSizeMb = 5,
  aspectRatioHint,
  className = '',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize current images into an array for uniform rendering
  const currentImages: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : value
      ? [value]
      : [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validMimes.includes(file.type)) {
      return `File "${file.name}" has invalid format (${file.type}). Allowed: JPEG, PNG, WebP, GIF, SVG.`;
    }
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed: ${maxSizeMb}MB.`;
    }
    return null;
  };

  const processUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    for (const f of fileArray) {
      const error = validateFile(f);
      if (error) {
        toast.error(error);
        return;
      }
    }

    try {
      setIsUploading(true);
      if (multiple) {
        const results = await uploadsService.uploadMultiple(fileArray, folder);
        const newUrls = results.map((r) => r.path);
        const combined = [...currentImages, ...newUrls];
        onChange(combined);
        toast.success(`Successfully uploaded ${results.length} image(s)`);
      } else {
        const file = fileArray[0];
        const result = await uploadsService.uploadSingle(file, folder);
        onChange(result.path);
        toast.success('Image uploaded successfully');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processUpload(e.target.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (multiple) {
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (multiple) {
      onChange([...currentImages, trimmed]);
    } else {
      onChange(trimmed);
    }
    setUrlInput('');
    toast.success('Image URL added');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            {label}
          </label>
        )}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'upload'
                ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'url'
                ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Direct URL
          </button>
        </div>
      </div>

      {/* Upload Dropzone Mode */}
      {mode === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/20'
              : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:bg-neutral-900/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            multiple={multiple}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <div className="flex flex-col items-center py-2 space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  Uploading media to server...
                </p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    <span className="text-indigo-600 dark:text-indigo-400 hover:underline">
                      Click to upload
                    </span>{' '}
                    or drag & drop
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    JPEG, PNG, WebP, GIF, SVG (up to {maxSizeMb}MB)
                  </p>
                  {aspectRatioHint && (
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {aspectRatioHint}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Direct URL Mode */
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
              <LinkIcon className="w-3.5 h-3.5" />
            </span>
            <input
              type="url"
              placeholder="https://example.com/image.webp or /uploads/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyUrl())}
              disabled={disabled}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyUrl}
            disabled={disabled || !urlInput.trim()}
            className="px-3 py-1.5 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-md transition-colors disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      {/* Helper text */}
      {helperText && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{helperText}</p>
      )}

      {/* Image Preview Grid */}
      {currentImages.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 flex items-center justify-between">
            <span>
              {multiple
                ? `Uploaded Images (${currentImages.length})`
                : 'Current Image'}
            </span>
            {!multiple && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            )}
          </p>

          <div
            className={`grid gap-2.5 ${
              multiple
                ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
                : 'grid-cols-1 max-w-[220px]'
            }`}
          >
            {currentImages.map((imgUrl, idx) => {
              // Ensure proper URL display
              const isLocal = imgUrl.startsWith('/uploads/');
              const displayUrl = isLocal ? imgUrl : imgUrl;

              return (
                <div
                  key={`${imgUrl}-${idx}`}
                  className="group relative border border-neutral-200 dark:border-neutral-800 rounded-md bg-neutral-100 dark:bg-neutral-900 overflow-hidden aspect-square flex items-center justify-center shadow-none"
                >
                  <img
                    src={displayUrl}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                    }}
                  />

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                    <a
                      href={displayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View full image"
                      className="p-1 rounded bg-white/90 text-neutral-800 hover:bg-white text-xs transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        title="Remove image"
                        className="p-1 rounded bg-rose-600/90 text-white hover:bg-rose-600 text-xs transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {multiple && idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-neutral-900/80 text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadDropzone;
