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
import type { FileItem } from './multi-image-drop';

const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface DialogDropzoneProps {
    onFiles: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    files: FileItem[];
    onFilesChange: (files: FileItem[]) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
    triggerLabel?: string;
    className?: string;
}

export function DialogDropzone({
    onFiles,
    maxFiles = 12,
    maxSize = 10 * 1024 * 1024,
    files,
    onFilesChange,
    open: controlledOpen,
    onOpenChange,
    trigger,
    triggerLabel = 'Upload Gallery',
    className,
}: DialogDropzoneProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    const simulateUpload = React.useCallback(
        (id: string) => {
            const interval = setInterval(() => {
                onFilesChange(
                    files.map((f) => {
                        if (f.id !== id || f.progress === undefined) {
return f;
}

                        const newProgress = f.progress + Math.random() * 20 + 5;

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

    const handleRemove = React.useCallback(
        (id: string) => {
            const updated = files.filter((f) => f.id !== id);
            onFilesChange(updated);
            onFiles(updated.map((f) => f.file));
        },
        [files, onFiles, onFilesChange],
    );

    const handleClearAll = React.useCallback(() => {
        files.forEach((f) => {
            if (f.preview.startsWith('blob:')) {
                URL.revokeObjectURL(f.preview);
            }
        });
        onFilesChange([]);
        onFiles([]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [files, onFiles, onFilesChange]);

    const handleSave = React.useCallback(() => {
        onFiles(
            files.filter((f) => f.status === 'complete').map((f) => f.file),
        );
        handleClearAll();
        setIsOpen(false);
    }, [files, onFiles, onFilesChange, handleClearAll, setIsOpen]);

    const handleOpenChange = React.useCallback(
        (open: boolean) => {
            setIsOpen(open);

            if (!open) {
                handleClearAll();
            }
        },
        [handleClearAll, setIsOpen],
    );

    const successCount = files.filter((f) => f.status === 'complete').length;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        className={cn('gap-2', className)}
                    >
                        <Images className="size-4" />
                        {triggerLabel}
                        {successCount > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {successCount}
                            </Badge>
                        )}
                    </Button>
                )}
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
                    onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                    }}
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
                                    {file.preview ? (
                                        <img
                                            src={file.preview}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <ImageIcon className="size-8 text-muted-foreground" />
                                        </div>
                                    )}

                                    {file.status === 'uploading' &&
                                        file.progress !== undefined && (
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
processFiles(e.target.files);
}
                    }}
                />

                <DialogFooter className="gap-2 sm:gap-0">
                    <div className="mr-auto text-sm text-muted-foreground">
                        {files.length} of {maxFiles} images
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
