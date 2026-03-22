'use client';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { AvatarDropzone } from '@/components/avatar-dropzone';

interface AvatarDropzoneGhostProps {
    className?: string;
    onFileSelect?: (file: File) => void;
    defaultImage?: string;
    maxSize?: number;
    onUploadStart?: (file: File) => void;
    onUploadProgress?: (progress: number) => void;
    onUploadSuccess?: (file: File, response?: unknown) => void;
    onUploadError?: (error: string, file?: File) => void;
    onDelete?: (currentImage: string) => void;
    onDeleteSuccess?: (deletedUrl: string) => void;
    onDeleteError?: (error: string) => void;
}

export function AvatarDropzoneGhost({
    className,
    onFileSelect,
    defaultImage,
    maxSize = 5 * 1024 * 1024,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onDelete,
    onDeleteSuccess,
    onDeleteError,
}: AvatarDropzoneGhostProps) {
    return (
        <AvatarDropzone
            variant="ghost"
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
