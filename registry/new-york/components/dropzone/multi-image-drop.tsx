'use client';

import {
    Upload,
    X,
    Check,
    ImageIcon,
    FileWarning,
    Trash2,
    Plus,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface FileItem {
    id: string;
    file: File;
    preview: string;
    status: 'uploading' | 'complete' | 'error';
    progress?: number;
    error?: string;
}

type Variant = 'simple' | 'compact' | 'pills' | 'list' | 'table' | 'masonry';

interface MultiImageDropProps {
    onFiles: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    files: FileItem[];
    onFilesChange: (files: FileItem[]) => void;
    variant?: Variant;
    enableSortable?: boolean;
    onReorder?: (files: FileItem[]) => void;
    columns?: number;
    className?: string;
}

const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function MultiImageDrop({
    onFiles,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024,
    files,
    onFilesChange,
    variant = 'simple',
    columns = 3,
    className,
}: MultiImageDropProps) {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const simulateUpload = React.useCallback(
        (id: string) => {
            const interval = setInterval(() => {
                onFilesChange(
                    files.map((f) => {
                        if (f.id !== id || f.progress === undefined) {
return f;
}

                        const newProgress = f.progress + Math.random() * 20 + 5;

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
            }, 100);
        },
        [files, onFilesChange],
    );

    const processFiles = React.useCallback(
        (newFiles: FileList | File[]) => {
            const fileArray = Array.from(newFiles);
            const remainingSlots = maxFiles - files.length;
            const filesToProcess = fileArray.slice(0, remainingSlots);

            const newFileItems: FileItem[] = filesToProcess
                .filter(
                    (file) =>
                        file.type.startsWith('image/') && file.size <= maxSize,
                )
                .map((file) => ({
                    id: generateId(),
                    file,
                    preview: URL.createObjectURL(file),
                    status: 'uploading' as const,
                    progress: 0,
                }));

            const validFiles = newFileItems.filter((f) => f.status !== 'error');
            const allFiles = [...files, ...validFiles].slice(0, maxFiles);
            onFilesChange(allFiles);

            validFiles.forEach((f) => {
                setTimeout(() => simulateUpload(f.id), 50);
            });

            onFiles(
                allFiles.filter((f) => f.status !== 'error').map((f) => f.file),
            );
        },
        [files, maxFiles, maxSize, onFiles, onFilesChange, simulateUpload],
    );

    const handleDrop = React.useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            if (e.dataTransfer.files.length > 0) {
                processFiles(e.dataTransfer.files);
            }
        },
        [processFiles],
    );

    const handleRemove = React.useCallback(
        (id: string) => {
            const updated = files.filter((f) => f.id !== id);
            onFilesChange(updated);
            onFiles(
                updated.filter((f) => f.status !== 'error').map((f) => f.file),
            );
        },
        [files, onFiles, onFilesChange],
    );

    const handleClearAll = React.useCallback(() => {
        files.forEach((f) => {
            if (f.preview.startsWith('blob:')) {
                URL.revokeObjectURL(f.preview);
            }
        });
        onFilesChange([]);
        onFiles([]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [files, onFiles, onFilesChange]);

    const handleAddMore = React.useCallback(() => {
        inputRef.current?.click();
    }, []);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) {
return `${bytes} B`;
}

        if (bytes < 1024 * 1024) {
return `${(bytes / 1024).toFixed(1)} KB`;
}

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const renderSimpleVariant = () => (
        <div className={cn('space-y-4', className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload images"
                onClick={() =>
                    files.length < maxFiles && inputRef.current?.click()
                }
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();

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
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                }}
                className={cn(
                    'flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
                    isDragOver
                        ? 'border-primary bg-muted/50'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                )}
            >
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
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files) {
processFiles(e.target.files);
}
                }}
            />

            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {files.length} of {maxFiles} images
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-muted-foreground"
                        >
                            Clear all
                        </Button>
                    </div>
                    <div
                        className="grid gap-3"
                        style={{
                            gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        }}
                    >
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
                                    onClick={() => handleRemove(file.id)}
                                    className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/80 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                    aria-label="Remove image"
                                >
                                    <X className="size-3" />
                                </button>
                            </div>
                        ))}
                        {files.length < maxFiles && (
                            <button
                                onClick={handleAddMore}
                                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
                            >
                                <Plus className="size-5" />
                                <span className="text-xs">Add</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderCompactVariant = () => (
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
            onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files) {
processFiles(e.target.files);
}
                }}
            />

            {files.map((file) => (
                <div
                    key={file.id}
                    className="group relative size-14 overflow-hidden rounded-md border bg-muted"
                >
                    <img
                        src={file.preview}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                    {file.status === 'uploading' &&
                        file.progress !== undefined && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                                <Progress
                                    value={file.progress}
                                    className="h-1 w-10"
                                />
                            </div>
                        )}
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
            ))}

            {files.length < maxFiles && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMore}
                    className="size-14 border-dashed p-0"
                >
                    <Plus className="size-5 text-muted-foreground" />
                </Button>
            )}
        </div>
    );

    const renderPillsVariant = () => (
        <div
            className={cn(
                'flex min-h-[48px] flex-wrap items-center gap-2 rounded-lg border p-3',
                isDragOver && 'border-primary bg-muted/50',
                className,
            )}
            onDrop={handleDrop}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files) {
processFiles(e.target.files);
}
                }}
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
                        <div className="size-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                    ) : (
                        <button
                            onClick={() => handleRemove(file.id)}
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
                    onClick={handleAddMore}
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

    const renderListVariant = () => (
        <div
            className={cn(
                'flex flex-col gap-4 rounded-lg border border-border p-4',
                className,
            )}
        >
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload images"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                }}
                className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-6 transition-colors',
                    isDragOver
                        ? 'border-primary bg-muted/50'
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
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files) {
processFiles(e.target.files);
}
                }}
            />

            {files.length > 0 && (
                <>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            {files.length} file{files.length > 1 ? 's' : ''}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="mr-1 size-3" />
                            Clear all
                        </Button>
                    </div>
                    <ScrollArea className="max-h-[240px]">
                        <div className="space-y-2">
                            {files.map((file, idx) => (
                                <React.Fragment key={file.id}>
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted">
                                            <img
                                                src={file.preview}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate text-sm">
                                                    {file.file.name}
                                                </span>
                                                {file.status === 'complete' && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-success shrink-0 gap-0.5 px-1.5 py-0 text-xs"
                                                    >
                                                        <Check className="size-3" />{' '}
                                                        Done
                                                    </Badge>
                                                )}
                                                {file.status === 'error' && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="shrink-0 gap-0.5 px-1.5 py-0 text-xs"
                                                    >
                                                        <FileWarning className="size-3" />{' '}
                                                        {file.error || 'Error'}
                                                    </Badge>
                                                )}
                                            </div>
                                            {file.status === 'uploading' &&
                                            file.progress !== undefined ? (
                                                <Progress
                                                    value={file.progress}
                                                    className="h-1"
                                                />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    {formatSize(file.file.size)}
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRemove(file.id)
                                            }
                                            className="size-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                    {idx < files.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                    </ScrollArea>
                </>
            )}
        </div>
    );

    const renderTableVariant = () => (
        <div className={cn('space-y-4', className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload images"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                }}
                className={cn(
                    'flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed p-4 transition-colors',
                    isDragOver
                        ? 'border-primary bg-muted/50'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                )}
            >
                <Upload className="size-5 text-muted-foreground" />
                <span className="text-sm">
                    Drop files here or click to browse
                </span>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files) {
processFiles(e.target.files);
}
                }}
            />

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
                                        {file.status === 'uploading' &&
                                        file.progress !== undefined ? (
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

    const renderMasonryVariant = () => {
        const columns: FileItem[][] = [[], [], []];
        files.forEach((img, idx) => {
            columns[idx % 3].push(img);
        });

        return (
            <div className={cn('space-y-4', className)}>
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload images"
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                    }}
                    className={cn(
                        'relative min-h-[200px] rounded-lg border-2 border-dashed p-4 transition-all',
                        isDragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30',
                    )}
                >
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
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                        if (e.target.files) {
processFiles(e.target.files);
}
                    }}
                />

                {files.length > 0 && (
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
                                        style={{ aspectRatio: '1' }}
                                    >
                                        <img
                                            src={file.preview}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                        {file.status === 'uploading' &&
                                            file.progress !== undefined && (
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
                                            onClick={() =>
                                                handleRemove(file.id)
                                            }
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
        );
    };

    switch (variant) {
        case 'simple':
            return renderSimpleVariant();
        case 'compact':
            return renderCompactVariant();
        case 'pills':
            return renderPillsVariant();
        case 'list':
            return renderListVariant();
        case 'table':
            return renderTableVariant();
        case 'masonry':
            return renderMasonryVariant();
        default:
            return renderSimpleVariant();
    }
}
