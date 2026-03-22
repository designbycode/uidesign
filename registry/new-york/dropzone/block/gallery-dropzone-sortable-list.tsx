'use client';

import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import {
    ImageIcon,
    Upload,
    X,
    GripVertical,
    Check,
    AlertCircle,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FileWithPreview {
    id: string;
    file: File;
    preview: string;
    status: 'ready' | 'uploading' | 'success' | 'error';
}

interface SortableListItemProps {
    image: FileWithPreview;
    index: number;
    onRemove: (id: string) => void;
    showHandle?: boolean;
}

function SortableListItem({
    image,
    index,
    onRemove,
    showHandle,
}: SortableListItemProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: image.id,
        index,
    });

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
            ref={ref}
            className={cn(
                'flex items-center gap-3 rounded-md p-2 transition-all duration-150',
                isDragging &&
                    'z-50 bg-muted opacity-90 shadow-lg ring-1 ring-border',
            )}
            style={{
                position: isDragging ? 'relative' : undefined,
                willChange: isDragging ? 'transform, opacity' : undefined,
            }}
        >
            {showHandle && (
                <button
                    ref={handleRef}
                    className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="size-4" />
                </button>
            )}

            <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted">
                {image.preview ? (
                    <img
                        src={image.preview}
                        alt=""
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <ImageIcon className="size-4 text-muted-foreground" />
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                    {image.file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                    {formatSize(image.file.size)}
                </span>
            </div>

            <div className="flex items-center gap-2">
                {image.status === 'success' && (
                    <Badge variant="secondary" className="text-success gap-1">
                        <Check className="size-3" />
                        Done
                    </Badge>
                )}
                {image.status === 'error' && (
                    <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="size-3" />
                        Error
                    </Badge>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(image.id)}
                    className="size-8 p-0 text-muted-foreground hover:text-destructive"
                >
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}

interface GalleryDropzoneSortableListProps {
    className?: string;
    onFilesChange?: (files: File[]) => void;
    onReorder?: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    enableReorder?: boolean;
}

export function GalleryDropzoneSortableList({
    className,
    onFilesChange,
    onReorder,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024,
    enableReorder = true,
}: GalleryDropzoneSortableListProps) {
    const [files, setFiles] = React.useState<FileWithPreview[]>([]);
    const [isDragOver, setIsDragOver] = React.useState(false);
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
                status: 'ready' as const,
            }));

            newFileObjects.forEach((fileObj) => {
                setTimeout(
                    () => {
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === fileObj.id
                                    ? { ...f, status: 'success' }
                                    : f,
                            ),
                        );
                    },
                    500 + Math.random() * 500,
                );
            });

            const updated = [...files, ...newFileObjects].slice(0, maxFiles);
            setFiles(updated);
            onFilesChange?.(updated.map((f) => f.file));
        },
        [files, maxFiles, maxSize, onFilesChange],
    );

    const handleDrop = React.useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            if (e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles],
    );

    const removeFile = React.useCallback(
        (id: string) => {
            const updated = files.filter((f) => f.id !== id);
            setFiles(updated);
            onFilesChange?.(updated.map((f) => f.file));
        },
        [files, onFilesChange],
    );

    const clearAll = React.useCallback(() => {
        setFiles([]);
        onFilesChange?.([]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [onFilesChange]);

    const handleDragEnd = React.useCallback(
        (event: { canceled: boolean; operation?: { source?: unknown } }) => {
            if (event.canceled || !event.operation?.source) {
                return;
            }

            const source = event.operation.source as {
                id?: string;
                index?: number;
            };

            if (source.id && typeof source.index === 'number') {
                const sourceIndex = files.findIndex((f) => f.id === source.id);

                if (sourceIndex !== -1 && sourceIndex !== source.index) {
                    const newFiles = [...files];
                    const [removed] = newFiles.splice(sourceIndex, 1);
                    newFiles.splice(source.index, 0, removed);
                    setFiles(newFiles);
                    onReorder?.(newFiles.map((f) => f.file));
                }
            }
        },
        [files, onReorder],
    );

    const listContent = (
        <div className="space-y-1">
            {files.map((image, idx) => (
                <React.Fragment key={image.id}>
                    <SortableListItem
                        image={image}
                        index={idx}
                        onRemove={removeFile}
                        showHandle={enableReorder}
                    />
                    {idx < files.length - 1 && <Separator />}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div
            className={cn(
                'flex flex-col gap-4 rounded-lg border p-4',
                className,
            )}
        >
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload images"
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    inputRef.current?.click()
                }
                className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-6 transition-colors',
                    isDragOver
                        ? 'border-primary bg-primary/5'
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
                            {enableReorder && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    (drag to reorder)
                                </span>
                            )}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAll}
                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                        >
                            Clear all
                        </Button>
                    </div>

                    <ScrollArea className="max-h-70 overflow-y-hidden">
                        {enableReorder ? (
                            <DragDropProvider onDragEnd={handleDragEnd}>
                                {listContent}
                            </DragDropProvider>
                        ) : (
                            listContent
                        )}
                    </ScrollArea>
                </>
            )}
        </div>
    );
}
