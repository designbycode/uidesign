'use client';

import {
    ImageIcon,
    Upload,
    Check,
    ChevronLeft,
    ChevronRight,
    Plus,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { FileItem } from './multi-image-drop';

const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface CarouselDropzoneProps {
    onFiles: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    files: FileItem[];
    onFilesChange: (files: FileItem[]) => void;
    activeIndex?: number;
    onActiveIndexChange?: (index: number) => void;
    className?: string;
}

export function CarouselDropzone({
    onFiles,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024,
    files,
    onFilesChange,
    activeIndex: controlledActiveIndex,
    onActiveIndexChange,
    className,
}: CarouselDropzoneProps) {
    const [internalActiveIndex, setInternalActiveIndex] = React.useState(0);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const activeIndex =
        controlledActiveIndex !== undefined
            ? controlledActiveIndex
            : internalActiveIndex;

    const setActiveIndex = React.useCallback(
        (value: number | ((prev: number) => number)) => {
            if (typeof value === 'function') {
                if (onActiveIndexChange) {
                    onActiveIndexChange(value(internalActiveIndex));
                } else {
                    setInternalActiveIndex(value);
                }
            } else {
                if (onActiveIndexChange) {
                    onActiveIndexChange(value);
                } else {
                    setInternalActiveIndex(value);
                }
            }
        },
        [onActiveIndexChange, internalActiveIndex],
    );

    const simulateUpload = React.useCallback(
        (id: string) => {
            const interval = setInterval(() => {
                onFilesChange(
                    files.map((f) => {
                        if (f.id !== id || f.progress === undefined) {
                            return f;
                        }

                        const newProgress = f.progress + Math.random() * 18 + 5;

                        if (newProgress >= 100) {
                            clearInterval(interval);

                            return {
                                ...f,
                                progress: 100,
                                status: 'complete' as const,
                            };
                        }

                        return { ...f, progress: newProgress };
                    }),
                );
            }, 100);
        },
        [files, onFilesChange],
    );

    const processFiles = React.useCallback(
        (newFiles: FileList | File[]) => {
            const fileArray = Array.from(newFiles);
            const remainingSlots = maxFiles - files.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            const newFileItems: FileItem[] = filesToProcess
                .filter(
                    (file) =>
                        file.type.startsWith('image/') && file.size <= maxSize,
                )
                .map((file) => ({
                    id: generateId(),
                    file,
                    preview: URL.createObjectURL(file),
                    status: 'uploading' as const,
                    progress: 0,
                }));

            const allFiles = [...files, ...newFileItems].slice(0, maxFiles);
            onFilesChange(allFiles);

            newFileItems.forEach((f) => {
                setTimeout(() => simulateUpload(f.id), 50);
            });

            onFiles(allFiles.map((f) => f.file));
        },
        [files, maxFiles, maxSize, onFiles, onFilesChange, simulateUpload],
    );

    const handleDrop = React.useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            if (e.dataTransfer.files.length > 0) {
                processFiles(e.dataTransfer.files);
            }
        },
        [processFiles],
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
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                }}
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
                        {activeImage.preview ? (
                            <img
                                src={activeImage.preview}
                                alt=""
                                className="h-full w-full bg-muted object-contain"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                <ImageIcon className="size-12 text-muted-foreground" />
                            </div>
                        )}

                        {activeImage.status === 'uploading' &&
                            activeImage.progress !== undefined && (
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

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const newIndex =
                                    (activeIndex - 1 + files.length) %
                                    files.length;
                                setActiveIndex(newIndex);
                            }}
                            className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const newIndex =
                                    (activeIndex + 1) % files.length;
                                setActiveIndex(newIndex);
                            }}
                            className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground"
                            aria-label="Next image"
                        >
                            <ChevronRight className="size-5" />
                        </button>

                        {files.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newIndex =
                                            (activeIndex - 1 + files.length) %
                                            files.length;
                                        setActiveIndex(newIndex);
                                    }}
                                    className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newIndex =
                                            (activeIndex + 1) % files.length;
                                        setActiveIndex(newIndex);
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
                        processFiles(e.target.files);
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
                                {file.status === 'uploading' &&
                                    file.progress !== undefined && (
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
