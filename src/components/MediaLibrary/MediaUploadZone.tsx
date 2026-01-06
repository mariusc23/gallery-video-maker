import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGalleryStore } from '@/store/useGalleryStore';

interface MediaUploadZoneProps {
  onPhotosUploaded?: (photoIds: string[]) => void;
}

export function MediaUploadZone({ onPhotosUploaded }: MediaUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addPhotos = useGalleryStore((state) => state.addPhotos);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      const newPhotoIds = await addPhotos(files);
      onPhotosUploaded?.(newPhotoIds);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPhotoIds = await addPhotos(Array.from(files));
      onPhotosUploaded?.(newPhotoIds);
      // Reset input so the same files can be selected again if needed
      e.target.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-primary bg-primary/10'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      {isDragActive ? (
        <p className="text-sm font-medium">Drop images here...</p>
      ) : (
        <>
          <p className="text-sm font-medium mb-1">
            Drag & drop images here, or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF, WEBP supported
          </p>
        </>
      )}
    </div>
  );
}
