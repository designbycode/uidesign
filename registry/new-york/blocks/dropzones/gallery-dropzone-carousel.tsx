'use client';

import {
    ImageIcon,
    Upload,
    X,
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
import { useDragOver } from '@/hooks/use-drag-over';

interface ImageFile {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'uploading' | 'success' | 'error';
}

interface GalleryDropzoneCarouselProps {
    className?: string;
    onFilesChange?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
}

export function GalleryDropzoneCarousel({
    className,
    onFilesChange,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024,
}: GalleryDropzoneCarouselProps) {
    const [images, setImages] = React.useState<ImageFile[]>([]);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const simulateUpload = React.useCallback((imageId: string) => {
        const interval = setInterval(() => {
            setImages((prev) =>
                prev.map((img) => {
                    if (img.id !== imageId) {
                        return img;
                    }

                    if (img.progress >= 100) {
                        clearInterval(interval);

                        return { ...img, progress: 100, status: 'success' };
                    }

                    return { ...img, progress: img.progress + 18 };
                }),
            );
        }, 100);
    }, []);

    const processFiles = React.useCallback(
        (files: FileList | File[]) => {
            const fileArray = Array.from(files);
            const remainingSlots = maxFiles - images.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            const newImages: ImageFile[] = filesToProcess.map((file) => {
                const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                if (!file.type.startsWith('image/') || file.size > maxSize) {
                    return {
                        id,
                        file,
                        preview: '',
                        progress: 0,
                        status: 'error' as const,
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
            });

            setImages((prev) => [...prev, ...newImages]);
            newImages.forEach((img) => {
                if (img.status !== 'error') {
                    setTimeout(() => simulateUpload(img.id), 50);
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

    const handleDrop = React.useCallback(
        (droppedFiles: FileList) => {
            processFiles(droppedFiles);
        },
        [processFiles],
    );

    const { isDragOver, dragProps } = useDragOver({ onDrop: handleDrop });

    const handleRemove = React.useCallback(
        (id: string) => {
            setImages((prev) => {
                const updated = prev.filter((img) => img.id !== id);
                onFilesChange?.(
                    updated
                        .filter((i) => i.status !== 'error')
                        .map((i) => i.file),
                );

                if (activeIndex >= updated.length) {
                    setActiveIndex(Math.max(0, updated.length - 1));
                }

                return updated;
            });
        },
        [activeIndex, onFilesChange],
    );

    const activeImage = images[activeIndex];

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload images"
                {...dragProps}
                onClick={() => images.length === 0 && inputRef.current?.click()}
                onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    images.length === 0 &&
                    inputRef.current?.click()
                }
                className={cn(
                    'relative aspect-[16/10] overflow-hidden rounded-lg border-2 transition-all',
                    images.length === 0 && 'cursor-pointer border-dashed',
                    isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-border',
                )}
            >
                {images.length === 0 ? (
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

                        {activeImage.status === 'success' && (
                            <Badge className="bg-success text-success-foreground absolute top-3 right-3 gap-1">
                                <Check className="size-3.5" />
                                Uploaded
                            </Badge>
                        )}

                        <button
                            type="button"
                            onClick={() => handleRemove(activeImage.id)}
                            className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-destructive"
                            aria-label="Remove image"
                        >
                            <X className="size-4" />
                        </button>

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveIndex(
                                            (prev) =>
                                                (prev - 1 + images.length) %
                                                images.length,
                                        )
                                    }
                                    className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveIndex(
                                            (prev) =>
                                                (prev + 1) % images.length,
                                        )
                                    }
                                    className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-3 left-3 rounded-full bg-foreground/80 px-2 py-0.5 text-xs text-background">
                            {activeIndex + 1} / {images.length}
                        </div>
                    </>
                ) : null}

                {isDragOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <Upload className="size-12 text-primary" />
                    </div>
                )}
            </div>

            {images.length > 0 && (
                <ScrollArea className="w-full whitespace-nowrap">
                    <div ref={scrollRef} className="flex gap-2 pb-2">
                        {images.map((image, idx) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setActiveIndex(idx)}
                                className={cn(
                                    'relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                                    idx === activeIndex
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-transparent hover:border-muted-foreground/30',
                                )}
                            >
                                {image.preview ? (
                                    <img
                                        src={image.preview}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                        <ImageIcon className="size-5 text-muted-foreground" />
                                    </div>
                                )}
                                {image.status === 'uploading' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                                        <Progress
                                            value={image.progress}
                                            className="h-1 w-10"
                                        />
                                    </div>
                                )}
                            </button>
                        ))}

                        {images.length < maxFiles && (
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="flex size-16 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
                                aria-label="Add more images"
                            >
                                <Plus className="size-5 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                    if (e.target.files) {
                        processFiles(e.target.files);
                    }
                }}
                className="sr-only"
            />
        </div>
    );
}
