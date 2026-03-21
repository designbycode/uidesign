'use client';

import { ImageIcon, Upload, X, Check, FileWarning, Trash2 } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUploadProgress } from '@/hooks/use-upload-progress';

interface ImageFileWithProgress {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'ready' | 'uploading' | 'success' | 'error';
    error?: string;
}

interface GalleryDropzoneListProps {
    className?: string;
    onFilesChange?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
}

export function GalleryDropzoneList({
    className,
    onFilesChange,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024,
}: GalleryDropzoneListProps) {
    const [images, setImages] = React.useState<ImageFileWithProgress[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const { simulateUpload, cancelAll } = useUploadProgress({});

    const addFiles = React.useCallback(
        (files: FileList | File[]) => {
            const fileArray = Array.from(files);
            const remainingSlots = maxFiles - images.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            const newImages: ImageFileWithProgress[] = filesToProcess.map(
                (file) => {
                    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                    if (!file.type.startsWith('image/')) {
                        return {
                            id,
                            file,
                            preview: '',
                            progress: 0,
                            status: 'error' as const,
                            error: 'Not an image',
                        };
                    }

                    if (file.size > maxSize) {
                        return {
                            id,
                            file,
                            preview: '',
                            progress: 0,
                            status: 'error' as const,
                            error: 'File too large',
                        };
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setImages((prev) =>
                            prev.map((img) =>
                                img.id === id
                                    ? {
                                          ...img,
                                          preview: e.target?.result as string,
                                      }
                                    : img,
                            ),
                        );
                    };
                    reader.readAsDataURL(file);

                    return {
                        id,
                        file,
                        preview: '',
                        progress: 0,
                        status: 'uploading' as const,
                    };
                },
            );

            setImages((prev) => [...prev, ...newImages]);
            newImages.forEach((img) => {
                if (img.status !== 'error') {
                    setTimeout(() => {
                        simulateUpload(img.id, (setProgress) => {
                            setImages((prev) =>
                                prev.map((image) => {
                                    if (image.id !== img.id) {
                                        return image;
                                    }

                                    return setProgress(
                                        image.progress >= 100
                                            ? 100
                                            : image.progress,
                                    );
                                }),
                            );
                        });
                    }, 50);
                }
            });

            onFilesChange?.(
                [...images, ...newImages]
                    .filter((i) => i.status !== 'error')
                    .map((i) => i.file),
            );
        },
        [images, maxFiles, maxSize, onFilesChange, simulateUpload],
    );

    const handleRemove = React.useCallback(
        (id: string) => {
            setImages((prev) => {
                const updated = prev.filter((img) => img.id !== id);
                onFilesChange?.(
                    updated
                        .filter((i) => i.status !== 'error')
                        .map((i) => i.file),
                );

                return updated;
            });
        },
        [onFilesChange],
    );

    const clearAll = React.useCallback(() => {
        cancelAll();
        setImages([]);
        onFilesChange?.([]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [cancelAll, onFilesChange]);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) {
            return bytes + ' B';
        }

        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        }

        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-4 rounded-lg border border-border p-4',
                className,
            )}
        >
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload images"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    inputRef.current?.click()
                }
                className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-6 transition-colors',
                    'border-muted hover:border-muted-foreground/50',
                )}
            >
                <div className="rounded-full bg-muted p-3">
                    <Upload className="size-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">
                        Drop files here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Max {maxFiles} files,{' '}
                        {Math.round(maxSize / 1024 / 1024)}MB each
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
                        addFiles(e.target.files);
                    }
                }}
                className="sr-only"
            />

            {images.length > 0 && (
                <>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            {images.length} file{images.length > 1 ? 's' : ''}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAll}
                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="mr-1 size-3" />
                            Clear all
                        </Button>
                    </div>

                    <ScrollArea className="max-h-[240px]">
                        <div className="space-y-2">
                            {images.map((image, idx) => (
                                <React.Fragment key={image.id}>
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted">
                                            {image.preview ? (
                                                <img
                                                    src={image.preview}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <ImageIcon className="size-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate text-sm">
                                                    {image.file.name}
                                                </span>
                                                {image.status === 'success' && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-success shrink-0 gap-0.5 px-1.5 py-0 text-xs"
                                                    >
                                                        <Check className="size-3" />{' '}
                                                        Done
                                                    </Badge>
                                                )}
                                                {image.status === 'error' && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="shrink-0 gap-0.5 px-1.5 py-0 text-xs"
                                                    >
                                                        <FileWarning className="size-3" />{' '}
                                                        {image.error}
                                                    </Badge>
                                                )}
                                            </div>
                                            {image.status === 'uploading' ? (
                                                <Progress
                                                    value={Math.min(
                                                        image.progress,
                                                        100,
                                                    )}
                                                    className="h-1"
                                                />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    {formatSize(
                                                        image.file.size,
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRemove(image.id)
                                            }
                                            className="size-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                    {idx < images.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                    </ScrollArea>
                </>
            )}
        </div>
    );
}
