'use client';

import { ImageIcon, Upload, X, Check, FileWarning, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FileWithStatus {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'uploading' | 'complete' | 'error';
    error?: string;
}

interface GalleryDropzoneListProps {
    onFilesSelect?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
}

export function GalleryDropzoneList({
    onFilesSelect,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024,
    className,
}: GalleryDropzoneListProps) {
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(
        (newFiles: FileList) => {
            const fileArray = Array.from(newFiles);
            const remainingSlots = maxFiles - files.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            const newFileObjects = filesToProcess
                .filter((file) => {
                    if (!file.type.startsWith('image/')) {
return false;
}

                    if (file.size > maxSize) {
return false;
}

                    return true;
                })
                .map((file) => ({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    file,
                    preview: URL.createObjectURL(file),
                    progress: 0,
                    status: 'uploading' as const,
                }));

            const updated = [...files, ...newFileObjects].slice(0, maxFiles);
            setFiles(updated);

            newFileObjects.forEach((fileObj) => {
                const interval = setInterval(() => {
                    setFiles((prev) =>
                        prev.map((f) => {
                            if (f.id !== fileObj.id) {
return f;
}

                            const newProgress =
                                f.progress + Math.random() * 20 + 5;

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
            });

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
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-6 transition-colors',
                    isDragOver
                        ? 'border-primary bg-muted/50'
                        : 'border-muted hover:border-muted-foreground/50',
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
handleFiles(e.target.files);
}
                }}
                className="sr-only"
            />

            {files.length > 0 && (
                <>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            {files.length} file{files.length > 1 ? 's' : ''}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="mr-1 size-3" />
                            Clear all
                        </Button>
                    </div>

                    <ScrollArea className="max-h-[240px]">
                        <div className="space-y-2">
                            {files.map((file, idx) => (
                                <React.Fragment key={file.id}>
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted">
                                            {file.preview ? (
                                                <img
                                                    src={file.preview}
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
                                                    {file.file.name}
                                                </span>
                                                {file.status === 'complete' && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-success shrink-0 gap-0.5 px-1.5 py-0 text-xs"
                                                    >
                                                        <Check className="size-3" />{' '}
                                                        Done
                                                    </Badge>
                                                )}
                                                {file.status === 'error' && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="shrink-0 gap-0.5 px-1.5 py-0 text-xs"
                                                    >
                                                        <FileWarning className="size-3" />{' '}
                                                        {file.error || 'Error'}
                                                    </Badge>
                                                )}
                                            </div>
                                            {file.status === 'uploading' ? (
                                                <Progress
                                                    value={file.progress}
                                                    className="h-1"
                                                />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    {formatSize(file.file.size)}
                                                </span>
                                            )}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRemove(file.id)
                                            }
                                            className="size-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                    {idx < files.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                    </ScrollArea>
                </>
            )}
        </div>
    );
}
