"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Pencil, X } from "lucide-react"

interface AvatarDropzoneInlineProps {
  className?: string
  onFileSelect?: (file: File | null) => void
  maxSize?: number
  defaultImage?: string
  label?: string
  description?: string
}

export function AvatarDropzoneInline({
  className,
  onFileSelect,
  maxSize = 5,
  defaultImage,
  label = "Profile picture",
  description = "JPG, PNG or GIF. Max 5MB.",
}: AvatarDropzoneInlineProps) {
  const [preview, setPreview] = React.useState<string | null>(defaultImage || null)
  const [isUploading, setIsUploading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/") || file.size > maxSize * 1024 * 1024) return

      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        setTimeout(() => {
          setPreview(e.target?.result as string)
          setIsUploading(false)
          onFileSelect?.(file)
        }, 800)
      }
      reader.readAsDataURL(file)
    },
    [maxSize, onFileSelect]
  )

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative">
        {isUploading ? (
          <Skeleton className="size-14 rounded-full" />
        ) : (
          <Avatar className="size-14 border border-border">
            {preview ? (
              <AvatarImage src={preview} alt="Avatar" className="object-cover" />
            ) : (
              <AvatarFallback className="bg-muted">
                <User className="size-6 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>
        )}

        {preview && !isUploading && (
          <button
            type="button"
            onClick={() => {
              setPreview(null)
              onFileSelect?.(null)
            }}
            className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
            aria-label="Remove photo"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-1 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="h-7 text-xs"
          >
            <Pencil className="mr-1 size-3" />
            {preview ? "Change" : "Upload"}
          </Button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="sr-only"
      />
    </div>
  )
}
