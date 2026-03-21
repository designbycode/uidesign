"use client"

import { Camera, X, Loader2 } from "lucide-react"
import { useState, useCallback, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AvatarDropzoneGhostProps {
  onFileSelect?: (file: File | null) => void
  defaultImage?: string
  initials?: string
  maxSize?: number
  className?: string
}

export function AvatarDropzoneGhost({
  onFileSelect,
  defaultImage,
  initials = "?",
  maxSize = 5 * 1024 * 1024,
  className,
}: AvatarDropzoneGhostProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/") || file.size > maxSize) {
return
}

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        setIsUploading(true)

        setTimeout(() => {
          setIsUploading(false)
          onFileSelect?.(file)
        }, 1200)
      }
      reader.readAsDataURL(file)
    },
    [maxSize, onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsHovered(false)
      const file = e.dataTransfer.files[0]

      if (file) {
handleFile(file)
}
    },
    [handleFile]
  )

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(defaultImage || null)
    onFileSelect?.(null)

    if (inputRef.current) {
inputRef.current.value = ""
}
  }

  return (
    <div
      className={cn(
        "group relative cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => {
        e.preventDefault()
        setIsHovered(true)
      }}
      onDragLeave={() => setIsHovered(false)}
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
      aria-label="Upload avatar"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]

          if (file) {
handleFile(file)
}
        }}
        className="sr-only"
      />

      <Avatar className="size-24 ring-2 ring-transparent transition-all group-hover:ring-primary/20 group-focus-visible:ring-ring">
        <AvatarImage src={preview || undefined} alt="Avatar" />
        <AvatarFallback className="text-lg bg-muted">{initials}</AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity",
          isHovered || isUploading ? "opacity-100" : "opacity-0"
        )}
      >
        {isUploading ? (
          <Loader2 className="size-6 animate-spin text-white" />
        ) : (
          <Camera className="size-6 text-white" />
        )}
      </div>

      {preview && preview !== defaultImage && !isUploading && (
        <button
          onClick={handleRemove}
          className={cn(
            "absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm transition-all hover:bg-destructive hover:text-white",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          aria-label="Remove avatar"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}
