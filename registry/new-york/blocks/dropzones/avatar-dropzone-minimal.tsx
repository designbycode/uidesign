'use client';

import { AvatarDropzone } from '../../components/dropzone/avatar-dropzone';

interface AvatarDropzoneMinimalProps {
    className?: string;
    onFileSelect?: (file: File) => void;
    maxSize?: number;
    defaultImage?: string;
    onUploadStart?: (file: File) => void;
    onUploadProgress?: (progress: number) => void;
    onUploadSuccess?: (file: File, response?: unknown) => void;
    onUploadError?: (error: string, file?: File) => void;
    onDelete?: (currentImage: string) => void;
    onDeleteSuccess?: (deletedUrl: string) => void;
    onDeleteError?: (error: string) => void;
}

export function AvatarDropzoneMinimal({
    className,
    onFileSelect,
    maxSize = 5 * 1024 * 1024,
    defaultImage,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onDelete,
    onDeleteSuccess,
    onDeleteError,
}: AvatarDropzoneMinimalProps) {
    return (
        <AvatarDropzone
            variant="minimal"
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
