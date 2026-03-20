"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileWithPreview {
  file: File
  preview: string
  id: string
}

interface GalleryDropzoneSimpleProps {
  onFilesSelect?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  className?: string
}

export function GalleryDropzoneSimple({
  onFilesSelect,
  maxFiles = 6,
  maxSize = 10 * 1024 * 1024,
  className,
}: GalleryDropzoneSimpleProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (newFiles: FileList) => {
      const validFiles = Array.from(newFiles)
        .filter((file) => file.type.startsWith("image/") && file.size <= maxSize)
        .slice(0, maxFiles - files.length)

      const newFileObjects = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).slice(2),
      }))

      const updated = [...files, ...newFileObjects].slice(0, maxFiles)
      setFiles(updated)
      onFilesSelect?.(updated.map((f) => f.file))
    },
    [files, maxFiles, maxSize, onFilesSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id)
    setFiles(updated)
    onFilesSelect?.(updated.map((f) => f.file))
  }

  const clearAll = () => {
    setFiles([])
    onFilesSelect?.([])
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging ? "border-primary bg-muted/50" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload images"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="sr-only"
        />

        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Upload className="size-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Drop images here or click to upload</p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF up to {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {files.length} of {maxFiles} images
            </p>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
              Clear all
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {files.map((file) => (
              <div key={file.id} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
                <img src={file.preview} alt="" className="size-full object-cover" />
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/80 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}

            {files.length < maxFiles && (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
              >
                <ImageIcon className="size-5" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
