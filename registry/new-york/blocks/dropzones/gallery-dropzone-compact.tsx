'use client';

import { Plus, X, Check } from 'lucide-react';
import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FileWithPreview {
    id: string;
    file: File;
    preview: string;
    status: 'uploading' | 'complete';
}

interface GalleryDropzoneCompactProps {
    onFilesSelect?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
}

export function GalleryDropzoneCompact({
    onFilesSelect,
    maxFiles = 6,
    maxSize = 10 * 1024 * 1024,
    className,
}: GalleryDropzoneCompactProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
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
                    status: 'uploading' as const,
                }));

            const updated = [...files, ...newFileObjects].slice(0, maxFiles);
            setFiles(updated);
            onFilesSelect?.(updated.map((f) => f.file));

            newFileObjects.forEach((fileObj) => {
                setTimeout(
                    () => {
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === fileObj.id
                                    ? { ...f, status: 'complete' as const }
                                    : f,
                            ),
                        );
                    },
                    800 + Math.random() * 800,
                );
            });
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

    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-2 rounded-lg border p-2',
                isDragOver && 'border-primary bg-muted/50',
                className,
            )}
            onDrop={handleDrop}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
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

            {files.map((file) => (
                <Tooltip key={file.id}>
                    <TooltipTrigger asChild>
                        <div className="group relative size-14 overflow-hidden rounded-md border bg-muted">
                            <img
                                src={file.preview}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                            {file.status === 'complete' && (
                                <div className="bg-success absolute right-0.5 bottom-0.5 rounded-full p-0.5">
                                    <Check className="text-success-foreground size-2.5" />
                                </div>
                            )}
                            <button
                                onClick={() => handleRemove(file.id)}
                                className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100"
                                aria-label="Remove"
                            >
                                <X className="size-2.5" />
                            </button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        {file.file.name}
                    </TooltipContent>
                </Tooltip>
            ))}

            {files.length < maxFiles && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    className="size-14 border-dashed p-0"
                >
                    <Plus className="size-5 text-muted-foreground" />
                </Button>
            )}
        </div>
    );
}
