'use client';

import { ImageIcon, Upload, X, Check, Images, Trash2 } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useDragOver } from '@/hooks/use-drag-over';

interface ImageFile {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    aspectRatio: number;
}

interface GalleryDropzoneMasonryProps {
    className?: string;
    onFilesChange?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
}

export function GalleryDropzoneMasonry({
    className,
    onFilesChange,
    maxFiles = 9,
    maxSize = 10 * 1024 * 1024,
}: GalleryDropzoneMasonryProps) {
    const [images, setImages] = React.useState<ImageFile[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);

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

                    return { ...img, progress: img.progress + 15 };
                }),
            );
        }, 120);
    }, []);

    const processFiles = React.useCallback(
        (files: FileList | File[]) => {
            const fileArray = Array.from(files);
            const remainingSlots = maxFiles - images.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            filesToProcess.forEach((file) => {
                if (!file.type.startsWith('image/') || file.size > maxSize) {
                    return;
                }

                const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const reader = new FileReader();

                reader.onload = (e) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        const aspectRatio = img.width / img.height;
                        setImages((prev) => [
                            ...prev,
                            {
                                id,
                                file,
                                preview: e.target?.result as string,
                                progress: 0,
                                status: 'uploading',
                                aspectRatio,
                            },
                        ]);
                        setTimeout(() => simulateUpload(id), 50);
                    };
                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
            });
        },
        [images.length, maxFiles, maxSize, simulateUpload],
    );

    React.useEffect(() => {
        onFilesChange?.(
            images.filter((i) => i.status === 'success').map((i) => i.file),
        );
    }, [images, onFilesChange]);

    const handleDrop = React.useCallback(
        (droppedFiles: FileList) => {
            processFiles(droppedFiles);
        },
        [processFiles],
    );

    const { isDragOver, dragProps } = useDragOver({ onDrop: handleDrop });

    const handleRemove = React.useCallback((id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    }, []);

    const handleClearAll = React.useCallback(() => {
        setImages([]);
        onFilesChange?.([]);
    }, [onFilesChange]);

    const successCount = images.filter((i) => i.status === 'success').length;

    const columns: ImageFile[][] = [[], [], []];
    images.forEach((img, idx) => {
        columns[idx % 3].push(img);
    });

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Images className="size-5" />
                            Photo Gallery
                        </CardTitle>
                        <CardDescription>
                            {images.length === 0
                                ? `Upload up to ${maxFiles} images`
                                : `${successCount} of ${images.length} uploaded`}
                        </CardDescription>
                    </div>
                    {images.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="mr-1 size-3.5" />
                            Clear
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload images"
                    {...dragProps}
                    onClick={() =>
                        images.length < maxFiles && inputRef.current?.click()
                    }
                    onKeyDown={(e) =>
                        (e.key === 'Enter' || e.key === ' ') &&
                        images.length < maxFiles &&
                        inputRef.current?.click()
                    }
                    className={cn(
                        'relative min-h-[200px] rounded-lg border-2 border-dashed p-4 transition-all',
                        images.length < maxFiles && 'cursor-pointer',
                        isDragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30',
                    )}
                >
                    {images.length === 0 ? (
                        <div className="flex h-[180px] flex-col items-center justify-center gap-3">
                            <div className="rounded-full bg-muted p-4">
                                <ImageIcon className="size-8 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Drop images here</p>
                                <p className="text-sm text-muted-foreground">
                                    or click to browse
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                <Upload className="mr-2 size-4" />
                                Select Files
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            {columns.map((col, colIdx) => (
                                <div
                                    key={colIdx}
                                    className="flex flex-1 flex-col gap-3"
                                >
                                    {col.map((image) => (
                                        <div
                                            key={image.id}
                                            className="group relative overflow-hidden rounded-md border bg-muted"
                                            style={{
                                                aspectRatio: image.aspectRatio,
                                            }}
                                        >
                                            <img
                                                src={image.preview}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />

                                            {image.status === 'uploading' && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60">
                                                    <span className="mb-1 text-sm font-medium">
                                                        {Math.round(
                                                            image.progress,
                                                        )}
                                                        %
                                                    </span>
                                                    <Progress
                                                        value={image.progress}
                                                        className="h-1 w-2/3"
                                                    />
                                                </div>
                                            )}

                                            {image.status === 'success' && (
                                                <Badge className="bg-success/90 text-success-foreground absolute top-1.5 right-1.5 gap-1">
                                                    <Check className="size-3" />
                                                </Badge>
                                            )}

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemove(image.id);
                                                }}
                                                className="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
                                                aria-label="Remove"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {isDragOver && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-primary/10">
                            <div className="rounded-full bg-primary p-4">
                                <Upload className="size-8 text-primary-foreground" />
                            </div>
                        </div>
                    )}
                </div>

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
            </CardContent>
        </Card>
    );
}
