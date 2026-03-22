'use client';

import {
    User,
    Upload,
    RotateCcw,
    Check,
    X,
    Camera,
    AlertCircle,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'uploading' | 'success' | 'error';

type Variant =
    | 'square'
    | 'minimal'
    | 'badge'
    | 'card'
    | 'inline'
    | 'field'
    | 'outlined'
    | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface SingleImageDropProps {
    onFile: (file: File | null) => void;
    maxSize?: number;
    preview?: string | null;
    onPreviewChange?: (preview: string | null) => void;
    variant?: Variant;
    size?: Size;
    label?: string;
    description?: string;
    showProgress?: boolean;
    showStatusBadge?: boolean;
    showRemoveButton?: boolean;
    onUploadStart?: () => void;
    onUploadComplete?: (file: File) => void;
    onUploadError?: (error: string) => void;
    className?: string;
    imageClassName?: string;
}

const sizeMap = {
    sm: 48,
    md: 80,
    lg: 112,
};

const avatarSizes = {
    square: 128,
    minimal: 64,
    badge: sizeMap,
    card: 64,
    inline: 56,
    field: 64,
    outlined: 112,
    ghost: 96,
};

export function SingleImageDrop({
    onFile,
    maxSize = 5 * 1024 * 1024,
    preview: externalPreview,
    onPreviewChange,
    variant = 'square',
    size = 'md',
    label,
    description,
    showProgress = true,
    showStatusBadge = true,
    showRemoveButton = true,
    onUploadStart,
    onUploadComplete,
    onUploadError,
    className,
    imageClassName,
}: SingleImageDropProps) {
    const [internalPreview, setInternalPreview] = React.useState<string | null>(
        null,
    );
    const [status, setStatus] = React.useState<Status>('idle');
    const [progress, setProgress] = React.useState(0);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const preview =
        externalPreview !== undefined ? externalPreview : internalPreview;
    const setPreview = onPreviewChange || setInternalPreview;

    const simulateUpload = React.useCallback(() => {
        setStatus('uploading');
        setProgress(0);
        onUploadStart?.();

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setStatus('success');

                    return 100;
                }

                return prev + 10;
            });
        }, 100);
    }, [onUploadStart]);

    const handleFile = React.useCallback(
        (file: File) => {
            if (!file.type.startsWith('image/')) {
                setStatus('error');
                setErrorMessage('File must be an image');
                onUploadError?.('File must be an image');

                return;
            }

            if (file.size > maxSize) {
                setStatus('error');
                setErrorMessage(
                    `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
                );
                onUploadError?.(
                    `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
                );

                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setPreview(result);
                simulateUpload();
                onFile(file);
                onUploadComplete?.(file);
            };
            reader.readAsDataURL(file);
        },
        [
            maxSize,
            onFile,
            onUploadComplete,
            onUploadError,
            setPreview,
            simulateUpload,
        ],
    );

    const handleDrop = React.useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];

            if (file) {
                handleFile(file);
            }
        },
        [handleFile],
    );

    const handleRemove = React.useCallback(() => {
        setPreview(null);
        setStatus('idle');
        setProgress(0);
        setErrorMessage('');
        onFile(null);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [onFile, setPreview]);

    const renderBadgeVariant = () => {
        const badgeSize = avatarSizes.badge[size];

        return (
            <div
                className="relative inline-block"
                {...(!['card', 'inline', 'field', 'ghost'].includes(variant)
                    ? {
                          onDrop: handleDrop,
                          onDragOver: (e: React.DragEvent) => {
                              e.preventDefault();
                              setIsDragOver(true);
                          },
                          onDragLeave: (e: React.DragEvent) => {
                              e.preventDefault();
                              setIsDragOver(false);
                          },
                      }
                    : {})}
            >
                <div
                    className={cn(
                        'relative overflow-hidden rounded-full border-2 border-border bg-muted',
                        isDragOver && 'ring-2 ring-primary ring-offset-2',
                        imageClassName,
                    )}
                    style={{ width: badgeSize, height: badgeSize }}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <User
                                className="text-muted-foreground"
                                style={{
                                    width: badgeSize * 0.4,
                                    height: badgeSize * 0.4,
                                }}
                            />
                        </div>
                    )}

                    {!preview && (
                        <div
                            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
                            onClick={() => inputRef.current?.click()}
                        >
                            <Camera
                                className="text-white"
                                style={{
                                    width: badgeSize * 0.3,
                                    height: badgeSize * 0.3,
                                }}
                            />
                        </div>
                    )}

                    {status === 'uploading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Spinner className="text-white" />
                        </div>
                    )}

                    {showStatusBadge && status === 'success' && (
                        <div className="absolute -right-1 -bottom-1 rounded-full bg-primary p-1">
                            <Check
                                className="text-primary-foreground"
                                style={{
                                    width: badgeSize * 0.25,
                                    height: badgeSize * 0.25,
                                }}
                            />
                        </div>
                    )}

                    {showStatusBadge && status === 'error' && (
                        <div className="absolute -right-1 -bottom-1 rounded-full bg-destructive p-1">
                            <AlertCircle
                                className="text-destructive-foreground"
                                style={{
                                    width: badgeSize * 0.25,
                                    height: badgeSize * 0.25,
                                }}
                            />
                        </div>
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
handleFile(e.target.files[0]);
}
                    }}
                />
            </div>
        );
    };

    const renderSquareVariant = () => (
        <div className={cn('flex flex-col items-center gap-3', className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload avatar"
                onClick={() =>
                    status !== 'success' && inputRef.current?.click()
                }
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();

                        if (status !== 'success') {
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
                    'relative size-32 overflow-hidden rounded-lg border-2 transition-all',
                    status !== 'success' && 'cursor-pointer',
                    isDragOver
                        ? 'scale-[1.02] border-primary bg-primary/5'
                        : status === 'error'
                          ? 'border-destructive'
                          : status === 'success'
                            ? 'border-success'
                            : 'border-dashed border-border hover:border-primary/50',
                    imageClassName,
                )}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30">
                        <User className="size-10 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground">
                            No image
                        </span>
                    </div>
                )}

                {!preview && isDragOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <Upload className="size-8 text-primary" />
                    </div>
                )}

                {status === 'uploading' && showProgress && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                        <div className="mb-2 text-lg font-bold text-foreground">
                            {Math.round(progress)}%
                        </div>
                        <Progress value={progress} className="h-1.5 w-24" />
                    </div>
                )}

                {showStatusBadge && status === 'success' && (
                    <Badge className="bg-success text-success-foreground absolute top-2 right-2 gap-1">
                        <Check className="size-3" />
                        Uploaded
                    </Badge>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
handleFile(e.target.files[0]);
}
                }}
            />
            <div className="flex gap-2">
                {status === 'success' ? (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                        >
                            <RotateCcw className="mr-1.5 size-3.5" />
                            Replace
                        </Button>
                        {showRemoveButton && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemove}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="mr-1.5 size-3.5" />
                                Remove
                            </Button>
                        )}
                    </>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="mr-1.5 size-3.5" />
                        Select Image
                    </Button>
                )}
            </div>
        </div>
    );

    const renderMinimalVariant = () => (
        <div
            className={cn('relative inline-block', className)}
            {...({
                onDrop: handleDrop,
                onDragOver: (e: React.DragEvent) => {
                    e.preventDefault();
                    setIsDragOver(true);
                },
                onDragLeave: (e: React.DragEvent) => {
                    e.preventDefault();
                    setIsDragOver(false);
                },
            } as React.HTMLAttributes<HTMLDivElement>)}
        >
            <div
                className={cn(
                    'relative overflow-hidden rounded-full border-2 border-border bg-muted transition-all',
                    isDragOver && 'scale-110 border-primary',
                    imageClassName,
                )}
                style={{
                    width: avatarSizes.minimal,
                    height: avatarSizes.minimal,
                }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <User
                            className="text-muted-foreground"
                            style={{
                                width: avatarSizes.minimal * 0.4,
                                height: avatarSizes.minimal * 0.4,
                            }}
                        />
                    </div>
                )}

                <div
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
                    onClick={() => inputRef.current?.click()}
                >
                    <Camera
                        className="text-white"
                        style={{
                            width: avatarSizes.minimal * 0.35,
                            height: avatarSizes.minimal * 0.35,
                        }}
                    />
                </div>

                {status === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Spinner className="text-white" />
                    </div>
                )}

                {showRemoveButton && preview && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove();
                        }}
                        className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity hover:opacity-100"
                        style={{ width: 20, height: 20 }}
                    >
                        <X className="size-3" />
                    </button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
handleFile(e.target.files[0]);
}
                }}
            />
        </div>
    );

    const renderCardVariant = () => (
        <div className={cn('flex items-center gap-4', className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload avatar"
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
                    'relative shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2 transition-all',
                    isDragOver
                        ? 'scale-105 ring-primary'
                        : 'ring-transparent hover:ring-muted-foreground/30',
                    imageClassName,
                )}
                style={{ width: avatarSizes.card, height: avatarSizes.card }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <User
                            className="text-muted-foreground"
                            style={{
                                width: avatarSizes.card * 0.4,
                                height: avatarSizes.card * 0.4,
                            }}
                        />
                    </div>
                )}
                {status === 'uploading' && showProgress && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <span className="text-xs font-medium text-white">
                            {Math.round(progress)}%
                        </span>
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
handleFile(e.target.files[0]);
}
                }}
            />
            <div className="flex flex-1 flex-col gap-2">
                <p className="text-sm font-medium">
                    {label || 'Profile Photo'}
                </p>
                {status === 'idle' && !preview && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                    >
                        Upload
                    </Button>
                )}
                {status === 'uploading' && showProgress && (
                    <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground">
                            {Math.round(progress)}%
                        </span>
                    </div>
                )}
                {status === 'success' && (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                            <Check className="size-3" /> Done
                        </Badge>
                        {showRemoveButton && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemove}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderInlineVariant = () => (
        <div className={cn('flex items-center gap-3', className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload avatar"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                className={cn(
                    'relative shrink-0 overflow-hidden rounded-full border border-border bg-muted transition-all',
                    imageClassName,
                )}
                style={{
                    width: avatarSizes.inline,
                    height: avatarSizes.inline,
                }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <User
                            className="text-muted-foreground"
                            style={{
                                width: avatarSizes.inline * 0.4,
                                height: avatarSizes.inline * 0.4,
                            }}
                        />
                    </div>
                )}
                {status === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                )}
                {showRemoveButton && preview && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove();
                        }}
                        className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                    >
                        <X className="size-2.5" />
                    </button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
handleFile(e.target.files[0]);
}
                }}
            />
            <div className="flex flex-1 items-center justify-between">
                <div>
                    <p className="text-sm font-medium">{label || 'Photo'}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {status === 'idle' && !preview && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                    >
                        Change
                    </Button>
                )}
            </div>
        </div>
    );

    const renderFieldVariant = () => (
        <div
            role="button"
            tabIndex={0}
            aria-label="Upload avatar"
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
                'flex items-center gap-4 rounded-lg border p-4 transition-colors',
                isDragOver && 'border-primary bg-muted/50',
                className,
            )}
        >
            <div
                className={cn(
                    'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted',
                    imageClassName,
                )}
                style={{ width: avatarSizes.field, height: avatarSizes.field }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-lg font-medium text-muted-foreground">
                        {label?.charAt(0) || 'U'}
                    </span>
                )}
                {status === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Spinner className="text-white" />
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
handleFile(e.target.files[0]);
}
                }}
            />
            <div className="flex flex-1 items-center justify-between">
                <div>
                    <p className="text-sm font-medium">
                        {label || 'Upload Photo'}
                    </p>
                    {description && (
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {status === 'success' ? (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                inputRef.current?.click();
                            }}
                        >
                            <RotateCcw className="mr-1.5 size-3.5" />
                            Change
                        </Button>
                        {showRemoveButton && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className="text-destructive hover:text-destructive"
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                ) : status === 'uploading' ? (
                    <span className="text-sm text-muted-foreground">
                        Uploading...
                    </span>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.click();
                        }}
                    >
                        <Upload className="mr-1.5 size-3.5" />
                        Upload
                    </Button>
                )}
            </div>
        </div>
    );

    const renderOutlinedVariant = () => (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload avatar"
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
                    'relative flex items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-muted/30 transition-all',
                    isDragOver
                        ? 'scale-105 border-primary'
                        : status === 'error'
                          ? 'border-destructive'
                          : status === 'success'
                            ? 'border-primary'
                            : 'border-muted-foreground/50',
                    imageClassName,
                )}
                style={{
                    width: avatarSizes.outlined,
                    height: avatarSizes.outlined,
                }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <Upload
                            className="text-muted-foreground"
                            style={{
                                width: avatarSizes.outlined * 0.25,
                                height: avatarSizes.outlined * 0.25,
                            }}
                        />
                        <span className="text-xs text-muted-foreground">
                            Upload
                        </span>
                    </div>
                )}

                {showStatusBadge && status === 'success' && (
                    <div className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-background shadow-sm">
                        <Check className="size-4 text-primary" />
                    </div>
                )}
                {showStatusBadge && status === 'error' && (
                    <div className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-background shadow-sm">
                        <AlertCircle className="size-4 text-destructive" />
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
handleFile(e.target.files[0]);
}
                }}
            />
            {status === 'error' && errorMessage && (
                <p className="text-xs text-destructive">{errorMessage}</p>
            )}
            {showRemoveButton && preview && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="text-muted-foreground hover:text-destructive"
                >
                    Remove
                </Button>
            )}
        </div>
    );

    const renderGhostVariant = () => (
        <div
            className={cn('relative inline-block', className)}
            onMouseEnter={() => setIsDragOver(true)}
            onMouseLeave={() => setIsDragOver(false)}
        >
            <div
                className={cn(
                    'relative overflow-hidden rounded-full bg-muted transition-all',
                    isDragOver
                        ? 'ring-2 ring-primary'
                        : 'ring-2 ring-transparent',
                    imageClassName,
                )}
                style={{ width: avatarSizes.ghost, height: avatarSizes.ghost }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <User
                            className="text-muted-foreground"
                            style={{
                                width: avatarSizes.ghost * 0.4,
                                height: avatarSizes.ghost * 0.4,
                            }}
                        />
                    </div>
                )}

                <div
                    className={cn(
                        'absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 transition-opacity',
                        isDragOver ? 'opacity-100' : 'opacity-0',
                    )}
                    onClick={() => inputRef.current?.click()}
                >
                    <Camera
                        className="text-white"
                        style={{
                            width: avatarSizes.ghost * 0.35,
                            height: avatarSizes.ghost * 0.35,
                        }}
                    />
                </div>

                {status === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Spinner className="text-white" />
                    </div>
                )}

                {showRemoveButton && preview && isDragOver && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove();
                        }}
                        className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    >
                        <X className="size-3" />
                    </button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
handleFile(e.target.files[0]);
}
                }}
            />
        </div>
    );

    switch (variant) {
        case 'square':
            return renderSquareVariant();
        case 'minimal':
            return renderMinimalVariant();
        case 'badge':
            return renderBadgeVariant();
        case 'card':
            return renderCardVariant();
        case 'inline':
            return renderInlineVariant();
        case 'field':
            return renderFieldVariant();
        case 'outlined':
            return renderOutlinedVariant();
        case 'ghost':
            return renderGhostVariant();
        default:
            return renderSquareVariant();
    }
}
