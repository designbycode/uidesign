'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseGlobalDragOptions {
    onDragEnter?: () => void;
    onDragLeave?: () => void;
    onDrop?: (files: FileList) => void;
}

export interface UseGlobalDragReturn {
    isDragging: boolean;
    isDragOver: boolean;
    dragProps: {
        onDragEnter: (e: React.DragEvent) => void;
        onDragLeave: (e: React.DragEvent) => void;
        onDragOver: (e: React.DragEvent) => void;
        onDrop: (e: React.DragEvent) => void;
    };
}

export function useGlobalDrag(
    options: UseGlobalDragOptions = {},
): UseGlobalDragReturn {
    const { onDragEnter, onDragLeave, onDrop } = options;
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const dragCounterRef = useRef(0);
    const isGlobalDraggingRef = useRef(false);

    useEffect(() => {
        const handleGlobalDragEnter = (e: DragEvent) => {
            if (e.dataTransfer?.types.includes('Files')) {
                e.preventDefault();
                isGlobalDraggingRef.current = true;
                setIsDragging(true);
            }
        };

        const handleGlobalDragLeave = (e: DragEvent) => {
            if (
                e.dataTransfer?.types.includes('Files') &&
                isGlobalDraggingRef.current
            ) {
                e.preventDefault();
            }
        };

        const handleGlobalDrop = (e: DragEvent) => {
            if (e.dataTransfer?.types.includes('Files')) {
                e.preventDefault();
                isGlobalDraggingRef.current = false;
                setIsDragging(false);
                setIsDragOver(false);
                dragCounterRef.current = 0;
            }
        };

        const handleGlobalDragEnd = () => {
            isGlobalDraggingRef.current = false;
            setIsDragging(false);
            setIsDragOver(false);
            dragCounterRef.current = 0;
        };

        document.addEventListener('dragenter', handleGlobalDragEnter);
        document.addEventListener('dragleave', handleGlobalDragLeave);
        document.addEventListener('drop', handleGlobalDrop);
        document.addEventListener('dragend', handleGlobalDragEnd);

        return () => {
            document.removeEventListener('dragenter', handleGlobalDragEnter);
            document.removeEventListener('dragleave', handleGlobalDragLeave);
            document.removeEventListener('drop', handleGlobalDrop);
            document.removeEventListener('dragend', handleGlobalDragEnd);
        };
    }, []);

    const handleDragEnter = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.dataTransfer?.types.includes('Files')) {
                dragCounterRef.current++;

                if (dragCounterRef.current === 1) {
                    setIsDragOver(true);
                    onDragEnter?.();
                }
            }
        },
        [onDragEnter],
    );

    const handleDragLeave = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.dataTransfer?.types.includes('Files')) {
                dragCounterRef.current--;

                if (dragCounterRef.current === 0) {
                    setIsDragOver(false);
                    onDragLeave?.();
                }
            }
        },
        [onDragLeave],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.dataTransfer?.types.includes('Files')) {
                dragCounterRef.current = 0;
                setIsDragOver(false);
                setIsDragging(false);
                onDrop?.(e.dataTransfer.files);
            }
        },
        [onDrop],
    );

    return {
        isDragging,
        isDragOver,
        dragProps: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
        },
    };
}
