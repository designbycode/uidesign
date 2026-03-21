'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseDragOverOptions {
    onDragEnter?: () => void;
    onDragLeave?: () => void;
    onDrop?: (files: FileList) => void;
}

export interface UseDragOverReturn {
    isDragOver: boolean;
    dragProps: {
        onDragEnter: (e: React.DragEvent) => void;
        onDragLeave: (e: React.DragEvent) => void;
        onDrop: (e: React.DragEvent) => void;
        onDragOver: (e: React.DragEvent) => void;
    };
}

export function useDragOver({
    onDragEnter,
    onDragLeave,
    onDrop,
}: UseDragOverOptions = {}): UseDragOverReturn {
    const [isDragOver, setIsDragOver] = useState(false);
    const dragCounter = useRef(0);

    const handleDragEnter = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.dataTransfer?.types.includes('Files')) {
                dragCounter.current++;

                if (dragCounter.current === 1) {
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
                dragCounter.current--;

                if (dragCounter.current === 0) {
                    setIsDragOver(false);
                    onDragLeave?.();
                }
            }
        },
        [onDragLeave],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            dragCounter.current = 0;
            setIsDragOver(false);

            if (
                e.dataTransfer?.types.includes('Files') &&
                e.dataTransfer.files.length > 0
            ) {
                onDrop?.(e.dataTransfer.files);
            }
        },
        [onDrop],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return {
        isDragOver,
        dragProps: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
            onDragOver: handleDragOver,
        },
    };
}
