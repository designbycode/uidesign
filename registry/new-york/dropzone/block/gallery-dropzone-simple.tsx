'use client';

import { Upload, X, Plus } from 'lucide-react';
import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileWithPreview {
    id: string;
    file: File;
    preview: string;
}

interface GalleryDropzoneSimpleProps {
    onFilesSelect?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
}

export function GalleryDropzoneSimple({
    onFilesSelect,
    maxFiles = 6,
    maxSize = 10 * 1024 * 1024,
    className,
}: GalleryDropzoneSimpleProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(
        (newFiles: FileList) => {
            const fileArray = Array.from(newFiles);
            const remainingSlots = maxFiles - files.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            const newFileObjects = filesToProcess
                .filter(
                    (file) =>
                        file.type.startsWith('image/') && file.size <= maxSize,
                )
                .map((file) => ({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    file,
                    preview: URL.createObjectURL(file),
                }));

            const updated = [...files, ...newFileObjects].slice(0, maxFiles);
            setFiles(updated);
            onFilesSelect?.(updated.map((f) => f.file));
        },
        [files, maxFiles, maxSize, onFilesSelect],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            if (e.dataTransfer.files.length) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles],
    );

    const handleRemove = useCallback(
        (id: string) => {
            const updated = files.filter((f) => f.id !== id);
            setFiles(updated);
            onFilesSelect?.(updated.map((f) => f.file));
        },
        [files, onFilesSelect],
    );

    const handleClearAll = useCallback(() => {
        setFiles([]);
        onFilesSelect?.([]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [onFilesSelect]);

    return (
        <div className={cn('space-y-4', className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload images"
                onClick={() =>
                    files.length < maxFiles && inputRef.current?.click()
                }
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();

                        if (files.length < maxFiles) {
inputRef.current?.click();
}
                    }
                }}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                className={cn(
                    'flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
                    isDragOver
                        ? 'border-primary bg-muted/50'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                )}
            >
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="size-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">
                        Drop images here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to {Math.round(maxSize / 1024 / 1024)}
                        MB
                    </p>
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                    if (e.target.files) {
handleFiles(e.target.files);
}
                }}
                className="sr-only"
            />

            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {files.length} of {maxFiles} images
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-muted-foreground"
                        >
                            Clear all
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                            >
                                <img
                                    src={file.preview}
                                    alt=""
                                    className="size-full object-cover"
                                />
                                <button
                                    onClick={() => handleRemove(file.id)}
                                    className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/80 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                    aria-label="Remove image"
                                >
                                    <X className="size-3" />
                                </button>
                            </div>
                        ))}
                        {files.length < maxFiles && (
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
                            >
                                <Plus className="size-5" />
                                <span className="text-xs">Add</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
