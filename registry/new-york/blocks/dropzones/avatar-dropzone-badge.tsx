"use client"

import { User, Camera, Check, AlertCircle, Loader2 } from "lucide-react"
import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface AvatarDropzoneBadgeProps {
  className?: string
  onFileSelect?: (file: File | null) => void
  maxSize?: number
  defaultImage?: string
  size?: "sm" | "md" | "lg"
}

type Status = "idle" | "uploading" | "success" | "error"

const sizeMap = {
  sm: { avatar: "size-12", icon: "size-4", badge: "size-4" },
  md: { avatar: "size-20", icon: "size-6", badge: "size-6" },
  lg: { avatar: "size-28", icon: "size-8", badge: "size-8" },
}

export function AvatarDropzoneBadge({
  className,
  onFileSelect,
  maxSize = 5,
  defaultImage,
  size = "md",
}: AvatarDropzoneBadgeProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(defaultImage || null)
  const [status, setStatus] = React.useState<Status>("idle")
  const [progress, setProgress] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const sizes = sizeMap[size]

  const simulateUpload = React.useCallback(() => {
    setStatus("uploading")
    setProgress(0)
    setError(null)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStatus("success")

          return 100
        }

        return prev + 15
      })
    }, 120)
  }, [])

  const handleFile = React.useCallback(
    (file: File) => {
      setError(null)

      if (!file.type.startsWith("image/")) {
        setError("Invalid file type")
        setStatus("error")

        return
      }

      if (file.size > maxSize * 1024 * 1024) {
        setError(`Max size is ${maxSize}MB`)
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

      if (file) {
handleFile(file)
}
    },
    [handleFile]
  )

  const statusBadge = () => {
    if (status === "uploading") {
      return (
        <Badge className={cn(sizes.badge, "rounded-full p-0 bg-primary")}>
          <Loader2 className="size-3 animate-spin text-primary-foreground" />
        </Badge>
      )
    }

    if (status === "success") {
      return (
        <Badge className={cn(sizes.badge, "rounded-full p-0 bg-success")}>
          <Check className="size-3 text-success-foreground" />
        </Badge>
      )
    }

    if (status === "error") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={cn(sizes.badge, "rounded-full p-0 bg-destructive cursor-help")}>
              <AlertCircle className="size-3 text-white" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{error || "Upload failed"}</TooltipContent>
        </Tooltip>
      )
    }

    return null
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload avatar"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => {
 e.preventDefault(); setIsDragOver(true)
}}
            onDragLeave={(e) => {
 e.preventDefault(); setIsDragOver(false)
}}
            className={cn(
              "group relative cursor-pointer rounded-full transition-all",
              isDragOver && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            <Avatar className={cn(sizes.avatar, "border-2 border-border transition-all group-hover:border-primary")}>
              {preview ? (
                <AvatarImage src={preview} alt="Avatar" className="object-cover" />
              ) : (
                <AvatarFallback className="bg-muted">
                  <User className={cn(sizes.icon, "text-muted-foreground")} />
                </AvatarFallback>
              )}
            </Avatar>

            {/* Camera overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5 text-background" />
            </div>

            {/* Status badge */}
            <div className="absolute -bottom-1 -right-1">
              {statusBadge()}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>Click to upload photo</TooltipContent>
      </Tooltip>

      {status === "uploading" && (
        <Progress value={progress} className="h-1 w-20" />
      )}

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
