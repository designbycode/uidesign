'use client';

import { useCallback, useRef } from 'react';

import type { FileWithPreview } from './types';
import { generateId, isImageFile, isValidImageSize } from './utils';

export interface UseFilePreviewOptions {
    maxSize?: number;
    onError?: (error: string) => void;
}

export interface UseFilePreviewReturn {
    createPreview: (file: File) => Promise<FileWithPreview | null>;
    validateFile: (file: File) => { valid: boolean; error?: string };
    revokeAll: (files: FileWithPreview[]) => void;
    createPreviewSync: (file: File) => FileWithPreview | null;
}

export function useFilePreview(
    options: UseFilePreviewOptions = {},
): UseFilePreviewReturn {
    const { maxSize = 10 * 1024 * 1024, onError } = options;
    const previewUrlsRef = useRef<Set<string>>(new Set());

    const validateFile = useCallback(
        (file: File): { valid: boolean; error?: string } => {
            if (!isImageFile(file)) {
                return { valid: false, error: 'File must be an image' };
            }

            if (!isValidImageSize(file, maxSize)) {
                const maxSizeMB = Math.round(maxSize / (1024 * 1024));

                return {
                    valid: false,
                    error: `File size must be less than ${maxSizeMB}MB`,
                };
            }

            return { valid: true };
        },
        [maxSize],
    );

    const createPreview = useCallback(
        (file: File): Promise<FileWithPreview | null> => {
            return new Promise((resolve) => {
                const validation = validateFile(file);

                if (!validation.valid) {
                    onError?.(validation.error ?? 'Invalid file');
                    resolve(null);

                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = e.target?.result as string;
                    const id = generateId();

                    previewUrlsRef.current.add(preview);

                    resolve({
                        file,
                        preview,
                        id,
                    });
                };
                reader.onerror = () => {
                    onError?.('Failed to read file');
                    resolve(null);
                };
                reader.readAsDataURL(file);
            });
        },
        [onError, validateFile],
    );

    const createPreviewSync = useCallback(
        (file: File): FileWithPreview | null => {
            const validation = validateFile(file);

            if (!validation.valid) {
                onError?.(validation.error ?? 'Invalid file');

                return null;
            }

            const preview = URL.createObjectURL(file);
            previewUrlsRef.current.add(preview);

            return {
                file,
                preview,
                id: generateId(),
            };
        },
        [onError, validateFile],
    );

    const revokeAll = useCallback((files: FileWithPreview[]) => {
        files.forEach((f) => {
            if (f.preview.startsWith('blob:')) {
                URL.revokeObjectURL(f.preview);
            } else if (previewUrlsRef.current.has(f.preview)) {
                previewUrlsRef.current.delete(f.preview);
            }
        });
    }, []);

    return {
        createPreview,
        validateFile,
        revokeAll,
        createPreviewSync,
    };
}
