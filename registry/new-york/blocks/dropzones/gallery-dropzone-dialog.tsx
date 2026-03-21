'use client';

import { ImageIcon, Upload, X, Check, Plus, Images } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useImageDropzone } from '@/hooks/use-image-dropzone';
import { useUploadProgress } from '@/hooks/use-upload-progress';

interface ImageFileWithProgress {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'ready' | 'uploading' | 'success' | 'error';
}

interface GalleryDropzoneDialogProps {
    className?: string;
    onFilesChange?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
}

export function GalleryDropzoneDialog({
    className,
    onFilesChange,
    maxFiles = 12,
    maxSize = 10 * 1024 * 1024,
}: GalleryDropzoneDialogProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [images, setImages] = React.useState<ImageFileWithProgress[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const { simulateUpload, cancelAll } = useUploadProgress({});

    const { isDragOver, dragProps } = useImageDropzone({
        maxFiles,
        maxSize,
        onFilesChange,
    });

    const processFiles = React.useCallback(
        (files: FileList | File[]) => {
            const fileArray = Array.from(files);
            const remainingSlots = maxFiles - images.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            const newImages: ImageFileWithProgress[] = filesToProcess.map(
                (file) => {
                    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                    if (
                        !file.type.startsWith('image/') ||
                        file.size > maxSize
                    ) {
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

                                    const newProgress =
                                        image.progress >= 100
                                            ? 100
                                            : image.progress;

                                    if (newProgress >= 100) {
                                        return {
                                            ...image,
                                            progress: 100,
                                            status: 'success',
                                        };
                                    }

                                    return setProgress(newProgress);
                                }),
                            );
                        });
                    }, 50);
                }
            });
        },
        [images.length, maxFiles, maxSize, simulateUpload],
    );

    const handleRemove = React.useCallback((id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    }, []);

    const handleSave = () => {
        onFilesChange?.(
            images.filter((i) => i.status === 'success').map((i) => i.file),
        );
        cancelAll();
        setIsOpen(false);
    };

    const successCount = images.filter((i) => i.status === 'success').length;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);

                if (!open) {
                    cancelAll();
                    setImages([]);
                }
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" className={cn('gap-2', className)}>
                    <Images className="size-4" />
                    Upload Gallery
                    {successCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {successCount}
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Upload Images</DialogTitle>
                    <DialogDescription>
                        Add up to {maxFiles} images to your gallery. Max{' '}
                        {Math.round(maxSize / 1024 / 1024)}MB per file.
                    </DialogDescription>
                </DialogHeader>

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
                        'relative min-h-[300px] rounded-lg border-2 border-dashed p-4 transition-all',
                        images.length < maxFiles && 'cursor-pointer',
                        isDragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/40',
                    )}
                >
                    {images.length === 0 ? (
                        <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-4">
                            <div className="rounded-full bg-muted p-5">
                                <Upload className="size-10 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">
                                    Drag & drop your images here
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    or click anywhere to browse
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {images.map((image) => (
                                <div
                                    key={image.id}
                                    className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                                >
                                    {image.preview ? (
                                        <img
                                            src={image.preview}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <ImageIcon className="size-8 text-muted-foreground" />
                                        </div>
                                    )}

                                    {image.status === 'uploading' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70">
                                            <span className="mb-1 text-sm font-medium">
                                                {Math.round(image.progress)}%
                                            </span>
                                            <Progress
                                                value={image.progress}
                                                className="h-1.5 w-3/4"
                                            />
                                        </div>
                                    )}

                                    {image.status === 'success' && (
                                        <div className="bg-success absolute top-1.5 right-1.5 rounded-full p-1">
                                            <Check className="text-success-foreground size-3" />
                                        </div>
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

                            {images.length < maxFiles && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        inputRef.current?.click();
                                    }}
                                    className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-primary/50"
                                    aria-label="Add more"
                                >
                                    <Plus className="size-8 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                    )}

                    {isDragOver && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-primary/20">
                            <Upload className="size-12 text-primary" />
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

                <DialogFooter className="gap-2 sm:gap-0">
                    <div className="mr-auto text-sm text-muted-foreground">
                        {images.length} of {maxFiles} images
                    </div>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={successCount === 0}>
                        Save {successCount > 0 && `(${successCount})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
