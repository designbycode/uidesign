'use client';

import { ImageIcon, Upload, X, Check, Images, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
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

interface FileWithPreview {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'uploading' | 'complete';
    aspectRatio: number;
}

interface GalleryDropzoneMasonryProps {
    onFilesSelect?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
}

export function GalleryDropzoneMasonry({
    onFilesSelect,
    maxFiles = 9,
    maxSize = 10 * 1024 * 1024,
    className,
}: GalleryDropzoneMasonryProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(
        (newFiles: FileList) => {
            const fileArray = Array.from(newFiles);
            const remainingSlots = maxFiles - files.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            filesToProcess.forEach((file) => {
                if (!file.type.startsWith('image/') || file.size > maxSize) {
                    return;
                }

                const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
                const reader = new FileReader();

                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const aspectRatio = img.width / img.height;
                        setFiles((prev) => [
                            ...prev,
                            {
                                id,
                                file,
                                preview: e.target?.result as string,
                                progress: 0,
                                status: 'uploading' as const,
                                aspectRatio,
                            },
                        ]);
                    };
                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
            });
        },
        [files.length, maxFiles, maxSize],
    );

    React.useEffect(() => {
        const uploadFiles = files.filter((f) => f.status === 'uploading');

        if (uploadFiles.length === 0) {
return;
}

        uploadFiles.forEach((file) => {
            const interval = setInterval(() => {
                setFiles((prev) =>
                    prev.map((f) => {
                        if (f.id !== file.id) {
return f;
}

                        const newProgress = f.progress + Math.random() * 15 + 5;

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
            }, 120);
        });

        return () => {
            uploadFiles.forEach(() => {});
        };
    }, [files.length]);

    React.useEffect(() => {
        onFilesSelect?.(
            files.filter((i) => i.status === 'complete').map((i) => i.file),
        );
    }, [files, onFilesSelect]);

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

    const handleRemove = useCallback((id: string) => {
        setFiles((prev) => prev.filter((img) => img.id !== id));
    }, []);

    const handleClearAll = useCallback(() => {
        setFiles([]);
        onFilesSelect?.([]);
    }, [onFilesSelect]);

    const successCount = files.filter((i) => i.status === 'complete').length;

    const columns: FileWithPreview[][] = [[], [], []];
    files.forEach((img, idx) => {
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
                            {files.length === 0
                                ? `Upload up to ${maxFiles} images`
                                : `${successCount} of ${files.length} uploaded`}
                        </CardDescription>
                    </div>
                    {files.length > 0 && (
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
                    onClick={() =>
                        files.length < maxFiles && inputRef.current?.click()
                    }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
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
                        'relative min-h-[200px] rounded-lg border-2 border-dashed p-4 transition-all',
                        files.length < maxFiles && 'cursor-pointer',
                        isDragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30',
                    )}
                >
                    {files.length === 0 ? (
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
                                    {col.map((file) => (
                                        <div
                                            key={file.id}
                                            className="group relative overflow-hidden rounded-md border bg-muted"
                                            style={{
                                                aspectRatio:
                                                    file.aspectRatio.toString(),
                                            }}
                                        >
                                            <img
                                                src={file.preview}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />

                                            {file.status === 'uploading' && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60">
                                                    <span className="mb-1 text-sm font-medium">
                                                        {Math.round(
                                                            file.progress,
                                                        )}
                                                        %
                                                    </span>
                                                    <Progress
                                                        value={file.progress}
                                                        className="h-1 w-2/3"
                                                    />
                                                </div>
                                            )}

                                            {file.status === 'complete' && (
                                                <Badge className="bg-success/90 text-success-foreground absolute top-1.5 right-1.5 gap-1">
                                                    <Check className="size-3" />
                                                </Badge>
                                            )}

                                            <button
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
                                </div>
                            ))}
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
handleFiles(e.target.files);
}
                    }}
                    className="sr-only"
                />
            </CardContent>
        </Card>
    );
}
