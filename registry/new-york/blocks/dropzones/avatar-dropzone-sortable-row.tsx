'use client';

import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Plus, X, GripVertical, User, Upload, Trash2 } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FileWithPreview } from '@/hooks/types';
import { useImageDropzone } from '@/hooks/use-image-dropzone';
import { useSortableFiles } from '@/hooks/use-sortable-files';

interface SortableAvatarRowItemProps {
    avatar: FileWithPreview;
    index: number;
    onRemove: (id: string) => void;
    showHandle?: boolean;
}

function SortableAvatarRowItem({
    avatar,
    index,
    onRemove,
    showHandle,
}: SortableAvatarRowItemProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: avatar.id,
        index,
    });

    return (
        <div
            ref={ref}
            className={cn(
                'group flex items-center gap-3 rounded-md border bg-card p-2 transition-all duration-150',
                isDragging &&
                    'z-50 scale-[1.02] opacity-90 shadow-lg ring-2 ring-primary',
            )}
            style={{
                position: isDragging ? 'relative' : undefined,
                willChange: isDragging ? 'transform, opacity' : undefined,
            }}
        >
            {showHandle && (
                <button
                    ref={handleRef}
                    className="flex size-6 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="size-4" />
                </button>
            )}

            <Avatar className="size-10 border">
                <AvatarImage src={avatar.preview} alt="" />
                <AvatarFallback>
                    <User className="size-5 text-muted-foreground" />
                </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                    {avatar.file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                    {(avatar.file.size / 1024).toFixed(1)} KB
                </span>
            </div>

            <Badge variant="secondary" className="shrink-0">
                #{index + 1}
            </Badge>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(avatar.id)}
                className="size-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
            >
                <X className="size-4" />
            </Button>
        </div>
    );
}

interface AvatarDropzoneSortableRowProps {
    onFilesSelect?: (files: File[]) => void;
    onReorder?: (files: File[]) => void;
    maxAvatars?: number;
    maxSize?: number;
    className?: string;
    enableReorder?: boolean;
    title?: string;
    description?: string;
}

export function AvatarDropzoneSortableRow({
    onFilesSelect,
    onReorder,
    maxAvatars = 4,
    maxSize = 5 * 1024 * 1024,
    className,
    enableReorder = true,
    title = 'Team Members',
    description = 'Add and reorder team member avatars',
}: AvatarDropzoneSortableRowProps) {
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
        maxFiles: maxAvatars,
        maxSize,
        onFilesChange: onFilesSelect,
    });

    const { handleDragEnd } = useSortableFiles({
        items: files,
        onReorderFiles: onReorder,
        getFile: (item) => item.file,
    });

    const avatarsContent = (
        <div className="space-y-2">
            {files.map((avatar, index) => (
                <SortableAvatarRowItem
                    key={avatar.id}
                    avatar={avatar}
                    index={index}
                    onRemove={removeFile}
                    showHandle={enableReorder}
                />
            ))}
        </div>
    );

    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription className="text-sm">
                            {description}
                        </CardDescription>
                    </div>
                    {files.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAll}
                            className="gap-1 text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="size-3" />
                            Clear
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
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

                {files.length === 0 ? (
                    <div
                        className={cn(
                            'flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 transition-colors',
                            isDragOver
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-muted-foreground/50',
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
                        aria-label="Upload avatars"
                    >
                        <Upload className="size-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Drop images or click to add team members
                        </p>
                    </div>
                ) : (
                    <>
                        {enableReorder ? (
                            <DragDropProvider onDragEnd={handleDragEnd}>
                                {avatarsContent}
                            </DragDropProvider>
                        ) : (
                            avatarsContent
                        )}

                        {!hasReachedMax && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => inputRef.current?.click()}
                                className="w-full gap-1"
                            >
                                <Plus className="size-4" />
                                Add Member ({files.length}/{maxAvatars})
                            </Button>
                        )}

                        {enableReorder && (
                            <p className="text-center text-xs text-muted-foreground">
                                Drag items to change order
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
