'use client';

import {
    ImageIcon,
    Upload,
    Check,
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
} from 'lucide-react';
import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FileWithStatus {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'uploading' | 'complete';
}

interface GalleryDropzoneCarouselProps {
    onFilesSelect?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
}

export function GalleryDropzoneCarousel({
    onFilesSelect,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024,
    className,
}: GalleryDropzoneCarouselProps) {
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    useEffect(() => {
        return () => {
            intervalsRef.current.forEach((interval) => clearInterval(interval));
        };
    }, []);

    const clearFileInterval = useCallback((id: string) => {
        const interval = intervalsRef.current.get(id);

        if (interval) {
            clearInterval(interval);
            intervalsRef.current.delete(id);
        }
    }, []);

    const handleFiles = useCallback(
        (newFiles: FileList) => {
            const fileArray = Array.from(newFiles);
            const currentFileCount = files.length;
            const remainingSlots = maxFiles - currentFileCount;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            const newFileObjects: FileWithStatus[] = filesToProcess
                .filter(
                    (file) =>
                        file.type.startsWith('image/') && file.size <= maxSize,
                )
                .map((file) => ({
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`,
                    file,
                    preview: URL.createObjectURL(file),
                    progress: 0,
                    status: 'uploading' as const,
                }));

            if (newFileObjects.length === 0) {
return;
}

            const updated = [...files, ...newFileObjects].slice(0, maxFiles);
            setFiles(updated);
            setActiveIndex(0);

            newFileObjects.forEach((fileObj) => {
                const intervalId = setInterval(() => {
                    setFiles((prev) => {
                        const fileIndex = prev.findIndex(
                            (f) => f.id === fileObj.id,
                        );

                        if (fileIndex === -1) {
                            clearFileInterval(fileObj.id);

                            return prev;
                        }

                        const file = prev[fileIndex];

                        if (file.status === 'complete') {
                            clearFileInterval(fileObj.id);

                            return prev;
                        }

                        const newProgress =
                            file.progress + Math.random() * 18 + 5;

                        if (newProgress >= 100) {
                            clearFileInterval(fileObj.id);

                            return prev.map((f, idx) =>
                                idx === fileIndex
                                    ? {
                                          ...f,
                                          progress: 100,
                                          status: 'complete' as const,
                                      }
                                    : f,
                            );
                        }

                        return prev.map((f, idx) =>
                            idx === fileIndex
                                ? { ...f, progress: newProgress }
                                : f,
                        );
                    });
                }, 100);

                intervalsRef.current.set(fileObj.id, intervalId);
            });

            onFilesSelect?.(updated.map((f) => f.file));
        },
        [files, maxFiles, maxSize, onFilesSelect, clearFileInterval],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            if (e.dataTransfer.files.length) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles],
    );

    const handleRemove = useCallback(
        (id: string) => {
            clearFileInterval(id);
            const updated = files.filter((f) => f.id !== id);
            setFiles(updated);
            onFilesSelect?.(updated.map((f) => f.file));

            if (activeIndex >= updated.length) {
                setActiveIndex(Math.max(0, updated.length - 1));
            }
        },
        [files, activeIndex, onFilesSelect, clearFileInterval],
    );

    const activeImage = files[activeIndex];

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload images"
                onClick={() => files.length === 0 && inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();

                        if (files.length === 0) {
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
                    'relative aspect-[16/10] overflow-hidden rounded-lg border-2 transition-all',
                    files.length === 0 && 'cursor-pointer border-dashed',
                    isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-border',
                )}
            >
                {files.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3">
                        <div className="rounded-full bg-muted p-4">
                            <ImageIcon className="size-10 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium">
                                Add photos to your gallery
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Drag & drop or click to upload
                            </p>
                        </div>
                        <Button variant="outline">
                            <Upload className="mr-2 size-4" />
                            Browse Files
                        </Button>
                    </div>
                ) : activeImage ? (
                    <>
                        <img
                            src={activeImage.preview}
                            alt=""
                            className="h-full w-full bg-muted object-contain"
                        />

                        {activeImage.status === 'uploading' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70">
                                <span className="mb-2 text-lg font-bold">
                                    {Math.round(activeImage.progress)}%
                                </span>
                                <Progress
                                    value={activeImage.progress}
                                    className="h-2 w-1/2"
                                />
                            </div>
                        )}

                        {activeImage.status === 'complete' && (
                            <Badge className="bg-success text-success-foreground absolute top-3 right-3 gap-1">
                                <Check className="size-3.5" />
                                Uploaded
                            </Badge>
                        )}

                        {files.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveIndex(
                                            (prev) =>
                                                (prev - 1 + files.length) %
                                                files.length,
                                        );
                                    }}
                                    className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveIndex(
                                            (prev) => (prev + 1) % files.length,
                                        );
                                    }}
                                    className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-3 left-3 rounded-full bg-foreground/80 px-2 py-0.5 text-xs text-background">
                            {activeIndex + 1} / {files.length}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(activeImage.id);
                            }}
                            className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
                            aria-label="Remove current image"
                        >
                            <X className="size-4" />
                        </button>
                    </>
                ) : null}

                {isDragOver && files.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <Upload className="size-12 text-primary" />
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files) {
handleFiles(e.target.files);
}
                }}
            />

            {files.length > 0 && (
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex gap-2 pb-2">
                        {files.map((file, idx) => (
                            <button
                                key={file.id}
                                type="button"
                                onClick={() => setActiveIndex(idx)}
                                className={cn(
                                    'relative shrink-0 overflow-hidden rounded-md border-2 transition-all',
                                    idx === activeIndex
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-transparent hover:border-muted-foreground/30',
                                )}
                                style={{ width: 64, height: 64 }}
                            >
                                <img
                                    src={file.preview}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                                {file.status === 'uploading' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                                        <span className="text-xs font-medium">
                                            {Math.round(file.progress)}%
                                        </span>
                                    </div>
                                )}
                            </button>
                        ))}

                        {files.length < maxFiles && (
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="flex shrink-0 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
                                style={{ width: 64, height: 64 }}
                                aria-label="Add more images"
                            >
                                <Plus className="size-5 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            )}
        </div>
    );
}
