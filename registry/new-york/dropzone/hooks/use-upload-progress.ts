'use client';

import { useCallback, useRef } from 'react';

export interface UseUploadProgressOptions {
    onComplete?: (id: string) => void;
    onProgress?: (id: string, progress: number) => void;
    intervalMs?: number;
    incrementMax?: number;
    incrementMin?: number;
}

export function useUploadProgress(options: UseUploadProgressOptions = {}) {
    const {
        onComplete,
        onProgress,
        intervalMs = 150,
        incrementMax = 20,
        incrementMin = 10,
    } = options;

    const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
        new Map(),
    );

    const clearUploadInterval = useCallback((id: string) => {
        const interval = intervalsRef.current.get(id);

        if (interval) {
            clearInterval(interval);
            intervalsRef.current.delete(id);
        }
    }, []);

    const simulateUpload = useCallback(
        (
            id: string,
            setProgress?: (updater: (prev: number) => number) => void,
        ) => {
            const interval = setInterval(() => {
                setProgress?.((prev) => {
                    const nextProgress =
                        prev + Math.random() * incrementMax + incrementMin;

                    if (nextProgress >= 100) {
                        clearUploadInterval(id);
                        onComplete?.(id);

                        return 100;
                    }

                    onProgress?.(id, nextProgress);

                    return nextProgress;
                });
            }, intervalMs);

            intervalsRef.current.set(id, interval);
        },
        [
            clearUploadInterval,
            incrementMax,
            incrementMin,
            intervalMs,
            onComplete,
            onProgress,
        ],
    );

    const cancelUpload = useCallback(
        (id: string) => {
            clearUploadInterval(id);
        },
        [clearUploadInterval],
    );

    const cancelAll = useCallback(() => {
        intervalsRef.current.forEach((interval) => {
            clearInterval(interval);
        });
        intervalsRef.current.clear();
    }, []);

    return {
        simulateUpload,
        cancelUpload,
        cancelAll,
    };
}
