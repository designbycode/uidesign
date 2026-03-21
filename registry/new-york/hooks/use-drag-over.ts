'use client';

import { useState, useCallback, useRef } from 'react';

export interface UseDragOverOptions {
    onDragEnter?: () => void;
    onDragLeave?: () => void;
    onDrop?: (files: FileList) => void;
}

export function useDragOver({
    onDragEnter,
    onDragLeave,
    onDrop,
}: UseDragOverOptions = {}) {
    const [isDragOver, setIsDragOver] = useState(false);
    const dragCounter = useRef(0);
    const isDraggingRef = useRef(false);

    const handleDragEnter = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current++;

            if (dragCounter.current === 1) {
                isDraggingRef.current = true;
                setIsDragOver(true);
                onDragEnter?.();
            }
        },
        [onDragEnter],
    );

    const handleDragLeave = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current--;

            if (dragCounter.current === 0) {
                isDraggingRef.current = false;
                setIsDragOver(false);
                onDragLeave?.();
            }
        },
        [onDragLeave],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current = 0;
            isDraggingRef.current = false;
            setIsDragOver(false);

            if (e.dataTransfer.files.length > 0) {
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
