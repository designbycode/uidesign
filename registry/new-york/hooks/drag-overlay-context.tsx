'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

interface DragOverlayContextValue {
    isGloballyDragging: boolean;
    isDragActive: boolean;
    isOverDropzone: boolean;
    setIsOverDropzone: (value: boolean) => void;
}

const DragOverlayContext = createContext<DragOverlayContextValue>({
    isGloballyDragging: false,
    isDragActive: false,
    isOverDropzone: false,
    setIsOverDropzone: () => {},
});

export function useDragOverlayContext() {
    return useContext(DragOverlayContext);
}

interface DragOverlayProviderProps {
    children: React.ReactNode;
}

export function DragOverlayProvider({ children }: DragOverlayProviderProps) {
    const [isGloballyDragging, setIsGloballyDragging] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isOverDropzone, setIsOverDropzone] = useState(false);
    const dragCounterRef = useRef(0);

    const handleDragEnter = useCallback((e: DragEvent) => {
        if (e.dataTransfer?.types.includes('Files')) {
            e.preventDefault();
            dragCounterRef.current++;

            if (dragCounterRef.current === 1) {
                setIsGloballyDragging(true);
                setIsDragActive(true);
            }
        }
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        if (e.dataTransfer?.types.includes('Files')) {
            e.preventDefault();
            dragCounterRef.current--;

            if (dragCounterRef.current === 0) {
                setIsGloballyDragging(false);
                setIsDragActive(false);
            }
        }
    }, []);

    const handleDrop = useCallback((e: DragEvent) => {
        if (e.dataTransfer?.types.includes('Files')) {
            e.preventDefault();
        }

        dragCounterRef.current = 0;
        setIsGloballyDragging(false);
        setIsDragActive(false);
        setIsOverDropzone(false);
    }, []);

    const handleDragEnd = useCallback(() => {
        dragCounterRef.current = 0;
        setIsGloballyDragging(false);
        setIsDragActive(false);
        setIsOverDropzone(false);
    }, []);

    const handleDragOver = useCallback((e: DragEvent) => {
        if (e.dataTransfer?.types.includes('Files')) {
            e.preventDefault();
        }
    }, []);

    useEffect(() => {
        document.addEventListener('dragenter', handleDragEnter);
        document.addEventListener('dragleave', handleDragLeave);
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);
        document.addEventListener('dragend', handleDragEnd);

        return () => {
            document.removeEventListener('dragenter', handleDragEnter);
            document.removeEventListener('dragleave', handleDragLeave);
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('drop', handleDrop);
            document.removeEventListener('dragend', handleDragEnd);
        };
    }, [
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleDragEnd,
    ]);

    const value: DragOverlayContextValue = {
        isGloballyDragging,
        isDragActive,
        isOverDropzone,
        setIsOverDropzone,
    };

    return (
        <DragOverlayContext.Provider value={value}>
            {children}
        </DragOverlayContext.Provider>
    );
}
