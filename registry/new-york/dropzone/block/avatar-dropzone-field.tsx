'use client';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { AvatarDropzone } from '@/components/avatar-dropzone';

interface AvatarDropzoneFieldProps {
    label?: string;
    description?: string;
    onFileSelect?: (file: File) => void;
    defaultImage?: string;
    maxSize?: number;
    className?: string;
    onUploadStart?: (file: File) => void;
    onUploadProgress?: (progress: number) => void;
    onUploadSuccess?: (file: File, response?: unknown) => void;
    onUploadError?: (error: string, file?: File) => void;
    onDelete?: (currentImage: string) => void;
    onDeleteSuccess?: (deletedUrl: string) => void;
    onDeleteError?: (error: string) => void;
}

export function AvatarDropzoneField({
    label,
    description,
    onFileSelect,
    defaultImage,
    maxSize = 5 * 1024 * 1024,
    className,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onDelete,
    onDeleteSuccess,
    onDeleteError,
}: AvatarDropzoneFieldProps) {
    return (
        <AvatarDropzone
            variant="field"
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
            label={label || 'Upload Photo'}
            description={description}
            className={className}
        />
    );
}
