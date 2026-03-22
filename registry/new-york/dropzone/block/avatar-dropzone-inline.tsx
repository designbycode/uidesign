'use client';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { AvatarDropzone } from '@/components/avatar-dropzone';

interface AvatarDropzoneInlineProps {
    className?: string;
    onFileSelect?: (file: File) => void;
    maxSize?: number;
    defaultImage?: string;
    label?: string;
    description?: string;
    onUploadStart?: (file: File) => void;
    onUploadProgress?: (progress: number) => void;
    onUploadSuccess?: (file: File, response?: unknown) => void;
    onUploadError?: (error: string, file?: File) => void;
    onDelete?: (currentImage: string) => void;
    onDeleteSuccess?: (deletedUrl: string) => void;
    onDeleteError?: (error: string) => void;
}

export function AvatarDropzoneInline({
    className,
    onFileSelect,
    maxSize = 5 * 1024 * 1024,
    defaultImage,
    label = 'Photo',
    description,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onDelete,
    onDeleteSuccess,
    onDeleteError,
}: AvatarDropzoneInlineProps) {
    return (
        <AvatarDropzone
            variant="inline"
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
            label={label}
            description={description}
            className={className}
        />
    );
}
