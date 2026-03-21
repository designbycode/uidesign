'use client';

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

export function isValidImageSize(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes;
}

export function validateImageFile(
    file: File,
    maxSizeBytes: number,
): { valid: boolean; error?: string } {
    if (!isImageFile(file)) {
        return { valid: false, error: 'File must be an image' };
    }

    if (!isValidImageSize(file, maxSizeBytes)) {
        const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));

        return {
            valid: false,
            error: `File size must be less than ${maxSizeMB}MB`,
        };
    }

    return { valid: true };
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
