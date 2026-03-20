"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { User, Upload, RotateCcw, Check, X } from "lucide-react"

interface AvatarDropzoneSquareProps {
  className?: string
  onFileSelect?: (file: File | null) => void
  maxSize?: number
  defaultImage?: string
}

type Status = "idle" | "uploading" | "success" | "error"

export function AvatarDropzoneSquare({
  className,
  onFileSelect,
  maxSize = 5,
  defaultImage,
}: AvatarDropzoneSquareProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(defaultImage || null)
  const [status, setStatus] = React.useState<Status>("idle")
  const [progress, setProgress] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const simulateUpload = React.useCallback(() => {
    setStatus("uploading")
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStatus("success")
          return 100
        }
        return prev + 10
      })
    }, 100)
  }, [])

  const handleFile = React.useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/") || file.size > maxSize * 1024 * 1024) {
        setStatus("error")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        simulateUpload()
        onFileSelect?.(file)
      }
      reader.readAsDataURL(file)
    },
    [maxSize, onFileSelect, simulateUpload]
  )

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleRemove = () => {
    setPreview(null)
    setStatus("idle")
    setProgress(0)
    onFileSelect?.(null)
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload avatar"
        onClick={() => status !== "success" && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && status !== "success" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false) }}
        className={cn(
          "relative size-32 overflow-hidden rounded-lg border-2 transition-all",
          status !== "success" && "cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : status === "error"
            ? "border-destructive"
            : status === "success"
            ? "border-success"
            : "border-dashed border-border hover:border-primary/50"
        )}
      >
        {preview ? (
          <img src={preview} alt="Avatar preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30">
            <User className="size-10 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        )}

        {/* Upload overlay */}
        {!preview && isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
            <Upload className="size-8 text-primary" />
          </div>
        )}

        {/* Progress overlay */}
        {status === "uploading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
            <div className="mb-2 text-lg font-bold text-foreground">{Math.round(progress)}%</div>
            <Progress value={progress} className="h-1.5 w-24" />
          </div>
        )}

        {/* Success badge */}
        {status === "success" && (
          <Badge className="absolute right-2 top-2 gap-1 bg-success text-success-foreground">
            <Check className="size-3" />
            Uploaded
          </Badge>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="sr-only"
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        {status === "success" ? (
          <>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <RotateCcw className="mr-1.5 size-3.5" />
              Replace
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRemove} className="text-destructive hover:text-destructive">
              <X className="mr-1.5 size-3.5" />
              Remove
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-1.5 size-3.5" />
            Select Image
          </Button>
        )}
      </div>
    </div>
  )
}
