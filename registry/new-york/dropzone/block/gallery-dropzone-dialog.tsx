'use client';

import { Upload, X, Check, Plus, Images } from 'lucide-react';
import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
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

interface FileWithStatus {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'uploading' | 'complete';
}

interface GalleryDropzoneDialogProps {
    onFilesSelect?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
}

export function GalleryDropzoneDialog({
    onFilesSelect,
    maxFiles = 12,
    maxSize = 10 * 1024 * 1024,
    className,
}: GalleryDropzoneDialogProps) {
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [isOpen, setIsOpen] = useState(false);
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
                            file.progress + Math.random() * 20 + 5;

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
            onFilesSelect?.(
                updated
                    .filter((f) => f.status === 'complete')
                    .map((f) => f.file),
            );
        },
        [files, onFilesSelect, clearFileInterval],
    );

    const handleClearAll = useCallback(() => {
        intervalsRef.current.forEach((interval) => clearInterval(interval));
        intervalsRef.current.clear();
        files.forEach((f) => {
            if (f.preview.startsWith('blob:')) {
                URL.revokeObjectURL(f.preview);
            }
        });
        setFiles([]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [files]);

    const handleSave = useCallback(() => {
        const completedFiles = files
            .filter((f) => f.status === 'complete')
            .map((f) => f.file);
        onFilesSelect?.(completedFiles);
        handleClearAll();
        setIsOpen(false);
    }, [files, onFilesSelect, handleClearAll]);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open);

            if (!open) {
                handleClearAll();
            }
        },
        [handleClearAll],
    );

    const successCount = files.filter((f) => f.status === 'complete').length;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
                        'relative min-h-[300px] rounded-lg border-2 border-dashed p-4 transition-all',
                        files.length < maxFiles && 'cursor-pointer',
                        isDragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/40',
                    )}
                >
                    {files.length === 0 ? (
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
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                                >
                                    <img
                                        src={file.preview}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />

                                    {file.status === 'uploading' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70">
                                            <span className="mb-1 text-sm font-medium">
                                                {Math.round(file.progress)}%
                                            </span>
                                            <Progress
                                                value={file.progress}
                                                className="h-1.5 w-3/4"
                                            />
                                        </div>
                                    )}

                                    {file.status === 'complete' && (
                                        <div className="bg-success absolute top-1.5 right-1.5 rounded-full p-1">
                                            <Check className="text-success-foreground size-3" />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(file.id);
                                        }}
                                        className="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
                                        aria-label="Remove"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            ))}

                            {files.length < maxFiles && (
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

                    {isDragOver && files.length > 0 && (
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
                    className="sr-only"
                    onChange={(e) => {
                        if (e.target.files) {
handleFiles(e.target.files);
}
                    }}
                />

                <DialogFooter className="gap-2 sm:gap-0">
                    <div className="mr-auto text-sm text-muted-foreground">
                        {files.length} of {maxFiles} images
                        {successCount > 0 && ` (${successCount} done)`}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                    >
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
