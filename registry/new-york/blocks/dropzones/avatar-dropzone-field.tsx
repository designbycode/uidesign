"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, Trash2, RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AvatarDropzoneFieldProps {
  label?: string
  description?: string
  onFileSelect?: (file: File | null) => void
  defaultImage?: string
  initials?: string
  maxSize?: number
  className?: string
}

export function AvatarDropzoneField({
  label = "Profile photo",
  description = "JPG, PNG or GIF. Max 5MB.",
  onFileSelect,
  defaultImage,
  initials = "U",
  maxSize = 5 * 1024 * 1024,
  className,
}: AvatarDropzoneFieldProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/") || file.size > maxSize) return

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        setIsUploading(true)

        setTimeout(() => {
          setIsUploading(false)
          onFileSelect?.(file)
        }, 1000)
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

  const handleRemove = () => {
    setPreview(defaultImage || null)
    onFileSelect?.(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      <div
        className={cn(
          "flex items-center gap-4 rounded-lg border p-4 transition-colors",
          isDragging && "border-primary bg-muted/50"
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
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
          className="sr-only"
        />

        <Avatar className="size-16">
          <AvatarImage src={preview || undefined} alt="Avatar" />
          <AvatarFallback className="bg-muted text-muted-foreground text-xl">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col gap-1">
          {description && <p className="text-sm text-muted-foreground">{description}</p>}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : preview ? (
                <>
                  <RefreshCw className="size-4 mr-2" />
                  Change
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Upload
                </>
              )}
            </Button>

            {preview && !isUploading && (
              <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                <Trash2 className="size-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
