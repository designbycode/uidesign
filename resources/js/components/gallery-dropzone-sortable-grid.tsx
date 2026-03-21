'use client';

import type { Draggable, Droppable } from '@dnd-kit/dom';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable, isSortable } from '@dnd-kit/react/sortable';
import { Upload, X, ImageIcon, GripVertical } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileWithPreview {
    file: File;
    preview: string;
    id: string;
}

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
                'group relative aspect-square overflow-hidden rounded-md border bg-muted transition-all',
                isDragging && 'z-10 scale-105 shadow-lg ring-2 ring-primary',
            )}
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
    const [files, setFiles] = React.useState<FileWithPreview[]>([]);
    const [isDragging, setIsDragging] = React.useState(false);
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
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            }));

            const updated = [...files, ...newFileObjects].slice(0, maxFiles);
            setFiles(updated);
            onFilesSelect?.(updated.map((f) => f.file));
        },
        [files, maxFiles, maxSize, onFilesSelect],
    );

    const handleDrop = React.useCallback(
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

    const clearAll = () => {
        setFiles([]);
        onFilesSelect?.([]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleDragEnd = React.useCallback(
        (event: { canceled: boolean; operation: { source: unknown } }) => {
            if (event.canceled) {
                return;
            }

            const { source } = event.operation;

            if (isSortable(source as Draggable | Droppable | null)) {
                const sortableSource = source as {
                    initialIndex: number;
                    index: number;
                };
                const { initialIndex, index } = sortableSource;

                if (initialIndex !== index) {
                    setFiles((prev) => {
                        const newFiles = [...prev];
                        const [removed] = newFiles.splice(initialIndex, 1);
                        newFiles.splice(index, 0, removed);
                        onReorder?.(newFiles.map((f) => f.file));

                        return newFiles;
                    });
                }
            }
        },
        [onReorder],
    );

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

            {files.length < maxFiles && (
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
                        isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                    )}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
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
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
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
