'use client';

import { Camera, X } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface AvatarDropzoneMinimalProps {
    className?: string;
    onFileSelect?: (file: File | null) => void;
    maxSize?: number;
    defaultImage?: string;
}

export function AvatarDropzoneMinimal({
    className,
    onFileSelect,
    maxSize = 5 * 1024 * 1024,
    defaultImage,
}: AvatarDropzoneMinimalProps) {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [preview, setPreview] = React.useState<string | null>(
        defaultImage || null,
    );
    const [isUploading, setIsUploading] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFile = React.useCallback(
        (file: File) => {
            if (!file.type.startsWith('image/') || file.size > maxSize) {
                return;
            }

            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
                setTimeout(() => {
                    setIsUploading(false);
                    onFileSelect?.(file);
                }, 1000);
            };
            reader.readAsDataURL(file);
        },
        [maxSize, onFileSelect],
    );

    const handleDrop = React.useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];

            if (file) {
                handleFile(file);
            }
        },
        [handleFile],
    );

    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload avatar"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
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
                    'group relative size-16 cursor-pointer transition-transform hover:scale-105',
                    isDragOver && 'scale-110',
                )}
            >
                <Avatar className="size-full border-2 border-border">
                    {preview ? (
                        <AvatarImage
                            src={preview}
                            alt="Avatar"
                            className="object-cover"
                        />
                    ) : (
                        <AvatarFallback className="bg-muted text-muted-foreground">
                            <Camera className="size-5" />
                        </AvatarFallback>
                    )}
                </Avatar>

                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
                        <Spinner className="size-5 text-primary" />
                    </div>
                )}

                {!isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera className="size-4 text-background" />
                    </div>
                )}

                {preview && !isUploading && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPreview(null);
                            onFileSelect?.(null);
                        }}
                        className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-white"
                        aria-label="Remove"
                    >
                        <X className="size-3" />
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        handleFile(e.target.files[0]);
                    }
                }}
                className="sr-only"
            />

            <span className="text-xs text-muted-foreground">
                Click to upload
            </span>
        </div>
    );
}
