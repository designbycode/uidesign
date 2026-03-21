'use client';

import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Upload, X, ImageIcon, GripVertical } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FileWithPreview } from '@/hooks/types';
import { useImageDropzone } from '@/hooks/use-image-dropzone';
import { useSortableFiles } from '@/hooks/use-sortable-files';

interface SortableImageProps {
    image: FileWithPreview;
    index: number;
    onRemove: (id: string) => void;
    showHandle?: boolean;
}

function SortableImage({
    image,
    index,
    onRemove,
    showHandle,
}: SortableImageProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: image.id,
        index,
    });

    return (
        <div
            ref={ref}
            className={cn(
                'group relative aspect-square overflow-hidden rounded-md border bg-muted transition-all duration-150',
                isDragging &&
                    'z-50 scale-105 opacity-90 shadow-lg ring-2 ring-primary',
            )}
            style={{
                position: isDragging ? 'relative' : undefined,
                willChange: isDragging ? 'transform, opacity' : undefined,
            }}
        >
            <img
                src={image.preview}
                alt=""
                className="size-full object-cover"
                draggable={false}
            />

            {showHandle && (
                <button
                    ref={handleRef}
                    className="absolute top-1 left-1 flex size-6 cursor-grab items-center justify-center rounded bg-background/80 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="size-3" />
                </button>
            )}

            <button
                onClick={() => onRemove(image.id)}
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/80 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
            >
                <X className="size-3" />
            </button>

            <div className="absolute bottom-1 left-1 flex size-5 items-center justify-center rounded bg-foreground/70 text-xs font-medium text-background">
                {index + 1}
            </div>
        </div>
    );
}

interface GalleryDropzoneSortableGridProps {
    onFilesSelect?: (files: File[]) => void;
    onReorder?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
    enableReorder?: boolean;
}

export function GalleryDropzoneSortableGrid({
    onFilesSelect,
    onReorder,
    maxFiles = 9,
    maxSize = 10 * 1024 * 1024,
    className,
    enableReorder = true,
}: GalleryDropzoneSortableGridProps) {
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

    const { handleDragEnd } = useSortableFiles({
        items: files,
        onReorderFiles: onReorder,
        getFile: (item) => item.file,
    });

    const gridContent = (
        <div className="grid grid-cols-3 gap-3">
            {files.map((file, index) => (
                <SortableImage
                    key={file.id}
                    image={file}
                    index={index}
                    onRemove={removeFile}
                    showHandle={enableReorder}
                />
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
    );

    return (
        <div className={cn('space-y-4', className)}>
            {files.length === 0 && (
                <div
                    className={cn(
                        'flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
                        isDragOver
                            ? 'border-primary bg-primary/5'
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
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <Upload className="size-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium">
                            Drop images here or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to{' '}
                            {Math.round(maxSize / 1024 / 1024)}MB
                        </p>
                    </div>
                </div>
            )}

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

            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {files.length} of {maxFiles} images
                            {enableReorder && (
                                <span className="ml-2 text-xs">
                                    (drag to reorder)
                                </span>
                            )}
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

                    {enableReorder ? (
                        <DragDropProvider onDragEnd={handleDragEnd}>
                            {gridContent}
                        </DragDropProvider>
                    ) : (
                        gridContent
                    )}
                </div>
            )}
        </div>
    );
}
