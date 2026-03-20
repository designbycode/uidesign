"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, Check, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AvatarDropzoneOutlinedProps {
  onFileSelect?: (file: File | null) => void
  maxSize?: number
  className?: string
}

export function AvatarDropzoneOutlined({
  onFileSelect,
  maxSize = 5 * 1024 * 1024,
  className,
}: AvatarDropzoneOutlinedProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file")
        setStatus("error")
        return
      }

      if (file.size > maxSize) {
        setError(`File must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
        setStatus("error")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        setStatus("uploading")

        setTimeout(() => {
          setStatus("success")
          onFileSelect?.(file)
        }, 1500)
      }
      reader.readAsDataURL(file)
    },
    [maxSize, onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleRemove = () => {
    setPreview(null)
    setStatus("idle")
    setError(null)
    onFileSelect?.(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "relative size-28 rounded-full border-2 border-dashed transition-all duration-200",
          isDragging && "border-primary bg-primary/5 scale-105",
          status === "error" && "border-destructive",
          status === "success" && "border-primary",
          !preview && status === "idle" && "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 cursor-pointer opacity-0 rounded-full"
          aria-label="Upload avatar image"
        />

        {preview ? (
          <img
            src={preview}
            alt="Avatar preview"
            className="size-full rounded-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Upload className="size-6 mb-1" />
            <span className="text-xs">Upload</span>
          </div>
        )}

        {status === "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}

        {status === "success" && preview && (
          <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
            <Check className="size-4" />
          </div>
        )}

        {status === "error" && (
          <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-destructive text-white">
            <AlertCircle className="size-4" />
          </div>
        )}
      </div>

      {preview && status !== "uploading" && (
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-muted-foreground">
          <X className="size-4 mr-1" />
          Remove
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
