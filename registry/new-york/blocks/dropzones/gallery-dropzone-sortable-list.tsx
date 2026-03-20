"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageIcon, Upload, X, GripVertical, Check, AlertCircle } from "lucide-react"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable, isSortable } from "@dnd-kit/react/sortable"

interface ImageFile {
  id: string
  file: File
  preview: string
  status: "ready" | "uploading" | "success" | "error"
}

interface SortableListItemProps {
  image: ImageFile
  index: number
  onRemove: (id: string) => void
  showHandle?: boolean
}

function SortableListItem({ image, index, onRemove, showHandle }: SortableListItemProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: image.id,
    index,
  })

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 rounded-md p-2 transition-all",
        isDragging && "z-10 bg-muted shadow-md ring-1 ring-border"
      )}
    >
      {showHandle && (
        <button
          ref={handleRef}
          className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
      )}

      <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted">
        {image.preview ? (
          <img src={image.preview} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-4 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{image.file.name}</span>
        <span className="text-xs text-muted-foreground">
          {formatSize(image.file.size)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {image.status === "success" && (
          <Badge variant="secondary" className="gap-1 text-success">
            <Check className="size-3" />
            Done
          </Badge>
        )}
        {image.status === "error" && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="size-3" />
            Error
          </Badge>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(image.id)}
          className="size-8 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}

interface GalleryDropzoneSortableListProps {
  className?: string
  onFilesChange?: (files: File[]) => void
  onReorder?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  enableReorder?: boolean
}

export function GalleryDropzoneSortableList({
  className,
  onFilesChange,
  onReorder,
  maxFiles = 10,
  maxSize = 10,
  enableReorder = true,
}: GalleryDropzoneSortableListProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [images, setImages] = React.useState<ImageFile[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  const processFiles = React.useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remainingSlots = maxFiles - images.length
      const filesToProcess = fileArray.slice(0, remainingSlots)

      const newImages: ImageFile[] = filesToProcess
        .filter(
          (file) =>
            file.type.startsWith("image/") &&
            file.size <= maxSize * 1024 * 1024
        )
        .map((file) => {
          const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const preview = URL.createObjectURL(file)
          return { id, file, preview, status: "ready" as const }
        })

      const updated = [...images, ...newImages]
      setImages(updated)
      onFilesChange?.(updated.map((i) => i.file))
    },
    [images, maxFiles, maxSize, onFilesChange]
  )

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      processFiles(e.dataTransfer.files)
    },
    [processFiles]
  )

  const handleRemove = React.useCallback(
    (id: string) => {
      setImages((prev) => {
        const updated = prev.filter((img) => img.id !== id)
        onFilesChange?.(updated.map((i) => i.file))
        return updated
      })
    },
    [onFilesChange]
  )

  const handleDragEnd = React.useCallback(
    (event: { canceled: boolean; operation: { source: unknown } }) => {
      if (event.canceled) return

      const { source } = event.operation

      if (isSortable(source)) {
        const { initialIndex, index } = source

        if (initialIndex !== index) {
          setImages((prev) => {
            const newImages = [...prev]
            const [removed] = newImages.splice(initialIndex, 1)
            newImages.splice(index, 0, removed)
            onReorder?.(newImages.map((f) => f.file))
            return newImages
          })
        }
      }
    },
    [onReorder]
  )

  const listContent = (
    <div className="space-y-1">
      {images.map((image, idx) => (
        <React.Fragment key={image.id}>
          <SortableListItem
            image={image}
            index={idx}
            onRemove={handleRemove}
            showHandle={enableReorder}
          />
          {idx < images.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  )

  return (
    <div
      className={cn("flex flex-col gap-4 rounded-lg border p-4", className)}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
        }
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragOver(false)
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-6 transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted hover:border-muted-foreground/50"
        )}
      >
        <div className="rounded-full bg-muted p-3">
          <Upload className="size-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} files, {maxSize}MB each
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        className="sr-only"
      />

      {images.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {images.length} file{images.length > 1 ? "s" : ""}
              {enableReorder && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (drag to reorder)
                </span>
              )}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setImages([])
                onFilesChange?.([])
              }}
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
            >
              Clear all
            </Button>
          </div>

          <ScrollArea className="max-h-[280px]">
            {enableReorder ? (
              <DragDropProvider onDragEnd={handleDragEnd}>
                {listContent}
              </DragDropProvider>
            ) : (
              listContent
            )}
          </ScrollArea>
        </>
      )}
    </div>
  )
}
