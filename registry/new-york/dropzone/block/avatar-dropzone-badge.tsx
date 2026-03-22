'use client';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { AvatarDropzone } from '@/components/avatar-dropzone';

interface AvatarDropzoneBadgeProps {
    className?: string;
    onFileSelect?: (file: File) => void;
    maxSize?: number;
    defaultImage?: string;
    size?: 'sm' | 'md' | 'lg';
    onUploadStart?: (file: File) => void;
    onUploadProgress?: (progress: number) => void;
    onUploadSuccess?: (file: File, response?: unknown) => void;
    onUploadError?: (error: string, file?: File) => void;
    onDelete?: (currentImage: string) => void;
    onDeleteSuccess?: (deletedUrl: string) => void;
    onDeleteError?: (error: string) => void;
}

export function AvatarDropzoneBadge({
    className,
    onFileSelect,
    maxSize = 5 * 1024 * 1024,
    defaultImage,
    size = 'md',
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onDelete,
    onDeleteSuccess,
    onDeleteError,
}: AvatarDropzoneBadgeProps) {
    return (
        <AvatarDropzone
            variant="badge"
            size={size}
            onFileSelect={onFileSelect}
            maxSize={maxSize}
            defaultImage={defaultImage}
            onUploadStart={onUploadStart}
            onUploadProgress={onUploadProgress}
            onUploadSuccess={onUploadSuccess}
            onUploadError={onUploadError}
            onDelete={onDelete}
            onDeleteSuccess={onDeleteSuccess}
            onDeleteError={onDeleteError}
            className={className}
        />
    );
}
