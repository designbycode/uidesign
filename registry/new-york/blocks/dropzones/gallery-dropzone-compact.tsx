"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ImageIcon, Plus, X, Check, AlertCircle } from "lucide-react"

interface ImageFile {
  id: string
  file: File
  preview: string
  progress: number
  status: "uploading" | "success" | "error"
}

interface GalleryDropzoneCompactProps {
  className?: string
  onFilesChange?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
}

export function GalleryDropzoneCompact({
  className,
  onFilesChange,
  maxFiles = 6,
  maxSize = 10,
}: GalleryDropzoneCompactProps) {
  const [images, setImages] = React.useState<ImageFile[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  const simulateUpload = React.useCallback((imageId: string) => {
    const interval = setInterval(() => {
      setImages((prev) =>
        prev.map((img) => {
          if (img.id !== imageId) return img
          if (img.progress >= 100) {
            clearInterval(interval)
            return { ...img, progress: 100, status: "success" }
          }
          return { ...img, progress: img.progress + 20 }
        })
      )
    }, 100)
  }, [])

  const processFiles = React.useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remainingSlots = maxFiles - images.length
      const filesToProcess = fileArray.slice(0, remainingSlots)

      const newImages: ImageFile[] = filesToProcess.map((file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        if (!file.type.startsWith("image/") || file.size > maxSize * 1024 * 1024) {
          return { id, file, preview: "", progress: 0, status: "error" as const }
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          setImages((prev) =>
            prev.map((img) => (img.id === id ? { ...img, preview: e.target?.result as string } : img))
          )
        }
        reader.readAsDataURL(file)

        return { id, file, preview: "", progress: 0, status: "uploading" as const }
      })

      setImages((prev) => [...prev, ...newImages])
      newImages.forEach((img) => {
        if (img.status !== "error") setTimeout(() => simulateUpload(img.id), 50)
      })

      onFilesChange?.([...images, ...newImages].filter((i) => i.status !== "error").map((i) => i.file))
    },
    [images, maxFiles, maxSize, onFilesChange, simulateUpload]
  )

  const handleRemove = React.useCallback((id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id)
      onFilesChange?.(updated.filter((i) => i.status !== "error").map((i) => i.file))
      return updated
    })
  }, [onFilesChange])

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {images.map((image) => (
        <Tooltip key={image.id}>
          <TooltipTrigger asChild>
            <div className="group relative size-14 overflow-hidden rounded-md border bg-muted">
              {image.preview ? (
                <img src={image.preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="size-5 text-muted-foreground" />
                </div>
              )}

              {/* Progress overlay */}
              {image.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Progress value={Math.min(image.progress, 100)} className="h-1 w-10" />
                </div>
              )}

              {/* Status icons */}
              {image.status === "success" && (
                <div className="absolute bottom-0.5 right-0.5 rounded-full bg-success p-0.5">
                  <Check className="size-2.5 text-success-foreground" />
                </div>
              )}
              {image.status === "error" && (
                <div className="absolute bottom-0.5 right-0.5 rounded-full bg-destructive p-0.5">
                  <AlertCircle className="size-2.5 text-white" />
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove"
              >
                <X className="size-2.5" />
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">{image.file.name}</TooltipContent>
        </Tooltip>
      ))}

      {images.length < maxFiles && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="size-14 border-dashed"
        >
          <Plus className="size-5 text-muted-foreground" />
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        className="sr-only"
      />
    </div>
  )
}
