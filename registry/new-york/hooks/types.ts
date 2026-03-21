'use client';

export interface FileWithPreview {
    file: File;
    preview: string;
    id: string;
}

export interface ImageFile {
    id: string;
    file: File;
    preview: string;
    status: 'ready' | 'uploading' | 'success' | 'error';
    progress?: number;
    error?: string;
}

export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error';

export interface UploadProgress {
    id: string;
    progress: number;
}

export interface DragOverState {
    isDragOver: boolean;
    dragProps: {
        onDragEnter: (e: React.DragEvent) => void;
        onDragLeave: (e: React.DragEvent) => void;
        onDrop: (e: React.DragEvent) => void;
        onDragOver: (e: React.DragEvent) => void;
    };
}

export interface SortableItem {
    id: string;
}

export interface DragEndEvent {
    canceled: boolean;
    operation: {
        source: unknown;
    };
}
