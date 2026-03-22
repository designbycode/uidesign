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
import type { LucideIcon } from 'lucide-react';
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
type Roundness = 'sm' | 'md' | 'lg' | 'full';
type IconSize = 'sm' | 'md' | 'lg';
type BadgePosition = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';

interface IconConfig {
    upload?: LucideIcon;
    camera?: LucideIcon;
    remove?: LucideIcon;
    check?: LucideIcon;
    alert?: LucideIcon;
    fallback?: LucideIcon;
    iconSize?: IconSize;
}

interface IconPositionConfig {
    badge?: BadgePosition;
}

interface AvatarDropzoneProps {
    variant?: Variant;
    size?: Size;
    outline?: boolean;
    roundness?: Roundness;
    accept?: string;
    maxSize?: number;
    disabled?: boolean;
    status?: Status;
    preview?: string;
    defaultImage?: string;
    fallbackText?: string;
    showSpinner?: boolean;
    showProgress?: boolean;
    progressValue?: number;
    showStatusBadge?: boolean;
    showRemoveButton?: boolean;
    label?: string;
    description?: string;
    icons?: IconConfig;
    iconPosition?: IconPositionConfig;
    ariaLabel?: string;
    ariaDescription?: string;
    onFileSelect?: (file: File) => void;
    onFileValidate?: (file: File) => boolean | Promise<boolean>;
    onUploadStart?: (file: File) => void;
    onUploadProgress?: (progress: number) => void;
    onUploadSuccess?: (file: File, response?: unknown) => void;
    onUploadError?: (error: string, file?: File) => void;
    onDelete?: (currentImage: string) => void;
    onDeleteSuccess?: (deletedUrl: string) => void;
    onImageLoad?: (url: string) => void;
    onReset?: () => void;
    className?: string;
    imageClassName?: string;
}

const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/webp';
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

const sizeMap: Record<Size, number> = {
    sm: 48,
    md: 80,
    lg: 112,
};

const avatarSizes: Record<Variant, number | Record<Size, number>> = {
    square: 128,
    minimal: 64,
    badge: sizeMap,
    card: 64,
    inline: 56,
    field: 64,
    outlined: 112,
    ghost: 96,
};

const roundnessMap: Record<Roundness, string> = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
};

const badgePositionMap: Record<BadgePosition, string> = {
    'top-right': '-top-1 -right-1',
    'bottom-right': '-bottom-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-left': '-bottom-1 -left-1',
};

function getAvatarSize(variant: Variant, size: Size): number {
    const config = avatarSizes[variant];

    if (typeof config === 'number') {
        return config;
    }

    return config[size];
}

function getDefaultIcons(): Required<IconConfig> {
    return {
        upload: Upload,
        camera: Camera,
        remove: X,
        check: Check,
        alert: AlertCircle,
        fallback: User,
        iconSize: 'md',
    };
}

export function AvatarDropzone({
    variant = 'square',
    size = 'md',
    roundness = 'full',
    accept = DEFAULT_ACCEPT,
    maxSize = DEFAULT_MAX_SIZE,
    disabled = false,
    status: controlledStatus,
    preview: controlledPreview,
    defaultImage,
    fallbackText,
    showSpinner = true,
    showProgress = true,
    progressValue: controlledProgress,
    showStatusBadge = true,
    showRemoveButton = true,
    label,
    description,
    icons,
    iconPosition,
    ariaLabel,
    ariaDescription,
    onFileSelect,
    onFileValidate,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onDelete,
    onDeleteSuccess,
    onImageLoad,
    onReset,
    className,
    imageClassName,
}: AvatarDropzoneProps) {
    const iconsConfig = { ...getDefaultIcons(), ...icons };
    const badgePos = iconPosition?.badge ?? 'top-right';

    const [internalStatus, setInternalStatus] = React.useState<Status>('idle');
    const [internalPreview, setInternalPreview] = React.useState<string | null>(
        null,
    );
    const [progress, setProgress] = React.useState(0);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const status = controlledStatus ?? internalStatus;
    const preview = controlledPreview ?? internalPreview;

    React.useEffect(() => {
        if (defaultImage) {
            setInternalPreview(defaultImage);
            onImageLoad?.(defaultImage);
        }
    }, [defaultImage, onImageLoad]);

    const simulateUpload = React.useCallback(
        (file: File) => {
            setInternalStatus('uploading');
            setProgress(0);
            onUploadStart?.(file);

            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setInternalStatus('success');
                        onUploadSuccess?.(file);

                        return 100;
                    }

                    const newProgress = prev + 10;
                    onUploadProgress?.(newProgress);

                    return newProgress;
                });
            }, 100);
        },
        [onUploadStart, onUploadProgress, onUploadSuccess],
    );

    const handleFile = React.useCallback(
        async (file: File) => {
            setErrorMessage('');
            setInternalStatus('idle');

            if (onFileValidate) {
                const isValid = await onFileValidate(file);

                if (!isValid) {
                    setInternalStatus('error');
                    setErrorMessage('File validation failed');
                    onUploadError?.('File validation failed', file);

                    return;
                }
            }

            if (!file.type.startsWith('image/')) {
                setInternalStatus('error');
                setErrorMessage('File must be an image');
                onUploadError?.('File must be an image', file);

                return;
            }

            if (file.size > maxSize) {
                setInternalStatus('error');
                setErrorMessage(
                    `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
                );
                onUploadError?.(
                    `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
                    file,
                );

                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;

                if (!controlledPreview) {
                    setInternalPreview(result);
                }

                onFileSelect?.(file);
                simulateUpload(file);
            };
            reader.readAsDataURL(file);
        },
        [
            maxSize,
            onFileSelect,
            onFileValidate,
            onUploadError,
            simulateUpload,
            controlledPreview,
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
        [handleFile, setIsDragOver],
    );

    const handleRemove = React.useCallback(() => {
        const imageToDelete = preview;

        if (imageToDelete && imageToDelete !== defaultImage) {
            onDelete?.(imageToDelete);
            onDeleteSuccess?.(imageToDelete);
        } else if (imageToDelete === defaultImage) {
            onDelete?.(imageToDelete);
        }

        if (!controlledPreview) {
            setInternalPreview(null);
        }

        if (!controlledStatus) {
            setInternalStatus('idle');
        }

        setProgress(0);
        setErrorMessage('');
        onReset?.();

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [
        preview,
        defaultImage,
        controlledPreview,
        controlledStatus,
        onDelete,
        onDeleteSuccess,
        onReset,
    ]);

    const avatarSize = getAvatarSize(variant, size);
    const roundnessClass = roundnessMap[roundness];

    const UploadIcon = iconsConfig.upload;
    const CameraIcon = iconsConfig.camera;
    const RemoveIcon = iconsConfig.remove;
    const CheckIcon = iconsConfig.check;
    const AlertIcon = iconsConfig.alert;
    const FallbackIcon = iconsConfig.fallback;

    const currentProgress = controlledProgress ?? progress;
    const effectiveRoundness =
        variant === 'square' ? roundnessClass : 'rounded-full';

    const renderBadge = (customClassName?: string) => {
        if (status === 'success' && showStatusBadge) {
            return (
                <div
                    className={cn(
                        'absolute flex items-center justify-center rounded-full bg-primary p-1',
                        badgePositionMap[badgePos],
                        customClassName,
                    )}
                    style={{
                        width: avatarSize * 0.25,
                        height: avatarSize * 0.25,
                    }}
                >
                    <CheckIcon
                        className="text-primary-foreground"
                        style={{
                            width: avatarSize * 0.15,
                            height: avatarSize * 0.15,
                        }}
                    />
                </div>
            );
        }

        if (status === 'error' && showStatusBadge) {
            return (
                <div
                    className={cn(
                        'absolute flex items-center justify-center rounded-full bg-destructive p-1',
                        badgePositionMap[badgePos],
                        customClassName,
                    )}
                    style={{
                        width: avatarSize * 0.25,
                        height: avatarSize * 0.25,
                    }}
                >
                    <AlertIcon
                        className="text-destructive-foreground"
                        style={{
                            width: avatarSize * 0.15,
                            height: avatarSize * 0.15,
                        }}
                    />
                </div>
            );
        }

        return null;
    };

    const renderSpinner = (customClassName?: string) => {
        if (status === 'uploading' && showSpinner) {
            return (
                <div
                    className={cn(
                        'absolute inset-0 flex items-center justify-center bg-black/50',
                        customClassName,
                    )}
                >
                    <Spinner className="text-white" />
                </div>
            );
        }

        return null;
    };

    const renderRemoveButton = (customClassName?: string) => {
        if (showRemoveButton && preview) {
            return (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                    }}
                    className={cn(
                        'absolute flex items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity hover:opacity-100',
                        badgePositionMap[badgePos],
                        customClassName,
                    )}
                    style={{
                        width: avatarSize * 0.22,
                        height: avatarSize * 0.22,
                    }}
                >
                    <RemoveIcon
                        style={{
                            width: avatarSize * 0.12,
                            height: avatarSize * 0.12,
                        }}
                    />
                </button>
            );
        }

        return null;
    };

    const renderInput = () => (
        <input
            ref={inputRef}
            type="file"
            accept={accept}
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
                if (e.target.files?.[0]) {
                    handleFile(e.target.files[0]);
                }
            }}
        />
    );

    const commonContainerProps = {
        role: 'button' as const,
        tabIndex: 0 as const,
        'aria-label': ariaLabel ?? 'Upload avatar',
        'aria-describedby': ariaDescription,
        onClick: () => !disabled && inputRef.current?.click(),
        onKeyDown: (e: React.KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                e.preventDefault();
                inputRef.current?.click();
            }
        },
        onDrop: disabled ? undefined : handleDrop,
        onDragOver: disabled
            ? undefined
            : (e: React.DragEvent) => {
                  e.preventDefault();
                  setIsDragOver(true);
              },
        onDragLeave: disabled
            ? undefined
            : (e: React.DragEvent) => {
                  e.preventDefault();
                  setIsDragOver(false);
              },
    };

    const renderSquareVariant = () => (
        <div className={cn('flex flex-col items-center gap-3', className)}>
            <div
                {...commonContainerProps}
                className={cn(
                    'relative size-32 overflow-hidden border-2 border-dashed border-border transition-all',
                    effectiveRoundness,
                    disabled && 'cursor-not-allowed opacity-50',
                    isDragOver
                        ? 'scale-[1.02] border-primary bg-primary/5'
                        : status === 'error'
                          ? 'border-destructive'
                          : status === 'success'
                            ? 'border-primary'
                            : 'hover:border-primary/50',
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
                        <FallbackIcon
                            className="text-muted-foreground/50"
                            style={{
                                width: avatarSize * 0.4,
                                height: avatarSize * 0.4,
                            }}
                        />
                        {fallbackText && (
                            <span className="text-xs text-muted-foreground">
                                {fallbackText}
                            </span>
                        )}
                    </div>
                )}

                {!preview && isDragOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <UploadIcon
                            className="text-primary"
                            style={{
                                width: avatarSize * 0.3,
                                height: avatarSize * 0.3,
                            }}
                        />
                    </div>
                )}

                {renderSpinner()}
                {renderBadge('top-2 right-2')}
            </div>
            {renderInput()}
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
                                <RemoveIcon className="mr-1.5 size-3.5" />
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
                        <UploadIcon className="mr-1.5 size-3.5" />
                        Select Image
                    </Button>
                )}
            </div>
        </div>
    );

    const renderMinimalVariant = () => (
        <div
            className={cn('relative inline-block', className)}
            onMouseEnter={() => !disabled && setIsDragOver(true)}
            onMouseLeave={() => !disabled && setIsDragOver(false)}
        >
            <div
                className={cn(
                    'relative overflow-hidden border-2 border-border bg-muted transition-all',
                    effectiveRoundness,
                    isDragOver && 'scale-110 border-primary',
                    imageClassName,
                )}
                style={{
                    width: avatarSize,
                    height: avatarSize,
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
                        <FallbackIcon
                            className="text-muted-foreground"
                            style={{
                                width: avatarSize * 0.4,
                                height: avatarSize * 0.4,
                            }}
                        />
                    </div>
                )}

                <div
                    className={cn(
                        'absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity',
                        isDragOver ? 'opacity-100' : 'group-hover:opacity-100',
                    )}
                    onClick={() => !disabled && inputRef.current?.click()}
                >
                    <CameraIcon
                        className="text-white"
                        style={{
                            width: avatarSize * 0.35,
                            height: avatarSize * 0.35,
                        }}
                    />
                </div>

                {renderSpinner()}
                {renderBadge()}
                {renderRemoveButton()}
            </div>
            {renderInput()}
        </div>
    );

    const renderBadgeVariant = () => (
        <div
            className="relative inline-block"
            {...(variant !== 'card' &&
                variant !== 'inline' &&
                variant !== 'field' &&
                variant !== 'ghost' && {
                    onDrop: handleDrop,
                    onDragOver: (e: React.DragEvent) => {
                        e.preventDefault();
                        setIsDragOver(true);
                    },
                    onDragLeave: (e: React.DragEvent) => {
                        e.preventDefault();
                        setIsDragOver(false);
                    },
                })}
        >
            <div
                {...commonContainerProps}
                className={cn(
                    'relative overflow-hidden border-2 border-border bg-muted transition-all',
                    effectiveRoundness,
                    isDragOver && 'ring-2 ring-primary ring-offset-2',
                    imageClassName,
                )}
                style={{ width: avatarSize, height: avatarSize }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <FallbackIcon
                            className="text-muted-foreground"
                            style={{
                                width: avatarSize * 0.4,
                                height: avatarSize * 0.4,
                            }}
                        />
                    </div>
                )}

                {!preview && (
                    <div
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
                        onClick={() => inputRef.current?.click()}
                    >
                        <CameraIcon
                            className="text-white"
                            style={{
                                width: avatarSize * 0.3,
                                height: avatarSize * 0.3,
                            }}
                        />
                    </div>
                )}

                {renderSpinner()}
                {renderBadge()}
            </div>
            {renderInput()}
        </div>
    );

    const renderCardVariant = () => (
        <div className={cn('flex items-center gap-4', className)}>
            <div
                {...commonContainerProps}
                className={cn(
                    'relative shrink-0 overflow-hidden ring-2 ring-offset-2 transition-all',
                    effectiveRoundness,
                    isDragOver
                        ? 'scale-105 ring-primary'
                        : 'ring-transparent hover:ring-muted-foreground/30',
                    imageClassName,
                )}
                style={{
                    width: avatarSize,
                    height: avatarSize,
                }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <FallbackIcon
                            className="text-muted-foreground"
                            style={{
                                width: avatarSize * 0.4,
                                height: avatarSize * 0.4,
                            }}
                        />
                    </div>
                )}
                {renderSpinner()}
            </div>
            {renderInput()}
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
                        <Progress
                            value={currentProgress}
                            className="h-2 flex-1"
                        />
                        <span className="text-xs text-muted-foreground">
                            {Math.round(currentProgress)}%
                        </span>
                    </div>
                )}
                {status === 'success' && (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                            <CheckIcon className="size-3" /> Done
                        </Badge>
                        {showRemoveButton && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemove}
                                className="text-destructive hover:text-destructive"
                            >
                                <RemoveIcon className="size-4" />
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
                {...commonContainerProps}
                className={cn(
                    'relative shrink-0 overflow-hidden border border-border bg-muted transition-all',
                    effectiveRoundness,
                    imageClassName,
                )}
                style={{
                    width: avatarSize,
                    height: avatarSize,
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
                        <FallbackIcon
                            className="text-muted-foreground"
                            style={{
                                width: avatarSize * 0.4,
                                height: avatarSize * 0.4,
                            }}
                        />
                    </div>
                )}
                {renderSpinner()}
                {renderRemoveButton()}
            </div>
            {renderInput()}
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
            {...commonContainerProps}
            className={cn(
                'flex items-center gap-4 border p-4 transition-colors',
                roundnessClass,
                isDragOver && 'border-primary bg-muted/50',
                className,
            )}
        >
            <div
                className={cn(
                    'relative flex shrink-0 items-center justify-center overflow-hidden bg-muted',
                    effectiveRoundness,
                    imageClassName,
                )}
                style={{
                    width: avatarSize,
                    height: avatarSize,
                }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : fallbackText ? (
                    <span className="text-lg font-medium text-muted-foreground">
                        {fallbackText}
                    </span>
                ) : (
                    <FallbackIcon
                        className="text-muted-foreground"
                        style={{
                            width: avatarSize * 0.4,
                            height: avatarSize * 0.4,
                        }}
                    />
                )}
                {renderSpinner()}
            </div>
            {renderInput()}
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
                        <UploadIcon className="mr-1.5 size-3.5" />
                        Upload
                    </Button>
                )}
            </div>
        </div>
    );

    const renderOutlinedVariant = () => (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <div
                {...commonContainerProps}
                className={cn(
                    'relative flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/50 bg-muted/30 transition-all',
                    effectiveRoundness,
                    isDragOver
                        ? 'scale-105 border-primary'
                        : status === 'error'
                          ? 'border-destructive'
                          : status === 'success'
                            ? 'border-primary'
                            : '',
                    imageClassName,
                )}
                style={{
                    width: avatarSize,
                    height: avatarSize,
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
                        <UploadIcon
                            className="text-muted-foreground"
                            style={{
                                width: avatarSize * 0.25,
                                height: avatarSize * 0.25,
                            }}
                        />
                        <span className="text-xs text-muted-foreground">
                            Upload
                        </span>
                    </div>
                )}

                {renderBadge()}
            </div>
            {renderInput()}
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
            onMouseEnter={() => !disabled && setIsDragOver(true)}
            onMouseLeave={() => !disabled && setIsDragOver(false)}
        >
            <div
                className={cn(
                    'relative overflow-hidden bg-muted transition-all',
                    effectiveRoundness,
                    isDragOver
                        ? 'ring-2 ring-primary'
                        : 'ring-2 ring-transparent',
                    imageClassName,
                )}
                style={{
                    width: avatarSize,
                    height: avatarSize,
                }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <FallbackIcon
                            className="text-muted-foreground"
                            style={{
                                width: avatarSize * 0.4,
                                height: avatarSize * 0.4,
                            }}
                        />
                    </div>
                )}

                <div
                    className={cn(
                        'absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 transition-opacity',
                        isDragOver ? 'opacity-100' : 'opacity-0',
                    )}
                    onClick={() => !disabled && inputRef.current?.click()}
                >
                    <CameraIcon
                        className="text-white"
                        style={{
                            width: avatarSize * 0.35,
                            height: avatarSize * 0.35,
                        }}
                    />
                </div>

                {renderSpinner()}
                {showRemoveButton && preview && isDragOver && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove();
                        }}
                        className={cn(
                            'absolute flex items-center justify-center rounded-full bg-destructive text-destructive-foreground',
                            badgePositionMap[badgePos],
                        )}
                        style={{
                            width: avatarSize * 0.22,
                            height: avatarSize * 0.22,
                        }}
                    >
                        <RemoveIcon
                            style={{
                                width: avatarSize * 0.12,
                                height: avatarSize * 0.12,
                            }}
                        />
                    </button>
                )}
            </div>
            {renderInput()}
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
