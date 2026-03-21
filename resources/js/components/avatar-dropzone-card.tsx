"use client"

import { User, Upload, Trash2, CheckCircle2 } from "lucide-react"
import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface AvatarDropzoneCardProps {
  className?: string
  onFileSelect?: (file: File | null) => void
  maxSize?: number
  defaultImage?: string
}

type Status = "idle" | "uploading" | "success" | "error"

export function AvatarDropzoneCard({
  className,
  onFileSelect,
  maxSize = 5,
  defaultImage,
}: AvatarDropzoneCardProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(defaultImage || null)
  const [status, setStatus] = React.useState<Status>("idle")
  const [progress, setProgress] = React.useState(0)
  const [fileName, setFileName] = React.useState<string | null>(null)
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

        return prev + 12
      })
    }, 100)
  }, [])

  const handleFile = React.useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/") || file.size > maxSize * 1024 * 1024) {
        setStatus("error")

        return
      }

      setFileName(file.name)
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

  const handleRemove = () => {
    setPreview(null)
    setStatus("idle")
    setProgress(0)
    setFileName(null)
    onFileSelect?.(null)
  }

  return (
    <Card className={cn("w-full max-w-xs", className)}>
      <CardContent className="flex items-center gap-4 p-4">
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
            "shrink-0 cursor-pointer rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
            isDragOver ? "ring-primary scale-105" : "ring-transparent hover:ring-muted-foreground/30"
          )}
        >
          <Avatar className="size-16">
            {preview ? (
              <AvatarImage src={preview} alt="Avatar" className="object-cover" />
            ) : (
              <AvatarFallback className="bg-muted">
                <User className="size-6 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {status === "idle" && !preview && (
            <>
              <p className="text-sm font-medium">Profile Photo</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                className="w-fit"
              >
                <Upload className="mr-1.5 size-3.5" />
                Upload
              </Button>
            </>
          )}

          {status === "uploading" && (
            <>
              <p className="truncate text-sm font-medium">{fileName}</p>
              <Progress value={progress} className="h-1.5" />
              <span className="text-xs text-muted-foreground">{progress}% uploaded</span>
            </>
          )}

          {status === "success" && preview && (
            <>
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <Badge variant="secondary" className="shrink-0 gap-1 text-success">
                  <CheckCircle2 className="size-3" />
                  Done
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="w-fit text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1.5 size-3.5" />
                Remove
              </Button>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="sr-only"
        />
      </CardContent>
    </Card>
  )
}
