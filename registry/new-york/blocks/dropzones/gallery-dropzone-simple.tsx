'use client';

import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useImageDropzone } from '@/hooks/use-image-dropzone';

interface GalleryDropzoneSimpleProps {
    onFilesSelect?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
}

export function GalleryDropzoneSimple({
    onFilesSelect,
    maxFiles = 6,
    maxSize = 10 * 1024 * 1024,
    className,
}: GalleryDropzoneSimpleProps) {
    const {
        files,
        isDragOver,
        dragProps,
        inputRef,
        addFiles,
        removeFile,
        clearAll,
        hasReachedMax,
    } = useImageDropzone({
        maxFiles,
        maxSize,
        onFilesChange: onFilesSelect,
    });

    return (
        <div className={cn('space-y-4', className)}>
            <div
                className={cn(
                    'flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
                    isDragOver
                        ? 'border-primary bg-muted/50'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                )}
                {...dragProps}
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
                            addFiles(e.target.files);
                        }
                    }}
                    className="sr-only"
                />

                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="size-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">
                        Drop images here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to {Math.round(maxSize / 1024 / 1024)}
                        MB
                    </p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {files.length} of {maxFiles} images
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAll}
                            className="text-muted-foreground"
                        >
                            Clear all
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                            >
                                <img
                                    src={file.preview}
                                    alt=""
                                    className="size-full object-cover"
                                />
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/80 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                    aria-label="Remove image"
                                >
                                    <X className="size-3" />
                                </button>
                            </div>
                        ))}

                        {!hasReachedMax && (
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
                            >
                                <ImageIcon className="size-5" />
                                <span className="text-xs">Add</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
