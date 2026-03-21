'use client';

import type { File } from 'lucide-react';
import { Upload, X, Check } from 'lucide-react';
import * as React from 'react';
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
import { useDragOver } from '@/hooks/use-drag-over';

interface FileWithProgress {
    file: File;
    preview: string;
    id: string;
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
    const [files, setFiles] = React.useState<FileWithProgress[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFiles = React.useCallback(
        (newFiles: FileList) => {
            const validFiles = Array.from(newFiles)
                .filter(
                    (file) =>
                        file.type.startsWith('image/') && file.size <= maxSize,
                )
                .slice(0, maxFiles - files.length);

            const newFileObjects = validFiles.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                progress: 0,
                status: 'uploading' as const,
            }));

            const updated = [...files, ...newFileObjects].slice(0, maxFiles);
            setFiles(updated);

            newFileObjects.forEach((fileObj) => {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 30;

                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === fileObj.id
                                    ? {
                                          ...f,
                                          progress: 100,
                                          status: 'complete',
                                      }
                                    : f,
                            ),
                        );
                    } else {
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === fileObj.id ? { ...f, progress } : f,
                            ),
                        );
                    }
                }, 200);
            });

            onFilesSelect?.(updated.map((f) => f.file));
        },
        [files, maxFiles, maxSize, onFilesSelect],
    );

    const handleDrop = React.useCallback(
        (droppedFiles: FileList) => {
            handleFiles(droppedFiles);
        },
        [handleFiles],
    );

    const { isDragOver, dragProps } = useDragOver({ onDrop: handleDrop });

    const removeFile = React.useCallback(
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
                {...dragProps}
                onClick={() => inputRef.current?.click()}
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
                                        ) : (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Check className="size-4" />
                                                Complete
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => removeFile(file.id)}
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
