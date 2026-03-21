'use client';

import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Upload, X, GripVertical, Star, Trash2 } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FileWithPreview } from '@/hooks/types';
import { useImageDropzone } from '@/hooks/use-image-dropzone';
import { useSortableFiles } from '@/hooks/use-sortable-files';

interface SortableCardProps {
    image: FileWithPreview;
    index: number;
    onRemove: (id: string) => void;
    onSetPrimary?: (id: string) => void;
    isPrimary: boolean;
    showHandle?: boolean;
}

function SortableCard({
    image,
    index,
    onRemove,
    onSetPrimary,
    isPrimary,
    showHandle,
}: SortableCardProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: image.id,
        index,
    });

    return (
        <Card
            ref={ref}
            className={cn(
                'group overflow-hidden transition-all duration-150',
                isDragging &&
                    'z-50 scale-[1.02] opacity-90 shadow-lg ring-2 ring-primary',
                isPrimary && !isDragging && 'ring-2 ring-primary',
            )}
            style={{
                position: isDragging ? 'relative' : undefined,
                willChange: isDragging ? 'transform, opacity' : undefined,
            }}
        >
            <div className="relative aspect-4/3 overflow-hidden bg-muted">
                <img
                    src={image.preview}
                    alt=""
                    className="size-full object-cover transition-transform group-hover:scale-105"
                    draggable={false}
                />

                {isPrimary && (
                    <Badge className="absolute top-2 left-2 gap-1 bg-primary text-primary-foreground">
                        <Star className="size-3 fill-current" />
                        Primary
                    </Badge>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {showHandle && (
                        <button
                            ref={handleRef}
                            className="flex size-7 cursor-grab items-center justify-center rounded bg-white/20 text-white backdrop-blur-sm active:cursor-grabbing"
                            aria-label="Drag to reorder"
                        >
                            <GripVertical className="size-4" />
                        </button>
                    )}

                    <div className={cn('flex gap-1', !showHandle && 'ml-auto')}>
                        {!isPrimary && onSetPrimary && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onSetPrimary(image.id)}
                                className="h-7 gap-1 text-xs"
                            >
                                <Star className="size-3" />
                                Set Primary
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onRemove(image.id)}
                            className="size-7 p-0"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <CardContent className="p-2">
                <p className="truncate text-xs text-muted-foreground">
                    {image.file.name}
                </p>
            </CardContent>
        </Card>
    );
}

interface GalleryDropzoneSortableCardsProps {
    onFilesSelect?: (files: File[]) => void;
    onReorder?: (files: File[]) => void;
    onPrimaryChange?: (file: File) => void;
    maxFiles?: number;
    maxSize?: number;
    className?: string;
    enableReorder?: boolean;
}

export function GalleryDropzoneSortableCards({
    onFilesSelect,
    onReorder,
    onPrimaryChange,
    maxFiles = 8,
    maxSize = 10 * 1024 * 1024,
    className,
    enableReorder = true,
}: GalleryDropzoneSortableCardsProps) {
    const [primaryId, setPrimaryId] = React.useState<string | null>(null);

    const {
        files,
        isDragOver,
        dragProps,
        inputRef,
        addFiles,
        removeFile,
        clearAll,
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

    React.useEffect(() => {
        if (!primaryId && files.length > 0) {
            setPrimaryId(files[0].id);
            onPrimaryChange?.(files[0].file);
        }
    }, [files, primaryId, onPrimaryChange]);

    const handleRemove = React.useCallback(
        (id: string) => {
            removeFile(id);

            if (primaryId === id) {
                const remainingFiles = files.filter((f) => f.id !== id);

                if (remainingFiles.length > 0) {
                    setPrimaryId(remainingFiles[0].id);
                    onPrimaryChange?.(remainingFiles[0].file);
                } else {
                    setPrimaryId(null);
                }
            }
        },
        [files, primaryId, removeFile, onPrimaryChange],
    );

    const setPrimary = React.useCallback(
        (id: string) => {
            setPrimaryId(id);
            const file = files.find((f) => f.id === id);

            if (file) {
                onPrimaryChange?.(file.file);
            }
        },
        [files, onPrimaryChange],
    );

    const cardsContent = (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file, index) => (
                <SortableCard
                    key={file.id}
                    image={file}
                    index={index}
                    onRemove={handleRemove}
                    onSetPrimary={setPrimary}
                    isPrimary={file.id === primaryId}
                    showHandle={enableReorder}
                />
            ))}
        </div>
    );

    return (
        <div className={cn('space-y-4', className)}>
            <div
                className={cn(
                    'flex min-h-30 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors',
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
                <Upload className="size-8 text-muted-foreground" />
                <div className="text-center">
                    <p className="text-sm font-medium">
                        Click or drag images to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {files.length} of {maxFiles} images
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
                        addFiles(e.target.files);
                    }
                }}
                className="sr-only"
            />

            {files.length > 0 && (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {enableReorder
                                ? 'Drag cards to reorder. First image is primary.'
                                : 'Click star to set primary image.'}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAll}
                            className="gap-1"
                        >
                            <Trash2 className="size-3" />
                            Clear All
                        </Button>
                    </div>

                    {enableReorder ? (
                        <DragDropProvider onDragEnd={handleDragEnd}>
                            {cardsContent}
                        </DragDropProvider>
                    ) : (
                        cardsContent
                    )}
                </>
            )}
        </div>
    );
}
