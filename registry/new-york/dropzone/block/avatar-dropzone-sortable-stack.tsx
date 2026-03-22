'use client';

import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Plus, X, GripVertical, UserCircle } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { FileWithPreview } from '@/hooks/types';
import { useImageDropzone } from '@/hooks/use-image-components';
import { useSortableFiles } from '@/hooks/use-sortable-files';

interface SortableAvatarProps {
    avatar: FileWithPreview;
    index: number;
    onRemove: (id: string) => void;
    showHandle?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
};

function SortableAvatar({
    avatar,
    index,
    onRemove,
    showHandle,
    size = 'md',
}: SortableAvatarProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: avatar.id,
        index,
    });

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        ref={ref}
                        className={cn(
                            'group relative -ml-2 transition-all duration-150 first:ml-0',
                            isDragging && 'z-50',
                        )}
                        style={{
                            position: isDragging ? 'relative' : undefined,
                            willChange: isDragging
                                ? 'transform, opacity'
                                : undefined,
                        }}
                    >
                        <Avatar
                            className={cn(
                                sizeClasses[size],
                                'border-2 border-background transition-all duration-150',
                                isDragging &&
                                    'scale-110 opacity-90 ring-2 ring-primary',
                            )}
                        >
                            <AvatarImage src={avatar.preview} alt="" />
                            <AvatarFallback>
                                <UserCircle className="size-full text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>

                        <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            {showHandle && (
                                <button
                                    ref={handleRef}
                                    className="flex size-4 cursor-grab items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm active:cursor-grabbing"
                                    aria-label="Drag to reorder"
                                >
                                    <GripVertical className="size-2.5" />
                                </button>
                            )}
                            <button
                                onClick={() => onRemove(avatar.id)}
                                className="flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm"
                                aria-label="Remove"
                            >
                                <X className="size-2.5" />
                            </button>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">{avatar.file.name}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface AvatarDropzoneSortableStackProps {
    onFilesSelect?: (files: File[]) => void;
    onReorder?: (files: File[]) => void;
    maxAvatars?: number;
    maxSize?: number;
    className?: string;
    enableReorder?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function AvatarDropzoneSortableStack({
    onFilesSelect,
    onReorder,
    maxAvatars = 5,
    maxSize = 5 * 1024 * 1024,
    className,
    enableReorder = true,
    size = 'md',
}: AvatarDropzoneSortableStackProps) {
    const { files, inputRef, addFiles, removeFile, hasReachedMax } =
        useImageDropzone({
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
        <div className="flex items-center">
            {files.map((avatar, index) => (
                <SortableAvatar
                    key={avatar.id}
                    avatar={avatar}
                    index={index}
                    onRemove={removeFile}
                    showHandle={enableReorder}
                    size={size}
                />
            ))}

            {!hasReachedMax && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => inputRef.current?.click()}
                                className={cn(
                                    sizeClasses[size],
                                    'ml-2 rounded-full border-dashed',
                                )}
                            >
                                <Plus className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                Add avatar ({files.length}/{maxAvatars})
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );

    return (
        <div className={cn('flex flex-col gap-2', className)}>
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

            {enableReorder ? (
                <DragDropProvider onDragEnd={handleDragEnd}>
                    {avatarsContent}
                </DragDropProvider>
            ) : (
                avatarsContent
            )}

            {files.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    {enableReorder
                        ? 'Drag to reorder avatars'
                        : `${files.length} avatar${files.length > 1 ? 's' : ''}`}
                </p>
            )}
        </div>
    );
}
