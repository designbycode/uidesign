'use client';

import { useCallback, useRef, useState } from 'react';

import type { FileWithPreview } from './types';
import { generateId, isImageFile } from './utils';

export interface UseFileCollectionOptions {
    maxFiles?: number;
    maxSize?: number;
    onChange?: (files: File[]) => void;
}

export interface UseFileCollectionReturn {
    files: FileWithPreview[];
    addFiles: (newFiles: FileList | File[]) => Promise<void>;
    removeFile: (id: string) => void;
    clearAll: () => void;
    hasReachedMax: boolean;
    setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    getFileById: (id: string) => FileWithPreview | undefined;
}

export function useFileCollection(
    options: UseFileCollectionOptions = {},
): UseFileCollectionReturn {
    const { maxFiles = 10, maxSize = 10 * 1024 * 1024, onChange } = options;

    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const previewUrlsRef = useRef<Set<string>>(new Set());

    const hasReachedMax = files.length >= maxFiles;

    const revokePreview = useCallback((preview: string) => {
        if (preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }

        previewUrlsRef.current.delete(preview);
    }, []);

    const addFiles = useCallback(
        async (newFiles: FileList | File[]) => {
            const fileArray = Array.from(newFiles);
            const remainingSlots = maxFiles - files.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            const newFileObjects: FileWithPreview[] = [];

            for (const file of filesToProcess) {
                if (!isImageFile(file) || file.size > maxSize) {
                    continue;
                }

                const preview = URL.createObjectURL(file);
                previewUrlsRef.current.add(preview);

                newFileObjects.push({
                    file,
                    preview,
                    id: generateId(),
                });
            }

            if (newFileObjects.length > 0) {
                setFiles((prev) => {
                    const updated = [...prev, ...newFileObjects].slice(
                        0,
                        maxFiles,
                    );
                    onChange?.(updated.map((f) => f.file));

                    return updated;
                });
            }
        },
        [files.length, maxFiles, maxSize, onChange],
    );

    const removeFile = useCallback(
        (id: string) => {
            setFiles((prev) => {
                const fileToRemove = prev.find((f) => f.id === id);

                if (fileToRemove) {
                    revokePreview(fileToRemove.preview);
                }

                const updated = prev.filter((f) => f.id !== id);
                onChange?.(updated.map((f) => f.file));

                return updated;
            });
        },
        [onChange, revokePreview],
    );

    const clearAll = useCallback(() => {
        previewUrlsRef.current.forEach((url) => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        previewUrlsRef.current.clear();

        setFiles([]);
        onChange?.([]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [onChange]);

    const getFileById = useCallback(
        (id: string) => {
            return files.find((f) => f.id === id);
        },
        [files],
    );

    return {
        files,
        addFiles,
        removeFile,
        clearAll,
        hasReachedMax,
        setFiles,
        inputRef,
        getFileById,
    };
}
