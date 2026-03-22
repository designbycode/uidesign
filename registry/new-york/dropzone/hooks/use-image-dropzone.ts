'use client';

import { useCallback, useRef, useState } from 'react';

import type { DragOverState, FileWithPreview } from './types';
import { generateId, isImageFile } from './utils';

export interface UseImageDropzoneOptions {
    maxFiles?: number;
    maxSize?: number;
    onFilesChange?: (files: File[]) => void;
    onError?: (error: string) => void;
}

export interface UseImageDropzoneReturn {
    files: FileWithPreview[];
    isDragOver: boolean;
    dragProps: DragOverState['dragProps'];
    inputRef: React.RefObject<HTMLInputElement | null>;
    addFiles: (newFiles: FileList | File[]) => void;
    removeFile: (id: string) => void;
    clearAll: () => void;
    hasReachedMax: boolean;
    getFileById: (id: string) => FileWithPreview | undefined;
    setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
    triggerFileInput: () => void;
}

export function useImageDropzone(
    options: UseImageDropzoneOptions = {},
): UseImageDropzoneReturn {
    const {
        maxFiles = 10,
        maxSize = 10 * 1024 * 1024,
        onFilesChange,
        onError,
    } = options;

    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const dragCounter = useRef(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const previewUrlsRef = useRef<Set<string>>(new Set());

    const hasReachedMax = files.length >= maxFiles;

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;

        if (dragCounter.current === 1) {
            setIsDragOver(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;

        if (dragCounter.current === 0) {
            setIsDragOver(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const revokePreview = useCallback((preview: string) => {
        if (preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }

        previewUrlsRef.current.delete(preview);
    }, []);

    const addFiles = useCallback(
        (newFiles: FileList | File[]) => {
            const fileArray = Array.from(newFiles);
            const remainingSlots = maxFiles - files.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            const newFileObjects: FileWithPreview[] = [];

            for (const file of filesToProcess) {
                if (!isImageFile(file)) {
                    onError?.('File must be an image');
                    continue;
                }

                if (file.size > maxSize) {
                    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
                    onError?.(`File size must be less than ${maxSizeMB}MB`);
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
                    onFilesChange?.(updated.map((f) => f.file));

                    return updated;
                });
            }
        },
        [files.length, maxFiles, maxSize, onError, onFilesChange],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current = 0;
            setIsDragOver(false);

            if (e.dataTransfer.files.length > 0) {
                addFiles(e.dataTransfer.files);
            }
        },
        [addFiles],
    );

    const removeFile = useCallback(
        (id: string) => {
            setFiles((prev) => {
                const fileToRemove = prev.find((f) => f.id === id);

                if (fileToRemove) {
                    revokePreview(fileToRemove.preview);
                }

                const updated = prev.filter((f) => f.id !== id);
                onFilesChange?.(updated.map((f) => f.file));

                return updated;
            });
        },
        [onFilesChange, revokePreview],
    );

    const clearAll = useCallback(() => {
        previewUrlsRef.current.forEach((url) => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        previewUrlsRef.current.clear();

        setFiles([]);
        onFilesChange?.([]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [onFilesChange]);

    const getFileById = useCallback(
        (id: string) => {
            return files.find((f) => f.id === id);
        },
        [files],
    );

    const triggerFileInput = useCallback(() => {
        inputRef.current?.click();
    }, []);

    return {
        files,
        isDragOver,
        dragProps: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
            onDragOver: handleDragOver,
        },
        inputRef,
        addFiles,
        removeFile,
        clearAll,
        hasReachedMax,
        getFileById,
        setFiles,
        triggerFileInput,
    };
}
