'use client';

import { useCallback } from 'react';

import type { SortableItem, DragEndEvent } from './types';

interface SortableSource {
    initialIndex: number;
    index: number;
}

function isSortable(source: unknown): source is SortableSource {
    if (typeof source !== 'object' || source === null) {
        return false;
    }

    const obj = source as Record<string, unknown>;

    return (
        typeof obj.initialIndex === 'number' && typeof obj.index === 'number'
    );
}

export interface UseSortableFilesOptions<T extends SortableItem> {
    items: T[];
    onReorder?: (items: T[]) => void;
    onReorderFiles?: (files: File[]) => void;
    getFile?: (item: T) => File;
}

export interface UseSortableFilesReturn<T extends SortableItem> {
    items: T[];
    handleDragEnd: (event: DragEndEvent) => void;
    isSortableSource: (source: unknown) => boolean;
    setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

export function useSortableFiles<T extends SortableItem>(
    options: UseSortableFilesOptions<T>,
): UseSortableFilesReturn<T> {
    const { items, onReorder, onReorderFiles, getFile } = options;

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            if (event.canceled) {
                return;
            }

            const { source } = event.operation;

            if (isSortable(source)) {
                const { initialIndex, index } = source;

                if (initialIndex !== index) {
                    onReorder?.(items);

                    const newItems = [...items];
                    const [removed] = newItems.splice(initialIndex, 1);
                    newItems.splice(index, 0, removed);

                    onReorder?.(newItems);

                    if (onReorderFiles && getFile) {
                        const reorderedFiles = newItems.map(getFile);
                        onReorderFiles(reorderedFiles);
                    }
                }
            }
        },
        [getFile, items, onReorder, onReorderFiles],
    );

    const isSortableSource = useCallback((source: unknown): boolean => {
        return isSortable(source);
    }, []);

    const setItems = useCallback(
        (updater: T[] | ((prev: T[]) => T[])) => {
            const newItems =
                typeof updater === 'function'
                    ? (updater as (prev: T[]) => T[])(items)
                    : updater;

            onReorder?.(newItems);
        },
        [items, onReorder],
    );

    return {
        items,
        handleDragEnd,
        isSortableSource,
        setItems,
    };
}
