'use client';

import { Plus, X, Loader2 } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FileWithStatus {
    file: File;
    preview: string;
    id: string;
    status: 'uploading' | 'complete';
}

interface GalleryDropzonePillsProps {
    onFilesSelect?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
}

export function GalleryDropzonePills({
    onFilesSelect,
    maxFiles = 8,
    maxSize = 10 * 1024 * 1024,
    className,
}: GalleryDropzonePillsProps) {
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(
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
                id: Math.random().toString(36).slice(2),
                status: 'uploading' as const,
            }));

            const updated = [...files, ...newFileObjects].slice(0, maxFiles);
            setFiles(updated);

            // Simulate upload
            newFileObjects.forEach((fileObj) => {
                setTimeout(
                    () => {
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === fileObj.id
                                    ? { ...f, status: 'complete' }
                                    : f,
                            ),
                        );
                    },
                    800 + Math.random() * 800,
                );
            });

            onFilesSelect?.(updated.map((f) => f.file));
        },
        [files, maxFiles, maxSize, onFilesSelect],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            if (e.dataTransfer.files.length) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles],
    );

    const removeFile = (id: string) => {
        const updated = files.filter((f) => f.id !== id);
        setFiles(updated);
        onFilesSelect?.(updated.map((f) => f.file));
    };

    return (
        <div
            className={cn(
                'flex min-h-[48px] flex-wrap items-center gap-2 rounded-lg border p-3 transition-colors',
                isDragging && 'border-primary bg-muted/50',
                className,
            )}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="sr-only"
            />

            {files.map((file) => (
                <Badge
                    key={file.id}
                    variant="secondary"
                    className="h-8 gap-2 pr-1 pl-1"
                >
                    <div className="size-6 overflow-hidden rounded">
                        <img
                            src={file.preview}
                            alt=""
                            className="size-full object-cover"
                        />
                    </div>
                    <span className="max-w-[100px] truncate text-xs">
                        {file.file.name}
                    </span>
                    {file.status === 'uploading' ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : (
                        <button
                            onClick={() => removeFile(file.id)}
                            className="flex size-4 items-center justify-center rounded-full hover:bg-muted"
                            aria-label="Remove"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                </Badge>
            ))}

            {files.length < maxFiles && (
                <button
                    onClick={() => inputRef.current?.click()}
                    className="flex h-8 items-center gap-1 rounded-md border border-dashed px-3 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                    <Plus className="size-4" />
                    Add images
                </button>
            )}

            {files.length === 0 && (
                <span className="text-sm text-muted-foreground">
                    Drop images here or click to add
                </span>
            )}
        </div>
    );
}
