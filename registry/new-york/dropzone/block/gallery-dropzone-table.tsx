'use client';

import { Upload, X, Check, FileWarning } from 'lucide-react';
import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface FileWithStatus {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'uploading' | 'complete' | 'error';
}

interface GalleryDropzoneTableProps {
    onFilesSelect?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
}

export function GalleryDropzoneTable({
    onFilesSelect,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024,
    className,
}: GalleryDropzoneTableProps) {
    const [files, setFiles] = useState<FileWithStatus[]>([]);
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

                            const newProgress = f.progress + Math.random() * 30;

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
                }, 200);
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

    const formatSize = (bytes: number) => {
        if (bytes < 1024) {
return `${bytes} B`;
}

        if (bytes < 1024 * 1024) {
return `${(bytes / 1024).toFixed(1)} KB`;
}

        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div
                className={cn(
                    'flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed p-4 transition-colors',
                    isDragOver
                        ? 'border-primary bg-muted/50'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                )}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                tabIndex={0}
                role="button"
                aria-label="Upload images"
            >
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

                <Upload className="size-5 text-muted-foreground" />
                <span className="text-sm">
                    Drop files here or click to browse
                </span>
            </div>

            {files.length > 0 && (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-24">Size</TableHead>
                                <TableHead className="w-32">Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((file) => (
                                <TableRow key={file.id}>
                                    <TableCell>
                                        <div className="size-10 overflow-hidden rounded border bg-muted">
                                            <img
                                                src={file.preview}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <span className="line-clamp-1">
                                            {file.file.name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatSize(file.file.size)}
                                    </TableCell>
                                    <TableCell>
                                        {file.status === 'uploading' ? (
                                            <div className="flex items-center gap-2">
                                                <Progress
                                                    value={file.progress}
                                                    className="h-2 w-16"
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {Math.round(file.progress)}%
                                                </span>
                                            </div>
                                        ) : file.status === 'complete' ? (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Check className="size-4" />{' '}
                                                Complete
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-sm text-destructive">
                                                <FileWarning className="size-4" />{' '}
                                                Error
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            onClick={() =>
                                                handleRemove(file.id)
                                            }
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
